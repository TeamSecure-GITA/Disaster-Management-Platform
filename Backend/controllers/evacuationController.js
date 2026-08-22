const generateEvacuationPlan = async (req, res, next) => {
    try {
        const {
            currentLocation,
            destination,
            availableShelters = [],
            emergencyLevel = "moderate",
        } = req.body;

        if (!currentLocation) {
            return res.status(400).json({
                success: false,
                message: "Current location is required",
            });
        }

        if (!destination && availableShelters.length === 0) {
            return res.status(400).json({
                success: false,
                message:
                    "Destination or available shelters are required",
            });
        }

        const recommendedShelter =
            availableShelters.length > 0
                ? availableShelters[0]
                : destination;

        const plan = {
            emergencyLevel,

            startLocation: currentLocation,

            destination: recommendedShelter,

            steps: [
                {
                    step: 1,
                    instruction:
                        "Stay calm and collect essential emergency items.",
                },
                {
                    step: 2,
                    instruction:
                        "Follow official emergency instructions and avoid restricted areas.",
                },
                {
                    step: 3,
                    instruction:
                        "Move toward the recommended safe location using the safest available route.",
                },
                {
                    step: 4,
                    instruction:
                        "Stay away from damaged buildings, flooded roads, bridges and electrical hazards.",
                },
                {
                    step: 5,
                    instruction:
                        "Inform your family or emergency contact after reaching a safe location.",
                },
            ],

            safetyRecommendations: [
                "Carry identification and essential medicines.",
                "Keep your phone charged.",
                "Do not enter visibly damaged structures.",
                "Follow instructions from authorized emergency personnel.",
            ],

            generatedAt: new Date().toISOString(),
        };

        res.status(200).json({
            success: true,
            message: "Evacuation plan generated successfully",
            data: plan,
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    generateEvacuationPlan,
};