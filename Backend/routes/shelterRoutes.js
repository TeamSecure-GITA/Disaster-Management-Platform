const express = require("express");

const {
  createShelter,
  getShelters,
  getShelterById,
} = require("../controllers/shelterController");

const {
  createShelterValidator,
} = require("../validators/shelterValidator");

const {
  validate: validationMiddleware,
} = require("../middleware/validationMiddleware");

const router = express.Router();

router.post(
  "/",
  createShelterValidator,
  validationMiddleware,
  createShelter
);

router.get("/", getShelters);

router.get("/:id", getShelterById);

module.exports = router;