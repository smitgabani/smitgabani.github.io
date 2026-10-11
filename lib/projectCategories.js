// Accent gradient per project category, shared by project cards and detail pages.
// Full class names are listed so Tailwind can find them at build time.
const CATEGORY_GRADIENTS = {
  "Cloud & DevOps": "from-blue-500 to-cyan-500",
  "Developer Tools": "from-green-500 to-emerald-500",
  "Full-Stack": "from-purple-500 to-pink-500",
  Backend: "from-orange-500 to-red-500",
};

const DEFAULT_GRADIENT = "from-purple-500 to-cyan-500";

export function categoryGradient(category) {
  return CATEGORY_GRADIENTS[category] || DEFAULT_GRADIENT;
}
