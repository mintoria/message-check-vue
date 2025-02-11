import fs from 'fs';

const mockDataFilePath="mock/ei-pc/3.5.0.json"

export default [
  {
    url:'/local/filterErrorPosts',
    method:'get',
    response: (data = {}) => {
      const { author, pageNo, pageSize} = data.query
      let pageData = JSON.parse(fs.readFileSync(mockDataFilePath, 'utf8'));
      let total = pageData.length;
      if(author){
        pageData= pageData.filter(
          (item) => item.committer_name.includes(author) || (!author && author !== 0)
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
        data: pageData,
        pagination: {
          total,
          pageNo,
          pageSize,
        }
      }
    },
  },
  {
    url: '/local/post/:id',
    method: 'delete',
    response: ({ query }) => {
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
    url: '/local/post/:id',
    method: 'put',
    response: ({ query, body }) => {
        let mockData = JSON.parse(fs.readFileSync(mockDataFilePath, 'utf8'));
        const index = mockData.findIndex(item=>item.id==query.id);
        if(index!==-1){
            mockData[index]=body;
        }
        else{
            mockData.push(body);
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
