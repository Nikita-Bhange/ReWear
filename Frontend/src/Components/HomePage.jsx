import React  from "react";
import { ArrowRight, TrendingUp, ShieldCheck } from "lucide-react";
import {
  Leaf,
  Trees,
  Recycle,
  Earth,
  Sprout
} from "lucide-react";
import { Link } from "react-scroll";
import { NavLink } from "react-router-dom";
export default function HomePage() {
  return (
    <section className="relative h-screen w-full overflow-hidden bg-[#F6FAF7] px-6 sm:px-[6vw] flex items-center">
      
      {/* Floating SVG decorations */}
      <svg
        className="absolute top-16 right-24 opacity-20 animate-pulse"
        width="120"
        height="120"
        viewBox="0 0 120 120"
        fill="none"
      >
        <circle cx="60" cy="60" r="60" fill="#22C55E" />
      </svg>

      <svg
        className="absolute bottom-20 right-10 opacity-30"
        width="160"
        height="160"
        viewBox="0 0 160 160"
        fill="none"
      >
        <rect width="160" height="160" rx="32" fill="#BBF7D0" />
      </svg>

      {/* Main Content */}
      <div className="relative z-10 max-w-2xl">
        
        {/* Small badge */}
        <div className="inline-flex items-center gap-2 rounded-full bg-green-100 px-4 py-1 text-sm font-medium text-green-700 mb-6">
          🌱 Sustainable Shopping Made Easy
        </div>

        {/* Heading */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight text-gray-900">
          Buy & Sell{" "}
          <span className="text-green-600">Pre-</span>
          <span className="text-[#6B8E23]">Loved</span>{" "}
          Items
        </h1>

        {/* Description */}
        <p className="mt-6 text-gray-600 text-lg leading-relaxed">
          Join thousands of users giving products a second life.
          Shop smart, sell easy, and make sustainable choices that matter.
        </p>

        {/* Buttons */}
        <div className="mt-8 flex gap-4">
<Link to="categories" smooth={true} duration={500}>
  <button className="flex items-center gap-2 rounded-xl bg-green-600 px-6 py-3 text-white font-medium hover:bg-green-700 transition">
    Start Shopping <ArrowRight size={18} />
  </button>
</Link>

<NavLink to="/sellproduct" >
  <button className="rounded-xl border border-green-600 px-6 py-3 text-green-700 font-medium hover:bg-green-50 transition">
    Sell Now
  </button>
</NavLink>
        </div>
      </div>

      {/* Floating Right Cards */}
      <div className="absolute right-10 top-32 hidden md:block">

       
        <div className="animate-float mb-6 rounded-2xl bg-white shadow-lg px-4 py-3 flex items-center gap-3">
           <Leaf size={24} className="text-green-600" />
           
          <div>
            <p className="text-sm font-semibold text-gray-900">
              eco-friendly
            </p>
        
          </div>
        </div>

        {/* Secure Deals */}
        {/* <div className="rounded-2xl bg-white shadow-lg px-4 py-3 flex items-center gap-3">
        
        </div> */}
      </div>
    </section>
  );
}
