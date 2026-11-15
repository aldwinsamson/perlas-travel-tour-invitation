# Deploying to Vercel (manual)

Nothing in this project deploys automatically. You control every step.

## 1. Put the code on GitHub
1. Create a new empty repository on github.com (private is fine).
2. In the project folder:
```bash
git init
git add .
git commit -m "Perlas grand opening site"
git branch -M main
git remote add origin https://github.com/<you>/<repo>.git
git push -u origin main
```
`.gitignore` already excludes `node_modules`, `dist` and `.env`.

## 2. Import into Vercel
1. vercel.com, **Add New, Project**, choose the GitHub repo.
2. Framework preset: **Vite** (detected). Build command `npm run build`, output directory `dist`.
3. Add environment variables (Production): `VITE_GOOGLE_FORM_URL`, `VITE_GOOGLE_FORM_EMBED_URL` (optional), `VITE_GOOGLE_MAPS_URL` (optional), `VITE_FACEBOOK_URL`, `VITE_INSTAGRAM_URL`, `VITE_SITE_URL`.
4. Click **Deploy**. (To keep it from deploying on every push, disable it under Project Settings, Git.)

## 3. Google Form setup
Create the form, restrict it to what you need (name, attendance, guests, contact), and do not ask for payment. Copy **Send, link** for the URL and **Send, `<>` embed** (take the `src`) for the embed URL. Keep the response spreadsheet private.

## 4. Custom domain
Project, Settings, Domains, Add. Follow the DNS records Vercel shows. Then set `VITE_SITE_URL` to the final `https://` address and redeploy so canonical, OG tags, sitemap and robots.txt use it.

## 5. Verify
- Open the site on phone and desktop, light and dark.
- The loading screen appears at once, the aircraft flies, then the invitation appears. Open it once on a phone with mobile data too.
- Facebook and Instagram icons open the right pages in a new tab.
- RSVP button opens the form; Add to Calendar works.
- Share the link in a chat to check the preview image.
- Run Lighthouse and test at https://securityheaders.com.

## 6. Updating
Edit, commit, push to `main`; Vercel builds. Change an env var, then **Redeploy** (values are baked in at build time).

## Troubleshooting
- **RSVP button disabled**: `VITE_GOOGLE_FORM_URL` is missing or not an https Google link. Redeploy after setting it.
- **Embedded form is blank**: the form's embed URL must be used, not the share link. Or use the new-tab link.
- **No 3D aircraft, a simpler flight instead**: slow connection, data saver or no WebGL. This is the intended lighter version.
- **Old version still showing after an update**: the site caches files for speed. Refresh once, or close and reopen the tab.
- **Build fails on Vercel**: use Node 18+ (Settings, General, Node.js Version).
- **Wrong link in previews**: `VITE_SITE_URL` not set; set and redeploy, then re-scrape in the platform's debugger.
- **Third-party embed blocked**: check the CSP in `vercel.json`.
