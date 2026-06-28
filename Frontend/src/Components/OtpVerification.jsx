import { useState, useEffect } from "react";
import axios from "axios";

import { useNavigate } from "react-router-dom";
import React from "react";

export const OtpVerification = ({ email, onClose }) =>{
  const navigate = useNavigate();
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const [timer, setTimer] = useState(180);
  const [canResend, setCanResend] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setTimer(180);
    setCanResend(false);

    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) { clearInterval(interval); setCanResend(true); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (s) =>
    `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

  const handleDigitChange = (val, idx) => {
    const digits = [...otpDigits];
    digits[idx] = val.slice(-1);
    setOtpDigits(digits);
    if (val && idx < 5) document.getElementById(`otp-${idx + 1}`)?.focus();
  };

  const handleDigitKey = (e, idx) => {
    if (e.key === "Backspace" && !otpDigits[idx] && idx > 0)
      document.getElementById(`otp-${idx - 1}`)?.focus();
  };

  const handleVerify = async () => {
    const otp = otpDigits.join("");
    if (otp.length < 6) { setError("Please enter all 6 digits"); return; }
    setError("");
    try {
      await axios.post("http://localhost:8000/api/auth/verifyOtp", { email, otp });
      onClose();
      alert("Email verified! Please log in.");
      navigate("/login");
    } catch (err) {
      setError(err.response?.data || "OTP verification failed");
    }
  };

  const handleResend = async () => {
    try {
      await axios.post("http://localhost:8000/api/auth/resendOtp", { email });
      setTimer(180);
      setCanResend(false);
      setOtpDigits(["", "", "", "", "", ""]);
      setError("");
      document.getElementById("otp-0")?.focus();
    } catch (err) {
      setError(err.response?.data || "Failed to resend OTP");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-2xl w-[90%] max-w-md shadow-lg">
        
        {/* Icon */}
        <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
          </svg>
        </div>

        {/* Heading */}
        <h2 className="text-xl font-medium text-center text-slate-800 mb-1">Check your email</h2>
        <p className="text-sm text-slate-500 text-center mb-6">
          Enter the 6-digit code sent to <strong className="text-slate-700">{email}</strong>
        </p>

        {/* OTP boxes */}
        <div className="flex gap-2 justify-center mb-4">
          {otpDigits.map((d, i) => (
            <input
              key={i}
              id={`otp-${i}`}
              type="text"
              maxLength={1}
              value={d}
              onChange={(e) => handleDigitChange(e.target.value, i)}
              onKeyDown={(e) => handleDigitKey(e, i)}
              className="w-12 h-14 text-center text-xl font-medium border-2 rounded-xl border-green-200 focus:border-green-500 focus:ring-2 focus:ring-green-100 outline-none transition"
            />
          ))}
        </div>

        {/* Error */}
        {error && (
          <p className="text-sm text-red-500 text-center mb-3">{error}</p>
        )}

        {/* Timer */}
        <div className="flex items-center justify-center gap-2 mb-5 text-sm text-slate-500">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <span>Code expires in</span>
          <span className={`text-xs font-medium px-3 py-1 rounded-full ${canResend ? "bg-red-50 text-red-600" : "bg-green-50 text-green-700"}`}>
            {canResend ? "Expired" : formatTime(timer)}
          </span>
        </div>

        {/* Action button */}
        {!canResend ? (
          <button
            onClick={handleVerify}
            className="w-full py-3 rounded-xl bg-green-600 hover:bg-green-700 text-white font-medium transition"
          >
            Verify email
          </button>
        ) : (
          <button
            onClick={handleResend}
            className="w-full py-3 rounded-xl border-2 border-green-400 text-green-700 font-medium hover:bg-green-50 transition"
          >
            Resend code
          </button>
        )}

        {/* Cancel */}
        <button
          onClick={onClose}
          className="block w-full text-center mt-3 text-sm text-slate-400 hover:text-slate-600 transition"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

