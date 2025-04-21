import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, Loader2, AlertCircle, FileText, BookOpen, Activity, Users, Code, Lightbulb } from 'lucide-react';
import { generateRepoInsights } from '../utils/aiAnalysis';
import ReactMarkdown from 'react-markdown';

const InsightSection = ({ icon: Icon, title, children }) => (
  <div className="mb-8 last:mb-0 bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-6 border border-gray-100 dark:border-gray-700/50 hover:border-blue-500/20 dark:hover:border-blue-500/20 transition-colors">
    <div className="flex items-center gap-3 mb-4">
      <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-900/30">
        <Icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
      </div>
      <h3 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h3>
    </div>
    <div className="pl-4 border-l-2 border-blue-100 dark:border-blue-900/30">
      {children}
    </div>
  </div>
);

const RepoInsights = ({ repo, isOpen, onClose }) => {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isAIGenerated, setIsAIGenerated] = useState(true);

  // Reset states when modal opens
  useEffect(() => {
    if (isOpen) {
      setInsights(null);
      setError(null);
      setIsAIGenerated(true);
    }
  }, [isOpen]);

  const fetchInsights = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await generateRepoInsights(repo);
      if (!result) {
        throw new Error('Failed to generate insights');
      }
      setInsights(result);
      // Check if the response is from AI or fallback
      setIsAIGenerated(!result.startsWith('Basic Repository Analysis:'));
    } catch (err) {
      setError(err.message);
      console.error('Error fetching insights:', err);
    } finally {
      setLoading(false);
    }
  };

  const renderMarkdown = (content) => {
    if (!content) return null;

    const sections = content.split('\n## ').filter(Boolean);
    const introSection = sections[0];
    const restSections = sections.slice(1);

    return (
      <div className="space-y-8">
        <div className="prose dark:prose-invert prose-lg max-w-none bg-gradient-to-b from-gray-50 to-white dark:from-gray-800/50 dark:to-gray-800 rounded-2xl p-6">
          <ReactMarkdown>{introSection}</ReactMarkdown>
        </div>
        
        {restSections.map((section, index) => {
          const [title, ...content] = section.split('\n');
          const icons = [BookOpen, Activity, Users, Code, Lightbulb];
          const Icon = icons[index % icons.length];

          return (
            <InsightSection key={index} icon={Icon} title={title}>
              <div className="prose dark:prose-invert prose-gray max-w-none 
                prose-p:text-gray-600 dark:prose-p:text-gray-300
                prose-ul:space-y-2 prose-li:text-gray-600 dark:prose-li:text-gray-300
                prose-strong:text-gray-900 dark:prose-strong:text-white
                prose-code:text-blue-600 dark:prose-code:text-blue-400
                prose-code:bg-blue-50 dark:prose-code:bg-blue-900/20
                prose-code:px-2 prose-code:py-0.5 prose-code:rounded-md
                prose-a:text-blue-600 dark:prose-a:text-blue-400 hover:prose-a:underline
              ">
                <ReactMarkdown>{content.join('\n')}</ReactMarkdown>
              </div>
            </InsightSection>
          );
        })}
      </div>
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-lg border border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden"
            style={{ maxHeight: '85vh' }}
          >
            {/* Header stays the same */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex-none">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                      Repository Insights
                    </h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {repo.name}
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"
                >
                  <X className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                </button>
              </div>
            </div>

            {/* Content wrapper */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              <div className="p-6 bg-white dark:bg-gray-900">
                {!insights && !loading && !error && (
                  <div className="relative flex flex-col items-center justify-center min-h-[300px]">
                    <div className="absolute inset-0">
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-blue-50/50 via-transparent to-transparent dark:from-blue-950/20" />
                    </div>

                    <div className="relative flex flex-col items-center gap-6">
                      <motion.div 
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="p-4 rounded-2xl bg-gradient-to-b from-blue-100/80 to-white dark:from-blue-900/30 dark:to-gray-900/50 shadow-lg shadow-blue-500/5 dark:shadow-blue-500/10 border border-blue-100/50 dark:border-blue-900/50"
                      >
                        <Sparkles className="w-10 h-10 text-blue-500 dark:text-blue-400" />
                      </motion.div>

                      <div className="max-w-xs text-center space-y-1.5">
                        <motion.h3 
                          initial={{ y: 10, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: 0.1 }}
                          className="text-xl font-bold text-gray-900 dark:text-white"
                        >
                          Repository Analysis
                        </motion.h3>
                        <motion.p
                          initial={{ y: 10, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: 0.2 }}
                          className="text-xs text-gray-500 dark:text-gray-400"
                        >
                          Get AI-powered insights about this repository
                        </motion.p>
                      </div>

                      <motion.button
                        onClick={fetchInsights}
                        initial={{ y: 10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="relative group"
                      >
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg blur opacity-60 group-hover:opacity-100 transition duration-200" />
                        <div className="relative flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-gray-900 rounded-lg border border-blue-100 dark:border-blue-900/50">
                          <Sparkles className="w-4 h-4 text-blue-500 dark:text-blue-400 group-hover:animate-pulse" />
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            Generate Insights
                          </span>
                        </div>
                      </motion.button>
                    </div>
                  </div>
                )}

                {insights && (
                  <div className="flex flex-col">
                    <div className="flex-none space-y-2 mb-4">
                      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs
                        ${isAIGenerated 
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                          : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                        }`}
                      >
                        {isAIGenerated ? (
                          <>
                            <Sparkles className="w-3 h-3" />
                            <span>AI-Powered Analysis</span>
                          </>
                        ) : (
                          <>
                            <FileText className="w-3 h-3" />
                            <span>Basic Analysis</span>
                          </>
                        )}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                        <span>•</span>
                        <span>Generated {new Date().toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {renderMarkdown(insights)}
                    </div>
                  </div>
                )}

                {loading && (
                  <div className="flex items-center justify-center gap-3 text-gray-600 dark:text-gray-400">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Analyzing repository...</span>
                  </div>
                )}

                {error && (
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 text-red-500 mb-4">
                      <AlertCircle className="w-5 h-5" />
                      <span>{error}</span>
                    </div>
                    <button
                      onClick={fetchInsights}
                      className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                    >
                      Try Again
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default RepoInsights;