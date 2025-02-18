[**libnexa-ts**](../index.md)

***

[libnexa-ts](../index.md) / Signature

# Class: Signature

## Implements

- [`ISignature`](../interfaces/ISignature.md)

## Constructors

### new Signature()

```ts
new Signature(params: Partial<ISignature>): Signature
```

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `params` | `Partial`\<[`ISignature`](../interfaces/ISignature.md)\> |

#### Returns

[`Signature`](Signature.md)

## Properties

| Property | Modifier | Type |
| ------ | ------ | ------ |
| <a id="r"></a> `r` | `public` | [`BNExtended`](BNExtended.md) |
| <a id="s"></a> `s` | `public` | [`BNExtended`](BNExtended.md) |
| <a id="i"></a> `i?` | `public` | `number` |
| <a id="compressed"></a> `compressed?` | `public` | `boolean` |

## Methods

### fromBuffer()

```ts
static fromBuffer(buf: Buffer, strict?: boolean): Signature
```

Schnorr signatures are 64 bytes: r [len] 32 || s [len] 32.

There can be a few more bytes that is the sighashtype. It needs to be trimmed before calling this.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `buf` | `Buffer` |
| `strict`? | `boolean` |

#### Returns

[`Signature`](Signature.md)

***

### fromTxFormat()

```ts
static fromTxFormat(buf: Buffer): Signature
```

The format used in a tx.
schnorr is 64 bytes, the rest are sighashtype bytes

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `buf` | `Buffer` |  |

#### Returns

[`Signature`](Signature.md)

***

### fromString()

```ts
static fromString(str: string): Signature
```

This assumes the str is a raw signature and does not have sighashtype.
Use [Signature.fromTxString](Signature.md#fromtxstring) when decoding a tx

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `str` | `string` | the signature hex string |

#### Returns

[`Signature`](Signature.md)

#### See

fromTxString

***

### fromTxString()

```ts
static fromTxString(str: string, encoding: BufferEncoding): Signature
```

This assumes the str might have sighashtype bytes and will trim it if needed.
Use this when decoding a tx signature string

#### Parameters

| Parameter | Type | Default value | Description |
| ------ | ------ | ------ | ------ |
| `str` | `string` | `undefined` | the tx signature hex string |
| `encoding` | `BufferEncoding` | `'hex'` | - |

#### Returns

[`Signature`](Signature.md)

***

### parseDER()

```ts
static parseDER(buf: Buffer, strict?: boolean): Record<string, unknown>
```

For ECDSA. In order to mimic the non-strict DER encoding of OpenSSL, set strict = false.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `buf` | `Buffer` |
| `strict`? | `boolean` |

#### Returns

`Record`\<`string`, `unknown`\>

***

### fromCompact()

```ts
static fromCompact(buf: Buffer): Signature
```

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `buf` | `Buffer` |

#### Returns

[`Signature`](Signature.md)

***

### toBuffer()

```ts
toBuffer(isSchnorr: boolean): Buffer
```

#### Parameters

| Parameter | Type | Default value |
| ------ | ------ | ------ |
| `isSchnorr` | `boolean` | `true` |

#### Returns

`Buffer`

#### Implementation of

[`ISignature`](../interfaces/ISignature.md).[`toBuffer`](../interfaces/ISignature.md#tobuffer)

***

### toTxFormat()

```ts
toTxFormat(sighashBuf?: Buffer<ArrayBufferLike>): Buffer
```

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `sighashBuf`? | `Buffer`\<`ArrayBufferLike`\> |

#### Returns

`Buffer`

***

### toString()

```ts
toString(): string
```

Returns a string representation of an object.

#### Returns

`string`

***

### toCompact()

```ts
toCompact(i?: number, compressed?: boolean): Buffer
```

ECDSA format. used for sign messages

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `i`? | `number` |
| `compressed`? | `boolean` |

#### Returns

`Buffer`
