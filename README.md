# Perlas Travel & Tours: Grand Opening Invitation

Invitation site for the **Grand Opening & Ribbon Cutting Ceremony**, November 27, 2026, 10:00 AM (Asia/Manila), Intramuros Corporate Plaza, Room 209.

React 18 + TypeScript + Vite + Tailwind. Three.js for the opening flight, GSAP for the reveal. No backend, no database. RSVP is a Google Form. Light theme only.

## Run locally
```bash
npm install
cp .env.example .env     # fill in values, see below
npm run dev              # http://localhost:5173
npm run build            # typecheck + production build into dist/
npm run preview          # serve dist/ at http://localhost:4173 (use this to test the intro, the dev server is slower)
```
Needs Node 18+.

## Configuration
Copy, program and contact placeholders live in `src/config/event.ts`. Environment variables (`.env` locally, Project Settings on Vercel). They are all public values, never put secrets here.

| Variable | Purpose |
|---|---|
| `VITE_GOOGLE_FORM_URL` | Google Form share link. The RSVP button stays disabled until this is set. |
| `VITE_GOOGLE_FORM_EMBED_URL` | Optional. Enables "show the form on this page". |
| `VITE_GOOGLE_MAPS_URL` | Optional verified Google Maps link. Without it, directions use a name search. |
| `VITE_FACEBOOK_URL` | Official Facebook page, full https link. |
| `VITE_INSTAGRAM_URL` | Official Instagram profile, full https link. |
| `VITE_SITE_URL` | Final public address. Used for canonical, Open Graph, sitemap, robots. |
| `VITE_EVENT_STATUS` | Testing only: `upcoming`, `event-day` or `past`. Leave empty in production. |

Facebook and Instagram appear in the top bar, the hero, the closing section and the footer. Until a link is set they show as faded placeholders (no dead links). Links are checked: only https addresses on the right domain are accepted.

## Still needed from the client
- Google Form link (and embed link if the inline form is wanted)
- Facebook and Instagram links
- Founder photo: set `host.photo` in `event.ts` (until then a clean emblem panel is shown)
- Confirmed program times, contact email and phone
- A verified Google Maps link
- Real photographs of Intramuros (see "Images")
- Final domain for `VITE_SITE_URL`

None of these were invented.

## The opening sequence (it is the loading screen)
1. A static loading screen (pure HTML and CSS, painted with the first bytes) shows the emblem and a progress line. The line moves on real milestones: app started, 3D engine loaded, aircraft downloaded.
2. The aircraft flies bottom-left to top-right with a golden trail, framed by film-style bars with the tagline.
3. The invitation appears as the aircraft leaves.

It plays on every visit and has no Skip button. It is skipped only for visitors who ask their device for reduced motion. Safety nets: if the 3D parts are not ready in about 9 seconds, or the visitor is on a slow connection (3G or below, or data saver), or has no WebGL, a lighter CSS version of the same sequence plays instead. If anything fails, the page appears by 20 seconds at the latest.
To switch it off, set `intro.enabled: false` in `event.ts`.

Aircraft model: `public/models/perlas_passenger_jet.glb` (1 MB) and a `.lite.glb` (0.5 MB) for phones. It is a procedural, realistically proportioned airliner in the Perlas colours, not a photoscan.

## The ribbon
The closing ribbon is a real path-traced render (satin material, gold selvedge lines, woven grain, soft contact shadow) made with Blender's Cycles engine, shipped as two transparent WebP files (`ribbon-wide.webp`, `ribbon-mobile.webp`). The scene is in `tools/ribbon/ribbon.py` (`pip install bpy`, then `python ribbon.py -- wide 0.75 72 out.png`). Change the colours or bow shape there and re-render. It takes a few minutes.

## Images
The architecture pictures (`intramuros-left/right(.sm).webp`) are crops of the invitation artwork, so they match its look. They are illustrations, not photographs. For true photography, replace those files with licensed photos of Intramuros (San Agustin Church, Manila Cathedral), same file names, 930 px wide (`-sm` files 560 px wide), WebP. Check the licence and credit the photographer where required.

## Speed and slow connections
- Loading screen is inline in `index.html`, so something branded shows instantly.
- The 3D engine and aircraft download in parallel with the app, once, and are never blocked behind it.
- Slow or data-saver connections skip the 3D download entirely.
- Fonts are limited to the weights in use, self-hosted, Latin only.
- Images are WebP, with a smaller version for phones, and lazy-loaded below the fold. Sections below the hero are only laid out as they near the screen.
- A small service worker caches built files so repeat visits open almost instantly and survive a dropped connection. It never caches the page itself ahead of the network.

## Other details
- Countdown runs on Manila time and switches to "The Journey Begins Today!" and "Thank You for Celebrating With Us!" automatically.
- Add to Calendar: Google Calendar link and `.ics` (assumed 2-hour duration, edit `assumedDurationMinutes`).
- On phones a "Confirm Attendance" bar stays at the bottom after the hero.
- "Share the invitation" uses the phone share sheet, or copies the link.
- Security headers and a strict CSP are in `vercel.json`. Update the CSP if you add third-party scripts.
- Lighthouse was not run in the build environment. Run it on the deployed URL.

See `DEPLOYMENT.md` for deploying on Vercel.
