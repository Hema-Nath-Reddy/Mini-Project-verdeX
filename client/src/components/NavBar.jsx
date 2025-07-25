import React from "react";
import { Link } from "react-router-dom";
const NavBar = () => {
  return (
    <div className="flex justify-between">
      <div className="left-nav font-bold">verdex</div>
      <div className="right-nav ">
        <Link to="/">Home</Link>
        <Link to="/marketplace">Marketplace</Link>
        <Link to="/login">Login</Link>
        <Link to="/register">signup</Link>
      </div>
    </div>
  );
};

export default NavBar;
