import React from "react";
import { Leaf } from "lucide-react";
const Footer = () => {
  return (
    <footer className="w-full bg-white border-t border-gray-300 mt-8">
      <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col items-center text-center gap-2">
        <div className="flex items-center gap-2 font-bold text-lg">
          <Leaf color="#098409" size={20} />
          <span>
            Verde<span className="text-[#098409]">X</span>
          </span>
        </div>
        <div className="text-sm font-semibold text-gray-800">
          Project developed and maintained by {" "}
          <a
            href="https://www.linkedin.com/in/dylan-fernandes-295029302/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#098409] underline underline-offset-2 hover:opacity-80 transition-opacity"
          >
            Dylan Fernandes
          </a>
          , {" "}
          <a
            href="https://www.linkedin.com/in/nityanand-k-g-2829a6279/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#098409] underline underline-offset-2 hover:opacity-80 transition-opacity"
          >
            Nityanand K G
          </a>
          , & {" "}
          <a
            href="https://www.linkedin.com/in/hema-nath-reddy-yeruva/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#098409] underline underline-offset-2 hover:opacity-80 transition-opacity"
          >
            Hema Nath Reddy Y
          </a>
        </div>
        <div className="text-xs text-gray-600">
          Christ (Deemed to be University) Yeshwanthpur Campus, Nagasanda, Bengaluru - 560073
        </div>
      </div>
    </footer>
  );
};

export default Footer;


