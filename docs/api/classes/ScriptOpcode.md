[**libnexa-ts**](../index.md)

***

[libnexa-ts](../index.md) / ScriptOpcode

# Class: ScriptOpcode

## Constructors

### new ScriptOpcode()

```ts
new ScriptOpcode(val: string | number): ScriptOpcode
```

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `val` | `string` \| `number` |

#### Returns

[`ScriptOpcode`](ScriptOpcode.md)

## Properties

| Property | Type |
| ------ | ------ |
| <a id="num"></a> `num` | `number` |

## Methods

### fromBuffer()

```ts
static fromBuffer(buf: Buffer): ScriptOpcode
```

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `buf` | `Buffer` |

#### Returns

[`ScriptOpcode`](ScriptOpcode.md)

***

### fromNumber()

```ts
static fromNumber(num: number): ScriptOpcode
```

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `num` | `number` |

#### Returns

[`ScriptOpcode`](ScriptOpcode.md)

***

### fromString()

```ts
static fromString(str: string): ScriptOpcode
```

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `str` | `string` |

#### Returns

[`ScriptOpcode`](ScriptOpcode.md)

***

### smallInt()

```ts
static smallInt(n: number): ScriptOpcode
```

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `n` | `number` |

#### Returns

[`ScriptOpcode`](ScriptOpcode.md)

***

### isSmallIntOp()

```ts
static isSmallIntOp(opcode: number | ScriptOpcode): boolean
```

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `opcode` | `number` \| [`ScriptOpcode`](ScriptOpcode.md) |

#### Returns

`boolean`

true if opcode is one of OP_0, OP_1, ..., OP_16

***

### decodeOP\_N()

```ts
static decodeOP_N(opcode: number): number
```

Comes from nexad's script DecodeOP_N function

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `opcode` | `number` |  |

#### Returns

`number`

numeric value in range of 0 to 16

***

### toHex()

```ts
toHex(): string
```

#### Returns

`string`

***

### toBuffer()

```ts
toBuffer(): Buffer
```

#### Returns

`Buffer`

***

### toNumber()

```ts
toNumber(): number
```

#### Returns

`number`

***

### toString()

```ts
toString(): string
```

#### Returns

`string`

***

### inspect()

```ts
inspect(): string
```

Will return a string formatted for the console

#### Returns

`string`

Script opcode
