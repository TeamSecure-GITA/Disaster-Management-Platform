const { getIO } = require("./socket");

const emitNewSOS = (sos) => {
  const io = getIO();

  io.to("operations").emit("newSOS", sos);
};

const emitSOSUpdated = (sos) => {
  const io = getIO();

  io.to("operations").emit("sosUpdated", sos);
};

const emitSOSResolved = (sosId) => {
  const io = getIO();

  io.to("operations").emit("sosResolved", {
    sosId,
  });
};

module.exports = {
  emitNewSOS,
  emitSOSUpdated,
  emitSOSResolved,
};