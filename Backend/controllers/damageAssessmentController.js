const DamageAssessment = require("../models/DamageAssessment");

const createDamageAssessment = async (req, res, next) => {
    try {
        const assessmentData = {
            ...req.body,
            user: req.user._id,
        };

        if (req.files && req.files.length > 0) {
            assessmentData.images = req.files.map((file) => ({
                url: `/uploads/images/${file.filename}`,
                filename: file.filename,
            }));
        }

        if (
            assessmentData.location &&
            typeof assessmentData.location === "string"
        ) {
            try {
                assessmentData.location = JSON.parse(
                    assessmentData.location
                );
            } catch (error) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid location format",
                });
            }
        }

        const assessment = await DamageAssessment.create(
            assessmentData
        );

        res.status(201).json({
            success: true,
            message: "Damage assessment submitted successfully",
            data: assessment,
        });
    } catch (error) {
        next(error);
    }
};

const getDamageAssessments = async (req, res, next) => {
    try {
        const assessments = await DamageAssessment.find()
            .populate("user", "name email phone")
            .populate("disaster", "name type")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: assessments,
        });
    } catch (error) {
        next(error);
    }
};

const getMyDamageAssessments = async (req, res, next) => {
    try {
        const assessments = await DamageAssessment.find({
            user: req.user._id,
        }).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: assessments,
        });
    } catch (error) {
        next(error);
    }
};

const getDamageAssessmentById = async (req, res, next) => {
    try {
        const assessment = await DamageAssessment.findById(
            req.params.id
        )
            .populate("user", "name email phone")
            .populate("disaster", "name type");

        if (!assessment) {
            return res.status(404).json({
                success: false,
                message: "Damage assessment not found",
            });
        }

        res.status(200).json({
            success: true,
            data: assessment,
        });
    } catch (error) {
        next(error);
    }
};

const updateDamageAssessmentStatus = async (req, res, next) => {
    try {
        const { status, remarks } = req.body;

        const assessment =
            await DamageAssessment.findByIdAndUpdate(
                req.params.id,
                {
                    status,
                    remarks,
                    ...(status === "verified"
                        ? {
                              verifiedBy: req.user._id,
                              verifiedAt: new Date(),
                          }
                        : {}),
                },
                {
                    new: true,
                    runValidators: true,
                }
            );

        if (!assessment) {
            return res.status(404).json({
                success: false,
                message: "Damage assessment not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Damage assessment status updated successfully",
            data: assessment,
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createDamageAssessment,
    getDamageAssessments,
    getMyDamageAssessments,
    getDamageAssessmentById,
    updateDamageAssessmentStatus,
};