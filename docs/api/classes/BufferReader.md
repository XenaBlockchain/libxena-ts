[**libnexa-ts**](../index.md)

***

[libnexa-ts](../index.md) / BufferReader

# Class: BufferReader

## Constructors

### new BufferReader()

```ts
new BufferReader(buf?: 
  | string
  | Buffer<ArrayBufferLike>
  | BufferParams): BufferReader
```

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `buf`? | \| `string` \| `Buffer`\<`ArrayBufferLike`\> \| [`BufferParams`](../interfaces/BufferParams.md) |

#### Returns

[`BufferReader`](BufferReader.md)

## Properties

| Property | Modifier | Type |
| ------ | ------ | ------ |
| <a id="buf-1"></a> `buf` | `public` | `Buffer` |
| <a id="pos"></a> `pos` | `public` | `number` |
| <a id="finished"></a> `finished` | `public` | () => `boolean` |

## Methods

### set()

```ts
set(obj: BufferParams): this
```

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `obj` | [`BufferParams`](../interfaces/BufferParams.md) |

#### Returns

`this`

***

### eof()

```ts
eof(): boolean
```

#### Returns

`boolean`

***

### read()

```ts
read(len: number): Buffer
```

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `len` | `number` |

#### Returns

`Buffer`

***

### readAll()

```ts
readAll(): Buffer
```

#### Returns

`Buffer`

***

### readUInt8()

```ts
readUInt8(): number
```

#### Returns

`number`

***

### readUInt16BE()

```ts
readUInt16BE(): number
```

#### Returns

`number`

***

### readUInt16LE()

```ts
readUInt16LE(): number
```

#### Returns

`number`

***

### readUInt32BE()

```ts
readUInt32BE(): number
```

#### Returns

`number`

***

### readUInt32LE()

```ts
readUInt32LE(): number
```

#### Returns

`number`

***

### readInt32LE()

```ts
readInt32LE(): number
```

#### Returns

`number`

***

### readUInt64BEBN()

```ts
readUInt64BEBN(): BNExtended
```

#### Returns

[`BNExtended`](BNExtended.md)

***

### readUInt64LEBN()

```ts
readUInt64LEBN(): BNExtended
```

#### Returns

[`BNExtended`](BNExtended.md)

***

### readVarintNum()

```ts
readVarintNum(): number
```

#### Returns

`number`

***

### readVarLengthBuffer()

```ts
readVarLengthBuffer(): Buffer
```

reads a length prepended buffer

#### Returns

`Buffer`

***

### readVarintBuf()

```ts
readVarintBuf(): Buffer
```

#### Returns

`Buffer`

***

### readVarintBN()

```ts
readVarintBN(): BNExtended
```

#### Returns

[`BNExtended`](BNExtended.md)

***

### reverse()

```ts
reverse(): this
```

#### Returns

`this`

***

### readReverse()

```ts
readReverse(len?: number): Buffer
```

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `len`? | `number` |

#### Returns

`Buffer`

***

### readCoreVarintNum()

```ts
readCoreVarintNum(): number
```

#### Returns

`number`
