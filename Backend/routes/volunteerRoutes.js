const express = require("express");

const {
  createVolunteer,
  getVolunteers,
  getVolunteerById,
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
  createVolunteer
);

router.get("/", getVolunteers);

router.get("/:id", getVolunteerById);

module.exports = router;