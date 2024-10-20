import React from "react";

const RecommendCard = ({
  id,
  name,
  pic,
  buy,
}: {
  id: any;
  name: string;
  pic: string;
  buy: (id: any, name: any) => void;
}) => {
  return (
    <div className="w-60 rounded overflow-hidden shadow-lg m-4 p-4 bg-white border border-gray-200 text-black flex flex-col">
      <img
        className="w-48 h-48 object-cover self-center"
        src={pic}
        alt={name}
      />
      <div className="px-6 py-4 flex flex-col">
        <div className="font-bold text-xl mb-2 text-nowrap self-center">
          {name}
        </div>
        <button
          onClick={() => buy(id, name)}
          className="bg-blue-500 hover:bg-blue-700 font-bold py-2 px-4 rounded mt-4 text-white"
        >
          Buy Now
        </button>
      </div>
    </div>
  );
};

export default RecommendCard;
