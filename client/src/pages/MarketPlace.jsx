import React from "react";
import { Search, ChevronDown, ChevronUp, X } from "lucide-react"; // Import the X icon
import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import toast, { Toaster } from "react-hot-toast";
import { useAuth } from "../contexts/AuthContext";

const MarketPlace = (props) => {
  const { user, refreshUserData } = useAuth();
  const [priceToggle, setPriceToggle] = useState(true);
  const [companyToggle, setCompanyToggle] = useState(true);
  const [activeSort, setActiveSort] = useState(null);
  const [carbonCredits, setCarbonCredits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const { data } = props;

  const defaultData = [
    {
      company: "EcoSolutions Inc.",
      creditsAvailable: "15,000",
      pricePerCredit: "₹2,075",
      trendValue: 75,
    },
    {
      company: "GreenFuture Corp.",
      creditsAvailable: "22,000",
      pricePerCredit: "₹2,320",
      trendValue: 50,
    },
    {
      company: "Sustainable Ventures",
      creditsAvailable: "18,000",
      pricePerCredit: "₹2,158",
      trendValue: 25,
    },
    {
      company: "CleanTech Industries",
      creditsAvailable: "12,000",
      pricePerCredit: "₹1,992",
      trendValue: 100,
    },
    {
      company: "EarthGuard Solutions",
      creditsAvailable: "20,000",
      pricePerCredit: "₹2,239",
      trendValue: 0,
    },
  ];

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
          console.error("Failed to fetch carbon credits");
          setCarbonCredits(defaultData);
        }
      } catch (error) {
        console.error("Error fetching carbon credits:", error);
        setCarbonCredits(defaultData);
      } finally {
        setLoading(false);
      }
    };

    fetchCarbonCredits();
  }, []);

  const initialData = data || carbonCredits.length > 0 ? carbonCredits : defaultData;
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

  const handleBuyCredit = async (creditId, sellerId, quantity, pricePerCredit) => {
    // Validate required data
    if (!user?.id) {
      toast.error("Please log in to purchase credits");
      return;
    }
    
    if (!sellerId) {
      toast.error("Invalid seller information");
      return;
    }
    
    if (!quantity || !pricePerCredit) {
      toast.error("Invalid quantity or price");
      return;
    }

    // Calculate total amount
    const totalAmount = parseInt(quantity) * parseFloat(pricePerCredit);
    
    // Check if user has sufficient balance
    if (user.balance < totalAmount) {
      toast.error(`Insufficient balance. You need ₹${totalAmount} but have ₹${user.balance}`);
      return;
    }

    // Show confirmation dialog
    const confirmed = window.confirm(
      `Purchase ${quantity} credits for ₹${totalAmount}?\n\n` +
      `Price per credit: ₹${pricePerCredit}\n` +
      `Quantity: ${quantity}\n` +
      `Total: ₹${totalAmount}\n` +
      `Your balance after purchase: ₹${user.balance - totalAmount}`
    );

    if (!confirmed) {
      return;
    }

    try {
      console.log("Purchase request:", {
        creditId,
        buyer_id: user.id,
        seller_id: sellerId,
        quantity: parseInt(quantity),
        amount: totalAmount
      });

      const response = await fetch(`http://localhost:3001/api/buy-carbon-credit/${creditId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          buyer_id: user.id,
          seller_id: sellerId,
          quantity: parseInt(quantity),
          amount: totalAmount,
        }),
      });

      if (response.ok) {
        toast.success("Credit purchased successfully!");
        
        // Refresh user data to update balance
        await refreshUserData();
        
        // Refresh the carbon credits list
        const updatedResponse = await fetch("http://localhost:3001/api/carbon-credits");
        if (updatedResponse.ok) {
          const result = await updatedResponse.json();
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
        }
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "Failed to purchase credit");
      }
    } catch (error) {
      console.error("Error buying credit:", error);
      toast.error("Network error. Please try again.");
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
    <div className="hero-container w-full mt-15">
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
                  {displayData.map((row, index) => (
                    <tr
                      key={index}
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >
                      <td className="py-6 px-6 text-gray-900 font-medium">
                        {row.company}
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
                            onClick={() => handleBuyCredit(row.id, row.seller_id, row.creditsAvailable, row.pricePerCredit.replace(/[^0-9.-]+/g, ""))}
                            className="bg-gray-400 text-white px-4 py-2 rounded-lg font-medium text-sm hover:bg-[#098409] transition-colors duration-200 cursor-pointer"
                          >
                            Buy
                          </button>
                        ) : (
                          <span className="text-gray-400 text-sm">Login to buy</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
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
