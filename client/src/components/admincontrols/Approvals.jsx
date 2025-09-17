import React, { useState, useEffect } from "react";
import { Check, X, Eye, FileText } from "lucide-react"; // Import icons
import toast, { Toaster } from "react-hot-toast";

const Approvals = () => {
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCredit, setSelectedCredit] = useState(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);

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

  const handleRowClick = async (creditId) => {
    try {
      const response = await fetch(`http://localhost:3001/api/carbon-credit/${creditId}`);
      if (response.ok) {
        const result = await response.json();
        setSelectedCredit(result.carbon_credit);
        setDetailsModalOpen(true);
      } else {
        toast.error("Failed to load credit details");
      }
    } catch (error) {
      console.error("Error fetching credit details:", error);
      toast.error("Error loading credit details");
    }
  };

  const handleViewDocument = async (creditId) => {
    try {
      const response = await fetch(`http://localhost:3001/api/carbon-credit/${creditId}/document`);
      if (response.ok) {
        const result = await response.json();
        window.open(result.document_url, '_blank');
      } else {
        toast.error("Failed to load document");
      }
    } catch (error) {
      console.error("Error fetching document:", error);
      toast.error("Error loading document");
    }
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
                  className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleRowClick(row.id)}
                >
                  <td className="py-5 px-6 text-gray-900 font-medium">
                    {row.name}
                  </td>
                  <td className="py-5 px-6 text-green-700">{row.type}</td>
                  <td className="py-5 px-6 text-green-700">{row.seller_id}</td>
                  <td className="py-5 px-6 text-gray-700">{new Date(row.created_at).toLocaleString()}</td>
                  <td className="py-5 px-6 flex items-center gap-2">
                    {/* View Document button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewDocument(row.id);
                      }}
                      className="cursor-pointer flex items-center justify-center p-1 rounded-full text-blue-600 hover:bg-blue-100 hover:text-blue-700 transition-colors duration-200 focus:outline-none"
                      title="View Document"
                    >
                      <FileText size={20} />
                    </button>
                    {/* View Details button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRowClick(row.id);
                      }}
                      className="cursor-pointer flex items-center justify-center p-1 rounded-full text-gray-600 hover:bg-gray-100 hover:text-gray-700 transition-colors duration-200 focus:outline-none"
                      title="View Details"
                    >
                      <Eye size={20} />
                    </button>
                    {/* Approve button with Check icon */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleApprove(row.id);
                      }}
                      className="cursor-pointer flex items-center justify-center p-1 rounded-full text-[#098409] hover:bg-green-100 hover:text-green-700 transition-colors duration-200 focus:outline-none"
                      title="Approve"
                    >
                      <Check size={20} />
                    </button>
                    {/* Reject button with X icon */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleReject(row.id);
                      }}
                      className="cursor-pointer flex items-center justify-center p-1 rounded-full text-[#ff5858] hover:bg-red-100 hover:text-red-700 transition-colors duration-200 focus:outline-none"
                      title="Reject"
                    >
                      <X size={20} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Details Modal */}
      {detailsModalOpen && selectedCredit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setDetailsModalOpen(false)}></div>
          <div className="relative bg-white rounded-2xl shadow-xl border border-gray-200 w-[40rem] max-w-[90%] p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Carbon Credit Details</h2>
              <button
                onClick={() => setDetailsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <p className="text-gray-900">{selectedCredit.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Type</label>
                  <p className="text-gray-900">{selectedCredit.type}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Quantity</label>
                  <p className="text-gray-900">{selectedCredit.quantity} credits</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Price per Credit</label>
                  <p className="text-gray-900">₹{selectedCredit.price_per_credit}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Total Price</label>
                  <p className="text-gray-900">₹{selectedCredit.price}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Location</label>
                  <p className="text-gray-900">{selectedCredit.location}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Issue Date</label>
                  <p className="text-gray-900">{new Date(selectedCredit.issue_date).toLocaleDateString()}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Expiry Date</label>
                  <p className="text-gray-900">{new Date(selectedCredit.expiry_date).toLocaleDateString()}</p>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <p className="text-gray-900 mt-1">{selectedCredit.description}</p>
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => handleViewDocument(selectedCredit.id)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <FileText size={16} />
                  View Document
                </button>
                <button
                  onClick={() => {
                    handleApprove(selectedCredit.id);
                    setDetailsModalOpen(false);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Check size={16} />
                  Approve
                </button>
                <button
                  onClick={() => {
                    handleReject(selectedCredit.id);
                    setDetailsModalOpen(false);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <X size={16} />
                  Reject
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <Toaster position="bottom-right" toastOptions={{style: {zIndex: 9999}}} />
    </div>
  );
};

export default Approvals;
