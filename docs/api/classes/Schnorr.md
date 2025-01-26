[**libnexa-ts**](../index.md)

***

[libnexa-ts](../index.md) / Schnorr

# Class: Schnorr

## Extends

- [`DigitalSignature`](DigitalSignature.md)

## Constructors

### new Schnorr()

```ts
new Schnorr(obj?: Partial<IDigitalSignature>): Schnorr
```

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `obj`? | `Partial`\<[`IDigitalSignature`](../interfaces/IDigitalSignature.md)\> |

#### Returns

[`Schnorr`](Schnorr.md)

#### Inherited from

[`DigitalSignature`](DigitalSignature.md).[`constructor`](DigitalSignature.md#constructors)

## Properties

| Property | Type | Inherited from |
| ------ | ------ | ------ |
| <a id="hashbuf"></a> `hashbuf` | `Buffer` | [`DigitalSignature`](DigitalSignature.md).[`hashbuf`](DigitalSignature.md#hashbuf) |
| <a id="endian"></a> `endian?` | [`EndianType`](../type-aliases/EndianType.md) | [`DigitalSignature`](DigitalSignature.md).[`endian`](DigitalSignature.md#endian) |
| <a id="privkey"></a> `privkey` | [`IPrivateKey`](../interfaces/IPrivateKey.md) | [`DigitalSignature`](DigitalSignature.md).[`privkey`](DigitalSignature.md#privkey) |
| <a id="pubkey"></a> `pubkey` | [`IPublicKey`](../interfaces/IPublicKey.md) | [`DigitalSignature`](DigitalSignature.md).[`pubkey`](DigitalSignature.md#pubkey) |
| <a id="sig"></a> `sig?` | [`ISignature`](../interfaces/ISignature.md) | [`DigitalSignature`](DigitalSignature.md).[`sig`](DigitalSignature.md#sig) |
| <a id="verified"></a> `verified?` | `boolean` | [`DigitalSignature`](DigitalSignature.md).[`verified`](DigitalSignature.md#verified) |

## Methods

### sign()

```ts
static sign(
   hashbuf: Buffer, 
   privkey: IPrivateKey, 
   endian: EndianType): ISignature
```

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `hashbuf` | `Buffer` |
| `privkey` | [`IPrivateKey`](../interfaces/IPrivateKey.md) |
| `endian` | [`EndianType`](../type-aliases/EndianType.md) |

#### Returns

[`ISignature`](../interfaces/ISignature.md)

***

### verify()

```ts
static verify(
   hashbuf: Buffer, 
   sig: ISignature, 
   pubkey: IPublicKey, 
   endian: EndianType): boolean
```

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `hashbuf` | `Buffer` |
| `sig` | [`ISignature`](../interfaces/ISignature.md) |
| `pubkey` | [`IPublicKey`](../interfaces/IPublicKey.md) |
| `endian` | [`EndianType`](../type-aliases/EndianType.md) |

#### Returns

`boolean`

***

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

#### Inherited from

[`DigitalSignature`](DigitalSignature.md).[`set`](DigitalSignature.md#set)

***

### sign()

```ts
sign(): this
```

#### Returns

`this`

#### Inherited from

[`DigitalSignature`](DigitalSignature.md).[`sign`](DigitalSignature.md#sign)

***

### verify()

```ts
verify(): this
```

#### Returns

`this`

#### Inherited from

[`DigitalSignature`](DigitalSignature.md).[`verify`](DigitalSignature.md#verify)

***

### toPublicKey()

```ts
toPublicKey(): IPublicKey
```

#### Returns

[`IPublicKey`](../interfaces/IPublicKey.md)

#### Inherited from

[`DigitalSignature`](DigitalSignature.md).[`toPublicKey`](DigitalSignature.md#topublickey)

***

### privkey2pubkey()

```ts
privkey2pubkey(): void
```

#### Returns

`void`

#### Inherited from

[`DigitalSignature`](DigitalSignature.md).[`privkey2pubkey`](DigitalSignature.md#privkey2pubkey)

***

### sigError()

```ts
sigError(): string | boolean
```

#### Returns

`string` \| `boolean`

#### Overrides

[`DigitalSignature`](DigitalSignature.md).[`sigError`](DigitalSignature.md#sigerror)

***

### nonceFunctionRFC6979()

```ts
nonceFunctionRFC6979(privkeybuf: Buffer, msgbuf: Buffer): BNExtended
```

RFC6979 deterministic nonce generation used from https://reviews.bitcoinabc.org/D2501

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `privkeybuf` | `Buffer` |  |
| `msgbuf` | `Buffer` |  |

#### Returns

[`BNExtended`](BNExtended.md)

BN nonce

***

### \_findSignature()

```ts
protected _findSignature(d: BNExtended, e: BNExtended): Partial<ISignature>
```

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `d` | [`BNExtended`](BNExtended.md) | the private key |
| `e` | [`BNExtended`](BNExtended.md) | the message to be signed |

#### Returns

`Partial`\<[`ISignature`](../interfaces/ISignature.md)\>

#### Remarks

Important references for schnorr implementation [https://spec.nexa.org/forks/2019-05-15-schnorr/](https://spec.nexa.org/forks/2019-05-15-schnorr/)

#### Overrides

[`DigitalSignature`](DigitalSignature.md).[`_findSignature`](DigitalSignature.md#_findsignature)
