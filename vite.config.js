import { defineConfig, loadEnv } from 'vite'

import { convertEnv, getSrcPath, getRootPath } from './build/utils'
import { createVitePlugins } from './build/plugin'
import { OUTPUT_DIR, PROXY_CONFIG } from './build/constant'

export default defineConfig(({ command, mode }) => {
  const srcPath = getSrcPath()
  const rootPath = getRootPath()
  const isBuild = command === 'build'

  const env = loadEnv(mode, process.cwd())
  const viteEnv = convertEnv(env)
  const { VITE_PORT, VITE_PUBLIC_PATH, VITE_USE_PROXY, VITE_BASE_API } = viteEnv

  return {
    base: VITE_PUBLIC_PATH || '/',
    resolve: {
      alias: {
        '~': rootPath,
        '@': srcPath,
      },
    },
    plugins: createVitePlugins(viteEnv, isBuild),
    server: {
      host: '0.0.0.0',
      port: VITE_PORT,
      open: false,
      proxy: VITE_USE_PROXY
        ? {
            '/api': PROXY_CONFIG['/api'],
            '/api1': PROXY_CONFIG['/api1'],
            '/local': PROXY_CONFIG['/local'],
          }
        : {
          '/local': PROXY_CONFIG['/local'],
          '/api1': {
            target: 'https://git.baijia.com/api',
            changeOrigin: true,
            rewrite: (path) => path.replace(/^\/api1/, ''),
            secure: false,
            ws: true
          },
          '/api': {
            target: 'https://ei.baijia.com',
            changeOrigin: true,
            rewrite: (path) => path.replace(/^\/api/, ''),
            secure: false,
            ws: true
          },
        },
      watch: {
        ignored: ['**/mock/ei-pc/**/*.json']
      }
    },
    build: {
      target: 'es2015',
      outDir: OUTPUT_DIR || 'dist',
      reportCompressedSize: false, // 启用/禁用 gzip 压缩大小报告
      chunkSizeWarningLimit: 1024, // chunk 大小警告的限制（单位kb）
    },
  }
})
