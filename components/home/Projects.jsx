import { useState } from "react";
import Link from "next/link";
import ProjectFilter from "../ProjectFilter";
import { categoryGradient } from "../../lib/projectCategories";

export default function Projects({ user }) {
  const [filteredProjects, setFilteredProjects] = useState(user.projects);

  return (
    <section
      id="projects"
      className="py-20 bg-gray-950"
      aria-labelledby="projects-heading"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="text-center mb-12">
          <h2
            id="projects-heading"
            className="text-3xl font-bold text-white mb-4"
          >
            Projects
          </h2>
          <p className="text-gray-400">Some of my technical work</p>
        </header>

        {/* Project Filter */}
        <ProjectFilter
          projects={user.projects}
          onFilterChange={setFilteredProjects}
        />

        <div className="grid md:grid-cols-2 gap-8">
          {filteredProjects.map((project) => (
            <article
              key={project.slug}
              className="relative bg-gray-800/30 rounded-2xl overflow-hidden border border-gray-800 hover:border-purple-500/50 transition group"
              itemScope
              itemType="https://schema.org/SoftwareSourceCode"
            >
              <header className="relative h-32 bg-gray-900 flex flex-col items-center justify-center p-6 overflow-hidden">
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${categoryGradient(
                    project.category
                  )} opacity-20 group-hover:opacity-30 transition-opacity`}
                  aria-hidden="true"
                />
                <p className="relative text-xs font-medium uppercase tracking-wider text-gray-200 mb-2">
                  {project.category} · {project.year}
                </p>
                <h3
                  className="relative text-2xl font-bold text-white text-center"
                  itemProp="name"
                >
                  {project.title}
                </h3>
              </header>
              <div className="p-6">
                <p
                  className="text-gray-400 text-sm mb-2"
                  itemProp="description"
                >
                  {project.desc1}
                </p>
                <p className="text-gray-500 text-sm mb-4">
                  {project.desc2}
                </p>
                <ul
                  className="flex flex-wrap gap-2 mb-4"
                  aria-label={`Technologies used in ${project.title}`}
                >
                  {project.tech.slice(0, 5).map((tech) => (
                    <li
                      key={tech}
                      className="px-3 py-1 bg-gray-700/50 rounded-full text-xs text-gray-400"
                      itemProp="programmingLanguage"
                    >
                      {tech}
                    </li>
                  ))}
                  {project.tech.length > 5 && (
                    <li className="px-3 py-1 bg-gray-700/50 rounded-full text-xs text-gray-500">
                      +{project.tech.length - 5} more
                    </li>
                  )}
                </ul>
                <div className="flex gap-4">
                  {/* Stretched link: the whole card opens the project page */}
                  <Link
                    href={`/projects/${project.slug}`}
                    className="text-sm text-purple-400 hover:text-purple-300 transition flex items-center gap-1 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 after:absolute after:inset-0 after:content-['']"
                    aria-label={`View details for ${project.title}`}
                  >
                    <span>View Details</span>
                    <span aria-hidden="true">→</span>
                  </Link>
                  {project.code && (
                    <a
                      href={project.code}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="relative z-10 text-sm text-cyan-400 hover:text-cyan-300 transition flex items-center gap-1 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500"
                      itemProp="codeRepository"
                      aria-label={`View source code for ${project.title} on GitHub (opens in new tab)`}
                    >
                      <span>GitHub</span>
                      <span aria-hidden="true">↗</span>
                    </a>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
