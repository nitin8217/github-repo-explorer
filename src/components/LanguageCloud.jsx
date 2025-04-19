import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon } from "@heroicons/react/24/outline";

const LanguageCloud = ({ isOpen, onClose, languages, selectedLanguages, onLanguageSelect }) => {
  if (!languages || Object.keys(languages).length === 0) return null;

  const languagesList = Object.entries(languages)
    .map(([name, count]) => ({
      name,
      count,
      percentage: Math.round((count / Object.values(languages).reduce((a, b) => a + b, 0)) * 100)
    }))
    .sort((a, b) => b.count - a.count);

  const colorClasses = {
    JavaScript: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800',
    TypeScript: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    Python: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800',
    Java: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800',
    Ruby: 'bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 border-pink-200 dark:border-pink-800',
    default: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700'
  };

  const getLanguageColor = (language) => {
    return colorClasses[language] || colorClasses.default;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden"
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    Languages ({Object.keys(languages).length})
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Select languages to filter repositories
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                >
                  <XMarkIcon className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                </button>
              </div>
            </div>

            {/* Language Grid */}
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {languagesList.map((lang) => (
                  <motion.button
                    key={lang.name}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onLanguageSelect(lang.name)}
                    className={`
                      relative p-4 rounded-xl border transition-all
                      ${selectedLanguages.includes(lang.name)
                        ? 'ring-2 ring-blue-500 dark:ring-blue-400'
                        : 'hover:border-blue-300 dark:hover:border-blue-700'}
                      ${getLanguageColor(lang.name)}
                    `}
                  >
                    <div className="flex flex-col items-start gap-1">
                      <span className="font-medium">{lang.name}</span>
                      <div className="flex items-center gap-2 text-sm opacity-75">
                        <span>{lang.count} repos</span>
                        <span>·</span>
                        <span>{lang.percentage}%</span>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => onLanguageSelect(null)}
                  className="text-sm text-blue-500 hover:text-blue-600 dark:text-blue-400"
                >
                  Clear selection ({selectedLanguages.length})
                </button>
                <button
                  onClick={onClose}
                  className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                >
                  Apply
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LanguageCloud;