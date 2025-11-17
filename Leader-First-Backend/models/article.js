import mongoose from "mongoose";

const articleSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxLength: 200,
    },

    content: {
      type: String,
      required: true,
    },

    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    thumbnail: {
      url: {
        type: String,
        required: false,
      },
      alt: String,
      publicId: String, // For Cloudinary/AWS deletion
    },

    category: {
      type: String,
      required: true,
      trim: true,
    },

    publishedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt automatically
  }
);

// Index for better query performance
articleSchema.index({ category: 1, publishedAt: -1 });
articleSchema.index({ author: 1 });

export default mongoose.model("Article", articleSchema);
