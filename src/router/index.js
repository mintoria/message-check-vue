import { createRouter, createWebHistory, createWebHashHistory } from 'vue-router'
import { setupRouterGuard } from './guard'
import { basicRoutes, EMPTY_ROUTE, NOT_FOUND_ROUTE } from './routes'
import { getToken, isNullOrWhitespace } from '@/utils'
import { useUserStore, usePermissionStore } from '@/store'

const isHash = import.meta.env.VITE_USE_HASH === 'true'
export const router = createRouter({
  history: isHash ? createWebHashHistory('/') : createWebHistory('/'),
  routes: basicRoutes,
  scrollBehavior: () => ({ left: 0, top: 0 }),
})

export async function setupRouter(app) {
  await addDynamicRoutes()
  setupRouterGuard(router)
  app.use(router)
}

export async function resetRouter() {
  const basicRouteNames = getRouteNames(basicRoutes)
  router.getRoutes().forEach((route) => {
    const name = route.name
    if (!basicRouteNames.includes(name)) {
      router.removeRoute(name)
    }
  })
}

export async function addDynamicRoutes() {
  // return Promise.reject('123')
  const token = getToken()

  // 没有token情况
  if (isNullOrWhitespace(token)) {
    router.addRoute(EMPTY_ROUTE)
    return
  }

  // 有token的情况
  const userStore = useUserStore()
  try {
    const permissionStore = usePermissionStore()
    !userStore.userId && (await userStore.getUserInfo())
    const accessRoutes = permissionStore.generateRoutes(userStore.role)
    accessRoutes.forEach((route) => {
      !router.hasRoute(route.name) && router.addRoute(route)
    })
    router.hasRoute(EMPTY_ROUTE.name) && router.removeRoute(EMPTY_ROUTE.name)
    router.addRoute(NOT_FOUND_ROUTE)

    window.$notification?.success({
      title: '🎉🎉🎉 2.0 全栈版本开放体验了！',
      content: () =>
        h(
          'span',
          {},
          '2.0为全栈版本，提供前端+后端，全新重构，全面简化，',
          h(
            'a',
            { href: 'https://admin.isme.top', target: '__blank' },
            '👉https://admin.isme.top。'
          ),
          h('p', {}, '体验账号: admin / 123456'),
          h(
            'p',
            {},
            '目前火速完善文档中，即将开源，点亮 `star` 和 `watch` 或者加群可获取最新开源通知！'
          )
        ),
    })
  } catch (error) {
    console.error(error)
    $message.error('初始化用户信息失败: ' + error)
    userStore.logout()
  }
}

export function getRouteNames(routes) {
  return routes.map((route) => getRouteName(route)).flat(1)
}

function getRouteName(route) {
  const names = [route.name]
  if (route.children && route.children.length) {
    names.push(...route.children.map((item) => getRouteName(item)).flat(1))
  }
  return names
}
