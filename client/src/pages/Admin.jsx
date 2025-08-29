import React, { useState } from "react";
import AdminDashboard from "../components/admincontrols/AdminDashboard";
import Approvals from "../components/admincontrols/Approvals"
import Users from "../components/admincontrols/Users"
import { BadgeCheck, LayoutDashboard, UsersRound } from "lucide-react";


const Admin = () => {
  const [view, setView] = useState("dashboard");

  const renderContent = () => {
    switch (view) {
      case "dashboard":
        return <AdminDashboard />;
      case "approvals":
        return <Approvals />;
      case "users":
        return <Users />;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-row h-screen w-full mt-10">
     <div className="left-nav h-full w-70 flex flex-col gap-2 mt-15 text-left px-5 py-10">
        <button
          onClick={() => setView("dashboard")}
          className={`left-nav-links text-left text-l font-medium cursor-pointer p-3 rounded-4xl flex ${view === "dashboard" ? "bg-white" : ""}`}
        >
          <LayoutDashboard /> &nbsp;&nbsp; Dashboard
        </button>
        
        <button
          onClick={() => setView("approvals")}
          className={`left-nav-links text-left text-l font-medium cursor-pointer p-3 rounded-4xl flex ${view === "approvals" ? "bg-white" : ""}`}
        >
          <BadgeCheck /> &nbsp;&nbsp; Approvals
        </button>
        <button
          onClick={() => setView("users")}
          className={`left-nav-links text-left text-l font-medium cursor-pointer p-3 rounded-4xl flex ${view === "users" ? "bg-white" : ""}`}
        >
          <UsersRound /> &nbsp;&nbsp; Users
        </button>
      </div>
      {renderContent()}
    </div>
  );
};

export default Admin;
