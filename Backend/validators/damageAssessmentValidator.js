const validateDamageAssessment = (req, res, next) => {
    const {
        title,
        description,
        damageType,
        severity,
    } = req.body;

    if (!title || !title.trim()) {
        return res.status(400).json({
            success: false,
            message: "Damage assessment title is required",
        });
    }

    if (!description || !description.trim()) {
        return res.status(400).json({
            success: false,
            message:
                "Damage assessment description is required",
        });
    }

    const validDamageTypes = [
        "building",
        "road",
        "bridge",
        "electricity",
        "water",
        "communication",
        "agriculture",
        "vehicle",
        "other",
    ];

    if (!validDamageTypes.includes(damageType)) {
        return res.status(400).json({
            success: false,
            message: "Invalid damage type",
        });
    }

    const validSeverities = [
        "low",
        "moderate",
        "high",
        "critical",
    ];

    if (!validSeverities.includes(severity)) {
        return res.status(400).json({
            success: false,
            message: "Invalid damage severity",
        });
    }

    if (req.body.estimatedLoss !== undefined) {
        const estimatedLoss = Number(
            req.body.estimatedLoss
        );

        if (
            Number.isNaN(estimatedLoss) ||
            estimatedLoss < 0
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Estimated loss must be a non-negative number",
            });
        }
    }

    let location = req.body.location;

    if (typeof location === "string") {
        try {
            location = JSON.parse(location);
        } catch (error) {
            return res.status(400).json({
                success: false,
                message: "Invalid location format",
            });
        }
    }

    if (!location) {
        return res.status(400).json({
            success: false,
            message: "Location is required",
        });
    }

    const latitude = Number(location.latitude);
    const longitude = Number(location.longitude);

    if (
        Number.isNaN(latitude) ||
        latitude < -90 ||
        latitude > 90
    ) {
        return res.status(400).json({
            success: false,
            message: "Invalid latitude",
        });
    }

    if (
        Number.isNaN(longitude) ||
        longitude < -180 ||
        longitude > 180
    ) {
        return res.status(400).json({
            success: false,
            message: "Invalid longitude",
        });
    }

    next();
};

module.exports = {
    validateDamageAssessment,
};