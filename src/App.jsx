import React, { useState, useEffect } from "react";
import RepoList from "./components/RepoList";
import ExportDropdown from "./components/ExportDropdown";
import { MoonIcon, SunIcon,SearchIcon} from "@heroicons/react/solid";
import { jsPDF } from "jspdf";
import { motion } from "framer-motion";



function App() {
  const [username, setUsername] = useState("");
  const [repos, setRepos] = useState([]);
  const [error, setError] = useState(""); // Error state
  const [sortOption, setSortOption] = useState("name-asc");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [searchType, setSearchType] = useState("username"); // Add this new state
  const [repoSearch, setRepoSearch] = useState("");
  const reposPerPage = 6;
  const GITHUB_TOKEN = import.meta.env.VITE_GITHUB_TOKEN;

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  useEffect(() => {
    document.body.classList.toggle("dark", darkMode);
  }, [darkMode]);

  const exportData = (format) => {
    if (filteredRepos.length === 0) {
      alert("No repositories to export.");
      return;
    }

    if (format === "json") {
      const jsonContent = JSON.stringify(filteredRepos, null, 2);
      const blob = new Blob([jsonContent], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${username}_filtered_repositories.json`;
      a.click();
      URL.revokeObjectURL(url);
    } else if (format === "csv") {
      const headers = ["Name", "Description", "Stars", "Forks", "Language", "Contributors", "URL"];
      const rows = filteredRepos.map((repo) => [
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
      filteredRepos.forEach((repo, index) => {
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); // Reset error before the new search
    setRepos([]);
    setLoading(true);
    setCurrentPage(1);
    setSubmitted(true);

    if (!username) {
      setError("Please enter a GitHub username.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `https://api.github.com/users/${username}/repos`,
        {
          headers: {
            Authorization: `token ${GITHUB_TOKEN}`,
          },
        }
      );
      if (!response.ok) throw new Error("User not found or error occurred.");
      const data = await response.json();
      const reposWithContributors = await Promise.all(
        data.map(async (repo) => {
          try {
            const contributorsResponse = await fetch(
              `https://api.github.com/repos/${repo.owner.login}/${repo.name}/contributors`,
              {
                headers: {
                  Authorization: `token ${GITHUB_TOKEN}`,
                },
              }
            );
            if (contributorsResponse.ok) {
              const contributors = await contributorsResponse.json();
              return { ...repo, contributors_count: contributors.length };
            }
          } catch {
            return { ...repo, contributors_count: "N/A" };
          }
          return { ...repo, contributors_count: "N/A" };
        })
      );
      setRepos(reposWithContributors);
    } catch (err) {
      setError(`Error: ${err.message}`); // Set the error message here
    } finally {
      setLoading(false);
    }
  };
  const handleRepoSearch = async () => {
    setError("");
    setRepos([]);
    setLoading(true);
    setCurrentPage(1);
    setSubmitted(true);
  
    try {
      const response = await fetch(
        `https://api.github.com/search/repositories?q=${repoSearch}`,
        {
          headers: {
            Authorization: `token ${GITHUB_TOKEN}`,
          },
        }
      );
      if (!response.ok) throw new Error("Error searching repositories");
      const data = await response.json();
      const reposWithContributors = await Promise.all(
        data.items.map(async (repo) => {
          try {
            const contributorsResponse = await fetch(
              `https://api.github.com/repos/${repo.owner.login}/${repo.name}/contributors`,
              {
                headers: {
                  Authorization: `token ${GITHUB_TOKEN}`,
                },
              }
            );
            if (contributorsResponse.ok) {
              const contributors = await contributorsResponse.json();
              return { ...repo, contributors_count: contributors.length };
            }
          } catch {
            return { ...repo, contributors_count: "N/A" };
          }
          return { ...repo, contributors_count: "N/A" };
        })
      );
      setRepos(reposWithContributors);
    } catch (err) {
      setError(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const sortedRepos = [...repos].sort((a, b) => {
    if (sortOption === "name-asc") return a.name.localeCompare(b.name);
    if (sortOption === "name-desc") return b.name.localeCompare(a.name);
    if (sortOption === "stars-desc") return b.stargazers_count - a.stargazers_count;
    if (sortOption === "stars-asc") return a.stargazers_count - b.stargazers_count;
    return 0;
  });

  // Replace the existing filteredRepos constant with this:
const filteredRepos = sortedRepos.filter((repo) => {
  const query = searchQuery.toLowerCase();
  if (searchType === "username") {
    // For username search, filter by repository name only
    return repo.name.toLowerCase().includes(query);
  } else {
    // For repository search, filter by repository name or owner's username
    return (
      repo.name.toLowerCase().includes(query) || 
      repo.owner.login.toLowerCase().includes(query)
    );
  }
});
  const indexOfLastRepo = currentPage * reposPerPage;
  const indexOfFirstRepo = indexOfLastRepo - reposPerPage;
  const currentRepos = filteredRepos.slice(indexOfFirstRepo, indexOfLastRepo);
  const totalPages = Math.ceil(filteredRepos.length / reposPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gray-50 dark:bg-gray-900">
      <h1 className="text-5xl font-extrabold mb-8 text-gray-800 dark:text-white">
        🚀 GitHub Repo Explorer
      </h1>

    {/* Search Form */}
    <motion.div
  initial={{ opacity: 0, y: -20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.6 }}
  className="w-full max-w-2xl bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl mb-8"
>
  <div className="mb-4 flex gap-4">
    <button
      onClick={() => setSearchType("username")}
      className={`px-4 py-2 rounded-lg ${
        searchType === "username"
          ? "bg-blue-500 text-white"
          : "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200"
      }`}
    >
      Search by Username
    </button>
    <button
      onClick={() => setSearchType("repository")}
      className={`px-4 py-2 rounded-lg ${
        searchType === "repository"
          ? "bg-blue-500 text-white"
          : "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200"
      }`}
    >
      Search by Repository
    </button>
  </div>
  
  <form
    onSubmit={(e) => {
      e.preventDefault();
      if (searchType === "username") {
        handleSubmit(e);
      } else {
        handleRepoSearch();
      }
    }}
    className="flex items-center space-x-4"
  >
    <div className="relative flex-1">
      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
        <SearchIcon className="h-5 w-5" />
      </span>
      <input
        type="text"
        value={searchType === "username" ? username : repoSearch}
        onChange={(e) => {
          if (searchType === "username") {
            setUsername(e.target.value);
          } else {
            setRepoSearch(e.target.value);
          }
        }}
        placeholder={
          searchType === "username"
            ? "Enter GitHub username..."
            : "Search repositories..."
        }
        className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-gray-900 dark:border-gray-700 dark:text-white"
      />
    </div>
    <button
      type="submit"
      className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition active:scale-95 shadow-md"
    >
      <SearchIcon className="w-5 h-5" />
      <span>Search</span>
    </button>
  </form>
</motion.div>
      {/* Display error message */}
      {error && (
        <p className="text-red-500 text-lg mb-4">
          {error}
        </p>
      )}

      {/* Sort & Filter */}
      {repos.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="w-full max-w-2xl bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-lg flex flex-col md:flex-row md:items-center md:space-x-4 space-y-4 md:space-y-0 mb-6"
        >
          <select
            value={sortOption}
            onChange={(e) => {
              setSortOption(e.target.value);
              setCurrentPage(1);
            }}
            className="flex-1 border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-gray-900 dark:border-gray-700 dark:text-white"
          >
            <option value="name-asc">Name (A-Z)</option>
            <option value="name-desc">Name (Z-A)</option>
            <option value="stars-desc">Stars (High to Low)</option>
            <option value="stars-asc">Stars (Low to High)</option>
          </select>

          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search repositories..."
            className="flex-1 border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-gray-900 dark:border-gray-700 dark:text-white"
          />
        </motion.div>
      )}

{repos.length > 0 && (
  <motion.div
    initial={{ opacity: 0, x: 20, y: -20 }}
    animate={{ opacity: 1, x: 0, y: 0 }}
    transition={{ duration: 0.5 }}
    className="fixed top-6 right-6 z-50"
  >
    <ExportDropdown onExport={exportData} />
  </motion.div>
)}
      {loading ? (
        <RepoList repos={[]} loading={true} />
      ) : submitted && repos.length === 0 && !error ? (
        <p className="mt-6 text-gray-600 dark:text-gray-300 text-lg">
          No repositories found for <span className="font-semibold">{username}</span>.
        </p>
      ) : (
        <RepoList repos={currentRepos} loading={loading} />
      )}

      {filteredRepos.length > 0 && !loading && (
        <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-center space-x-2 mt-10"
      >
        <button
          onClick={handlePrevPage}
          disabled={currentPage === 1}
          className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Prev
        </button>
      
        {[...Array(totalPages)].map((_, index) => {
          const pageNumber = index + 1;
          return (
            <button
              key={pageNumber}
              onClick={() => setCurrentPage(pageNumber)}
              className={`px-3 py-2 rounded-lg text-sm font-medium border ${
                currentPage === pageNumber
                  ? "bg-blue-500 text-white border-blue-500"
                  : "border-gray-300 text-gray-700 bg-white hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600"
              }`}
            >
              {pageNumber}
            </button>
          );
        })}
      
        <button
          onClick={handleNextPage}
          disabled={currentPage === totalPages}
          className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </motion.div>
      
      )}

      <button
        onClick={toggleDarkMode}
        className="fixed bottom-6 right-6 p-3 bg-gray-800 text-white rounded-full shadow-md hover:bg-gray-700 focus:outline-none transition"
      >
        {darkMode ? <SunIcon className="w-6 h-6" /> : <MoonIcon className="w-6 h-6" />}
      </button>
    </div>
  );
}

export default App;
