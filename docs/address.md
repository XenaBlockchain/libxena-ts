# Nexa Address

Represents a Nexa address. Addresses are the most popular way to make Nexa transactions. See [the official Nexa Spec](https://spec.nexa.org/addresses/address-types/) for technical background information, and a break down of all the addresses the Nexa network supports.

## Instantiate an Address

To be able to receive nexa or token an address is needed, but in order to spend them a private key is necessary. Please take a look at the [`PrivateKey`](privatekey.md) docs for more information about exporting and saving a key.

```ts
let privateKey = new PrivateKey();
let address = Address.fromPublicKey(privateKey.publicKey);
>>`Address {
  data: <Buffer 17 00 51 14 78 ff c3 f7 ff de 35 a7 cd a6 ab 1a 1a e5 5c a4 9e 1c f7 de>,
  network: Network {
    name: 'mainnet',
    alias: 'livenet',
    prefix: 'nexa',
    pubkeyhash: 25,
    privatekey: 35,
    scripthash: 68,
    xpubkey: 1114203936,
    xprivkey: 1114401651,
    networkMagic: <Buffer 72 27 12 21>,
    port: 7228,
    dnsSeeds: [
      'seed.nextchain.cash',
      'seeder.nexa.org',
      'nexa-seeder.bitcoinunlimited.info'
    ]
  },
  type: 'P2ST',
}`

address.toString()
>>`nexa:nqtsq5g50rlu8allmc660ndx4vdp4e2u5j0pea77spgsd8y3`
```

You can also instantiate an Address from a String, [PublicKey](publickey.md), or [HDPublicKey](hdkeys.md), in case you are not the owner of the private key.

```ts
// from a P2PKH String
let address = Address.fromString('nexa:qryh034vs398uz94s9ek2df55dl52n7kxufz430csv');

// from a P2PKT String
let address = Address.fromString('nexa:nqtsq5g5e7ek35u5394qlexunlswt03u9ncnraydnlrsn0hr');

// Create a private key and get the public key from that private key
let privateKey = new PrivateKey();
let publicKey = privateKey.publicKey;

// Create a P2PKH address from a public key
let address = Address.fromPublicKey(publicKey, undefined, AddressType.PayToPublicKeyHash);
// default network is mainnet

address.toString()
>>`nexa:qpj354de53f86z26yyl969dxlzpts7x655u47e6e5a`

// Create a P2ST address from a public key
let address = Address.fromPublicKey(publicKey, 'mainnet', AddressType.PayToScriptTemplate);
// AddressType.PayToScriptTemplate is the default type

address.toString()
>>`nexa:nqtsq5g5m7c8a2pdrszrze5f9pqdqwfckf483nmt45hkzyyh`

// Create a P2ST address from a public key on testnet
let address = Address.fromPublicKey(publicKey, 'testnet');

address.toString()
>>`nexatest:nqtsq5g5m7c8a2pdrszrze5f9pqdqwfckf483nmt6g8cektp`
```

A not well-known pay-to-script-template Address can be instantiated with the template data.

See the official [Script Templates Spec](https://spec.nexa.org/addresses/scriptTemplates/) for technical background information.

```ts
// HODL Vault example
import { Address, BNExtended, Hash, Opcode, PrivateKey, Script, ScriptOpcode } from 'libnexa-ts';

let publicKey = new PrivateKey().publicKey;

let templateScript = Script.empty()
        .add(Opcode.OP_FROMALTSTACK).add(Opcode.OP_DROP)
        .add(Opcode.OP_FROMALTSTACK).add(Opcode.OP_CHECKLOCKTIMEVERIFY).add(Opcode.OP_DROP)
        .add(Opcode.OP_FROMALTSTACK).add(Opcode.OP_CHECKSIGVERIFY);
let tHash = Hash.sha256ripemd160(templateScript.toBuffer());

let constraintScript = Script.empty().add(publicKey.toBuffer());
let cHash = Hash.sha256ripemd160(constraintScript.toBuffer());

const generateVisibleArgs = (args: number[]): ScriptElement[] => {
  return args.map(arg => arg <= 16 ? ScriptOpcode.smallInt(arg) : BNExtended.fromNumber(arg).toScriptNumBuffer());
}

let address = Address.fromScriptTemplate(tHash, cHash, generateVisibleArgs([1, 123456]));

address.toString()
>>`nexa:nqcqq9zxrtf9pqwtqyvaqdpctlc4fjxn444a6as58lh0sa03vra2qh7wakt8sx8yl976f5t92yp5pcsp8cugxzfg`
```

## Validating an Address

The main use that we expect you'll have for the `Address` class in Libnexa-ts is validating that an address is a valid one, what type of address it is (you may be interested on knowing if the address is a simple "pay to public key hash" address or a "pay to script template" address) and what network does the address belong to.

The code to do these validations looks like this:

```ts
// validate an address
if (Address.isValid(input)) {
  ...
}

// validate that an input field is a valid testnet address
if (Address.isValid(input, Networks.testnet)) {
  ...
}

// validate that an input field is a valid mainnet p2pkh
if (Address.isValid(input, Networks.mainnet, Address.PayToPublicKeyHash)) {
  ...
}

// validate that an input field is a valid mainnet p2st/p2pkt
if (Address.isValid(input, Networks.mainnet, Address.PayToScriptTemplate)) {
  ...
}

// validate that an input field is a valid mainnet group token address
if (Address.isValid(input, Networks.mainnet, Address.GroupIdAddress)) {
  ...
}

// get the specific validation error that can occurred
let error = Address.getValidationError(input, Networks.testnet);
if (error) {
  // handle the error
}
```

## API Reference
- [Address](api/classes/Address.md)