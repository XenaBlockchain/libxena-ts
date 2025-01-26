# Public Key

Represents a Nexa public key and is needed to be able to receive Nexa, as is usually represented as a [Nexa Address](address.md). See [the official Nexa Spec ](https://spec.nexa.org/addresses/address-types/) for technical background information, and a break down of all the addresses the Nexa network supports.

A PublicKey in libnexa-ts is an immutable object and can be instantiated from a [Point](crypto.md), string, [PrivateKey](privatekey.md), Buffer or a [BN](crypto.md).

## Instantiate a Public Key

Here is how to instantiate a public key:

```ts
let privateKey = new PrivateKey();

// from a private key
let publicKey = PublicKey.fromPrivateKey(privateKey);
// OR can use the generic from method
let publicKey = PublicKey.from(privateKey);

// from a hex encoded string
let publicKey2 = PublicKey.from('031ff0fe0f7b15ffaa85ff9f4744d539139c252a49710fb053bb9f2b933173ff9a');
```

## Validating a Public Key

A public key point should be on the [secp256k1](https://en.bitcoin.it/wiki/Secp256k1) curve, instantiating a new PublicKey will validate this and will throw an error if it's invalid. To check that a public key is valid:

```ts
if (PublicKey.isValid('031ff0fe0f7b15ffaa85ff9f4744d539139c252a49710fb053bb9f2b933173ff9a')){
  // valid public key
}
```

## Compressed vs Uncompressed

It's important to note that there are two possible ways to represent a public key. The standard is _compressed_ and includes the X value and parity (as represented above in the documentation). There is also a longer version that is _uncompressed_ which includes both X and Y values. Using this encoding will generate a different bitcoin address, so be careful when selecting the encoding. Uncompressed public keys start with `0x04`; compressed public keys begin with `0x03` or `0x02` depending on whether they're greater or less than the midpoint of the curve. These prefix bytes are all used in official secp256k1 documentation.

Examples:

```ts
// compressed public key starting with 0x03 (greater than midpoint of curve)
let compressedPK = PublicKey.from('030589ee559348bd6a7325994f9c8eff12bd'+
  '5d73cc683142bd0dd1a17abc99b0dc');
console.log(compressedPK.compressed);
// Output: true

let addr = Address.fromPublicKey(compressedPK).toString();
console.log(addr);
// Output: nexa:nqtsq5g5hk6mrccenphdrz7tajsx44e5sj849tzv6jwvz7vu

// compressed public key starting with 0x02 (smaller than midpoint of curve)
let compressedPK2 = PublicKey.from('02a1633cafcc01ebfb6d78e39f687a1f'+
  '0995c62fc95f51ead10a02ee0be551b5dc');
console.log(compressedPK2.compressed);
// Output: true

let addr2 = Address.fromPublicKey(compressedPK2).toString();
console.log(addr2);
// Output: nexa:nqtsq5g5vsagpswvqchl02rvtm059je0ra4m0fzgtm8u376v

// uncompressed public key, starting with 0x04. Contains both X and Y encoded
let uncompressedKey = PublicKey.from('0479BE667EF9DCBBAC55A06295CE870B07029'+
  'BFCDB2DCE28D959F2815B16F81798483ADA7726A3C4655DA4FBFC0E1108A8FD17B448A68'+
  '554199C47D08FFB10D4B8');
console.log(uncompressedKey.compressed);
// Output: false

let addr3 = Address.fromPublicKey(uncompressedKey).toString();
console.log(addr3);
// Output: nexa:nqtsq5g5282nwsljxpcad2hu9gh39eg37ta5ay97n6q0mugy
```

## API Reference
- [PublicKey](api/classes/PublicKey.md)
