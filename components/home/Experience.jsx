export default function Experience({ user }) {
  return (
    <section
      id="experience"
      className="py-20 bg-gray-900"
      aria-labelledby="experience-heading"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="text-center mb-12">
          <h2
            id="experience-heading"
            className="text-3xl font-bold text-white mb-4"
          >
            Experience
          </h2>
          <p className="text-gray-400">My professional journey</p>
        </header>

        <div className="max-w-4xl mx-auto space-y-8">
          {user.experience.map((exp, index) => (
            <article
              key={index}
              className="bg-gray-800/30 rounded-2xl p-6 border border-gray-800 hover:border-purple-500/30 transition"
              itemScope
              itemType="https://schema.org/OrganizationRole"
            >
              <header className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                <div>
                  <h3
                    className="text-xl font-bold text-white"
                    itemProp="roleName"
                  >
                    {exp.title}
                  </h3>
                  <p
                    className="text-purple-400"
                    itemProp="memberOf"
                    itemScope
                    itemType="https://schema.org/Organization"
                  >
                    <span itemProp="name">{exp.company}</span>
                  </p>
                </div>
                <time
                  className="text-gray-500 text-sm mt-2 md:mt-0"
                  itemProp="startDate"
                >
                  {exp.date}
                </time>
              </header>
              <ul
                className="space-y-2"
                aria-label={`Responsibilities at ${exp.company}`}
              >
                {exp.description.map((item, itemIndex) => (
                  <li
                    key={itemIndex}
                    className="text-gray-400 text-sm flex items-start gap-2"
                    itemProp="description"
                  >
                    <span
                      className="text-cyan-400 mt-1"
                      aria-hidden="true"
                    >
                      ▹
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
