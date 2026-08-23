const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { operationsOnly } = require("../middleware/adminMiddleware");

const {
  createShelter,
  getShelters,
  getShelterById,
  updateShelter,
  deleteShelter,
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
  protect,
  operationsOnly,
  createShelter
);

router.get("/", getShelters);

router.get("/:id", getShelterById);

router.put("/:id", protect, operationsOnly, updateShelter);

router.delete("/:id", protect, operationsOnly, deleteShelter);

module.exports = router;