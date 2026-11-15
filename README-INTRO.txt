INTRO PART ONLY: drop-in update for the Perlas website project

How to use (step by step)
1. Unzip this file.
2. Copy the folders "src", "public" and the file "index.html" into your project folder, and choose "Replace" when asked. Paths match the project exactly.
3. In the project folder run: npm install, then npm run build, then npm run preview, and open http://localhost:4173
4. Nothing else changes. Your env variables, ribbon, socials and other sections are untouched.

What changed
- The aircraft now flies completely off the screen (with its golden trail faded) BEFORE the invitation appears. The invitation then fades in.
- Phones get the same real 3D aircraft and the same flight as desktop. (Before, phones on a slower connection were sent to a simple icon version.) The simple version is now used only on devices with no WebGL at all.
- Smoother: no whole-page re-render every second any more, shaders and textures are warmed up behind the loading screen, no garbage-collection churn in the animation loop, gsap is loaded before the flight, and resolution drops automatically on a weak device instead of the flight stuttering or being cut short.
- Timing is the same on every device (see flightTiming in src/utils/intro.ts).

Files
src/utils/intro.ts, src/components/intro/*, src/App.tsx, src/hooks/useEventPhase.ts, src/layouts/MainLayout.tsx,
src/components/hero/revealHero.ts, src/config/event.ts, src/styles/index.css, src/main.tsx, index.html, public/boot.js, public/models/*.glb
