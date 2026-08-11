import { db } from "../connect.js";

export const createChat = async (req, res) => {
  try {
    const buyerId = req.user.id;
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({ success: false, message: "Product ID is required" });
    }

    const [products] = await db.promise().query(
      "SELECT id, seller_id FROM product WHERE id = ? LIMIT 1",
      [productId]
    );
    if (!products.length) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    const sellerId = products[0].seller_id;
    if (Number(buyerId) === Number(sellerId)) {
      return res.status(400).json({ success: false, message: "You cannot chat with yourself" });
    }

    const [existingChat] = await db.promise().query(
      "SELECT id FROM chats WHERE buyer_id = ? AND seller_id = ? AND p_id = ? LIMIT 1",
      [buyerId, sellerId, productId]
    );
    if (existingChat.length) {
      return res.json({ success: true, chatId: existingChat[0].id });
    }

    const [result] = await db.promise().query(
      "INSERT INTO chats (buyer_id, seller_id, p_id) VALUES (?, ?, ?)",
      [buyerId, sellerId, productId]
    );
    return res.status(201).json({ success: true, chatId: result.insertId });
  } catch (error) {
    console.error("Create chat error:", error);
    return res.status(500).json({ success: false, message: "Failed to create chat" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user.id;
    const [chats] = await db.promise().query(
      "SELECT buyer_id, seller_id FROM chats WHERE id = ? LIMIT 1",
      [chatId]
    );

    if (!chats.length) {
      return res.status(404).json({ success: false, message: "Chat not found" });
    }
    const chat = chats[0];
    if (Number(chat.buyer_id) !== Number(userId) && Number(chat.seller_id) !== Number(userId)) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to access this chat",
      });
    }

    const [messages] = await db.promise().query(
      "SELECT id, chat_id, sender_id, message, created_at, is_read FROM messages WHERE chat_id = ? ORDER BY created_at ASC, id ASC",
      [chatId]
    );
    return res.json({ success: true, messages });
  } catch (error) {
    console.error("Get messages error:", error);
    return res.status(500).json({ success: false, message: "Failed to get messages" });
  }
};

export const getMyChats = async (req, res) => {
  try {
    const userId = req.user.id;
    const [chats] = await db.promise().query(
      `SELECT c.id AS chatId, c.p_id AS productId, p.p_name AS productName,
        CASE WHEN c.buyer_id = ? THEN c.seller_id ELSE c.buyer_id END AS otherUserId,
        CASE WHEN c.buyer_id = ? THEN seller.username ELSE buyer.username END AS otherUsername,
        latest.message AS lastMessage, latest.created_at AS lastMessageTime
       FROM chats c
       JOIN product p ON p.id = c.p_id
       JOIN users buyer ON buyer.id = c.buyer_id
       JOIN users seller ON seller.id = c.seller_id
       LEFT JOIN messages latest ON latest.id = (
         SELECT m.id FROM messages m WHERE m.chat_id = c.id
         ORDER BY m.created_at DESC, m.id DESC LIMIT 1
       )
       WHERE c.buyer_id = ? OR c.seller_id = ?
       ORDER BY COALESCE(latest.created_at, c.id) DESC`,
      [userId, userId, userId, userId]
    );
    return res.json({ success: true, chats });
  } catch (error) {
    console.error("Get my chats error:", error);
    return res.status(500).json({ success: false, message: "Failed to get chats" });
  }
};
