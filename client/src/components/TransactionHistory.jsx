import React, { useState, useEffect } from "react";
import { Search } from "lucide-react";

const TransactionHistory = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredTransactions, setFilteredTransactions] = useState([]);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await fetch("http://localhost:3001/api/transactions");
        if (response.ok) {
          const result = await response.json();
          // Sort by transaction_date (newest first)
          const sortedTransactions = (result.transactions || []).sort((a, b) => 
            new Date(b.transaction_date) - new Date(a.transaction_date)
          );
          setTransactions(sortedTransactions);
        } else {
          console.error("Failed to fetch transactions");
          // Fallback to static data
          setTransactions([
            {
              id: 1,
              date: "15/08/2023",
              action: "Buy",
              company: "GreenTech Solutions",
              amount: "₹830,000",
              credits: 100,
              status: "Completed",
            },
            {
              id: 2,
              date: "14/08/2023",
              action: "Sell",
              company: "EcoEnergy Corp",
              amount: "₹415,000",
              credits: 50,
              status: "Completed",
            },
            {
              id: 3,
              date: "13/08/2023",
              action: "Buy",
              company: "Sustainable Industries",
              amount: "₹1,245,000",
              credits: 150,
              status: "Pending",
            },
            {
              id: 4,
              date: "12/08/2023",
              action: "Sell",
              company: "CleanAir Innovations",
              amount: "₹622,500",
              credits: 75,
              status: "Completed",
            },
            {
              id: 5,
              date: "11/08/2023",
              action: "Buy",
              company: "Renewable Resources Ltd",
              amount: "₹996,000",
              credits: 120,
              status: "Completed",
            },
          ]);
        }
      } catch (error) {
        console.error("Error fetching transactions:", error);
        // Fallback to static data
        setTransactions([
          {
            id: 1,
            date: "15/08/2023",
            action: "Buy",
            company: "GreenTech Solutions",
            amount: "₹830,000",
            credits: 100,
            status: "Completed",
          },
          {
            id: 2,
            date: "14/08/2023",
            action: "Sell",
            company: "EcoEnergy Corp",
            amount: "₹415,000",
            credits: 50,
            status: "Completed",
          },
          {
            id: 3,
            date: "13/08/2023",
            action: "Buy",
            company: "Sustainable Industries",
            amount: "₹1,245,000",
            credits: 150,
            status: "Pending",
          },
          {
            id: 4,
            date: "12/08/2023",
            action: "Sell",
            company: "CleanAir Innovations",
            amount: "₹622,500",
            credits: 75,
            status: "Completed",
          },
          {
            id: 5,
            date: "11/08/2023",
            action: "Buy",
            company: "Renewable Resources Ltd",
            amount: "₹996,000",
            credits: 120,
            status: "Completed",
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  const formatTransactionData = (transaction) => {
    const date = new Date(transaction.transaction_date).toLocaleDateString('en-GB');
    const amount = `₹${transaction.amount}`;
    const action = "Buy"; // All transactions in the API are purchases
    const status = "Completed"; // All transactions are completed
    
    return {
      id: transaction.id,
      date: date,
      action: action,
      company: `Transaction #${transaction.id}`,
      amount: amount,
      credits: transaction.quantity,
      status: status,
    };
  };

  // Search functionality
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredTransactions(transactions);
    } else {
      const filtered = transactions.filter(transaction => {
        const formatted = formatTransactionData(transaction);
        return (
          formatted.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
          formatted.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
          formatted.amount.toLowerCase().includes(searchTerm.toLowerCase()) ||
          formatted.date.includes(searchTerm) ||
          formatted.status.toLowerCase().includes(searchTerm.toLowerCase())
        );
      });
      setFilteredTransactions(filtered);
    }
  }, [transactions, searchTerm]);

  const displayTransactions = filteredTransactions.length > 0 
    ? filteredTransactions.map(formatTransactionData)
    : [];

  return (
    <div className="ml-80 flex flex-col w-250 min-h-screen">
      <p className="text-left text-3xl font-extrabold">
        Transaction<span className="text-[#098409]">&nbsp;History</span>
      </p>
      
      {/* Search Bar */}
      <form className="searchbar mb-4">
        <input
          className="w-full text-sm font-medium bg-gray-100 p-4 pl-14 rounded-xl border-0"
          type="text"
          placeholder="Search transactions by date, action, company, amount, or status..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Search className="search-icon" color="gray" />
      </form>
      
      <div className="mt-1 bg-white w-full rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left py-4 px-6 text-gray-600 font-medium text-sm">
                  Date
                </th>
                <th className="text-left py-4 px-6 text-gray-600 font-medium text-sm">
                  Action
                </th>
                <th className="text-left py-4 px-6 text-gray-600 font-medium text-sm">
                  Company
                </th>
                <th className="text-left py-4 px-6 text-gray-600 font-medium text-sm">
                  Amount
                </th>
                <th className="text-left py-4 px-6 text-gray-600 font-medium text-sm">
                  Credits
                </th>
                <th className="text-left py-4 px-6 text-gray-600 font-medium text-sm">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#098409] mb-4"></div>
                      <p className="text-gray-500">Loading transactions...</p>
                    </div>
                  </td>
                </tr>
              ) : displayTransactions.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-gray-500">
                    {searchTerm ? "No transactions found matching your search" : "No transactions found"}
                  </td>
                </tr>
              ) : (
                displayTransactions.map((row, index) => (
                <tr
                  key={index}
                  className="border-b border-gray-100 hover:bg-gray-50"
                >
                  <td className="py-5 px-6 text-gray-700">{row.date}</td>
                  <td
                    className={`py-5 px-6 font-medium ${row.action === "Buy" ? "text-green-600" : "text-red-500"}`}
                  >
                    {row.action}
                  </td>
                  <td className="py-5 px-6 text-gray-900 font-medium">
                    {row.company}
                  </td>
                  <td className="py-5 px-6 text-gray-700">{row.amount}</td>
                  <td className="py-5 px-6 text-gray-700">{row.credits}</td>
                  <td className="py-5 px-6">
                    <span
                      className={`text-xs font-semibold px-3 py-1.5 rounded-full ${
                        row.status === "Completed"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {row.status}
                    </span>
                  </td>
                </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      <div className="mb-8" />
    </div>
  );
};

export default TransactionHistory;
