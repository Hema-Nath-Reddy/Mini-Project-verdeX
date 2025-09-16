import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Leaf,
  CircleUserRound,
  UserRoundCog,
  LogOut,
  ShieldUser,
} from "lucide-react";
const NavBar = () => {
  const isLoggedIn = true;
  const isAdmin = true;
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  return (
    <div className="w-full flex justify-between items-center h-15 bg-white sticky shadow-lg top-0 z-1000">
      <div className="font-bold ml-7.5 text-2xl flex flex-col gap-2">
        <Link to="/" className="flex items-center gap-2">
          <Leaf color="#098409" />
          <p>
            Verde<span className="text-[#098409]">X</span>
          </p>
        </Link>
      </div>
      <div className="flex align-center justify-center">
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
        {!isLoggedIn ? (
          <>
            <Link
              to="/login"
              className="logbtn font-semibold hover:text-[#098409] rounded-4xl px-4 py-2 mr-7.5 text-lg transition-all duration-100"
            >
              Login
            </Link>
          </>
        ) : (
          <>
            <CircleUserRound
              color="#098409"
              onClick={() => setMenuOpen(!menuOpen)}
              className="accbtn mr-7.5 transition-all duration-100 h-10"
            />
            {menuOpen && (
              <div className="absolute right-2 top-17 w-50 flex flex-col bg-white border border-gray-300 rounded-xl shadow-lg z-50 hover:overflow-hidden">
                <div
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex gap-2 font-semibold"
                  onClick={() => setMenuOpen(!menuOpen) & navigate("/account")}
                >
                  <UserRoundCog color="#098409" /> Profile
                </div>
                <hr className="border-gray-300" />
                <div
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex gap-2 font-semibold"
                  onClick={() => setMenuOpen(!menuOpen)}
                >
                  <LogOut color="#ff5858" /> Logout
                </div>
                {isAdmin && <hr className="border-gray-300" />}
                {isAdmin && (
                  <div
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex gap-2 font-semibold text-[#143153ff]"
                    onClick={() => setMenuOpen(!menuOpen) & navigate("/admin")}
                  >
                    <ShieldUser color="#143153ff" className="overflow-hidden" />{" "}
                    Admin Controls
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default NavBar;
