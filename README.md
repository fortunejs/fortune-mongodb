# Fortune MongoDB Adapter

[![Build Status](https://img.shields.io/travis/fortunejs/fortune-mongodb/master.svg?style=flat-square)](https://travis-ci.org/fortunejs/fortune-mongodb)
[![npm Version](https://img.shields.io/npm/v/fortune-mongodb.svg?style=flat-square)](https://www.npmjs.com/package/fortune-mongodb)
[![License](https://img.shields.io/npm/l/fortune-mongodb.svg?style=flat-square)](https://raw.githubusercontent.com/fortunejs/fortune-mongodb/master/LICENSE)

This is a MongoDB adapter for [Fortune](http://fortunejs.com). It uses the [official Node.js MongoDB driver](http://mongodb.github.io/node-mongodb-native/2.0/) internally.


## Usage

Install the `fortune-mongodb` package from `npm`:

```
$ npm install fortune-mongodb
```

Then use it with Fortune:

```js
import Fortune from 'fortune'
import MongodbAdapter from 'fortune-mongodb'

const fortune = new Fortune({
  adapter: {
    type: MongodbAdapter,
    options: {
      url: 'mongodb://localhost:27017/test'
    }
  }
})
```


## Options

**Adapter options**:

- `url`: MongoDB connection URL. Required.
- `generateId`: Generate the `_id` key on a new document. It must be a function that accepts one argument, the record type, and returns a unique string or number. Optional.
- `typeMapping`: An object that maps type names (keys) to MongoDB collection names (values). For example, `{ user: 'users' }`.

**Driver options** (see the [official documentation](http://mongodb.github.io/node-mongodb-native/2.0/tutorials/connecting/) for details):

- `db`: options that affect the DB instance.
- `replSet`: options that modify the ReplicaSet topology connection behavior.
- `mongos`: options that modify the Mongos topology connection behavior.
- `server`: options that modify the Server topology connection behavior.


## License

This software is licensed under the [MIT License](//github.com/fortunejs/fortune-mongodb/blob/master/LICENSE).
