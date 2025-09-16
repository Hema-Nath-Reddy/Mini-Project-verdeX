import React, { useState, useEffect } from "react";
import { Check, X } from "lucide-react"; // Import Check and X icons
import toast, { Toaster } from "react-hot-toast";

const Approvals = () => {
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPendingApprovals = async () => {
      try {
        const response = await fetch("http://localhost:3001/api/dashboard-approvals");
        if (response.ok) {
          const result = await response.json();
          setPendingApprovals(result || []);
        } else {
          console.error("Failed to fetch pending approvals");
          // Fallback to static data
          setPendingApprovals([
            {
              id: 1,
              name: "Carbon Offset Project D",
              type: "New Project",
              seller_id: "Ava Thompson",
              created_at: "2023-10-01 10:00 AM",
            },
            {
              id: 2,
              name: "Sustainability Initiative E",
              type: "Partnership",
              seller_id: "Owen Harris",
              created_at: "2023-09-30 03:30 PM",
            },
            {
              id: 3,
              name: "Eco-Friendly Product F",
              type: "Product Listing",
              seller_id: "Chloe Turner",
              created_at: "2023-09-29 09:45 AM",
            },
            {
              id: 4,
              name: "User Account Update",
              type: "User Modification",
              seller_id: "Liam Foster",
              created_at: "2023-09-28 10:15 AM",
            },
            {
              id: 5,
              name: "Credit Adjustment Request",
              type: "Transaction",
              seller_id: "Grace Coleman",
              created_at: "2023-09-27 05:50 PM",
            },
          ]);
        }
      } catch (error) {
        console.error("Error fetching pending approvals:", error);
        // Fallback to static data
        setPendingApprovals([
          {
            id: 1,
            name: "Carbon Offset Project D",
            type: "New Project",
            seller_id: "Ava Thompson",
            created_at: "2023-10-01 10:00 AM",
          },
          {
            id: 2,
            name: "Sustainability Initiative E",
            type: "Partnership",
            seller_id: "Owen Harris",
            created_at: "2023-09-30 03:30 PM",
          },
          {
            id: 3,
            name: "Eco-Friendly Product F",
            type: "Product Listing",
            seller_id: "Chloe Turner",
            created_at: "2023-09-29 09:45 AM",
          },
          {
            id: 4,
            name: "User Account Update",
            type: "User Modification",
            seller_id: "Liam Foster",
            created_at: "2023-09-28 10:15 AM",
          },
          {
            id: 5,
            name: "Credit Adjustment Request",
            type: "Transaction",
            seller_id: "Grace Coleman",
            created_at: "2023-09-27 05:50 PM",
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchPendingApprovals();
  }, []);

  const handleApprove = async (projectId) => {
    try {
      const response = await fetch(`http://localhost:3001/api/approve-project/${projectId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        toast.success("Project approved successfully!");
        // Remove the approved project from the list
        setPendingApprovals(prev => prev.filter(project => project.id !== projectId));
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "Failed to approve project");
      }
    } catch (error) {
      console.error("Error approving project:", error);
      toast.error("Network error. Please try again.");
    }
  };

  const handleReject = (projectId) => {
    // For now, just remove from the list (in a real app, you'd call a reject API)
    setPendingApprovals(prev => prev.filter(project => project.id !== projectId));
    toast.success("Project rejected");
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
                <th className="text-left py-4 px-6 text-gray-600 font-medium text-sm">
                  Item
                </th>
                <th className="text-left py-4 px-6 text-gray-600 font-medium text-sm">
                  Type
                </th>
                <th className="text-left py-4 px-6 text-gray-600 font-medium text-sm">
                  User
                </th>
                <th className="text-left py-4 px-6 text-gray-600 font-medium text-sm">
                  Timestamp
                </th>
                <th className="text-left py-4 px-6 text-gray-600 font-medium text-sm">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {pendingApprovals.map((row, index) => (
                <tr
                  key={index}
                  className="border-b border-gray-100 hover:bg-gray-50"
                >
                  <td className="py-5 px-6 text-gray-900 font-medium">
                    {row.name}
                  </td>
                  <td className="py-5 px-6 text-green-700">{row.type}</td>
                  <td className="py-5 px-6 text-green-700">{row.seller_id}</td>
                  <td className="py-5 px-6 text-gray-700">{new Date(row.created_at).toLocaleString()}</td>
                  <td className="py-5 px-6 flex items-center gap-2">
                    {" "}
                    {/* Adjusted gap for icons */}
                    {/* Approve button with Check icon */}
                    <button
                      onClick={() => handleApprove(row.id)}
                      className="cursor-pointer flex items-center justify-center p-1 rounded-full text-[#098409] hover:bg-green-100 hover:text-green-700 transition-colors duration-200 focus:outline-none"
                      title="Approve" // Added for accessibility
                    >
                      <Check size={20} /> {/* Adjust size as needed */}
                    </button>
                    {/* Reject button with X icon */}
                    <button
                      onClick={() => handleReject(row.id)}
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
      <Toaster position="bottom-right" />
    </div>
  );
};

export default Approvals;
