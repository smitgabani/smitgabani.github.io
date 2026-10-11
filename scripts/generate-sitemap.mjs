// Writes out/sitemap.xml after `next build`, from the same data the pages use,
// so new projects are listed automatically and lastmod reflects the deploy.
import { readFileSync, writeFileSync } from "node:fs";

const SITE_URL = "https://smitgabani.github.io";
const user = JSON.parse(readFileSync(new URL("../data/user.json", import.meta.url), "utf8"));
const lastmod = new Date().toISOString().slice(0, 10);

// Trailing slashes match next.config.js (trailingSlash: true)
const pages = [
  { path: "/", changefreq: "weekly", priority: "1.0" },
  { path: "/blog/", changefreq: "weekly", priority: "0.8" },
  ...user.projects.map((project) => ({
    path: `/projects/${project.slug}/`,
    changefreq: "monthly",
    priority: "0.7",
  })),
];

const urls = pages
  .map(
    ({ path, changefreq, priority }) => `  <url>
    <loc>${SITE_URL}${path}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`
  )
  .join("\n");

writeFileSync(
  new URL("../out/sitemap.xml", import.meta.url),
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`
);
console.log(`sitemap.xml: ${pages.length} URLs`);
