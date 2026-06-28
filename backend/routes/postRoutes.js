import express from "express";
import { addPosts ,getPosts, updatePosts, deletePosts} from "../controllers/user_post.js";
import upload from "../middleware/multer.js";
import { protect } from "../middleware/authmiddleware.js";
const router = express.Router();

router.post("/", protect, upload.array("image", 5), addPosts);
router.get("/", getPosts);
router.put("/update/:id/", protect, upload.array("image", 5), updatePosts);
router.delete("/:id", protect, deletePosts);

export default router;
