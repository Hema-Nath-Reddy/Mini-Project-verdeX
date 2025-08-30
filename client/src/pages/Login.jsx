import React, { use, useState, useRef } from "react";
import { EyeClosed, Eye } from "lucide-react";
import toast from "react-hot-toast";
import { Toaster } from "react-hot-toast";

const Login = () => {
  const [isSignup, setIsSignup] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    if (isSignup) {
      setLoading(true);
      try {
        const response = await fetch("http://localhost:3001/api/signup", {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
            name,
            phone,
          }),
        });
        if (response.ok) {
          toast.success(
            "An email has been sent to you. Please verify your email address.",
          );
          setEmail("");
          setPassword("");
          setName("");
          setPhone("");
        } else {
          alert("Signup failed. Please try again.");
        }
      } catch (error) {
        toast.error("Network error. Please try again.");
        console.log(error);
      } finally {
        setLoading(false);
      }
    } else {
      setLoading(true);
      try {
        const response = await fetch("http://localhost:3001/api/login", {
          method: "POST",
          headers: {
            "Content-type": "application/json  ",
          },
          body: JSON.stringify({
            email,
            password,
          }),
        });
        if (response.ok) {
          toast.success("Login successful");
          setEmail("");
          setPassword("");
        } else {
          toast.error("Login failed. Please try again.");
        }
      } catch (error) {
        toast.error("Network error. Please try again.");
        console.log(error);
      } finally {
        setLoading(false);
      }
    }
  };

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
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
            />
            <input
              type="number"
              placeholder="Phone Number"
              className="w-100 h-10 mt-4 border border-[#098409] rounded-lg p-2"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              autoComplete="tel"
            />
          </>
        )}

        <input
          type="email"
          placeholder="Email Address"
          className="w-100 h-10 mt-4 border border-[#098409] rounded-lg p-2"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
        />
        <div className="relative w-100 mt-4">
          <input
            type={isPasswordVisible ? "text" : "password"}
            placeholder="Password"
            className="w-full h-10 border border-[#098409] rounded-lg p-2 pr-10"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
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

        <button
          onClick={handleSubmit}
          disabled={loading}
          className={
            loading
              ? "w-100 h-10 mt-4 bg-[#00000025] border border-[#098409] text-black rounded-lg cursor-not-allowed"
              : "w-100 h-10 mt-4 bg-[#00000025] border border-[#098409] text-black hover:bg-[#a7f7a7bb] rounded-lg hover:text-[#098409] font-bold cursor-pointer transition-all duration-300"
          }
        >
          {loading ? "Loading..." : isSignup ? "SIGN UP" : "LOGIN"}
        </button>
        <Toaster position="bottom-right" />
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
