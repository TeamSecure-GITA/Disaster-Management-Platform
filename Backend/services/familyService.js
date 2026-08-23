const Family = require("../models/Family");

const notFound = (message) => {
    const error = new Error(message);
    error.statusCode = 404;
    return error;
};

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
    const family = await Family.findOneAndUpdate(
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
    if (!family) throw notFound("Family member not found");
    return family;
};

const deleteFamilyMember = async (userId, memberId) => {
    const family = await Family.findOneAndUpdate(
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
    if (!family) throw notFound("Family member not found");
    return family;
};

const updateSafetyStatus = async (
    userId,
    memberId,
    isSafe
) => {
    if (typeof isSafe !== "boolean") {
        const error = new Error("isSafe must be a boolean");
        error.statusCode = 400;
        throw error;
    }

    const family = await Family.findOneAndUpdate(
        {
            user: userId,
            "members._id": memberId,
        },
        {
            $set: {
                "members.$.isSafe": isSafe,
            },
        },
        {
            new: true,
        }
    );
    if (!family) throw notFound("Family member not found");
    return family;
};

module.exports = {
    getFamilyByUser,
    createOrUpdateFamily,
    addFamilyMember,
    updateFamilyMember,
    deleteFamilyMember,
    updateSafetyStatus,
};