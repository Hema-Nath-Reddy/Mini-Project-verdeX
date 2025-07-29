import React from "react";
import { Search } from "lucide-react";
import { ChevronDown } from "lucide-react";
import { ChevronUp } from "lucide-react";
import { useState } from "react";

const MarketPlace = () => {
  const [priceToggle, setPriceToggle] = useState(true);
  const [companyToggle, setCompanyToggle] = useState(true);
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
              className="w-250 text-s font-medium bg-gray-200 p-4 pl-14 rounded-xl"
              type="text"
              placeholder="Search for companies or credits"
            />
            <Search className="search-icon" color="gray" />
          </form>
          <div className="filters w-250 mt-7.5 flex gap-5 relative">
            <div
              onClick={() => setPriceToggle(!priceToggle)}
              className="h-9 cursor-pointer flex p-1.5 pl-4 bg-gray-200 rounded-4xl relative"
            >
              <p className="text-s font-medium">Price (₹)</p>
              {priceToggle ? <ChevronDown /> : <ChevronUp />}
              {!priceToggle && (
                <div className="absolute left-0 top-full mt-1 w-36 flex flex-col bg-white border border-gray-300 rounded-xl shadow-lg z-50">
                  <div className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
                    Low - High
                  </div>
                  <div className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
                    High - Low
                  </div>
                </div>
              )}
            </div>
            <div
              onClick={() => setCompanyToggle(!companyToggle)}
              className="h-9 cursor-pointer flex p-1.5 pl-4 bg-gray-200 rounded-4xl relative"
            >
              <p className="text-s font-medium">Company</p>
              {companyToggle ? <ChevronDown /> : <ChevronUp />}
              {!companyToggle && (
                <div className="absolute left-0 top-full mt-1 w-36 flex flex-col bg-white border border-gray-300 rounded-xl shadow-lg z-50">
                  <div className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
                    A-Z
                  </div>
                  <div className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
                    Z-A
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default MarketPlace;
