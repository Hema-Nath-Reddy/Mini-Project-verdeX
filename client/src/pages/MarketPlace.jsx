import React from "react";
import { Search, ChevronDown, ChevronUp, X } from "lucide-react"; // Import the X icon
import { useState } from "react";
import PropTypes from "prop-types";

const MarketPlace = (props) => {
  const [priceToggle, setPriceToggle] = useState(true);
  const [companyToggle, setCompanyToggle] = useState(true);

  const [activeSort, setActiveSort] = useState(null);

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

  const initialData = data || defaultData;
  const [displayData, setDisplayData] = useState(initialData);

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
    setDisplayData(initialData);
    setActiveSort(null);
  };

  const sortOptionsText = {
    price_asc: "Price: Low - High",
    price_desc: "Price: High - Low",
    company_asc: "Company: A-Z",
    company_desc: "Company: Z-A",
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
          <form className="searchbar">
            <input
              className="w-250 text-s font-medium bg-gray-100 p-4 pl-14 rounded-xl"
              type="text"
              placeholder="Search for companies or credits"
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
                        <button className="text-gray-600 hover:text-gray-800 font-medium text-sm transition-colors">
                          Buy
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
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
