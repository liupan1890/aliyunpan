import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import electron from 'vite-plugin-electron-renderer'
import pkg from '../../package.json'
import path, { resolve } from 'path'

export default defineConfig({
  mode: process.env.NODE_ENV,
  root: __dirname,

  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      WebViewTag: 'webview'
    }
  },

  plugins: [vue(),electron()],
  base: './',
  build: {
    sourcemap: false,
    emptyOutDir: false,
    outDir: '../../dist/renderer',
    assetsDir: '',
    lib: {
      entry: 'main.ts',
      formats: ['cjs'],
      fileName: () => '[name].js'
    },
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html')
      }
    },
    minify: 'terser',
    terserOptions: {
      sourceMap: false,
      compress: {
        //生产环境时移除console
        drop_console: true,
        drop_debugger: true
      }
    }
  }, 
  server: {
    host: pkg.env.VITE_DEV_SERVER_HOST,
    port: pkg.env.VITE_DEV_SERVER_PORT
  }
})
