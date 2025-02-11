import { request } from '@/utils'
import { uniqueId } from 'lodash-es'
//ei-pc:4932
export default {
  login: (params) => request.post(
    '/api/ei-oauth/oauth/token',
    params,
    {
      requestType: 'form',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        os:'iphone',
        IMEI: uniqueId(),
        // IMEI: "2222",
        devicealias: "test" || '',
        statdevice: ""
      },
      noNeedToken: true
    }
  ),
}
