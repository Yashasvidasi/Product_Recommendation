import React from "react";

const TaskBar = ({
  imagesrc,
  name,
  setoption,
}: {
  imagesrc: string;
  name: string;
  setoption: any;
}) => {
  return (
    <div className="w-full h-16 fixed top-0 flex items-center justify-between bg-black p-10 shadow-lg">
      {/* Left Section - Profile Image, Name, and Navigation */}
      <div className="flex items-center space-x-6">
        {/* Profile Image */}
        <img
          src={imagesrc}
          alt="Profile"
          className="w-12 h-12 rounded-full border-2 border-green-300 object-cover"
        />

        {/* Name */}
        <div className="text-green-300 text-lg font-semibold">{name}</div>

        {/* Navigation Buttons */}
      </div>

      {/* Right Section - Logout */}
      <div className="flex flex-row">
        <div className="flex space-x-10 mr-12 text-lg">
          <button
            className="text-white hover:text-green-300 transition-colors"
            onClick={() => setoption("home")}
          >
            Home
          </button>
          <button
            className="text-white hover:text-green-300 transition-colors"
            onClick={() => setoption("hist")}
          >
            History
          </button>
          <button
            className="text-white hover:text-green-300 transition-colors"
            onClick={() => setoption("all")}
          >
            All Products
          </button>
        </div>
        <button className="px-4 py-2 text-white bg-red-600 rounded hover:bg-red-500 transition-colors">
          Logout
        </button>
      </div>
    </div>
  );
};

export default TaskBar;
