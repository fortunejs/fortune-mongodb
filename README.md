# Fortune MongoDB Adapter

[![Build Status](https://img.shields.io/travis/fortunejs/fortune/master.svg?style=flat-square)](https://travis-ci.org/daliwali/fortune-mongodb)
[![npm Version](https://img.shields.io/npm/v/fortune.svg?style=flat-square)](https://www.npmjs.com/package/fortune-mongodb)
[![License](https://img.shields.io/npm/l/fortune.svg?style=flat-square)](https://raw.githubusercontent.com/daliwali/fortune-mongodb/master/LICENSE)

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


Options:

See the [official documentation](http://mongodb.github.io/node-mongodb-native/2.0/tutorials/connecting/) for detailed options.

- `url`: MongoDB connection URL. **Required.**
- `db`: options that affect the DB instance.
- `replSet`: options that modify the ReplicaSet topology connection behavior.
- `mongos`: options that modify the Mongos topology connection behavior.
- `server`: options that modify the Server topology connection behavior.


### License

This software is licensed under the [MIT License](//github.com/daliwali/fortune-mongodb/blob/master/LICENSE).
