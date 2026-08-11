import express from "express";
import { createChat, getMessages, getMyChats } from "../controllers/chatController.js";
import { protect } from "../middleware/authmiddleware.js";

const router = express.Router();

router.use(protect);
router.post("/create", createChat);
router.get("/my-chats", getMyChats);
router.get("/:chatId/messages", getMessages);

export default router;
