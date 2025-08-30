import React from "react";

const AdminDashboard = () => {
  const activityData = [
    {
      activity: "Carbon Offset Project A Submitted",
      type: "New Project",
      user: "Sophia Clark",
      timestamp: "2023-09-26 11:00 AM",
    },
    {
      activity: "Sustainability Initiative B Submitted",
      type: "Partnership",
      user: "Caleb Reed",
      timestamp: "2023-09-25 02:30 PM",
    },
    {
      activity: "Eco-Friendly Product C Submitted",
      type: "Product Listing",
      user: "Isabella Wright",
      timestamp: "2023-09-24 08:45 AM",
    },
    {
      activity: "User Account Created",
      type: "User Registration",
      user: "Ethan Bennett",
      timestamp: "2023-09-23 09:15 AM",
    },
    {
      activity: "Credit Purchase",
      type: "Transaction",
      user: "Olivia Carter",
      timestamp: "2023-09-22 04:50 PM",
    },
  ];
  return (
    <div className="ml-80 flex flex-col w-250">
      <p className="text-left text-3xl font-extrabold">
        Dash<span className="text-[#098409]">board</span>
      </p>
      <div className="card-container mt-5 flex flex-row justify-between gap-4">
        <div className="card w-90 px-4 py-6 h-40 bg-white rounded-xl flex flex-col justify-center gap-2">
          <p className="">Total Credits Traded</p>
          <h3 className="text-3xl font-bold">1,250,000</h3>
          <p className="text-[#098409] font-semibold">+5%</p>
        </div>
        <div className="card w-90 px-4 py-6 h-40 bg-white rounded-xl flex flex-col justify-center gap-2">
          <p className="">New Users This Month</p>
          <h3 className="text-3xl font-bold">350</h3>
          <p className="text-[#098409] font-semibold">+10%</p>
        </div>
        <div className="card w-90 px-4 py-6 h-40 bg-white rounded-xl flex flex-col justify-center gap-2">
          <p className="">Pending Approvals</p>
          <h3 className="text-3xl font-bold">15</h3>
          <p className="text-[#098409] font-semibold">+15%</p>
        </div>
      </div>
      <h2 className="text-left text-2xl font-bold mt-5 mb-5">
        Recent <span className="text-[#098409]">Activity</span>
      </h2>
      <div className="mb-20 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left py-4 px-6 text-gray-600 font-medium text-sm">Activity</th>
              <th className="text-left py-4 px-6 text-gray-600 font-medium text-sm">Type</th>
              <th className="text-left py-4 px-6 text-gray-600 font-medium text-sm">User</th>
              <th className="text-left py-4 px-6 text-gray-600 font-medium text-sm">Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {activityData.map((row, index) => (
              <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-5 px-6 text-gray-900 font-medium">{row.activity}</td>
                <td className="py-5 px-6 text-green-700">{row.type}</td>
                <td className="py-5 px-6 text-green-700">{row.user}</td>
                <td className="py-5 px-6 text-gray-700">{row.timestamp}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
    </div>
  );
};

export default AdminDashboard;
