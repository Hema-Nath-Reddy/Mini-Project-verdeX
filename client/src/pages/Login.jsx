import React, { useState } from "react";
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
            "Content-type": "application/json",
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

        <form
          onSubmit={handleSubmit}
          className="flex flex-col items-center w-100"
        >
          {isSignup && (
            <>
              <div className="relative w-full mt-4">
                <input
                  type="text"
                  id="name"
                  className="peer w-full h-10 border border-[#098409] rounded-lg p-2 placeholder-transparent focus:outline-none focus:border-[#076a07]"
                  placeholder="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                  required
                />
                <label
                  htmlFor="name"
                  className="absolute left-2 -top-2.5 text-sm text-gray-600 bg-[#f0ffed] px-1 transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-2 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-[#098409]"
                >
                  Full Name
                </label>
              </div>
              <div className="relative w-full mt-4">
                <input
                  type="number"
                  id="phone"
                  className="peer w-full h-10 border border-[#098409] rounded-lg p-2 placeholder-transparent focus:outline-none focus:border-[#076a07]"
                  placeholder="Phone Number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  autoComplete="tel"
                  required
                />
                <label
                  htmlFor="phone"
                  className="absolute left-2 -top-2.5 text-sm text-gray-600 bg-[#f0ffed] px-1 transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-2 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-[#098409]"
                >
                  Phone Number
                </label>
              </div>
            </>
          )}

          <div className="relative w-full mt-4">
            <input
              type="email"
              id="email"
              className="peer w-full h-10 border border-[#098409] rounded-lg p-2 placeholder-transparent focus:outline-none focus:border-[#076a07]"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
            <label
              htmlFor="email"
              className="absolute left-2 -top-2.5 text-sm text-gray-600 bg-[#f0ffed] px-1 transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-2 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-[#098409]"
            >
              Email Address
            </label>
          </div>
          <div className="relative w-full mt-4">
            <input
              type={isPasswordVisible ? "text" : "password"}
              id="password"
              className="peer w-full h-10 border border-[#098409] rounded-lg p-2 pr-10 placeholder-transparent focus:outline-none focus:border-[#076a07]"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
            <label
              htmlFor="password"
              className="absolute left-2 -top-2.5 text-sm text-gray-600 bg-[#f0ffed] px-1 transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-2 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-[#098409]"
            >
              Password
            </label>
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
            type="submit"
            disabled={loading}
            className={
              loading
                ? "w-full h-10 mt-4 bg-[#00000025] border border-[#098409] text-black rounded-lg cursor-not-allowed"
                : "w-full h-10 mt-4 bg-[#00000025] border border-[#098409] text-black hover:bg-[#a7f7a7bb] rounded-lg hover:text-[#098409] font-bold cursor-pointer transition-all duration-300"
            }
          >
            {loading ? "Loading..." : isSignup ? "SIGN UP" : "LOGIN"}
          </button>
        </form>

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
