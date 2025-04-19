import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChartBarIcon, 
  ArrowDownTrayIcon,
  SunIcon,
  MoonIcon,
  EllipsisHorizontalIcon
} from "@heroicons/react/24/outline";

const ActionBar = ({ onExport, octokit, isDark, onThemeToggle }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [rateLimit, setRateLimit] = useState(null);
  const menuRef = useRef(null);

  useEffect(() => {
    const checkRateLimit = async () => {
      try {
        const { data } = await octokit.rateLimit.get();
        setRateLimit(data.rate);
      } catch (error) {
        console.error('Error checking rate limit:', error);
      }
    };
    checkRateLimit();
  }, [octokit]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getRateLimitColor = () => {
    if (!rateLimit) return 'text-gray-400';
    const percentage = (rateLimit.remaining / rateLimit.limit) * 100;
    if (percentage > 50) return 'text-green-500';
    if (percentage > 25) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <div className="fixed bottom-6 right-6" ref={menuRef}>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="p-3 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:shadow-xl transition-shadow"
      >
        <EllipsisHorizontalIcon className="w-6 h-6 text-gray-700 dark:text-gray-300" />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="absolute bottom-full right-0 mb-2 w-48 rounded-xl shadow-xl overflow-hidden
                     bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
          >
            {/* Rate Limit */}
            <div className="p-3 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 text-sm">
                <ChartBarIcon className={`w-5 h-5 ${getRateLimitColor()}`} />
                <span className="text-gray-700 dark:text-gray-300">
                  {rateLimit ? `${rateLimit.remaining}/${rateLimit.limit}` : 'Loading...'}
                </span>
              </div>
            </div>

            {/* Export Options */}
            <div className="p-1">
              {[
                { format: 'csv', icon: '📊', label: 'Export as CSV' },
                { format: 'json', icon: '🗃️', label: 'Export as JSON' },
                { format: 'pdf', icon: '📑', label: 'Export as PDF' }
              ].map((item) => (
                <button
                  key={item.format}
                  onClick={() => {
                    onExport(item.format);
                    setIsOpen(false);
                  }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-200 
                           hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              ))}
            </div>

            {/* Theme Toggle */}
            <button
              onClick={() => {
                onThemeToggle();
                setIsOpen(false);
              }}
              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-200 
                       hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border-t border-gray-200 dark:border-gray-700"
            >
              {isDark ? (
                <>
                  <SunIcon className="w-5 h-5" />
                  <span>Light Mode</span>
                </>
              ) : (
                <>
                  <MoonIcon className="w-5 h-5" />
                  <span>Dark Mode</span>
                </>
              )}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ActionBar;