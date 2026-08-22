const Family = require("../models/Family");

const getFamilyByUser = async (userId) => {
    return await Family.findOne({
        user: userId,
    });
};

const createOrUpdateFamily = async (userId, members) => {
    return await Family.findOneAndUpdate(
        { user: userId },
        {
            user: userId,
            members,
        },
        {
            new: true,
            upsert: true,
            runValidators: true,
        }
    );
};

const addFamilyMember = async (userId, memberData) => {
    return await Family.findOneAndUpdate(
        { user: userId },
        {
            $push: {
                members: memberData,
            },
        },
        {
            new: true,
            upsert: true,
            runValidators: true,
        }
    );
};

const updateFamilyMember = async (
    userId,
    memberId,
    memberData
) => {
    return await Family.findOneAndUpdate(
        {
            user: userId,
            "members._id": memberId,
        },
        {
            $set: {
                "members.$": memberData,
            },
        },
        {
            new: true,
            runValidators: true,
        }
    );
};

const deleteFamilyMember = async (userId, memberId) => {
    return await Family.findOneAndUpdate(
        { user: userId },
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
};

const updateSafetyStatus = async (
    userId,
    memberId,
    isSafe
) => {
    return await Family.findOneAndUpdate(
        {
            user: userId,
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
};

module.exports = {
    getFamilyByUser,
    createOrUpdateFamily,
    addFamilyMember,
    updateFamilyMember,
    deleteFamilyMember,
    updateSafetyStatus,
};