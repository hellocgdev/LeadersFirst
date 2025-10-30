import mongoose from "mongoose";

const articleSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    content: { type: String, required: true },
  },
  { timestamps: true }
);

const Article = mongoose.model("Article", articleSchema);
export default Article;
