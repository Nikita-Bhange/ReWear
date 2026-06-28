import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../Components/Navbar.jsx";
import Footer from "../Components/Footer.jsx";
import { UserContext } from "../Context/User.jsx";

// ─── Razorpay Script Loader ───────────────────────────────────────────────────
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (document.getElementById("razorpay-script")) return resolve(true);
    const script = document.createElement("script");
    script.id = "razorpay-script";
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const parseImages = (rawImage) => {
  if (!rawImage) return [];
  if (Array.isArray(rawImage)) return rawImage;

  if (typeof rawImage === "string") {
    const trimmed = rawImage.trim();

    if (!trimmed) return [];

    if (!trimmed.startsWith("[")) {
      return [trimmed];
    }

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

const Payment = () => {
  const { productId, sellerId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(UserContext);

  const [product, setProduct] = useState({});
  const [seller, setSeller] = useState({});
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [address, setAddress] = useState({
    address: "",
    city: "",
    pincode: "",
    state: "",
    contact: "",
  });

  // ─── Fetch Data ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8000/api/product/${productId}`
        );
        if (response.data.product && response.data.product.length > 0) {
          setProduct(response.data.product[0]);
        }
      } catch (error) {
        console.error("Error fetching product details:", error);
      }
    };

    const fetchSellerDetails = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8000/api/profile/address/${sellerId}`,
          { withCredentials: true }
        );
        if (response.data.address) {
          setSeller(response.data.address);
        }
      } catch (error) {
        console.error("Error fetching seller address:", error);
      }
    };

    const fetchUserAddress = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8000/api/profile/address/${user?.id}`,
          { withCredentials: true }
        );
        if (response.data.address) {
          setAddress(response.data.address);
        }
      } catch (error) {
        console.error("Error fetching user address:", error);
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchProductDetails();
      fetchSellerDetails();
      fetchUserAddress();
    }
  }, [productId, sellerId, user]);

  // ─── Invoice Helper ──────────────────────────────────────────────────────────
  const generateInvoice = async (orderId) => {
    await axios.post(
      "http://localhost:8000/api/order/invoice",
      {
        order_id: orderId,
        buyer_name: user?.username,
        buyer_email: user?.email,
        buyer_address: `${address.address}, ${address.city}, ${address.state} - ${address.pincode}`,
        product_name: product.p_name,
        amount: product.price,
        payment_method: paymentMethod,
      },
      { withCredentials: true }
    );
  };

  // ─── Main Payment Handler ────────────────────────────────────────────────────
  const handlePayment = async (e) => {
    e.preventDefault();
    setProcessing(true);

    try {
      // Step 1: Create your app's order in DB
      const orderResponse = await axios.post(
        `http://localhost:8000/api/order/${productId}`,
        {
          seller_id: sellerId,
          payment_method: paymentMethod,
          amount: product.price,
        },
        { withCredentials: true }
      );

      const { orderId } = orderResponse.data;

      // ── COD: No Razorpay needed ──────────────────────────────────────────────
      if (paymentMethod === "cod") {
        // Save pending payment record
        await axios.post(
          "http://localhost:8000/api/payment/create-order",
          {
            amount: product.price,
            order_id: orderId,
            payment_method: "cod",
          },
          { withCredentials: true }
        );

        // Mark product as sold
        await axios.put(
          `http://localhost:8000/api/post/update/${productId}`,
          { ...product, status: "sold" },
          { withCredentials: true }
        );

        await generateInvoice(orderId);
        alert("Order placed! Pay on delivery.");
        navigate("/history");
        return;
      }

      // ── Online Payment: UPI / Card / Net Banking via Razorpay ────────────────

      // Step 2: Load Razorpay checkout script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        alert("Failed to load payment gateway. Check your internet connection.");
        setProcessing(false);
        return;
      }

      // Step 3: Ask backend to create a Razorpay order
      const razorpayOrderRes = await axios.post(
        "http://localhost:8000/api/payment/create-order",
        {
          amount: product.price,
          order_id: orderId,
          payment_method: paymentMethod,
        },
        { withCredentials: true }
      );

      const { razorpay_order_id, amount, currency, key_id } =
        razorpayOrderRes.data;

      // Step 4: Open Razorpay checkout popup
      const options = {
        key: key_id,                  // key_id from backend (never hardcode here)
        amount,                        // in paise
        currency,
        name: "Your App Name",
        description: product.p_name,
        order_id: razorpay_order_id,
        prefill: {
          name: user?.username,
          email: user?.email,
          contact: address.contact,
        },
        theme: { color: "#0ea5e9" },

        // Step 5: Razorpay calls this on successful payment
        handler: async (response) => {
          try {
            // Verify the payment signature on backend
            const verifyRes = await axios.post(
              "http://localhost:8000/api/payment/verify",
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                order_id: orderId,
                payment_method: paymentMethod,
              },
              { withCredentials: true }
            );

            if (verifyRes.data.success) {
              // Mark product as sold
              await axios.put(
                `http://localhost:8000/api/post/update/${productId}`,
                { ...product, status: "sold" },
                { withCredentials: true }
              );
              await generateInvoice(orderId);
              alert("Payment successful! Order placed.");
              navigate("/history");
            }
          } catch (err) {
            console.error("Verification error:", err);
            alert("Payment verification failed. Please contact support.");
          } finally {
            setProcessing(false);
          }
        },

        // User closed the popup without paying
        modal: {
          ondismiss: () => {
            alert("Payment cancelled.");
            setProcessing(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);

      // Step 6: Handle hard payment failure (card declined, etc.)
      rzp.on("payment.failed", async (response) => {
        console.error("Payment failed:", response.error);
        try {
          await axios.post(
            "http://localhost:8000/api/payment/verify",
            { order_id: orderId, failed: true },
            { withCredentials: true }
          );
        } catch (_) {}
        alert(`Payment failed: ${response.error.description}`);
        setProcessing(false);
      });

      rzp.open();

    } catch (error) {
      console.error("Payment error:", error);
      if (error.response?.status === 401) {
        alert("Please login to continue");
        navigate("/login");
      } else {
        alert(error.response?.data?.message || "Something went wrong. Please try again.");
      }
      setProcessing(false);
    }
  };

  // ─── Image Parse ─────────────────────────────────────────────────────────────
  const images = parseImages(product.image);
  // ─── Loading State ────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-xl text-blue-900">Loading...</p>
        </div>
        <Footer />
      </>
    );
  }

  // ─── Render ───────────────────────────────────────────────────────────────────
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-100 py-10 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-blue-900 mb-8 text-center">
            Payment
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* ── Left Column ── */}
            <div className="lg:col-span-2 space-y-6">

              {/* Product Details */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">
                  Product Details
                </h2>
                <div className="flex gap-6">
                  {images.length > 0 && (
                    <img
                      src={`http://localhost:8000/uploads/${images[0]}`}
                      alt={product.p_name}
                      className="w-32 h-32 object-cover rounded-lg"
                    />
                  )}
                  <div>
                    <h3 className="text-lg font-semibold">{product.p_name}</h3>
                    <p className="text-gray-600 mt-1">{product.p_desc}</p>
                    <p className="text-sm text-gray-500 mt-2">
                      Category: {product.category}
                    </p>
                    <p className="text-sm text-gray-500">
                      Used Duration: {product.used_duration}
                    </p>
                  </div>
                </div>
              </div>

              {/* Delivery Address */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">
                  Delivery Address
                </h2>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address
                    </label>
                    <input
                      type="text"
                      value={address.address || ""}
                      onChange={(e) =>
                        setAddress({ ...address, address: e.target.value })
                      }
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
                      placeholder="Enter your address"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        City
                      </label>
                      <input
                        type="text"
                        value={address.city || ""}
                        onChange={(e) =>
                          setAddress({ ...address, city: e.target.value })
                        }
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
                        placeholder="City"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Pincode
                      </label>
                      <input
                        type="text"
                        value={address.pincode || ""}
                        onChange={(e) =>
                          setAddress({ ...address, pincode: e.target.value })
                        }
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
                        placeholder="Pincode"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        State
                      </label>
                      <input
                        type="text"
                        value={address.state || ""}
                        onChange={(e) =>
                          setAddress({ ...address, state: e.target.value })
                        }
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
                        placeholder="State"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Contact
                      </label>
                      <input
                        type="text"
                        value={address.contact || ""}
                        onChange={(e) =>
                          setAddress({ ...address, contact: e.target.value })
                        }
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
                        placeholder="Contact Number"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">
                  Payment Method
                </h2>
                <div className="space-y-3">
                  {/* COD */}
                  <label className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="payment"
                      value="cod"
                      checked={paymentMethod === "cod"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-5 h-5"
                    />
                    <div>
                      <p className="font-medium">Cash on Delivery</p>
                      <p className="text-sm text-gray-500">
                        Pay when you receive the product
                      </p>
                    </div>
                  </label>

                  {/* UPI */}
                  <label className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="payment"
                      value="upi"
                      checked={paymentMethod === "upi"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-5 h-5"
                    />
                    <div>
                      <p className="font-medium">UPI Payment</p>
                      <p className="text-sm text-gray-500">
                        Pay using UPI app — powered by Razorpay
                      </p>
                    </div>
                  </label>

                  {/* Card */}
                  <label className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="payment"
                      value="card"
                      checked={paymentMethod === "card"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-5 h-5"
                    />
                    <div>
                      <p className="font-medium">Credit / Debit Card</p>
                      <p className="text-sm text-gray-500">
                        Pay using your card — powered by Razorpay
                      </p>
                    </div>
                  </label>

                  {/* Net Banking */}
                  <label className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="payment"
                      value="net_banking"
                      checked={paymentMethod === "net_banking"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-5 h-5"
                    />
                    <div>
                      <p className="font-medium">Net Banking</p>
                      <p className="text-sm text-gray-500">
                        Pay via your bank — powered by Razorpay
                      </p>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* ── Right Column: Order Summary ── */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-lg p-6 sticky top-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">
                  Order Summary
                </h2>
                <div className="space-y-3 border-b pb-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Product Price</span>
                    <span className="font-medium">₹ {product.price}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Delivery</span>
                    <span className="font-medium text-green-600">FREE</span>
                  </div>
                </div>
                <div className="flex justify-between pt-4 text-xl font-bold">
                  <span>Total</span>
                  <span className="text-blue-600">₹ {product.price}</span>
                </div>

                {/* Info banner for online payments */}
                {paymentMethod !== "cod" && (
                  <p className="mt-4 text-xs text-gray-400 text-center">
                    Razorpay secure checkout will open next. Test mode works here too
                    when your backend test keys are configured.
                  </p>
                )}

                <button
                  onClick={handlePayment}
                  disabled={processing}
                  className="w-full mt-6 bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-4 rounded-xl font-semibold text-lg hover:scale-[1.01] transition-all disabled:opacity-50"
                >
                  {processing
                    ? "Processing..."
                    : paymentMethod === "cod"
                    ? "Place Order"
                    : "Pay Now"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Payment;
