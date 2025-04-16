import React, { useState, useEffect } from "react";
import RepoList from "./components/RepoList";
import { MoonIcon, SunIcon } from "@heroicons/react/solid";
import { jsPDF } from "jspdf"; // Import jsPDF for PDF generation

function App() {
  const [username, setUsername] = useState("");
  const [repos, setRepos] = useState([]);
  const [error, setError] = useState("");
  const [sortOption, setSortOption] = useState("name-asc");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const reposPerPage = 6;

  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  // Apply dark mode class to body
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add("dark");
    } else {
      document.body.classList.remove("dark");
    }
  }, [darkMode]);

  // Export repositories in the selected format
  const exportData = (format) => {
    if (filteredRepos.length === 0) {
      alert("No repositories to export.");
      return;
    }

    if (format === "json") {
      // Export as JSON
      const jsonContent = JSON.stringify(filteredRepos, null, 2);
      const blob = new Blob([jsonContent], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${username}repositories.json`;
      a.click();
      URL.revokeObjectURL(url);
    } else if (format === "csv") {
      // Export as CSV
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

      const csvContent = [headers, ...rows]
        .map((row) => row.map((item) => `"${item}"`).join(","))
        .join("\n");

      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${username}_repositories.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } else if (format === "pdf") {
      // Export as PDF
      const doc = new jsPDF();
      doc.setFontSize(12);
      doc.text("Filtered GitHub Repositories", 10, 10);
  
      // Add table headers
      const headers = ["#", "Name", "Stars", "Forks", "Language", "URL"];
      let y = 20;
      doc.text(headers.join(" -- "), 10, y);
  
      // Add repository data
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
        doc.text(row.join(" -- "), 10, y);
      });
  
      doc.save(`${username}_repositories.pdf`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
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
        `https://api.github.com/users/${username}/repos`
      );
      if (!response.ok) {
        throw new Error("User not found.");
      }
      const data = await response.json();

      const reposWithContributors = await Promise.all(
        data.map(async (repo) => {
          try {
            const contributorsResponse = await fetch(
              `https://api.github.com/repos/${repo.owner.login}/${repo.name}/contributors`
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
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const sortedRepos = [...repos].sort((a, b) => {
    if (sortOption === "name-asc") {
      return a.name.localeCompare(b.name);
    } else if (sortOption === "name-desc") {
      return b.name.localeCompare(a.name);
    } else if (sortOption === "stars-desc") {
      return b.stargazers_count - a.stargazers_count;
    } else if (sortOption === "stars-asc") {
      return a.stargazers_count - b.stargazers_count;
    }
    return 0;
  });

  const filteredRepos = sortedRepos.filter((repo) =>
    repo.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const indexOfLastRepo = currentPage * reposPerPage;
  const indexOfFirstRepo = indexOfLastRepo - reposPerPage;
  const currentRepos = filteredRepos.slice(indexOfFirstRepo, indexOfLastRepo);
  const totalPages = Math.ceil(filteredRepos.length / reposPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gray-50 dark:bg-gray-900">
      <h1 className="text-5xl font-extrabold mb-8 text-gray-800 dark:text-white">
        🚀 GitHub Repo Explorer
      </h1>

      <form onSubmit={handleSubmit} className="flex space-x-4 mb-6">
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Enter GitHub username"
          className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
        />
        <button
          type="submit"
          className="bg-blue-500 text-white px-5 py-2 rounded-lg hover:bg-blue-600 transition"
        >
          Search
        </button>
      </form>
      {error && (
        <p className="mb-4 text-red-500 font-medium">{error}</p>
      )}

      {repos.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <select
            value={sortOption}
            onChange={(e) => {
              setSortOption(e.target.value);
              setCurrentPage(1);
            }}
            className="border border-gray-300 rounded px-3 py-2 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
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
            className="border border-gray-300 rounded px-3 py-2 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
          />
        </div>
      )}

      {repos.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <button
            onClick={() => exportData("json")}
            className="bg-blue-500 text-white px-5 py-2 rounded-lg hover:bg-blue-600 transition"
          >
            Export as JSON
          </button>
          <button
            onClick={() => exportData("csv")}
            className="bg-green-500 text-white px-5 py-2 rounded-lg hover:bg-green-600 transition"
          >
            Export as CSV
          </button>
          <button
            onClick={() => exportData("pdf")}
            className="bg-red-500 text-white px-5 py-2 rounded-lg hover:bg-red-600 transition"
          >
            Export as PDF
          </button>
        </div>
      )}

      {loading ? (
         <RepoList repos={[]} loading={true} />
      ) : submitted && repos.length === 0 && !error ? (
        <p className="mt-6 text-gray-600 dark:text-gray-300 text-lg">
          No repositories found for{" "}
          <span className="font-semibold">{username}</span>.
        </p>
      ) : (
        <RepoList repos={currentRepos} loading={loading} />
      )}

      {filteredRepos.length > 0 && !loading && (
        <div className="flex items-center gap-4 mt-8">
          <button
            onClick={handlePrevPage}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
          >
            Previous
          </button>
          <span className="font-medium text-gray-900 dark:text-gray-100">
            Page {currentPage} of {totalPages}
          </span>

          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      <button
        onClick={toggleDarkMode}
        className="absolute top-6 right-6 p-3 bg-gray-800 text-white rounded-full shadow-md hover:bg-gray-700 focus:outline-none transition"
      >
        {darkMode ? (
          <SunIcon className="w-6 h-6" />
        ) : (
          <MoonIcon className="w-6 h-6" />
        )}
      </button>
    </div>
  );
}

export default App;