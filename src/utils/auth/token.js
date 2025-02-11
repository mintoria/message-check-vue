import { lStorage } from '@/utils'
import api from '@/api'

const TOKEN_CODE = 'access_token'
const DURATION = 6 * 60 * 60

export function getToken() {
  // 优先从localStorage获取
  const localToken = lStorage.get(TOKEN_CODE)
  if (localToken) return localToken

  // 从cookie中获取
  const cookies = document.cookie.split(';')
  const tokenCookie = cookies.find(cookie => cookie.trim().startsWith(`${TOKEN_CODE}=`))
  return tokenCookie ? tokenCookie.split('=')[1].trim() : null
}

export function setToken(token) {
  // 存储到localStorage
  lStorage.set(TOKEN_CODE, token, DURATION)
  // 同时存储到cookie，使用相同的过期时间（小时）
  setCookie(TOKEN_CODE, token, DURATION/3600)
}

export function removeToken() {
  // 从localStorage移除
  lStorage.remove(TOKEN_CODE)
  // 通过设置过期时间为过去时间来删除cookie
  setCookie(TOKEN_CODE, '', -1)
}

export async function refreshAccessToken() {
  const tokenItem = lStorage.getItem(TOKEN_CODE)
  if (!tokenItem) {
    return
  }
  const { time } = tokenItem
  // token生成或者刷新后30分钟内不执行刷新
  if (Date.now() - time <= 1000 * 60 * 30) return
  try {
    const res = await api.refreshToken()
    setToken(res.data.token) // 这里会同时更新localStorage和cookie
  } catch (error) {
    console.error(error)
  }
}

function setCookie(name, value, hours=24, options = {}) {
  const expires = new Date(Date.now() + hours * 60 * 60 * 1000).toUTCString()
  let cookie = `${name}=${value}; expires=${expires}; path=/`
  if (options.domain) cookie += `; domain=${options.domain}`
  if (options.secure) cookie += '; secure'
  if (options.sameSite) cookie += `; samesite=${options.sameSite}`
  // document.cookie = cookie
}
