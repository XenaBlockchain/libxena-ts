[**libnexa-ts**](../index.md)

***

[libnexa-ts](../index.md) / TxSigner

# Class: TxSigner

## Constructors

### new TxSigner()

```ts
new TxSigner(): TxSigner
```

#### Returns

[`TxSigner`](TxSigner.md)

## Methods

### sign()

```ts
static sign(
   transaction: Transaction, 
   inputNumber: number, 
   sighashType: SighashType, 
   subscript: Script, 
   privateKey: PrivateKey): Signature
```

Create a signature

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `transaction` | [`Transaction`](Transaction.md) | the transaction to sign |
| `inputNumber` | `number` | the input index for the signature |
| `sighashType` | [`SighashType`](SighashType.md) | the sighash type |
| `subscript` | [`Script`](Script.md) | the script that will be signed |
| `privateKey` | [`PrivateKey`](PrivateKey.md) | the privkey to sign with |

#### Returns

[`Signature`](Signature.md)

The signature

***

### verify()

```ts
static verify(
   transaction: Transaction, 
   inputNumber: number, 
   signature: Signature, 
   sighashType: SighashType, 
   subscript: Script, 
   publicKey: PublicKey): boolean
```

Verify a signature

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `transaction` | [`Transaction`](Transaction.md) | the transaction to verify |
| `inputNumber` | `number` | the input index for the signature |
| `signature` | [`Signature`](Signature.md) | the signature to verify |
| `sighashType` | [`SighashType`](SighashType.md) | the sighash type |
| `subscript` | [`Script`](Script.md) | the script that will be verified |
| `publicKey` | [`PublicKey`](PublicKey.md) | the pubkey that correspond to the signing privkey |

#### Returns

`boolean`

true if signature is valid

***

### buildSighash()

```ts
static buildSighash(
   transaction: Transaction, 
   inputNumber: number, 
   sighashType: SighashType, 
   subscript: Script): Buffer
```

Returns a buffer of length 32 bytes with the hash that needs to be signed for OP_CHECKSIG(VERIFY).

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `transaction` | [`Transaction`](Transaction.md) | the transaction to sign |
| `inputNumber` | `number` | the input index for the signature |
| `sighashType` | [`SighashType`](SighashType.md) | the sighash type |
| `subscript` | [`Script`](Script.md) | the script that will be signed |

#### Returns

`Buffer`
