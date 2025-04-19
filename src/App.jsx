import React, { useState, useEffect, useMemo } from "react";
import RepoList from "./components/RepoList";
import { MoonIcon, SunIcon, MagnifyingGlassIcon } from "@heroicons/react/24/solid";
import { jsPDF } from "jspdf";
import { motion } from "framer-motion";
import ReadmeModal from "./components/ReadmeModal";
import { Octokit } from "@octokit/rest";
import LanguageCloud from './components/LanguageCloud';
import { useInfiniteRepos } from './hooks/useInfiniteRepos';
import InfiniteRepoList from './components/InfiniteRepoList';
import ActionBar from './components/ActionBar';

const GITHUB_TOKEN = import.meta.env.VITE_GITHUB_TOKEN; 

function App() {
  const [octokit] = useState(() => new Octokit({
    auth: import.meta.env.VITE_GITHUB_TOKEN
  }));

  const [username, setUsername] = useState("");
  const [error, setError] = useState(""); // Error state
  const [sortOption, setSortOption] = useState("name-asc");
  const [searchQuery, setSearchQuery] = useState("");
  const [darkMode, setDarkMode] = useState(() => {
    const savedMode = localStorage.getItem('darkMode');
    return savedMode ? JSON.parse(savedMode) : false;
  });
  const [submitted, setSubmitted] = useState(false);
  const [searchType, setSearchType] = useState("username"); // Add this new state
  const [repoSearch, setRepoSearch] = useState("");
  const [selectedReadme, setSelectedReadme] = useState(null);
  const [readmeContent, setReadmeContent] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLanguages, setSelectedLanguages] = useState([]);
  const [isLanguageCloudOpen, setIsLanguageCloudOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [allRepos, setAllRepos] = useState([]);

  // Update the useInfiniteRepos initialization
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isInfiniteLoading,
    refetch: refetchInfinite
  } = useInfiniteRepos(
    searchType === "username" ? username : null,
    searchType === "repository" ? repoSearch : null,
    searchType
  );

  // Update the filteredAndSortedRepos memo
  const filteredAndSortedRepos = useMemo(() => {
    let filtered = [...allRepos];

    // Filter by search query - check both repo name and owner username
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(repo =>
        repo.name.toLowerCase().includes(query) ||
        (repo.description && repo.description.toLowerCase().includes(query)) ||
        (repo.owner && repo.owner.login.toLowerCase().includes(query))
      );
    }

    // Filter by selected languages
    if (selectedLanguages.length > 0) {
      filtered = filtered.filter(repo =>
        repo.language && selectedLanguages.includes(repo.language)
      );
    }

    // Sort repos
    if (sortOption === "name-asc") return filtered.sort((a, b) => a.name.localeCompare(b.name));
    if (sortOption === "name-desc") return filtered.sort((a, b) => b.name.localeCompare(a.name));
    if (sortOption === "stars-desc") return filtered.sort((a, b) => b.stargazers_count - a.stargazers_count);
    if (sortOption === "stars-asc") return filtered.sort((a, b) => a.stargazers_count - b.stargazers_count);
    return filtered;
  }, [allRepos, searchQuery, selectedLanguages, sortOption]);

  const toggleDarkMode = () => {
    setDarkMode(prevMode => {
      const newMode = !prevMode;
      localStorage.setItem('darkMode', JSON.stringify(newMode));
      return newMode;
    });
  };

  useEffect(() => {
    document.body.classList.toggle("dark", darkMode);
  }, [darkMode]);

  const exportData = (format) => {
    if (filteredAndSortedRepos.length === 0) {
      alert("No repositories to export.");
      return;
    }

    if (format === "json") {
      const jsonContent = JSON.stringify(filteredAndSortedRepos, null, 2);
      const blob = new Blob([jsonContent], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${username}_filtered_repositories.json`;
      a.click();
      URL.revokeObjectURL(url);
    } else if (format === "csv") {
      const headers = ["Name", "Description", "Stars", "Forks", "Language", "Contributors", "URL"];
      const rows = filteredAndSortedRepos.map((repo) => [
        repo.name,
        repo.description || "N/A",
        repo.stargazers_count,
        repo.forks_count,
        repo.language || "N/A",
        repo.contributors_count || "N/A",
        repo.html_url,
      ]);
      const csvContent = [headers, ...rows].map((row) => row.map((item) => `"${item}"`).join(",")).join("\n");
      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${username}_filtered_repositories.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } else if (format === "pdf") {
      const doc = new jsPDF();
      doc.setFontSize(12);
      doc.text("Filtered GitHub Repositories", 10, 10);
      const headers = ["#", "Name", "Stars", "Forks", "Language", "URL"];
      let y = 20;
      doc.text(headers.join(" | "), 10, y);
      filteredAndSortedRepos.forEach((repo, index) => {
        y += 10;
        const row = [
          index + 1,
          repo.name,
          repo.stargazers_count,
          repo.forks_count,
          repo.language || "N/A",
          repo.html_url,
        ];
        doc.text(row.join(" | "), 10, y);
      });
      doc.save(`${username}_filtered_repositories.pdf`);
    }
  };

  const fetchReadme = async (owner, repo) => {
    try {
      const response = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/readme`,
        {
          headers: {
            Authorization: `token ${GITHUB_TOKEN}`,
            Accept: "application/vnd.github.raw",
          },
        }
      );
      if (!response.ok) throw new Error("README not found");
      const content = await response.text();
      setReadmeContent(content);
      setIsModalOpen(true);
    } catch (err) {
      setReadmeContent("No README found for this repository.");
      setIsModalOpen(true);
    }
  };

  const getAllLanguages = () => {
    const languages = {};
    allRepos.forEach(repo => {
      if (repo.language) {
        languages[repo.language] = (languages[repo.language] || 0) + 1;
      }
    });
    return languages;
  };

  const handleLanguageSelect = (language) => {
    if (language === null) {
      setSelectedLanguages([]);
      return;
    }
    
    setSelectedLanguages(prev => {
      if (prev.includes(language)) {
        return prev.filter(l => l !== language);
      }
      return [...prev, language];
    });
  };

  // Update the handleSubmit function
  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    
    if (searchType === "username" && !username) {
      setError("Please enter a GitHub username.");
      return;
    }
    
    if (searchType === "repository" && !repoSearch) {
      setError("Please enter a search term.");
      return;
    }

    refetchInfinite();
  };

  // Update the useEffect to sync infinite query results with allRepos
  useEffect(() => {
    if (data?.pages) {
      const repos = data.pages.flatMap(page => page.repos);
      setAllRepos(repos);
    }
  }, [data]);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Enhanced Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-block mb-6">
            <div className="flex items-center justify-center p-3 bg-blue-500 rounded-2xl shadow-lg transform -rotate-3 hover:rotate-0 transition-transform duration-300">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
          <h1 className="text-5xl font-black text-gray-800 dark:text-white mb-4 tracking-tight">
            GitHub Repo Explorer
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto">
            Discover and explore GitHub repositories with ease
          </p>
        </motion.div>

        {/* Enhanced Search Section */}
        <div className="max-w-2xl mx-auto mb-12">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg p-6 rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50"
          >
            <div className="mb-6 grid grid-cols-2 gap-3">
              <button
                onClick={() => setSearchType("username")}
                className={`px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                  searchType === "username"
                    ? "bg-blue-500 text-white shadow-md"
                    : "bg-gray-100 text-gray-600 dark:bg-gray-700/50 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                }`}
              >
                Search by Username
              </button>
              <button
                onClick={() => setSearchType("repository")}
                className={`px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                  searchType === "repository"
                    ? "bg-blue-500 text-white shadow-md"
                    : "bg-gray-100 text-gray-600 dark:bg-gray-700/50 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                }`}
              >
                Search by Repository
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400">
                  <MagnifyingGlassIcon className="h-5 w-5" />
                </span>
                <input
                  type="text"
                  value={searchType === "username" ? username : repoSearch}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (searchType === "username") {
                      setUsername(value);
                    } else {
                      setRepoSearch(value);
                      if (value.length >= 3) {
                        refetchInfinite();
                      } else {
                        setAllRepos([]);
                      }
                    }
                  }}
                  placeholder={
                    searchType === "username"
                      ? "Enter GitHub username..."
                      : "Search repositories..."
                  }
                  className="w-full border border-gray-200 dark:border-gray-700 rounded-xl pl-12 pr-4 py-4 
                    bg-white dark:bg-gray-900 text-gray-900 dark:text-white
                    focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400
                    placeholder-gray-400 dark:placeholder-gray-500"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700
                  text-white px-6 py-4 rounded-xl font-semibold transition-all duration-200
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                  active:scale-[0.98] shadow-lg"
              >
                <span className="flex items-center justify-center gap-2">
                  <MagnifyingGlassIcon className="w-5 h-5" />
                  <span>Search GitHub</span>
                </span>
              </button>
            </form>
          </motion.div>
        </div>

        {/* Error message with improved styling */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto mb-8"
          >
            <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 
              rounded-xl p-4 text-red-600 dark:text-red-400 text-center font-medium">
              {error}
            </div>
          </motion.div>
        )}

        {/* Filter Section - Centered */}
        {allRepos.length > 0 && (
          <div className="max-w-2xl mx-auto mb-6">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-lg space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex-1 relative">
                    <MagnifyingGlassIcon className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Filter by repository name or owner..."
                      className="w-full pl-9 pr-4 py-1.5 text-sm border border-gray-300 dark:border-gray-600 
                        rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 
                        dark:bg-gray-900 dark:text-white"
                    />
                  </div>
                  <select
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value)}
                    className="text-sm px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-gray-900 dark:text-white"
                  >
                    <option value="name-asc">Name (A-Z)</option>
                    <option value="name-desc">Name (Z-A)</option>
                    <option value="stars-desc">Stars ↓</option>
                    <option value="stars-asc">Stars ↑</option>
                  </select>
                  <button
                    onClick={() => setIsLanguageCloudOpen(true)}
                    className="text-sm px-4 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors flex items-center gap-2"
                  >
                    Languages
                    {selectedLanguages.length > 0 && (
                      <span className="bg-white/20 px-1.5 py-0.5 rounded-full text-xs">
                        {selectedLanguages.length}
                      </span>
                    )}
                  </button>
                </div>

                {selectedLanguages.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                      Filters:
                    </span>
                    {selectedLanguages.map(lang => (
                      <span
                        key={lang}
                        className="inline-flex items-center px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs"
                      >
                        {lang}
                        <button
                          onClick={() => handleLanguageSelect(lang)}
                          className="ml-1 hover:text-blue-800 dark:hover:text-blue-200"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                    <button
                      onClick={() => setSelectedLanguages([])}
                      className="text-xs text-blue-500 hover:text-blue-600 dark:text-blue-400 ml-auto"
                    >
                      Clear all
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}

        {/* Repository List Section - Full Width */}
        <div className="max-w-7xl mx-auto">
          {loading || isInfiniteLoading ? (
            <RepoList repos={[]} loading={true} />
          ) : submitted && allRepos.length === 0 && !error ? (
            <p className="mt-6 text-gray-600 dark:text-gray-300 text-lg text-center">
              No repositories found for {searchType === "username" ? (
                <span className="font-semibold">{username}</span>
              ) : (
                <span className="font-semibold">"{repoSearch}"</span>
              )}.
            </p>
          ) : (
            <InfiniteRepoList
              repos={filteredAndSortedRepos}
              hasNextPage={searchType === "username" ? hasNextPage : false}
              fetchNextPage={fetchNextPage}
              isFetchingNextPage={isFetchingNextPage}
              loading={loading || isInfiniteLoading}
              onReadmeClick={fetchReadme}
              octokit={octokit}
            />
          )}
        </div>
      </div>

      <ReadmeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        content={readmeContent}
        repoName={selectedReadme}
      />

      {isFetchingNextPage && (
        <div className="fixed bottom-20 right-6 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg">
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
            <span>Loading more repositories...</span>
          </div>
        </div>
      )}

      <ActionBar 
        onExport={exportData}
        octokit={octokit}
        isDark={darkMode}
        onThemeToggle={toggleDarkMode}
      />

      <LanguageCloud
        isOpen={isLanguageCloudOpen}
        onClose={() => setIsLanguageCloudOpen(false)}
        languages={getAllLanguages()}
        selectedLanguages={selectedLanguages}
        onLanguageSelect={handleLanguageSelect}
      />
    </div>
  );
}

export default App;
