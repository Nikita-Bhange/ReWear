import bcrypt from "bcryptjs";
import { db } from "../connect.js";
import { generateToken } from "../utils/generateToken.js";
import {sendMail} from "../sendMail.js"

const normalizeEmail = (email = "") => email.trim().toLowerCase();
const normalizeName = (value = "") => value.trim();

export const login = async (req, res) => {
  try {
    const email = normalizeEmail(req.body?.email);
    const password = req.body?.password;
    const role = req.body?.role;

    if (!email || !password || !role) {
      return res.status(400).json({ message: "Email, password, and role are required" });
    }
     
    //if we export db.promise() in db function when we can use
    const [users] = await db.promise().query(
      "SELECT * FROM users WHERE email = ? LIMIT 1",
      [email]
    );

    if (!users.length) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const user = users[0];

    if (user.role !== role) {
      return res.status(403).json({
        message: `This account is registered as a ${user.role}. Please use the ${user.role} login.`,
        code: "ROLE_MISMATCH",
        expectedRole: user.role,
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = generateToken(user);

    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({
      message: "Login successful",
      user: {
        id: user.id,
        token,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};



// ─── VERIFY OTP ──────────────────────────────────────────────────────────────
export const verifyOtp = (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json("Email and OTP are required");
  }

  const query = "SELECT * FROM users WHERE email=?";

  db.query(query, [email], (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).json("Database error");
    }

    if (data.length === 0) {
      return res.status(404).json("User not found");
    }

    const user = data[0];

    if (user.is_verified) {
      return res.status(400).json("User already verified");
    }

    if (user.otp !== otp) {
      return res.status(400).json("Invalid OTP");
    }

    if (new Date() > new Date(user.otp_expires_at)) {
      return res.status(400).json("OTP has expired");
    }

    const updateQuery =
      "UPDATE users SET is_verified=1, otp=NULL, otp_expires_at=NULL WHERE email=?";

    db.query(updateQuery, [email], (err) => {
      if (err) {
        console.error(err);
        return res.status(500).json("Failed to verify user");
      }
      return res.status(200).json("Email verified successfully");
    });
  });
}

// ─── RESEND OTP ──────────────────────────────────────────────────────────────
export const sendOtp =  async (req, res) => {
  const { email } = req.body;

  if (!email) return res.status(400).json("Email is required");

  const query = "SELECT * FROM users WHERE email=?";

  db.query(query, [email], async (err, data) => {
    if (err) return res.status(500).json("Database error");
    if (data.length === 0) return res.status(404).json("User not found");
    if (data[0].is_verified) return res.status(400).json("User already verified");

    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000);

    const updateQuery =
      "UPDATE users SET otp=?, otp_expires_at=? WHERE email=?";

    db.query(updateQuery, [generatedOtp, otpExpiresAt, email], async (err) => {
      if (err) return res.status(500).json("Failed to update OTP");

      try {
        await sendMail(email, "OTP Verification", `Your OTP is: ${generatedOtp}`);
        return res.status(200).json({ message: "OTP resent", email });
      } catch {
        return res.status(500).json("Failed to send OTP email");
      }
    });
  });
}
export const register = async (req, res) => {
  try {
    const username = normalizeName(req.body?.username);
    const email = normalizeEmail(req.body?.email);
    const password = req.body?.password;
    const role = req.body?.role;
    const userRole = role === "admin" ? "admin" : "user";

    if (!username || !email || !password) {
      return res.status(400).json({ message: "Please provide name, email, and password" });
    }

    const [existing] = await db.promise().query(
      "SELECT id FROM users WHERE email = ? LIMIT 1",
      [email]
    );

    if (existing.length) {
      return res.status(400).json({
        message: "This email is already registered. Please sign in instead.",
        code: "EMAIL_ALREADY_REGISTERED",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000);

    // FIX: no callback — use the returned result directly
    const [result] = await db.promise().query(
      `INSERT INTO users (username, email, password, role, otp, otp_expires_at, is_verified)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [username, email, hashedPassword, userRole, generatedOtp, otpExpiresAt, 0]
    );

    // FIX: send email after await, not inside a callback
    try {
      await sendMail(
        email,
        "OTP Verification",
        `Your OTP is: ${generatedOtp}`
      );
    } catch (emailError) {
      console.error("Failed to send OTP email:", emailError);
      // User is created but email failed — still return 201 so frontend can handle it
      return res.status(201).json({
        message: "Registered but failed to send OTP. Please use resend OTP.",
        email,
      });
    }

    return res.status(201).json({
      message: "OTP sent to email. Please verify.",
      email,
      user: {
        id: result.insertId,
        username,
        email,
        role: userRole,
      },
    });

  } catch (err) {
    console.error("Register error:", err);
    return res.status(500).json({ error: err.message });
  }
};
export const logout = (req, res) => {
  res.clearCookie("token", {
    path: "/",
    httpOnly: true,
    secure: false,
    sameSite: "lax",
  }).json({ message: "Logged out" });
};
