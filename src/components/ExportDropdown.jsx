import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowDownTrayIcon } from "@heroicons/react/24/outline";

function ExportDropdown({ onExport }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // ...existing code for useEffect...

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl shadow-lg hover:shadow-blue-500/25 hover:from-blue-600 hover:to-blue-700 transition-all duration-300 flex items-center gap-2"
      >
        <ArrowDownTrayIcon className="w-5 h-5" />
        <span className="font-medium">Export</span>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute right-0 mt-3 w-48 rounded-2xl shadow-xl z-50 overflow-hidden
                     backdrop-blur-md bg-white/90 dark:bg-gray-800/90 border border-gray-100 dark:border-gray-700"
          >
            {[
              { format: "csv", icon: "📊", label: "Export as CSV" },
              { format: "json", icon: "🗃️", label: "Export as JSON" },
              { format: "pdf", icon: "📑", label: "Export as PDF" }
            ].map((item) => (
              <motion.button
                key={item.format}
                whileHover={{ x: 2 }}
                onClick={() => {
                  onExport(item.format);
                  setIsOpen(false);
                }}
                className="flex items-center gap-3 w-full px-4 py-3 text-left text-gray-700 dark:text-gray-200 
                         hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200"
              >
                <span className="text-xl">{item.icon}</span>
                <span className="font-medium text-sm">{item.label}</span>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default ExportDropdown;