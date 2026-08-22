const validateFamilyMember = (req, res, next) => {
    const {
        name,
        relation,
        phone,
        email,
    } = req.body;

    if (!name || !name.trim()) {
        return res.status(400).json({
            success: false,
            message: "Family member name is required",
        });
    }

    if (!relation || !relation.trim()) {
        return res.status(400).json({
            success: false,
            message: "Family member relation is required",
        });
    }

    if (phone && !/^[0-9+\-\s()]{7,20}$/.test(phone)) {
        return res.status(400).json({
            success: false,
            message: "Invalid phone number",
        });
    }

    if (
        email &&
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {
        return res.status(400).json({
            success: false,
            message: "Invalid email address",
        });
    }

    next();
};

const validateFamily = (req, res, next) => {
    const { members } = req.body;

    if (!Array.isArray(members)) {
        return res.status(400).json({
            success: false,
            message: "Members must be an array",
        });
    }

    for (const member of members) {
        if (!member.name || !member.name.trim()) {
            return res.status(400).json({
                success: false,
                message:
                    "Every family member must have a name",
            });
        }

        if (!member.relation || !member.relation.trim()) {
            return res.status(400).json({
                success: false,
                message:
                    "Every family member must have a relation",
            });
        }
    }

    next();
};

const validateSafetyStatus = (req, res, next) => {
    const { isSafe } = req.body;

    if (typeof isSafe !== "boolean") {
        return res.status(400).json({
            success: false,
            message: "isSafe must be a boolean",
        });
    }

    next();
};

module.exports = {
    validateFamilyMember,
    validateFamily,
    validateSafetyStatus,
};