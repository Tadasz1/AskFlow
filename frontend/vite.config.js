/**
 * Vite config: React plugin for JSX and fast refresh. Used for dev server and production build.
 */
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})
