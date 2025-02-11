import { resolveToken } from '../utils'

const token = {
  zmx: 'admin',
  editor: 'editor',
}

export default [
  // {
  //   url: '/api/auth/login',
  //   method: 'post',
  //   response: ({ body }) => {
  //     if (['zmx', 'editor'].includes(body?.name)) {
  //       return {
  //         code: 0,
  //         data: {
  //           token: token[body.name],
  //         },
  //       }
  //     } else {
  //       return {
  //         code: -1,
  //         message: '没有此用户',
  //       }
  //     }
  //   },
  // },
  // {
  //   url: '/api/auth/refreshToken',
  //   method: 'post',
  //   response: ({ headers }) => {
  //     return {
  //       code: 0,
  //       data: {
  //         token: resolveToken(headers?.authorization),
  //       },
  //     }
  //   },
  // },
]
