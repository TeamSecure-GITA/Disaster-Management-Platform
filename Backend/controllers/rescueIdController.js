const crypto = require("crypto");
const RescueId = require("../models/RescueId");

const generateRescueId = () => {
    const randomPart = crypto
        .randomBytes(6)
        .toString("hex")
        .toUpperCase();

    return `RSC-${randomPart}`;
};

const createRescueId = async (req, res, next) => {
    try {
        const existing = await RescueId.findOne({
            user: req.user._id,
        });

        if (existing) {
            return res.status(200).json({
                success: true,
                message: "Rescue ID already exists",
                data: existing,
            });
        }

        const rescueId = await RescueId.create({
            user: req.user._id,
            rescueId: generateRescueId(),
            fullName:
                req.body.fullName ||
                req.user.name ||
                "Unknown User",
            phone: req.body.phone,
            bloodGroup: req.body.bloodGroup,
            emergencyContact: req.body.emergencyContact,
            medicalInformation: req.body.medicalInformation,
            address: req.body.address,
        });

        res.status(201).json({
            success: true,
            message: "Rescue ID created successfully",
            data: rescueId,
        });
    } catch (error) {
        next(error);
    }
};

const getRescueId = async (req, res, next) => {
    try {
        const rescueId = await RescueId.findOne({
            user: req.user._id,
        });

        if (!rescueId) {
            return res.status(404).json({
                success: false,
                message: "Rescue ID not found",
            });
        }

        res.status(200).json({
            success: true,
            data: rescueId,
        });
    } catch (error) {
        next(error);
    }
};

const getRescueIdByCode = async (req, res, next) => {
    try {
        const rescueId = await RescueId.findOne({
            rescueId: req.params.rescueId,
            isActive: true,
        }).populate("user", "name email phone");

        if (!rescueId) {
            return res.status(404).json({
                success: false,
                message: "Rescue ID not found or inactive",
            });
        }

        res.status(200).json({
            success: true,
            data: rescueId,
        });
    } catch (error) {
        next(error);
    }
};

const updateRescueId = async (req, res, next) => {
    try {
        const rescueId = await RescueId.findOneAndUpdate(
            {
                user: req.user._id,
            },
            {
                $set: req.body,
            },
            {
                new: true,
                runValidators: true,
            }
        );

        if (!rescueId) {
            return res.status(404).json({
                success: false,
                message: "Rescue ID not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Rescue ID updated successfully",
            data: rescueId,
        });
    } catch (error) {
        next(error);
    }
};

const deactivateRescueId = async (req, res, next) => {
    try {
        const rescueId = await RescueId.findOneAndUpdate(
            {
                user: req.user._id,
            },
            {
                isActive: false,
            },
            {
                new: true,
            }
        );

        if (!rescueId) {
            return res.status(404).json({
                success: false,
                message: "Rescue ID not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Rescue ID deactivated successfully",
            data: rescueId,
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createRescueId,
    getRescueId,
    getRescueIdByCode,
    updateRescueId,
    deactivateRescueId,
};