import React, { useState, useEffect, useContext } from "react";
import { Delete, Add, Remove, ShoppingBag } from "@mui/icons-material";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { UserContext } from "../Context/User.jsx";

const AddToCart = () => { 
  const { user } = useContext(UserContext);
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
const token = localStorage.getItem("token");
  // Fetch cart items
  const fetchCartItems = async () => {
    if (!user?.id) {
      setCartItems([]);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:8000/api/cart/${user.id}`, {
         headers: {
    Authorization: `Bearer ${token}`,
  },
      });
      const data = response.data;
      if (Array.isArray(data)) {
        setCartItems(data);
      } else {
        setCartItems([]);
      }
    } catch (error) {
      console.error("Error fetching cart:", error);
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteItem = async (cartId) => {
    try {
      const response = await axios.delete(`http://localhost:8000/api/cart/${cartId}`, {
         headers: {
    Authorization: `Bearer ${token}`,
  },
      });
      if (response.status === 200) {
        setCartItems(cartItems.filter(item => item.cart_id !== cartId));
      } else {
        alert("Failed to delete item");
      }
    } catch (error) {
      console.error("Error deleting item:", error);
      alert("An unexpected error occurred while deleting the item.");
    }
  };

  const handleUpdateQuantity = async (cartId, newQuantity) => {
    if (newQuantity < 1) return;

    // Optimistic update
    const updatedItems = cartItems.map(item =>
      item.cart_id === cartId ? { ...item, quantity: newQuantity } : item
    );
    setCartItems(updatedItems);

    try {
      await axios.put(`http://localhost:8000/api/cart/${cartId}`, 
        { quantity: newQuantity },{
        headers: {
    Authorization: `Bearer ${token}`,
  },}
      );
    } catch (error) {
      console.error("Error updating quantity:", error);
      fetchCartItems(); // Refresh on error
    }
  };

  const handleViewProduct = (productId) => {
    navigate(`/product/${productId}`);
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      alert("Your cart is empty!");
      return;
    }
    // Navigate to payment for the first item (or implement multi-item checkout)
    navigate(`/payment/${cartItems[0].p_id}/${cartItems[0].seller_id || 1}`);
  };

  useEffect(() => {
    fetchCartItems();
  }, [user]);

  const totalAmount = cartItems.reduce((sum, item) => sum + (item.amount * (item.quantity || 1)), 0);

  // Parse image from product - handle both string JSON and array from database
  const getImageSrc = (image) => {
    const fallbackImage = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='150' height='150' viewBox='0 0 150 150'%3E%3Crect width='150' height='150' fill='%23e5e7eb'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%239ca3af' font-family='sans-serif' font-size='14'%3ENo Image%3C/text%3E%3C/svg%3E";
    if (!image || image === "" || image === "[]") return fallbackImage;
    try {
      let images;
      if (typeof image === 'string') {
        images = JSON.parse(image);
      } else if (Array.isArray(image)) {
        images = image;
      } else {
        return fallbackImage;
      }
      if (Array.isArray(images) && images.length > 0) {
        return `http://localhost:8000/uploads/${images[0]}`;
      }
      return fallbackImage;
    } catch (error) {
      return fallbackImage;
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen p-10 bg-amber-50 m-10 pt-14 flex justify-center items-center">
          <p className="text-xl text-blue-900">Loading cart...</p>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen p-4 sm:p-10 bg-amber-50 m-4 sm:m-10 pt-14">
        <h1 className="font-bold text-3xl text-blue-900 mb-6 border-b pb-2">
          Shopping Cart ({cartItems.length} items)
        </h1>
        {cartItems.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <ShoppingBag className="text-gray-300 text-6xl mx-auto mb-4" />
            <p className="text-lg text-gray-700 mb-4">Your cart is empty.</p>
            <button 
              onClick={() => navigate("/home")}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2">
              {cartItems.map((item) => (
                <div
                  key={item.cart_id}
                  className="py-4 border-t border-b text-gray-700 grid grid-cols-4 sm:grid-cols-[4fr_2fr_1fr_0.5fr] items-center gap-4 hover:bg-amber-100 transition duration-150"
                >
                  <div className="col-span-4 sm:col-span-1 flex items-start gap-4 cursor-pointer"
                       onClick={() => handleViewProduct(item.p_id)}>
                    <img 
                      className="w-16 sm:w-20 object-cover rounded-lg" 
                      src={getImageSrc(item.image)} 
                      alt={item.product} 
                    />
                    <div className="flex flex-col">
                      <p className="text-sm sm:text-lg font-medium text-blue-800">
                        {item.product}
                      </p>
                      <p className="text-sm font-semibold mt-1">
                        Rs. {item.amount}
                      </p>
                    </div>
                  </div>

                  <div className="col-span-2 sm:col-span-1 flex items-center justify-start sm:justify-center">
                    <button
                      className="p-1 border bg-white hover:bg-gray-100 disabled:opacity-50"
                      onClick={() => handleUpdateQuantity(item.cart_id, (item.quantity || 1) - 1)}
                      disabled={(item.quantity || 1) <= 1}
                    >
                      <Remove fontSize="small" />
                    </button>
                    <span className="px-4 py-1 border-t border-b bg-gray-50 text-base font-semibold">
                      {item.quantity || 1}
                    </span>
                    <button
                      className="p-1 border bg-white hover:bg-gray-100"
                      onClick={() => handleUpdateQuantity(item.cart_id, (item.quantity || 1) + 1)}
                    >
                      <Add fontSize="small" />
                    </button>
                  </div>
                  
                  <div className="col-span-1 text-right text-base font-bold hidden sm:block">
                      Rs. {item.amount * (item.quantity || 1)}
                  </div>

                  <div className="col-span-1 sm:col-span-1 flex justify-end">
                    <Delete
                      className="w-5 cursor-pointer text-red-600 hover:text-red-800 transition duration-150"
                      onClick={() => handleDeleteItem(item.cart_id)}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="lg:col-span-1 bg-white p-6 shadow-lg rounded-lg h-fit sticky top-20">
              <h2 className="text-2xl font-bold text-blue-900 mb-4 border-b pb-2">
                Order Summary
              </h2>
              <div className="flex justify-between text-lg mb-2">
                <span>Subtotal ({cartItems.length} items):</span>
                <span className="font-semibold">Rs. {totalAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg mb-4 text-green-700">
                <span>Shipping:</span>
                <span className="font-semibold">FREE</span>
              </div>
              <div className="flex justify-between text-xl font-extrabold text-blue-900 border-t pt-4">
                <span>Total:</span>
                <span>Rs. {totalAmount.toFixed(2)}</span>
              </div>
              <button 
                onClick={handleCheckout}
                className="mt-6 w-full py-3 bg-green-600 text-white font-bold text-lg rounded-md hover:bg-green-700 transition duration-200"
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
};

export default AddToCart;