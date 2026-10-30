import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://edu.promptworks.eu',
  output: 'static',
  trailingSlash: 'always',
  // Emit even the small test script as a file to verify asset loading on Pages.
  vite: {
    build: {
      assetsInlineLimit: 0,
    },
  },
});
