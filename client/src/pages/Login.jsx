import React from "react";
import { useState } from "react";

const Login = () => {
  const [isSignup, setIsSignup] = useState(false);
  return (
    <div className="flex flex-col items-center justify-center mt-15">
      {isSignup ? (
        <div className="w-250 h-100 flex flex-col items-center justify-center">
          <p className="text-3xl font-bold">
            Sign Up to Verde<span className="text-[#098409]">X</span>
          </p>
          <input
            type="text"
            placeholder="Full Name"
            className="w-100 h-10 mt-4 border border-[#098409] rounded-lg p-2"
          />
          <input
            type="email"
            placeholder="Email Address"
            className="w-100 h-10 mt-4 border border-[#098409] rounded-lg p-2"
          />
          <input
            type="password"
            placeholder="Password"
            className="w-100 h-10 mt-4 border border-[#098409] rounded-lg p-2"
          />
          <button className="w-100 h-10 mt-4 bg-[#00000025] border-1 border-[#098409] text-black hover:bg-[#a7f7a7bb] hover rounded-lg hover:text-[#098409] font-bold cursor-pointer transition-all duration-300">
            SIGN UP
          </button>
          <p className="mt-4">
            Already have an account?{" "}
            <span
              className="cursor-pointer font-semibold text-[#098409] hover:text-black transition-all-duration-300"
              onClick={() => setIsSignup(!isSignup)}
            >
              Login
            </span>
          </p>
        </div>
      ) : (
        <div className="w-250 h-100 flex flex-col items-center justify-center">
          <p className="text-3xl font-bold">
            Login to Verde<span className="text-[#098409]">X</span>
          </p>
          <input
            type="text"
            placeholder="Email Address"
            className="w-100 h-10 mt-4 border border-[#098409] rounded-lg p-2"
          />
          <input
            type="password"
            placeholder="Password"
            className="w-100 h-10 mt-4 border border-[#098409] rounded-lg p-2"
          />
          <button className="w-100 h-10 mt-4 bg-[#00000025] border-1 border-[#098409] text-black hover:bg-[#a7f7a7bb] hover rounded-lg hover:text-[#098409] font-bold cursor-pointer transition-all duration-300">
            {" "}
            LOGIN
          </button>
          <p className="mt-4">
            Don't have an account?{" "}
            <span
              className="cursor-pointer font-semibold text-[#098409] hover:text-black transition-all-duration-300"
              onClick={() => setIsSignup(!isSignup)}
            >
              Sign Up
            </span>
          </p>
        </div>
      )}
    </div>
  );
};

export default Login;
