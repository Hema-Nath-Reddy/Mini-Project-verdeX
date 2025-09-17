import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import toast, { Toaster } from "react-hot-toast";
import { EyeClosed, Eye } from "lucide-react";

const AccountSettings = () => {
  const { user, updateProfile } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [mpin, setMpin] = useState("");
  const [confirmMpin, setConfirmMpin] = useState("");
  const [showMpin, setShowMpin] = useState(false);
  const [showConfirmMpin, setShowConfirmMpin] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate MPIN if provided
    if (mpin || confirmMpin) {
      if (!/^\d{4,6}$/.test(mpin)) {
        toast.error("MPIN must be 4-6 digits");
        return;
      }
      if (mpin !== confirmMpin) {
        toast.error("MPINs do not match");
        return;
      }
    }

    // Show loading state
    toast.loading("Updating profile...");
    
    try {
      const res = await updateProfile({ name, phone, mpin: mpin || undefined });
      toast.dismiss(); // Clear loading toast
      
      if (res.success) {
        setMpin("");
        setConfirmMpin("");
        toast.success("Profile updated successfully!");
      } else {
        toast.error(res.error || "Failed to update profile");
      }
    } catch (error) {
      toast.dismiss(); // Clear loading toast
      toast.error("Network error. Please try again.");
      console.error("Profile update error:", error);
    }
  };

  return (
    <div className="ml-80 flex flex-col">
      <p className="text-left text-3xl font-extrabold">
        Account<span className="text-[#098409]">&nbsp;Settings</span>
      </p>
      <form onSubmit={handleSubmit} className="flex flex-col items-center w-100 mt-6">
        <div className="relative w-full mt-2">
          <input
            type="text"
            id="name"
            className="peer w-full h-11 border border-[#098409] rounded-lg p-2 placeholder-transparent focus:outline-none focus:border-[#076a07]"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <label htmlFor="name" className="pointer-events-none absolute left-2 -top-2.5 text-sm text-gray-600 bg-[#f0ffed] px-1">Full Name</label>
        </div>
        <div className="relative w-full mt-4">
          <input
            type="tel"
            id="phone"
            className="peer w-full h-11 border border-[#098409] rounded-lg p-2 placeholder-transparent focus:outline-none focus:border-[#076a07]"
            placeholder="Phone Number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
          <label htmlFor="phone" className="pointer-events-none absolute left-2 -top-2.5 text-sm text-gray-600 bg-[#f0ffed] px-1">Phone Number</label>
        </div>
        <div className="relative w-full mt-4">
          <input
            type={showMpin ? "text" : "password"}
            id="mpin"
            className="peer w-full h-11 border border-[#098409] rounded-lg p-2 pr-10 placeholder-transparent focus:outline-none focus:border-[#076a07]"
            placeholder="Update MPIN (optional)"
            value={mpin}
            onChange={(e) => setMpin(e.target.value)}
            maxLength={6}
            inputMode="numeric"
            pattern="\d{4,6}"
          />
          <label htmlFor="mpin" className="pointer-events-none absolute left-2 -top-2.5 text-sm text-gray-600 bg-[#f0ffed] px-1 transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-2.5 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-[#098409]">Update MPIN (optional)</label>
          {!showMpin ? (
            <EyeClosed onClick={() => setShowMpin(true)} className="w-5 h-5 absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-600" />
          ) : (
            <Eye onClick={() => setShowMpin(false)} className="w-5 h-5 absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-600" />
          )}
        </div>
        <div className="relative w-full mt-4">
          <input
            type={showConfirmMpin ? "text" : "password"}
            id="confirm_mpin"
            className="peer w-full h-11 border border-[#098409] rounded-lg p-2 pr-10 placeholder-transparent focus:outline-none focus:border-[#076a07]"
            placeholder="Confirm MPIN"
            value={confirmMpin}
            onChange={(e) => setConfirmMpin(e.target.value)}
            maxLength={6}
            inputMode="numeric"
            pattern="\d{4,6}"
          />
          <label htmlFor="confirm_mpin" className="pointer-events-none absolute left-2 -top-2.5 text-sm text-gray-600 bg-[#f0ffed] px-1 transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-2.5 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-[#098409]">Confirm MPIN</label>
          {!showConfirmMpin ? (
            <EyeClosed onClick={() => setShowConfirmMpin(true)} className="w-5 h-5 absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-600" />
          ) : (
            <Eye onClick={() => setShowConfirmMpin(false)} className="w-5 h-5 absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-600" />
          )}
        </div>
        <button type="submit" className="w-full h-10 mt-6 mb-5 bg-[#00000025] border border-[#098409] text-black hover:bg-[#a7f7a7bb] rounded-lg hover:text-[#098409] font-bold cursor-pointer transition-all duration-300">Save Changes</button>
      </form>
      <Toaster position="bottom-right" toastOptions={{style: {zIndex: 9999}}} />
    </div>
  );
};

export default AccountSettings;
