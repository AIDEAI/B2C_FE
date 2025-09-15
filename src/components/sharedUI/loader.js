import React, { useState, useEffect } from "react";

import { FadeLoader } from "react-spinners";
import { motion, AnimatePresence } from 'framer-motion';

const messages = [
  "Initializing process...",
  "Processing data...",
  "Performing analysis...",
  "Compiling results...",
  "Completing operation..."
];
const Loader = () => {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const totalDuration = messages.length * 3;
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessageIndex((prev) => {
        if (prev === messages.length - 1) {
          clearInterval(interval);
          setIsComplete(true);
          return prev;
        }
        return prev + 1;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);
  return (
    // <div className="fixed w-full h-full bg-[rgba(0,0,0,0.6)] top-0 left-0 flex justify-center items-center z-100">
    //   <FadeLoader color="#20A8D9" size={10} radius={2} />
    // </div>
    <div className="fixed w-full h-full bg-[rgba(0,0,0,0.6)] top-0 left-0 flex justify-center items-center z-[1000]">
      <div className="relative bg-white rounded-lg shadow-xl min-w-[300px] overflow-hidden">
        {/* Loading Animation and Message */}
        <div className="px-6 py-4 flex items-center gap-4">
          {/* Spinning Circle */}
          <motion.div
            className="w-6 h-6 border-2 border-[#20A8D9] border-t-transparent rounded-full"
            animate={{ rotate: 360 }}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: "linear"
            }}
          />
          
          {/* Message */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentMessageIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex-1"
            >
              <span className="text-sm font-medium text-gray-800">
                {messages[currentMessageIndex]}
              </span>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Progress Bar */}
        <motion.div
          className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-[#20A8D9] to-[#2DD4BF]"
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{
            duration: totalDuration,
            ease: "linear",
            repeat: 0
          }}
        />
      </div>
    </div>
  );
};
export default Loader;