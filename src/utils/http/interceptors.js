import { getToken } from '@/utils'
import { resolveResError } from './helpers'

export function reqResolve(config) {
  // 设置默认请求头
  config.headers = {
    'Content-Type': 'application/json;charset=UTF-8',
    version: '3.5.6-alpha.1',
    ...config.headers,
  }

  // 处理不需要token的请求
  if (config.noNeedToken) {
    return config
  }

  const token = getToken()
  if (!token) {
    return Promise.reject({ code: 401, message: '登录已过期，请重新登录！' })
  }

  /**
   * * 加上 token
   * ! 认证方案: JWT Bearer
   */
  // config.headers.Authorization = config.headers.Authorization || 'Bearer ' + token

  return config
}

export function reqReject(error) {
  return Promise.reject(error)
}

export function resResolve(response) {
  // TODO: 处理不同的 response.headers
  const { data, status, config, statusText,headers} = response
  console.log(response,111)
  if(data&&data.code===undefined){
    return Promise.resolve({
      code:0,
      data:data,
      message:'success',
      pagination:{
        total:Number(headers['x-total']),
        page:Number(headers['x-page']),
        pageSize:Number(headers['x-per-page']),
        totalPages:Number(headers['x-total-pages']),
        nextPage:Number(headers['x-next-page']),
        prevPage:Number(headers['x-prev-page']),
      }
    })
  }

  if (data?.code !== 0) {
    const code = data?.code ?? status

    /** 根据code处理对应的操作，并返回处理后的message */
    const message = resolveResError(code, data?.message ?? statusText)

    /** 需要错误提醒 */
    !config.noNeedTip && window.$message?.error(message)
    return Promise.reject({ code, message, error: data || response })
  }
  return Promise.resolve(data)
}

export function resReject(error) {
  if (!error || !error.response) {
    const code = error?.code
    /** 根据code处理对应的操作，并返回处理后的message */
    const message = resolveResError(code, error.message)
    window.$message?.error(message)
    return Promise.reject({ code, message, error })
  }
  const { data, status, config } = error.response
  const code = data?.code ?? status
  const message = resolveResError(code, data?.message ?? error.message)
  /** 需要错误提醒 */
  !config?.noNeedTip && window.$message?.error(message)
  return Promise.reject({ code, message, error: error.response?.data || error.response })
}
