const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { operationsOnly } = require("../middleware/adminMiddleware");

const {
  createResource,
  getResources,
  getResourceById,
  updateResource,
  deleteResource,
} = require("../controllers/resourceController");

const {
  createResourceValidator,
} = require("../validators/resourceValidator");

const {
  validate: validationMiddleware,
} = require("../middleware/validationMiddleware");

const router = express.Router();

router.post(
  "/",
  createResourceValidator,
  validationMiddleware,
  protect,
  operationsOnly,
  createResource
);

router.get("/", getResources);

router.get("/:id", getResourceById);

router.put("/:id", protect, operationsOnly, updateResource);

router.delete("/:id", protect, operationsOnly, deleteResource);

module.exports = router;