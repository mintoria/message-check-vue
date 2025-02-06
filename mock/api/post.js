import fs from 'fs';

const mockDataFilePath="mock/data.json"

export default [
  {
    url: '/api/posts',
    method: 'get',
    response: (data = {}) => {
      const { title, pageNo, pageSize} = data.query
      console.log(data.query,333)
      let pageData = JSON.parse(fs.readFileSync(mockDataFilePath, 'utf8'));
      let total = pageData.length;
      if(title){
        pageData= pageData.filter(
            (item) => item.message.includes(title) || (!title && title !== 0)
        )
        total = pageData.length;
    }
      if (pageData.length) {
        if(pageNo&&pageSize)
            pageData = pageData.slice((pageNo-1)*pageSize,pageSize*pageNo)
      } else {
        total = 0
      }
      return {
        code: 0,
        message: 'ok',
        data: {
          pageData,
          total,
          pageNo,
          pageSize,
        },
      }
    },
  },
  {
    url:'/api/filterErrorPosts',
    method:'get',
    response: (data = {}) => {
      const { author, pageNo, pageSize} = data.query
      let pageData = JSON.parse(fs.readFileSync(mockDataFilePath, 'utf8')).filter(item=>item.tip);
      let total = pageData.length;
      if(author){
        pageData= pageData.filter(
            (item) => item.author.includes(author) || (!author && author !== 0)
        )
        total = pageData.length;
    }
      if (pageData.length) {
        if(pageNo&&pageSize)
            pageData = pageData.slice((pageNo-1)*pageSize,pageSize*pageNo)
      } else {
        total = 0
      }
      return {
        code: 0,
        message: 'ok',
        data: {
          pageData,
          total,
          pageNo,
          pageSize,
        },
      }
    },
  },
  {
    url: '/api/post',
    method: 'post',
    response: ({ body }) => {
      return {
        code: 0,
        message: 'ok',
        data: body,
      }
    },
  },
  {
    url: '/api/post/:id',
    method: 'delete',
    response: ({ query }) => {
        const mockDataFilePath = "mock/data.json";
        let mockData = JSON.parse(fs.readFileSync(mockDataFilePath, 'utf8'));
        const index = mockData.findIndex(item => item.id == query.id);
        if (index !== -1) {
            mockData.splice(index, 1);
        }
        fs.writeFileSync(mockDataFilePath, JSON.stringify(mockData), 'utf8');
        return {
            code: 0,
            message: 'ok',
            data: {
                id: query.id,
            },
        }
    },
},
  {
    url: '/api/post/:id',
    method: 'put',
    response: ({ query, body }) => {
        console.log(111111)
        console.log(query,body)
        let mockData = JSON.parse(fs.readFileSync(mockDataFilePath, 'utf8'));
        const index = mockData.findIndex(item=>item.id==query.id);
        if(index!==-1){
            mockData[index]=body;
        }
        fs.writeFileSync(mockDataFilePath, JSON.stringify(mockData), 'utf8');
        return {
            code: 0,
            message: 'ok',
            data: {
                id: query.id,
                body,
                row:mockData[index]
            },
        }
    },
},
]
