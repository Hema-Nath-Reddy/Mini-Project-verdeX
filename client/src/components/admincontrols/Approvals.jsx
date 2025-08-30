import React from "react";
import { Check, X } from 'lucide-react'; // Import Check and X icons

const Approvals = () => {
  const pendingActionsData = [
    {
      item: "Carbon Offset Project D",
      type: "New Project",
      user: "Ava Thompson",
      timestamp: "2023-10-01 10:00 AM",
    },
    {
      item: "Sustainability Initiative E",
      type: "Partnership",
      user: "Owen Harris",
      timestamp: "2023-09-30 03:30 PM",
    },
    {
      item: "Eco-Friendly Product F",
      type: "Product Listing",
      user: "Chloe Turner",
      timestamp: "2023-09-29 09:45 AM",
    },
    {
      item: "User Account Update",
      type: "User Modification",
      user: "Liam Foster",
      timestamp: "2023-09-28 10:15 AM",
    },
    {
      item: "Credit Adjustment Request",
      type: "Transaction",
      user: "Grace Coleman",
      timestamp: "2023-09-27 05:50 PM",
    },
  ];
  const handleApprove = (item) => {
    console.log(`Approved: ${item}`);
  };

  const handleReject = (item) => {
    console.log(`Rejected: ${item}`);
  };

  return (
    <div className="ml-80 flex flex-col w-250">
      <p className="text-left text-3xl font-extrabold">
        App<span className="text-[#098409]">rovals</span>
      </p>
      <div className="mt-5 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left py-4 px-6 text-gray-600 font-medium text-sm">Item</th>
              <th className="text-left py-4 px-6 text-gray-600 font-medium text-sm">Type</th>
              <th className="text-left py-4 px-6 text-gray-600 font-medium text-sm">User</th>
              <th className="text-left py-4 px-6 text-gray-600 font-medium text-sm">Timestamp</th>
              <th className="text-left py-4 px-6 text-gray-600 font-medium text-sm">Actions</th>
            </tr>
          </thead>
          <tbody>
            {pendingActionsData.map((row, index) => (
              <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-5 px-6 text-gray-900 font-medium">{row.item}</td>
                <td className="py-5 px-6 text-green-700">{row.type}</td>
                <td className="py-5 px-6 text-green-700">{row.user}</td>
                <td className="py-5 px-6 text-gray-700">{row.timestamp}</td>
                <td className="py-5 px-6 flex items-center gap-2"> {/* Adjusted gap for icons */}
                  {/* Approve button with Check icon */}
                  <button
                    onClick={() => handleApprove(row.item)}
                    className="cursor-pointer flex items-center justify-center p-1 rounded-full text-[#098409] hover:bg-green-100 hover:text-green-700 transition-colors duration-200 focus:outline-none"
                    title="Approve" // Added for accessibility
                  >
                    <Check size={20} /> {/* Adjust size as needed */}
                  </button>
                  {/* Reject button with X icon */}
                  <button
                    onClick={() => handleReject(row.item)}
                    className="cursor-pointer flex items-center justify-center p-1 rounded-full text-[#ff5858] hover:bg-red-100 hover:text-red-700 transition-colors duration-200 focus:outline-none"
                    title="Reject" // Added for accessibility
                  >
                    <X size={20} /> {/* Adjust size as needed */}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
    </div>
  );
};

export default Approvals;
