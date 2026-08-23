const { getIO } = require("./socket");

const emitNewSOS = (sos) => {
  try { getIO().to("operations").emit("newSOS", sos); } catch (error) { return false; }
  return true;
};

const emitSOSUpdated = (sos) => {
  try { getIO().to("operations").emit("sosUpdated", sos); } catch (error) { return false; }
  return true;
};

const emitSOSResolved = (sosId) => {
  try { getIO().to("operations").emit("sosResolved", { sosId }); } catch (error) { return false; }
  return true;
};

module.exports = {
  emitNewSOS,
  emitSOSUpdated,
  emitSOSResolved,
};