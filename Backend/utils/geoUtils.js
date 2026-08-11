const isValidLatitude = (latitude) => {
  return (
    typeof latitude === "number" &&
    Number.isFinite(latitude) &&
    latitude >= -90 &&
    latitude <= 90
  );
};

const isValidLongitude = (longitude) => {
  return (
    typeof longitude === "number" &&
    Number.isFinite(longitude) &&
    longitude >= -180 &&
    longitude <= 180
  );
};

const isValidCoordinates = (latitude, longitude) => {
  return (
    isValidLatitude(latitude) &&
    isValidLongitude(longitude)
  );
};

const normalizeCoordinates = (latitude, longitude) => {
  const lat = Number(latitude);
  const lng = Number(longitude);

  if (!isValidCoordinates(lat, lng)) {
    throw new Error("Invalid latitude or longitude");
  }

  return {
    latitude: lat,
    longitude: lng,
  };
};

const toGeoJSONPoint = (latitude, longitude) => {
  const coordinates = normalizeCoordinates(latitude, longitude);

  return {
    type: "Point",
    coordinates: [
      coordinates.longitude,
      coordinates.latitude,
    ],
  };
};

const fromGeoJSONPoint = (point) => {
  if (
    !point ||
    point.type !== "Point" ||
    !Array.isArray(point.coordinates) ||
    point.coordinates.length !== 2
  ) {
    throw new Error("Invalid GeoJSON Point");
  }

  const [longitude, latitude] = point.coordinates;

  if (!isValidCoordinates(latitude, longitude)) {
    throw new Error("Invalid GeoJSON coordinates");
  }

  return {
    latitude,
    longitude,
  };
};

const calculateBoundingBox = (
  latitude,
  longitude,
  radiusKm
) => {
  const lat = Number(latitude);
  const lng = Number(longitude);
  const radius = Number(radiusKm);

  if (!isValidCoordinates(lat, lng)) {
    throw new Error("Invalid coordinates");
  }

  if (!Number.isFinite(radius) || radius < 0) {
    throw new Error("Radius must be a positive number");
  }

  const earthRadiusKm = 6371;

  const latitudeDelta =
    (radius / earthRadiusKm) * (180 / Math.PI);

  const longitudeDelta =
    (radius /
      (earthRadiusKm *
        Math.cos((lat * Math.PI) / 180))) *
    (180 / Math.PI);

  return {
    minLatitude: lat - latitudeDelta,
    maxLatitude: lat + latitudeDelta,
    minLongitude: lng - longitudeDelta,
    maxLongitude: lng + longitudeDelta,
  };
};

const isPointInsideBoundingBox = (
  latitude,
  longitude,
  boundingBox
) => {
  if (!boundingBox) {
    return false;
  }

  return (
    latitude >= boundingBox.minLatitude &&
    latitude <= boundingBox.maxLatitude &&
    longitude >= boundingBox.minLongitude &&
    longitude <= boundingBox.maxLongitude
  );
};

module.exports = {
  isValidLatitude,
  isValidLongitude,
  isValidCoordinates,
  normalizeCoordinates,
  toGeoJSONPoint,
  fromGeoJSONPoint,
  calculateBoundingBox,
  isPointInsideBoundingBox,
};