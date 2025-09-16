import React from 'react';

const LoadingSpinner = ({ message = "Loading..." }) => {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#098409]"></div>
      <p className="mt-4 text-lg text-gray-600">{message}</p>
    </div>
  );
};

export default LoadingSpinner;
