import React from "react";
import { Search, ChevronDown, ChevronUp, X } from "lucide-react"; // Import the X icon
import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import { EyeClosed, Eye } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { useAuth } from "../contexts/AuthContext";

const MarketPlace = (props) => {
  const { user, refreshUserData } = useAuth();
  const navigate = useNavigate();
  const [priceToggle, setPriceToggle] = useState(true);
  const [companyToggle, setCompanyToggle] = useState(true);
  const [activeSort, setActiveSort] = useState(null);
  const [carbonCredits, setCarbonCredits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCredit, setSelectedCredit] = useState(null);
  const [buyQty, setBuyQty] = useState("");
  const [buyMpin, setBuyMpin] = useState("");
  const [showMpin, setShowMpin] = useState(false);
  const [purchasing, setPurchasing] = useState(false);

  const { data } = props;

  const defaultData = [];

  // Fetch carbon credits from API
  useEffect(() => {
    const fetchCarbonCredits = async () => {
      try {
        const response = await fetch("http://localhost:3001/api/carbon-credits");
        if (response.ok) {
          const result = await response.json();
          const formattedData = result.carbon_credits.map(credit => ({
            id: credit.id,
            seller_id: credit.seller_id,
            company: credit.name || "Unknown Company",
            creditsAvailable: credit.quantity?.toString() || "0",
            pricePerCredit: `₹${credit.price_per_credit || 0}`,
            trendValue: credit.trendValue || Math.floor(Math.random() * 101), // Use stored trend value or generate if missing
            description: credit.description,
            location: credit.location,
            type: credit.type,
            issue_date: credit.issue_date,
            expiry_date: credit.expiry_date
          }));
          setCarbonCredits(formattedData);
        } else {
          setCarbonCredits([]);
        }
      } catch (error) {
        setCarbonCredits([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCarbonCredits();
  }, []);

  // Allow scroll during modal per request (reverted lock)

  const initialData = data || (carbonCredits.length > 0 ? carbonCredits : defaultData);
  const [displayData, setDisplayData] = useState(initialData);

  // Update display data when carbon credits change
  useEffect(() => {
    setDisplayData(carbonCredits.length > 0 ? carbonCredits : defaultData);
  }, [carbonCredits]);

  const handleSortByPrice = (direction) => {
    const sortedData = [...displayData].sort((a, b) => {
      const priceA = parseFloat(a.pricePerCredit.replace(/[^0-9.-]+/g, ""));
      const priceB = parseFloat(b.pricePerCredit.replace(/[^0-9.-]+/g, ""));
      return direction === "asc" ? priceA - priceB : priceB - priceA;
    });
    setDisplayData(sortedData);
    setPriceToggle(true);
    setActiveSort(direction === "asc" ? "price_asc" : "price_desc");
  };

  const handleSortByCompany = (direction) => {
    const sortedData = [...displayData].sort((a, b) => {
      return direction === "asc"
        ? a.company.localeCompare(b.company)
        : b.company.localeCompare(a.company);
    });
    setDisplayData(sortedData);
    setCompanyToggle(true);
    setActiveSort(direction === "asc" ? "company_asc" : "company_desc");
  };

  const clearSort = () => {
    setDisplayData(carbonCredits.length > 0 ? carbonCredits : defaultData);
    setActiveSort(null);
  };

  const sortOptionsText = {
    price_asc: "Price: Low - High",
    price_desc: "Price: High - Low",
    company_asc: "Company: A-Z",
    company_desc: "Company: Z-A",
  };

  const handleBuyCredit = (credit) => {
    if (!user?.id) {
      toast.error("Please log in to purchase credits");
      return;
    }
    setSelectedCredit(credit);
    setBuyQty("");
    setBuyMpin("");
    setShowMpin(false);
    setModalOpen(true);
  };

  const submitPurchase = async () => {
    if (!selectedCredit) return;
    const maxAvailable = parseInt(selectedCredit.creditsAvailable);
    const pricePerCredit = parseFloat(selectedCredit.pricePerCredit.replace(/[^0-9.-]+/g, ""));
    const quantity = parseInt(buyQty);
    if (!Number.isFinite(quantity) || quantity <= 0) {
      toast.error("Enter a valid quantity");
      return;
    }
    if (quantity > maxAvailable) {
      toast.error(`Max available is ${maxAvailable}`);
      return;
    }
    if (!/^\d{4,6}$/.test(buyMpin)) {
      toast.error("Enter a valid 4-6 digit MPIN");
      return;
    }
    const totalAmount = quantity * pricePerCredit;
    if (user.balance < totalAmount) {
      toast.error(`Insufficient balance. Need ₹${totalAmount}`);
      return;
    }

    setPurchasing(true);
    const loadingToast = toast.loading("Processing purchase...");

    try {
      const response = await fetch(`http://localhost:3001/api/buy-carbon-credit/${selectedCredit.id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          buyer_id: user.id,
          requested_quantity: quantity,
          mpin: buyMpin,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        toast.dismiss(loadingToast);
        toast.success(`Credit purchased successfully! Remaining balance: ₹${user.balance - totalAmount}`);
        
        // Reset form and close modal
        setBuyQty("");
        setBuyMpin("");
        setModalOpen(false);
        
        // Refresh user data to update balance in real-time
        await refreshUserData();
        
        // Refresh the carbon credits list
        const updatedResponse = await fetch("http://localhost:3001/api/carbon-credits");
        if (updatedResponse.ok) {
          const creditResult = await updatedResponse.json();
          const formattedData = creditResult.carbon_credits.map(credit => ({
            id: credit.id,
            seller_id: credit.seller_id,
            company: credit.name || "Unknown Company",
            creditsAvailable: credit.quantity?.toString() || "0",
            pricePerCredit: `₹${credit.price_per_credit || 0}`,
            trendValue: credit.trendValue || Math.floor(Math.random() * 101),
            description: credit.description,
            location: credit.location,
            type: credit.type,
            issue_date: credit.issue_date,
            expiry_date: credit.expiry_date
          }));
          setCarbonCredits(formattedData);
        }
      } else {
        toast.dismiss(loadingToast);
        toast.error(result.error || "Failed to purchase credit");
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      console.error("Error buying credit:", error);
      toast.error("Network error. Please try again.");
    } finally {
      setPurchasing(false);
    }
  };

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    const filteredData = (carbonCredits.length > 0 ? carbonCredits : defaultData).filter(item =>
      item.company.toLowerCase().includes(term) ||
      item.type?.toLowerCase().includes(term) ||
      item.location?.toLowerCase().includes(term)
    );
    setDisplayData(filteredData);
  };

  return (
    <div className="hero-container w-full">
      <div className="w-250 m-auto flex flex-col justify-center items-center">
        <div className="w-full m-auto flex flex-col justify-center items-center pb-50">
          <p className="w-250 text-left text-3xl font-extrabold mt-10">
            Market<span className="text-[#098409]">place</span>
          </p>
          <p className="w-250 text-left text-s font-medium mt-3">
            Explore carbon credit listings from various companies.
          </p>
          {user && (
            <div className="w-250 text-left mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-700 font-medium">
                Your Balance: <span className="text-lg font-bold text-green-800">₹{user.balance || 0}</span>
              </p>
            </div>
          )}
          <form className="searchbar">
            <input
              className="w-250 text-s font-medium bg-gray-100 p-4 pl-14 rounded-xl"
              type="text"
              placeholder="Search for companies or credits"
              value={searchTerm}
              onChange={handleSearch}
            />
            <Search className="search-icon" color="gray" />
          </form>

          <div className="w-250 mt-4 flex gap-5 items-center">
            <div
              onClick={() => setPriceToggle(!priceToggle)}
              className="h-9 cursor-pointer flex p-1.5 pl-4 bg-gray-100 rounded-4xl border border-gray-500 relative"
            >
              <p className="text-s font-medium">Price (₹)</p>
              {priceToggle ? <ChevronDown /> : <ChevronUp />}
              {!priceToggle && (
                <div className="absolute left-0 top-full mt-1 w-36 flex flex-col bg-white border border-gray-300 rounded-xl shadow-lg z-50">
                  <div
                    onClick={() => handleSortByPrice("asc")}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  >
                    Low - High
                  </div>
                  <div
                    onClick={() => handleSortByPrice("desc")}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  >
                    High - Low
                  </div>
                </div>
              )}
            </div>
            <div
              onClick={() => setCompanyToggle(!companyToggle)}
              className="h-9 cursor-pointer flex p-1.5 pl-4 bg-gray-100 rounded-4xl border border-gray-500 relative"
            >
              <p className="text-s font-medium">Company</p>
              {companyToggle ? <ChevronDown /> : <ChevronUp />}
              {!companyToggle && (
                <div className="absolute left-0 top-full mt-1 w-36 flex flex-col bg-white border border-gray-300 rounded-xl shadow-lg z-50">
                  <div
                    onClick={() => handleSortByCompany("asc")}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  >
                    A-Z
                  </div>
                  <div
                    onClick={() => handleSortByCompany("desc")}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  >
                    Z-A
                  </div>
                </div>
              )}
            </div>
          </div>
          {activeSort && (
            <div className="w-250 mt-4 h-8">
              <div className="inline-flex items-center gap-2 bg-[#d0e7cb] text-[#098409] text-sm font-medium px-3 py-1.5 rounded-full">
                <span>{sortOptionsText[activeSort]}</span>
                <X
                  className="h-4 w-4 cursor-pointer hover:text-red-600 transition-colors"
                  onClick={clearSort}
                />
              </div>
            </div>
          )}

          <div className="w-full bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mt-4">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left py-4 px-6 text-gray-600 font-medium text-sm">
                      Company
                    </th>
                    <th className="text-left py-4 px-6 text-gray-600 font-medium text-sm">
                      Credits Available
                    </th>
                    <th className="text-left py-4 px-6 text-gray-600 font-medium text-sm">
                      Price/Credit (₹)
                    </th>
                    <th className="text-left py-4 px-6 text-gray-600 font-medium text-sm">
                      Trend
                    </th>
                    <th className="text-left py-4 px-6 text-gray-600 font-medium text-sm">
                      Action
                    </th>
                  </tr>
                </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#098409] mb-4"></div>
                      <p className="text-gray-500">Loading carbon credits...</p>
                    </div>
                  </td>
                </tr>
              ) : displayData.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-gray-500">
                    No carbon credits found
                  </td>
                </tr>
              ) : (
                displayData.map((row, index) => (
                    <tr
                      key={index}
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >
                      <td className="py-6 px-6 text-gray-900 font-medium">
                        <button className="hover:underline" onClick={() => row.id && navigate(`/credit/${row.id}`)}>{row.company}</button>
                      </td>
                      <td className="py-6 px-6 text-gray-600">
                        {row.creditsAvailable}
                      </td>
                      <td className="py-6 px-6 text-gray-600">
                        {row.pricePerCredit}
                      </td>
                      <td className="py-6 px-6">
                        <div className="flex items-center space-x-3">
                          <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-black rounded-full transition-all duration-300"
                              style={{ width: `${row.trendValue}%` }}
                            ></div>
                          </div>
                          <span className="text-gray-900 font-medium text-sm min-w-[2rem]">
                            {row.trendValue}
                          </span>
                        </div>
                      </td>
                      <td className="py-6 px-6">
                        {user ? (
                          <button 
                            onClick={() => handleBuyCredit(row)}
                            className="bg-[#098409] text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-gray-400 transition-colors duration-200 cursor-pointer"
                          >
                            BUY
                          </button>
                        ) : (
                          <span className="text-gray-400 text-sm">Login to buy</span>
                        )}
                      </td>
                    </tr>
                ))
              )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      {modalOpen && selectedCredit && (
        <div className="fixed inset-0 z-40 flex items-center justify-center">
          <div className="absolute inset-0 bg-[#f0ffed]/80 backdrop-blur-sm" onClick={() => setModalOpen(false)}></div>
          <div className="relative bg-[#f0ffed] rounded-2xl shadow-xl border border-gray-200 w-[28rem] max-w-[90%] p-6">
            <div className="text-xl font-bold mb-1">Buy Credits</div>
            <div className="text-sm text-gray-600 mb-4">{selectedCredit.company}</div>
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Available</span>
                <span className="font-medium">{selectedCredit.creditsAvailable}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Price/Credit</span>
                <span className="font-medium">{selectedCredit.pricePerCredit}</span>
              </div>
              <div className="relative">
                <input
                  type="number"
                  className="peer w-full h-11 border border-[#098409] rounded-lg p-2 placeholder-transparent focus:outline-none focus:border-[#076a07]"
                  placeholder="Quantity"
                  value={buyQty}
                  onChange={(e) => setBuyQty(e.target.value)}
                  min={1}
                  max={parseInt(selectedCredit.creditsAvailable)}
                />
                <label className="pointer-events-none absolute left-2 -top-2.5 text-sm text-gray-600 bg-[#f0ffed] px-1 transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-2.5 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-[#098409]">Quantity</label>
              </div>
              <div className="relative">
                <input
                  type={showMpin ? "text" : "password"}
                  className="peer w-full h-11 border border-[#098409] rounded-lg p-2 pr-10 placeholder-transparent focus:outline-none focus:border-[#076a07]"
                  placeholder="MPIN (4-6 digits)"
                  value={buyMpin}
                  onChange={(e) => setBuyMpin(e.target.value)}
                  maxLength={6}
                />
                <label className="pointer-events-none absolute left-2 -top-2.5 text-sm text-gray-600 bg-[#f0ffed] px-1 transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-2.5 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-[#098409]">MPIN (4-6 digits)</label>
                {!showMpin ? (
                  <EyeClosed onClick={() => setShowMpin(true)} className="w-5 h-5 absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-600" />
                ) : (
                  <Eye onClick={() => setShowMpin(false)} className="w-5 h-5 absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-600" />
                )}
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-sm text-gray-600">Total</span>
                <span className="text-lg font-bold text-[#098409]">₹{(() => {
                  const q = parseInt(buyQty || '0');
                  const p = parseFloat(selectedCredit.pricePerCredit.replace(/[^0-9.-]+/g, ""));
                  const v = Number.isFinite(q) && q > 0 ? q * p : 0;
                  return v.toFixed(2);
                })()}</span>
              </div>
              <div className="flex gap-2 mt-4">
                <button onClick={() => setModalOpen(false)} className="flex-1 h-10 bg-gray-100 border border-gray-300 rounded-lg cursor-pointer">Cancel</button>
                <button 
                  onClick={submitPurchase} 
                  disabled={purchasing}
                  className={`flex-1 h-10 ${purchasing ? 'bg-gray-300 cursor-not-allowed' : 'bg-[#00000025] hover:bg-[#a7f7a7bb] hover:text-[#098409] cursor-pointer'} border border-[#098409] text-black rounded-lg font-bold transition-all`}
                >
                  {purchasing ? "Processing..." : "Confirm"}
                </button>
              </div>
              {buyQty && parseInt(buyQty) > parseInt(selectedCredit.creditsAvailable) && (
                <div className="text-sm text-red-600">Quantity exceeds available credits.</div>
              )}
            </div>
          </div>
        </div>
      )}
      <Toaster position="bottom-right" />
    </div>
  );
};

MarketPlace.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      company: PropTypes.string.isRequired,
      creditsAvailable: PropTypes.string.isRequired,
      pricePerCredit: PropTypes.string.isRequired,
      trendValue: PropTypes.number.isRequired,
    }),
  ),
};
export default MarketPlace;
