# Fortune MongoDB Adapter

[![Build Status](https://img.shields.io/travis/fortunejs/fortune-mongodb/master.svg?style=flat-square)](https://travis-ci.org/fortunejs/fortune-mongodb)
[![npm Version](https://img.shields.io/npm/v/fortune-mongodb.svg?style=flat-square)](https://www.npmjs.com/package/fortune-mongodb)
[![License](https://img.shields.io/npm/l/fortune-mongodb.svg?style=flat-square)](https://raw.githubusercontent.com/fortunejs/fortune-mongodb/master/LICENSE)

This is a MongoDB adapter for [Fortune](http://fortune.js.org/). It uses the [official Node.js MongoDB driver](http://mongodb.github.io/node-mongodb-native/) internally.


## Usage

Install the `fortune-mongodb` package from `npm`:

```
$ npm install fortune-mongodb
```

Then use it with Fortune:

```js
const fortune = require('fortune')
const mongodbAdapter = require('fortune-mongodb')

const store = fortune({ ... }, {
  adapter: [
    mongodbAdapter,
    {
      // options object, URL is mandatory.
      url: 'mongodb://localhost:27017/test'
    }
  ]
})
```


## Options

**Adapter options**:

- `url`: MongoDB connection URL. Required.
- `generateId`: Generate the `_id` key on a new document. It must be a function that accepts one argument, the record type, and returns a unique string or number. Optional.
- `typeMap`: An object that maps type names (keys) to MongoDB collection names (values). For example, `{ user: 'users' }`.

For driver options, see the [official documentation](http://mongodb.github.io/node-mongodb-native/) for details.

In addition to the constructor options, there is also the `query` function in the `find` method, which accepts the query object as an argument, and may either mutate or return the query object. This allows for arbitrary queries.


## License

This software is licensed under the [MIT License](//github.com/fortunejs/fortune-mongodb/blob/master/LICENSE).
