import { useInfiniteQuery } from '@tanstack/react-query';
import { Octokit } from '@octokit/rest';

const octokit = new Octokit({
  auth: import.meta.env.VITE_GITHUB_TOKEN
});

export function useInfiniteRepos(username, repoSearch, searchType) {
  return useInfiniteQuery({
    queryKey: ['repos', username, repoSearch, searchType],
    queryFn: async ({ pageParam = 1 }) => {
      if (!username && !repoSearch) {
        return { repos: [], nextPage: undefined, hasMore: false };
      }

      if (searchType === "username") {
        const response = await octokit.repos.listForUser({
          username,
          per_page: 100,
          page: pageParam,
          sort: 'updated'
        });

        return {
          repos: response.data,
          nextPage: pageParam + 1,
          hasMore: response.data.length === 100,
        };
      } else {
        const response = await octokit.search.repos({
          q: repoSearch,
          sort: 'stars',
          per_page: 100,
          page: pageParam
        });

        return {
          repos: response.data.items,
          nextPage: pageParam + 1,
          hasMore: response.data.items.length === 100,
        };
      }
    },
    getNextPageParam: (lastPage) => lastPage.hasMore ? lastPage.nextPage : undefined,
    enabled: Boolean((searchType === "username" && username) || (searchType === "repository" && repoSearch))
  });
}