import moment from "moment";
import db from "../connect.js";
import jwt from "jsonwebtoken";

// Add order details
export const addOrderDetails = async (req, res) => {
    const token = req.cookies?.token || req.headers.authorization?.replace("Bearer ", "");

    if (!token) {
        return res.status(401).json({ error: "Not logged in!" });
    }

    let userInfo;
    try {
        userInfo = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
        return res.status(401).json({ error: "Invalid token!" });
    }

    try {
        const pid = Number(req.params.p_id);
        const userId = userInfo.id;
        const paymentMethod = req.body.payment_method || "cod";

        if (!Number.isInteger(pid) || pid < 1) {
            return res.status(400).json({ error: "Invalid product id" });
        }

        const [products] = await db.promise().query(
            `SELECT id, seller_id, price, status FROM product WHERE id = ? LIMIT 1`,
            [pid]
        );

        if (products.length === 0) {
            return res.status(404).json({ error: "Product not found" });
        }

        const product = products[0];

        if (product.status === "sold") {
            return res.status(400).json({ error: "Product is already sold" });
        }

        if (Number(product.seller_id) === Number(userId)) {
            return res.status(400).json({ error: "You cannot buy your own product" });
        }

        const query = `
            INSERT INTO order_detail
                (seller_id, buyer_id, p_id, status, payment_method, amount, date)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        const values = [
            product.seller_id,
            userId,
            pid,
            "Pending",
            paymentMethod,
            product.price,
            moment().format("YYYY-MM-DD"),
        ];

        const [insertResult] = await db.promise().query(query, values);

        res.status(200).json({
            message: "Product ordered successfully!",
            orderId: insertResult.insertId,
        });
    } catch (error) {
        console.error("Add order error:", error);
        res.status(500).json({
            error: "Database operation failed",
            details: error.message,
        });
    }
};

// Get user orders (both purchased and sold)
export const getUserOrders = async (req, res) => {
    try {
        const { userId } = req.params;

        const q = `SELECT 
            o.*,
            p.p_name,
            p.image,
            p.category,
            seller.username as seller_name,
            buyer.username as buyer_name
        FROM order_detail o
        JOIN product p ON o.p_id = p.id
        JOIN users seller ON o.seller_id = seller.id
        JOIN users buyer ON o.buyer_id = buyer.id
        WHERE o.buyer_id = ? OR o.seller_id = ?
        ORDER BY o.created_at DESC`;

        db.query(q, [userId, userId], (err, result) => {
            if (err) {
                console.error("Database Error:", err);
                return res.status(500).json({ error: "Database error" });
            }
            res.status(200).json({ orders: result });
        });
    } catch (error) {
        console.error("Server Error:", error);
        res.status(500).json({ error: "Server error" });
    }
};

// Update order status
export const updateOrderStatus = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { status } = req.body;

        const validStatuses = ["Pending", "Confirmed", "Shipped", "Delivered", "Cancelled"];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ error: "Invalid status" });
        }

        const q = "UPDATE order_detail SET status = ? WHERE id = ?";
        db.query(q, [status, orderId], (err, result) => {
            if (err) {
                console.error("Database Error:", err);
                return res.status(500).json({ error: "Database error" });
            }
            if (result.affectedRows === 0) {
                return res.status(404).json({ error: "Order not found" });
            }
            res.status(200).json({ message: "Order status updated successfully" });
        });
    } catch (error) {
        console.error("Server Error:", error);
        res.status(500).json({ error: "Server error" });
    }
};
