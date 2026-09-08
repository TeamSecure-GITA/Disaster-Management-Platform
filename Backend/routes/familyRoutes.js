const express = require("express");

const {
    getFamily,
    createOrUpdateFamily,
    addFamilyMember,
    updateFamilyMember,
    deleteFamilyMember,
    updateMemberSafetyStatus,
    getSharedFamily,
    addSharedFamilyMember,
    updateSharedFamilyMember,
    deleteSharedFamilyMember,
    updateSharedMemberSafety,
} = require("../controllers/familyController");

const {
    protect: authMiddleware,
} = require("../middleware/authMiddleware");

const router = express.Router();

// ── Shared Multi-User Global Safety Network Endpoints ────────────────────────
// Accessible to every user so name modifications/adds/removes are permanent
router.get("/shared", getSharedFamily);
router.post("/shared", addSharedFamilyMember);
router.put("/shared/:memberId", updateSharedFamilyMember);
router.delete("/shared/:memberId", deleteSharedFamilyMember);
router.patch("/shared/:memberId/safety", updateSharedMemberSafety);

// ── Private User-Scoped Routes ───────────────────────────────────────────────
router.use(authMiddleware);

router.get("/", getFamily);
router.post("/", createOrUpdateFamily);
router.post("/members", addFamilyMember);
router.put("/members/:memberId", updateFamilyMember);
router.patch("/members/:memberId/safety", updateMemberSafetyStatus);
router.delete("/members/:memberId", deleteFamilyMember);

module.exports = router;