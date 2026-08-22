const express = require("express");

const {
    createRescueId,
    getRescueId,
    getRescueIdByCode,
    updateRescueId,
    deactivateRescueId,
} = require("../controllers/rescueIdController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", authMiddleware, createRescueId);

router.get("/", authMiddleware, getRescueId);

router.get("/verify/:rescueId", getRescueIdByCode);

router.put("/", authMiddleware, updateRescueId);

router.patch(
    "/deactivate",
    authMiddleware,
    deactivateRescueId
);

module.exports = router;