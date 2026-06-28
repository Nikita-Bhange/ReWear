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

// Verify admin middleware
const verifyAdmin = async (req, res, next) => {
  try {
    const token = getTokenFromRequest(req);
    if (!token) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    const userInfo = jwt.verify(token, process.env.JWT_SECRET);
    if (userInfo.role !== "admin") {
      return res.status(403).json({ error: "Access denied. Admin only." });
    }
    req.user = userInfo;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid token" });
  }
};

// Get dashboard stats
export const getDashboardStats = async (req, res) => {
  try {
    const token = getTokenFromRequest(req);
    if (!token) return res.status(401).json({ error: "Not authenticated" });
    const userInfo = jwt.verify(token, process.env.JWT_SECRET);
    if (userInfo.role !== "admin") return res.status(403).json({ error: "Access denied" });

    // Get stats
    const [users] = await db.promise().query("SELECT COUNT(*) as count FROM users WHERE role = 'user'");
    const [products] = await db.promise().query("SELECT COUNT(*) as count FROM product");
    const [soldProducts] = await db.promise().query("SELECT COUNT(*) as count FROM product WHERE status = 'sold'");
    const [pendingOrders] = await db.promise().query("SELECT COUNT(*) as count FROM order_detail WHERE status = 'Pending'");
    const [revenue] = await db.promise().query("SELECT SUM(amount) as total FROM order_detail WHERE status = 'Delivered'");
    const [activeSellers] = await db.promise().query("SELECT COUNT(DISTINCT seller_id) as count FROM product");
    const [reports] = await db.promise().query("SELECT COUNT(*) as count FROM user_reports WHERE status = 'pending'");

    res.json({
      totalUsers: users[0].count,
      totalProducts: products[0].count,
      soldProducts: soldProducts[0].count,
      pendingOrders: pendingOrders[0].count,
      revenue: revenue[0].total || 0,
      activeSellers: activeSellers[0].count,
      reports: reports[0].count,
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Get all users
export const getAllUsers = async (req, res) => {
  try {
    const token = getTokenFromRequest(req);
    if (!token) return res.status(401).json({ error: "Not authenticated" });
    const userInfo = jwt.verify(token, process.env.JWT_SECRET);
    if (userInfo.role !== "admin") return res.status(403).json({ error: "Access denied" });

    const [users] = await db.promise().query(
      "SELECT id, username, email, role, created_at FROM users ORDER BY created_at DESC"
    );
    res.json({ users });
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Get all products (admin)
export const getAllProducts = async (req, res) => {
  try {
    const token = getTokenFromRequest(req);
    if (!token) return res.status(401).json({ error: "Not authenticated" });
    const userInfo = jwt.verify(token, process.env.JWT_SECRET);
    if (userInfo.role !== "admin") return res.status(403).json({ error: "Access denied" });

    const [products] = await db.promise().query(
      `SELECT p.*, u.username as seller_name 
       FROM product p 
       JOIN users u ON p.seller_id = u.id 
       ORDER BY p.created_at DESC`
    );
    res.json({ products });
  } catch (error) {
    console.error("Get products error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Get all orders (admin)
export const getAllOrders = async (req, res) => {
  try {
    const token = getTokenFromRequest(req);
    if (!token) return res.status(401).json({ error: "Not authenticated" });
    const userInfo = jwt.verify(token, process.env.JWT_SECRET);
    if (userInfo.role !== "admin") return res.status(403).json({ error: "Access denied" });

    const [orders] = await db.promise().query(
      `SELECT o.*, p.p_name, seller.username as seller_name, buyer.username as buyer_name
       FROM order_detail o
       JOIN product p ON o.p_id = p.id
       JOIN users seller ON o.seller_id = seller.id
       JOIN users buyer ON o.buyer_id = buyer.id
       ORDER BY o.created_at DESC`
    );
    res.json({ orders });
  } catch (error) {
    console.error("Get orders error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Block/Unblock user
export const toggleUserBlock = async (req, res) => {
  try {
    const token = getTokenFromRequest(req);
    if (!token) return res.status(401).json({ error: "Not authenticated" });
    const userInfo = jwt.verify(token, process.env.JWT_SECRET);
    if (userInfo.role !== "admin") return res.status(403).json({ error: "Access denied" });

    const { userId } = req.params;
    const { action } = req.body; // 'block' or 'unblock'

    // For now, we'll just log the action since we don't have a blocked column
    // You can add a 'status' column to users table to implement this fully
    console.log(`Admin ${userInfo.id} ${action}ed user ${userId}`);

    res.json({ message: `User ${action}ed successfully` });
  } catch (error) {
    console.error("Toggle user block error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Delete product (admin)
export const deleteProduct = async (req, res) => {
  try {
    const token = getTokenFromRequest(req);
    if (!token) return res.status(401).json({ error: "Not authenticated" });
    const userInfo = jwt.verify(token, process.env.JWT_SECRET);
    if (userInfo.role !== "admin") return res.status(403).json({ error: "Access denied" });

    const { productId } = req.params;

    await db.promise().query("DELETE FROM order_detail WHERE p_id = ?", [productId]);
    await db.promise().query("DELETE FROM product WHERE id = ?", [productId]);

    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Delete product error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Get reports
export const getReports = async (req, res) => {
  try {
    const token = getTokenFromRequest(req);
    if (!token) return res.status(401).json({ error: "Not authenticated" });
    const userInfo = jwt.verify(token, process.env.JWT_SECRET);
    if (userInfo.role !== "admin") return res.status(403).json({ error: "Access denied" });

    const [reports] = await db.promise().query(
      `SELECT r.*, 
              reporter.username as reporter_name, 
              reported.username as reported_name
       FROM user_reports r
       JOIN users reporter ON r.reporter_id = reporter.id
       JOIN users reported ON r.reported_id = reported.id
       ORDER BY r.created_at DESC`
    );
    res.json({ reports });
  } catch (error) {
    console.error("Get reports error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Update report status
export const updateReportStatus = async (req, res) => {
  try {
    const token = getTokenFromRequest(req);
    if (!token) return res.status(401).json({ error: "Not authenticated" });
    const userInfo = jwt.verify(token, process.env.JWT_SECRET);
    if (userInfo.role !== "admin") return res.status(403).json({ error: "Access denied" });

    const { reportId } = req.params;
    const { status, adminNotes } = req.body;

    await db.promise().query(
      "UPDATE user_reports SET status = ?, admin_notes = ? WHERE id = ?",
      [status, adminNotes, reportId]
    );

    res.json({ message: "Report updated successfully" });
  } catch (error) {
    console.error("Update report error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Get payment transactions
export const getPaymentTransactions = async (req, res) => {
  try {
    const token = getTokenFromRequest(req);
    if (!token) return res.status(401).json({ error: "Not authenticated" });
    const userInfo = jwt.verify(token, process.env.JWT_SECRET);
    if (userInfo.role !== "admin") return res.status(403).json({ error: "Access denied" });

    const [transactions] = await db.promise().query(
      `SELECT pt.*, u.username, o.p_id
       FROM payment_transactions pt
       JOIN users u ON pt.user_id = u.id
       LEFT JOIN order_detail o ON pt.order_id = o.id
       ORDER BY pt.created_at DESC`
    );
    res.json({ transactions });
  } catch (error) {
    console.error("Get transactions error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Get seller payouts
export const getSellerPayouts = async (req, res) => {
  try {
    const token = getTokenFromRequest(req);
    if (!token) return res.status(401).json({ error: "Not authenticated" });
    const userInfo = jwt.verify(token, process.env.JWT_SECRET);
    if (userInfo.role !== "admin") return res.status(403).json({ error: "Access denied" });

    const [payouts] = await db.promise().query(
      `SELECT sp.*, u.username as seller_name
       FROM seller_payouts sp
       JOIN users u ON sp.seller_id = u.id
       ORDER BY sp.created_at DESC`
    );
    res.json({ payouts });
  } catch (error) {
    console.error("Get payouts error:", error);
    res.status(500).json({ error: "Server error" });
  }
};