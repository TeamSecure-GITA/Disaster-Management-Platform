const express = require("express");
const router = express.Router();
const {
  createReview,
  getAllReviews,
  deleteReview,
  markReviewRead,
  markAllReviewsRead,
} = require("../controllers/reviewController");

// Public endpoints to submit and retrieve reviews
router.route("/").get(getAllReviews).post(createReview);

// Administrator review management endpoints
router.patch("/read-all", markAllReviewsRead);
router.route("/:id/read").patch(markReviewRead);
router.route("/:id").delete(deleteReview);

module.exports = router;
