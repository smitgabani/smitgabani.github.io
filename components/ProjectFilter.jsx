// Project filtering component with category pills and free-text search
import { useState, useMemo, useEffect } from 'react';

export default function ProjectFilter({ projects, onFilterChange }) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Unique categories in the order they first appear in the data
  const categories = useMemo(() => {
    const unique = [...new Set(projects.map((project) => project.category).filter(Boolean))];
    return ['all', ...unique];
  }, [projects]);

  // Filter by category, then by title / description / tech
  const filteredProjects = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return projects.filter((project) => {
      const matchesCategory =
        selectedCategory === 'all' || project.category === selectedCategory;

      if (!query) return matchesCategory;

      const haystack = [
        project.title,
        project.subtitle,
        project.desc1,
        project.desc2,
        ...(project.tech || []),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return matchesCategory && haystack.includes(query);
    });
  }, [projects, selectedCategory, searchQuery]);

  // Notify parent component when filters change
  useEffect(() => {
    if (onFilterChange) {
      onFilterChange(filteredProjects);
    }
  }, [filteredProjects, onFilterChange]);

  return (
    <div className="mb-8 space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <label htmlFor="project-search" className="sr-only">
          Search projects
        </label>
        <input
          id="project-search"
          type="search"
          placeholder="Search by name or technology..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-3 pl-10 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
        />
        <svg
          className="absolute left-3 top-3.5 h-5 w-5 text-gray-500 pointer-events-none"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>

      {/* Category Filter Pills */}
      <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by category">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            aria-pressed={selectedCategory === category}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 ${
              selectedCategory === category
                ? 'bg-purple-600 text-white'
                : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700 border border-gray-700'
            }`}
          >
            {category === 'all' ? 'All' : category}
          </button>
        ))}
      </div>

      {/* Results Count */}
      <p className="text-sm text-gray-400" aria-live="polite">
        Showing {filteredProjects.length} of {projects.length} projects
        {searchQuery.trim() && ` matching "${searchQuery.trim()}"`}
        {selectedCategory !== 'all' && ` in ${selectedCategory}`}
      </p>
    </div>
  );
}
