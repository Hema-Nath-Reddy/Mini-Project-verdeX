import React from "react";

const Home = () => {
  return (
    <div>
      <div className="hero h-100 w-250 m-auto rounded-xl flex flex-col justify-center items-center">
        <h1 className="text-5xl bold text-center">
          Empowering a Greener Future through Carbon Trading
        </h1>
        <p className="m-10">
          Verdex is a leading platform for trading carbon credits, connecting
          Indian businesses committed to sustainability. Our platform offers a
          secure, transparent, and efficient marketplace for buying and selling
          carbon credits, helping organizations achieve their environmental
          goals.
        </p>
        <div className="home-btns ">
          <button className="m-5">Sign up</button>
          <button>Explore Marketplace</button>
        </div>
      </div>
    </div>
  );
};

export default Home;
