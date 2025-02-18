[**libnexa-ts**](../index.md)

***

[libnexa-ts](../index.md) / Block

# Class: Block

## Implements

- [`IBlock`](../interfaces/IBlock.md)

## Constructors

### new Block()

```ts
new Block(data: Buffer<ArrayBufferLike> | IBlock): Block
```

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `data` | `Buffer`\<`ArrayBufferLike`\> \| [`IBlock`](../interfaces/IBlock.md) |

#### Returns

[`Block`](Block.md)

## Properties

| Property | Modifier | Type |
| ------ | ------ | ------ |
| <a id="header"></a> `header` | `public` | [`BlockHeader`](BlockHeader.md) |
| <a id="transactions"></a> `transactions` | `public` | [`Transaction`](Transaction.md)[] |
| <a id="tojson"></a> `toJSON` | `public` | () => [`IBlock`](../interfaces/IBlock.md) |

## Accessors

### hash

#### Get Signature

```ts
get hash(): string
```

##### Returns

`string`

## Methods

### fromObject()

```ts
static fromObject(obj: IBlock): Block
```

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `obj` | [`IBlock`](../interfaces/IBlock.md) | A plain JavaScript object |

#### Returns

[`Block`](Block.md)

An instance of block

***

### fromBufferReader()

```ts
static fromBufferReader(br: BufferReader): Block
```

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `br` | [`BufferReader`](BufferReader.md) | A buffer reader of the block |

#### Returns

[`Block`](Block.md)

An instance of block

***

### fromBuffer()

```ts
static fromBuffer(buf: Buffer): Block
```

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `buf` | `Buffer` | A buffer of the block |

#### Returns

[`Block`](Block.md)

An instance of block

***

### fromString()

```ts
static fromString(str: string): Block
```

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `str` | `string` | A hex encoded string of the block |

#### Returns

[`Block`](Block.md)

A hex encoded string of the block

***

### toObject()

```ts
toObject(): IBlock
```

#### Returns

[`IBlock`](../interfaces/IBlock.md)

A plain object with the block properties

***

### toBufferWriter()

```ts
toBufferWriter(bw?: BufferWriter): BufferWriter
```

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `bw`? | [`BufferWriter`](BufferWriter.md) | An existing instance of BufferWriter (optional) |

#### Returns

[`BufferWriter`](BufferWriter.md)

An instance of BufferWriter representation of the Block

***

### toBuffer()

```ts
toBuffer(): Buffer
```

#### Returns

`Buffer`

A buffer of the block

***

### toString()

```ts
toString(): string
```

#### Returns

`string`

A hex encoded string of the block

***

### inspect()

```ts
inspect(): string
```

#### Returns

`string`

A string formatted for the console

***

### getTransactionHashes()

```ts
getTransactionHashes(): Buffer<ArrayBufferLike>[]
```

Will iterate through each transaction and return an array of hashes

#### Returns

`Buffer`\<`ArrayBufferLike`\>[]

An array with transaction hashes

***

### getMerkleTree()

```ts
getMerkleTree(): Buffer<ArrayBufferLike>[]
```

Will build a merkle tree of all the transactions, ultimately arriving at
a single point, the merkle root.

#### Returns

`Buffer`\<`ArrayBufferLike`\>[]

An array with each level of the tree after the other.

#### See

[https://spec.nexa.org/blocks/merkle-tree/](https://spec.nexa.org/blocks/merkle-tree/)

***

### getMerkleRoot()

```ts
getMerkleRoot(): Buffer
```

Calculates the merkleRoot from the transactions.

#### Returns

`Buffer`

A buffer of the merkle root hash

***

### validMerkleRoot()

```ts
validMerkleRoot(): boolean
```

Verifies that the transactions in the block match the header merkle root

#### Returns

`boolean`

true If the merkle roots match
