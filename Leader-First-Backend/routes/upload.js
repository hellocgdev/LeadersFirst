import express from "express";
import { uploadThumbnail, uploadContentImage } from "../config/cloudinary.js";
import auth from "../middleware/auth.js"; // Import default export

const router = express.Router();

// Upload thumbnail
router.post(
  "/thumbnail",
  auth,
  uploadThumbnail.single("thumbnail"),
  (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      res.status(200).json({
        url: req.file.path,
        publicId: req.file.filename,
        message: "Thumbnail uploaded successfully",
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// Upload content image
router.post(
  "/content-image",
  auth,
  uploadContentImage.single("image"),
  (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      res.status(200).json({
        url: req.file.path,
        publicId: req.file.filename,
        message: "Image uploaded successfully",
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

export default router;
