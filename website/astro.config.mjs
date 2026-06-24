import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  site: 'https://3iiik.github.io',
  base: '/Forca/',
  outDir: './dist',
  publicDir: './public',
  integrations: [
    sitemap(),
    react(),
    tailwind({
      applyBaseStyles: false,
    }),
  ],
  build: {
    assets: '_assets',
  },
});
