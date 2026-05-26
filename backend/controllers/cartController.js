import db from "../connect.js";
import jwt from "jsonwebtoken";

// Get token from request
const getTokenFromRequest = (req) => {
    if (req.cookies && req.cookies.token) return req.cookies.token;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
        return authHeader.replace("Bearer ", "").trim();
    }
    return null;
};

// Add product to cart
export const addToCart = async (req, res) => {
    const token = getTokenFromRequest(req);
    if (!token) {
        return res.status(401).json({ error: "Not logged in!" });
    }

    try {
        const userInfo = jwt.verify(token, process.env.JWT_SECRET);
        const p_id = Number(req.params.pid);
        const userId = userInfo.id;

        if (!Number.isInteger(p_id) || p_id < 1) {
            return res.status(400).json({ error: "Invalid product id" });
        }

        const [results] = await db.promise().query(
            "SELECT id FROM cart WHERE p_id = ? AND u_id = ?",
            [p_id, userId]
        );

        if (results.length > 0) {
            return res.status(400).json({ error: "Product already in cart" });
        }

        await db.promise().query("INSERT INTO cart (p_id, u_id) VALUES (?, ?)", [p_id, userId]);
        res.status(200).json({ message: "Product has been added to cart successfully!" });
    } catch (error) {
        console.error("Add to cart error:", error);
        if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
            return res.status(401).json({ error: "Invalid token!" });
        }
        res.status(500).json({ error: "Database error" });
    }
};

// Get user's cart items
export const getUserCart = async (req, res) => {
    try {
        const parsedUserId = Number(req.params.userId);

        if (!Number.isInteger(parsedUserId) || parsedUserId < 1) {
            return res.status(400).json({ message: "Invalid user id." });
        }

        const query = `
            SELECT 
                c.id AS cart_id, 
                c.p_id, 
                c.quantity, 
                p.p_name AS product, 
                p.price AS amount, 
                p.image,
                p.seller_id
            FROM 
                cart c
            JOIN 
                product p ON c.p_id = p.id
            WHERE 
                c.u_id = ?
        `;
        const [results] = await db.promise().query(query, [parsedUserId]);
        res.status(200).json(results);
    } catch (error) {
        console.error("Database Error (getCartItems):", error);
        res.status(500).json({ message: "Failed to fetch cart items." });
    }
};

// Update cart item quantity
export const updateCart = async (req, res) => {
    try {
        const { cartId } = req.params;
        const { quantity } = req.body;

        if (!quantity || quantity < 1) {
            return res.status(400).json({ error: "Invalid quantity" });
        }

        const q = "UPDATE cart SET quantity = ? WHERE id = ?";
        const [result] = await db.promise().query(q, [quantity, cartId]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Cart item not found" });
        }
        res.status(200).json({ message: "Cart updated successfully" });
    } catch (error) {
        console.error("Server Error:", error);
        res.status(500).json({ error: "Server error" });
    }
};

// Delete cart item
export const deleteCartItem = async (req, res) => {
    try {
        const { cartId } = req.params;

        const q = "DELETE FROM cart WHERE id = ?";
        const [result] = await db.promise().query(q, [cartId]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Cart item not found." });
        }
        res.status(200).json({ message: "Cart item deleted successfully." });
    } catch (error) {
        console.error("Server Error:", error);
        res.status(500).json({ message: "Server error" });
    }
};
