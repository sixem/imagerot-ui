import { defineConfig } from 'vite';
import path from 'path';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import pkg from './package.json' with { type: 'json' };

// https://vite.dev/config/
export default defineConfig({
    plugins: [react(), tsconfigPaths()],
    base: './',
    server: {
        watch: {
            usePolling: true,
        }
    },
    resolve: {
        alias: { '@': path.resolve(__dirname, 'src') }
    },
    define: {
        __APP_VERSION__: JSON.stringify(pkg.version),
        __APP_HOMEPAGE__: JSON.stringify(pkg.homepage)
    },
});
