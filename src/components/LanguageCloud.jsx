import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon } from "@heroicons/react/24/outline";

const LanguageCloud = ({ isOpen, onClose, languages, selectedLanguages, onLanguageSelect }) => {
  if (!languages || Object.keys(languages).length === 0) return null;

  const languagesList = Object.entries(languages)
    .map(([name, count]) => ({
      name,
      count,
      size: Math.max(0.8, Math.min(1.2, Math.log(count) / Math.log(5))),
    }))
    .sort((a, b) => b.count - a.count);

  const getColor = (index) => {
    const colors = [
      'text-blue-500 dark:text-blue-400',
      'text-green-500 dark:text-green-400',
      'text-purple-500 dark:text-purple-400',
      'text-red-500 dark:text-red-400',
      'text-yellow-500 dark:text-yellow-400',
      'text-indigo-500 dark:text-indigo-400',
    ];
    return colors[index % colors.length];
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 w-full max-w-2xl"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Filter by Language
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
              >
                <XMarkIcon className="w-6 h-6 text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            <div className="flex flex-wrap gap-3 mb-6">
              {languagesList.map((lang, index) => (
                <motion.button
                  key={lang.name}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onLanguageSelect(lang.name)}
                  className={`
                    px-4 py-2 rounded-lg text-sm font-medium transition-all
                    ${selectedLanguages.includes(lang.name)
                      ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900'
                      : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'}
                    ${getColor(index)}
                  `}
                >
                  {lang.name}
                  <span className="ml-2 opacity-60">
                    ({lang.count})
                  </span>
                </motion.button>
              ))}
            </div>

            <div className="flex justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => onLanguageSelect(null)}
                className="text-blue-500 hover:text-blue-600 dark:text-blue-400"
              >
                Clear all
              </button>
              <button
                onClick={onClose}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Apply Filters
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default LanguageCloud;