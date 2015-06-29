# Changelog


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
