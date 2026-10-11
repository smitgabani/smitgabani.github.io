/**
 * MorphingCard: a Three.js card that tells a project's story in four stages,
 *   Request -> Code -> System -> Users
 * using the `story` field on each project in pages/data/user.json.
 *
 * It renders WebGL, so import it client-side only:
 *   const MorphingCard = dynamic(() => import("../components/MorphingCard"), { ssr: false });
 *   <MorphingCard projects={user.projects} className="h-full" />
 *
 * Story shape (all fields required):
 *   client        who asked, e.g. "Automotive manufacturer"
 *   request       the client's words; should contain `keyword`
 *   keyword       the word that travels through every stage
 *   requirements  up to 3 short requirements (R1–R3)
 *   file          file name shown in the code view
 *   code          up to 7 { line, req? } entries; `req` (1–3) links a line to a requirement
 *   action        how the keyword appears in the system view, e.g. "POST /fragments"
 *   button        how it appears to end users, e.g. "Upload"
 *   nodes         up to 4 { label, sub }; the first is the entry point (API/CLI)
 *   users         up to 3 { label, icon } using names from components/Icon.jsx
 */
export { default } from "./MorphingCard";
