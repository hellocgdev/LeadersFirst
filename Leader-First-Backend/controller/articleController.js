import Article from "../models/article.js";

// List all articles
export const list = async (_req, res) => {
  try {
    const docs = await Article.find().sort({ createdAt: -1 });
    return res.status(200).json({ count: docs.length, data: docs });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// Get single article by ID
export const get = async (req, res) => {
  try {
    const doc = await Article.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: "not found" });
    return res.status(200).json(doc);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// Create new article
export const create = async (req, res) => {
  try {
    const { title, content } = req.body;
    if (!title || !content)
      return res.status(400).json({ message: "Title and content required." });

    const doc = await Article.create({ title, content });
    return res.status(201).json(doc);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// Update article
export const update = async (req, res) => {
  try {
    const { title, content } = req.body;
    if ("title" in req.body && !title)
      return res.status(400).json({ message: "Title required." });
    if ("content" in req.body && !content)
      return res.status(400).json({ message: "Content required." });

    const updateFields = {};
    if ("title" in req.body) updateFields.title = title;
    if ("content" in req.body) updateFields.content = content;

    const doc = await Article.findByIdAndUpdate(req.params.id, updateFields, {
      new: true,
      runValidators: true,
    });
    if (!doc) return res.status(404).json({ message: "not found" });
    return res.status(200).json(doc);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// Delete article
export const remove = async (req, res) => {
  try {
    const doc = await Article.findByIdAndDelete(req.params.id);
    if (!doc) return res.status(404).json({ message: "not found" });
    return res.status(200).json({ message: "deleted" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export default { list, get, create, update, remove };
