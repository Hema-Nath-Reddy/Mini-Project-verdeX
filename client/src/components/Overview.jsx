import { UserCircle } from "lucide-react";
import React from "react";

const Overview = (props) => {
  console.log("Props received by Overview component:", props);

  const transactionData = [
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
  ];

  const handleViewAllClick = () => {
    console.log("Clicked 'View all transactions...'");
    props.onViewChange("history");
  };

  return (
    <div className="w-250 ml-80 flex flex-col mb-20">
      <p className="text-left text-3xl font-extrabold">
        Over<span className="text-[#098409]">view</span>
      </p>
      <div className="w-full mt-4 flex items-center justify-between">
        <div className="flex flex-row gap-2 justify-center items-center">
          <UserCircle className="h-20 w-20" />
          <div>
            <p className="text-left text-lg font-medium text-[#098409]">
              User Name
            </p>
            <p className="text-left text-sm text-gray-500">Joined 2025</p>
            <p className="text-left text-sm text-gray-500">user@example.com</p>
          </div>
        </div>
        <div>
          <button className="w-80 text-xs text-gray-500 bg-gray-100 hover:bg-gray-200 rounded-md px-2 py-1 cursor-pointer">
            Edit
          </button>
        </div>
      </div>
      <hr className="border-gray-200 mt-5 mb-5" />
      <div className="card-container flex flex-row justify-between w-full gap-4">
        <div className="card bg-white w-90 px-4 py-6 border border-gray-200 rounded-xl">
          <p className="">Balance</p>
          <h3 className="text-3xl font-bold text-[#098409]">$85</h3>
        </div>
        <div className="card bg-white w-90 p-4 py-6 border border-gray-200 rounded-xl">
          <p className="">Credits Traded</p>
          <h3 className="text-3xl font-bold text-[#098409]">246</h3>
        </div>
        <div className="card bg-white w-90 p-4 py-6 border border-gray-200 rounded-xl">
          <p className="">Impact Score</p>
          <h3 className="text-3xl font-bold text-[#098409]">70</h3>
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
              {transactionData.map((row, index) => (
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
  );
};

export default Overview;
