import express from "express";
import articleController from "../controller/articleController.js";
import auth from "../middleware/auth.js";

const router = express.Router();

// Public routes
router.get("/", articleController.list);
router.get("/category/:category", articleController.getByCategory);
router.get("/author/:authorId", articleController.getByAuthor);
router.get("/:id", articleController.get);

// Protected routes - auth middleware extracts user from token
router.post("/", auth, articleController.create);
router.put("/:id", auth, articleController.update);
router.delete("/:id", auth, articleController.remove);

export default router;
