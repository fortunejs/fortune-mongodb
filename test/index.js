/* eslint-disable no-var */
var testAdapter = require('fortune/test/adapter')
var adapter = require('../dist')

testAdapter(adapter, {
  url: 'mongodb://localhost:27017/test'
})
