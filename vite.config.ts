import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

// one place decides the public url: explicit env, else vercel's production host, else a placeholder
function siteUrl(): string {
  const explicit = process.env.VITE_SITE_URL;
  if (explicit) return explicit.replace(/\/+$/, '');
  const v = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (v) return `https://${v}`;
  return 'https://your-domain.example';
}

// fills the canonical / og urls and writes robots + sitemap with the same host, so they never drift apart
function seoFiles(): Plugin {
  const url = siteUrl();
  let outDir = 'dist';
  return {
    name: 'perlas-seo',
    configResolved(c) {
      outDir = c.build.outDir;
    },
    transformIndexHtml: (html) => html.replaceAll('__SITE_URL__', url),
    closeBundle() {
      const root = resolve(process.cwd(), outDir);
      const today = new Date().toISOString().slice(0, 10);
      writeFileSync(resolve(root, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${url}/sitemap.xml\n`);
      writeFileSync(
        resolve(root, 'sitemap.xml'),
        `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url>\n    <loc>${url}/</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>1.0</priority>\n  </url>\n</urlset>\n`,
      );
    },
  };
}

export default defineConfig({
  plugins: [react(), seoFiles()],
  build: {
    target: 'es2020',
    sourcemap: false,
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        // three only loads for the intro, so it must not ride along in the main bundle
        manualChunks: (id) => {
          if (id.includes('node_modules/three')) return 'three';
          if (id.includes('node_modules/gsap')) return 'gsap';
          if (id.includes('node_modules/react')) return 'react';
          return undefined;
        },
      },
    },
  },
  server: { host: true, port: 5173 },
});
