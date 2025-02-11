import { getToken, request } from '@/utils'

export default {
  getPosts: (params = {}) => request.get(`https://git.baijia.com/api/v4/projects/4932/repository/commits?per_page=${params.pageSize || 10}&page=${params.page || 1}${params.branch ? `&ref_name=${params.branch}` : ''}${params.title ? `&author=${params.title}` : ''}`, { },{
    headers: {
      'Cookie': `experimentation_subject_id=${getToken()}`
    },
    noNeedToken: true
  }),
  getBranches: (params = {}) => request.get(`https://git.baijia.com/api/v4/projects/4932/repository/branches?search=${params.search||'master'}`, { },{
    headers: {
      'Cookie': `experimentation_subject_id=${getToken()}`
    },
    noNeedToken: true
  }),
  getPostById: (id) => request.get(`/local/post/${id}`),
  updatePost: (data) => request.put(`/local/post/${data.id}`, data),
  deletePost: (data) => request.delete(`/local/post/${data.id}`),
  getFilterErrorPosts: (params = {}) => request.get('/local/filterErrorPosts', { params }),
}
