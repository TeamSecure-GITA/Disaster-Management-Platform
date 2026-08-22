const DamageAssessment = require("../models/DamageAssessment");

const createDamageAssessment = async (
    userId,
    assessmentData
) => {
    return await DamageAssessment.create({
        ...assessmentData,
        user: userId,
    });
};

const getAllDamageAssessments = async (filters = {}) => {
    return await DamageAssessment.find(filters)
        .populate("user", "name email phone")
        .populate("disaster", "name type")
        .sort({ createdAt: -1 });
};

const getDamageAssessmentsByUser = async (userId) => {
    return await DamageAssessment.find({
        user: userId,
    }).sort({ createdAt: -1 });
};

const getDamageAssessmentById = async (id) => {
    return await DamageAssessment.findById(id)
        .populate("user", "name email phone")
        .populate("disaster", "name type");
};

const updateDamageAssessmentStatus = async (
    id,
    status,
    remarks,
    verifiedBy = null
) => {
    const updateData = {
        status,
        remarks,
    };

    if (status === "verified") {
        updateData.verifiedBy = verifiedBy;
        updateData.verifiedAt = new Date();
    }

    return await DamageAssessment.findByIdAndUpdate(
        id,
        updateData,
        {
            new: true,
            runValidators: true,
        }
    );
};

module.exports = {
    createDamageAssessment,
    getAllDamageAssessments,
    getDamageAssessmentsByUser,
    getDamageAssessmentById,
    updateDamageAssessmentStatus,
};