const mongoose = require("mongoose");

const familyMemberSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },

        relation: {
            type: String,
            required: true,
            trim: true,
        },

        phone: {
            type: String,
            trim: true,
        },

        email: {
            type: String,
            trim: true,
            lowercase: true,
        },

        bloodGroup: {
            type: String,
            trim: true,
        },

        location: {
            latitude: {
                type: Number,
            },

            longitude: {
                type: Number,
            },

            address: {
                type: String,
                trim: true,
            },
        },

        isSafe: {
            type: Boolean,
            default: false,
        },

        lastKnownLocation: {
            latitude: Number,
            longitude: Number,
            updatedAt: {
                type: Date,
            },
        },
    },
    {
        _id: true,
        timestamps: true,
    }
);

const familySchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true,
        },

        members: {
            type: [familyMemberSchema],
            default: [],
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Family", familySchema);