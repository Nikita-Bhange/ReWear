import React, { useState, useContext } from "react";
import UserInfo from "../Components/UserInfo.jsx";
import Posts from "../Components/Posts.jsx";
import Navbar from "../Components/Navbar.jsx";
import Footer from "../Components/Footer.jsx";
import { NavLink, useNavigate } from "react-router-dom";
import { UserContext } from "../Context/User";
import { AccountCircle } from "@mui/icons-material";

function Profile() {
  const [err, setErr] = useState(null);
  const navigate = useNavigate();
  const { user, logout } = useContext(UserContext);

  const handleClick = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      setErr(err?.message || "An error occurred");
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-100 py-10">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden w-full max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-cyan-400 to-blue-500 h-40" />
          
          <div className="px-6 pb-6">
            <div className="relative -mt-16 flex flex-col items-center">
              <div className="flex h-32 w-32 items-center justify-center rounded-full border-4 border-white bg-slate-100 shadow-md">
                <AccountCircle sx={{ fontSize: 108, color: "#475569" }} />
              </div>
            </div>

            <div className="text-center mt-4">
              <h1 className="text-2xl font-bold text-gray-800">{user?.username || "User Name"}</h1>
              <p className="text-gray-600">{user?.email || "user@example.com"}</p>
            </div>

            <div className="mt-6 border-t pt-6">
                <UserInfo />
                <Posts />
            </div>

            <div className="text-center mt-8 space-x-4">
              <NavLink to="/history">
                <button className="text-white font-bold bg-blue-600 hover:bg-blue-700 rounded-lg px-6 py-2 transition">
                  View History
                </button>
              </NavLink>
              <button className="text-white font-bold bg-red-500 hover:bg-red-600 rounded-lg px-6 py-2 transition" onClick={handleClick}>
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default Profile;
