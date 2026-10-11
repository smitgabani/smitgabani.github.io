// Single source of truth for the home page sections, in page order.
// Used by the navbar, footer and command palette so they never drift apart.
export const SECTIONS = [
  { id: "hero", label: "Home", icon: "home", inNav: false },
  { id: "about", label: "About", icon: "user", inNav: true },
  { id: "experience", label: "Experience", icon: "briefcase", inNav: true },
  { id: "projects", label: "Projects", icon: "folder", inNav: true },
  { id: "skills", label: "Skills", icon: "bolt", inNav: true },
  { id: "achievements", label: "Community", icon: "star", inNav: false },
  { id: "writing", label: "Writing", icon: "document", inNav: false },
  { id: "contact", label: "Contact", icon: "mail", inNav: true },
];

export const NAV_SECTIONS = SECTIONS.filter((section) => section.inNav);

// Scroll a section into view. Uses the CSS `scroll-behavior` on <html>,
// so it is smooth by default and instant when the user prefers reduced motion.
export function scrollToSection(id) {
  if (id === "hero") {
    window.scrollTo({ top: 0 });
    return true;
  }
  const element = document.getElementById(id);
  if (!element) return false;
  element.scrollIntoView({ block: "start" });
  return true;
}
