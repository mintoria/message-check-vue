import { getToken, request } from '@/utils'

export default {
  getUser: () => request.post('/api/ei-oauth/users/getCurrentUserInfo',{},{
    headers: {
      'Authorization': `Bearer ${getToken()}`
    }
  }),
  refreshToken: () => request.post('/auth/refreshToken', null, { noNeedTip: true }),
}
