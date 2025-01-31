# HD Keys

Create and derive extended public and private keys according to the BIP32 standard for Hierarchical Deterministic (HD) keys.

## Hierarchically Derived Keys

libnexa-ts provides full support for [BIP32](https://github.com/bitcoin/bips/blob/master/bip-0032.mediawiki), allowing for many key management schemas that benefit from this property. Please be sure to read and understand the basic concepts and the warnings on that BIP before using these classes.

## HDPrivateKey

An instance of a [PrivateKey](privatekey.md) that also contains information required to derive child keys.

Sample usage:

```ts
import { HDPrivateKey } from 'libnexa-ts';

let hdPrivateKey = new HDPrivateKey();
let retrieved = new HDPrivateKey('xpriv...');
let derived = hdPrivateKey.deriveChild("m/0'");
let derivedByNumber = hdPrivateKey.deriveChild(1).deriveChild(2, true);
let derivedByArgument = hdPrivateKey.deriveChild("m/1/2'");
assert(derivedByNumber.xprivkey === derivedByArgument.xprivkey);

let address = Address.fromPublicKey(derivedByNumber.publicKey);

// obtain HDPublicKey
let hdPublicKey = derivedByNumber.hdPublicKey;

let address2 = hdPublicKey.toAddress();

assert(address.toString() === address2.toString()); // true
```

## HDPublicKey

An instance of a [PublicKey](publickey.md) that can be derived to build extended public keys. Note that hardened paths are not available when deriving an HDPublicKey.

```ts
let hdPrivateKey = new HDPrivateKey();
let hdPublicKey = hdPrivateKey.hdPublicKey;
try {
  new HDPublicKey();
} catch(e) {
  console.log("Can't generate a public key without an hd private key");
}

let address = Address.fromPublicKey(hdPublicKey.publicKey);
let derivedAddress = Address.fromPublicKey(hdPublicKey.deriveChild(100).publicKey);

// same as 

let address = hdPublicKey.toAddress();
let derivedAddress = hdPublicKey.deriveChild(100).toAddress();
```

## API Reference
- [HDPrivateKey](api/classes/HDPrivateKey.md)
- [HDPublicKey](api/classes/HDPublicKey.md)
