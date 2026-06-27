import React, { useState, useEffect } from "react";
import { useParams, useLocation, Link } from "react-router-dom";
import axios from "axios";
import { ShoppingCartOutlined } from "@mui/icons-material";
import ImageSlider from "../Components/ImageSlider";
import Navbar from "../Components/Navbar.jsx";

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

const ProductPage = () => {
  const [product, setProduct] = useState({});
  const { id } = useParams();
  const location = useLocation();
  const productId = id || location.state?.productId;
  const [seller, setSeller] = useState({});
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    const getProduct = async () => {
      if (!productId) return;
      try {
        const response = await axios.get(`http://localhost:8000/api/product/${productId}`);
        if (response.data.product && response.data.product.length > 0) {
          setProduct(response.data.product[0]);
          console.log("Fetched Product:", response.data.product[0]);
        }
      } catch (error) {
        console.log("Error fetching product:", error);
      }
    };

    getProduct();
  }, [productId]);

  useEffect(() => {
    if (product.seller_id) {
      setSeller({
        address: `Seller ID: ${product.seller_id}`,
        contact: "Contact seller for details",
      });
    }
  }, [product.seller_id]);

  const images = parseImages(product.image).filter(
    (img) => typeof img === "string" && img.trim() !== ""
  );

  return (
    <>
      <Navbar />
      {showPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="relative w-[350px] rounded-2xl bg-white p-8 text-center shadow-xl">
            <button
              onClick={() => setShowPopup(false)}
              className="absolute right-4 top-3 text-xl"
            >
              x
            </button>
            <h2 className="mb-4 text-2xl font-bold text-red-500">Login Required</h2>
            <p className="text-gray-600">Please login to continue.</p>
          </div>
        </div>
      )}
      <div className="min-h-screen bg-gray-100">
        <div className="mx-auto max-w-7xl px-4 py-6">
          <div className="flex flex-col gap-6 lg:flex-row">
            <div className="lg:w-2/3">
              <ImageSlider images={images} />
            </div>

            <div className="lg:w-1/3">
              <div className="sticky top-6 rounded bg-white p-6 shadow">
                <span className="text-xs font-semibold text-green-600">
                  {product.category || "PRODUCT"} • {product.used_duration || "N/A"}
                </span>

                <h1 className="mt-1 text-xl font-bold">{product.p_name}</h1>

                <p className="mt-1 text-sm text-gray-500">
                  {seller.address || seller.city || "Seller location not available"} • Posted{" "}
                 
                 { new Date(product.posting_date).toLocaleDateString("en-IN") || "Recently"}
                </p>

                <p className="mt-4 text-3xl font-bold text-blue-600">
                  Rs. {product.price || "0.00"}
                </p>

                <div className="mt-4 flex gap-3">
                  <button className="flex-1 rounded bg-teal-500 py-2 font-semibold text-white">
                    CALL
                  </button>
                  <button className="flex-1 rounded border border-blue-600 py-2 font-semibold text-blue-600">
                    CHAT
                  </button>
                </div>

                <div className="mt-6 grid grid-cols-3 text-center text-sm text-gray-600">
                  
                  <p>Schedule a visit</p>
                  <p>Negotiate price</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 rounded bg-white p-6 shadow">
            <div className="mb-6 flex border-b">
              <button className="border-b-2 border-blue-600 pb-2 font-medium text-blue-600">
                Ad Details
              </button>
            </div>

            <h2 className="mb-4 text-lg font-semibold">Ad Details</h2>

            <div className="grid grid-cols-1 gap-y-4 text-sm md:grid-cols-2">
              <div>
                <p className="text-gray-500">Ad ID</p>

                <p className="font-medium">{product.id || "N/A"}</p>
              </div>
              <div>
                <p className="text-gray-500">Condition</p>
                <p className="font-medium">{product.used_duration || "Not specified"}</p>
              </div>
              <div>
                <p className="text-gray-500">Category</p>
                <p className="font-medium">{product.category || "Not specified"}</p>
              </div>
              <div>
                <p className="text-gray-500">Negotiable</p>
                <p className="font-medium">{product.negotiable || "No"}</p>
              </div>
            </div>

            <div className="mt-8">
              <h2 className="mb-2 text-lg font-semibold">Description</h2>
              <p className="text-gray-600">{product.p_desc || "No description available"}</p>
            </div>

            <div className="flex flex-row">
              <button
                className="mr-4 mb-6 h-11 w-[20vw] cursor-pointer"
                style={{
                  borderWidth: "4px",
                  borderRadius: "12px",
                  borderImageSlice: "1",
                  borderImageSource:
                    "linear-gradient(90deg, rgba(11,205,220,1) 0%, rgba(44,108,223,1) 100%)",
                }}
              >
                <ShoppingCartOutlined /> Add to cart
              </button>
              <Link to={`/payment/${product.id}/${product.seller_id}`}>
                <button className="h-11 w-[20vw] cursor-pointer bg-cyan-500 font-semibold text-white hover:bg-cyan-600">
                  Buy Now
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductPage;
