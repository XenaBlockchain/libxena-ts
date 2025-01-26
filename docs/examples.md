# Libnexa-ts examples

To get started, just `npm install libnexa-ts`.

## Import libnexa-ts into your project

```ts
import libnexa from 'libnexa-ts';

// or better import only the specific modules you need, see ESM notes below
import { Address, PrivateKey, ... } from 'libnexa-ts';

// or for commonjs:
const libnexa = require('libnexa-ts');
```

## Generate a random address

### Using ES Modules (ESM)

When using this library in an ESM-based project, it is recommended to import only the specific modules you need, rather than importing the entire library. This approach is beneficial for tree-shaking, which helps reduce your application's bundle size by eliminating unused code.

```ts
// Less Optimal: Importing the entire library
import libnexa from 'libnexa-ts';

const privateKey = new libnexa.keys.PrivateKey();
const address = libnexa.Address.fromPublicKey(privateKey.publicKey);

console.log(address.toString());
// Output: `nexa:nqtsq5g5y97dr67dykjspxrnnllp39lcvpzdfre0dp3zuqey`

// OR

// Recommended: Import only required classes
import { Address, PrivateKey } from 'libnexa-ts';

const privateKey = new PrivateKey();
const address = Address.fromPublicKey(privateKey.publicKey);

console.log(address.toString());
// Output: `nexa:nqtsq5g5y97dr67dykjspxrnnllp39lcvpzdfre0dp3zuqey`
```

### Using CommonJS (CJS)
```ts
// Importing the library
const libnexa = require('libnexa-ts');

const privateKey = new libnexa.PrivateKey();
const address = libnexa.Address.fromPublicKey(privateKey.publicKey);

console.log(address.toString());
// Output: `nexa:nqtsq5g5y97dr67dykjspxrnnllp39lcvpzdfre0dp3zuqey`
```

## Generate an Address using BIP39 mnemonic seed

### First install BIP39

```sh
npm install bip39
```

### Generate seed from Mnemonic phrase and passphrase

```ts
//import Bip39 library
import * as Bip39 from 'bip39';
import { Address, HDPrivateKey } from 'libnexa-ts';

const mnemonic = Bip39.generateMnemonic()
>>`layer candy loan gauge echo close open laundry ten whisper impose place`

let seed = Bip39.mnemonicToSeedSync(mnemonic);
let masterKey = HDPrivateKey.fromSeed(seed);
let data =  masterKey.deriveChild(44, true).deriveChild(29223, true);
let account = data.deriveChild(0, false);

let address = Address.fromPublicKey(account.publicKey).toString();
>>`nexa:nqtsq5g5p8cw78kteduqsvzulqmll5pe4ezgcc74vncrlvmw`
```

## Import an address via WIF (Wallet Import Format)
The Wallet Import Format is a standardized way of representing private keys as a string of alphanumeric characters.
```ts
let wif = '6J6fqYmE6yr97naoJXEqzWuKiKKbngKm9CPxaSj9YTfRPLRGn38A';

let privkey = PrivateKey.from(wif);
let address = Address.fromPublicKey(privkey.publicKey).toString();
>>`nexa:nqtsq5g5r4av5a20rcp4zx5d5q4uhndshc49h9q3s4tcppn7`
```

## Create a Transaction

### Using Transaction Builder

```ts
let privateKey = PrivateKey.from('6J6fqYmE6yr97naoJXEqzWuKiKKbngKm9CPxaSj9YTfRPLRGn38A');
let utxo = {
  "outpoint" : "115e8f72f39fad874cfab0deed11a80f24f967a84079fb56ddf53ea02e308986",
  "address" : "nexa:nqtsq5g5r4av5a20rcp4zx5d5q4uhndshc49h9q3s4tcppn7",
  "satoshis" : 50000
};

let transaction = new TransactionBuilder()
  .from(utxo)
  .to('nexa:nqtsq5g58rae9e24ea9tcdvwur8d4ur7py5v3a00ccwtkyqp', 15000)
  .sign(privateKey)
  .build();
```

## Create Transaction from Rostrum blockchain data (electrum-cash)

### First install

```sh
npm install @vgrunner/electrum-cash
```

### Build transaction using rostrum and broadcast it

```ts
// From private key
// assume we have private key with utxos
let address = Address.fromPublicKey(myPrivKey.publicKey).toString();

// Create a change address
let changePrivateKey = new PrivateKey();
let changeAddress = Address.fromPublicKey(changePrivateKey.publicKey).toString();

// Initialize an electrum client.
const electrum = new ElectrumClient('Electrum client example', '1.4.1', 'electrum.nexa.org');

// Request the full transaction hex for the transaction ID.
const utxos = await electrum.request('blockchain.address.listunspent', address, 'exclude_tokens');

let builder = new TransactionBuilder()

//Spends all inputs
for (let utxo of utxos) {
  let input = {
      outpoint: utxo.outpoint_hash,
      address: key.address,
      satoshis: utxo.value
  };
  builder.from(input);
}

// assuming we have 15000 satoshis and the fee is coming from the amount.
let tx = builder
  .to('nexa:nqtsq5g58rae9e24ea9tcdvwur8d4ur7py5v3a00ccwtkyqp', 15000)
  .change(changeAddress)
  .feePerByte(2) // 2 sats per Byte
  .sign(privateKey) // sign with from
  .build();

// Broadcast TX to the network
await electrum.request('blockchain.transaction.broadcast', tx.serialize());
```

## Sign a Nexa message

```ts
let privateKey = new PrivateKey('6J6fqYmE6yr97naoJXEqzWuKiKKbngKm9CPxaSj9YTfRPLRGn38A');
let message = new Message('This is an example of a signed message.');

let signature = message.sign(privateKey);
>>`H7Quy8DWIx5kNPVyJW7EiUnRiLo3b5cRwYlWW94u8d+7Rfz12nCvJ2xY7ETzVi35TWTO/N3MuwTe3g6m2DNg0/w=`
```

## Verify a Nexa message

```ts
let address = 'nexa:nqtsq5g5r4av5a20rcp4zx5d5q4uhndshc49h9q3s4tcppn7';
let signature = 'H7Quy8DWIx5kNPVyJW7EiUnRiLo3b5cRwYlWW94u8d+7Rfz12nCvJ2xY7ETzVi35TWTO/N3MuwTe3g6m2DNg0/w=';

let verified = new Message('This is an example of a signed message.').verify(address, signature);
>>`true`
```