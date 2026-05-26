import express from "express";
import { addOrderDetails, getUserOrders, updateOrderStatus } from "../controllers/order_detail.js";
import { createInvoice, getInvoice, getUserInvoices } from "../controllers/invoiceController.js";
const router = express.Router();

// Invoice routes
router.post("/invoice", createInvoice);
router.get("/invoice/:orderId", getInvoice);
router.get("/invoices/user", getUserInvoices);

// Order routes
router.post("/:p_id", addOrderDetails);
router.get("/user/:userId", getUserOrders);
router.put("/status/:orderId", updateOrderStatus);

export default router;
