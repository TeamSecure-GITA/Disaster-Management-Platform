const mongoose = require("mongoose");

const rescueIdSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true,
        },

        rescueId: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },

        fullName: {
            type: String,
            required: true,
            trim: true,
        },

        phone: {
            type: String,
            trim: true,
        },

        bloodGroup: {
            type: String,
            trim: true,
        },

        emergencyContact: {
            name: {
                type: String,
                trim: true,
            },

            phone: {
                type: String,
                trim: true,
            },

            relation: {
                type: String,
                trim: true,
            },
        },

        medicalInformation: {
            type: String,
            trim: true,
        },

        address: {
            type: String,
            trim: true,
        },

        qrCode: {
            type: String,
            default: null,
        },

        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("RescueId", rescueIdSchema);