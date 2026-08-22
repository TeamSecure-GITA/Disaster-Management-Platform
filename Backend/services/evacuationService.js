const calculateDistance = (
    latitude1,
    longitude1,
    latitude2,
    longitude2
) => {
    const toRadians = (value) =>
        (value * Math.PI) / 180;

    const earthRadius = 6371;

    const latitudeDifference = toRadians(
        latitude2 - latitude1
    );

    const longitudeDifference = toRadians(
        longitude2 - longitude1
    );

    const a =
        Math.sin(latitudeDifference / 2) ** 2 +
        Math.cos(toRadians(latitude1)) *
            Math.cos(toRadians(latitude2)) *
            Math.sin(longitudeDifference / 2) ** 2;

    const c =
        2 *
        Math.atan2(
            Math.sqrt(a),
            Math.sqrt(1 - a)
        );

    return earthRadius * c;
};

const findNearestShelter = (
    currentLocation,
    shelters = []
) => {
    if (!shelters.length) {
        return null;
    }

    let nearestShelter = null;
    let shortestDistance = Infinity;

    for (const shelter of shelters) {
        if (
            shelter.latitude === undefined ||
            shelter.longitude === undefined
        ) {
            continue;
        }

        const distance = calculateDistance(
            currentLocation.latitude,
            currentLocation.longitude,
            shelter.latitude,
            shelter.longitude
        );

        if (distance < shortestDistance) {
            shortestDistance = distance;
            nearestShelter = {
                ...shelter,
                distanceKm: Number(
                    distance.toFixed(2)
                ),
            };
        }
    }

    return nearestShelter;
};

const generateEvacuationPlan = ({
    currentLocation,
    destination,
    availableShelters = [],
    emergencyLevel = "moderate",
}) => {
    const nearestShelter = findNearestShelter(
        currentLocation,
        availableShelters
    );

    const selectedDestination =
        nearestShelter || destination;

    if (!selectedDestination) {
        throw new Error(
            "No evacuation destination available"
        );
    }

    return {
        emergencyLevel,

        startLocation: currentLocation,

        destination: selectedDestination,

        routeType: nearestShelter
            ? "nearest_safe_shelter"
            : "specified_destination",

        steps: [
            {
                step: 1,
                instruction:
                    "Collect essential emergency items and identification.",
            },
            {
                step: 2,
                instruction:
                    "Follow official disaster-management instructions.",
            },
            {
                step: 3,
                instruction:
                    "Proceed toward the recommended safe location.",
            },
            {
                step: 4,
                instruction:
                    "Avoid flooded roads, damaged buildings, bridges and electrical hazards.",
            },
            {
                step: 5,
                instruction:
                    "Contact your family or emergency contact after reaching safety.",
            },
        ],

        safetyRecommendations: [
            "Keep your phone charged.",
            "Carry essential medicines.",
            "Carry drinking water if possible.",
            "Do not enter damaged structures.",
            "Follow authorized emergency personnel.",
        ],

        generatedAt: new Date().toISOString(),
    };
};

module.exports = {
    calculateDistance,
    findNearestShelter,
    generateEvacuationPlan,
};