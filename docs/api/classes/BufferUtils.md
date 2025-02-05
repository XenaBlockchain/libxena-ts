[**libnexa-ts**](../index.md)

***

[libnexa-ts](../index.md) / BufferUtils

# Class: BufferUtils

## Constructors

### new BufferUtils()

```ts
new BufferUtils(): BufferUtils
```

#### Returns

[`BufferUtils`](BufferUtils.md)

## Methods

### ~~fill()~~

```ts
static fill(buffer: Buffer, value: number): Buffer
```

Fill a buffer with a value.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `buffer` | `Buffer` |  |
| `value` | `number` |  |

#### Returns

`Buffer`

filled buffer

#### Deprecated

use `buffer.fill(value)`

***

### ~~copy()~~

```ts
static copy(original: Buffer): Buffer
```

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `original` | `Buffer` | buffer |

#### Returns

`Buffer`

Return a copy of a buffer

#### Deprecated

use `Buffer.from(original) or Buffer.copyBytesFrom(original)`

***

### isBuffer()

```ts
static isBuffer(arg: unknown): arg is Buffer
```

Tests for both node's Buffer and Uint8Array

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `arg` | `unknown` |  |

#### Returns

`arg is Buffer`

Returns true if the given argument is an instance of a buffer.

***

### isHashBuffer()

```ts
static isHashBuffer(arg: unknown): boolean
```

Tests for both node's Buffer and Uint8Array

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `arg` | `unknown` |  |

#### Returns

`boolean`

Returns true if the given argument is an instance of a hash160 or hash256 buffer.

***

### ~~emptyBuffer()~~

```ts
static emptyBuffer(length: number): Buffer
```

Returns a zero-filled byte array

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `length` | `number` |  |

#### Returns

`Buffer`

#### Deprecated

use `Buffer.alloc(length)`

***

### reverse()

```ts
static reverse(param: Buffer): Buffer
```

Reverse a buffer

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `param` | `Buffer` |  |

#### Returns

`Buffer`

new reversed buffer

***

### bufferToHex()

```ts
static bufferToHex(buffer: Buffer): string
```

Transforms a buffer into a string with a number in hexa representation

Shorthand for <tt>buffer.toString('hex')</tt>

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `buffer` | `Buffer` |  |

#### Returns

`string`

string

***

### integerAsSingleByteBuffer()

```ts
static integerAsSingleByteBuffer(integer: number): Buffer
```

Transforms a number from 0 to 255 into a Buffer of size 1 with that value

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `integer` | `number` |  |

#### Returns

`Buffer`

Buffer

***

### integerFromSingleByteBuffer()

```ts
static integerFromSingleByteBuffer(buffer: Buffer): number
```

Transforms the first byte of an array into a number ranging from -128 to 127

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `buffer` | `Buffer` |  |

#### Returns

`number`

number

***

### integerAsBuffer()

```ts
static integerAsBuffer(integer: number): Buffer
```

Transform a 4-byte integer into a Buffer of length 4.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `integer` | `number` |  |

#### Returns

`Buffer`

Buffer

***

### integerFromBuffer()

```ts
static integerFromBuffer(buffer: Buffer): number
```

Transform the first 4 values of a Buffer into a number, in little endian encoding

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `buffer` | `Buffer` |  |

#### Returns

`number`

integer

***

### getRandomBuffer()

```ts
static getRandomBuffer(size: number): Buffer
```

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `size` | `number` |

#### Returns

`Buffer`
