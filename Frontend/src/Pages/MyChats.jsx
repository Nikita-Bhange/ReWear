import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Navbar from "../Components/Navbar.jsx";

const MyChats = () => {
  const [chats, setChats] = useState([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    axios.get("http://localhost:8000/api/chat/my-chats", { withCredentials: true })
      .then((response) => setChats(response.data.chats || []))
      .catch((err) => setError(err.response?.data?.message || "Could not load chats"));
  }, []);

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-slate-100 px-4 py-28">
        <section className="mx-auto max-w-2xl rounded-xl bg-white p-6 shadow">
          <h1 className="mb-5 text-2xl font-bold text-slate-800">My Chats</h1>
          {error && <p className="text-sm text-red-600">{error}</p>}
          {!error && chats.length === 0 && <p className="text-slate-500">No conversations yet.</p>}
          <div className="divide-y">
            {chats.map((chat) => (
              <button
                key={chat.chatId}
                onClick={() => navigate(`/chat/${chat.chatId}`)}
                className="w-full py-4 text-left hover:bg-slate-50"
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold text-slate-800">{chat.otherUsername || "User"}</p>
                    <p className="text-sm text-blue-700">{chat.productName}</p>
                    <p className="mt-1 truncate text-sm text-slate-500">{chat.lastMessage || "No messages yet"}</p>
                  </div>
                  {chat.lastMessageTime && (
                    <time className="shrink-0 text-xs text-slate-400">
                      {new Date(chat.lastMessageTime).toLocaleString()}
                    </time>
                  )}
                </div>
              </button>
            ))}
          </div>
        </section>
      </main>
    </>
  );
};

export default MyChats;
