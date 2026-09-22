import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  /*
   * Fintel Secure backend runs on port 5001.
   *
   * Keep this explicit so the frontend does not accidentally
   * proxy /api requests to port 5000.
   */
  const backendUrl =
    env.VITE_API_PROXY_TARGET ||
    'http://127.0.0.1:5001';

  return {
    plugins: [react()],

    server: {
      host: '127.0.0.1',
      port: 5174,
      strictPort: true,

      proxy: {
        '/api': {
          target: backendUrl,
          changeOrigin: true,
          secure: false,
          timeout: 30000,
          proxyTimeout: 30000,
        },
      },
    },

    build: {
      target: 'es2020',
    },
  };
});