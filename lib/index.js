'use strict'

const mongodb = require('mongodb')
const MongoClient = mongodb.MongoClient

const helpers = require('./helpers')
const inputRecord = helpers.inputRecord
const outputRecord = helpers.outputRecord
const mapValues = helpers.mapValues
const idKey = helpers.idKey
const generateId = helpers.generateId
const generateQuery = helpers.generateQuery

const adapterOptions = new Set([ 'url', 'generateId', 'typeMap' ])

/**
 * MongoDB adapter.
 */
module.exports = Adapter => class MongodbAdapter extends Adapter {
  connect () {
    const Promise = this.Promise
    const options = this.options

    return new Promise((resolve, reject) => {
      if (!('url' in options))
        return reject(new Error('Connection URL is required in options.'))

      if (!('generateId' in options)) options.generateId = generateId
      if (!('typeMap' in options)) options.typeMap = {}

      const parameters = {}

      for (const key in options)
        if (!adapterOptions.has(key)) parameters[key] = options[key]

      return MongoClient.connect(options.url, parameters, (error, client) => {
        if (error) return reject(error)
        this.client = client
        this.db = client.db()
        return resolve()
      })
    })
  }


  disconnect () {
    delete this.db
    return this.client.close()
  }


  find (type, ids, options) {
    // Handle no-op.
    if (ids && !ids.length) return super.find()

    if (options == null) options = {}

    const Promise = this.Promise
    const fields = this.recordTypes[type]
    const typeMap = this.options.typeMap
    const collection = type in typeMap ? typeMap[type] : type
    let query = generateQuery(fields, options)

    if ('query' in options) {
      const result = options.query(query)
      if (result != null) query = result
    }

    if (ids && ids.length) query[idKey] = { $in: ids }

    // Parallelize the find method with count method.
    return Promise.all([
      new Promise((resolve, reject) => {
        let queryOptions

        if ('fields' in options)
          queryOptions = {
            projection: mapValues(options.fields, value => value ? 1 : 0)
          }

        const dbCollection = this.db.collection(collection)
        const find = dbCollection.find.call(dbCollection, query, queryOptions)

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
    ]).then(results => {
      // Set the count on the records array.
      results[0].count = results[1]
      return results[0]
    })
  }


  create (type, records) {
    if (!records.length) return super.create()

    const Promise = this.Promise
    const ConflictError = this.errors.ConflictError
    const typeMap = this.options.typeMap
    const collection = type in typeMap ? typeMap[type] : type

    return new Promise((resolve, reject) =>
      this.db.collection(collection).insertMany(
        records.map(inputRecord.bind(this, type)),
        (error, result) => error ?
          // Cryptic error code for unique constraint violation.
          reject(error.code === 11000 ?
            new ConflictError('Duplicate key.') : error) :
          resolve(result.ops.map(outputRecord.bind(this, type)))
      ))
  }


  update (type, updates) {
    const Promise = this.Promise
    const typeMap = this.options.typeMap
    const primaryKey = this.keys.primary
    const collection = type in typeMap ? typeMap[type] : type

    return Promise.all(updates.map(update =>
      new Promise((resolve, reject) => {
        const modifiers = {}

        if ('replace' in update && Object.keys(update.replace).length)
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
        if (!Object.keys(modifiers).length) {
          resolve(0)
          return
        }

        this.db.collection(collection).updateOne({
          [idKey]: update[primaryKey]
        }, modifiers, (error, result) =>
          error ? reject(error) : resolve(result.result.n))
      })
    )).then(numbers => numbers.reduce((accumulator, number) =>
      accumulator + number, 0))
  }


  delete (type, ids) {
    if (ids && !ids.length) return super.delete()

    const Promise = this.Promise
    const typeMap = this.options.typeMap
    const collection = type in typeMap ? typeMap[type] : type

    return new Promise((resolve, reject) =>
      this.db.collection(collection).deleteMany(ids && ids.length ?
        { [idKey]: { $in: ids } } : {},
      (error, result) => error ? reject(error) : resolve(result.result.n)))
  }
}
