import { defineConfig } from 'vite';
import path from 'path';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

// https://vite.dev/config/
export default defineConfig({
    plugins: [react(), tsconfigPaths()],
    server: {
        watch: {
            usePolling: true,
        }
    },
    resolve: {
        alias: { '@': path.resolve(__dirname, 'src') }
    }
});
