import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
    plugins: [react()],
    server: {
        proxy: {
            // During development, /cheapshark/... is forwarded to the CheapShark API.
            '/cheapshark': {
                target: 'https://www.cheapshark.com',
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/cheapshark/, '/api/1.0'),
            },
        },
    },
})