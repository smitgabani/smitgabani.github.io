// Fixed navbar that slides in once the visitor scrolls past the hero
import { useEffect, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import Icon from "../Icon";
import { NAV_SECTIONS } from "../../lib/sections";

// For browser values that never change while the page is open
const subscribeNever = () => () => {};

export default function Navbar({ user, visible, onOpenSearch }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  // Show the right palette shortcut for the visitor's OS (⌘K during SSR)
  const shortcutLabel = useSyncExternalStore(
    subscribeNever,
    () => (/Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent) ? "⌘K" : "Ctrl K"),
    () => "⌘K"
  );

  // Close the menu when the navbar hides (scrolled back up to the hero)
  if (!visible && mobileMenuOpen) setMobileMenuOpen(false);

  // Close the mobile menu with Escape
  useEffect(() => {
    if (!mobileMenuOpen) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") setMobileMenuOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [mobileMenuOpen]);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-[1002] bg-gray-900/90 backdrop-blur-md border-b border-gray-800 transition-transform duration-300 ${
        visible ? "translate-y-0" : "-translate-y-full"
      }`}
      role="banner"
      inert={!visible}
    >
      <nav
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        aria-label="Main navigation"
      >
        <div className="flex items-center justify-between h-16">
          {/* Logo + Brand Name */}
          <a
            href="#hero"
            className="flex items-center gap-3 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500"
            aria-label={`${user.name} - Back to top`}
          >
            <span
              className="w-9 h-9 rounded-lg bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-white text-sm font-bold"
              aria-hidden="true"
            >
              SG
            </span>
            <span
              className="text-white text-xl font-bold"
              itemProp="name"
            >
              {user.name}
            </span>
          </a>

          <div className="flex items-center gap-1 md:gap-6">
            {/* Nav Links */}
            <ul className="hidden md:flex items-center gap-4 lg:gap-6">
              {NAV_SECTIONS.map((section) => (
                <li key={section.id}>
                  <a
                    href={`#${section.id}`}
                    className="text-gray-300 hover:text-white transition rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500"
                  >
                    {section.label}
                  </a>
                </li>
              ))}
              <li>
                <Link
                  href="/blog"
                  className="text-gray-300 hover:text-white transition rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500"
                >
                  Blog
                </Link>
              </li>
            </ul>

            {/* Command palette trigger */}
            <button
              type="button"
              onClick={onOpenSearch}
              className="flex items-center gap-2 p-2 md:px-3 md:py-1.5 text-gray-300 hover:text-white md:bg-gray-800/80 md:border md:border-gray-700 md:hover:bg-gray-700 rounded-lg transition focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500"
              aria-label="Search the site"
            >
              <Icon name="search" className="w-5 h-5 md:w-4 md:h-4" />
              <span className="hidden md:inline text-sm">Search</span>
              <kbd className="hidden lg:inline-flex items-center px-1.5 py-0.5 bg-gray-900/60 rounded text-xs font-mono border border-gray-600">
                {shortcutLabel}
              </kbd>
            </button>

            {/* Mobile menu toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen((isOpen) => !isOpen)}
              className="md:hidden p-2 text-gray-300 hover:text-white rounded-lg transition focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500"
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-menu"
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            >
              <Icon name={mobileMenuOpen ? "close" : "menu"} className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <ul id="mobile-menu" className="md:hidden border-t border-gray-800 py-2">
            {NAV_SECTIONS.map((section) => (
              <li key={section.id}>
                <a
                  href={`#${section.id}`}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-2 py-3 text-gray-300 hover:text-white rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500"
                >
                  {section.label}
                </a>
              </li>
            ))}
            <li>
              <Link
                href="/blog"
                className="block px-2 py-3 text-gray-300 hover:text-white rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500"
              >
                Blog
              </Link>
            </li>
          </ul>
        )}
      </nav>
    </header>
  );
}
