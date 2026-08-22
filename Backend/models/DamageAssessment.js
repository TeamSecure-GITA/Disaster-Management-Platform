const mongoose = require("mongoose");

const damageAssessmentSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        disaster: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Disaster",
            default: null,
        },

        title: {
            type: String,
            required: true,
            trim: true,
        },

        description: {
            type: String,
            required: true,
            trim: true,
        },

        damageType: {
            type: String,
            required: true,
            enum: [
                "building",
                "road",
                "bridge",
                "electricity",
                "water",
                "communication",
                "agriculture",
                "vehicle",
                "other",
            ],
        },

        severity: {
            type: String,
            required: true,
            enum: [
                "low",
                "moderate",
                "high",
                "critical",
            ],
            default: "moderate",
        },

        estimatedLoss: {
            type: Number,
            default: 0,
            min: 0,
        },

        location: {
            latitude: {
                type: Number,
                required: true,
            },

            longitude: {
                type: Number,
                required: true,
            },

            address: {
                type: String,
                trim: true,
            },
        },

        images: [
            {
                url: {
                    type: String,
                },

                filename: {
                    type: String,
                },

                provider: {
                    type: String,
                    enum: ["local", "cloudinary"],
                    default: "local",
                },

                publicId: {
                    type: String,
                    default: null,
                },

                resourceType: {
                    type: String,
                    default: null,
                },
            },
        ],

        status: {
            type: String,
            enum: [
                "submitted",
                "under_review",
                "verified",
                "rejected",
                "resolved",
            ],
            default: "submitted",
        },

        verifiedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },

        verifiedAt: {
            type: Date,
            default: null,
        },

        remarks: {
            type: String,
            trim: true,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model(
    "DamageAssessment",
    damageAssessmentSchema
);