import React, { useState, useEffect } from "react";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch("http://localhost:3001/api/all-users");
        if (response.ok) {
          const result = await response.json();
          setUsers(result || []);
        } else {
          console.error("Failed to fetch users");
          // Fallback to static data
          setUsers([
            {
              id: "1",
              email: "ethan.bennett@example.com",
              created_at: "2023-01-15T10:30:00Z",
              role: "Admin",
            },
            {
              id: "2",
              email: "sophia.carter@example.com",
              created_at: "2023-02-20T14:45:00Z",
              role: "User",
            },
            {
              id: "3",
              email: "caleb.murphy@example.com",
              created_at: "2023-03-10T09:15:00Z",
              role: "User",
            },
            {
              id: "4",
              email: "isabella.hayes@example.com",
              created_at: "2023-04-05T16:20:00Z",
              role: "Moderator",
            },
            {
              id: "5",
              email: "jackson.reed@example.com",
              created_at: "2023-05-12T11:30:00Z",
              role: "User",
            },
          ]);
        }
      } catch (error) {
        console.error("Error fetching users:", error);
        // Fallback to static data
        setUsers([
          {
            id: "1",
            email: "ethan.bennett@example.com",
            created_at: "2023-01-15T10:30:00Z",
            role: "Admin",
          },
          {
            id: "2",
            email: "sophia.carter@example.com",
            created_at: "2023-02-20T14:45:00Z",
            role: "User",
          },
          {
            id: "3",
            email: "caleb.murphy@example.com",
            created_at: "2023-03-10T09:15:00Z",
            role: "User",
          },
          {
            id: "4",
            email: "isabella.hayes@example.com",
            created_at: "2023-04-05T16:20:00Z",
            role: "Moderator",
          },
          {
            id: "5",
            email: "jackson.reed@example.com",
            created_at: "2023-05-12T11:30:00Z",
            role: "User",
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const formatUserData = (user) => {
    const username = user.email.split('@')[0].replace('.', ' ').replace(/\b\w/g, l => l.toUpperCase());
    const status = "Active"; // All users from API are considered active
    const phone = "N/A"; // Phone not available in API response
    
    return {
      id: user.id,
      username: username,
      role: user.role || "User",
      email: user.email,
      phone: phone,
      status: status,
      created_at: user.created_at,
    };
  };

  const displayUsers = users.map(formatUserData);
  return (
    <div className="ml-80 flex flex-col w-250">
      <p className="text-left text-3xl font-extrabold">
        User<span className="text-[#098409]">s</span>
      </p>
      <div className="mt-5 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left py-4 px-6 text-gray-600 font-medium text-sm">
                  Username
                </th>
                <th className="text-left py-4 px-6 text-gray-600 font-medium text-sm">
                  Role
                </th>
                <th className="text-left py-4 px-6 text-gray-600 font-medium text-sm">
                  Email
                </th>
                <th className="text-left py-4 px-6 text-gray-600 font-medium text-sm">
                  Phone
                </th>
                <th className="text-left py-4 px-6 text-gray-600 font-medium text-sm">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {displayUsers.map((row, index) => (
                <tr
                  key={index}
                  className="border-b border-gray-100 hover:bg-gray-50"
                >
                  <td className="py-5 px-6 text-gray-900 font-medium">
                    {row.username}
                  </td>
                  <td className="py-5 px-6 text-green-700">{row.role}</td>
                  <td className="py-5 px-6 text-green-700">{row.email}</td>
                  <td className="py-5 px-6 text-gray-700">{row.phone}</td>
                  <td className="py-5 px-6">
                    <span
                      className={`text-xs font-semibold px-3 py-1.5 rounded-full ${
                        row.status === "Active"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {row.status}
                    </span>
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

export default Users;
