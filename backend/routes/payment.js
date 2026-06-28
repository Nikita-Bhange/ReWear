// ── ALL imports must come first in ES modules ──────────────────────────────
import express from "express";
import Razorpay from "razorpay";
import crypto, { verify } from "crypto";
import db from "../connect.js";
import jwt from "jsonwebtoken";
import { protect } from "../middleware/authmiddleware.js";
import dotenv from "dotenv";
dotenv.config();
// ── Router & Razorpay instance ─────────────────────────────────────────────
const router = express.Router();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,       // loaded by dotenv in index.js
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});


// ── POST /api/payment/create-order ─────────────────────────────────────────
// Creates a Razorpay order and inserts a pending payment row in DB
router.post("/create-order", protect, async (req, res) => {
  const userInfo = req.user;
  const { amount, order_id, payment_method } = req.body;

  // ── COD: just save record, no Razorpay order needed ─────────────────────────
  if (payment_method === "cod") {
    try {
      await db.promise().query(
        `INSERT INTO payment (order_id, user_id, amount, payment_method, status, created_at, updated_at)
         VALUES (?, ?, ?, ?, 'pending', NOW(), NOW())`,
        [order_id, userInfo.id, amount, payment_method]
      );
      return res.json({ message: "COD order saved" });
    } catch (err) {
      console.error("COD insert error:", err.message);
      return res.status(500).json({ message: err.message });
    }
  }

  // ── Online Payment: create Razorpay order ───────────────────────────────────
  try {
    const amountInPaise = Math.round(parseFloat(amount) * 100); // 200.00 → 20000

    if (!amountInPaise || amountInPaise <= 0) {
      return res.status(400).json({ error: "Invalid amount" });
    }

    const options = {
      amount: amountInPaise,
      currency: "INR",
      receipt: `receipt_order_${order_id}`,
    };

    const razorpayOrder = await razorpay.orders.create(options);

    await db.promise().query(
      `INSERT INTO payment (order_id, user_id, amount, payment_method, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, 'pending', NOW(), NOW())`,
      [order_id, userInfo.id, amount, payment_method]  // store original decimal in DB
    );

    res.json({
      razorpay_order_id: razorpayOrder.id,
      amount: razorpayOrder.amount,      // in paise — Razorpay needs this
      currency: razorpayOrder.currency,
      key_id: process.env.RAZORPAY_KEY_ID,
    });

  } catch (error) {
    console.error("Create order error:", error.message);
    res.status(500).json({ message: error.message });
  }
});

// ── POST /api/payment/verify ───────────────────────────────────────────────
// Verifies Razorpay signature and updates payment status in DB
router.post("/verify", protect, async (req, res) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    order_id,
    payment_method,
    failed,          // true if frontend is reporting a hard failure
  } = req.body;

  // Handle explicit failure from frontend (card declined etc.)
  if (failed) {
    await db.promise().query(
      `UPDATE payment SET status='failed', updated_at=NOW() WHERE order_id=?`,
      [order_id]
    );
    return res.json({ success: false });
  }

  try {
    // Re-create the signature using your key_secret and compare
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      await db.promise().query(
        `UPDATE payment SET status='failed', updated_at=NOW() WHERE order_id=?`,
        [order_id]
      );
      return res.status(400).json({ message: "Payment verification failed" });
    }

    // Fetch full payment details from Razorpay to store in gateway_response
    const paymentDetails = await razorpay.payments.fetch(razorpay_payment_id);

    await db.promise().query(
      `UPDATE payment
       SET status='success',
           transaction_id=?,
           payment_method=?,
           gateway_response=?,
           updated_at=NOW()
       WHERE order_id=?`,
      [
        razorpay_payment_id,
        payment_method,
        JSON.stringify(paymentDetails),
        order_id,
      ]
    );

    res.json({ success: true, payment_id: razorpay_payment_id });
  } catch (error) {
    console.error("Verify error:", error.message);
    res.status(500).json({ message: error.message });
  }
});

// ── POST /api/payment/webhook ──────────────────────────────────────────────
// Razorpay calls this server-to-server for reliable status updates
router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const signature = req.headers["x-razorpay-signature"];

    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(req.body)           // req.body is raw Buffer here (express.raw)
      .digest("hex");

    if (signature === expectedSignature) {
      const event = JSON.parse(req.body.toString());

      if (event.event === "payment.failed") {
        await db.promise().query(
          `UPDATE payment SET status='failed', updated_at=NOW() WHERE transaction_id=?`,
          [event.payload.payment.entity.id]
        );
      }
    }

    res.json({ status: "ok" });
  }
);

export default router;