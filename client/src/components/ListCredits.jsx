import { React, useState, useMemo } from "react";
import { UploadCloud } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { useAuth } from "../contexts/AuthContext";

const ListCredits = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="ml-80 flex flex-col min-h-screen">
        <p className="text-left text-3xl font-extrabold">
          List<span className="text-[#098409]">&nbsp;Credits</span>
        </p>
        <div className="mt-8 p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-yellow-800">Please log in to list carbon credits.</p>
        </div>
      </div>
    );
  }
  const [quantity, setQuantity] = useState("");
  const [type, setType] = useState("");
  const [pricePerCredit, setPricePerCredit] = useState("");
  const [issueDate, setIssueDate] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [trendValue, setTrendValue] = useState("0");
  const [fileName, setFileName] = useState("No file chosen");
  const [loading, setLoading] = useState(false);

  const totalPrice = useMemo(() => {
    const q = Number(quantity || 0);
    const p = Number(pricePerCredit || 0);
    if (q > 0 && p > 0) return (q * p).toFixed(2);
    return "";
  }, [quantity, pricePerCredit]);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFileName(e.target.files[0].name);
    } else {
      setFileName("No file chosen");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user?.id) {
      toast.error("Please log in to list credits");
      return;
    }
    
    setLoading(true);

    try {
      const formData = new FormData();
      const fileInput = document.getElementById("file-upload");
      
      if (fileInput.files && fileInput.files[0]) {
        formData.append("file", fileInput.files[0]);
      }

      // Add all form fields
      formData.append("seller_id", user?.id || "current-user-id");
      formData.append("price", Number(quantity || 0) * Number(pricePerCredit || 0));
      formData.append("price_per_credit", pricePerCredit);
      formData.append("issue_date", issueDate);
      formData.append("expiry_date", expiryDate);
      formData.append("quantity", quantity);
      formData.append("type", type);
      formData.append("trendValue", trendValue);
      formData.append("name", name);
      formData.append("description", description);
      formData.append("location", location);

      // Get auth token
      const token = localStorage.getItem('authToken');
      
      const response = await fetch("http://localhost:3001/api/create-carbon-credit", {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData,
      });

      if (response.ok) {
      toast.success("Credits listed successfully!");
        // Reset form
      setQuantity("");
      setType("");
      setPricePerCredit("");
        setIssueDate("");
        setExpiryDate("");
        setName("");
        setDescription("");
        setLocation("");
        setTrendValue("");
      setFileName("No file chosen");
      document.getElementById("file-upload").value = "";
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "Failed to list credits");
      }
    } catch (error) {
      console.error("Error listing credits:", error);
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ml-80 flex flex-col min-h-screen">
      <p className="text-left text-3xl font-extrabold">
        List<span className="text-[#098409]">&nbsp;Credits</span>
      </p>

      <form
        onSubmit={handleSubmit}
        className="w-[60rem] max-w-[90vw] mt-4 grid grid-cols-1 md:grid-cols-2 gap-5"
      >
        <div className="relative w-full">
          <input
            type="number"
            id="quantity"
            className="peer w-full h-11 border border-[#098409] rounded-lg p-2 placeholder-transparent focus:outline-none focus:border-[#076a07]"
            placeholder="Quantity"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            required
          />
          <label
            htmlFor="quantity"
            className="pointer-events-none absolute left-2 -top-2.5 text-sm text-gray-600 bg-[#f0ffed] px-1 transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-2.5 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-[#098409]"
          >
            Quantity
          </label>
        </div>

        <div className="relative w-full">
          <input
            type="number"
            id="pricePerCredit"
            className="peer w-full h-11 border border-[#098409] rounded-lg p-2 placeholder-transparent focus:outline-none focus:border-[#076a07]"
            placeholder="Price Per Credit"
            value={pricePerCredit}
            onChange={(e) => setPricePerCredit(e.target.value)}
            step="0.01"
            required
          />
          <label
            htmlFor="pricePerCredit"
            className="pointer-events-none absolute left-2 -top-2.5 text-sm text-gray-600 bg-[#f0ffed] px-1 transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-2.5 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-[#098409]"
          >
            Price Per Credit (₹)
          </label>
        </div>

        <div className="relative w-full">
          <select
            id="type"
            className="peer w-full h-11 border border-[#098409] rounded-lg p-2 focus:outline-none focus:border-[#076a07]"
            value={type}
            onChange={(e) => setType(e.target.value)}
            required
          >
            <option value="" disabled></option>
            <option value="carbon_offset">Carbon Offset</option>
            <option value="renewable_energy">Renewable Energy</option>
            <option value="reforestation">Reforestation</option>
          </select>
          <label
            htmlFor="type"
            className={`absolute left-2 text-gray-600 bg-[#f0ffed] px-1 transition-all ${
              type ? "-top-2.5 text-sm text-[#098409]" : "top-2.5 text-base"
            } peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-[#098409]`}
          >
            Type
          </label>
        </div>

        <div className="relative w-full opacity-70">
          <input
            type="text"
            id="price"
            className="peer w-full h-11 border border-[#098409] rounded-lg p-2 bg-gray-100 placeholder-transparent focus:outline-none"
            placeholder="Total Price"
            value={totalPrice}
            readOnly
          />
          <label
            htmlFor="price"
            className="pointer-events-none absolute left-2 -top-2.5 text-sm text-gray-600 bg-[#f0ffed] px-1"
          >
            Total Price (₹)
          </label>
        </div>

        <div className="relative w-full md:col-span-2">
          <textarea
            id="description"
            className="peer w-full h-20 border border-[#098409] rounded-lg p-2 placeholder-transparent focus:outline-none focus:border-[#076a07] resize-none"
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
          <label
            htmlFor="description"
            className="pointer-events-none absolute left-2 -top-2.5 text-sm text-gray-600 bg-[#f0ffed] px-1 transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-2.5 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-[#098409]"
          >
            Description
          </label>
        </div>

        <div className="relative w-full">
          <input
            type="text"
            id="name"
            className="peer w-full h-11 border border-[#098409] rounded-lg p-2 placeholder-transparent focus:outline-none focus:border-[#076a07]"
            placeholder="Project Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <label
            htmlFor="name"
            className="pointer-events-none absolute left-2 -top-2.5 text-sm text-gray-600 bg-[#f0ffed] px-1 transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-2.5 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-[#098409]"
          >
            Project Name
          </label>
        </div>

        <div className="relative w-full">
          <input
            type="text"
            id="location"
            className="peer w-full h-11 border border-[#098409] rounded-lg p-2 placeholder-transparent focus:outline-none focus:border-[#076a07]"
            placeholder="Location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            required
          />
          <label
            htmlFor="location"
            className="pointer-events-none absolute left-2 -top-2.5 text-sm text-gray-600 bg-[#f0ffed] px-1 transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-2.5 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-[#098409]"
          >
            Location
          </label>
        </div>

        <div className="relative w-full">
          <input
            type="date"
            id="issueDate"
            className="peer w-full h-11 border border-[#098409] rounded-lg p-2 focus:outline-none focus:border-[#076a07]"
            value={issueDate}
            onChange={(e) => setIssueDate(e.target.value)}
            required
          />
          <label
            htmlFor="issueDate"
            className="pointer-events-none absolute left-2 -top-2.5 text-sm text-gray-600 bg-[#f0ffed] px-1 transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-2.5 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-[#098409]"
          >
            Issue Date
          </label>
        </div>

        <div className="relative w-full">
          <input
            type="date"
            id="expiryDate"
            className="peer w-full h-11 border border-[#098409] rounded-lg p-2 focus:outline-none focus:border-[#076a07]"
            value={expiryDate}
            onChange={(e) => setExpiryDate(e.target.value)}
            required
          />
          <label
            htmlFor="expiryDate"
            className="pointer-events-none absolute left-2 -top-2.5 text-sm text-gray-600 bg-[#f0ffed] px-1 transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-2.5 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-[#098409]"
          >
            Expiry Date
          </label>
        </div>

        <div className="relative w-full md:col-span-2">
          <label htmlFor="trendValue" className="text-sm text-gray-600">Trend Value: {trendValue || 0}</label>
          <input
            type="range"
            id="trendValue"
            className="w-full accent-[#098409]"
            value={trendValue}
            onChange={(e) => setTrendValue(e.target.value)}
            min="0"
            max="100"
          />
        </div>

        <div className="w-full md:col-span-2">
          <label
            htmlFor="file-upload"
            className="w-full flex items-center justify-center gap-2 h-11 border border-dashed border-[#098409] rounded-lg p-2 text-gray-500 cursor-pointer hover:bg-gray-50"
          >
            <UploadCloud size={20} />
            <span>Upload Certifications</span>
          </label>
          <input
            type="file"
            id="file-upload"
            className="hidden"
            onChange={handleFileChange}
            multiple
          />
          <p className="text-sm text-gray-500 mt-1 text-center">{fileName}</p>
        </div>

        <div className="md:col-span-2">
            <button
              type="submit"
              disabled={loading}
              className={
                loading
                  ? "w-full h-10 mt-2 mb-5 bg-gray-300 border border-gray-400 text-gray-600 rounded-lg cursor-not-allowed transition-all duration-300"
                  : "w-full h-10 mt-2 mb-5 bg-[#00000025] border border-[#098409] text-black hover:bg-[#a7f7a7bb] rounded-lg hover:text-[#098409] font-bold cursor-pointer transition-all duration-300"
              }
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                  Listing...
                </div>
              ) : (
                "LIST CREDITS"
              )}
            </button>
        </div>
      </form>

      <Toaster position="bottom-right" />
    </div>
  );
};

export default ListCredits;
