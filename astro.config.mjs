import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sanity from '@sanity/astro';

// https://astro.build/config
export default defineConfig({
  vite: {
    plugins: [tailwindcss()]
  },
  integrations: [
    sanity({
      projectId: 'm7m6bkzd',
      dataset: 'production',
      useCdn: true,
      apiVersion: '2024-01-01',
    }),
  ],
});