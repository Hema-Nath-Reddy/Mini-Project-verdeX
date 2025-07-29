import React, { useState } from "react";
import { EyeClosed, Eye } from "lucide-react";

const Login = () => {
  const [isSignup, setIsSignup] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  return (
    <div className="flex flex-col items-center justify-center mt-15">
      <div className="w-250 h-100 flex flex-col items-center justify-center">
        <p className="text-3xl font-bold">
          {isSignup ? (
            <>
              Sign Up to Verde<span className="text-[#098409]">X</span>
            </>
          ) : (
            <>
              Login to Verde<span className="text-[#098409]">X</span>
            </>
          )}
        </p>

        {isSignup && (
          <>
            <input
              type="text"
              placeholder="Full Name"
              className="w-100 h-10 mt-4 border border-[#098409] rounded-lg p-2"
            />
            <input
              type="number"
              placeholder="Phone Number"
              className="w-100 h-10 mt-4 border border-[#098409] rounded-lg p-2"
            />
          </>
        )}

        <input
          type="email"
          placeholder="Email Address"
          className="w-100 h-10 mt-4 border border-[#098409] rounded-lg p-2"
        />
        <div className="relative w-100 mt-4">
          <input
            type={isPasswordVisible ? "text" : "password"}
            placeholder="Password"
            className="w-full h-10 border border-[#098409] rounded-lg p-2 pr-10" // padding-right to avoid overlap of icon
          />
          {!isPasswordVisible ? (
            <EyeClosed
              onClick={() => setIsPasswordVisible(!isPasswordVisible)}
              className="w-5 h-5 absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-600"
            />
          ) : (
            <Eye
              onClick={() => setIsPasswordVisible(!isPasswordVisible)}
              className="w-5 h-5 absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-600"
            />
          )}
        </div>

        <button className="w-100 h-10 mt-4 bg-[#00000025] border border-[#098409] text-black hover:bg-[#a7f7a7bb] rounded-lg hover:text-[#098409] font-bold cursor-pointer transition-all duration-300">
          {isSignup ? "SIGN UP" : "LOGIN"}
        </button>

        <p className="mt-4">
          {isSignup ? (
            <>
              Already have an account?{" "}
              <span
                className="cursor-pointer font-semibold text-[#098409] hover:text-black transition-all duration-300"
                onClick={() => setIsSignup(false)}
              >
                Login
              </span>
            </>
          ) : (
            <>
              Don't have an account?{" "}
              <span
                className="cursor-pointer font-semibold text-[#098409] hover:text-black transition-all duration-300"
                onClick={() => setIsSignup(true)}
              >
                Sign Up
              </span>
            </>
          )}
        </p>
      </div>
    </div>
  );
};

export default Login;
