import React, { useState } from "react";
import { Settings, History, Info, CirclePlus } from "lucide-react";
import AccountInfo from "../components/AccountInfo";
import AccountSettings from "../components/AccountSettings"; 
import TransactionHistory from "../components/TransactionHistory"; 
import AddCredits from "../components/AddCredits";

const Account = () => {
  const [view, setView] = useState("info");

  const renderContent = () => {
    switch (view) {
      case "info":
        return <AccountInfo />;
      case "settings":
        return <AccountSettings />;
      case "history":
        return <TransactionHistory />;
      case "credits":
        return <AddCredits />;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-row h-screen w-full mt-10">
     <div className="left-nav h-full w-70 flex flex-col gap-2 mt-15 text-left px-5 py-10">
        <button
          onClick={() => setView("info")}
          className={`left-nav-links text-left text-l font-medium cursor-pointer p-3 rounded-4xl flex ${view === "info" ? "bg-white" : ""}`}
        >
          <Info /> &nbsp;&nbsp; Account Info
        </button>
        <button
          onClick={() => setView("settings")}
          className={`left-nav-links text-left text-l font-medium cursor-pointer p-3 rounded-4xl flex ${view === "settings" ? "bg-white" : ""}`}
        >
          <Settings /> &nbsp;&nbsp; Account Settings
        </button>
        <button
          onClick={() => setView("history")}
          className={`left-nav-links text-left text-l font-medium cursor-pointer p-3 rounded-4xl flex ${view === "history" ? "bg-white" : ""}`}
        >
          <History /> &nbsp;&nbsp; Transaction History
        </button>
        <button
          onClick={() => setView("credits")}
          className={`left-nav-links text-left text-l font-medium cursor-pointer p-3 rounded-4xl flex ${view === "credits" ? "bg-white" : ""}`}
        >
          <CirclePlus /> &nbsp;&nbsp; Add Credits
        </button>
      </div>
      {renderContent()}
    </div>
  );
};

export default Account;
