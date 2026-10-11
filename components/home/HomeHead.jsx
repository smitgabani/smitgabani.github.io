// SEO meta tags and structured data (JSON-LD) for the home page
import Head from "next/head";
import { NAV_SECTIONS } from "../../lib/sections";

export default function HomeHead({ user }) {
  // SEO: Generate skills list for description
  const allSkills = Object.values(user.skills).flat();

  // SEO: Canonical URL
  const siteUrl = "https://smitgabani.github.io";
  const canonicalUrl = siteUrl;

  // SEO: Structured Data (JSON-LD) for Person
  const personSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: user.name,
    url: siteUrl,
    image: `${siteUrl}/smitgabani.jpg`,
    jobTitle: user.title,
    description: user.bio[0],
    email: user.email,
    telephone: user.phone,
    address: {
      "@type": "PostalAddress",
      addressLocality: user.location,
      addressCountry: "Canada",
    },
    sameAs: [user.links.linkedin, user.links.github, user.links.twitter],
    knowsAbout: allSkills,
    alumniOf: {
      "@type": "EducationalOrganization",
      name: user.education[0].institution,
    },
    hasCredential: user.certifications.map((cert) => ({
      "@type": "EducationalOccupationalCredential",
      name: cert.name,
      credentialCategory: "certification",
      recognizedBy: {
        "@type": "Organization",
        name: cert.issuer,
      },
    })),
  };

  // SEO: Structured Data for WebSite
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: `${user.name} - Portfolio`,
    url: siteUrl,
    description: user.bio[0],
    author: {
      "@type": "Person",
      name: user.name,
    },
  };

  // SEO: Structured Data for Professional Service
  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: `${user.name} - ${user.title}`,
    description: user.bio.join(" "),
    url: siteUrl,
    telephone: user.phone,
    email: user.email,
    address: {
      "@type": "PostalAddress",
      addressLocality: user.location,
      addressCountry: "Canada",
    },
    priceRange: "$$",
    areaServed: {
      "@type": "Country",
      name: "Canada",
    },
  };

  // SEO: BreadcrumbList for better navigation in search results
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
      ...NAV_SECTIONS.map((section, index) => ({
        "@type": "ListItem",
        position: index + 2,
        name: section.label,
        item: `${siteUrl}#${section.id}`,
      })),
    ],
  };

  return (
    <Head>
      {/* ==================== PRIMARY SEO ==================== */}
      <meta
        name="google-site-verification"
        content="5btffQ_j0ZyetQfVnTfJ0HtTRQXYxj3fwJFJTkpSOz8"
      />
      <title>Smit Gabani - Systems Developer &amp; Cloud Architect | Toronto, Canada</title>
      <meta
        name="description"
        content={`${user.bio[0]} ${user.bio[1]} Based in ${
          user.location
        }. Specializing in ${allSkills.slice(0, 5).join(", ")}.`}
      />
      <meta name="author" content={user.name} />
      <meta
        name="robots"
        content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"
      />
      <meta name="googlebot" content="index, follow" />
      <link rel="canonical" href={canonicalUrl} />

      {/* ==================== OPEN GRAPH (Facebook, LinkedIn) ==================== */}
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={`${user.name} Portfolio`} />
      <meta property="og:title" content={`${user.name} - ${user.title}`} />
      <meta property="og:description" content={`${user.bio[0]} ${user.bio[1]}`} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={`${siteUrl}/og-image.jpg`} />
      <meta
        property="og:image:alt"
        content={`${user.name} - ${user.title}`}
      />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:locale" content="en_CA" />

      {/* ==================== TWITTER CARD ==================== */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@SmitGabani7" />
      <meta name="twitter:creator" content="@SmitGabani7" />
      <meta name="twitter:title" content={`${user.name} - ${user.title}`} />
      <meta name="twitter:description" content={`${user.bio[0]} ${user.bio[1]}`} />
      <meta name="twitter:image" content={`${siteUrl}/og-image.jpg`} />
      <meta
        name="twitter:image:alt"
        content={`${user.name} - ${user.title}`}
      />

      {/* ==================== ADDITIONAL SEO META ==================== */}
      <meta name="subject" content={`${user.title} Portfolio`} />
      <meta name="rating" content="General" />
      <meta name="referrer" content="origin-when-cross-origin" />
      <meta name="format-detection" content="telephone=yes" />
      <meta name="geo.region" content="CA-ON" />
      <meta name="geo.placename" content="Toronto" />
      <meta name="geo.position" content="43.6532;-79.3832" />
      <meta name="ICBM" content="43.6532, -79.3832" />

      {/* ==================== STRUCTURED DATA (JSON-LD) ==================== */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
    </Head>
  );
}
