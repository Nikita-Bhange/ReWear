
import React from "react"
import { Routes, Route } from "react-router-dom"
import LoginForm from "./Pages/LoginForm"
import Register from "./Pages/Register"
import Home from "./Pages/Home"
import Profile from "./Pages/Profile.jsx"
import CategoryProduct from "./Pages/CategoryProduct.jsx"
import ProductPage from "./Pages/ProductPage.jsx"
import SellProduct from "./Pages/SellProduct.jsx"
import History from "./Pages/History.jsx"
import Payment from "./Pages/Payment.jsx"
import AddToCart from "./Pages/AddToCart.jsx"
import AdminDashboard from "./Pages/AdminDashboard.jsx"
import Aboutus from "./Pages/Aboutus.jsx"


function App() {
  return (
      <Routes>
        <Route  path="/" element={<Register />} />
        <Route path="/register" element={<Register />} />
        <Route path="/register/:role" element={<Register />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/login/:role" element={<LoginForm />} />
        <Route path="/home" element={<Home />} />
        <Route path="/aboutus" element={<Aboutus />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/category/:id" element={<CategoryProduct/>}/>
        <Route path="/product/:id" element={<ProductPage/>}/>
        <Route path="/product" element={<ProductPage/>}/>
        <Route path="/sellproduct" element={<SellProduct/>}/>
        <Route path="/history" element={<History/>}/>
        <Route path="/payment/:productId/:sellerId" element={<Payment/>}/>
        <Route path="/cart" element={<AddToCart/>}/>
      </Routes>
  )
}

export default App