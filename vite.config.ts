import { defineConfig } from 'vite'
import path from 'path'
import fs from 'fs'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import type { Plugin } from 'vite'

// Plugin to resolve figma:asset/* imports.
// If the hash file exists in src/assets/, redirect to that real file.
// Otherwise fall back to a transparent 1×1 PNG placeholder.
function figmaAssetPlugin(): Plugin {
  const FIGMA_PREFIX = 'figma:asset/'
  const ASSETS_DIR = path.resolve(__dirname, 'src/assets')
  const PLACEHOLDER =
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='

  return {
    name: 'vite-plugin-figma-asset',
    resolveId(id) {
      if (!id.startsWith(FIGMA_PREFIX)) return
      const filename = id.slice(FIGMA_PREFIX.length) // e.g. "6f8230...ac.png"
      const realPath = path.join(ASSETS_DIR, filename)
      if (fs.existsSync(realPath)) {
        // Return the real file path so Vite processes it normally
        return realPath
      }
      // File not found — mark as virtual so we can serve the placeholder
      return '\0' + id
    },
    load(id) {
      if (id.startsWith('\0' + FIGMA_PREFIX)) {
        return `export default "${PLACEHOLDER}"`
      }
    },
  }
}

export default defineConfig({
  plugins: [
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used – do not remove them
    react(),
    tailwindcss(),
    figmaAssetPlugin(),
  ],
  resolve: {
    alias: {
      // Alias @ to the src directory
      '@': path.resolve(__dirname, './src'),
    },
  },
})
