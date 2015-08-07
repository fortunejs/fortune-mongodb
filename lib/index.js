import { MongoClient } from 'mongodb'
import { inputRecord, outputRecord, mapValues,
  idKey, generateId } from './helpers'


const adapterOptions = new Set([ 'url', 'generateId', 'typeMapping' ])


/**
 * MongoDB adapter.
 */
export default Adapter => class MongodbAdapter extends Adapter {

  connect () {
    const { options } = this

    return new Promise((resolve, reject) => {
      if (!('url' in options))
        return reject(new Error(`Connection URL is required in options.`))

      if (!('generateId' in options)) options.generateId = generateId
      if (!('typeMapping' in options)) options.typeMapping = {}

      const parameters = {}

      for (let key in options)
        if (!adapterOptions.has(key)) parameters[key] = options[key]

      MongoClient.connect(options.url, parameters, (error, db) => {
        if (error) return reject(error)
        this.db = db
        return resolve()
      })
    })
  }


  disconnect () {
    try {
      this.db.close()
      return Promise.resolve()
    }
    catch (error) {
      return Promise.reject(error)
    }
  }


  find (type, ids, options = {}) {
    // Handle no-op.
    if (ids && !ids.length)
      return super.find()

    const query = {}
    const { options: { typeMapping } } = this
    const collection = type in typeMapping ? typeMapping[type] : type

    try {
      if ('match' in options)
        Object.assign(query, mapValues(options.match, value =>
          Array.isArray(value) ? { $in: value } : value))

      if ('query' in options)
        Object.assign(query, options.query)

      if (ids && ids.length)
        query[idKey] = { $in: ids }
    }
    catch (error) {
      return Promise.reject(error)
    }

    // Parallelize the find method with count method.
    return Promise.all([
      new Promise((resolve, reject) => {
        const args = [ query ]

        if ('fields' in options)
          args.push(mapValues(options.fields, value => value ? 1 : 0))

        const find = this.db.collection(collection).find(...args)

        if ('sort' in options)
          find.sort(mapValues(options.sort, value => value ? 1 : -1))

        if ('offset' in options)
          find.skip(options.offset)

        if ('limit' in options)
          find.limit(options.limit)

        find.toArray((error, records) => error ? reject(error) :
          resolve(records.map(outputRecord.bind(this, type)))
        )
      }),
      new Promise((resolve, reject) =>
        this.db.collection(collection).count(query, (error, count) => error ?
          reject(error) : resolve(count)))
    ])

    .then(results => {
      // Set the count on the records array.
      results[0].count = results[1]
      return results[0]
    })
  }


  create (type, records) {
    if (!records.length) return super.create()

    const { errors, options: { typeMapping } } = this
    const collection = type in typeMapping ? typeMapping[type] : type

    return new Promise((resolve, reject) =>
      this.db.collection(collection).insert(
        records.map(inputRecord.bind(this, type)),
        (error, result) => error ?
          // Cryptic error code for unique constraint violation.
          reject(error.code === 11000 ?
            new errors.ConflictError(`Duplicate key.`) : error) :
          resolve(result.ops.map(outputRecord.bind(this, type)))
      ))
  }


  update (type, updates) {
    const { keys, options: { typeMapping } } = this
    const collection = type in typeMapping ? typeMapping[type] : type

    return Promise.all(updates.map(update =>
      new Promise((resolve, reject) => {
        const modifiers = {}

        if ('replace' in update)
          modifiers.$set = update.replace

        if ('push' in update)
          modifiers.$push = mapValues(update.push, value =>
            Array.isArray(value) ? { $each: value } : value)

        if ('pull' in update)
          modifiers.$pull = mapValues(update.pull, value =>
            Array.isArray(value) ? { $in: value } : value)

        // Custom update operators have precedence.
        Object.assign(modifiers, update.operate)

        // Short circuit no-op.
        if (!Object.keys(modifiers).length) resolve(0)

        this.db.collection(collection).update({
          [idKey]: update[keys.primary]
        }, modifiers, {}, (error, result) =>
          error ? reject(error) : resolve(result.result.n))
      })
    ))
    .then(numbers => numbers.reduce((accumulator, number) =>
      accumulator + number, 0))
  }


  delete (type, ids) {
    if (ids && !ids.length) return super.delete()

    const { options: { typeMapping } } = this
    const collection = type in typeMapping ? typeMapping[type] : type

    return new Promise((resolve, reject) =>
      this.db.collection(collection).remove(ids && ids.length ?
        { [idKey]: { $in: ids } } : {}, { multi: true },
        (error, result) => error ? reject(error) : resolve(result.result.n)))
  }

}
