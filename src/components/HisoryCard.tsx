"use client";
import React, { useState } from "react";

const HistoryCard = ({
  id,
  name,
  pic,
  review,
  quantity,
  buy,
  changereview,
}: {
  id: any;
  name: string;
  pic: string;
  review: number;
  quantity: number;
  buy: (id: any, name: any) => void;
  changereview: (newReview: number, id: any) => void;
}) => {
  const [currentReview, setCurrentReview] = useState(review);

  const handleStarClick = (rating: number) => {
    setCurrentReview(rating);
    changereview(rating, id); // Trigger external review change logic
  };

  return (
    <div className="w-60 rounded overflow-hidden shadow-lg m-4 p-4 bg-white border border-gray-200 text-black flex flex-col">
      <img className="w-48 h-48 object-cover" src={pic} alt={name} />
      <div className="px-6 py-4 flex flex-col">
        <div className="font-bold text-xl mb-2 text-nowrap self-center">
          {name}
        </div>

        {/* Quantity section */}
        <div className="text-gray-700 text-base mb-2 self-center">
          Purchased: {quantity}
        </div>

        {/* 5-star review section */}
        <div className="flex justify-center">
          {Array.from({ length: 5 }, (_, index) => (
            <span
              key={index}
              className={`cursor-pointer text-2xl ${
                index < currentReview ? "text-yellow-400" : "text-gray-400"
              }`}
              onClick={() => handleStarClick(index + 1)}
            >
              ★
            </span>
          ))}
        </div>

        <button
          onClick={() => buy(id, name)}
          className="bg-blue-500 hover:bg-blue-700 font-bold py-2 px-4 rounded mt-4 text-white"
        >
          Buy Again
        </button>
      </div>
    </div>
  );
};

export default HistoryCard;
