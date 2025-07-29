import React from "react";
import { Link } from "react-router-dom";

const NavBar = () => {
  return (
    <div className="w-full flex justify-between items-center h-15 bg-white sticky shadow-lg top-0 z-1000">
      <div className="left-nav font-bold ml-7.5 text-2xl">
        <Link to="/">VerdeX</Link>
      </div>
      <div className="right-nav ">
        <Link
          to="/"
          className="font-semibold mr-10 text-lg hover:text-[#098409] hover:bg-[#0000001A] rounded-4xl px-4 py-2 transition-all duration-100"
        >
          Homepage
        </Link>
        <Link
          to="/marketplace"
          className="font-semibold mr-10 text-lg hover:text-[#098409] hover:bg-[#0000001A] rounded-4xl px-4 py-2 transition-all duration-100"
        >
          Marketplace
        </Link>
        <Link
          to="/login"
          className="font-semibold mr-10 text-lg hover:text-[#098409] hover:bg-[#0000001A] rounded-4xl px-4 py-2 transition-all duration-100"
        >
          About Us
        </Link>
        <Link
          to="/register"
          className="logbtn font-semibold border-1 hover:text-[#098409] rounded-4xl px-4 py-2 mr-7.5 text-lg transition-all duration-100"
        >
          Login/Sign Up
        </Link>
      </div>
    </div>
  );
};

export default NavBar;
