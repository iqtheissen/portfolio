# Quint Theissen — Portfolio

An opinionated, animated developer portfolio built with Next.js (App Router). The site features a custom Three.js background, smooth-scrolling, animated UI components, and i18n support.

This README replaces the default template and summarizes the project structure, how to run and develop locally, where to find the important code, and tips for extending the portfolio.

## Table of contents

- Project overview
- Requirements
- Quick start (dev / build / preview)
- Project structure and key files
- Data & localization
- Development notes and tips
- Tests & quality gates
- Deployment
- Contributing
- License & author

## Project overview

This repository contains a personal portfolio website implemented using Next.js with the App Router. It integrates a Three.js-powered background scene, custom GLSL shaders and postprocessing, Lenis smooth-scrolling, GSAP animations, and a number of small, reusable UI components aimed at producing a polished, interactive portfolio experience.

Features

- Next.js with App Router
- Three.js background scene + custom shaders and postprocessing
- Smooth scrolling integration (Lenis) + GSAP ScrollTrigger
- Localized content (i18n)
- Project gallery with animated reveal, image grid, and info panels
- A collection of small UI components (buttons, nav, loading bar, etc.)

## Requirements

- Node.js 18+ recommended
- npm (or yarn / pnpm / bun) available in PATH
- Modern browser for development (Chromium/Firefox/Safari)

Note: The project uses ESM (`.mjs`) config files and modern JS syntax.

## Quick start

Install dependencies and run the development server:

```powershell
npm install
npm run dev
# open http://localhost:3000
```

Build and preview production build:

```powershell
npm run build
npm run start
```

If you use yarn or pnpm replace the install and script commands accordingly.

## Project structure and key files

Top-level notable files

- `next.config.mjs` — Next.js configuration
- `postcss.config.mjs` — PostCSS (Tailwind-like utilities if present)
- `i18n.js` — i18n initialization
- `package.json` — scripts and dependencies

App source (main folder: `app/`)

- `app/page.js` — Home / main page entry
- `app/layout.js` — Root layout, global providers and fonts
- `app/globals.css` — Global styles

Components & features

- `app/components/background/ThreeScene.jsx` — Three.js scene wrapper and renderer
- `app/components/background/VantaFog.jsx` — Custom fog-like background effect
- `app/init/init.js` — Three.js initialization, render loop and postprocessing
- `app/components/SmoothScrollContainer.jsx` — Lenis + ScrollTrigger integration
- `app/components/ui/*` — Reusable UI components (Navbar, Buttons, ProjectDisplay, etc.)
- `app/blocks/*` — smaller blocks used across the app

Data & content

- `app/data/projects.json` and `app/data/projects.nl.json` — Project metadata and localized content
- `locales/` — translation JSON files (e.g. `locales/en/common.json`, `locales/nl/common.json`)
- `public/projects/` — project images and static assets

Scripts & utilities

- `scripts/generateTextPaths.js` — helper to generate SVG text paths (used by DrawText)
- `app/hooks/` — custom React hooks (scroll progress, reveal animations, small utilities)







