'use strict'

const crypto = require('crypto')

const idKey = '_id'


module.exports = {
  idKey,
  inputRecord,
  outputRecord,
  generateId,
  generateQuery,
  mapValues
}


// Cast and assign values per field definition.
function inputRecord (type, record) {
  const clone = {}
  const recordTypes = this.recordTypes
  const primaryKey = this.keys.primary
  const isArrayKey = this.keys.isArray
  const generateId = this.options.generateId
  const fields = recordTypes[type]

  // ID business.
  const id = record[primaryKey]
  clone[idKey] = id ? id : generateId(type)

  for (const field in record) {
    if (field === primaryKey) continue
    clone[field] = record[field]
  }

  for (const field of Object.getOwnPropertyNames(fields))
    if (!(field in record))
      clone[field] = fields[field][isArrayKey] ? [] : null

  return clone
}


function outputRecord (type, record) {
  const clone = {}
  const recordTypes = this.recordTypes
  const primaryKey = this.keys.primary
  const isArrayKey = this.keys.isArray
  const typeKey = this.keys.type
  const denormalizedInverseKey = this.keys.denormalizedInverse
  const fields = recordTypes[type]

  // ID business.
  clone[primaryKey] = record[idKey]

  // Non-native types.
  for (const field of Object.getOwnPropertyNames(fields)) {
    const value = field in record ? record[field] :
      fields[field][isArrayKey] ? [] : null
    const fieldType = fields[field][typeKey]

    // Expose native Buffer.
    if (fieldType &&
      (fieldType === Buffer || fieldType.prototype.constructor === Buffer)
      && field in record) {
      clone[field] = fields[field][isArrayKey] ?
        value.map(toBuffer) : value ? toBuffer(value) : null
      continue
    }

    // Do not enumerate denormalized fields.
    if (fields[field][denormalizedInverseKey]) {
      Object.defineProperty(clone, field, {
        configurable: true, writable: true, value
      })
      continue
    }

    if (field in record) clone[field] = value
  }

  return clone
}


/**
 * Generate base64 string from 15 bytes of strong randomness (this is 2 less
 * bits of entropy than UUID version 4). It is ideal for the length of the
 * input to be divisible by 3, since base64 expands the binary input by
 * exactly 1 byte for every 3 bytes, and adds padding length of modulus 3.
 *
 * @return {String}
 */
function generateId () {
  return crypto.randomBytes(15).toString('base64')
}


/**
 * Immutable mapping on an object.
 *
 * @param {Object} object
 * @param {Function} map should return the first argument, which is the value
 * @return {Object}
 */
function mapValues (object, map) {
  return Object.keys(object).reduce((clone, key) =>
    Object.assign(clone, { [key]: map(object[key], key) }), {})
}


// There is an inconsistency when accessing a record depending on the method,
// it may be either a native `Buffer` or BSON object wrapper. We only want
// native buffers.
function toBuffer (object) {
  if (Buffer.isBuffer(object)) return object
  if (object.buffer) return object.buffer
  throw new TypeError('Could not output buffer type.')
}

function generateRangeQuery (fields, options) {
  const range = {}
  Object.keys(options).forEach(key => {
    if (!(key in fields)) return

    const value = options[key]

    if (fields[key].isArray) {
      if (value[0] != null)
        range[`${key}.${value[0] - 1}`] = { $exists: true }
      if (value[1] != null)
        range[`${key}.${value[1]}`] = { $exists: false }
      return
    }

    range[key] = { $ne: null }
    if (value[0] != null) range[key].$gte = value[0]
    if (value[1] != null) range[key].$lte = value[1]
  })

  return range
}

// Wrap operator queries with the $not operator
function applyNotOperator (clause) {
  return mapValues(clause, value => {
    return { $not: value }
  })
}

// Generate a mongoDB query from a fortune query object
function generateQuery (fields, options, not) {
  let $and = []
  for (const key in options)
    switch (key) {
    case 'and':
    case 'or':
      const query = {}
      query[`$${key}`] = mapValues(options[key], value => {
        return generateQuery(fields, value)
      })
      return query
    case 'not':
      return generateQuery(fields, options[key], true)
    case 'range':
      $and.push(generateRangeQuery(fields, options.range))
      break
    case 'match':
      $and.push(mapValues(options.match, value =>
        Array.isArray(value) ? { $in: value } : value))
      break
    case 'exists':
      $and.push(mapValues(options.exists, (value, key) => {
        if (!(key in fields)) return void 0

        if (fields[key].isArray)
          return value ? { $ne: [] } : []

        return value ? { $ne: null } : null
      }))
      break
    default:
    }

  if (not)
    $and = $and.map(applyNotOperator)

  switch ($and.length) {
  case 0:
    return {}
  case 1:
    return $and[0]
  default:
    return { $and }
  }
}
