const express = require("express");

const {
  createResource,
  getResources,
  getResourceById,
} = require("../controllers/resourceController");

const {
  createResourceValidator,
} = require("../validators/resourceValidator");

const validationMiddleware = require("../middleware/validationMiddleware");

const router = express.Router();

router.post(
  "/",
  createResourceValidator,
  validationMiddleware,
  createResource
);

router.get("/", getResources);

router.get("/:id", getResourceById);

module.exports = router;