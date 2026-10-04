# Jigyasa rebuild requirements

Sources: Criterion A (Planning), B (Design), C (Development), E (Evaluation), and original Mars source.

## Preserve
- Curiosity mission overview with accurate launch and landing dates.
- Search by Earth date, showing only images captured on the requested date (UTC).
- Clear invalid-date, empty-result, and upstream-outage states.
- Email/password registration, login, logout, server-side sessions, persistent accounts.
- A simple experience for nontechnical visitors.

## Improve
- Inclusive date ranges, camera filters, pagination.
- Accessible image viewer with zoom, image metadata, and original-source links.
- Saved images and personal observation notes.
- Responsive design, keyboard navigation, reduced-motion support.
- Warm editorial design with orbital animation and restrained interaction details.

## Original setup findings
- Repository has Eclipse metadata and bundled JARs, but no Maven/Gradle build definition.
- Java/Tomcat/MySQL are not available in the current environment.
- DAO stores plaintext passwords and LoginServlet attempts to log credentials.
- Database initialization can leave a null connection; singleton lifecycle is fragile.
- NASA request has no timeout, date validation, or useful upstream failure handling.
- JSP prints unescaped request values and tries to parse missing JSON on initial load.

## Technology decision
User approved any technology on October 3, 2026, with functionality and privacy as priorities. The chosen stack is Node.js 24 with SQLite. Original Java/JSP/MySQL source is preserved for reference.

## Data integration
NASA's public gallery uses https://mars.nasa.gov/api/v1/raw_image_items.
Verified date bounds: condition_N=YYYY-MM-DD:date_taken:gte and exclusive next-day :date_taken:lt; mission is msl. The April 14, 2020 query returns sol 2733 images with matching UTC capture dates.
This is the gallery's operational endpoint, not a guaranteed stable public API contract. Isolate it in an adapter and report failures distinctly from zero results.

## Implemented local version
The new application is in `next/` and runs with Node.js 24 + SQLite; this technology change is approved by the user. All original files remain unchanged. See next/README.md for launch instructions and current limits.
