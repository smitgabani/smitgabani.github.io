// Morphing card: shows how a client's requirement becomes code, then a
// running system, then something real people use. Cycles through every
// project that has a `story` in user.json.
import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { Canvas } from "@react-three/fiber";
import CardScene from "./CardScene";
import Icon from "../Icon";
import styles from "./MorphingCard.module.css";

export const STAGES = [
  { label: "Request", duration: 4800 },
  { label: "Code", duration: 4800 },
  { label: "System", duration: 4800 },
  { label: "Users", duration: 5600 },
];

const EXIT_MS = 700;

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

function subscribeReducedMotion(onChange) {
  const query = window.matchMedia(REDUCED_MOTION);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

function usePrefersReducedMotion() {
  return useSyncExternalStore(
    subscribeReducedMotion,
    () => window.matchMedia(REDUCED_MOTION).matches,
    () => false
  );
}

function useInView(ref) {
  const [inView, setInView] = useState(true);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting));
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [ref]);
  return inView;
}

function describe(story) {
  return [
    `${story.title}.`,
    `${story.client} asked: “${story.request}”`,
    `Requirements: ${story.requirements.join(", ")}.`,
    `Built as: ${story.nodes.map((node) => node.label).join(", ")}.`,
    `Used by: ${story.users.map((user) => user.label).join(", ")}.`,
  ].join(" ");
}

export default function MorphingCard({ projects, className = "" }) {
  const stories = useMemo(
    () =>
      projects
        .filter((project) => project.story)
        .map((project) => ({
          id: project.slug,
          title: project.title,
          href: `/projects/${project.slug}`,
          ...project.story,
        })),
    [projects]
  );

  const containerRef = useRef(null);
  const inView = useInView(containerRef);
  const reduced = usePrefersReducedMotion();

  const [storyIndex, setStoryIndex] = useState(0);
  const [stage, setStage] = useState(0);
  const [exiting, setExiting] = useState(false);
  // null = follow the motion preference; true/false = the visitor chose
  const [playChoice, setPlayChoice] = useState(null);
  const playing = playChoice ?? !reduced;
  const autoplay = playing && inView && stories.length > 0;

  // Advance through the stages, then on to the next project
  useEffect(() => {
    if (!autoplay || exiting) return;
    const timer = setTimeout(() => {
      if (stage < STAGES.length - 1) setStage(stage + 1);
      else if (stories.length > 1) setExiting(true);
      else setStage(0);
    }, STAGES[stage].duration);
    return () => clearTimeout(timer);
  }, [autoplay, exiting, stage, storyIndex, stories.length]);

  // Fade the card out, then swap in the next project
  useEffect(() => {
    if (!exiting) return;
    const timer = setTimeout(() => {
      setStoryIndex((index) => (index + 1) % stories.length);
      setStage(0);
      setExiting(false);
    }, reduced ? 0 : EXIT_MS);
    return () => clearTimeout(timer);
  }, [exiting, reduced, stories.length]);

  if (stories.length === 0) return null;
  const story = stories[storyIndex];

  const goToStage = (index) => {
    if (exiting) return;
    setStage(index);
    setPlayChoice(false); // the visitor took control
  };

  return (
    <div
      ref={containerRef}
      className={`relative flex flex-col ${className}`}
      role="region"
      aria-label="From a client's requirement to a running system"
    >
      <p className="sr-only">{describe(story)}</p>

      <div className={`relative flex-1 min-h-0 ${styles.glow}`} aria-hidden="true">
        <Canvas
          className="!absolute inset-0"
          frameloop={inView ? "always" : "never"}
          dpr={[1, 2]}
          flat
          gl={{ antialias: true, alpha: true }}
          camera={{ fov: 35, near: 0.1, far: 50, position: [0, 0, 9] }}
        >
          <CardScene story={story} stage={stage} exiting={exiting} reduced={reduced} />
        </Canvas>
      </div>

      <div className="flex flex-col items-center gap-2 pt-2 pb-1">
        <Link
          href={story.href}
          className="text-xs text-gray-400 hover:text-white transition rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500"
        >
          {story.title} <span aria-hidden="true">→</span>
        </Link>

        <div className="flex items-center gap-1 rounded-full border border-gray-800 bg-gray-900/80 p-1 backdrop-blur">
          <button
            type="button"
            onClick={() => setPlayChoice(!playing)}
            className="p-1.5 rounded-full text-gray-400 hover:text-white transition focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500"
            aria-label={playing ? "Pause animation" : "Play animation"}
          >
            <Icon name={playing ? "pause" : "play"} className="w-4 h-4" />
          </button>

          {STAGES.map((item, index) => (
            <button
              key={item.label}
              type="button"
              onClick={() => goToStage(index)}
              aria-current={index === stage ? "step" : undefined}
              className={`relative px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 ${
                index === stage ? "bg-white/10 text-white" : "text-gray-400 hover:text-white"
              }`}
            >
              {item.label}
              {index === stage && autoplay && !exiting && (
                <span
                  key={`${storyIndex}-${stage}`}
                  className={styles.progress}
                  style={{ animationDuration: `${item.duration}ms` }}
                  aria-hidden="true"
                />
              )}
            </button>
          ))}

          {stories.length > 1 && (
            <button
              type="button"
              onClick={() => !exiting && setExiting(true)}
              className="p-1.5 rounded-full text-gray-400 hover:text-white transition focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500"
              aria-label="Next project"
            >
              <Icon name="chevronRight" className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
