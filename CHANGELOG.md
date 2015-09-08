# Changelog


##### 1.0.9 (2015-09-08)
- Fix minor bug where array of buffers are shown when fields are specified.


##### 1.0.8 (2015-08-26)
- Rename `typeMapping` to `typeMap`.


##### 1.0.7 (2015-08-23)
- Fix `null` option bug.


##### 1.0.5 (2015-08-07)
- Prevent document replacement in `update` method if no updates are applied.


##### 1.0.3 (2015-07-27)
- Fix `generateId` option, add test for regression.


##### 1.0.2 (2015-07-25)
- Added `typeMapping` option, for decoupling type name from collection name.


##### 1.0.1 (2015-07-08)
- Do not save extraneous `id` field.


##### 1.0.0 (2015-06-29)
- Fix delete no-op.
- Fix create no-op.
- Fix sort input.


##### 1.0.0-alpha.10 (2015-06-18)
- Bump dependency versions.


##### 1.0.0-alpha.9 (2015-06-08)
- Change default ID generation: 15 random bytes, base64 encoded string.
- Allow ID generation to be custom function, `generateId` option.


##### 1.0.0-alpha.8 (2015-06-03)
- Allow all connection options as specified by the MongoDB driver.
- Rename `schemas` -> `recordTypes`.


##### 1.0.0-alpha.6 (2015-06-02)
- Fix buffer output.
- Generate URI-safe base64 strings instead of hex.


##### 1.0.0-alpha.5 (2015-06-01)
- Do not enumerate denormalized fields.


##### 1.0.0-alpha.4 (2015-05-31)
- Do not rely on ObjectID for ID generation, instead generate completely random bytes.


##### 1.0.0-alpha.1 (2015-05-30)
- Initial release of rewrite.
