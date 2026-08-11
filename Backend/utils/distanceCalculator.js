const EARTH_RADIUS_KM = 6371;

const toRadians = (degrees) => {
  return (degrees * Math.PI) / 180;
};

const calculateDistance = (
  latitude1,
  longitude1,
  latitude2,
  longitude2
) => {
  const lat1 = Number(latitude1);
  const lon1 = Number(longitude1);
  const lat2 = Number(latitude2);
  const lon2 = Number(longitude2);

  if (
    !Number.isFinite(lat1) ||
    !Number.isFinite(lon1) ||
    !Number.isFinite(lat2) ||
    !Number.isFinite(lon2)
  ) {
    throw new Error("Invalid coordinates");
  }

  const dLatitude = toRadians(lat2 - lat1);
  const dLongitude = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLatitude / 2) ** 2 +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLongitude / 2) ** 2;

  const c =
    2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return EARTH_RADIUS_KM * c;
};

const calculateDistanceMeters = (
  latitude1,
  longitude1,
  latitude2,
  longitude2
) => {
  return (
    calculateDistance(
      latitude1,
      longitude1,
      latitude2,
      longitude2
    ) * 1000
  );
};

const calculateDistanceMiles = (
  latitude1,
  longitude1,
  latitude2,
  longitude2
) => {
  return (
    calculateDistance(
      latitude1,
      longitude1,
      latitude2,
      longitude2
    ) * 0.621371
  );
};

const isWithinRadius = (
  latitude1,
  longitude1,
  latitude2,
  longitude2,
  radiusKm
) => {
  const distance = calculateDistance(
    latitude1,
    longitude1,
    latitude2,
    longitude2
  );

  return distance <= Number(radiusKm);
};

const findNearestLocation = (
  origin,
  locations
) => {
  if (
    !origin ||
    !Number.isFinite(Number(origin.latitude)) ||
    !Number.isFinite(Number(origin.longitude))
  ) {
    throw new Error("Invalid origin coordinates");
  }

  if (!Array.isArray(locations) || locations.length === 0) {
    return null;
  }

  let nearest = null;
  let shortestDistance = Infinity;

  for (const location of locations) {
    if (
      !location ||
      !Number.isFinite(Number(location.latitude)) ||
      !Number.isFinite(Number(location.longitude))
    ) {
      continue;
    }

    const distance = calculateDistance(
      origin.latitude,
      origin.longitude,
      location.latitude,
      location.longitude
    );

    if (distance < shortestDistance) {
      shortestDistance = distance;

      nearest = {
        ...location,
        distanceKm: distance,
      };
    }
  }

  return nearest;
};

module.exports = {
  EARTH_RADIUS_KM,
  toRadians,
  calculateDistance,
  calculateDistanceMeters,
  calculateDistanceMiles,
  isWithinRadius,
  findNearestLocation,
};