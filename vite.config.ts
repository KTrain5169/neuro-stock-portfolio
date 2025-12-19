import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { cloudflare } from '@cloudflare/vite-plugin'
import vueDevtools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), vueDevtools(), cloudflare()],
})
