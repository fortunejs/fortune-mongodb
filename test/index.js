require('../../fortune/dist/test/unit/adapter')(
  require('../dist'), {
    url: 'mongodb://localhost:27017/test'
  })
