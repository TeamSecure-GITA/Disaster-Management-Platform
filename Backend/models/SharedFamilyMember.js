const mongoose = require("mongoose");

const sharedFamilyMemberSchema = new mongoose.Schema(
    {
        id: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        name: {
            type: String,
            required: true,
            trim: true,
        },
        relation: {
            type: String,
            default: "Family",
            trim: true,
        },
        phone: {
            type: String,
            default: "",
            trim: true,
        },
        bloodGroup: {
            type: String,
            default: "Unknown",
            trim: true,
        },
        status: {
            type: String,
            default: "Safe",
            enum: ["Safe", "Needs Help", "Unsafe"],
        },
        isSafe: {
            type: Boolean,
            default: true,
        },
        location: {
            type: String,
            default: "Registered Location",
            trim: true,
        },
        coordinates: {
            type: String,
            default: "",
            trim: true,
        },
        createdAtMs: {
            type: Number,
            default: () => Date.now(),
        },
        lastUpdated: {
            type: String,
            default: () => new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("SharedFamilyMember", sharedFamilyMemberSchema);
