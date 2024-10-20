"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Component({
  recc,
  buy,
}: {
  recc: any[];
  buy: (id: any, name: any) => void;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const resetInterval = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % recc.length);
    }, 3000);
  };

  useEffect(() => {
    resetInterval(); // Start the interval when the component mounts

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current); // Cleanup interval when unmounting
    };
  }, [recc.length]);

  const handleDotClick = (index: number) => {
    setCurrentIndex(index);
    resetInterval(); // Reset the interval when a dot is clicked
  };

  return (
    <div className="flex justify-center w-screen items-center h-screen bg-gradient-to-t from-[#2C3E50] to-[#000000] fixed top-0 -z-50 pt-16">
      <div className="w-8/12 p-4">
        <AnimatePresence mode="wait">
          {recc.length > 0 && (
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              transition={{ duration: 0.5 }}
              className="bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col justify-center px-16"
            >
              <motion.img
                src={recc[currentIndex][2]}
                alt={recc[currentIndex][1]}
                className="w-full h-96 object-cover self-center mt-10"
                layoutId="image"
              />
              <motion.div className="p-10">
                <motion.h2
                  className="font-bold text-gray-800 self-center text-center text-3xl mb-10"
                  layoutId="title"
                >
                  {recc[currentIndex][1]}
                </motion.h2>
                <motion.button
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-3 px-6 rounded-lg 
                             shadow-md hover:from-purple-600 hover:to-pink-600 transition duration-300 ease-in-out 
                             transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() =>
                    buy(recc[currentIndex][0], recc[currentIndex][1])
                  }
                >
                  Buy Now
                </motion.button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        <div className="flex justify-center mt-4">
          {recc.map((_, index) => (
            <motion.div
              key={index}
              className={`w-3 h-3 rounded-full hover:cursor-pointer mx-2 ${
                index === currentIndex ? "bg-white" : "bg-white bg-opacity-50"
              }`}
              animate={{ scale: index === currentIndex ? 1.2 : 1 }}
              transition={{ duration: 0.3 }}
              onClick={() => handleDotClick(index)} // Call handleDotClick to reset the timer
            />
          ))}
        </div>
      </div>
    </div>
  );
}
