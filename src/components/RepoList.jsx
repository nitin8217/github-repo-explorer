import React from "react";

function RepoList({ repos }) {
  if (repos.length === 0) {
    return null; // Don't show anything if no repos
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 w-full max-w-5xl">
      {repos.map((repo) => (
        <div
          key={repo.id}
          className="bg-white p-6 rounded-lg shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
        >
          <h2 className="text-xl font-semibold mb-2">{repo.name}</h2>
          
          {repo.description && <p className="text-gray-600 mb-3">{repo.description}</p>}
          
          <div className="flex items-center space-x-4 mb-4">
            <div className="flex items-center text-sm text-gray-500">
              <span className="mr-1">⭐</span>
              {repo.stargazers_count}
            </div>
            <div className="flex items-center text-sm text-gray-500">
              <span className="mr-1">🍴</span>
              {repo.forks_count}
            </div>
            <div className="flex items-center text-sm text-gray-500">
              <span className="mr-1">💻</span>
              {repo.language || "N/A"}
            </div>
          </div>

          <a
            href={repo.html_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline"
          >
            View Repo →
          </a>
        </div>
      ))}
    </div>
  );
}

export default RepoList;
