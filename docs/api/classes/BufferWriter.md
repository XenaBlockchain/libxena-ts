[**libnexa-ts**](../index.md)

***

[libnexa-ts](../index.md) / BufferWriter

# Class: BufferWriter

## Constructors

### new BufferWriter()

```ts
new BufferWriter(obj?: BufferWriterOptions): BufferWriter
```

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `obj`? | [`BufferWriterOptions`](../interfaces/BufferWriterOptions.md) |

#### Returns

[`BufferWriter`](BufferWriter.md)

## Methods

### varintBufNum()

```ts
static varintBufNum(n: number): Buffer
```

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `n` | `number` |

#### Returns

`Buffer`

***

### varintBufBN()

```ts
static varintBufBN(bn: BNExtended): Buffer
```

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `bn` | [`BNExtended`](BNExtended.md) |

#### Returns

`Buffer`

***

### set()

```ts
set(obj: BufferWriterOptions): this
```

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `obj` | [`BufferWriterOptions`](../interfaces/BufferWriterOptions.md) |

#### Returns

`this`

***

### toBuffer()

```ts
toBuffer(): Buffer
```

#### Returns

`Buffer`

***

### concat()

```ts
concat(): Buffer
```

#### Returns

`Buffer`

***

### write()

```ts
write(buf: Buffer): this
```

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `buf` | `Buffer` |

#### Returns

`this`

***

### writeReverse()

```ts
writeReverse(buf: Buffer): this
```

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `buf` | `Buffer` |

#### Returns

`this`

***

### writeUInt8()

```ts
writeUInt8(n: number): this
```

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `n` | `number` |

#### Returns

`this`

***

### writeUInt16BE()

```ts
writeUInt16BE(n: number): this
```

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `n` | `number` |

#### Returns

`this`

***

### writeUInt16LE()

```ts
writeUInt16LE(n: number): this
```

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `n` | `number` |

#### Returns

`this`

***

### writeUInt32BE()

```ts
writeUInt32BE(n: number): this
```

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `n` | `number` |

#### Returns

`this`

***

### writeInt32LE()

```ts
writeInt32LE(n: number): this
```

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `n` | `number` |

#### Returns

`this`

***

### writeUInt32LE()

```ts
writeUInt32LE(n: number): this
```

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `n` | `number` |

#### Returns

`this`

***

### writeUInt64BEBN()

```ts
writeUInt64BEBN(bn: BNExtended): this
```

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `bn` | [`BNExtended`](BNExtended.md) |

#### Returns

`this`

***

### writeUInt64LEBN()

```ts
writeUInt64LEBN(bn: BNExtended): this
```

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `bn` | [`BNExtended`](BNExtended.md) |

#### Returns

`this`

***

### writeVarintNum()

```ts
writeVarintNum(n: number): this
```

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `n` | `number` |

#### Returns

`this`

***

### writeVarintBN()

```ts
writeVarintBN(bn: BNExtended): this
```

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `bn` | [`BNExtended`](BNExtended.md) |

#### Returns

`this`

***

### writeVarLengthBuf()

```ts
writeVarLengthBuf(buf: Buffer): this
```

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `buf` | `Buffer` |

#### Returns

`this`

***

### writeCoreVarintNum()

```ts
writeCoreVarintNum(n: number): this
```

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `n` | `number` |

#### Returns

`this`
