import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

function ExportDropdown({ onExport }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700"
      >
        📥 Export
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -5 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -5 }}
            transition={{ duration: 0.25 }}
            className="absolute right-0 mt-2 w-44 rounded-xl shadow-2xl z-50 overflow-hidden
            backdrop-blur-sm bg-white/80 border border-gray-200 dark:bg-gray-800/70 dark:border-gray-700"
          >
            <button
              onClick={() => {
                onExport("csv");
                setIsOpen(false);
              }}
              className="block w-full text-left px-5 py-3 text-gray-800 dark:text-gray-100 hover:bg-white/40 dark:hover:bg-gray-700/50 transition"
            >
              📄 CSV
            </button>
            <button
              onClick={() => {
                onExport("json");
                setIsOpen(false);
              }}
              className="block w-full text-left px-5 py-3 text-gray-800 dark:text-gray-100 hover:bg-white/40 dark:hover:bg-gray-700/50 transition"
            >
              📜 JSON
            </button>
            <button
              onClick={() => {
                onExport("pdf");
                setIsOpen(false);
              }}
              className="block w-full text-left px-5 py-3 text-gray-800 dark:text-gray-100 hover:bg-white/40 dark:hover:bg-gray-700/50 transition"
            >
              📑 PDF
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default ExportDropdown;
