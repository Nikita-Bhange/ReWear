import "dotenv/config";
import express from "express"
import cors from 'cors'
import {db} from "./connect.js"
import authRoutes from "./routes/authRoute.js";
import cartRoutes from "./routes/cartRoutes.js";
import postRoutes from "./routes/postRoutes.js"
import productRoutes from "./routes/productRoutes.js"
import orderRoutes from "./routes/orderRoutes.js"
import categoryRoutes from "./routes/categoryRoutes.js"
import adminRoutes from "./routes/adminRoutes.js"
import paymentRoutes from "./routes/payment.js"
import cookieParser from "cookie-parser";
import profileRoute from "./routes/profileRoute.js";

const app = express()
app.use(express.json())
app.use(cookieParser())


app.use(cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
}))
// app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static("uploads"));


// app.use('/user', userRoutes);

app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoute);
app.use('/api/category', categoryRoutes);
app.use('/api/cart',cartRoutes)
app.use('/api/post',postRoutes)
app.use('/api/product',productRoutes)
app.use('/api/order',orderRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/payment', paymentRoutes)
// app.use("/api/order", historyRoutes)


app.get('/', (req, res) => {
    res.send('Server is alive!');
});

app.listen(8000, () => console.log("Server running on port 8000"));
