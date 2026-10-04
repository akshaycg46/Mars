# Archive connectivity and recovery

## October 4, 2026 fix

The local server had been launched in an execution environment that blocked outbound networking. NASA's endpoint itself returned HTTP 200 when tested with network access. Restarting the app with outbound access restored the live gallery. No API key change was needed.

The server now retries failed NASA requests once (8-second timeout per attempt). Successful responses are cached by the complete validated query in the local SQLite database, including date, camera, order and page. Entries are fresh for five minutes. If both attempts fail, an exact matching cached response can be shown for up to 24 hours with a visible retrieval timestamp and cached-results label. It never substitutes another date, camera or page. The cache is bounded to 100 queries and survives restarts; image bytes still come from NASA.

Without a matching cache entry, the app reports a connection failure and offers Retry. Permission failures distinguish a local network-access problem when the runtime supplies an access-denied error code. Local database/cache files remain excluded from Git and inaccessible from the web server's explicit static allowlist.

## Checks

- Live response metadata matched NASA for April 14, 2020, Mastcam: photo 800622, sol 2733, captured 06:24:32 UTC; JPEG download succeeded.
- Browser loaded the latest archive and real image thumbnails.
- Automated tests cover retry success, persistent cached results after restart, stale labeling, exact-query isolation and expiry.

## Starting locally

Run `node server.mjs` from `next`, or use `Start-Jigyasa.ps1` in a normal network-enabled terminal. The app needs outbound HTTPS to `mars.nasa.gov`; browser image downloads also need NASA host access. Do not disable firewall protections globally. If using a restricted development runner, grant only the app process the network access needed for these public NASA requests.
