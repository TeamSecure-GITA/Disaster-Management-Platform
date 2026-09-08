const Family = require("../models/Family");

const getFamily = async (req, res, next) => {
    try {
        const family = await Family.findOne({
            user: req.user._id,
        });

        if (!family) {
            return res.status(200).json({
                success: true,
                data: {
                    user: req.user._id,
                    members: [],
                },
            });
        }

        res.status(200).json({
            success: true,
            data: family,
        });
    } catch (error) {
        next(error);
    }
};

const createOrUpdateFamily = async (req, res, next) => {
    try {
        const { members } = req.body;

        if (!Array.isArray(members)) {
            return res.status(400).json({
                success: false,
                message: "Members must be an array",
            });
        }

        const family = await Family.findOneAndUpdate(
            { user: req.user._id },
            {
                user: req.user._id,
                members,
            },
            {
                new: true,
                upsert: true,
                runValidators: true,
            }
        );

        res.status(200).json({
            success: true,
            message: "Family information updated successfully",
            data: family,
        });
    } catch (error) {
        next(error);
    }
};

const addFamilyMember = async (req, res, next) => {
    try {
        const family = await Family.findOneAndUpdate(
            { user: req.user._id },
            {
                $push: {
                    members: req.body,
                },
            },
            {
                new: true,
                upsert: true,
                runValidators: true,
                setDefaultsOnInsert: true,
            }
        );

        res.status(201).json({
            success: true,
            message: "Family member added successfully",
            data: family,
        });
    } catch (error) {
        next(error);
    }
};

const updateFamilyMember = async (req, res, next) => {
    try {
        const { memberId } = req.params;

        const family = await Family.findOneAndUpdate(
            {
                user: req.user._id,
                "members._id": memberId,
            },
            {
                $set: {
                    "members.$": req.body,
                },
            },
            {
                new: true,
                runValidators: true,
            }
        );

        if (!family) {
            return res.status(404).json({
                success: false,
                message: "Family member not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Family member updated successfully",
            data: family,
        });
    } catch (error) {
        next(error);
    }
};

const deleteFamilyMember = async (req, res, next) => {
    try {
        const { memberId } = req.params;

        const family = await Family.findOneAndUpdate(
            { user: req.user._id },
            {
                $pull: {
                    members: {
                        _id: memberId,
                    },
                },
            },
            {
                new: true,
            }
        );

        if (!family) {
            return res.status(404).json({
                success: false,
                message: "Family information not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Family member removed successfully",
            data: family,
        });
    } catch (error) {
        next(error);
    }
};

const updateMemberSafetyStatus = async (req, res, next) => {
    try {
        const { memberId } = req.params;
        const { isSafe } = req.body;

        const family = await Family.findOneAndUpdate(
            {
                user: req.user._id,
                "members._id": memberId,
            },
            {
                $set: {
                    "members.$.isSafe": Boolean(isSafe),
                },
            },
            {
                new: true,
            }
        );

        if (!family) {
            return res.status(404).json({
                success: false,
                message: "Family member not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Safety status updated successfully",
            data: family,
        });
    } catch (error) {
        next(error);
    }
};

// =========================================================================
// GLOBALLY SHARED FAMILY SAFETY NETWORK CONTROLLERS
// Changes made by ANY user persist permanently for ALL users
// =========================================================================

const SharedFamilyMember = require("../models/SharedFamilyMember");

const INITIAL_FALLBACK = [
    {
        id: "mem-1",
        name: "Prafulla Kumar Behera",
        relation: "Father",
        phone: "9861012345",
        bloodGroup: "O+",
        status: "Safe",
        isSafe: true,
        location: "Patia, Bhubaneswar",
        coordinates: "20.3522, 85.8193",
        createdAtMs: Date.now() - 20000,
        lastUpdated: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
    {
        id: "mem-2",
        name: "Santilata Behera",
        relation: "Mother",
        phone: "9437098765",
        bloodGroup: "B+",
        status: "Safe",
        isSafe: true,
        location: "Patia, Bhubaneswar",
        coordinates: "20.3522, 85.8193",
        createdAtMs: Date.now() - 10000,
        lastUpdated: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
];

const getSharedFamily = async (req, res, next) => {
    try {
        let members = await SharedFamilyMember.find().sort({ createdAtMs: -1 });

        // Auto-seed initial defaults on very first call if database is brand new
        if (members.length === 0) {
            const count = await SharedFamilyMember.countDocuments();
            if (count === 0) {
                await SharedFamilyMember.insertMany(INITIAL_FALLBACK);
                members = await SharedFamilyMember.find().sort({ createdAtMs: -1 });
            }
        }

        res.status(200).json({
            success: true,
            data: members,
        });
    } catch (error) {
        next(error);
    }
};

const addSharedFamilyMember = async (req, res, next) => {
    try {
        const data = req.body;
        const memberId = data.id || `mem-${Date.now()}`;
        const newMember = await SharedFamilyMember.findOneAndUpdate(
            { id: memberId },
            {
                ...data,
                id: memberId,
                createdAtMs: data.createdAtMs || Date.now(),
                lastUpdated: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            },
            { new: true, upsert: true, runValidators: true }
        );

        res.status(201).json({
            success: true,
            message: "Member added to global safety network permanently",
            data: newMember,
        });
    } catch (error) {
        next(error);
    }
};

const buildMemberFilter = (memberId) => {
    const mongoose = require("mongoose");
    return mongoose.Types.ObjectId.isValid(memberId)
        ? { $or: [{ id: String(memberId) }, { _id: memberId }] }
        : { id: String(memberId) };
};

const updateSharedFamilyMember = async (req, res, next) => {
    try {
        const { memberId } = req.params;
        const updates = req.body;

        const updated = await SharedFamilyMember.findOneAndUpdate(
            buildMemberFilter(memberId),
            {
                $set: {
                    ...updates,
                    lastUpdated: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                },
            },
            { new: true, runValidators: true }
        );

        if (!updated) {
            return res.status(404).json({
                success: false,
                message: "Family member not found in global safety network",
            });
        }

        res.status(200).json({
            success: true,
            message: "Family member modified permanently for every user",
            data: updated,
        });
    } catch (error) {
        next(error);
    }
};

const deleteSharedFamilyMember = async (req, res, next) => {
    try {
        const { memberId } = req.params;

        await SharedFamilyMember.findOneAndDelete(buildMemberFilter(memberId));

        res.status(200).json({
            success: true,
            message: "Family member removed permanently for every user",
        });
    } catch (error) {
        next(error);
    }
};

const updateSharedMemberSafety = async (req, res, next) => {
    try {
        const { memberId } = req.params;
        const { isSafe, status } = req.body;

        const updated = await SharedFamilyMember.findOneAndUpdate(
            buildMemberFilter(memberId),
            {
                $set: {
                    isSafe: Boolean(isSafe),
                    status: status || (isSafe ? "Safe" : "Needs Help"),
                    lastUpdated: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                },
            },
            { new: true }
        );

        res.status(200).json({
            success: true,
            message: "Safety status updated permanently for all users",
            data: updated,
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getFamily,
    createOrUpdateFamily,
    addFamilyMember,
    updateFamilyMember,
    deleteFamilyMember,
    updateMemberSafetyStatus,
    // Shared global controllers
    getSharedFamily,
    addSharedFamilyMember,
    updateSharedFamilyMember,
    deleteSharedFamilyMember,
    updateSharedMemberSafety,
};