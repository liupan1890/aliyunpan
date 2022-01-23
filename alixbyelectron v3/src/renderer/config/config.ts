import { defineConfig } from 'umi'

export default defineConfig({
  theme: {
    '@primary-color': '#637dff'
  },
  devServer: {
    port: 1666
  },
  mock: false,
  publicPath: './',
  outputPath: '../../dist/renderer',
  nodeModulesTransform: {
    type: 'none',
    exclude: []
  },
  history: { type: 'hash' },
  dva: {
    immer: { enableAllPlugins: true },
    hmr: true
  },
  routes: [
    {
      path: '/',
      component: './index'
    }
  ],
  targets: {
    chrome: 89,
    firefox: false,
    safari: false,
    edge: false,
    ios: false
  }
})
