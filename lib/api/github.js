/**
 * GitHub API Integration
 * Fetches live statistics from GitHub using GraphQL API v4
 *
 * Setup: Add GITHUB_TOKEN to .env.local
 * Generate token: https://github.com/settings/tokens
 * Required scopes: public_repo, read:user
 *
 * In CI the workflow passes the built-in Actions token. Without a token we fall
 * back to the public REST API (no contribution count). If both fail, stats are
 * null and the page hides them rather than showing made-up numbers.
 */

const GITHUB_GRAPHQL_API = 'https://api.github.com/graphql';
const GITHUB_REST_API = 'https://api.github.com';

/**
 * Fetch comprehensive GitHub statistics for a user
 * @param {string} username - GitHub username
 * @returns {Promise<Object>} GitHub stats object
 */
export async function fetchGitHubStats(username) {
  const token = process.env.GITHUB_TOKEN;

  // Without a token the GraphQL API is unavailable; use the public REST API
  if (!token) {
    console.warn('⚠️ GITHUB_TOKEN not found. Using the public REST API (no contribution count).');
    return fetchGitHubStatsREST(username);
  }

  try {
    const query = `
      query($username: String!) {
        user(login: $username) {
          repositories(first: 100, ownerAffiliations: OWNER, privacy: PUBLIC) {
            totalCount
            nodes {
              stargazerCount
              forkCount
              primaryLanguage {
                name
                color
              }
            }
          }
          followers {
            totalCount
          }
          contributionsCollection {
            contributionCalendar {
              totalContributions
            }
            contributionYears
          }
          repositoriesContributedTo(first: 1, contributionTypes: [COMMIT, PULL_REQUEST]) {
            totalCount
          }
        }
      }
    `;

    const response = await fetch(GITHUB_GRAPHQL_API, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query, variables: { username } }),
    });

    if (!response.ok) {
      throw new Error(`GitHub API returned ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    if (data.errors) {
      console.error('GitHub GraphQL errors:', data.errors);
      throw new Error(data.errors[0]?.message || 'GraphQL query failed');
    }

    const user = data.data?.user;

    if (!user) {
      throw new Error(`User "${username}" not found on GitHub`);
    }

    // Calculate total stars across all repositories
    const totalStars = user.repositories.nodes.reduce(
      (sum, repo) => sum + repo.stargazerCount,
      0
    );

    // Calculate total forks across all repositories
    const totalForks = user.repositories.nodes.reduce(
      (sum, repo) => sum + repo.forkCount,
      0
    );

    // Get language distribution
    const languages = {};
    user.repositories.nodes.forEach(repo => {
      if (repo.primaryLanguage) {
        const lang = repo.primaryLanguage.name;
        languages[lang] = (languages[lang] || 0) + 1;
      }
    });

    // Sort languages by usage
    const topLanguages = Object.entries(languages)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([name, count]) => ({
        name,
        count,
        color: user.repositories.nodes.find(
          repo => repo.primaryLanguage?.name === name
        )?.primaryLanguage?.color || '#000000',
      }));

    return {
      username,
      repositories: user.repositories.totalCount,
      contributions: user.contributionsCollection.contributionCalendar.totalContributions,
      stars: totalStars,
      followers: user.followers.totalCount,
      forks: totalForks,
      contributedTo: user.repositoriesContributedTo.totalCount,
      topLanguages,
      contributionYears: user.contributionsCollection.contributionYears,
      fetchedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error fetching GitHub stats:', error.message);
    return fetchGitHubStatsREST(username);
  }
}

/**
 * Public REST fallback: repositories, stars and followers (no token needed).
 * @param {string} username - GitHub username
 * @returns {Promise<Object|null>} Partial stats, or null if the API is unreachable
 */
async function fetchGitHubStatsREST(username) {
  try {
    const headers = { Accept: 'application/vnd.github+json' };
    const [userResponse, reposResponse] = await Promise.all([
      fetch(`${GITHUB_REST_API}/users/${username}`, { headers }),
      fetch(`${GITHUB_REST_API}/users/${username}/repos?per_page=100&type=owner`, { headers }),
    ]);

    if (!userResponse.ok || !reposResponse.ok) {
      throw new Error(`GitHub REST API returned ${userResponse.status}/${reposResponse.status}`);
    }

    const user = await userResponse.json();
    const repos = await reposResponse.json();

    return {
      username,
      repositories: user.public_repos,
      contributions: null,
      stars: repos.reduce((sum, repo) => sum + (repo.stargazers_count || 0), 0),
      followers: user.followers,
      fetchedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error fetching GitHub stats from REST API:', error.message);
    return null;
  }
}

/**
 * Format numbers with K/M suffixes (e.g., 1500 -> "1.5K")
 * @param {number} num - Number to format
 * @returns {string} Formatted number
 */
export function formatNumber(num) {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}

/**
 * Format GitHub stat for display; null stays null so the UI can hide it
 * @param {number|null} num - Number to format
 * @returns {string|null} Formatted stat (e.g., "500", "1.5K")
 */
export function formatStat(num) {
  return typeof num === 'number' ? formatNumber(num) : null;
}
