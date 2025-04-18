import React from "react";
import Modal from "react-modal";
import ReactMarkdown from "react-markdown";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";

Modal.setAppElement("#root");

const ReadmeModal = ({ isOpen, onClose, content, repoName }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <Modal
          isOpen={isOpen}
          onRequestClose={onClose}
          style={{
            overlay: {
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              backdropFilter: 'blur(8px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000
            },
            content: {
              position: 'relative',
              top: 'auto',
              left: 'auto',
              right: 'auto',
              bottom: 'auto',
              maxWidth: '900px',
              width: '90%',
              maxHeight: '85vh',
              padding: '0',
              border: 'none',
              borderRadius: '1rem',
              background: 'transparent'
            }
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700"
          >
            {/* Header */}
            <div className="sticky top-0 z-10 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between px-6 py-4">
                <h2 className="text-xl font-bold bg-gradient-to-r from-blue-500 to-blue-400 dark:from-blue-400 dark:to-blue-300 bg-clip-text text-transparent">
                  {repoName} - README
                </h2>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <XMarkIcon className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                </motion.button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(85vh-4rem)] dark:bg-gray-900 dark:text-white">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="prose dark:prose-invert max-w-none
                  prose-headings:scroll-mt-16
                  prose-h1:text-3xl prose-h1:font-bold prose-h1:text-gray-900 dark:prose-h1:text-gray-50
                  prose-h2:text-2xl prose-h2:font-semibold prose-h2:text-gray-800 dark:prose-h2:text-gray-100
                  prose-h3:text-xl prose-h3:font-semibold prose-h3:text-gray-800 dark:prose-h3:text-gray-200
                  prose-p:text-gray-600 dark:prose-p:text-gray-300
                  prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline
                  prose-strong:font-bold prose-strong:text-gray-900 dark:prose-strong:text-gray-100
                  prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md
                  prose-code:bg-gray-100 dark:prose-code:bg-gray-800 
                  prose-code:text-gray-800 dark:prose-code:text-gray-200
                  prose-pre:bg-gray-900 dark:prose-pre:bg-black/50
                  prose-pre:border dark:prose-pre:border-gray-800
                  prose-img:rounded-xl prose-img:shadow-lg
                  prose-ul:text-gray-600 dark:prose-ul:text-gray-300
                  prose-ol:text-gray-600 dark:prose-ol:text-gray-300
                  prose-li:marker:text-gray-400 dark:prose-li:marker:text-gray-500
                  prose-blockquote:text-gray-600 dark:prose-blockquote:text-gray-300
                  prose-blockquote:border-l-4 prose-blockquote:border-gray-300 dark:prose-blockquote:border-gray-700
                  prose-hr:border-gray-200 dark:prose-hr:border-gray-
                  "
              >
                <ReactMarkdown>{content}</ReactMarkdown>
              </motion.div>
            </div>
          </motion.div>
        </Modal>
      )}
    </AnimatePresence>
  );
};

export default ReadmeModal;