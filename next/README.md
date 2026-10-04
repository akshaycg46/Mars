# Jigyasa — the rebuilt explorer

A runnable redesign of the original Mars project. This version uses Node.js 24 and SQLite. The original Java/JSP/MySQL source remains in `../src`.

## Start

From this folder:

```powershell
node server.mjs
```

Open http://127.0.0.1:4173. No package installation or NASA API key is needed. The server needs internet access to reach NASA. If port 4173 is occupied, set `PORT` before starting.

From the workspace root, you can also run `./Start-Jigyasa.ps1`.

## Included

- Live Curiosity imagery with UTC Earth-date searches, inclusive date ranges, camera filtering, and pagination.
- NASA image metadata, full-resolution links, and a viewer with 100–400% zoom.
- Email/password accounts, scrypt password hashing, persistent server sessions, and logout.
- A personal field notebook with saved images and observation notes.
- Responsive layouts, semantic forms, keyboard-operable dialogs, reduced-motion support, and a motion pause button.
- Distinct invalid input, empty result, image failure, and NASA service error states.

## Storage and privacy

Accounts and notebooks live in `next/.data/jigyasa.sqlite`, excluded from Git. Back up this directory to preserve accounts. New accounts do not recover old MySQL accounts. NASA receives photo queries; account credentials remain on this local server.

## Verification

```powershell
node --test test/app.test.mjs
```

Tests cover date bounds (including leap day), invalid dates, registration, duplicate email, login failure, authenticated sessions, logout, bookmark ownership and persistence across login, cross-site request rejection, private-file protection, and upstream failures. External NASA requests are mocked in automated tests.

Live verification on October 3, 2026: April 14, 2020 returns 86 images with matching capture dates; pre-landing March 1, 2000 returns zero images. Browser checks covered real images, the image viewer, 150% zoom, empty results, and mobile layout with no horizontal overflow.

## Data source

Uses the operational endpoint behind [NASA's Curiosity raw image gallery](https://mars.nasa.gov/msl/multimedia/raw-images/). This endpoint may change without notice; integration lives in `server.mjs`. Queries have a 20-second timeout and a bounded five-minute memory cache. A service outage is never presented as an empty search.

## Deployment status

This is a local working version, not a public deployment. It listens on loopback. A public deployment needs an HTTPS reverse proxy, `COOKIE_SECURE=1`, persistent storage/backups, and production hosting configuration. Email verification and password recovery are not implemented. The user approved modernizing the technology; accounts use SQLite. The original Java/JSP/MySQL code remains available for reference.

The illustrative planet and rover line art are decorative. Gallery photographs are actual NASA images with credits.

### Direct NASA verification

On October 3, 2026, the running app returned image 800622 for April 14, 2020 with the Mastcam filter. A separate request to NASA confirmed exact matches for image URL, capture time (2020-04-14T06:24:32.000Z), instrument (MAST_RIGHT), and sol (2733). The NASA-hosted URL returned HTTP 200, image/jpeg, 286375 bytes, with a valid JPEG signature. No placeholder photos are substituted when the archive is unavailable.

## 3D update

NASA's Mars and Curiosity GLB models now render through a locally bundled model-viewer 4.3.1. Mars rotates at 8 degrees per second; Curiosity rotates at 10 degrees per second. These speeds are for viewing, not physical simulations. Both support drag and keyboard controls; the rover supports zoom and reset. The page's pause control and operating-system reduced-motion preference disable automatic rotation. Offscreen and hidden-tab scenes stop rotating, and the rover file is loaded only when its section approaches the viewport.

The Content Security Policy permits the exact SHA-256 hash of the viewer's bundled shadow stylesheet, WebAssembly compilation, and local blob textures. It does not allow general JavaScript eval or arbitrary inline scripts/styles. Git attributes preserve the stylesheet's LF line endings across platforms.
