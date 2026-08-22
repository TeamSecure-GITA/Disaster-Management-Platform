const express = require("express");

const {
    createDamageAssessment,
    getDamageAssessments,
    getMyDamageAssessments,
    getDamageAssessmentById,
    updateDamageAssessmentStatus,
} = require("../controllers/damageAssessmentController");

const {
    protect: authMiddleware,
} = require("../middleware/authMiddleware");
const uploadMiddleware = require("../middleware/uploadMiddleware");
const { uploadLimiter } = require("../middleware/rateLimitMiddleware");

const router = express.Router();

router.post(
    "/",
    authMiddleware,
    uploadLimiter,
    uploadMiddleware.array("images", 10),
    createDamageAssessment
);

router.get(
    "/",
    authMiddleware,
    getDamageAssessments
);

router.get(
    "/mine",
    authMiddleware,
    getMyDamageAssessments
);

router.get(
    "/:id",
    authMiddleware,
    getDamageAssessmentById
);

router.patch(
    "/:id/status",
    authMiddleware,
    updateDamageAssessmentStatus
);

module.exports = router;