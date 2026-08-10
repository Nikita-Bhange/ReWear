
import {db} from "../connect.js";
export const initializeChatSocket = (io) => {
  console.log("🔥 initializeChatSocket CALLED");
    io.on("connection", (socket) => {

        console.log("User connected:", socket.id);


        // Join chat room
        socket.on("join_chat", (chatId) => {
              socket.join(`chat_${chatId}`);
               console.log(
                `Socket ${socket.id} joined chat ${chatId}`
            );
     });


        // Send message
        socket.on("send_message", async (data) => {
              try {
                     const { chatId, senderId, message  } = data;

                if (!chatId || !senderId || !message?.trim()) {
                    return;
                }
                // Save message in MySQL
                const [result] = await db.promise().query(
                    `INSERT INTO messages (chat_id, sender_id, message) VALUES (?, ?, ?) `, [
                        chatId, senderId, message.trim()]
                );


                // Message object
                const newMessage = {
                    id: result.insertId,chatId, senderId,  message: message.trim(),created_at: new Date()
                };


                // Send to everyone in this chat
                 io.to(`chat_${chatId}`).emit("receive_message", newMessage);
                 } catch (error) {
                      console.error(  "Socket message error:", error);
                 }
        });

        socket.on("join_chat", ({ chatId, userId }) => {
  try {
    const roomName = `chat_${chatId}`;

    socket.join(roomName);

    console.log(
      `User ${userId} joined ${roomName}`
    );

  } catch (error) {
    console.error(
      "Join chat error:",
      error
    );
  }
});


socket.on("send_message", async (data) => {

  try {

    const {
      chatId,
      senderId,
      message
    } = data;

    console.log("📩 SEND MESSAGE DATA:", {
      chatId,
      senderId,
      message
    });

    // Validate data
    if (!chatId || !senderId || !message?.trim()) {

      console.log(
        "❌ Missing message data"
      );

      return;
    }

    // ==============================
    // SAVE MESSAGE TO MYSQL
    // ==============================

    const [result] = await db.promise().query(
      `
      INSERT INTO messages
      (chat_id, sender_id, message)
      VALUES (?, ?, ?)
      `,
      [
        chatId,
        senderId,
        message.trim()
      ]
    );

    console.log(
      "✅ MESSAGE SAVED:",
      result.insertId
    );

    // ==============================
    // GET THE INSERTED MESSAGE
    // ==============================

    const [savedMessages] =
      await db.promise().query(
        `
        SELECT
          id,
          chat_id,
          sender_id,
          message,
          created_at,
          is_read
        FROM messages
        WHERE id = ?
        `,
        [result.insertId]
      );

    const savedMessage =
      savedMessages[0];

    // ==============================
    // SEND TO EVERYONE IN CHAT
    // ==============================

    io.to(`chat_${chatId}`).emit(
      "receive_message",
      savedMessage
    );

  } catch (error) {

    console.error(
      "❌ SEND MESSAGE ERROR:",
      error
    );

  }

});


socket.on("leave_chat", ({ chatId }) => {

  const roomName = `chat_${chatId}`;

  socket.leave(roomName);

  console.log(
    `Socket ${socket.id} left ${roomName}`
  );

});


        // Disconnect
         socket.on("disconnect", () => {
              console.log( "User disconnected:", socket.id );
        });

    });

};