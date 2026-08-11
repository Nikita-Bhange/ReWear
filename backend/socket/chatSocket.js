import jwt from "jsonwebtoken";
import { db } from "../connect.js";

const getCookie = (header = "", name) => {
  const item = header.split(";").map((value) => value.trim()).find((value) => value.startsWith(`${name}=`));
  return item ? decodeURIComponent(item.slice(name.length + 1)) : null;
};

const isChatMember = async (chatId, userId) => {
  const [chats] = await db.promise().query(
    "SELECT buyer_id, seller_id FROM chats WHERE id = ? LIMIT 1",
    [chatId]
  );
  if (!chats.length) return false;
  return Number(chats[0].buyer_id) === Number(userId) || Number(chats[0].seller_id) === Number(userId);
};

export const initializeChatSocket = (io) => {
  io.use((socket, next) => {
    try {
      const token = getCookie(socket.handshake.headers.cookie, "token");
      if (!token) return next(new Error("Not authenticated"));
      socket.data.user = jwt.verify(token, process.env.JWT_SECRET);
      return next();
    } catch {
      return next(new Error("Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    console.log("Chat socket connected:", socket.id);

    socket.on("join_chat", async ({ chatId }) => {
      try {
        if (!(await isChatMember(chatId, socket.data.user.id))) {
          socket.emit("chat_error", "You are not authorized to join this chat");
          return;
        }
        socket.join(`chat_${chatId}`);
      } catch (error) {
        console.error("Join chat error:", error);
      }
    });

    socket.on("send_message", async ({ chatId, message }) => {
      try {
        const senderId = socket.data.user.id;
        if (!chatId || !message?.trim()) return;
        if (!(await isChatMember(chatId, senderId))) {
          socket.emit("chat_error", "You are not authorized to send to this chat");
          return;
        }

        // Keep the existing database insert and room broadcast flow.
        const [result] = await db.promise().query(
          "INSERT INTO messages (chat_id, sender_id, message) VALUES (?, ?, ?)",
          [chatId, senderId, message.trim()]
        );
        const [savedMessages] = await db.promise().query(
          "SELECT id, chat_id, sender_id, message, created_at, is_read FROM messages WHERE id = ?",
          [result.insertId]
        );
        io.to(`chat_${chatId}`).emit("receive_message", savedMessages[0]);
      } catch (error) {
        console.error("Send message error:", error);
        socket.emit("chat_error", "Message could not be sent");
      }
    });

    socket.on("leave_chat", ({ chatId }) => socket.leave(`chat_${chatId}`));
  });
};
