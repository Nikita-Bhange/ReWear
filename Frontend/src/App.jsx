
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
import ProtectedRoute from "./Components/ProtectedRoute.jsx"


function App() {
  return (
      <Routes>
        <Route  path="/" element={<Register />} />
        <Route path="/register" element={<Register />} />
        <Route path="/register/:role" element={<Register />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/login/:role" element={<LoginForm />} />
        <Route path="/home" element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        } />
        <Route path="/aboutus" element={
          <ProtectedRoute>
            <Aboutus />
          </ProtectedRoute>
        } />
        
        {/* Protected Admin Routes */}
        <Route path="/admin/dashboard" element={
          <ProtectedRoute adminOnly>
            <AdminDashboard />
          </ProtectedRoute>
        } />
        
        {/* Protected User Routes */}
        <Route path="/profile" element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } />
        <Route path="/category/:id" element={
          <ProtectedRoute>
            <CategoryProduct />
          </ProtectedRoute>
        }/>
        <Route path="/product/:id" element={
          <ProtectedRoute>
            <ProductPage />
          </ProtectedRoute>
        }/>
        <Route path="/product" element={
          <ProtectedRoute>
            <ProductPage />
          </ProtectedRoute>
        }/>
        <Route path="/sellproduct" element={
          <ProtectedRoute>
            <SellProduct/>
          </ProtectedRoute>
        }/>
        <Route path="/history" element={
          <ProtectedRoute>
            <History/>
          </ProtectedRoute>
        }/>
        <Route path="/payment/:productId/:sellerId" element={
          <ProtectedRoute>
            <Payment/>
          </ProtectedRoute>
        }/>
        <Route path="/cart" element={
          <ProtectedRoute>
            <AddToCart/>
          </ProtectedRoute>
        }/>
      </Routes>
  )
}

export default App