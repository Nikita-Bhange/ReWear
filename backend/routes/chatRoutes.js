import express from "express";
import  {createChat}  from "../controllers/chatController.js";
// import {protect} from "../middleware/authmiddleware.js";
import { getMessages } from "../controllers/chatController.js";
const router = express.Router();

router.post("/create", createChat);
router.get("/:chatId/messages",  getMessages);

export default router;