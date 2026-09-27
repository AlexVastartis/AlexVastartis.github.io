import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// One codebase, two sites. `--mode basketball` builds BlueBloodBasketball: its own public
// folder (data, logos, CNAME) and output folder; everything under src/ is shared and reads
// the sport from import.meta.env.VITE_SPORT (src/config/site.ts).
export default defineConfig(({ mode, command }) => {
  const bb = mode === 'basketball';
  const site = bb
    ? {
        VITE_SPORT: 'basketball',
        VITE_SITE_TITLE: 'BlueBloodBasketball.com',
        VITE_SITE_DESCRIPTION: 'A data-driven Blue Blood Rating for every Division I college basketball program, plus five criteria charts.',
      }
    : {
        VITE_SPORT: 'football',
        VITE_SITE_TITLE: 'BlueBloodFootball.com',
        VITE_SITE_DESCRIPTION: 'A data-driven Blue Blood Rating for every FBS college football program, plus five criteria charts.',
      };
  return {
    plugins: [
      react(),
      // index.html's %VITE_SITE_TITLE% / %VITE_SITE_DESCRIPTION%
      {
        name: 'site-meta',
        transformIndexHtml: (html: string) =>
          html.replace(/%(VITE_SITE_\w+)%/g, (m: string, k: string) => site[k as keyof typeof site] ?? m),
      },
    ],
    // the app reads the sport from import.meta.env.VITE_SPORT
    define: { 'import.meta.env.VITE_SPORT': JSON.stringify(site.VITE_SPORT) },
    publicDir: bb ? 'sites/basketball/public' : 'public',
    // BlueBloodBasketball ships inside the football site's Pages deploy, under /basketball/
    // (CI copies dist-basketball/ to dist/basketball/) — so its production build is based
    // there. The dev server stays at the root (http://localhost:5175/).
    base: bb && command === 'build' ? '/basketball/' : '/',
    build: { outDir: bb ? 'dist-basketball' : 'dist' },
    server: { port: bb ? 5175 : 5174, strictPort: false },
  };
});
