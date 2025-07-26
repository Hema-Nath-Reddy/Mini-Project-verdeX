import React from "react";
import { Link } from "react-router-dom";
const NavBar = () => {
  return (
    <div className="flex justify-between mt-1">
      <div className="left-nav font-bold ml-5">verdex</div>
      <div className="right-nav ">
        <Link to="/" className="mr-10">Home</Link>
        <Link to="/marketplace" className="mr-10">Marketplace</Link>
        <Link to="/login" className="mr-10">Login</Link>
        <Link to="/register" className="mr-10">signup</Link>
      </div>
    </div>
  );
};

export default NavBar;
