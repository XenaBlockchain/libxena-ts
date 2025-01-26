[**libnexa-ts**](../index.md)

***

[libnexa-ts](../index.md) / Output

# Class: Output

## Implements

- [`IOutput`](../interfaces/IOutput.md)

## Constructors

### new Output()

```ts
new Output(
   value: string | number | bigint, 
   scriptPubKey: string | Script, 
   type: OutputType): Output
```

#### Parameters

| Parameter | Type | Default value |
| ------ | ------ | ------ |
| `value` | `string` \| `number` \| `bigint` | `undefined` |
| `scriptPubKey` | `string` \| [`Script`](Script.md) | `undefined` |
| `type` | [`OutputType`](../enumerations/OutputType.md) | `OutputType.INFER` |

#### Returns

[`Output`](Output.md)

## Properties

| Property | Modifier | Type |
| ------ | ------ | ------ |
| <a id="type-1"></a> `type` | `public` | [`OutputType`](../enumerations/OutputType.md) |
| <a id="tojson"></a> `toJSON` | `public` | () => [`IOutput`](../interfaces/IOutput.md) |

## Accessors

### value

#### Get Signature

```ts
get value(): bigint
```

##### Returns

`bigint`

#### Set Signature

```ts
set value(sats: string | number | bigint): void
```

##### Parameters

| Parameter | Type |
| ------ | ------ |
| `sats` | `string` \| `number` \| `bigint` |

##### Returns

`void`

#### Implementation of

[`IOutput`](../interfaces/IOutput.md).[`value`](../interfaces/IOutput.md#value)

***

### scriptPubKey

#### Get Signature

```ts
get scriptPubKey(): Script
```

##### Returns

[`Script`](Script.md)

#### Set Signature

```ts
set scriptPubKey(script: string | Script): void
```

##### Parameters

| Parameter | Type |
| ------ | ------ |
| `script` | `string` \| [`Script`](Script.md) |

##### Returns

`void`

#### Implementation of

[`IOutput`](../interfaces/IOutput.md).[`scriptPubKey`](../interfaces/IOutput.md#scriptpubkey)

## Methods

### fromObject()

```ts
static fromObject(data: IOutput): Output
```

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `data` | [`IOutput`](../interfaces/IOutput.md) |

#### Returns

[`Output`](Output.md)

***

### fromBufferReader()

```ts
static fromBufferReader(br: BufferReader): Output
```

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `br` | [`BufferReader`](BufferReader.md) |

#### Returns

[`Output`](Output.md)

***

### invalidValue()

```ts
invalidValue(): string | false
```

#### Returns

`string` \| `false`

***

### toObject()

```ts
toObject(): IOutput
```

#### Returns

[`IOutput`](../interfaces/IOutput.md)

***

### inspect()

```ts
inspect(): string
```

#### Returns

`string`

***

### toBufferWriter()

```ts
toBufferWriter(writer?: BufferWriter): BufferWriter
```

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `writer`? | [`BufferWriter`](BufferWriter.md) |

#### Returns

[`BufferWriter`](BufferWriter.md)
