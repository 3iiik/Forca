import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://3iiik.github.io',
  base: '/forca',
  outDir: './dist',
  publicDir: './public',
  integrations: [sitemap()],
  build: {
    assets: '_assets',
  },
});
