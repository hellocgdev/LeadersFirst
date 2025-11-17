import Article from "../models/article.js";
import { cloudinary } from "../config/cloudinary.js";
import { ensurePeriodWindow } from "../utils/billing.js";
import User from "../models/user.js";

function ok(res, data, status = 200) {
  return res.status(status).json({ success: true, data });
}
function fail(res, message, status = 400) {
  return res.status(status).json({ success: false, message });
}
function parseDateOrNull(value) {
  if (!value) return null;
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d;
}

export const create = async (req, res) => {
  try {
    const { title, content, thumbnail, category, publishedAt, slug } = req.body;
    const author = req.user?._id || req.user?.id;

    if (!author) return fail(res, "User not authenticated", 401);
    if (!title) return fail(res, "Title is required");
    if (!content) return fail(res, "Content is required");
    if (!category) return fail(res, "Category is required");

    // THUMBNAIL IS NOW OPTIONAL - REMOVED THIS CHECK
    // if (!thumbnail || !thumbnail.url)
    //   return fail(res, "Thumbnail URL is required");

    // Enforce publish gate (2 free publishes if inactive)
    const user = await User.findById(author);
    user.ensurePeriodWindow();
    if (!user.canPublish()) {
      return res.status(402).json({
        success: false,
        code: "PAYMENT_REQUIRED",
        message:
          "Publish limit reached. Please upgrade to continue publishing.",
      });
    }

    const pubAt = parseDateOrNull(publishedAt) || new Date();
    const articleData = {
      title,
      content,
      author,
      category,
      publishedAt: pubAt,
    };

    // ONLY ADD THUMBNAIL IF IT EXISTS
    if (thumbnail && thumbnail.url) {
      articleData.thumbnail = {
        url: thumbnail.url,
        alt: thumbnail.alt || title,
        publicId: thumbnail.publicId || null,
      };
    }

    if (slug) articleData.slug = slug;

    const doc = await Article.create(articleData);
    await doc.populate("author", "name email avatar");

    // Increment count for inactive plans
    await user.incrementPublishCountIfNeeded();

    return ok(res, doc, 201);
  } catch (err) {
    console.error("Error creating article:", err);
    return fail(res, "Failed to create article", 500);
  }
};

// Rest of your controller code...
export const list = async (_req, res) => {
  try {
    const docs = await Article.find()
      .populate("author", "name email avatar")
      .sort({ publishedAt: -1 });
    return res.status(200).json({ count: docs.length, data: docs });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const get = async (req, res) => {
  try {
    const doc = await Article.findById(req.params.id).populate(
      "author",
      "name email avatar"
    );
    if (!doc) return res.status(404).json({ message: "Article not found" });
    return res.status(200).json(doc);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const getByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const docs = await Article.find({ category })
      .populate("author", "name email avatar")
      .sort({ publishedAt: -1 });
    return res.status(200).json({ count: docs.length, data: docs });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const getByAuthor = async (req, res) => {
  try {
    const { authorId } = req.params;
    const docs = await Article.find({ author: authorId })
      .populate("author", "name email avatar")
      .sort({ publishedAt: -1 });
    return res.status(200).json({ count: docs.length, data: docs });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const update = async (req, res) => {
  try {
    const { title, content, thumbnail, category, publishedAt } = req.body;

    if ("title" in req.body && !title) {
      return res.status(400).json({ message: "Title cannot be empty" });
    }
    if ("content" in req.body && !content) {
      return res.status(400).json({ message: "Content cannot be empty" });
    }
    if ("category" in req.body && !category) {
      return res.status(400).json({ message: "Category cannot be empty" });
    }

    // THUMBNAIL VALIDATION - NOW OPTIONAL, ONLY VALIDATE IF PROVIDED
    if ("thumbnail" in req.body && thumbnail && !thumbnail.url) {
      return res.status(400).json({
        message: "Thumbnail URL is required when thumbnail is provided",
      });
    }

    const updateFields = {};
    if ("title" in req.body) updateFields.title = title;
    if ("content" in req.body) updateFields.content = content;
    if ("category" in req.body) updateFields.category = category;
    if ("publishedAt" in req.body)
      updateFields.publishedAt = new Date(publishedAt);

    // ONLY UPDATE THUMBNAIL IF IT EXISTS AND HAS A URL
    if ("thumbnail" in req.body && thumbnail && thumbnail.url) {
      updateFields.thumbnail = {
        url: thumbnail.url,
        alt: thumbnail.alt || updateFields.title || "",
        publicId: thumbnail.publicId || null,
      };
    }

    const doc = await Article.findByIdAndUpdate(req.params.id, updateFields, {
      new: true,
      runValidators: true,
    }).populate("author", "name email avatar");

    if (!doc) return res.status(404).json({ message: "Article not found" });
    return res.status(200).json(doc);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const remove = async (req, res) => {
  try {
    const doc = await Article.findByIdAndDelete(req.params.id);
    if (!doc) return res.status(404).json({ message: "Article not found" });

    // ONLY DELETE FROM CLOUDINARY IF THUMBNAIL EXISTS
    if (doc.thumbnail?.publicId) {
      await cloudinary.uploader.destroy(doc.thumbnail.publicId);
    }

    return res.status(200).json({
      message: "Article deleted successfully",
      deletedArticle: {
        id: doc._id,
        title: doc.title,
      },
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export default {
  list,
  get,
  getByCategory,
  getByAuthor,
  create,
  update,
  remove,
};
