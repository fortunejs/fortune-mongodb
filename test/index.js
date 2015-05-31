import testAdapter from 'fortune/dist/test/unit/adapter'
import adapter from '../lib'


testAdapter(adapter, {
  url: 'mongodb://localhost:27017/test'
})
