import React from "react";
import { Link } from "react-router-dom";
import time from "../assets/time.svg";
import tick from "../assets/tick.svg";
import graph from "../assets/graph.svg";

const Home = () => {
  return (
    <div className="hero-container w-full mt-15">
      <div className="hero h-120 w-250 m-auto rounded-xl flex flex-col justify-center items-center">
        <div className="overlay h-120 w-250 bg-[#0000009f] m-auto rounded-xl flex flex-col justify-center items-center">
          <h1 className="text-5xl font-bold text-center m-5 text-white">
            Empowering a Greener Future through Carbon Trading
          </h1>
          <p className="m-10 font-medium text-white text-center w-200">
            Verdex is a leading platform for trading carbon credits, connecting
            Indian businesses committed to sustainability. Our platform offers a
            secure, transparent, and efficient marketplace for buying and
            selling carbon credits, helping organizations achieve their
            environmental goals.
          </p>
          <div className="homebtns">
            <Link
              to="/login"
              className="homebtn font-semibold rounded-4xl px-4 py-2 mr-7.5 text-lg transition-all duration-100"
            >
              Sign Up
            </Link>
            <Link
              to="/marketplace"
              className="homebtn font-semibold rounded-4xl px-4 py-2 mr-7.5 text-lg transition-all duration-100"
            >
              Explore Marketplace
            </Link>
          </div>
        </div>
      </div>
      <div className="w-full m-auto flex flex-col justify-center items-center pb-50">
        <div className="text-left flex w-250 text-xl font-bold mt-10">
          Why Choose
          <p>
            &nbsp;Verde<span className="text-[#098409]">X</span>
          </p>
          ?
        </div>
        <p className="w-250 text-left text-3xl font-extrabold mt-5">
          Verde<span className="text-[#098409]">X</span> offers a seamless and
          reliable
          <br />
          platform for carbon credit trading in India.
        </p>
        <p className="w-250 text-left text-s font-medium mt-3">
          Our platform is designed to meet the needs of both buyers and sellers,
          ensuring a smooth
          <br />
          and efficient trading experience.
        </p>
        <div className="card-container flex flex-row mt-10 justify-between w-250">
          <div className="cards flex flex-col justify-evenly h-45 w-80 rounded-2xl">
            <p>
              <img src={time} alt="time" className="h-7 pl-3" />
            </p>
            <p className="pl-3 pr-3 font-bold">Real-Time Trading</p>
            <p className="pl-3 pr-3 text-sm">
              Access a live marketplace with up-to-the-minute data on carbon
              credit prices and availability, displayed in Indian Rupees ₹.
            </p>
          </div>
          <div className="cards flex flex-col justify-evenly h-45 w-80 rounded-2xl">
            <p>
              <img src={tick} alt="secure" className="h-7 pl-3" />
            </p>
            <p className="pl-3 pr-3 font-bold">Secure Transactions</p>
            <p className="pl-3 pr-3 text-sm">
              Benefit from robust security measures that protect your
              transactions and ensure compliance with Indian regulations.
            </p>
          </div>
          <div className="cards flex flex-col justify-evenly h-45 w-80 rounded-2xl">
            <p>
              <img src={graph} alt="interface" className="h-7 pl-3" />
            </p>
            <p className="pl-3 pr-3 font-bold">User-Friendly Interface</p>
            <p className="pl-3 pr-3 text-sm">
              Navigate our intuitive platform with ease, whether you're a
              seasoned trader or new to the market.
            </p>
          </div>
        </div>
        <div className="text-left flex w-250 text-xl font-bold mt-20">
          About
          <p>
            &nbsp;Verde<span className="text-[#098409]">X</span>
          </p>
        </div>
        <p className="w-250 text-left text-lg font-semibold mt-8">Our Vision</p>
        <p className="w-250 text-left text-s font-medium mt-1">
          To be the foremost catalyst for environmental sustainability in India,
          driving significant reductions in carbon emissions through a dynamic
          and accessible carbon credit marketplace.
          <br />
          and efficient trading experience.
        </p>
        <p className="w-250 text-left text-lg font-semibold mt-5">
          Our Mission
        </p>
        <p className="w-250 text-left text-s font-medium mt-1">
          To provide a secure, transparent, and efficient platform that connects
          businesses committed to reducing their carbon footprint, facilitating
          the exchange of carbon credits to support environmental initiatives
          and promote corporate responsibility.
        </p>
        <p className="w-250 text-left text-lg font-semibold mt-5">
          Alignment with Sustainable Development Goals (SDGs)
        </p>
        <p className="w-250 text-left text-s font-medium mt-1">
          Verdex actively contributes to several United Nations Sustainable
          Development Goals, including Climate Action (SDG 13), Responsible
          Consumption and Production (SDG 12), and Partnerships for the Goals
          (SDG 17). By fostering a robust carbon credit market, we empower
          businesses to invest in sustainable practices and contribute to a
          greener future for India.
        </p>
      </div>
    </div>
  );
};

export default Home;
