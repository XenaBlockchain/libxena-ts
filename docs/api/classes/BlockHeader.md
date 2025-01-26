[**libnexa-ts**](../index.md)

***

[libnexa-ts](../index.md) / BlockHeader

# Class: BlockHeader

## Implements

- [`IBlockHeader`](../interfaces/IBlockHeader.md)

## Constructors

### new BlockHeader()

```ts
new BlockHeader(data: Buffer | IBlockHeader): BlockHeader
```

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `data` | `Buffer` \| [`IBlockHeader`](../interfaces/IBlockHeader.md) |

#### Returns

[`BlockHeader`](BlockHeader.md)

## Properties

| Property | Modifier | Type |
| ------ | ------ | ------ |
| <a id="max_time_offset"></a> `MAX_TIME_OFFSET` | `readonly` | `number` |
| <a id="prevhash"></a> `prevHash` | `public` | `Buffer` |
| <a id="bits"></a> `bits` | `public` | `number` |
| <a id="ancestorhash"></a> `ancestorHash` | `public` | `Buffer` |
| <a id="merkleroot"></a> `merkleRoot` | `public` | `Buffer` |
| <a id="txfilter"></a> `txFilter` | `public` | `Buffer` |
| <a id="time"></a> `time` | `public` | `number` |
| <a id="height"></a> `height` | `public` | `number` |
| <a id="chainwork"></a> `chainWork` | `public` | `Buffer` |
| <a id="size"></a> `size` | `public` | `number` |
| <a id="txcount"></a> `txCount` | `public` | `number` |
| <a id="poolfee"></a> `poolFee` | `public` | `number` |
| <a id="utxocommitment"></a> `utxoCommitment` | `public` | `Buffer` |
| <a id="minerdata"></a> `minerData` | `public` | `Buffer` |
| <a id="nonce"></a> `nonce` | `public` | `Buffer` |
| <a id="tojson"></a> `toJSON` | `public` | () => [`IBlockHeader`](../interfaces/IBlockHeader.md) |

## Accessors

### hash

#### Get Signature

```ts
get hash(): string
```

##### Returns

`string`

#### Implementation of

[`IBlockHeader`](../interfaces/IBlockHeader.md).[`hash`](../interfaces/IBlockHeader.md#hash)

## Methods

### fromBufferReader()

```ts
static fromBufferReader(br: BufferReader): BlockHeader
```

This method is useful for hex that represent concatination of multiple headers
so it able to serve in a loop.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `br` | [`BufferReader`](BufferReader.md) | A BufferReader of the block header |

#### Returns

[`BlockHeader`](BlockHeader.md)

An instance of block header

***

### fromObject()

```ts
static fromObject(header: IBlockHeader): BlockHeader
```

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `header` | [`IBlockHeader`](../interfaces/IBlockHeader.md) | A plain JavaScript block header object |

#### Returns

[`BlockHeader`](BlockHeader.md)

An instance of block header

***

### fromBuffer()

```ts
static fromBuffer(buf: Buffer): BlockHeader
```

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `buf` | `Buffer` | A buffer of the block header |

#### Returns

[`BlockHeader`](BlockHeader.md)

An instance of block header

***

### fromString()

```ts
static fromString(hex: string): BlockHeader
```

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `hex` | `string` | A hex encoded buffer of the block header |

#### Returns

[`BlockHeader`](BlockHeader.md)

An instance of block header

***

### toObject()

```ts
toObject(): IBlockHeader
```

#### Returns

[`IBlockHeader`](../interfaces/IBlockHeader.md)

A plain object of the BlockHeader

***

### toBufferWriter()

```ts
toBufferWriter(bw?: BufferWriter): BufferWriter
```

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `bw`? | [`BufferWriter`](BufferWriter.md) | An existing instance BufferWriter |

#### Returns

[`BufferWriter`](BufferWriter.md)

An instance of BufferWriter representation of the BlockHeader

***

### toBuffer()

```ts
toBuffer(): Buffer
```

#### Returns

`Buffer`

A Buffer of the BlockHeader

***

### toString()

```ts
toString(): string
```

#### Returns

`string`

A hex encoded string of the BlockHeader

***

### inspect()

```ts
inspect(): string
```

#### Returns

`string`

A string formatted for the console

***

### getTargetDifficulty()

```ts
getTargetDifficulty(bits?: number): BNExtended
```

Returns the target difficulty for this block

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `bits`? | `number` | the bits number |

#### Returns

[`BNExtended`](BNExtended.md)

An instance of BN with the decoded difficulty bits

***

### getDifficulty()

```ts
getDifficulty(): number
```

#### Returns

`number`

the target difficulty for this block

***

### validTimestamp()

```ts
validTimestamp(): boolean
```

#### Returns

`boolean`

true If timestamp is not too far in the future

***

### validProofOfWork()

```ts
validProofOfWork(): boolean
```

#### Returns

`boolean`

true If the proof-of-work hash satisfies the target difficulty
