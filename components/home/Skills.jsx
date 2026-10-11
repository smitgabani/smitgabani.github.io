import Icon from "../Icon";

// Skill category display names and icons. Accents alternate between the two
// brand colors; class names are static so Tailwind can generate them.
const SKILL_CATEGORIES = {
  systems: { label: "Systems", icon: "chip" },
  languages: { label: "Languages", icon: "code" },
  backend: { label: "Backend", icon: "server" },
  databases: { label: "Databases", icon: "database" },
  cloud: { label: "Cloud", icon: "cloud" },
  devops: { label: "DevOps", icon: "refresh" },
  tools: { label: "Tools", icon: "cog" },
};
const SKILL_ACCENTS = [
  { icon: "text-purple-400 bg-purple-500/10", hover: "hover:border-purple-500/50" },
  { icon: "text-cyan-400 bg-cyan-500/10", hover: "hover:border-cyan-500/50" },
];

export default function Skills({ user }) {
  return (
    <section
      id="skills"
      className="py-20 bg-gray-900"
      aria-labelledby="skills-heading"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="text-center mb-12">
          <h2
            id="skills-heading"
            className="text-3xl font-bold text-white mb-4"
          >
            Technical Skills
          </h2>
          <p className="text-gray-400">
            Technologies and tools I work with
          </p>
        </header>

        <div
          className="skills-grid grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          role="list"
          aria-label="Skill categories"
        >
          {Object.entries(user.skills).map(
            ([category, skills], index) => {
              const meta = SKILL_CATEGORIES[category] || {
                label: category,
                icon: "folder",
              };
              const accent = SKILL_ACCENTS[index % SKILL_ACCENTS.length];

              return (
                <article
                  key={category}
                  className={`bg-gray-800/50 rounded-2xl p-6 border border-gray-700 ${accent.hover} transition`}
                  role="listitem"
                  itemScope
                  itemType="https://schema.org/ItemList"
                >
                  <header className="flex items-center gap-3 mb-4">
                    <span
                      className={`w-9 h-9 rounded-lg flex items-center justify-center ${accent.icon}`}
                    >
                      <Icon name={meta.icon} className="w-5 h-5" />
                    </span>
                    <h3
                      className="text-lg font-bold text-white"
                      itemProp="name"
                    >
                      {meta.label}
                    </h3>
                  </header>
                  <ul
                    className="flex flex-wrap gap-2"
                    aria-label={`${meta.label} skills`}
                  >
                    {skills.map((skill) => (
                      <li
                        key={skill}
                        className="px-3 py-1 bg-gray-700/50 rounded-full text-sm text-gray-300"
                        itemProp="itemListElement"
                      >
                        {skill}
                      </li>
                    ))}
                  </ul>
                </article>
              );
            }
          )}
        </div>
      </div>
    </section>
  );
}
