const { getIO } = require("./socket");

const emitNewSOS = (sos) => {
  const io = getIO();

  io.emit("newSOS", sos);
};

const emitSOSUpdated = (sos) => {
  const io = getIO();

  io.emit("sosUpdated", sos);
};

const emitSOSResolved = (sosId) => {
  const io = getIO();

  io.emit("sosResolved", {
    sosId,
  });
};

module.exports = {
  emitNewSOS,
  emitSOSUpdated,
  emitSOSResolved,
};