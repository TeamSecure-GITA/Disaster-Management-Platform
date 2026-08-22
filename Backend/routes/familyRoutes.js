const express = require("express");

const {
    getFamily,
    createOrUpdateFamily,
    addFamilyMember,
    updateFamilyMember,
    deleteFamilyMember,
    updateMemberSafetyStatus,
} = require("../controllers/familyController");

const {
    protect: authMiddleware,
} = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authMiddleware);

router.get("/", getFamily);

router.post("/", createOrUpdateFamily);

router.post("/members", addFamilyMember);

router.put("/members/:memberId", updateFamilyMember);

router.patch(
    "/members/:memberId/safety",
    updateMemberSafetyStatus
);

router.delete("/members/:memberId", deleteFamilyMember);

module.exports = router;