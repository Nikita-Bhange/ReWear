import React, { useEffect, useState } from "react";
import Header from "../Components/Navbar";
import Footer from "../Components/Footer";
import { Search } from "@mui/icons-material";
import ProductCard from "../Components/ProductCard";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

const CategoryProduct = () => {
  const [used, setUsed] = useState("none");
  const [price, setPrice] = useState(0);
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const { id: categoryName } = useParams();

  const usageMap = {
    "none": "None",
    "less-than-6-months": "Less than 6 Months",
    "6-months-1-year": "6 Months - 1 Year",
    "1-year-2-years": "1 Year - 2 Years",
    "2-years-4-years": "2 Years - 4 Years",
    "more-than-4-years": "More than 4 Years",
  };

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const url = categoryName 
          ? `http://localhost:8000/api/product/getProducts/${encodeURIComponent(categoryName)}`
          : `http://localhost:8000/api/product/all`; 
        const response = await axios.get(url);
        const products = Array.isArray(response.data) ? response.data : (response.data.products || []);
        setItems(products);
        setFilteredItems(products);
      } catch (error) {
        setError("Failed to load products.");
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [categoryName]);

  useEffect(() => {
    let temp = [...items];

    if (used !== "none") {
      temp = temp.filter((item) => item.used_duration === usageMap[used]);
    }

    if (price > 0) {
      temp = temp.filter((item) => Number(item.price) <= price);
    }
    
    // if (search) {
    //     temp = temp.filter(item => item.p_name && item.p_name.toLowerCase().includes(search.toLowerCase()));
    // }
    if (search) { temp = temp.filter(item =>item.seller_city && item.seller_city.toLowerCase().includes(search.toLowerCase())
  );
}
    
    if (location) {
        temp = temp.filter(item => item.seller_city && item.seller_city.toLowerCase().includes(location.toLowerCase()));
    }

    setFilteredItems(temp);
  }, [used, price, items, search, location]);

  return (
    <>
      <Header />
      <div className="text-center py-10">
        <h2 className="text-4xl font-bold capitalize">{categoryName || "All Products"}</h2>
      </div>

      <div className="flex gap-5 px-8 mb-6 flex-wrap">
        <button onClick={() => setFiltersOpen(!filtersOpen)} className="border-2 border-green-700 rounded-xl px-4 py-2 font-medium text-green-600">Filters</button>
        <div className="border-2 border-gray-200 rounded-3xl px-4 py-2 flex items-center gap-2">
          <input className="outline-0" type="text" placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)} />
          <Search />
        </div>
      </div>

      <div className="flex bg-slate-50 min-h-screen">
        {filtersOpen && (
          <div className="w-[280px] p-6 bg-green-200">
            <h3 className="font-bold text-lg mb-3">Used</h3>
            <ul>
              {Object.entries(usageMap).map(([id, label]) => (
                <li key={id}><input type="radio" name="usage" id={id} className="mr-2" checked={used === id} onChange={() => setUsed(id)} /> <label htmlFor={id}>{label}</label></li>
              ))}
            </ul>
          </div>
        )}
        <div className="flex-1 p-6 flex flex-wrap gap-6 justify-center">
          {filteredItems.map(item => <div key={item.id} onClick={() => navigate('/product', { state: { productId: item.id } })}><ProductCard items={item} /></div>)}
        </div>
      </div>
      <Footer />
    </>
  );
};
export default CategoryProduct;
