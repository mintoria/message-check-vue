export const OUTPUT_DIR = 'dist'

export const PROXY_CONFIG = {
  /**
   * @desc    替换匹配值
   * @请求路径  http://localhost:3100/api/user
   * @转发路径  http://localhost:8080/user
   */
  '/local': {
    target: 'http://localhost:8080',
    changeOrigin: true,
    rewrite: (path) => path.replace(new RegExp('^/local'), ''),
  },
  /**
* @desc    不替换匹配值
* @请求路径  http://localhost:3100/api/v2/user
* @转发路径  http://localhost:8080/api/v2/user
*/
  '/api1': {
    target: 'https://git.baijia.com/api',
    changeOrigin: true,
    rewrite: (path) => path.replace(/^\/api1/, ''),
    secure: false,
    ws: true
  },
  /**
* @desc    不替换匹配值
* @请求路径  http://localhost:3100/api/v2/user
* @转发路径  http://localhost:8080/api/v2/user
*/
  '/api': {
    target: 'https://ei.baijia.com',
    changeOrigin: true,
    rewrite: (path) => path.replace(/^\/api/, ''),
    secure: false,
    ws: true
  },
  /**
   * @desc    不替换匹配值
   * @请求路径  http://localhost:3100/api/v2/user
   * @转发路径  http://localhost:8080/api/v2/user
   */
  '/api/v2': {
    target: 'http://localhost:8080',
    changeOrigin: true,
  },
  /**
   * @desc    替换部分匹配值
   * @请求路径  http://localhost:3100/api/v3/user
   * @转发路径  http://localhost:8080/user
   */
  '/api/v3': {
    target: 'http://localhost:8080',
    changeOrigin: true,
    rewrite: (path) => path.replace(new RegExp('^/api'), ''),
  },
}
