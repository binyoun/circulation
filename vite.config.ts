import { defineConfig } from 'vite';

export default defineConfig({
  base: '/', // served at https://circulatorysensing.com (custom domain on GitHub Pages)
  build: {
    rollupOptions: {
      input: {
        main: './index.html',
        sim: './sim.html',
        log: './log.html',
        manual: './manual.html',
        design: './design.html',
        toolkit: './toolkit.html',
      },
    },
  },
});
