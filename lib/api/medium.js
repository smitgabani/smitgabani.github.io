/**
 * Medium RSS feed, fetched at build time.
 * Shared by the blog page and the "Latest writing" section on the home page.
 */

export const MEDIUM_USERNAME = 'smitgabani';
const RSS_URL = `https://medium.com/feed/@${MEDIUM_USERNAME}`;

// Decode the HTML entities Medium leaves in feed text (e.g. &#x2019; -> ’)
const NAMED_ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' };

function decodeEntities(text) {
  return text.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (match, code) => {
    if (code[0] === '#') {
      const isHex = code[1].toLowerCase() === 'x';
      const num = parseInt(code.slice(isHex ? 2 : 1), isHex ? 16 : 10);
      return Number.isNaN(num) ? match : String.fromCodePoint(num);
    }
    return NAMED_ENTITIES[code.toLowerCase()] ?? match;
  });
}

// Strip HTML tags and decode entities
function stripHtml(html) {
  if (!html) return '';
  const text = html.replace(/<[^>]*>/g, ' ');
  return decodeEntities(text).replace(/\s+/g, ' ').trim();
}

// Shorten text at a word boundary
function truncate(text, max) {
  if (text.length <= max) return text;
  const cut = text.lastIndexOf(' ', max);
  return text.slice(0, cut > 0 ? cut : max).replace(/[\s,.;:]+$/, '') + '…';
}

// Rough read time at 200 words per minute
function getReadTime(text) {
  const words = text.split(' ').length;
  return `${Math.ceil(words / 200)} min read`;
}

function parseItem(item) {
  const getTagContent = (tag) => {
    const match =
      item.match(new RegExp(`<${tag}><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>`)) ||
      item.match(new RegExp(`<${tag}>([^<]*)<\\/${tag}>`));
    return match ? match[1].trim() : '';
  };

  const content = getTagContent('content:encoded') || getTagContent('description');
  const categories = (item.match(/<category><!\[CDATA\[([^\]]+)\]\]><\/category>/g) || []).map((cat) =>
    cat.replace(/<category><!\[CDATA\[|\]\]><\/category>/g, '')
  );
  const imgMatch = content.match(/<img[^>]+src="([^"]+)"/);

  // Posts in publications only include a teaser ending in "Continue reading on …"
  const fullText = stripHtml(content);
  const isTeaser = /Continue reading on /i.test(fullText);
  const text = fullText.replace(/\s*Continue reading on [\s\S]*$/i, '').trim();

  return {
    title: decodeEntities(getTagContent('title')),
    link: getTagContent('link'),
    pubDate: getTagContent('pubDate'),
    thumbnail: imgMatch ? imgMatch[1] : null,
    description: truncate(text, 200),
    // Read time is only meaningful when the feed has the whole article
    readTime: isTeaser ? null : getReadTime(fullText),
    categories,
  };
}

/**
 * Fetch the latest posts. Never throws: on failure returns no posts, and
 * pages hide what they can't show.
 * @param {number} limit - Maximum number of posts to return
 * @returns {Promise<{ posts: Array, total: number }>}
 */
export async function fetchMediumPosts(limit = 10) {
  try {
    const response = await fetch(RSS_URL, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Portfolio/1.0)' },
    });
    const xmlText = await response.text();
    const items = xmlText.match(/<item>([\s\S]*?)<\/item>/g) || [];
    return { posts: items.slice(0, limit).map(parseItem), total: items.length };
  } catch (error) {
    console.error('Error fetching Medium posts:', error);
    return { posts: [], total: 0 };
  }
}

// Formatted in UTC so the build server and the visitor's browser agree
export function formatPostDate(dateString) {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });
}
