import React, { useState, useContext, useEffect } from "react";
import {
  Search,
  ShoppingCartOutlined,
  AccountCircle,
  MenuOutlined,
} from "@mui/icons-material";
import { NavLink } from "react-router-dom";
import { UserContext } from "../Context/User.jsx";
import axios from "axios";

const Navbar = () => {
  const { user } = useContext(UserContext);
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const style = "text-xl cursor-pointer ml-[25px] mobile:ml-[5px]";

  // Fetch cart count
  useEffect(() => {
    const fetchCartCount = async () => {
      if (!user?.id) {
        setCartCount(0);
        return;
      }
      try {
        const response = await axios.get(`http://localhost:8000/api/cart/${user.id}`, {
          withCredentials: true,
        });
        const items = Array.isArray(response.data) ? response.data : [];
        setCartCount(items.length);
      } catch (error) {
        console.error("Error fetching cart count:", error);
        setCartCount(0);
      }
    };

    fetchCartCount();
    
    // Refresh cart count every 5 seconds
    const interval = setInterval(fetchCartCount, 5000);
    return () => clearInterval(interval);
  }, [user]);

  return (
    <>
      <div className="sticky h-20 fixed px-6 m-0 top-0 z-50 bg-blue-950 shadow-md w-full">
        <div className="wrapper pr-2.5 flex justify-between items-center mobile:pl-0 mobile:pr-0">
          <div className="w-[200px] m-3 pl-2">
            <NavLink to="/home">
              {/* <img src={secondhand} alt="logo" className="" /> */}
            </NavLink>
          </div>


          <ul className="flex pt-3">
            <li className="hidden active:underline sm:flex text-xl pt-2 mr-3  text-white">
              <NavLink className={style} to={"/home"}>
                <p>Home</p>
                
              </NavLink>
            </li>
            <li className="hidden sm:flex text-xl pt-2 mr-3  text-white">
              <NavLink className={style} to={"/home#categories"}>
                <p >Categories</p>
              </NavLink>
            </li>
            <li className="hidden sm:flex text-xl pt-2 mr-3  text-white">
              <NavLink className={style} to={"/home"}>
                <p>About us</p>
              </NavLink>
            </li>
        
            <li className="hidden sm:flex text-xl pt-1 pb-2 mt-2 ml-3  text-blue-950 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl w-20 h-9 transition ease-in-out delay-150 hover:-translate-y-1 hover:scale-105">
              <NavLink className={style} to={"/sellproduct"}>
                <p>Sell</p>
              </NavLink>
            </li>
            
          </ul>
           <div className="hidden sm:flex gap-5 pt-2 font-bold text-black">
             
              <NavLink to="/cart" className="relative">
                <ShoppingCartOutlined className="text-white" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {cartCount > 9 ? "9+" : cartCount}
                  </span>
                )}
              </NavLink>

              <NavLink to="/profile">
                <AccountCircle className="text-white" />
              </NavLink>
             </div>
            <div className="sm:hidden flex">
              <MenuOutlined
                onClick={() => setMenuOpen(!menuOpen)}
                className="text-white cursor-pointer mt-3"
              />
            </div>
        </div>
      </div>

      {menuOpen && (
        <div className="sm:hidden bg-blue-950">
          <div className="flex flex-col p-4">
            <NavLink className={style} to="/home">
              Home
            </NavLink>
            <NavLink className={style} to="/home#categories">
              Categories
            </NavLink>
            <NavLink className={style} to="/home">
              About us
            </NavLink>
            <NavLink className={style} to="/cart" >
              <ShoppingCartOutlined className="mr-2" /> Cart {cartCount > 0 && `(${cartCount})`}
            </NavLink>
            <NavLink className={style} to="/profile">
              <AccountCircle className="mr-2" /> Profile
            </NavLink>
            <NavLink className={style} to="/sellproduct">
              Sell
            </NavLink>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;