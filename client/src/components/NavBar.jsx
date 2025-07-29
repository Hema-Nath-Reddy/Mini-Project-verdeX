import React from "react";
import { Link } from "react-router-dom";
import { Leaf } from 'lucide-react';
const NavBar = () => {
  return (
    <div className="w-full flex justify-between items-center h-15 bg-white sticky shadow-lg top-0 z-1000">
      <div className="left-nav font-bold ml-7.5 text-2xl flex flex-col gap-2">
        <Link to="/" className="flex items-center gap-2">
          <Leaf color="#098409"/>
          <p>Verde<span className="text-[#098409]">X</span></p>
        </Link>
      </div>
      <div className="right-nav ">
        <Link
          to="/"
          className="font-semibold mr-5 text-lg hover:text-[#098409] hover:bg-[#0000001A] rounded-4xl px-4 py-2 transition-all duration-100"
        >
          Homepage
        </Link>
        <Link
          to="/marketplace"
          className="font-semibold mr-5 text-lg hover:text-[#098409] hover:bg-[#0000001A] rounded-4xl px-4 py-2 transition-all duration-100"
        >
          Marketplace
        </Link>
        <Link
          to="/aboutus"
          className="font-semibold mr-5 text-lg hover:text-[#098409] hover:bg-[#0000001A] rounded-4xl px-4 py-2 transition-all duration-100"
        >
          About Us
        </Link>
        <Link
          to="/login"
          className="logbtn font-semibold hover:text-[#098409] rounded-4xl px-4 py-2 mr-7.5 text-lg transition-all duration-100"
        >
          Login
        </Link>
      </div>
    </div>
  );
};

export default NavBar;
