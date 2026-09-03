const mongoose = require("mongoose");

const newsArticleSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    url: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    imageUrl: {
      type: String,
      default: null,
    },
    source: {
      type: String,
      required: true,
      trim: true,
    },
    language: {
      type: String,
      enum: ["en", "hi", "or"],
      required: true,
    },
    publishedAt: {
      type: Date,
      required: true,
      index: true,
    },
    fetchedAt: {
      type: Date,
      default: Date.now,
    },
    keywords: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: false,
    versionKey: false,
  }
);

// Compound index for sorted queries per language
newsArticleSchema.index({ language: 1, publishedAt: -1 });

// TTL: auto-delete articles older than 30 days
newsArticleSchema.index({ fetchedAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 30 });

module.exports = mongoose.model("NewsArticle", newsArticleSchema);
