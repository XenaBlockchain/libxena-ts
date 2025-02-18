[**libnexa-ts**](../index.md)

***

[libnexa-ts](../index.md) / HDPrivateKey

# Class: HDPrivateKey

## Implements

- [`IHDPrivateKey`](../interfaces/IHDPrivateKey.md)

## Constructors

### new HDPrivateKey()

```ts
new HDPrivateKey(arg?: 
  | Buffer<ArrayBufferLike>
  | Networkish
  | IHDPrivateKey
  | HDPrivateKeyDto
  | HDPrivateKeyMinimalDto): HDPrivateKey
```

Represents an instance of an hierarchically derived private key.

More info on https://github.com/bitcoin/bips/blob/master/bip-0032.mediawiki

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `arg`? | \| `Buffer`\<`ArrayBufferLike`\> \| [`Networkish`](../type-aliases/Networkish.md) \| [`IHDPrivateKey`](../interfaces/IHDPrivateKey.md) \| [`HDPrivateKeyDto`](../interfaces/HDPrivateKeyDto.md) \| [`HDPrivateKeyMinimalDto`](../type-aliases/HDPrivateKeyMinimalDto.md) |

#### Returns

[`HDPrivateKey`](HDPrivateKey.md)

## Properties

| Property | Modifier | Type |
| ------ | ------ | ------ |
| <a id="privatekey"></a> `privateKey` | `readonly` | [`PrivateKey`](PrivateKey.md) |
| <a id="publickey"></a> `publicKey` | `readonly` | [`PublicKey`](PublicKey.md) |
| <a id="network"></a> `network` | `readonly` | [`Network`](Network.md) |
| <a id="depth"></a> `depth` | `readonly` | `number` |
| <a id="parentfingerprint"></a> `parentFingerPrint` | `readonly` | `Buffer` |
| <a id="fingerprint"></a> `fingerPrint` | `readonly` | `Buffer` |
| <a id="chaincode"></a> `chainCode` | `readonly` | `Buffer` |
| <a id="childindex"></a> `childIndex` | `readonly` | `number` |
| <a id="checksum"></a> `checksum` | `readonly` | `Buffer` |
| <a id="xprivkey"></a> `xprivkey` | `readonly` | `string` |
| <a id="tojson"></a> `toJSON` | `public` | () => [`HDPrivateKeyDto`](../interfaces/HDPrivateKeyDto.md) |

## Accessors

### hdPublicKey

#### Get Signature

```ts
get hdPublicKey(): HDPublicKey
```

##### Returns

[`HDPublicKey`](HDPublicKey.md)

***

### xpubkey

#### Get Signature

```ts
get xpubkey(): string
```

##### Returns

`string`

## Methods

### isValidPath()

```ts
static isValidPath(arg: string | number, hardened?: boolean): boolean
```

Verifies that a given path is valid.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `arg` | `string` \| `number` |  |
| `hardened`? | `boolean` |  |

#### Returns

`boolean`

***

### fromString()

```ts
static fromString(xprivkey: string): HDPrivateKey
```

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `xprivkey` | `string` |

#### Returns

[`HDPrivateKey`](HDPrivateKey.md)

***

### fromBuffer()

```ts
static fromBuffer(buf: Buffer): HDPrivateKey
```

Build a HDPrivateKey from a buffer

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `buf` | `Buffer` |  |

#### Returns

[`HDPrivateKey`](HDPrivateKey.md)

***

### fromObject()

```ts
static fromObject(arg: HDPrivateKeyDto): HDPrivateKey
```

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `arg` | [`HDPrivateKeyDto`](../interfaces/HDPrivateKeyDto.md) |

#### Returns

[`HDPrivateKey`](HDPrivateKey.md)

***

### fromMinimalObject()

```ts
static fromMinimalObject(arg: HDPrivateKeyMinimalDto): HDPrivateKey
```

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `arg` | [`HDPrivateKeyMinimalDto`](../type-aliases/HDPrivateKeyMinimalDto.md) |

#### Returns

[`HDPrivateKey`](HDPrivateKey.md)

***

### fromSeed()

```ts
static fromSeed(seed: string | Buffer<ArrayBufferLike>, network: Networkish): HDPrivateKey
```

Generate a private key from a seed, as described in BIP32

#### Parameters

| Parameter | Type | Default value | Description |
| ------ | ------ | ------ | ------ |
| `seed` | `string` \| `Buffer`\<`ArrayBufferLike`\> | `undefined` |  |
| `network` | [`Networkish`](../type-aliases/Networkish.md) | `networks.defaultNetwork` |  |

#### Returns

[`HDPrivateKey`](HDPrivateKey.md)

HDPrivateKey

***

### toString()

```ts
toString(): string
```

Returns the string representation of this private key (ext privkey).

#### Returns

`string`

***

### toBuffer()

```ts
toBuffer(): Buffer
```

Returns a buffer representation of the HDPrivateKey

#### Returns

`Buffer`

***

### toObject()

```ts
toObject(): HDPrivateKeyDto
```

Returns a plain object with a representation of this private key.

#### Returns

[`HDPrivateKeyDto`](../interfaces/HDPrivateKeyDto.md)

***

### deriveChild()

```ts
deriveChild(arg: string | number, hardened?: boolean): HDPrivateKey
```

Get a derived child based on a string or number.

If the first argument is a string, it's parsed as the full path of
derivation. Valid values for this argument include "m" (which returns the
same private key), "m/0/1/40/2'/1000", where the ' quote means a hardened
derivation.

If the first argument is a number, the child with that index will be
derived. If the second argument is truthy, the hardened version will be
derived. See the example usage for clarification.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `arg` | `string` \| `number` |  |
| `hardened`? | `boolean` |  |

#### Returns

[`HDPrivateKey`](HDPrivateKey.md)

HDPrivateKey

#### Example

```javascript
let parent = new HDPrivateKey('xprv...');
let child_0_1_2h = parent.deriveChild(0).deriveChild(1).deriveChild(2, true);
let copy_of_child_0_1_2h = parent.deriveChild("m/0/1/2'");
assert(child_0_1_2h.xprivkey === copy_of_child_0_1_2h.xprivkey);
```

***

### getHDPublicKey()

```ts
getHDPublicKey(): HDPublicKey
```

Will return the corresponding hd public key

#### Returns

[`HDPublicKey`](HDPublicKey.md)

An extended public key generated from the hd private key

***

### inspect()

```ts
inspect(): string
```

Returns the console representation of this extended private key.

#### Returns

`string`
