import crypto from 'crypto'


export const idKey = '_id'


// Cast and assign values per field definition.
export function inputRecord (type, record) {
  const clone = {}
  const { recordTypes, keys, options: { generateId } } = this
  const fields = recordTypes[type]

  // ID business.
  const id = record[keys.primary]
  clone[idKey] = id ? id : generateId(type)

  for (let field in record) {
    if (field === keys.primary) continue
    clone[field] = record[field]
  }

  for (let field of Object.getOwnPropertyNames(fields))
    if (!(field in record))
      clone[field] = fields[field][keys.isArray] ? [] : null

  return clone
}


export function outputRecord (type, record) {
  const clone = {}
  const { recordTypes, keys } = this
  const fields = recordTypes[type]

  // There is an inconsistency when accessing a record depending on the method,
  // it may be either a native `Buffer` or BSON object wrapper. We only want
  // native buffers.
  const toBuffer = object => {
    if (Buffer.isBuffer(object)) return object
    if (object.buffer) return object.buffer
    throw new TypeError(`Could not output buffer type.`)
  }

  // ID business.
  clone[keys.primary] = record[idKey]

  // Non-native types.
  for (let field of Object.getOwnPropertyNames(fields)) {
    const value = field in record ? record[field] :
      fields[field][keys.isArray] ? [] : null

    // Expose native Buffer.
    if (fields[field][keys.type] === Buffer && value) {
      clone[field] = fields[field][keys.isArray] ?
        value.map(toBuffer) : toBuffer(value)
      continue
    }

    // Do not enumerate denormalized fields.
    if (fields[field][keys.denormalizedInverse]) {
      Object.defineProperty(clone, field, {
        configurable: true, writable: true, value
      })
      continue
    }

    if (field in record) clone[field] = record[field]
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
export function generateId () {
  return crypto.randomBytes(15).toString('base64')
}


/**
 * Immutable mapping on an object.
 *
 * @param {Object} object
 * @param {Function} map should return the first argument, which is the value
 * @return {Object}
 */
export function mapValues (object, map) {
  return Object.keys(object).reduce((clone, key) =>
    Object.assign(clone, { [key]: map(object[key], key) }), {})
}
