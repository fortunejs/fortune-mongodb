const testAdapter = require('fortune/test/adapter')
const adapter = require('../lib')

testAdapter(adapter, {
  url: 'mongodb://localhost:27017/test',
  generateId: () => Math.floor(Math.random() * Math.pow(2, 32)).toString(16)
})
