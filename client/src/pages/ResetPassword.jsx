import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import toast from "react-hot-toast";

const ResetPassword = () => {
  const { resetPassword } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState("");
  const [tokens, setTokens] = useState({ access_token: "", refresh_token: "" });

  useEffect(() => {
    const params = new URLSearchParams(location.hash?.replace('#', '?') || location.search);
    const access_token = params.get('access_token') || "";
    const refresh_token = params.get('refresh_token') || "";
    if (!access_token || !refresh_token) {
      toast.error('Invalid or expired reset link');
    }
    setTokens({ access_token, refresh_token });
  }, [location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!tokens.access_token || !tokens.refresh_token) return;
    if (!newPassword || newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    const res = await resetPassword({ ...tokens, new_password: newPassword });
    if (res.success) {
      navigate('/login');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center mt-15">
      <div className="w-250 h-100 flex flex-col items-center justify-center">
        <p className="text-3xl font-bold">Reset <span className="text-[#098409]">Password</span></p>
        <form onSubmit={handleSubmit} className="flex flex-col items-center w-100 mt-6">
          <div className="relative w-full mt-2">
            <input
              type="password"
              id="newPassword"
              className="peer w-full h-10 border border-[#098409] rounded-lg p-2 placeholder-transparent focus:outline-none focus:border-[#076a07]"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            <label htmlFor="newPassword" className="pointer-events-none absolute left-2 -top-2.5 text-sm text-gray-600 bg-[#f0ffed] px-1">New Password</label>
          </div>
          <button type="submit" className="w-full h-10 mt-6 bg-[#00000025] border border-[#098409] text-black hover:bg-[#a7f7a7bb] rounded-lg hover:text-[#098409] font-bold cursor-pointer transition-all duration-300">Update Password</button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;


