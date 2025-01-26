# Libnexa Crypto

The cryptographic primitives (Schnorr, ECDSA and HMAC) implementations in this package imported from Bitcore library that have been reviewed by the BitPay engineering team. More audits and reviews are welcomed.

## Random

The `BufferUtils.getRandomBuffer(size)` function that returns a `Buffer` instance with random bytes. It may not work depending on the engine that libnexa is running on (doesn't work with IE versions lesser than 11).

## BN

The `libnexa.crypto.BN` (or `BNExtended`) class contains a wrapper around [bn.js](https://github.com/indutny/bn.js), the bignum library used internally in libnexa.

## Point

The `Point` class contains a wrapper around the class Point of [elliptic.js](https://github.com/indutny/elliptic), the elliptic curve library used internally in libnexa.

## Hash

The `libnexa.crypto.Hash` (or `Hash`) class contains a set of hashes and utilities. These are either the native `crypto` hash functions from `node.js` or their respective browser shims as provided by your bundler pollyfil.

## Schnorr

`libnexa.crypto.Schnorr` (or `Schnorr`) class contains a pure TypeScript implementation of the Schnorr signature scheme based on [2019-MAY-15 Schnorr Signature specification](https://spec.nexa.org/forks/2019-05-15-schnorr/).

## ECDSA

`libnexa.crypto.ECDSA` (or `ECDSA`) class contains a pure TypeScript implementation of the elliptic curve DSA signature scheme based on [elliptic.js](https://github.com/indutny/elliptic).


## API Reference
- [BufferUtils](api/classes/BufferUtils.md)
- [BNExtended](api/classes/BNExtended.md)
- [Point](api/classes/Point.md)
- [Hash](api/classes/Hash.md)
- [Schnorr](api/classes/Schnorr.md)
- [ECDSA](api/classes/ECDSA.md)