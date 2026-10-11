// Smit Gabani Portfolio - Main Page
import { useEffect, useState } from "react";
import userData from "../data/user.json";
import ScrollProgress from "../components/ScrollProgress";
import CommandPalette from "../components/CommandPalette";
import SiteFooter from "../components/SiteFooter";
import HomeHead from "../components/home/HomeHead";
import Navbar from "../components/home/Navbar";
import BackToTop from "../components/home/BackToTop";
import Hero from "../components/home/Hero";
import About from "../components/home/About";
import Experience from "../components/home/Experience";
import Projects from "../components/home/Projects";
import Skills from "../components/home/Skills";
import Community from "../components/home/Community";
import Writing from "../components/home/Writing";
import Contact from "../components/home/Contact";

export default function Home({ githubStats, stackoverflowStats, latestPosts }) {
  const user = userData;
  const [showNavbar, setShowNavbar] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);

  // Show the navbar (and back-to-top) once scrolled past 80% of the hero
  useEffect(() => {
    const handleScroll = () => setShowNavbar(window.scrollY > window.innerHeight * 0.8);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <HomeHead user={user} />

      {/* Scroll Progress Indicator */}
      <ScrollProgress />

      {/* Command Palette - Press CMD+K or CTRL+K */}
      <CommandPalette
        open={paletteOpen}
        onOpenChange={setPaletteOpen}
        projects={user.projects}
        socialLinks={user.links}
      />

      {/* SEO: Main wrapper with semantic structure */}
      <div className="min-h-screen bg-gray-950" itemScope itemType="https://schema.org/WebPage">
        {/* Skip to main content for accessibility */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-purple-600 text-white px-4 py-2 rounded z-[9999]"
        >
          Skip to main content
        </a>

        <Navbar user={user} visible={showNavbar} onOpenSearch={() => setPaletteOpen(true)} />
        <BackToTop visible={showNavbar} />

        <main id="main-content" role="main" itemProp="mainContentOfPage">
          <Hero user={user} />
          <About user={user} />
          <Experience user={user} />
          <Projects user={user} />
          <Skills user={user} />
          <Community user={user} githubStats={githubStats} stackoverflowStats={stackoverflowStats} />
          <Writing posts={latestPosts} />
          <Contact user={user} />
        </main>

        <SiteFooter />
      </div>
    </>
  );
}

// Fetch live GitHub/Stack Overflow stats and the latest blog posts at build time
export async function getStaticProps() {
  const { fetchGitHubStats, formatStat: formatGitHubStat } = await import('../lib/api/github');
  const { fetchStackOverflowStats, formatStat: formatStackOverflowStat } = await import('../lib/api/stackoverflow');
  const { fetchMediumPosts } = await import('../lib/api/medium');

  try {
    // Each fetcher returns null if its API is unreachable
    const [githubData, stackoverflowData, medium] = await Promise.all([
      fetchGitHubStats('smitgabani'),
      fetchStackOverflowStats('19144656'),
      fetchMediumPosts(3),
    ]);

    // Only what the home page cards show
    const latestPosts = medium.posts.map(({ title, link, pubDate, thumbnail, readTime }) => ({
      title,
      link,
      pubDate,
      thumbnail,
      readTime,
    }));

    // Format stats for display; unknown values stay null and are hidden
    const githubStats = githubData && {
      repositories: formatGitHubStat(githubData.repositories),
      contributions: formatGitHubStat(githubData.contributions),
      stars: formatGitHubStat(githubData.stars),
      followers: formatGitHubStat(githubData.followers),
    };

    const stackoverflowStats = stackoverflowData && {
      reputation: formatStackOverflowStat(stackoverflowData.reputation),
      answers: formatStackOverflowStat(stackoverflowData.answers),
      badges: stackoverflowData.badges,
    };

    return {
      props: {
        githubStats,
        stackoverflowStats,
        latestPosts,
      },
      // Note: revalidate not supported with static export
      // Stats are fetched at build time only
    };
  } catch (error) {
    console.error('Error fetching stats in getStaticProps:', error);

    // The page hides stats it doesn't have
    return {
      props: {
        githubStats: null,
        stackoverflowStats: null,
        latestPosts: [],
      },
    };
  }
}
