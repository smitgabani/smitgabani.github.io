/**
 * Stack Overflow API Integration
 * Fetches live statistics from Stack Exchange API v2.3
 *
 * Documentation: https://api.stackexchange.com/docs
 * No API key required for basic usage (limited to 300 requests/day per IP)
 * With API key: 10,000 requests/day
 *
 * Setup (optional): Add STACKOVERFLOW_API_KEY to .env.local
 * Get key: https://stackapps.com/apps/oauth/register
 */

const STACKOVERFLOW_API = 'https://api.stackexchange.com/2.3';

/**
 * Fetch Stack Overflow user statistics
 * @param {string|number} userId - Stack Overflow user ID
 * @returns {Promise<Object>} Stack Overflow stats object
 */
export async function fetchStackOverflowStats(userId) {
  const apiKey = process.env.STACKOVERFLOW_API_KEY;

  if (!userId) {
    console.warn('⚠️ Stack Overflow user ID not provided.');
    return null;
  }

  try {
    // Build API URL with optional API key for higher quota
    const params = new URLSearchParams({
      site: 'stackoverflow',
      filter: 'default', // Returns standard response
    });

    if (apiKey) {
      params.append('key', apiKey);
    }

    // Fetch user data
    const userResponse = await fetch(
      `${STACKOVERFLOW_API}/users/${userId}?${params}`,
      {
        headers: {
          'Accept': 'application/json',
        },
      }
    );

    if (!userResponse.ok) {
      throw new Error(`Stack Overflow API returned ${userResponse.status}`);
    }

    const userData = await userResponse.json();

    if (!userData.items || userData.items.length === 0) {
      throw new Error(`User ${userId} not found on Stack Overflow`);
    }

    const user = userData.items[0];

    const badges = {
      gold: user.badge_counts?.gold || 0,
      silver: user.badge_counts?.silver || 0,
      bronze: user.badge_counts?.bronze || 0,
    };

    // answer_count isn't in the default /users filter; the built-in "total"
    // filter returns just the count of the user's answers.
    const answerParams = new URLSearchParams({
      site: 'stackoverflow',
      filter: 'total',
    });

    if (apiKey) {
      answerParams.append('key', apiKey);
    }

    const answerResponse = await fetch(
      `${STACKOVERFLOW_API}/users/${userId}/answers?${answerParams}`,
      {
        headers: {
          'Accept': 'application/json',
        },
      }
    );

    const answers = answerResponse.ok ? (await answerResponse.json()).total ?? null : null;

    return {
      userId: user.user_id,
      username: user.display_name,
      reputation: user.reputation,
      answers,
      questions: user.question_count || 0,
      acceptRate: user.accept_rate || null,
      badges,
      totalBadges: badges.gold + badges.silver + badges.bronze,
      profileUrl: user.link,
      avatarUrl: user.profile_image,
      createdAt: new Date(user.creation_date * 1000).toISOString(),
      lastAccessDate: new Date(user.last_access_date * 1000).toISOString(),
      fetchedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error fetching Stack Overflow stats:', error.message);
    return null;
  }
}

/**
 * Format reputation number with K/M suffixes
 * @param {number} num - Number to format
 * @returns {string} Formatted number
 */
export function formatReputation(num) {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}

/**
 * Format Stack Overflow stat for display; null stays null so the UI can hide it
 * @param {number|null} num - Number to format
 * @returns {string|null} Formatted stat (e.g., "500", "1.2K")
 */
export function formatStat(num) {
  return typeof num === 'number' ? formatReputation(num) : null;
}
