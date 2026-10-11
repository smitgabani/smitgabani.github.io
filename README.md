# Smit Gabani · Portfolio

Source code for **[smitgabani.github.io](https://smitgabani.github.io)**, the portfolio of Smit Gabani, a Systems Developer & Cloud Architect based in Toronto.

[Live site](https://smitgabani.github.io) · [Blog](https://smitgabani.github.io/blog/) · [LinkedIn](https://linkedin.com/in/smitgabani) · [Email](mailto:gabanismit11@gmail.com)

## About

Systems-focused developer specializing in distributed architectures, cloud infrastructure, and backend systems, with a focus on scalable microservices, CI/CD pipelines, and containerized deployments.

- **Education:** Advanced Diploma, Computer Programming and Analysis, Seneca College (2020–2023)
- **Certifications:** AWS Certified Cloud Practitioner (2023), AWS Certified Cloud Developer (2025)
- **Core skills:** Python, TypeScript, Go, Node.js · AWS, Docker, Kubernetes, Terraform · PostgreSQL, MongoDB, Redis · GitHub Actions, GitLab CI

## What's in the site

- One-page portfolio: about, experience, projects, skills, community stats and a contact form
- A detail page for each project at `/projects/<slug>`
- A blog index built from my Medium feed
- GitHub and Stack Overflow stats, fetched live at build time
- A Three.js "morphing card" in the hero that shows each project's journey: client request → code → system → end users
- A command palette (⌘K / Ctrl K), a mobile menu, keyboard support and reduced-motion support

## Tech stack

Next.js 16 (static export) · React 19 · Tailwind CSS 3 · Three.js with React Three Fiber · cmdk · Web3Forms · GitHub Actions and GitHub Pages

## Run locally

Requires Node.js 20.9 or newer (CI uses Node 22).

```bash
npm ci
npm run dev     # http://localhost:3000
npm run build   # static site in out/
```

Optional: copy `.env.local.example` to `.env.local` and add a `GITHUB_TOKEN` to include the GitHub contribution count. Without a token, the build uses GitHub's public API and leaves that number out.

## Editing content

All profile content (bio, experience, projects, skills, certifications and links) lives in [`data/user.json`](data/user.json). Project pages are generated from its `projects` list, and each project's `story` drives the hero animation (format documented in [`components/MorphingCard/index.js`](components/MorphingCard/index.js)).

## Project structure

```
data/         user.json: all site content
pages/        Home, project pages and blog
components/   UI components; home/ holds the home page sections, MorphingCard/ the hero animation
lib/          GitHub and Stack Overflow API clients, shared helpers
public/       Images, icons, retired service worker
styles/       Global CSS
```

## Deployment

Pushing to `main` runs [`.github/workflows/nextjs.yml`](.github/workflows/nextjs.yml), which builds the static export and publishes it to GitHub Pages.
