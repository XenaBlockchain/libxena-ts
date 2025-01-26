# Libnexa TS

[![NPM Package](https://img.shields.io/npm/v/libnexa-ts.svg?style=flat-square)](https://www.npmjs.org/package/libnexa-ts)
![Coverage Status](https://img.shields.io/badge/coverage-100%25-brightgreen)

**A pure and powerful TypeScript Nexa SDK library.**

## Principles

Nexa is another powerful peer-to-peer platform for the next generation of financial technology. The decentralized nature of the Nexa network allows for highly resilient nexa infrastructure, and the developer community needs reliable, open-source tools to implement Nexa apps and services.

## Get Started

```sh
npm install libnexa-ts
```

Or adding libnexa-ts to your app's `package.json`:

```json
"dependencies": {
    "libnexa-ts": "^1.0.0",
    ...
}
```

## Documentation

The complete docs are hosted here: [Libnexa-ts documentation](https://nexa.gitlab.io/libnexa-ts/).
There's also a [Libnexa API reference](docs/api/index.md) available generated from the TSDocs of the project, where you'll find low-level details on each utility.

## Examples

- [Generate a random address](docs/examples.md#generate-a-random-address)
- [Generate a HD masterkey using Bip39](docs/examples.md#generate-an-address-using-BIP39-mnemonic-seed)
- [Import an address via WIF (Wallet Import Format)](docs/examples.md#import-an-address-via-wif)
- [Create a Transaction](docs/examples.md#create-a-transaction)
- [Sign a Nexa message](docs/examples.md#sign-a-nexa-message)
- [Verify a Nexa message](docs/examples.md#verify-a-nexa-message)

## Development & Tests

```sh
git clone https://gitlab.com/nexa/libnexa-ts.git
cd libnexa-ts
npm install
```

Run all the tests:

```sh
npm run test
```

You can also create a test coverage report (you can open `coverage/index.html` to visualize it) with `npm run coverage`.

## Security

We're using Libnexa in production, as are many others, but please use common sense when doing anything related to finances! We take no responsibility for your implementation decisions.