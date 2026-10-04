# Jigyasa / Mars

Explore photographs from NASA's Curiosity rover, search by date and camera, and keep a personal notebook of saved images. The redesigned app includes rotating, interactive NASA 3D models of Mars and Curiosity.

## Run locally

Install Node.js 24 or newer, then:

```sh
git clone https://github.com/akshaycg46/Mars.git
cd Mars
cd next
node server.mjs
```

Open **http://127.0.0.1:4173**. On Windows, `./Start-Jigyasa.ps1` from the repository root also starts the app. No package installation, separate database server, or NASA API key is needed.

The URL is local to the computer running the app. A public deployment has not been configured.

## Features

- Real Curiosity photographs from NASA's gallery endpoint, with date ranges, camera filters, and pagination.
- Capture date, instrument, sol, NASA credits, original image links, and a zoom viewer.
- Email/password accounts, hashed passwords, server sessions, and private saved-photo notebooks with notes.
- NASA Mars and Curiosity 3D models with automatic rotation, drag controls, and rover zoom/reset.
- Responsive layouts, motion pause, reduced-motion support, and lazy loading for the rover model.

## Technology

| Layer | Technology |
| --- | --- |
| Server | Node.js 24, built-in HTTP server |
| Database | SQLite through `node:sqlite` |
| Interface | HTML, CSS, browser JavaScript modules |
| 3D | Google model-viewer 4.3.1 (WebGL / Three.js), NASA GLB assets |
| Authentication | scrypt password hashes, HttpOnly session cookies |
| Imagery | NASA / JPL Curiosity raw image gallery endpoint |
| Tests | Node.js test runner |

The 3D models and viewer are served from this repository. No analytics are included. Account data is stored in `next/.data/`, excluded from Git and inaccessible through the static-file routes.

## Tests

```sh
cd next
node --test test/app.test.mjs
```

[Setup, verification and deployment notes](next/README.md) · [Asset credits](next/public/ASSET-CREDITS.md) · [Rebuild requirements](docs/REBUILD.md)

## Original project

The original Java Servlets/JSP/MySQL implementation remains in `src/` as project history. The working redesign is in `next/`. Existing MySQL accounts are not migrated automatically.

NASA/JPL-Caltech and mission partners provide the photographs. NASA/JPL-Caltech and NASA VTAD provide the 3D models. This is an independent project, not affiliated with or endorsed by NASA.
