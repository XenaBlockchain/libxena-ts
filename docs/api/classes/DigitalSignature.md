[**libnexa-ts**](../index.md)

***

[libnexa-ts](../index.md) / DigitalSignature

# Class: `abstract` DigitalSignature

## Extended by

- [`ECDSA`](ECDSA.md)
- [`Schnorr`](Schnorr.md)

## Implements

- [`IDigitalSignature`](../interfaces/IDigitalSignature.md)

## Constructors

### new DigitalSignature()

```ts
new DigitalSignature(obj?: Partial<IDigitalSignature>): DigitalSignature
```

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `obj`? | `Partial`\<[`IDigitalSignature`](../interfaces/IDigitalSignature.md)\> |

#### Returns

[`DigitalSignature`](DigitalSignature.md)

## Properties

| Property | Type |
| ------ | ------ |
| <a id="hashbuf"></a> `hashbuf` | `Buffer` |
| <a id="endian"></a> `endian?` | [`EndianType`](../type-aliases/EndianType.md) |
| <a id="privkey"></a> `privkey` | [`IPrivateKey`](../interfaces/IPrivateKey.md) |
| <a id="pubkey"></a> `pubkey` | [`IPublicKey`](../interfaces/IPublicKey.md) |
| <a id="sig"></a> `sig?` | [`ISignature`](../interfaces/ISignature.md) |
| <a id="verified"></a> `verified?` | `boolean` |

## Methods

### set()

```ts
protected set(obj: Partial<IDigitalSignature>): this
```

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `obj` | `Partial`\<[`IDigitalSignature`](../interfaces/IDigitalSignature.md)\> |

#### Returns

`this`

***

### \_findSignature()

```ts
abstract protected _findSignature(d: BNExtended, e: BNExtended): Partial<ISignature>
```

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `d` | [`BNExtended`](BNExtended.md) |
| `e` | [`BNExtended`](BNExtended.md) |

#### Returns

`Partial`\<[`ISignature`](../interfaces/ISignature.md)\>

***

### sigError()

```ts
abstract sigError(): string | boolean
```

#### Returns

`string` \| `boolean`

***

### sign()

```ts
sign(): this
```

#### Returns

`this`

#### Implementation of

[`IDigitalSignature`](../interfaces/IDigitalSignature.md).[`sign`](../interfaces/IDigitalSignature.md#sign)

***

### verify()

```ts
verify(): this
```

#### Returns

`this`

#### Implementation of

[`IDigitalSignature`](../interfaces/IDigitalSignature.md).[`verify`](../interfaces/IDigitalSignature.md#verify)

***

### toPublicKey()

```ts
toPublicKey(): IPublicKey
```

#### Returns

[`IPublicKey`](../interfaces/IPublicKey.md)

***

### privkey2pubkey()

```ts
privkey2pubkey(): void
```

#### Returns

`void`
