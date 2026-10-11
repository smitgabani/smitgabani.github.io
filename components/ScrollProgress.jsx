// Scroll progress indicator (top bar). Back-to-top is handled by the docked 3D logo.
import { useState, useEffect } from 'react';

export default function ScrollProgress() {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY;
      const totalScroll = documentHeight - windowHeight;
      const progress = totalScroll > 0 ? (scrollTop / totalScroll) * 100 : 0;

      setScrollProgress(Math.min(Math.max(progress, 0), 100));
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial calculation

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 h-1 z-[9999]" aria-hidden="true">
      <div
        className="h-full bg-gradient-to-r from-purple-500 to-cyan-400 transition-[width] duration-150 ease-out"
        style={{ width: `${scrollProgress}%` }}
      ></div>
    </div>
  );
}
