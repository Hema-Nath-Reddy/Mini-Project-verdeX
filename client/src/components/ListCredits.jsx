import { React, useState } from "react";
import { UploadCloud } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

const ListCredits = () => {
  const [quantity, setQuantity] = useState("");
  const [type, setType] = useState("");
  const [price, setPrice] = useState("");
  const [fileName, setFileName] = useState("No file chosen");
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFileName(e.target.files[0].name);
    } else {
      setFileName("No file chosen");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      toast.success("Credits listed successfully!");
      setLoading(false);
      setQuantity("");
      setType("");
      setPrice("");
      setFileName("No file chosen");
      document.getElementById("file-upload").value = "";
    }, 1500);
  };

  return (
    <div className="ml-80 flex flex-col">
      <p className="text-left text-3xl font-extrabold">
        List<span className="text-[#098409]">&nbsp;Credits</span>
      </p>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col items-center w-100"
      >
        <div className="relative w-full mt-4">
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
            className="absolute left-2 -top-2.5 text-sm text-gray-600 bg-[#f0ffed] px-1 transition-all 
                         peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-2.5 
                         peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-[#098409]"
          >
            Quantity
          </label>
        </div>
        <div className="relative w-full mt-4">
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

        <div className="relative w-full mt-4">
          <input
            type="number"
            id="price"
            className="peer w-full h-11 border border-[#098409] rounded-lg p-2 placeholder-transparent focus:outline-none focus:border-[#076a07]"
            placeholder="Price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            step="0.01"
            required
          />
          <label
            htmlFor="price"
            className="absolute left-2 -top-2.5 text-sm text-gray-600 bg-[#f0ffed] px-1 transition-all 
                         peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-2.5 
                         peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-[#098409]"
          >
            Price (USD)
          </label>
        </div>

        <div className="w-full mt-6">
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

        <button
          type="submit"
          disabled={loading}
          className={
            loading
              ? "w-full h-10 mt-6 bg-[#00000025] border border-[#098409] text-black rounded-lg cursor-not-allowed"
              : "w-full h-10 mt-6 bg-[#00000025] border border-[#098409] text-black hover:bg-[#a7f7a7bb] rounded-lg hover:text-[#098409] font-bold cursor-pointer transition-all duration-300"
          }
        >
          {loading ? "Listing..." : "LIST CREDITS"}
        </button>
      </form>

      <Toaster position="bottom-right" />
    </div>
  );
};

export default ListCredits;
