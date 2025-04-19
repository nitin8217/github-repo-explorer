import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, ChartBarIcon } from "@heroicons/react/24/outline";

const RateLimitIndicator = ({ octokit }) => {
  const [rateLimit, setRateLimit] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [timeLeft, setTimeLeft] = useState('');
  const popupRef = useRef(null);
  const buttonRef = useRef(null);

  const checkRateLimit = async () => {
    try {
      const { data } = await octokit.rateLimit.get();
      setRateLimit(data.rate);
      return data.rate;
    } catch (error) {
      console.error('Error checking rate limit:', error);
    }
  };

  useEffect(() => {
    checkRateLimit();
    const interval = setInterval(checkRateLimit, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (rateLimit) {
      const interval = setInterval(() => {
        const now = new Date().getTime();
        const reset = new Date(rateLimit.reset * 1000).getTime();
        const diff = reset - now;

        if (diff <= 0) {
          checkRateLimit();
          return;
        }

        const minutes = Math.floor(diff / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);
        setTimeLeft(`${minutes}m ${seconds}s`);
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [rateLimit]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        popupRef.current && 
        !popupRef.current.contains(event.target) &&
        !buttonRef.current.contains(event.target)
      ) {
        setIsVisible(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getUsageColor = () => {
    const percentage = (rateLimit?.remaining / rateLimit?.limit) * 100;
    if (percentage > 50) return 'text-green-500';
    if (percentage > 25) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <>
      <button
        ref={buttonRef}
        onClick={() => setIsVisible(true)}
        className="fixed bottom-20 left-6 p-3 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:shadow-xl transition-shadow"
      >
        <ChartBarIcon className={`w-6 h-6 ${getUsageColor()}`} />
      </button>

      <AnimatePresence>
        {isVisible && rateLimit && (
          <motion.div
            ref={popupRef}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed bottom-36 left-6 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 w-72"
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-semibold text-gray-900 dark:text-white">
                API Rate Limit
              </h3>
              <button
                onClick={() => setIsVisible(false)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
              >
                <XMarkIcon className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300 mb-1">
                  <span>Remaining Calls</span>
                  <span className={getUsageColor()}>
                    {rateLimit.remaining}/{rateLimit.limit}
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ 
                      width: `${(rateLimit.remaining / rateLimit.limit) * 100}%` 
                    }}
                    className={`h-full ${
                      getUsageColor().replace('text-', 'bg-')
                    }`}
                  />
                </div>
              </div>

              <div className="text-sm">
                <span className="text-gray-500 dark:text-gray-400">Resets in: </span>
                <span className="font-medium text-gray-700 dark:text-gray-200">
                  {timeLeft}
                </span>
              </div>

              <div className="text-xs text-gray-500 dark:text-gray-400">
                Reset time: {new Date(rateLimit.reset * 1000).toLocaleTimeString()}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default RateLimitIndicator;