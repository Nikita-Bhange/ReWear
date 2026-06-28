import express from "express";
import { getCategories, addCategory, deleteCategory } from "../controllers/categoryController.js";
import { protect, adminOnly } from "../middleware/authmiddleware.js";
const router = express.Router();

// Get all categories
router.get("/", getCategories);

// Add new category (Admin)
router.post("/", protect, adminOnly, addCategory);

// Delete category (Admin)
router.delete("/:id", protect, adminOnly, deleteCategory);

export default router;
