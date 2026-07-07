import { defineConfig } from 'vite';

export default defineConfig({
  base: '/circulation/', // for GitHub Pages under the repo name
  build: {
    rollupOptions: {
      input: {
        main: './index.html',
        log: './log.html',
      },
    },
  },
});
