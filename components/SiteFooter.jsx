// Site-wide footer, shared by the home, blog and project pages
import Link from "next/link";
import user from "../data/user.json";
import { trackDownload } from "./Analytics";
import { NAV_SECTIONS } from "../lib/sections";

export default function SiteFooter() {
  const email = user.links.email.replace(/^mailto:/, "");

  return (
    <footer
      className="py-12 bg-gray-950 border-t border-gray-800"
      role="contentinfo"
      itemScope
      itemType="https://schema.org/WPFooter"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand */}
          <div
            className="md:col-span-1"
            itemScope
            itemType="https://schema.org/Person"
          >
            <div className="flex items-center gap-3 mb-4">
              <span
                className="text-white text-xl font-bold"
                aria-hidden="true"
              >
                {user.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </span>
              <span className="text-white font-bold" itemProp="name">
                {user.name}
              </span>
            </div>
            <p className="text-gray-500 text-sm" itemProp="jobTitle">
              {user.title}
            </p>
            <p
              className="text-gray-600 text-xs mt-2"
              itemProp="address"
              itemScope
              itemType="https://schema.org/PostalAddress"
            >
              <span itemProp="addressLocality">{user.location}</span>,{" "}
              <span itemProp="addressCountry">Canada</span>
            </p>
          </div>

          {/* Navigation Links */}
          <nav aria-label="Footer navigation">
            <h3 className="text-white font-semibold mb-4">Navigation</h3>
            <ul className="space-y-2 text-gray-400 text-sm">
              {NAV_SECTIONS.map((section) => (
                <li key={section.id}>
                  <a
                    href={`/#${section.id}`}
                    className="hover:text-white transition rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:text-white"
                  >
                    {section.label}
                  </a>
                </li>
              ))}
              <li>
                <Link
                  href="/blog"
                  className="hover:text-white transition rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:text-white"
                >
                  Blog
                </Link>
              </li>
            </ul>
          </nav>

          {/* Social + contact links */}
          <nav aria-label="Social and contact links" className="md:col-span-2">
            <h3 className="text-white font-semibold mb-4">Connect</h3>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li>
                <a
                  href={user.links.github}
                  target="_blank"
                  rel="noopener noreferrer me"
                  className="hover:text-white transition rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:text-white"
                  aria-label="Visit my GitHub profile (opens in new tab)"
                >
                  GitHub
                </a>
              </li>
              <li>
                <a
                  href={user.links.linkedin}
                  target="_blank"
                  rel="noopener noreferrer me"
                  className="hover:text-white transition rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:text-white"
                  aria-label="Connect with me on LinkedIn (opens in new tab)"
                >
                  LinkedIn
                </a>
              </li>
              <li>
                <a
                  href={user.links.twitter}
                  target="_blank"
                  rel="noopener noreferrer me"
                  className="hover:text-white transition rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:text-white"
                  aria-label="Follow me on Twitter (opens in new tab)"
                >
                  Twitter
                </a>
              </li>
              <li>
                <a
                  href={user.links.email}
                  className="hover:text-white transition rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:text-white"
                >
                  {email}
                </a>
              </li>
              <li className="pt-2">
                <a
                  href={user.resume_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackDownload("resume.pdf")}
                  className="text-purple-400 hover:text-purple-300 transition rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500"
                  aria-label="Download my resume as PDF (opens in new tab)"
                >
                  Download Resume →
                </a>
              </li>
            </ul>
          </nav>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-sm">
            <small>
              ©{" "}
              <time dateTime={new Date().getFullYear().toString()}>
                {new Date().getFullYear()}
              </time>{" "}
              {user.name}. All rights reserved.
            </small>
          </p>
          <p className="text-gray-600 text-xs">
            <small>
              Built with{" "}
              <span itemProp="applicationCategory">
                Next.js, Three.js & Tailwind CSS
              </span>
            </small>
          </p>
        </div>
      </div>
    </footer>
  );
}
