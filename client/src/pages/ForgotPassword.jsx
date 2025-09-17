import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import toast from "react-hot-toast";

const ForgotPassword = () => {
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    try {
      // Basic email regex to avoid obvious invalids
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        toast.error("Enter a valid email address");
        return;
      }
      const res = await forgotPassword(email);
      if (res?.success) {
        setEmail("");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center mt-15">
      <div className="w-250 h-100 flex flex-col items-center justify-center">
        <p className="text-3xl font-bold">
          Reset <span className="text-[#098409]">Password</span>
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col items-center w-100">
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
              className="pointer-events-none absolute left-2 -top-2.5 text-sm text-gray-600 bg-[#f0ffed] px-1 transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-2 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-[#098409]"
            >
              Email Address
            </label>
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
            {loading ? "Sending..." : "SEND RESET LINK"}
          </button>
      </form>
      </div>
    </div>
  );
};

export default ForgotPassword;


