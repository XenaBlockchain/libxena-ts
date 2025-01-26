[**libnexa-ts**](../index.md)

***

[libnexa-ts](../index.md) / CommonUtils

# Class: CommonUtils

## Constructors

### new CommonUtils()

```ts
new CommonUtils(): CommonUtils
```

#### Returns

[`CommonUtils`](CommonUtils.md)

## Methods

### isHexa()

```ts
static isHexa(value: string): boolean
```

Determines whether a string contains only hexadecimal values

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `value` | `string` |  |

#### Returns

`boolean`

true if the string is the hexa representation of a number

***

### isValidJSON()

```ts
static isValidJSON(arg: string): boolean | object
```

Test if an argument is a valid JSON object. If it is, returns a truthy
value (the json object decoded), so no double JSON.parse call is necessary

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `arg` | `string` |  |

#### Returns

`boolean` \| `object`

false if the argument is not a JSON string.

***

### cloneArray()

```ts
static cloneArray<T>(array: T[]): T[]
```

#### Type Parameters

| Type Parameter |
| ------ |
| `T` |

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `array` | `T`[] |

#### Returns

`T`[]

***

### isNaturalNumber()

```ts
static isNaturalNumber(value: number): boolean
```

Checks that a value is a natural number.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `value` | `number` |  |

#### Returns

`boolean`

true if a positive integer or zero.

***

### isNaturalBigInt()

```ts
static isNaturalBigInt(value: bigint): boolean
```

Checks that a value is a natural number.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `value` | `bigint` |  |

#### Returns

`boolean`

true if a positive integer or zero.
