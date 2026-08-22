const crypto = require("crypto");
const RescueId = require("../models/RescueId");

const generateRescueId = () => {
    const randomPart = crypto
        .randomBytes(6)
        .toString("hex")
        .toUpperCase();

    return `RSC-${randomPart}`;
};

const createRescueId = async (userId, data) => {
    const existing = await RescueId.findOne({
        user: userId,
    });

    if (existing) {
        return existing;
    }

    return await RescueId.create({
        user: userId,
        rescueId: generateRescueId(),
        ...data,
    });
};

const getRescueIdByUser = async (userId) => {
    return await RescueId.findOne({
        user: userId,
    });
};

const getRescueIdByCode = async (rescueId) => {
    return await RescueId.findOne({
        rescueId,
        isActive: true,
    }).populate("user", "name email phone");
};

const updateRescueId = async (userId, data) => {
    return await RescueId.findOneAndUpdate(
        {
            user: userId,
        },
        {
            $set: data,
        },
        {
            new: true,
            runValidators: true,
        }
    );
};

const deactivateRescueId = async (userId) => {
    return await RescueId.findOneAndUpdate(
        {
            user: userId,
        },
        {
            isActive: false,
        },
        {
            new: true,
        }
    );
};

module.exports = {
    generateRescueId,
    createRescueId,
    getRescueIdByUser,
    getRescueIdByCode,
    updateRescueId,
    deactivateRescueId,
};