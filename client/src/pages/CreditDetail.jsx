import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const CreditDetail = () => {
  const { id } = useParams();
  const [credit, setCredit] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCredit = async () => {
      try {
        const res = await fetch(`http://localhost:3001/api/carbon-credit/${id}`);
        const data = await res.json();
        if (res.ok) setCredit(data.carbon_credit);
      } finally {
        setLoading(false);
      }
    };
    fetchCredit();
  }, [id]);

  if (loading) return <div className="w-250 m-auto mt-20">Loading...</div>;
  if (!credit) return <div className="w-250 m-auto mt-20">Not found</div>;

  return (
    <div className="hero-container w-full mt-15">
      <div className="w-250 m-auto flex flex-col justify-center items-start pb-50">
        <p className="text-3xl font-extrabold mt-10">{credit.name} <span className="text-[#098409]">Details</span></p>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mt-4 w-full p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><span className="text-gray-500">Company</span><div className="font-medium">{credit.name}</div></div>
            <div><span className="text-gray-500">Type</span><div className="font-medium">{credit.type}</div></div>
            <div><span className="text-gray-500">Location</span><div className="font-medium">{credit.location}</div></div>
            <div><span className="text-gray-500">Quantity</span><div className="font-medium">{credit.quantity}</div></div>
            <div><span className="text-gray-500">Price/Credit</span><div className="font-medium">₹{credit.price_per_credit}</div></div>
            <div><span className="text-gray-500">Issue Date</span><div className="font-medium">{credit.issue_date}</div></div>
            <div><span className="text-gray-500">Expiry Date</span><div className="font-medium">{credit.expiry_date}</div></div>
          </div>
          <div className="mt-4">
            <span className="text-gray-500">Description</span>
            <div className="font-medium">{credit.description}</div>
          </div>
          {credit.verification_document_url && (
            <div className="mt-6">
              <span className="text-gray-500">Verification Document</span>
              <div className="mt-2">
                <a target="_blank" rel="noreferrer" className="text-[#098409] hover:underline" href={`http://localhost:3001/api/carbon-credit/${credit.id}/document`}>
                  View Document (signed URL)
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreditDetail;


