import React, { useState, useEffect, useMemo } from "react";
import RepoList from "./components/RepoList";
import {  MagnifyingGlassIcon } from "@heroicons/react/24/solid";
import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable';  // Change this import
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
      
      // Add title and styling
      doc.setFontSize(20);
      doc.setTextColor(44, 62, 80);
      doc.text("GitHub Repository Report", 14, 20);
      
      // Add metadata
      doc.setFontSize(12);
      doc.setTextColor(127, 140, 141);
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);
      doc.text(`Username: ${username || 'Repository Search'}`, 14, 37);
      doc.text(`Total Repositories: ${filteredAndSortedRepos.length}`, 14, 44);

      // Generate table with URL
      autoTable(doc, {
        startY: 55,
        head: [['Repository', 'Language', 'Stars', 'Forks', 'Last Updated', 'URL']],
        body: filteredAndSortedRepos.map(repo => [
          repo.name,
          repo.language || 'N/A',
          repo.stargazers_count.toLocaleString(),
          repo.forks_count.toLocaleString(),
          new Date(repo.updated_at).toLocaleDateString(),
          repo.html_url
        ]),
        styles: {
          fontSize: 10,
          cellPadding: 3,
        },
        headStyles: {
          fillColor: [41, 128, 185],
          textColor: 255,
          fontSize: 11,
          fontStyle: 'bold',
          halign: 'center'
        },
        alternateRowStyles: {
          fillColor: [245, 247, 250]
        },
        columnStyles: {
          0: { cellWidth: 50 },
          1: { cellWidth: 25 },
          2: { cellWidth: 20, halign: 'center' },
          3: { cellWidth: 20, halign: 'center' },
          4: { cellWidth: 30, halign: 'center' },
          5: { 
            cellWidth: 'auto',
            textColor: [41, 128, 185],
            fontStyle: 'bold',
            underline: true
          }
        },
        didParseCell: function(data) {
          // Make URLs clickable
          if (data.column.index === 5) {
            data.cell.link = data.cell.text;
          }
        },
        margin: { top: 55, left: 14, right: 14 },
        didDrawPage: (data) => {
          // Add footer
          doc.setFontSize(10);
          doc.setTextColor(127, 140, 141);
          doc.text(
            `Page ${data.pageNumber}`,
            data.settings.margin.left,
            doc.internal.pageSize.height - 10
          );
          
          // Add watermark
          doc.text(
            'Generated with GitHub Repo Explorer',
            doc.internal.pageSize.width - data.settings.margin.right,
            doc.internal.pageSize.height - 10,
            { align: 'right' }
          );
        }
      });

      // Save the PDF
      const filename = username 
        ? `${username}_repositories.pdf`
        : 'github_repositories.pdf';
      doc.save(filename);
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
                  <div className="relative group">
                    <select
                      value={sortOption}
                      onChange={(e) => setSortOption(e.target.value)}
                      className="appearance-none relative w-full text-sm pl-4 pr-10 py-2.5 rounded-xl
                        bg-gradient-to-r from-gray-50 to-white dark:from-gray-800/50 dark:to-gray-900/50
                        border border-gray-200 dark:border-gray-700
                        text-gray-700 dark:text-gray-200
                        shadow-sm hover:shadow-md
                        transition-all duration-200
                        cursor-pointer
                        focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:focus:ring-blue-500/50
                        group-hover:border-blue-500/50 dark:group-hover:border-blue-500/50
                        [&>option]:dark:bg-gray-900"
                    >
                      <option value="name-asc" className="py-2 dark:text-gray-200">Name (A-Z)</option>
                      <option value="name-desc" className="py-2 dark:text-gray-200">Name (Z-A)</option>
                      <option value="stars-desc" className="py-2 dark:text-gray-200">Most Stars ⭐</option>
                      <option value="stars-asc" className="py-2 dark:text-gray-200">Least Stars ⭐</option>
                    </select>
                    
                    {/* Custom arrow indicator */}
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <svg 
                        className="w-4 h-4 text-gray-500 dark:text-gray-400 group-hover:text-blue-500 transition-colors duration-200" 
                        xmlns="http://www.w3.org/2000/svg" 
                        viewBox="0 0 20 20" 
                        fill="currentColor"
                      >
                        <path 
                          fillRule="evenodd" 
                          d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" 
                          clipRule="evenodd" 
                        />
                      </svg>
                    </div>
                    
                    {/* Subtle gradient overlay */}
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/0 via-blue-500/0 to-blue-500/0 opacity-0 
                      group-hover:opacity-5 dark:group-hover:opacity-10 pointer-events-none transition-opacity duration-200" 
                    />
                  </div>
                  <button
                    onClick={() => setIsLanguageCloudOpen(true)}
                    className="relative group px-4 py-1.5 rounded-xl overflow-hidden transition-all duration-300"
                  >
                    {/* Background layers */}
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-600 transition-opacity" />
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-700 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.15] mix-blend-soft-light" />
                    
                    {/* Content */}
                    <div className="relative flex items-center gap-2">
                      <span className="text-sm font-medium text-white group-hover:translate-x-0.5 transition-transform duration-300">
                        Languages
                      </span>
                      {selectedLanguages.length > 0 && (
                        <span className="flex items-center justify-center bg-white/25 backdrop-blur-sm 
                          px-1.5 py-0.5 rounded-full text-xs font-medium text-white/90
                          shadow-inner shadow-white/10 group-hover:bg-white/30 transition-all duration-300"
                        >
                          {selectedLanguages.length}
                        </span>
                      )}
                    </div>
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
        repos={filteredAndSortedRepos}  // Add this line
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
