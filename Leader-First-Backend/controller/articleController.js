import Article from "../models/article.js";
import { cloudinary } from "../config/cloudinary.js";

// Create new article - author comes from authenticated user
export const create = async (req, res) => {
  console.log("\n=== CREATE ARTICLE REQUEST ===");
  console.log("Headers:", req.headers);
  console.log(
    "Auth user:",
    req.user ? { id: req.user._id, name: req.user.name } : "NONE"
  );
  console.log("Body received:", JSON.stringify(req.body, null, 2));

  try {
    const { title, content, thumbnail, category, publishedAt } = req.body;
    const author = req.user?._id || req.user?.id;

    console.log("Extracted values:");
    console.log("- Title:", title);
    console.log("- Content length:", content?.length);
    console.log("- Thumbnail:", thumbnail);
    console.log("- Category:", category);
    console.log("- Author:", author);

    // Check each field individually
    if (!author) {
      console.log("❌ No author (user not authenticated)");
      return res.status(401).json({ message: "User not authenticated" });
    }

    if (!title) {
      console.log("❌ Missing title");
      return res.status(400).json({ message: "Title is required" });
    }

    if (!content) {
      console.log("❌ Missing content");
      return res.status(400).json({ message: "Content is required" });
    }

    if (!thumbnail) {
      console.log("❌ Missing thumbnail");
      return res.status(400).json({ message: "Thumbnail is required" });
    }

    if (!thumbnail.url) {
      console.log("❌ Missing thumbnail URL");
      return res.status(400).json({ message: "Thumbnail URL is required" });
    }

    if (!category) {
      console.log("❌ Missing category");
      return res.status(400).json({ message: "Category is required" });
    }

    const articleData = {
      title,
      content,
      author,
      thumbnail: {
        url: thumbnail.url,
        alt: thumbnail.alt || title,
        publicId: thumbnail.publicId || null,
      },
      category,
      publishedAt: publishedAt ? new Date(publishedAt) : Date.now(),
    };

    console.log("Creating article with:", articleData);

    const doc = await Article.create(articleData);
    await doc.populate("author", "name email avatar");

    console.log("✅ Article created:", doc._id);
    return res.status(201).json(doc);
  } catch (err) {
    console.error("❌ Error creating article:", err);
    return res.status(500).json({ message: err.message, stack: err.stack });
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
    if ("thumbnail" in req.body && (!thumbnail || !thumbnail.url)) {
      return res.status(400).json({ message: "Thumbnail URL is required" });
    }

    const updateFields = {};
    if ("title" in req.body) updateFields.title = title;
    if ("content" in req.body) updateFields.content = content;
    if ("category" in req.body) updateFields.category = category;
    if ("publishedAt" in req.body)
      updateFields.publishedAt = new Date(publishedAt);

    if ("thumbnail" in req.body) {
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
