/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "export",
  trailingSlash: true,
  // Exclude archive folder from page generation
  pageExtensions: ["js", "jsx", "mdx"],
  // Enable Turbopack
  turbopack: {},
};

module.exports = nextConfig;
