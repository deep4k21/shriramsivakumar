import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { compression } from 'vite-plugin-compression2'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    /*
     * Pre-compressed copies of every text asset, written next to the original
     * at build time as `.gz` and `.br`.
     *
     * Pre-compressing rather than leaving it to the host: compressing a 3MB
     * SVG well is slow, so a server doing it per-request either spends that
     * time on every cache miss or falls back to a fast, weak setting. Done
     * once here, the host only has to pick the right file.
     *
     * Both formats, because brotli is smaller but not universal — a host
     * serves `.br` where the request's `Accept-Encoding` allows and `.gz`
     * otherwise, and the plain file to anything that asks for neither.
     *
     * SVG is the target: it is 20MB of this site's first load and its path
     * data compresses ~3.75x. PNG/JPG/woff2 are already compressed internally
     * and gain nothing, so they are left out rather than burning build time
     * for a rounding error.
     */
    compression({
      algorithms: ['gzip', 'brotliCompress'],
      include: [/\.(js|mjs|json|css|html|svg)$/i],
      threshold: 1024,
    }),
  ],
})
