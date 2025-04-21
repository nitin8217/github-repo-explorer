import React from "react";
import Modal from "react-modal";
import ReactMarkdown from "react-markdown";
import { BookOpen, X } from "lucide-react";
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
              backgroundColor: 'rgba(0, 0, 0, 0.75)',
              backdropFilter: 'blur(8px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
              padding: '2rem'
            },
            content: {
              position: 'relative',
              top: 'auto',
              left: 'auto',
              right: 'auto',
              bottom: 'auto',
              maxWidth: '1000px',
              width: '95%',
              maxHeight: '90vh',
              padding: '0',
              border: 'none',
              borderRadius: '1.5rem',
              background: 'transparent',
              overflow: 'hidden'
            }
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden border border-gray-200/50 dark:border-gray-700/50"
          >
            {/* Header */}
            <div className="sticky top-0 z-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50">
              <div className="flex items-center gap-3 px-8 py-5">
                <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-900/30">
                  <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white truncate">
                    {repoName}
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">README.md</p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onClose}
                  className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                </motion.button>
              </div>
            </div>

            {/* Content */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-b from-white/50 to-white dark:from-gray-900/50 dark:to-gray-900 pointer-events-none h-8 z-10" />
              <div className="p-8 overflow-y-auto max-h-[calc(90vh-5rem)] prose-lg">
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="prose dark:prose-invert prose-slate max-w-none
                    prose-headings:scroll-mt-20
                    prose-h1:text-3xl prose-h1:font-extrabold prose-h1:text-gray-900 dark:prose-h1:text-white
                    prose-h2:text-2xl prose-h2:font-bold prose-h2:text-gray-800 dark:prose-h2:text-gray-100
                    prose-h3:text-xl prose-h3:font-semibold prose-h3:text-gray-800 dark:prose-h3:text-gray-200
                    prose-p:text-gray-600 dark:prose-p:text-gray-300 prose-p:leading-relaxed
                    prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-a:font-medium prose-a:no-underline hover:prose-a:underline
                    prose-strong:font-bold prose-strong:text-gray-900 dark:prose-strong:text-white
                    prose-code:px-2 prose-code:py-1 prose-code:rounded-md prose-code:text-sm
                    prose-code:bg-gray-100 dark:prose-code:bg-gray-800/50
                    prose-code:text-gray-800 dark:prose-code:text-gray-200
                    prose-pre:bg-gray-900 dark:prose-pre:bg-black/30
                    prose-pre:border dark:prose-pre:border-gray-800/50 prose-pre:p-4
                    prose-img:rounded-xl prose-img:shadow-lg prose-img:border prose-img:border-gray-200/50 dark:prose-img:border-gray-700/50
                    prose-ul:text-gray-600 dark:prose-ul:text-gray-300
                    prose-ol:text-gray-600 dark:prose-ol:text-gray-300
                    prose-li:marker:text-gray-400 dark:prose-li:marker:text-gray-500
                    prose-blockquote:text-gray-600 dark:prose-blockquote:text-gray-300
                    prose-blockquote:border-l-4 prose-blockquote:border-blue-500/50 dark:prose-blockquote:border-blue-400/30
                    prose-hr:border-gray-200 dark:prose-hr:border-gray-700/50
                    selection:bg-blue-100 dark:selection:bg-blue-900/30
                  "
                >
                  <ReactMarkdown>{content}</ReactMarkdown>
                </motion.div>
              </div>
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-white to-transparent dark:from-gray-900 h-8 pointer-events-none z-10" />
            </div>
          </motion.div>
        </Modal>
      )}
    </AnimatePresence>
  );
};

export default ReadmeModal;