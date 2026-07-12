import { useState } from "react";
import axios from "axios";
import React from "react";

const ForgotPassword = ({ onClose, onOtpSent }) => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async () => {
    if (!email.trim()) {
      setError("Please enter your email.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      await axios.post(
        "http://localhost:8000/api/auth/forgotPassword",
        {
          email,
        }
      );
      console.log("OTP sent successfully");


      // Close this popup and open OTP popup
      onOtpSent(email);

    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.response?.data ||
        "Failed to send OTP."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-2xl w-[90%] max-w-md shadow-lg">

        {/* Icon */}
        <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-7 h-7 text-green-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        </div>

        {/* Heading */}
        <h2 className="text-xl font-medium text-center text-slate-800 mb-1">
          Forgot Password
        </h2>

        <p className="text-sm text-slate-500 text-center mb-6">
          Enter your registered email address to receive a verification code.
        </p>

        <input
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setError("");
          }}
          className="w-full px-4 py-3 mb-4 text-sm text-slate-700 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-100 focus:border-green-500 transition"
        />

        {error && (
          <p className="text-red-500 text-sm text-center mb-4">
            {error}
          </p>
        )}

        <button
          onClick={handleSendOtp}
          disabled={loading}
          className="w-full py-3 rounded-xl bg-green-600 text-white font-medium hover:bg-green-700 transition disabled:opacity-50"
        >
          {loading ? "Sending..." : "Send OTP"}
        </button>

        <button
          onClick={onClose}
          className="block w-full text-center mt-4 text-sm text-slate-400 hover:text-slate-600 transition"
        >
          Cancel
        </button>

      </div>
    </div>
  );
};


export default ForgotPassword;