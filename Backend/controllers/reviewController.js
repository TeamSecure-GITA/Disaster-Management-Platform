const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const Review = require("../models/Review");

const DATA_DIR = path.join(__dirname, "../data");
const BACKUP_FILE = path.join(DATA_DIR, "reviews.json");

// Ensure data directory and backup file exist
const ensureBackupFile = () => {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(BACKUP_FILE)) {
      fs.writeFileSync(BACKUP_FILE, JSON.stringify([], null, 2), "utf8");
    }
  } catch (err) {
    console.error("Error creating review backup file:", err.message);
  }
};

const readBackupReviews = () => {
  ensureBackupFile();
  try {
    const raw = fs.readFileSync(BACKUP_FILE, "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
};

const writeBackupReviews = (reviews) => {
  ensureBackupFile();
  try {
    fs.writeFileSync(BACKUP_FILE, JSON.stringify(reviews, null, 2), "utf8");
  } catch (err) {
    console.error("Error writing backup reviews:", err.message);
  }
};

/**
 * @desc Create and permanently save a new user review
 * @route POST /api/reviews
 * @access Public
 */
exports.createReview = async (req, res) => {
  try {
    const { name, email, rating, category, message, device } = req.body;

    if (!rating || Number(rating) < 1 || Number(rating) > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5 stars.",
      });
    }

    if (!message || message.trim().length < 5) {
      return res.status(400).json({
        success: false,
        message: "Review message must be at least 5 characters.",
      });
    }

    const reviewId = `REV-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const reviewData = {
      reviewId,
      name: (name || "Anonymous").trim(),
      email: (email || "").trim().toLowerCase(),
      rating: Number(rating),
      category: category || "General Feedback",
      message: message.trim(),
      submittedAt: new Date(),
      readByAdmin: false,
      ip: req.ip || req.connection?.remoteAddress || "",
      device: device || req.headers["user-agent"] || "Web Client",
    };

    let savedReview = null;

    // 1. Attempt database save if MongoDB connected
    if (mongoose.connection.readyState === 1) {
      try {
        savedReview = await Review.create(reviewData);
      } catch (dbErr) {
        console.warn("MongoDB review save warning:", dbErr.message);
      }
    }

    // 2. Always persist to permanent disk storage backup
    const backupList = readBackupReviews();
    const diskItem = savedReview ? savedReview.toObject() : reviewData;
    diskItem.id = reviewId;
    backupList.unshift(diskItem);
    writeBackupReviews(backupList);

    return res.status(201).json({
      success: true,
      message: "Review permanently saved until deleted by Administrator.",
      review: diskItem,
    });
  } catch (error) {
    console.error("Error creating review:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error saving review.",
      error: error.message,
    });
  }
};

/**
 * @desc Retrieve all saved reviews
 * @route GET /api/reviews
 * @access Public / Administrator
 */
exports.getAllReviews = async (req, res) => {
  try {
    let reviews = [];

    // 1. Try fetching from MongoDB first
    if (mongoose.connection.readyState === 1) {
      try {
        reviews = await Review.find().sort({ submittedAt: -1 }).lean();
      } catch (err) {
        console.warn("MongoDB review query error:", err.message);
      }
    }

    // 2. Fallback or merge with permanent disk backup
    const diskReviews = readBackupReviews();
    if (!reviews || reviews.length === 0) {
      reviews = diskReviews;
    } else {
      // Sync any disk items not in MongoDB
      const dbIds = new Set(reviews.map((r) => r.reviewId || r._id?.toString()));
      for (const diskItem of diskReviews) {
        if (!dbIds.has(diskItem.reviewId)) {
          reviews.push(diskItem);
        }
      }
    }

    // Sort newest first
    reviews.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));

    // Normalize IDs for frontend compatibility
    const formatted = reviews.map((r) => ({
      id: r.reviewId || r._id?.toString(),
      _id: r._id,
      reviewId: r.reviewId,
      name: r.name,
      email: r.email,
      rating: r.rating,
      category: r.category,
      message: r.message,
      submittedAt: r.submittedAt,
      readByAdmin: r.readByAdmin,
      device: r.device,
    }));

    return res.status(200).json({
      success: true,
      count: formatted.length,
      reviews: formatted,
    });
  } catch (error) {
    console.error("Error retrieving reviews:", error);
    const fallback = readBackupReviews();
    return res.status(200).json({
      success: true,
      count: fallback.length,
      reviews: fallback,
    });
  }
};

/**
 * @desc Permanently delete a review by ID (Administrator action)
 * @route DELETE /api/reviews/:id
 * @access Administrator
 */
exports.deleteReview = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Review ID is required.",
      });
    }

    // 1. Remove from MongoDB
    if (mongoose.connection.readyState === 1) {
      try {
        await Review.deleteOne({
          $or: [{ reviewId: id }, { _id: mongoose.isValidObjectId(id) ? id : null }],
        });
      } catch (dbErr) {
        console.warn("MongoDB delete review error:", dbErr.message);
      }
    }

    // 2. Remove from permanent disk backup
    const diskReviews = readBackupReviews();
    const updatedDisk = diskReviews.filter(
      (r) => r.reviewId !== id && r.id !== id && r._id?.toString() !== id
    );
    writeBackupReviews(updatedDisk);

    return res.status(200).json({
      success: true,
      message: "Review permanently deleted.",
      deletedId: id,
    });
  } catch (error) {
    console.error("Error deleting review:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete review.",
      error: error.message,
    });
  }
};

/**
 * @desc Mark a single review as read
 * @route PATCH /api/reviews/:id/read
 * @access Administrator
 */
exports.markReviewRead = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Update in MongoDB
    if (mongoose.connection.readyState === 1) {
      try {
        await Review.updateOne(
          { $or: [{ reviewId: id }, { _id: mongoose.isValidObjectId(id) ? id : null }] },
          { $set: { readByAdmin: true } }
        );
      } catch (_) {}
    }

    // 2. Update disk backup
    const diskReviews = readBackupReviews();
    const updated = diskReviews.map((r) => {
      if (r.reviewId === id || r.id === id || r._id?.toString() === id) {
        return { ...r, readByAdmin: true };
      }
      return r;
    });
    writeBackupReviews(updated);

    return res.status(200).json({
      success: true,
      message: "Review marked as read.",
    });
  } catch (error) {
    console.error("Error marking review as read:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to mark review as read.",
    });
  }
};

/**
 * @desc Mark all reviews as read
 * @route PATCH /api/reviews/read-all
 * @access Administrator
 */
exports.markAllReviewsRead = async (req, res) => {
  try {
    // 1. Update MongoDB
    if (mongoose.connection.readyState === 1) {
      try {
        await Review.updateMany({}, { $set: { readByAdmin: true } });
      } catch (_) {}
    }

    // 2. Update disk backup
    const diskReviews = readBackupReviews();
    const updated = diskReviews.map((r) => ({ ...r, readByAdmin: true }));
    writeBackupReviews(updated);

    return res.status(200).json({
      success: true,
      message: "All reviews marked as read.",
    });
  } catch (error) {
    console.error("Error marking all reviews read:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to mark all reviews as read.",
    });
  }
};
