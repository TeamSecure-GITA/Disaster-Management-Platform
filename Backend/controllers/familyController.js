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

module.exports = {
    getFamily,
    createOrUpdateFamily,
    addFamilyMember,
    updateFamilyMember,
    deleteFamilyMember,
    updateMemberSafetyStatus,
};