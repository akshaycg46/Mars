# Consolidated Jigyasa context

Consolidated November 17, 2026 from accessible chats and repository documentation, then updated for repository handoff. Historical verification statements describe earlier checks unless explicitly dated below.

This file preserves project decisions and recovered history for future contributors and coding chats. Use [README.md](README.md) for setup, [next/README.md](next/README.md) for application behavior, and [docs/SIMULATION.md](docs/SIMULATION.md) for simulation provenance and limits. Update this context when decisions or verified status change.

## Identity and location

Jigyasa is the product name; Mars is the repository name. They refer to the same current project, not two separate applications.

- Repository paths below are relative to the Mars checkout; the checkout location can differ between computers.
- The historical checkout was under `C:\Users\aksha\Documents\Codex\Jigyasa`. On November 17, 2026, the app was located under `C:\Users\aksha\OneDrive\Documents\ChatGPT\Jigyasa\Mars`. These are machine-specific locations, not setup requirements.
- Repository: checkout root, origin https://github.com/akshaycg46/Mars.
- Current app: `next/`.
- Original Java/JSP/MySQL implementation: `src/`, retained for reference.
- Previously located Google Drive folder: https://drive.google.com/drive/folders/15m0yQ-n-iTes9jy-m8rzGM5WhEXYNTd7. Access was reported in October; it was not rechecked during consolidation.

## Project purpose and implemented features

Explore authentic Curiosity photographs by UTC Earth date, inclusive date range and camera, with pagination, metadata, original image links, zoom, and distinct invalid-date, empty-result and service-failure states. Accounts support registration, login, logout, persistent sessions, saved photos and private observation notes.

The interface includes rotating Mars and Curiosity models and the Gale drive simulator. Driving uses measured HiRISE elevations, a survey map, targets, rover controls, simplified suspension/traction and illustrative weather. Accessibility includes keyboard operation, responsive layouts, reduced-motion handling and pause controls.

## Established decisions

Repository documentation records approval on October 3, 2026 to modernize the technology, prioritizing functionality and privacy. The current implementation uses Node.js 24, built-in HTTP and SQLite, HTML/CSS/browser JavaScript, locally bundled model-viewer, Three.js and Rapier. The folder named next is not a Next.js application; package.json starts server.mjs directly.

NASA imagery comes from the operational Curiosity gallery endpoint. No NASA API key is required. The app retries upstream failures once with an eight-second timeout per attempt. Successful exact-query metadata is cached for five minutes; matching cached responses up to 24 hours old can be explicitly labeled during outages. An outage must never be represented as zero results or as photographs from a different query.

## Local operation and data

Run `node server.mjs` from `next/`, then open http://127.0.0.1:4173. The optional launcher is `Start-Jigyasa.ps1` in the repository root. Node must support node:sqlite; the package requires version 24 or newer. Browser libraries and assets are bundled, so no package installation is needed.

Local accounts and notebooks live in `next/.data/jigyasa.sqlite`, excluded from Git. A GitHub clone does not restore these records. Stop servers before transferring the whole .data directory, including any remaining WAL/SHM files; back up an existing destination before replacement. Do not assume older laptop notebooks were transferred. No database replacement was performed during this organization task.

## History recovered from chats

- October 7: user sought Jigyasa/Mars after changing laptops and preparing to reset the old one. Earlier advice emphasized transferring complete folders, Git history and local databases before resetting.
- October 7: repository and Drive access were identified. User explicitly chose a local Codex project. Mars was cloned into this Jigyasa folder.
- October 7: current chat started the app using Node 24.19.0 and confirmed HTTP 200 at the local address.
- October 16: current chat restarted the app and confirmed HTTP 200.
- October 16 portfolio work: user confirmed Jigyasa is locally hosted. The portfolio was updated with an actual simulator screenshot rather than a public live-demo link. The portfolio chat reports deployment at https://akshaycgupta.vercel.app; that is the portfolio, not a hosted Jigyasa instance.
- November 17: user requested a single organized project like GuppyMind, collecting relevant chat context. Existing Jigyasa project reused; the two earlier dedicated Jigyasa chats moved into it, and these notes and transcript snapshots added.

## Simulation accuracy and limits

Measured terrain elevation and collision surfaces share the source samples and use 1x vertical scale. Mars gravity is 3.71 m/s². Explore mode's faster speed and assistance are educational settings. Weather presets, surface tint/detail and sky are illustrative; weather is not live. Suspension, traction and vehicle dynamics are approximations, not NASA-validated engineering simulation. The rugged tile is not claimed to be an actual Curiosity route. See docs/SIMULATION.md for provenance, controls and numerical detail.

## Deployment and verification status

Jigyasa is a loopback local application. No public Jigyasa deployment is established in the recovered context. Public deployment would require HTTPS, secure cookies and persistent storage configuration. Email verification and password recovery are not implemented.

Prior repository documentation records automated account, privacy, NASA caching and simulation checks, plus browser checks. Run `node --test test/*.test.mjs` from `next/` when validating code changes. The earlier organization task changed documentation and chat membership only; it did not rerun application tests. Later on November 17, 2026, the app was started from the OneDrive checkout with Node.js 24.22.1 and its homepage returned HTTP 200 containing Jigyasa. This was a startup check, not a full functional or regression test, and does not guarantee that a server remains running.

## Context coverage

The earlier consolidation reported reviewing all locally listed active/archived Codex chat titles and paginated accessible active/archived ChatGPT history titles. Read the dedicated Jigyasa chats and the mixed portfolio chat. No other dedicated Jigyasa/Mars chat was identified in the accessible listings. Title-based discovery cannot guarantee that every incidental mention in unrelated chats was found. Original development chats on the other laptop were not available here; the repository's rebuild, simulation, connectivity and README documents preserve implementation context but are not substitutes for those full conversations.

Future work should begin with this file and the application documentation. The source index and transcript snapshots created during the earlier consolidation were local artifacts outside the Mars repository; their presence in GitHub has not been established. This file is a summary, not a complete conversation archive. No feature-development request was pending from the consolidation task.



## Maintaining this context

Keep durable decisions, known limitations and dated verification results here. Keep installation instructions in README.md and implementation details in their relevant documentation. Do not commit local databases, credentials, session data or private notebook contents. A fresh clone restores versioned code and documentation, not private local data or Codex chat membership.
