// Latest posts from the Medium feed (fetched at build time).
// Hidden entirely if the feed couldn't be fetched.
import Link from "next/link";
import { formatPostDate } from "../../lib/api/medium";

export default function Writing({ posts }) {
  if (!posts?.length) return null;

  return (
    <section id="writing" className="py-20 bg-gray-900" aria-labelledby="writing-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="text-center mb-12">
          <h2 id="writing-heading" className="text-3xl font-bold text-white mb-4">
            Latest Writing
          </h2>
          <p className="text-gray-400">Recent articles from my blog</p>
        </header>

        <ul className="grid md:grid-cols-3 gap-6">
          {posts.map((post) => (
            <li key={post.link}>
              <a
                href={post.link}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col h-full bg-gray-800/30 rounded-2xl overflow-hidden border border-gray-800 hover:border-purple-500/50 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500"
              >
                <div className="h-40 bg-gradient-to-br from-purple-900/30 to-cyan-900/30 overflow-hidden">
                  {post.thumbnail && (
                    <img
                      src={post.thumbnail}
                      alt=""
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  )}
                </div>
                <div className="flex flex-col flex-1 p-5">
                  <p className="text-xs text-gray-400 mb-2">
                    {formatPostDate(post.pubDate)}
                    {post.readTime && ` · ${post.readTime}`}
                  </p>
                  <h3 className="text-lg font-bold text-white group-hover:text-purple-300 transition line-clamp-2 mb-4">
                    {post.title}
                  </h3>
                  <span className="mt-auto text-sm text-purple-400 group-hover:text-purple-300 transition">
                    Read on Medium <span aria-hidden="true">↗</span>
                    <span className="sr-only"> (opens in new tab)</span>
                  </span>
                </div>
              </a>
            </li>
          ))}
        </ul>

        <div className="mt-10 text-center">
          <Link
            href="/blog/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-medium transition border border-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500"
          >
            View all posts <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
