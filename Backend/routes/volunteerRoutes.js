const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { operationsOnly } = require("../middleware/adminMiddleware");

const {
  createVolunteer,
  getVolunteers,
  getVolunteerById,
  updateVolunteer,
  deleteVolunteer,
} = require("../controllers/volunteerController");

const {
  createVolunteerValidator,
} = require("../validators/volunteerValidator");

const {
  validate: validationMiddleware,
} = require("../middleware/validationMiddleware");

const router = express.Router();

router.post(
  "/",
  createVolunteerValidator,
  validationMiddleware,
  protect,
  operationsOnly,
  createVolunteer
);

router.get("/", getVolunteers);

router.get("/:id", getVolunteerById);

router.put("/:id", protect, operationsOnly, updateVolunteer);

router.delete("/:id", protect, operationsOnly, deleteVolunteer);

module.exports = router;