import axios from 'axios'
import { resReject, resResolve, reqReject, reqResolve } from './interceptors'

export function createAxios(options = {}) {
  // 设置默认请求头
  axios.defaults.headers.common['Access-Control-Expose-Headers'] = 'x-total-pages,x-per-page,x-page,x-total,x-next-page,x-prev-page'

  const defaultOptions = {
    timeout: 12000,
  }
  const service = axios.create({
    ...defaultOptions,
    ...options,
  })
  service.interceptors.request.use(reqResolve, reqReject)
  service.interceptors.response.use(resResolve, resReject)
  return service
}

export const request = createAxios({
  baseURL: "",
})
