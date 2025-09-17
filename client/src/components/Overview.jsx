import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import toast, { Toaster } from "react-hot-toast";
import { EyeClosed, Eye } from "lucide-react";

const Overview = (props) => {
  console.log("Props received by Overview component:", props);
  const { user, refreshUserData, addBalance } = useAuth();
  
  const [userData, setUserData] = useState({
    name: user?.name || user?.email?.split('@')[0] || "User Name",
    email: user?.email || "user@example.com",
    balance: user?.balance || 0,
    creditsTraded: 0,
    impactScore: 70
  });
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [topupAmount, setTopupAmount] = useState(0);
  const [topupOpen, setTopupOpen] = useState(false);
  const [mpinTopup, setMpinTopup] = useState("");
  const [showTopupMpin, setShowTopupMpin] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Refresh user data to get latest balance
        await refreshUserData();
        
        // Use the updated user data
        setUserData({
          name: user?.name || user?.email?.split('@')[0] || "User Name",
          email: user?.email || "user@example.com",
          balance: user?.balance || 0,
          creditsTraded: 0,
          impactScore: 70
        });

        // Fetch recent transactions
        const response = await fetch("http://localhost:3001/api/transactions");
        if (response.ok) {
          const result = await response.json();
          const recentTransactions = (result.transactions || []).slice(0, 5).map(transaction => ({
            date: new Date(transaction.transaction_date).toLocaleDateString(),
            type: "Purchase",
            amount: `${transaction.quantity} Credits`,
            status: "Completed",
          }));
          setTransactions(recentTransactions);
        } else {
          // Fallback to static data
          setTransactions([
            {
              date: "2023-08-15",
              type: "Purchase",
              amount: "50 Credits",
              status: "Completed",
            },
            {
              date: "2023-08-10",
              type: "Sale",
              amount: "30 Credits",
              status: "Completed",
            },
            {
              date: "2023-08-05",
              type: "Purchase",
              amount: "20 Credits",
              status: "Completed",
            },
            {
              date: "2023-07-28",
              type: "Sale",
              amount: "40 Credits",
              status: "Completed",
            },
            {
              date: "2023-07-20",
              type: "Purchase",
              amount: "10 Credits",
              status: "Completed",
            },
          ]);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        // Fallback to static data
        setUserData({
          name: user?.name || user?.email?.split('@')[0] || "User Name",
          email: user?.email || "user@example.com",
          balance: user?.balance || 0,
          creditsTraded: 0,
          impactScore: 70
        });
        setTransactions([
          {
            date: "2023-08-15",
            type: "Purchase",
            amount: "50 Credits",
            status: "Completed",
          },
          {
            date: "2023-08-10",
            type: "Sale",
            amount: "30 Credits",
            status: "Completed",
          },
          {
            date: "2023-08-05",
            type: "Purchase",
            amount: "20 Credits",
            status: "Completed",
          },
          {
            date: "2023-07-28",
            type: "Sale",
            amount: "40 Credits",
            status: "Completed",
          },
          {
            date: "2023-07-20",
            type: "Purchase",
            amount: "10 Credits",
            status: "Completed",
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user, refreshUserData]);

  // Allow scroll during modal per request (reverted lock)

  // Add a separate effect to update userData when user changes
  useEffect(() => {
    if (user) {
      setUserData({
        name: user.name || user.email?.split('@')[0] || "User Name",
        email: user.email || "user@example.com",
        balance: user.balance || 0,
        creditsTraded: 0,
        impactScore: 70
      });
    }
  }, [user]);

  const handleViewAllClick = () => {
    console.log("Clicked 'View all transactions...'");
    props.onViewChange("history");
  };

  const handleRefreshBalance = async () => {
    try {
      await refreshUserData();
      toast.success("Balance refreshed!");
    } catch (error) {
      toast.error("Failed to refresh balance");
    }
  };

  const handleTopup = async () => {
    const amount = Number(topupAmount);
    if (!amount || amount <= 0) {
      toast.error("Enter a valid amount");
      return;
    }
    if (!/^\d{4,6}$/.test(mpinTopup)) {
      toast.error("Enter a valid 4-6 digit MPIN");
      return;
    }
    
    toast.loading("Adding balance...");
    
    try {
      const res = await addBalance(amount);
      toast.dismiss(); // Clear loading toast
      
      if (res.success) {
        setTopupAmount(0);
        setMpinTopup("");
        setTopupOpen(false);
        toast.success(`Successfully added ₹${amount} to your balance!`);
      } else {
        toast.error(res.error || "Failed to add balance");
      }
    } catch (error) {
      toast.dismiss(); // Clear loading toast
      toast.error("Network error. Please try again.");
      console.error("Balance add error:", error);
    }
  };

  return (
    <>
    <div className="w-250 ml-80 flex flex-col mb-20 min-h-screen">
      <p className="text-left text-3xl font-extrabold">
        Over<span className="text-[#098409]">view</span>
      </p>
      <div className="w-full mt-4 flex items-center justify-between">
        <div className="flex flex-row gap-2 justify-center items-center">
          <div className="h-20 w-20 bg-[#098409] text-white rounded-full flex items-center justify-center font-bold text-3xl">
            {userData.name?.charAt(0)?.toUpperCase() || "U"}
          </div>
          <div>
            <p className="text-left text-lg font-medium text-[#098409]">
              {userData.name}
            </p>
            <p className="text-left text-sm text-gray-500">
              {userData.phone && `Phone: ${userData.phone}`}
            </p>
            <p className="text-left text-sm text-gray-500">{userData.email}</p>
          </div>
        </div>
        <div>
          <button onClick={() => props.onViewChange && props.onViewChange('settings')} className="w-80 text-xs text-gray-500 bg-gray-100 hover:bg-gray-200 rounded-md px-2 py-1 cursor-pointer">
            Edit
          </button>
        </div>
      </div>
      <hr className="border-gray-200 mt-5 mb-5" />
      <div className="card-container flex flex-row justify-between w-full gap-4">
        <div className="card bg-white w-90 px-4 py-6 border border-gray-200 rounded-xl">
          <div className="flex justify-between items-center">
            <div>
              <p className="">Balance</p>
              <h3 className="text-3xl font-bold text-[#098409]">₹{userData.balance}</h3>
            </div>
            {/* Refresh icon removed as requested */}
          </div>
          <div className="flex items-center gap-2 mt-4">
            <input
              type="number"
              value={topupAmount}
              onChange={(e) => setTopupAmount(e.target.value)}
              placeholder="Add amount"
              className="w-40 h-8 border border-gray-300 rounded-md px-2 text-sm"
            />
            <button onClick={() => setTopupOpen(true)} className="h-8 px-3 bg-[#00000025] border border-[#098409] rounded-md text-sm hover:bg-[#a7f7a7bb] hover:text-[#098409] cursor-pointer">Top up</button>
          </div>
        </div>
        <div className="card bg-white w-90 p-4 py-6 border border-gray-200 rounded-xl">
          <p className="">Credits Traded</p>
          <h3 className="text-3xl font-bold text-[#098409]">{userData.creditsTraded}</h3>
        </div>
        <div className="card bg-white w-90 p-4 py-6 border border-gray-200 rounded-xl">
          <p className="">Impact Score</p>
          <h3 className="text-3xl font-bold text-[#098409]">{userData.impactScore}</h3>
        </div>
      </div>
      <hr className="border-gray-200 mt-5" />
      <div className="card-container flex flex-row justify-between w-245 gap-0">
        <div className="card w-90 px-4 py-6 border border-l-0 border-t-0 border-b-0 border-r-gray-200">
          <p className="text-sm text-gray-500">Company Name</p>
          <h3 className="text-sm font-medium">Ax7 Technologies</h3>
        </div>

        <div className="card w-90 p-4 py-6 border border-l-0 border-t-0 border-b-0 border-r-gray-200">
          <p className="text-sm text-gray-500">Contact Information</p>
          <h3 className="text-sm font-medium">user@example.com</h3>
        </div>
        <div className="card w-90 p-4 py-6">
          <p className="text-sm text-gray-500">Billing Details</p>
          <h3 className="text-sm font-medium">
            Billing Address: 123 Forest Avenue, Green Valley, CA 90210
          </h3>
        </div>
      </div>
      <hr className="border-gray-200 mb-5" />
      <h2 className="text-left text-2xl font-bold mb-5">
        Recent <span className="text-[#098409]">Transactions</span>
      </h2>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left py-4 px-6 text-gray-600 font-medium text-sm">
                  Date
                </th>
                <th className="text-left py-4 px-6 text-gray-600 font-medium text-sm">
                  Type
                </th>
                <th className="text-left py-4 px-6 text-gray-600 font-medium text-sm">
                  Amount
                </th>
                <th className="text-left py-4 px-6 text-gray-600 font-medium text-sm">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((row, index) => (
                <tr
                  key={index}
                  className="border-b border-gray-100 hover:bg-gray-50"
                >
                  <td className="py-5 px-6 text-gray-700">{row.date}</td>
                  <td className="py-5 px-6 text-green-700 font-medium">
                    {row.type}
                  </td>
                  <td className="py-5 px-6 text-gray-700">{row.amount}</td>
                  <td className="py-5 px-6">
                    <span className="bg-gray-100 text-gray-800 text-xs font-semibold px-3 py-1.5 rounded-full">
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="w-full text-right">
        <p
          className="inline-block w-38 text-sm text-gray-500 hover:underline hover:text-[#098409] cursor-pointer mt-2 transition-colors duration-200"
          onClick={handleViewAllClick}
        >
          View all transactions...
        </p>
      </div>
    </div>
    {topupOpen && (
      <div className="fixed inset-0 z-40 flex items-center justify-center">
        <div className="absolute inset-0 bg-[#f0ffed]/80 backdrop-blur-sm" onClick={() => setTopupOpen(false)}></div>
        <div className="relative bg-[#f0ffed] rounded-2xl shadow-xl border border-gray-200 w-[28rem] max-w-[90%] p-6 z-50">
          <div className="text-xl font-bold mb-1">Add Balance</div>
          <div className="text-sm text-gray-600 mb-4">Enter amount and confirm with MPIN</div>
          <div className="flex flex-col gap-3">
            <div className="relative">
              <input
                type="number"
                className="peer w-full h-11 border border-[#098409] rounded-lg p-2 placeholder-transparent focus:outline-none focus:border-[#076a07]"
                placeholder="Amount"
                value={topupAmount}
                onChange={(e) => setTopupAmount(e.target.value)}
                min={1}
              />
              <label className="absolute left-2 -top-2.5 text-sm text-gray-600 bg-[#f0ffed] px-1 transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-2.5 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-[#098409]">Amount</label>
            </div>
            <div className="relative">
              <input
                type={showTopupMpin ? "text" : "password"}
                id="topup_mpin"
                className="peer w-full h-11 border border-[#098409] rounded-lg p-2 pr-10 placeholder-transparent focus:outline-none focus:border-[#076a07]"
                placeholder="MPIN (4-6 digits)"
                value={mpinTopup}
                onChange={(e) => setMpinTopup(e.target.value)}
                maxLength={6}
              />
              <label htmlFor="topup_mpin" className="absolute left-2 -top-2.5 text-sm text-gray-600 bg-[#f0ffed] px-1 transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-2.5 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-[#098409]">MPIN (4-6 digits)</label>
              {!showTopupMpin ? (
                <EyeClosed onClick={() => setShowTopupMpin(true)} className="w-5 h-5 absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-600" />
              ) : (
                <Eye onClick={() => setShowTopupMpin(false)} className="w-5 h-5 absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-600" />
              )}
            </div>
            <div className="flex gap-2 mt-2">
              <button onClick={() => setTopupOpen(false)} className="flex-1 h-10 bg-gray-100 border border-gray-300 rounded-lg cursor-pointer">Cancel</button>
              <button onClick={handleTopup} className="flex-1 h-10 bg-[#00000025] border border-[#098409] text-black hover:bg-[#a7f7a7bb] rounded-lg hover:text-[#098409] font-bold cursor-pointer transition-all">Confirm</button>
            </div>
          </div>
        </div>
      </div>
    )}
    <Toaster position="bottom-right" toastOptions={{style: {zIndex: 9999}}} />
    </>
  );
};

export default Overview;
