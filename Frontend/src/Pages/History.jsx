import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Navbar from "../Components/Navbar.jsx";
import Footer from "../Components/Footer.jsx";
import { UserContext } from "../Context/User.jsx";

const parseImages = (rawImage) => {
  if (!rawImage) return [];
  if (Array.isArray(rawImage)) return rawImage;

  if (typeof rawImage === "string") {
    const trimmed = rawImage.trim();

    if (!trimmed) return [];
    if (!trimmed.startsWith("[")) return [trimmed];

    try {
      const parsed = JSON.parse(trimmed);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.error("Error parsing images:", error);
      return [];
    }
  }

  return [];
};

const History = () => {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("purchased");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `http://localhost:8000/api/order/user/${user?.id}`,
          { withCredentials: true }
        );
        setOrders(response.data.orders || []);
      } catch (error) {
        console.error("Error fetching orders:", error);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      fetchOrders();
    }
  }, [user]);

  const purchasedOrders = orders.filter(order => order.buyer_id === user?.id);
  const soldOrders = orders.filter(order => order.seller_id === user?.id);

  const getStatusColor = (status) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-100 text-yellow-700";
      case "Confirmed":
        return "bg-blue-100 text-blue-700";
      case "Shipped":
        return "bg-purple-100 text-purple-700";
      case "Delivered":
        return "bg-green-100 text-green-700";
      case "Cancelled":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const OrderCard = ({ order, type }) => {
    const images = parseImages(order.image);

    return (
      <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition">
        <div className="flex flex-col md:flex-row">
          {/* Product Image */}
          <div className="md:w-48 h-48 md:h-auto">
            {images.length > 0 ? (
              <img
                src={`http://localhost:8000/uploads/${images[0]}`}
                alt={order.p_name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <span className="text-gray-400">No Image</span>
              </div>
            )}
          </div>

          {/* Order Details */}
          <div className="flex-1 p-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-bold text-gray-800">{order.p_name}</h3>
                <p className="text-sm text-gray-500 mt-1">
                  {type === "purchased" ? "Seller" : "Buyer"}: {" "}
                  {type === "purchased" ? order.seller_name : order.buyer_name}
                </p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                {order.status}
              </span>
            </div>

            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Order ID</p>
                <p className="font-medium">#{order.id}</p>
              </div>
              <div>
                <p className="text-gray-500">Amount</p>
                <p className="font-medium text-blue-600">₹ {order.amount}</p>
              </div>
              <div>
                <p className="text-gray-500">Payment</p>
                <p className="font-medium">{order.payment_method || "N/A"}</p>
              </div>
              <div>
                <p className="text-gray-500">Date</p>
                <p className="font-medium">{new Date(order.date).toLocaleDateString()}</p>
              </div>
            </div>

            <div className="mt-4 flex gap-3">
              <button
                onClick={() => navigate(`/product/${order.p_id}`)}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
              >
                View Details
              </button>
              {order.status === "Delivered" && (
                <button
                  onClick={() => navigate(`/product/${order.p_id}`)}
                  className="px-4 py-2 border border-blue-500 text-blue-500 rounded-lg hover:bg-blue-50 transition"
                >
                  Download Invoice
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-xl text-blue-900">Loading order history...</p>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-100 py-10 px-4">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold text-blue-900 mb-8 text-center">Order History</h1>

          {/* Tabs */}
          <div className="flex gap-4 mb-8">
            <button
              onClick={() => setActiveTab("purchased")}
              className={`px-6 py-3 rounded-lg font-semibold transition ${
                activeTab === "purchased"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              Purchased ({purchasedOrders.length})
            </button>
            <button
              onClick={() => setActiveTab("sold")}
              className={`px-6 py-3 rounded-lg font-semibold transition ${
                activeTab === "sold"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              Sold ({soldOrders.length})
            </button>
          </div>

          {/* Orders List */}
          <div className="space-y-4">
            {activeTab === "purchased" && (
              purchasedOrders.length === 0 ? (
                <div className="bg-white rounded-xl shadow-md p-12 text-center">
                  <p className="text-gray-500 text-lg">No purchased orders yet.</p>
                </div>
              ) : (
                purchasedOrders.map(order => (
                  <OrderCard key={order.id} order={order} type="purchased" />
                ))
              )
            )}

            {activeTab === "sold" && (
              soldOrders.length === 0 ? (
                <div className="bg-white rounded-xl shadow-md p-12 text-center">
                  <p className="text-gray-500 text-lg">No sold orders yet.</p>
                </div>
              ) : (
                soldOrders.map(order => (
                  <OrderCard key={order.id} order={order} type="sold" />
                ))
              )
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default History;
