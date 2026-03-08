import tailwindcss from '@tailwindcss/vite';
import vue from '@vitejs/plugin-vue';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

const _dirname = dirname(fileURLToPath(import.meta.url));

// https://vitejs.dev/config/
export default defineConfig({
  define: {
    __VUE_OPTIONS_API__: true,
    __VUE_PROD_DEVTOOLS__: false,
    __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: false,
  },
  plugins: [
    tailwindcss(),
    vue({
      include: [/\.vue$/],
    }),
  ],
  resolve: {
    alias: {
      '@': resolve(_dirname, './src'),
      '~': resolve(_dirname, './'),
    },
  },
});
