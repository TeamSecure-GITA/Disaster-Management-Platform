const calculateDistance = require("../utils/distanceCalculator");

const getDistanceBetweenLocations = (
  latitude1,
  longitude1,
  latitude2,
  longitude2
) => {
  return calculateDistance(
    latitude1,
    longitude1,
    latitude2,
    longitude2
  );
};

module.exports = {
  getDistanceBetweenLocations,
};