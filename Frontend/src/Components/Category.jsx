import React from "react";
import { useNavigate } from "react-router-dom";

import CategoriesApi from "../ComponentApi/CategoriesApi.js";
const Categories = () => {
  const navigate = useNavigate();

  return (
    <>
      <div className="pt-[6rem] text-center pb-[2rem]">
        <p className="text-3xl sm:text-4xl" id="categories">
          <span className="font-bold text-amber-950">Explore</span>
          <span className="text-amber-900 font-bold"> Categories </span>
        </p>
      </div>

     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 px-4 sm:px-8 md:px-12 lg:px-20 pb-16">
  {CategoriesApi.map((item) => {
    const Icon = item.icon;

    return (
      <div
        key={item.title}
      className="shadow-lg rounded-2xl flex flex-col items-center justify-center gap-4 p-8 min-h-[220px] cursor-pointer hover:scale-105 transition duration-300 bg-white"
        onClick={() =>
          navigate(`/category/${item.title}`, {
            state: { name: item.title },
          })
        }
      >
        {/* Icon container */}
        <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-md">
          <Icon
            sx={{
              fontSize: 38, 
            }}
          />
        </div>

        <h2 className="text-gray-800 font-medium text-xl">
          {item.title}
        </h2>
      </div>
    );
  })}
</div>

    </>
  );
};

export default Categories;
