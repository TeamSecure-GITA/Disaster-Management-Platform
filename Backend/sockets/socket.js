const socketIO = require("socket.io");
const corsOptions = require("../config/cors");
const User = require("../models/User");
const { verifyToken } = require("../utils/generateToken");

let io;

const initializeSocket = (server) => {
  io = socketIO(server, {
    cors: {
      origin: corsOptions.origin,
      methods: corsOptions.methods,
      credentials: corsOptions.credentials,
    },
  });

  io.use(async (socket, next) => {
    try {
      const handshakeToken = socket.handshake.auth?.token;
      const header = socket.handshake.headers.authorization;
      const token = handshakeToken || header?.replace(/^Bearer\s+/i, "");

      if (!token || token.startsWith("demo-") || token.startsWith("local-") || token === "guest") {
        socket.user = { _id: "guest", role: "guest" };
        return next();
      }

      const decoded = verifyToken(token);
      if (decoded.type && decoded.type !== "access") {
        // Fallback to guest rather than dropping emergency broadcast connection
        socket.user = { _id: "guest", role: "guest" };
        return next();
      }

      const user = await User.findById(decoded.id).select("-password");
      if (!user || user.isActive === false || user.status === "inactive") {
        socket.user = { _id: "guest", role: "guest" };
        return next();
      }

      socket.user = user;
      next();
    } catch (error) {
      // Allow connection as guest so users still receive life-saving disaster alerts
      socket.user = { _id: "guest", role: "guest" };
      next();
    }
  });

  io.on("connection", (socket) => {
    console.log(`Socket connected: ${socket.id} (user: ${socket.user?._id})`);
    socket.join("alerts");

    if (socket.user && socket.user._id && socket.user._id !== "guest") {
      const userRoom = `user:${socket.user._id}`;
      socket.join(userRoom);
    }

    if (["admin", "operator"].includes(socket.user?.role)) {
      socket.join("operations");
    }

    socket.on("joinRoom", (room, acknowledge) => {
      const allowedRoom = room === "alerts" ||
        (room === "operations" && ["admin", "operator"].includes(socket.user.role));

      if (!allowedRoom) {
        return acknowledge?.({ success: false, message: "Room access denied" });
      }

      socket.join(room);
      acknowledge?.({ success: true, room });
    });

    socket.on("joinUserRoom", (acknowledge) => {
      socket.join(userRoom);
      acknowledge?.({ success: true, room: userRoom });
    });

    socket.on("leaveRoom", (room, acknowledge) => {
      if (!["alerts", "operations"].includes(room)) {
        return acknowledge?.({ success: false, message: "Room access denied" });
      }

      if (room === "operations" && !["admin", "operator"].includes(socket.user.role)) {
        return acknowledge?.({ success: false, message: "Room access denied" });
      }

      socket.leave(room);
      acknowledge?.({ success: true, room });
    });

    socket.on("disconnect", () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error("Socket.IO has not been initialized");
  }

  return io;
};

module.exports = {
  initializeSocket,
  getIO,
};