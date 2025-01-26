[**libnexa-ts**](../index.md)

***

[libnexa-ts](../index.md) / HDPublicKey

# Class: HDPublicKey

## Implements

- [`IHDPublicKey`](../interfaces/IHDPublicKey.md)

## Constructors

### new HDPublicKey()

```ts
new HDPublicKey(arg: 
  | string
  | Buffer
  | IHDPrivateKey
  | IHDPublicKey
  | HDPublicKeyDto
  | HDPublicKeyMinimalDto): HDPublicKey
```

The representation of an hierarchically derived public key.

See https://github.com/bitcoin/bips/blob/master/bip-0032.mediawiki

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `arg` | \| `string` \| `Buffer` \| [`IHDPrivateKey`](../interfaces/IHDPrivateKey.md) \| [`IHDPublicKey`](../interfaces/IHDPublicKey.md) \| [`HDPublicKeyDto`](../interfaces/HDPublicKeyDto.md) \| [`HDPublicKeyMinimalDto`](../type-aliases/HDPublicKeyMinimalDto.md) |  |

#### Returns

[`HDPublicKey`](HDPublicKey.md)

## Properties

| Property | Modifier | Type |
| ------ | ------ | ------ |
| <a id="publickey"></a> `publicKey` | `readonly` | [`IPublicKey`](../interfaces/IPublicKey.md) |
| <a id="network"></a> `network` | `readonly` | [`Network`](Network.md) |
| <a id="depth"></a> `depth` | `readonly` | `number` |
| <a id="parentfingerprint"></a> `parentFingerPrint` | `readonly` | `Buffer` |
| <a id="fingerprint"></a> `fingerPrint` | `readonly` | `Buffer` |
| <a id="chaincode"></a> `chainCode` | `readonly` | `Buffer` |
| <a id="childindex"></a> `childIndex` | `readonly` | `number` |
| <a id="checksum"></a> `checksum` | `readonly` | `Buffer` |
| <a id="xpubkey"></a> `xpubkey` | `readonly` | `string` |
| <a id="tojson"></a> `toJSON` | `public` | () => [`HDPublicKeyDto`](../interfaces/HDPublicKeyDto.md) |

## Methods

### isValidPath()

```ts
static isValidPath(arg: string | number): boolean
```

Verifies that a given path is valid.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `arg` | `string` \| `number` |  |

#### Returns

`boolean`

***

### fromBuffer()

```ts
static fromBuffer(buf: Buffer): HDPublicKey
```

Create a HDPublicKey from a buffer argument

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `buf` | `Buffer` |  |

#### Returns

[`HDPublicKey`](HDPublicKey.md)

***

### fromString()

```ts
static fromString(xpubkey: string): HDPublicKey
```

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `xpubkey` | `string` |

#### Returns

[`HDPublicKey`](HDPublicKey.md)

***

### fromObject()

```ts
static fromObject(arg: HDPublicKeyDto): HDPublicKey
```

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `arg` | [`HDPublicKeyDto`](../interfaces/HDPublicKeyDto.md) |

#### Returns

[`HDPublicKey`](HDPublicKey.md)

***

### fromMinimalObject()

```ts
static fromMinimalObject(arg: HDPublicKeyMinimalDto): HDPublicKey
```

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `arg` | [`HDPublicKeyMinimalDto`](../type-aliases/HDPublicKeyMinimalDto.md) |

#### Returns

[`HDPublicKey`](HDPublicKey.md)

***

### toBuffer()

```ts
toBuffer(): Buffer
```

Return a buffer representation of the xpubkey

#### Returns

`Buffer`

***

### toString()

```ts
toString(): string
```

Returns the base58 checked representation of the public key

#### Returns

`string`

a string starting with "xpub..." in livenet

***

### inspect()

```ts
inspect(): string
```

Returns the console representation of this extended public key.

#### Returns

`string`

***

### toObject()

```ts
toObject(): HDPublicKeyDto
```

Returns a plain JavaScript object with information to reconstruct a key.

#### Returns

[`HDPublicKeyDto`](../interfaces/HDPublicKeyDto.md)

***

### deriveChild()

```ts
deriveChild(arg: string | number, hardened?: boolean): HDPublicKey
```

Get a derivated child based on a string or number.

If the first argument is a string, it's parsed as the full path of
derivation. Valid values for this argument include "m" (which returns the
same public key), "m/0/1/40/2/1000".

Note that hardened keys can't be derived from a public extended key.

If the first argument is a number, the child with that index will be
derived. See the example usage for clarification.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `arg` | `string` \| `number` |  |
| `hardened`? | `boolean` | - |

#### Returns

[`HDPublicKey`](HDPublicKey.md)

#### Example

```javascript
let parent = new HDPublicKey('xpub...');
let child_0_1_2 = parent.deriveChild(0).deriveChild(1).deriveChild(2);
let copy_of_child_0_1_2 = parent.deriveChild("m/0/1/2");
assert(child_0_1_2.xpubkey === copy_of_child_0_1_2.xpubkey);
```
