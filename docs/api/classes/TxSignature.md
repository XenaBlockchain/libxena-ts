[**libnexa-ts**](../index.md)

***

[libnexa-ts](../index.md) / TxSignature

# Class: TxSignature

## Implements

- [`ITxSignature`](../interfaces/ITxSignature.md)

## Constructors

### new TxSignature()

```ts
new TxSignature(arg: ITxSignature): TxSignature
```

Wrapper around Signature with fields related to signing a transaction specifically

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `arg` | [`ITxSignature`](../interfaces/ITxSignature.md) |

#### Returns

[`TxSignature`](TxSignature.md)

## Properties

| Property | Modifier | Type |
| ------ | ------ | ------ |
| <a id="inputindex"></a> `inputIndex` | `public` | `number` |
| <a id="publickey"></a> `publicKey` | `public` | [`PublicKey`](PublicKey.md) |
| <a id="subscript"></a> `subscript` | `public` | [`Script`](Script.md) |
| <a id="signature"></a> `signature` | `public` | [`Signature`](Signature.md) |
| <a id="sigtype"></a> `sigType` | `public` | [`SighashType`](SighashType.md) |
| <a id="tojson"></a> `toJSON` | `public` | () => [`ITxSignature`](../interfaces/ITxSignature.md) |

## Methods

### fromObject()

```ts
static fromObject(arg: ITxSignature): TxSignature
```

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `arg` | [`ITxSignature`](../interfaces/ITxSignature.md) |

#### Returns

[`TxSignature`](TxSignature.md)

***

### toObject()

```ts
toObject(): ITxSignature
```

#### Returns

[`ITxSignature`](../interfaces/ITxSignature.md)

***

### toTxSatisfier()

```ts
toTxSatisfier(): Buffer
```

#### Returns

`Buffer`
