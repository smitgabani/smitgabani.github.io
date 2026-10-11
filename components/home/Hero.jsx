// Intro text plus the morphing card (requirement -> code -> system -> users)
import dynamic from "next/dynamic";
import Icon from "../Icon";
import { trackButtonClick, trackDownload } from "../Analytics";
import { scrollToSection } from "../../lib/sections";

// Three.js card, client-side only (WebGL isn't available during SSR)
const MorphingCard = dynamic(() => import("../MorphingCard"), { ssr: false });

export default function Hero({ user }) {
  return (
    <section
      id="hero"
      className="relative h-screen h-svh flex flex-col justify-end lg:block bg-gradient-to-br from-gray-950 via-purple-950/20 to-gray-950 overflow-hidden"
      aria-label="Introduction"
      itemScope
      itemType="https://schema.org/WPHeader"
    >
      {/* Requirement -> code -> system -> users, told with real projects */}
      <div className="relative flex-1 min-h-0 pt-4 lg:pt-0 lg:absolute lg:right-0 lg:top-[12%] lg:bottom-[10%] lg:w-1/2 xl:w-[55%] max-lg:[@media(max-height:560px)]:hidden">
        <MorphingCard projects={user.projects} className="h-full" />
      </div>

      <div className="relative z-10 mx-[5%] px-4 pt-4 pb-[6vh] lg:absolute lg:mx-0 lg:p-0 lg:px-4 lg:left-[5%] lg:top-1/2 lg:-translate-y-1/2 text-left max-w-xl lg:max-w-md xl:max-w-lg">
        <p
          className="text-base sm:text-lg text-purple-400 mb-2 animate-fade-in-up font-medium"
          style={{ animationDelay: "0.05s", animationFillMode: "both" }}
          itemProp="jobTitle"
        >
          {user.title}
        </p>
        <h1
          className="text-4xl sm:text-5xl md:text-7xl font-bold text-white mb-4 md:mb-6 animate-fade-in-up"
          style={{ animationDelay: "0.1s", animationFillMode: "both" }}
          itemProp="headline"
        >
          Hi, I&apos;m
          <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
            {" "}
            {user.name.split(" ")[0]}
          </span>
        </h1>
        <p
          className="text-lg md:text-xl text-gray-400 mb-6 md:mb-8 max-w-2xl animate-fade-in-up"
          style={{ animationDelay: "0.2s", animationFillMode: "both" }}
          itemProp="description"
        >
          {user.bio[0]}
        </p>
        <nav
          className="flex flex-wrap gap-3 sm:gap-4 justify-start animate-fade-in-up"
          style={{ animationDelay: "0.3s", animationFillMode: "both" }}
          aria-label="Primary actions"
        >
          <button
            onClick={() => {
              scrollToSection("projects");
              trackButtonClick("View Projects", "Hero Section");
            }}
            className="px-6 sm:px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-950"
            aria-label="View my projects"
          >
            View Projects
          </button>
          <button
            onClick={() => {
              scrollToSection("contact");
              trackButtonClick("Contact Me", "Hero Section");
            }}
            className="px-6 sm:px-8 py-3 border border-gray-600 hover:border-gray-500 text-white rounded-lg font-medium transition focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-950"
            aria-label="Contact me"
          >
            Contact Me
          </button>
          <a
            href={user.resume_link}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackDownload("resume.pdf")}
            className="inline-flex items-center gap-2 px-2 py-3 text-gray-300 hover:text-white font-medium transition rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500"
          >
            <Icon name="document" className="w-5 h-5" />
            Résumé
          </a>
        </nav>
      </div>
    </section>
  );
}
