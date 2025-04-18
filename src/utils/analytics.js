export const analyzeCodeQuality = (repo) => {
  const metrics = {
    score: 0,
    factors: []
  };

  // Documentation coverage
  if (repo.description) metrics.score += 20;
  if (repo.readme) metrics.score += 20;

  // Activity and maintenance
  const lastUpdate = new Date(repo.updated_at);
  const monthsAgo = (new Date() - lastUpdate) / (1000 * 60 * 60 * 24 * 30);
  if (monthsAgo < 1) metrics.score += 20;
  else if (monthsAgo < 3) metrics.score += 10;

  // Community engagement
  if (repo.stargazers_count > 100) metrics.score += 20;
  if (repo.forks_count > 10) metrics.score += 20;

  return {
    ...metrics,
    rating: metrics.score >= 80 ? 'Excellent' : 
            metrics.score >= 60 ? 'Good' :
            metrics.score >= 40 ? 'Fair' : 'Needs Improvement'
  };
};

export const getSimilarRepos = async (octokit, repo) => {
  const query = `language:${repo.language} stars:>=${repo.stargazers_count} NOT repo:${repo.full_name}`;
  const { data } = await octokit.search.repos({
    q: query,
    sort: 'stars',
    per_page: 3
  });
  return data.items;
};

export const prioritizeIssues = async (octokit, owner, repo) => {
  const { data: issues } = await octokit.issues.listForRepo({
    owner,
    repo,
    state: 'open',
    sort: 'created',
    direction: 'desc',
    per_page: 5
  });

  return issues.map(issue => ({
    ...issue,
    priority: issue.labels.some(l => l.name.toLowerCase().includes('bug')) ? 'High' :
              issue.comments > 2 ? 'Medium' : 'Low'
  }));
};

export const generateDocSuggestions = (repo) => {
  const suggestions = [];
  
  if (!repo.description) {
    suggestions.push('Add a repository description');
  }
  if (!repo.homepage) {
    suggestions.push('Add a homepage/demo link');
  }
  if (!repo.topics || repo.topics.length === 0) {
    suggestions.push('Add relevant topics/tags');
  }
  if (repo.open_issues_count > 0 && !repo.contributing) {
    suggestions.push('Add CONTRIBUTING.md guidelines');
  }

  return suggestions;
};

export const analyzePerformance = async (octokit, owner, repo) => {
  const [codeFrequency, participation] = await Promise.all([
    octokit.repos.getCodeFrequencyStats({ owner, repo }),
    octokit.repos.getParticipationStats({ owner, repo })
  ]);

  return {
    commitFrequency: participation.data?.all?.slice(-4) || [],
    codeChanges: codeFrequency.data?.slice(-4) || [],
    suggestions: [
      'Consider adding performance benchmarks',
      'Set up automated testing',
      'Implement continuous integration'
    ]
  };
};