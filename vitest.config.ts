import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';
import VueI18nPlugin from '@intlify/unplugin-vue-i18n/vite';

const _dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [vue({ include: [/\.vue$/] }), VueI18nPlugin({})],
  define: {
    __VUE_OPTIONS_API__: true,
    __VUE_PROD_DEVTOOLS__: false,
    __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: false,
  },
  test: {
    environment: 'jsdom',
    globals: true,
  },
  resolve: {
    alias: {
      '@': resolve(_dirname, './src'),
      '~': resolve(_dirname, './'),
    },
  },
});
