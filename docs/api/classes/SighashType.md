[**libnexa-ts**](../index.md)

***

[libnexa-ts](../index.md) / SighashType

# Class: SighashType

## Constructors

### new SighashType()

```ts
new SighashType(): SighashType
```

#### Returns

[`SighashType`](SighashType.md)

## Properties

| Property | Modifier | Type | Default value | Description |
| ------ | ------ | ------ | ------ | ------ |
| <a id="max_size"></a> `MAX_SIZE` | `readonly` | `4` | `4` | the longest sighashtype in bytes (for use in calculating tx fees by tx length estimation) |
| <a id="intype"></a> `inType` | `public` | [`InputSighashType`](../enumerations/InputSighashType.md) | `undefined` | - |
| <a id="outtype"></a> `outType` | `public` | [`OutputSighashType`](../enumerations/OutputSighashType.md) | `undefined` | - |
| <a id="indata"></a> `inData` | `public` | `number`[] | `undefined` | - |
| <a id="outdata"></a> `outData` | `public` | `number`[] | `undefined` | - |

## Accessors

### ALL

#### Get Signature

```ts
get static ALL(): SighashType
```

creates a sighash that is the most restrictive -- it signs all inputs and outputs

##### Returns

[`SighashType`](SighashType.md)

## Methods

### fromBuffer()

```ts
static fromBuffer(buf: Buffer): SighashType
```

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `buf` | `Buffer` |

#### Returns

[`SighashType`](SighashType.md)

***

### fromHex()

```ts
static fromHex(hex: string): SighashType
```

Create sighash for hex represantation

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `hex` | `string` |

#### Returns

[`SighashType`](SighashType.md)

#### See

toHex

***

### fromString()

```ts
static fromString(str: string): SighashType
```

Create sighash from human readable represantation

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `str` | `string` |

#### Returns

[`SighashType`](SighashType.md)

#### See

toString

***

### hasAll()

```ts
hasAll(): boolean
```

#### Returns

`boolean`

***

### isInvalid()

```ts
isInvalid(): boolean
```

#### Returns

`boolean`

***

### setAnyoneCanPay()

```ts
setAnyoneCanPay(): this
```

Anyone can pay signs only the current input, so other entities can add addtl inputs to complete the partial tx

#### Returns

`this`

***

### setFirstNIn()

```ts
setFirstNIn(n: number): this
```

Include only the n first inputs in the preimage sighash

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `n` | `number` | The first inputs to include |

#### Returns

`this`

***

### setFirstNOut()

```ts
setFirstNOut(n: number): this
```

Include only the n first outputs in the preimage sighash

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `n` | `number` | The first outputs to include |

#### Returns

`this`

***

### set2Out()

```ts
set2Out(a: number, b: number): this
```

Include specific 2 outputs in the preimage sighash

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `a` | `number` | The 1st output to include |
| `b` | `number` | The 2nd output to include |

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

### toHex()

```ts
toHex(): string
```

Convert to a hex representation of the sighash

#### Returns

`string`

***

### toString()

```ts
toString(): string
```

Convert to a human readable representation of the sighash

#### Returns

`string`
