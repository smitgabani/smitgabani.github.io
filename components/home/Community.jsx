// GitHub and Stack Overflow stats (fetched at build time)
export default function Community({ user, githubStats, stackoverflowStats }) {
  // Live stats are fetched at build time; anything that couldn't be fetched
  // (null) or is zero gets no tile, rather than a guess or an empty metric.
  const hasValue = (tile) => tile.value != null && tile.value !== "0";
  const githubTiles = [
    { label: "Repositories", value: githubStats?.repositories },
    { label: "Contributions (past year)", value: githubStats?.contributions },
    { label: "Stars Earned", value: githubStats?.stars },
    { label: "Followers", value: githubStats?.followers },
  ].filter(hasValue);
  const stackoverflowTiles = [
    { label: "Reputation", value: stackoverflowStats?.reputation },
    { label: "Answers", value: stackoverflowStats?.answers },
  ].filter(hasValue);
  const stackoverflowBadges = [
    { name: "gold", color: "bg-yellow-500", count: stackoverflowStats?.badges?.gold },
    { name: "silver", color: "bg-gray-400", count: stackoverflowStats?.badges?.silver },
    { name: "bronze", color: "bg-amber-700", count: stackoverflowStats?.badges?.bronze },
  ].filter((badge) => badge.count > 0);

  return (
    <section
      id="achievements"
      className="py-20 bg-gray-950"
      aria-labelledby="achievements-heading"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="text-center mb-12">
          <h2
            id="achievements-heading"
            className="text-3xl font-bold text-white mb-4"
          >
            Community & Open Source
          </h2>
          <p className="text-gray-400">
            Contributing to the developer community
          </p>
        </header>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* GitHub Card */}
          <a
            href={
              user.achievements?.github?.profileUrl || user.links.github
            }
            target="_blank"
            rel="noopener noreferrer"
            className="group bg-gray-800/30 rounded-2xl p-6 border border-gray-800 hover:border-purple-500/50 transition flex flex-col"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 bg-gray-900 rounded-xl flex items-center justify-center group-hover:bg-gray-800 transition">
                <svg
                  className="w-8 h-8 text-white"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    fillRule="evenodd"
                    d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">GitHub</h3>
                <p className="text-gray-500 text-sm">
                  @{user.achievements?.github?.username || "smitgabani"}
                </p>
              </div>
            </div>

            {githubTiles.length > 0 && (
              <dl className="grid grid-cols-2 gap-4 [&>*:last-child:nth-child(odd)]:col-span-2">
                {githubTiles.map((tile) => (
                  <div
                    key={tile.label}
                    className="flex flex-col-reverse text-center p-3 bg-gray-900/50 rounded-lg"
                  >
                    <dt className="text-xs text-gray-400">{tile.label}</dt>
                    <dd className="text-2xl font-bold text-purple-400">
                      {tile.value}
                    </dd>
                  </div>
                ))}
              </dl>
            )}

            <div className="mt-auto pt-6 text-purple-400 text-sm font-medium group-hover:text-purple-300 transition flex items-center justify-center gap-1">
              View Profile
              <svg
                className="w-4 h-4 group-hover:translate-x-1 transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14 5l7 7m0 0l-7 7m7-7H3"
                />
              </svg>
            </div>
          </a>

          {/* Stack Overflow Card */}
          <a
            href={user.achievements.stackoverflow.profileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group bg-gray-800/30 rounded-2xl p-6 border border-gray-800 hover:border-orange-500/50 transition flex flex-col"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 bg-gray-900 rounded-xl flex items-center justify-center group-hover:bg-gray-800 transition">
                <svg
                  className="w-8 h-8 text-orange-500"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M18.986 21.865v-6.404h2.134V24H1.844v-8.539h2.13v6.404h15.012zM6.111 19.731H16.85v-2.137H6.111v2.137zm.259-4.852l10.48 2.189.451-2.07-10.478-2.187-.453 2.068zm1.359-5.056l9.705 4.53.903-1.95-9.706-4.53-.902 1.936v.014zm2.715-4.785l8.217 6.855 1.359-1.62-8.216-6.853-1.35 1.617-.01.001zM15.751 0l-1.746 1.294 6.405 8.604 1.746-1.294L15.749 0h.002z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">
                  Stack Overflow
                </h3>
                <p className="text-gray-500 text-sm">
                  Helping developers worldwide
                </p>
              </div>
            </div>

            {stackoverflowTiles.length > 0 && (
              <dl className="grid grid-cols-2 gap-4 mb-4 [&>*:last-child:nth-child(odd)]:col-span-2">
                {stackoverflowTiles.map((tile) => (
                  <div
                    key={tile.label}
                    className="flex flex-col-reverse text-center p-3 bg-gray-900/50 rounded-lg"
                  >
                    <dt className="text-xs text-gray-400">{tile.label}</dt>
                    <dd className="text-2xl font-bold text-orange-400">
                      {tile.value}
                    </dd>
                  </div>
                ))}
              </dl>
            )}

            {stackoverflowBadges.length > 0 && (
              <div className="flex items-center justify-center gap-3 p-3 bg-gray-900/50 rounded-lg mb-4">
                <span className="text-xs text-gray-400">Badges</span>
                <ul className="flex items-center gap-4">
                  {stackoverflowBadges.map((badge) => (
                    <li
                      key={badge.name}
                      className="flex items-center gap-1.5"
                      title={`${badge.count} ${badge.name} badges`}
                    >
                      <span
                        className={`w-3 h-3 rounded-full ${badge.color}`}
                        aria-hidden="true"
                      ></span>
                      <span className="text-sm text-gray-300">{badge.count}</span>
                      <span className="sr-only"> {badge.name} badges</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-auto pt-6 text-orange-400 text-sm font-medium group-hover:text-orange-300 transition flex items-center justify-center gap-1">
              View Profile
              <svg
                className="w-4 h-4 group-hover:translate-x-1 transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14 5l7 7m0 0l-7 7m7-7H3"
                />
              </svg>
            </div>
          </a>
        </div>
      </div>
    </section>
  );
}
