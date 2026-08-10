
import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { io } from "socket.io-client";

const SOCKET_URL = "http://localhost:8000";

const ChatBox = ({ onClose, sellerId, productId, productName, chatId, currentUserId,}) => {
console.log("CHAT PROPS:", {
  chatId,
  currentUserId,
  sellerId,
  productId,
});
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

 



  const socketRef = useRef(null);
const messagesEndRef = useRef(null);

useEffect(() => {
  if (!chatId || !currentUserId) {
    console.log("Waiting for chat/user:", {
      chatId,
      currentUserId,
    });
    return;
  }

  let newSocket;

  const initializeChat = async () => {
    try {
      // =========================
      // 1. GET PREVIOUS MESSAGES
      // =========================

      const response = await axios.get(
        `http://localhost:8000/api/chat/${chatId}/messages`,
        {
          withCredentials: true,
        }
      );

      const dbMessages = response.data.messages || [];

      const formattedMessages = dbMessages.map((msg) => ({
        id: msg.id,

        sender:
          Number(msg.sender_id) === Number(currentUserId)
            ? "buyer"
            : "seller",

        text: msg.message,

        time: new Date(msg.created_at).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      }));

      setMessages(formattedMessages);

      // =========================
      // 2. CONNECT SOCKET.IO
      // =========================

      newSocket = io(SOCKET_URL, {
        transports: ["websocket"],
        withCredentials: true,
      });

      // ⭐ THIS WAS MISSING
      socketRef.current = newSocket;

      console.log("Connecting to Socket.IO...");

      // =========================
      // 3. SOCKET CONNECTED
      // =========================

      newSocket.on("connect", () => {
        console.log(
          "Socket connected:",
          newSocket.id
        );

        // Join this particular chat room
        newSocket.emit("join_chat", {
          chatId,
          userId: currentUserId,
        });

        console.log(
          "Joined chat:",
          chatId
        );
      });

      // =========================
      // 4. RECEIVE MESSAGE
      // =========================

      newSocket.on("receive_message", (newMessage) => {
        console.log(
          "Received message:",
          newMessage
        );

        const formattedMessage = {
          id: newMessage.id || Date.now(),

          sender:
            Number(newMessage.sender_id) ===
            Number(currentUserId)
              ? "buyer"
              : "seller",

          text: newMessage.message,

          time: new Date(
            newMessage.created_at || Date.now()
          ).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        };

        setMessages((prev) => {
          const alreadyExists = prev.some(
            (msg) =>
              msg.id === formattedMessage.id
          );

          if (alreadyExists) {
            return prev;
          }

          return [
            ...prev,
            formattedMessage,
          ];
        });
      });

      // =========================
      // 5. SOCKET ERROR
      // =========================

      newSocket.on(
        "connect_error",
        (error) => {
          console.error(
            "Socket connection error:",
            error
          );
        }
      );

      // =========================
      // 6. DISCONNECT
      // =========================

      newSocket.on("disconnect", () => {
        console.log(
          "Socket disconnected"
        );
      });

    } catch (error) {
      console.error(
        "Error initializing chat:",
        error
      );
    }
  };

  initializeChat();

  // =========================
  // CLEANUP
  // =========================

  return () => {
    if (newSocket) {
      newSocket.emit("leave_chat", {
        chatId,
        userId: currentUserId,
      });

      newSocket.off("receive_message");
      newSocket.off("connect");
      newSocket.off("connect_error");
      newSocket.off("disconnect");

      newSocket.disconnect();
    }

    socketRef.current = null;
  };
}, [chatId, currentUserId]);
//auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

 
  const handleSendMessage = () => {
    if (!message.trim()) return;

    const socket = socketRef.current;

    if (!socket) {
        console.error(" Socket instance does not exist");
        return;
    }

    if (!socket.connected) {
        console.error(" Socket is not connected");
        return;
    }

    if (!chatId || !currentUserId) {
        console.error(" Chat ID or current user ID is missing");
        return;
    }

    socket.emit("send_message", {
        chatId: chatId,
        senderId: currentUserId,
        message: message.trim(),
    });

    setMessage("");
};

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
   <div className="fixed inset-0 z-[100] bg-black/40 flex items-end justify-end sm:items-center sm:justify-center p-0 sm:p-6">

      {/* Chat Window */}
      <div
        className="
          bg-white
          w-full
          h-[100dvh]
          sm:h-[600px]
          sm:max-h-[85vh]
          sm:w-[420px]
          rounded-none
          sm:rounded-2xl
          shadow-2xl
          overflow-hidden
          flex
          flex-col
        "
      >
        <div className="bg-[#17295c] text-white px-5 py-4 flex items-center justify-between shrink-0">

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/15 flex items-center justify-center">

              <svg
                className="w-5 h-5"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>

            </div>

            <div>

              <h2 className="font-semibold text-sm">
                Chat with Seller
              </h2>

              <p className="text-xs text-white/70">
                Seller ID: {sellerId || "21"}
              </p>

            </div>

          </div>

          {/* Close */}

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full hover:bg-white/10 flex items-center justify-center transition"
          >

            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >

              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 6l12 12M18 6L6 18"
              />

            </svg>

          </button>

        </div>

        <div className="px-4 py-3 border-b bg-slate-50 shrink-0">

          <p className="text-xs text-slate-500">
            Chat about
          </p>

          <p className="text-sm font-semibold text-slate-800 truncate">
            {productName || "Product"}
          </p>

        </div>

        {/* ================= MESSAGES ================= */}

        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-white">

          {/* Date */}

          <div className="flex justify-center">

            <span className="text-[11px] text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
              Today
            </span>

          </div>

          {/* Messages */}

          {messages.map((msg) => (

            <div
              key={msg.id}
              className={`flex ${
                msg.sender === "buyer"
                  ? "justify-end"
                  : "justify-start"
              }`}
            >

              <div
                className={`
                  max-w-[78%] px-4 py-2.5 rounded-2xl text-sm
                  ${
                    msg.sender === "buyer"
                      ? "bg-green-100 text-slate-800 rounded-br-md"
                      : "bg-slate-100 text-slate-700 rounded-bl-md"
                  }
                `}
              >

                <p className="wrap-break-words">
                  {msg.text}
                </p>

                <div
                  className={`
                    text-[10px] mt-1
                    ${
                      msg.sender === "buyer"
                        ? "text-right text-slate-500"
                        : "text-left text-slate-400"
                    }
                  `}
                >
                  {msg.time}
                </div>

              </div>

            </div>

          ))}

          {/* Scroll target */}

          <div ref={messagesEndRef} />

        </div>

        {/* ================= INPUT ================= */}

        <div className="border-t bg-white px-3 py-3 shrink-0">

          <div className="flex items-end gap-2">

            {/* Message textarea */}

            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
              placeholder="Type a message..."
              className="
                flex-1
                resize-none
                border
                border-slate-200
                rounded-2xl
                px-4
                py-2.5
                text-sm
                outline-none
                focus:border-green-500
                focus:ring-2
                focus:ring-green-100
                max-h-24
                overflow-y-auto
              "
            />

            {/* Send */}

            <button
              onClick={handleSendMessage}
            disabled={!message.trim() || !socketRef.current?.connected}
              className="
                w-11
                h-11
                rounded-full
                bg-green-600
                hover:bg-green-700
                disabled:bg-slate-300
                text-white
                flex
                items-center
                justify-center
                shrink-0
                transition
              "
            >

              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >

                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M22 2L11 13"
                />

                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M22 2L15 22L11 13L2 9L22 2Z"
                />

              </svg>

            </button>

          </div>

          <p className="text-[10px] text-slate-400 text-center mt-2">
            Press Enter to send
          </p>

        </div>

      </div>
    </div>
  );
};

export default ChatBox;

