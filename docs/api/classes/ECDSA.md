[**libnexa-ts**](../index.md)

***

[libnexa-ts](../index.md) / ECDSA

# Class: ECDSA

IMPORTANT: ECDSA only used for compact message signing.
for transactions signing, use Schnorr.

## Extends

- [`DigitalSignature`](DigitalSignature.md)

## Constructors

### new ECDSA()

```ts
new ECDSA(obj?: Partial<IDigitalSignature>): ECDSA
```

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `obj`? | `Partial`\<[`IDigitalSignature`](../interfaces/IDigitalSignature.md)\> |

#### Returns

[`ECDSA`](ECDSA.md)

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
| <a id="k"></a> `k?` | [`BNExtended`](BNExtended.md) | - |

## Methods

### fromString()

```ts
static fromString(str: string): ECDSA
```

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `str` | `string` |

#### Returns

[`ECDSA`](ECDSA.md)

***

### sign()

```ts
static sign(
   hashbuf: Buffer, 
   privkey: IPrivateKey, 
   endian?: EndianType): ISignature
```

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `hashbuf` | `Buffer` |
| `privkey` | [`IPrivateKey`](../interfaces/IPrivateKey.md) |
| `endian`? | [`EndianType`](../type-aliases/EndianType.md) |

#### Returns

[`ISignature`](../interfaces/ISignature.md)

***

### verify()

```ts
static verify(
   hashbuf: Buffer, 
   sig: ISignature, 
   pubkey: IPublicKey, 
   endian?: EndianType): boolean
```

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `hashbuf` | `Buffer` |
| `sig` | [`ISignature`](../interfaces/ISignature.md) |
| `pubkey` | [`IPublicKey`](../interfaces/IPublicKey.md) |
| `endian`? | [`EndianType`](../type-aliases/EndianType.md) |

#### Returns

`boolean`

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

### privkey2pubkey()

```ts
privkey2pubkey(): void
```

#### Returns

`void`

#### Inherited from

[`DigitalSignature`](DigitalSignature.md).[`privkey2pubkey`](DigitalSignature.md#privkey2pubkey)

***

### set()

```ts
set(obj: Partial<ECDSA>): this
```

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `obj` | `Partial`\<[`ECDSA`](ECDSA.md)\> |

#### Returns

`this`

#### Overrides

[`DigitalSignature`](DigitalSignature.md).[`set`](DigitalSignature.md#set)

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

### \_findSignature()

```ts
protected _findSignature(d: BNExtended, e: BNExtended): Partial<ISignature>
```

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `d` | [`BNExtended`](BNExtended.md) |
| `e` | [`BNExtended`](BNExtended.md) |

#### Returns

`Partial`\<[`ISignature`](../interfaces/ISignature.md)\>

#### Overrides

[`DigitalSignature`](DigitalSignature.md).[`_findSignature`](DigitalSignature.md#_findsignature)

***

### calcI()

```ts
calcI(): this
```

#### Returns

`this`

***

### randomK()

```ts
randomK(): this
```

#### Returns

`this`

***

### deterministicK()

```ts
deterministicK(badrs?: number): this
```

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `badrs`? | `number` |

#### Returns

`this`

***

### signRandomK()

```ts
signRandomK(): this
```

#### Returns

`this`

***

### toString()

```ts
toString(): string
```

Returns a string representation of an object.

#### Returns

`string`

***

### toPublicKey()

```ts
toPublicKey(): PublicKey
```

#### Returns

[`PublicKey`](PublicKey.md)

#### Overrides

[`DigitalSignature`](DigitalSignature.md).[`toPublicKey`](DigitalSignature.md#topublickey)
