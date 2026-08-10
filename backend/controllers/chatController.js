import { db } from "../connect.js";

export const createChat = async (req, res) => {
    try {

           const { buyerId, sellerId, productId } = req.body;

    console.log("CREATE CHAT DATA:", {
      buyerId,
      sellerId,
      productId,
    });


    if (!buyerId || !sellerId || !productId) {
      return res.status(400).json({
        success: false,
        message: "buyerId, sellerId and productId are required",
      });
    }
        // const buyerId = req.user.id;
        // const { productId } = req.body;
        console.log("Buyer ID:", buyerId, "Product ID:", productId,"get the msg");
        if (!productId) {
            return res.status(400).json({   message: "Product ID is required" });
        }

        // Get product seller
        const [products] = await db.promise().query(
            `  SELECT id, seller_id FROM product WHERE id = ?  `,  [productId]
        );

        if (products.length === 0) {  return res.status(404).json({  message: "Product not found" });  }

        // const sellerId = products[0].seller_id;

        // Prevent seller from chatting with themselves
        if (buyerId === sellerId) {
            return res.status(400).json({  message: "You cannot chat with yourself"});
        }

        // Check if chat already exists
        const [existingChat] = await db.promise().query(
            `  SELECT id FROM chats  WHERE buyer_id = ? AND seller_id = ? AND p_id = ?  `, [buyerId, sellerId, productId]
        );

        if (existingChat.length > 0) {
              return res.status(200).json({ success: true, chatId: existingChat[0].id });
        }

        // Create new chat
        const [result] = await db.promise().query(
            `  INSERT INTO chats (buyer_id, seller_id, p_id)  VALUES (?, ?, ?)  `, [buyerId, sellerId, productId]
        );

        return res.status(201).json({
            success: true, chatId: result.insertId
        });

    } catch (error) {

        console.error("Create chat error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to create chat"
        });
    }
};

//get previous msg:
export const getMessages = async (req, res) => {

    try {

        const { chatId } = req.params;

        const [messages] = await db.promise().query(
            `
            SELECT id, chat_id,  sender_id, message, created_at, is_read
            FROM messages  WHERE chat_id = ? ORDER BY created_at ASC
            `, [chatId]
        );

        res.status(200).json({
            success: true,
            messages
        });

    } catch (error) {

        console.error("Get messages error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to get messages"
        });
    }
};