import React from "react";

function RepoList({ repos, loading }) {
  if (loading) {
    // You can add a loader component here
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <p className="text-gray-500 text-lg">Loading...</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 w-full max-w-5xl">
      {repos.map((repo) => (
        <div
          key={repo.id}
          className="bg-white p-6 rounded-lg shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
        >
          <h2 className="text-xl font-semibold mb-2">{repo.name}</h2>

          {repo.description && (
            <p className="text-gray-600 mb-3 overflow-hidden text-ellipsis line-clamp-3">
              {repo.description}
            </p>
          )}
          {repo.topics && repo.topics.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {repo.topics.map((topic) => (
                <span
                  key={topic}
                  className="bg-gray-200 text-gray-800 px-2 py-1 rounded text-xs"
                >
                  {topic}
                </span>
              ))}
            </div>
          )}
          <div className="flex flex-wrap items-center gap-2 mb-4">
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
            <div className="flex items-center text-sm text-gray-500">
              <span className="mr-1">👀</span>
              {repo.watchers_count}
            </div>
            <div className="flex items-center text-sm text-gray-500">
              <span className="mr-1">👥</span>
              {repo.contributors_count || "N/A"} Contributors
            </div>
            <div className="flex items-center text-sm text-gray-500">
              <span className="mr-1">🐞</span>
              {repo.open_issues_count} Open Issues
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
