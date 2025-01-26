[**libnexa-ts**](../index.md)

***

[libnexa-ts](../index.md) / Hash

# Class: Hash

## Constructors

### new Hash()

```ts
new Hash(): Hash
```

#### Returns

[`Hash`](Hash.md)

## Methods

### sha1()

```ts
static sha1(buf: Buffer): Buffer
```

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `buf` | `Buffer` |

#### Returns

`Buffer`

***

### sha256()

```ts
static sha256(buf: Buffer): Buffer
```

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `buf` | `Buffer` |

#### Returns

`Buffer`

***

### sha512()

```ts
static sha512(buf: Buffer): Buffer
```

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `buf` | `Buffer` |

#### Returns

`Buffer`

***

### ripemd160()

```ts
static ripemd160(buf: Buffer): Buffer
```

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `buf` | `Buffer` |

#### Returns

`Buffer`

***

### sha256sha256()

```ts
static sha256sha256(buf: Buffer): Buffer
```

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `buf` | `Buffer` |

#### Returns

`Buffer`

***

### sha256ripemd160()

```ts
static sha256ripemd160(buf: Buffer): Buffer
```

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `buf` | `Buffer` |

#### Returns

`Buffer`

***

### sha256hmac()

```ts
static sha256hmac(data: Buffer, key: Buffer): Buffer
```

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `data` | `Buffer` |
| `key` | `Buffer` |

#### Returns

`Buffer`

***

### sha512hmac()

```ts
static sha512hmac(data: Buffer, key: Buffer): Buffer
```

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `data` | `Buffer` |
| `key` | `Buffer` |

#### Returns

`Buffer`
