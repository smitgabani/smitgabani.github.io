// Floating back-to-top button, shown together with the navbar
import Icon from "../Icon";
import { trackButtonClick } from "../Analytics";
import { scrollToSection } from "../../lib/sections";

export default function BackToTop({ visible }) {
  if (!visible) return null;

  const backToTop = () => {
    // Release focus first: the button unmounts mid-scroll, and Chrome cancels
    // a smooth scroll when the focused element disappears.
    document.activeElement?.blur?.();
    scrollToSection("hero");
    trackButtonClick("Back to top", "Floating button");
  };

  return (
    <button
      type="button"
      onClick={backToTop}
      className="fixed bottom-5 right-5 z-50 w-11 h-11 rounded-full bg-gray-800/90 backdrop-blur border border-gray-700 text-gray-300 hover:text-white hover:bg-gray-700 flex items-center justify-center shadow-lg transition focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500"
      aria-label="Back to top"
      title="Back to top"
    >
      <Icon name="arrowUp" className="w-5 h-5" />
    </button>
  );
}
