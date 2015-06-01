import crypto from 'crypto'


export const idKey = '_id'


// Assign default values per schema field.
export function inputRecord (type, record) {
  const clone = {}
  const { schemas, keys } = this
  const schema = schemas[type]

  // ID business.
  const id = record[keys.primary]

  // Generate URI-safe string from 16 bytes of randomness.
  clone[idKey] = id ? id : crypto.randomBytes(16).toString('base64')
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')

  for (let field in record)
    clone[field] = record[field]

  for (let field of Object.getOwnPropertyNames(schema))
    if (!(field in record))
      clone[field] = schema[field][keys.isArray] ? [] : null

  return clone
}


export function outputRecord (type, record) {
  const clone = {}
  const { schemas, keys } = this
  const schema = schemas[type]
  const toBuffer = object => object.buffer

  // ID business.
  clone[keys.primary] = record[idKey]

  // Non-native types.
  for (let field of Object.keys(record)) {
    if (!(field in schema)) continue

    const value = record[field]
    const fieldType = schema[field][keys.type]
    const fieldIsArray = schema[field][keys.isArray]
    const fieldIsDenormalized = schema[field][keys.denormalizedInverse]

    // Expose native Buffer.
    if (fieldType === Buffer && value) {
      clone[field] = fieldIsArray ? value.map(toBuffer) : value.buffer
      continue
    }

    // Do not enumerate denormalized fields.
    if (fieldIsDenormalized) {
      Object.defineProperty(clone, field, {
        configurable: true, writable: true, value
      })
      continue
    }

    clone[field] = record[field]
  }

  return clone
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
