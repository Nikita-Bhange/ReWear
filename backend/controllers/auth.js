import bcrypt from "bcryptjs";
import { db } from "../connect.js";
import { generateToken } from "../utils/generateToken.js";

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

    const [result] = await db.promise().query(
      `INSERT INTO users (username, email, password, role)
       VALUES (?, ?, ?, ?)`,
      [username, email, hashedPassword, userRole]
    );

    return res.status(201).json({
      message: "Registered successfully. Please sign in.",
      user: {
        id: result.insertId,
        username,
        email,
        role: userRole,
      },
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const logout = (req, res) => {
  res.clearCookie("token", { path: "/" }).json({ message: "Logged out" });
};
