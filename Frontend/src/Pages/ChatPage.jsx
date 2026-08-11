import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import ChatBox from "../Components/ChatBox.jsx";
import { UserContext } from "../Context/User.jsx";

const ChatPage = () => {
  const { chatId } = useParams();
  const { user } = useContext(UserContext);
  const [chat, setChat] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    axios.get("http://localhost:8000/api/chat/my-chats", { withCredentials: true })
      .then((response) => {
        const selected = response.data.chats?.find((item) => String(item.chatId) === String(chatId));
        if (selected) setChat(selected);
        else setError("You are not authorized to access this chat");
      })
      .catch((err) => setError(err.response?.data?.message || "Could not load chat"));
  }, [chatId]);

  if (error) return <div className="p-8 text-red-600">{error}</div>;
  if (!chat || !user) return <div className="p-8">Loading chat...</div>;

  return (
    <ChatBox
      chatId={chat.chatId}
      currentUserId={user.id}
      otherUsername={chat.otherUsername}
      productName={chat.productName}
      onClose={() => navigate("/my-chats")}
    />
  );
};

export default ChatPage;
