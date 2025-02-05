# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).


## [v1.0.4](https://gitlab.com/nexa/libnexa-ts/-/compare/v1.0.3...v1.0.4) (2025-02-05)

### Added

* New method in `GroupToken` to retrieve the parent group from subgroup.
* Support hex format for arguments in methods that accept a group ID in `GroupToken`.

### Fixed

* Fix export of private/public key methods when calling from `HDPrivateKey` instance.

### Deprecated

* `fill`, `copy` and `emptyBuffer` methods in `BufferUtils` are now deprecated.


## [v1.0.3](https://gitlab.com/nexa/libnexa-ts/-/compare/v1.0.2...v1.0.3) (2025-01-31)

### Added

* New utility methods in `Script` class to identify token description scripts and parse the OP_RETURN identifier.
* `PrivateKey` and `HDPublicKey` can generate address directly using `toAddress` method.


## [v1.0.2](https://gitlab.com/nexa/libnexa-ts/-/compare/v1.0.1...v1.0.2) (2025-01-28)

### Fixed

* Fix browser target build.
