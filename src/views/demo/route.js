const Layout = () => import('@/layout/index.vue')

export default {
  name: 'Demo',
  path: '/',
  component: Layout,
  redirect: '/chart',
  meta: {
    title: 'commit message check',
    icon: 'uil:pagelines',
    role: ['admin',"editor"],
    requireAuth: true,
    order: 3,
  },
  children: [
    {
      name: 'Crud',
      path: 'crud',
      component: () => import('./table/index.vue'),
      meta: {
        title: 'commit message list',
        icon: 'ic:baseline-table-view',
        role: ['admin'],
        requireAuth: true,
        keepAlive: true,
      },
    },
    {
      name: 'Chart',
      path: 'chart',
      component: () => import('./vchart/index.vue'),
      meta: {
        title: 'chat',
        icon: 'ri:markdown-line',
        role: ['admin',"editor"],
        requireAuth: true,
        keepAlive: true,
      },
    },
    // {
    //   name: 'RichTextEditor',
    //   path: 'rich-text',
    //   component: () => import('./editor/rich-text.vue'),
    //   meta: {
    //     title: '富文本编辑器',
    //     icon: 'ic:sharp-text-rotation-none',
    //     role: ['admin'],
    //     requireAuth: true,
    //     keepAlive: true,
    //   },
    // },
    // {
    //   name: 'Upload',
    //   path: 'upload',
    //   component: () => import('./upload/index.vue'),
    //   meta: {
    //     title: '图片上传',
    //     icon: 'mdi:upload',
    //     role: ['admin'],
    //     requireAuth: true,
    //     keepAlive: true,
    //   },
    // },
  ],
}
