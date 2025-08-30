import React from "react";

const Users = () => {
  const usersData = [
    {
      username: "Ethan Bennett",
      role: "Admin",
      email: "ethan.bennett@example.com",
      phone: "555-123-4567",
      status: "Active",
    },
    {
      username: "Sophia Carter",
      role: "User",
      email: "sophia.carter@example.com",
      phone: "555-987-6543",
      status: "Active",
    },
    {
      username: "Caleb Murphy",
      role: "User",
      email: "caleb.murphy@example.com",
      phone: "555-246-8013",
      status: "Inactive",
    },
    {
      username: "Isabella Hayes",
      role: "Moderator",
      email: "isabella.hayes@example.com",
      phone: "555-369-1470",
      status: "Active",
    },
    {
      username: "Jackson Reed",
      role: "User",
      email: "jackson.reed@example.com",
      phone: "555-159-7530",
      status: "Active",
    },
  ];
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
              {usersData.map((row, index) => (
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
