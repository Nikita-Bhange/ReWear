import express from "express";
import {
  register,
  login,
  logout,
  verifyOtp,
  sendOtp
} from "../controllers/auth.js";
import { protect, adminOnly } from "../middleware/authmiddleware.js";
import { db } from "../connect.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);

// protected route: return full user details from DB
router.get("/me", protect, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Not authenticated" });
    const [rows] = await db.promise().query(
      "SELECT id, username, email, role FROM users WHERE id = ? LIMIT 1",
      [userId]
    );
    if (!rows.length) return res.status(404).json({ message: "User not found" });
    return res.json({ user: rows[0] });
  } catch (err) {
    return res.status(500).json({ message: "DB error", error: err.message });
  }
});

router.get("/admin", protect, adminOnly, (req, res) => {
  res.json({ message: "Welcome Admin" });
});   

// ─── VERIFY OTP ──────────────────────────────────────────────────────────────
router.post("/verifyOtp", verifyOtp)
 

// ─── RESEND OTP ──────────────────────────────────────────────────────────────
router.post("/sendOtp", sendOtp)

router.post("/resendOtp", sendOtp);
export default router;
