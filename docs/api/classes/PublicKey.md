[**libnexa-ts**](../index.md)

***

[libnexa-ts](../index.md) / PublicKey

# Class: PublicKey

Instantiate new PublicKey.

There are two internal properties, `network` and `compressed`, that deal with importing
a PublicKey from a PrivateKey in WIF format.

## Remarks

Better to use [`PublicKey.from`](PublicKey.md#from) method to init public key from various formats if the formart unknown.

## Example

```ts
// export to as a DER hex encoded string
let exported = key.toString();

// import the public key
let imported = PublicKey.fromString(exported);
//or
let imported = PublicKey.from(exported);
```

## Implements

- [`IPublicKey`](../interfaces/IPublicKey.md)

## Constructors

### new PublicKey()

```ts
new PublicKey(data: Partial<IPublicKey>): PublicKey
```

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `data` | `Partial`\<[`IPublicKey`](../interfaces/IPublicKey.md)\> | The pubkey data |

#### Returns

[`PublicKey`](PublicKey.md)

## Properties

| Property | Modifier | Type |
| ------ | ------ | ------ |
| <a id="fromder"></a> `fromDER` | `static` | (`buf`: `Buffer`, `strict`?: `boolean`, `network`?: [`Network`](Network.md)) => [`PublicKey`](PublicKey.md) |
| <a id="fromobject"></a> `fromObject` | `static` | (`data`: [`PublicKeyDto`](../interfaces/PublicKeyDto.md)) => [`PublicKey`](PublicKey.md) |
| <a id="point"></a> `point` | `public` | [`Point`](Point.md) |
| <a id="compressed"></a> `compressed` | `public` | `boolean` |
| <a id="network-2"></a> `network` | `public` | [`Network`](Network.md) |
| <a id="toobject"></a> `toObject` | `public` | () => [`PublicKeyDto`](../interfaces/PublicKeyDto.md) |
| <a id="toder"></a> `toDER` | `public` | () => `Buffer` |

## Methods

### from()

```ts
static from(
   data: PublicKeyVariants, 
   compressed?: boolean, 
   network?: Network): PublicKey
```

Instantiate a PublicKey from various formats

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `data` | [`PublicKeyVariants`](../type-aliases/PublicKeyVariants.md) | The encoded data in various formats |
| `compressed`? | `boolean` | If the public key is compressed |
| `network`? | [`Network`](Network.md) | The key network |

#### Returns

[`PublicKey`](PublicKey.md)

New PublicKey instance

***

### fromBuffer()

```ts
static fromBuffer(
   buf: Buffer, 
   strict?: boolean, 
   network?: Network): PublicKey
```

Instantiate a PublicKey from a Buffer

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `buf` | `Buffer` | A DER hex buffer |
| `strict`? | `boolean` | if set to false, will loosen some conditions |
| `network`? | [`Network`](Network.md) | the network of the key |

#### Returns

[`PublicKey`](PublicKey.md)

A new valid instance of PublicKey

***

### fromPoint()

```ts
static fromPoint(
   point: Point, 
   compressed?: boolean, 
   network?: Network): PublicKey
```

Instantiate a PublicKey from a Point

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `point` | [`Point`](Point.md) | A Point instance |
| `compressed`? | `boolean` | whether to store this public key as compressed format |
| `network`? | [`Network`](Network.md) | the network of the key |

#### Returns

[`PublicKey`](PublicKey.md)

A new valid instance of PublicKey

***

### fromString()

```ts
static fromString(
   str: string, 
   encoding?: BufferEncoding, 
   network?: Network): PublicKey
```

Instantiate a PublicKey from a DER hex encoded string

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `str` | `string` | A DER hex string |
| `encoding`? | `BufferEncoding` | The type of string encoding |
| `network`? | [`Network`](Network.md) | the network of the key |

#### Returns

[`PublicKey`](PublicKey.md)

A new valid instance of PublicKey

***

### fromPrivateKey()

```ts
static fromPrivateKey(data: IPrivateKey): PublicKey
```

Instantiate a PublicKey from PrivateKey data

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `data` | [`IPrivateKey`](../interfaces/IPrivateKey.md) | Object contains data of PrivateKey |

#### Returns

[`PublicKey`](PublicKey.md)

A new valid instance of PublicKey

***

### fromJSON()

```ts
static fromJSON(data: PublicKeyDto): PublicKey
```

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `data` | [`PublicKeyDto`](../interfaces/PublicKeyDto.md) |

#### Returns

[`PublicKey`](PublicKey.md)

***

### getValidationError()

```ts
static getValidationError(data: PublicKeyVariants): undefined | Error
```

Check if there would be any errors when initializing a PublicKey

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `data` | [`PublicKeyVariants`](../type-aliases/PublicKeyVariants.md) | The encoded data in various formats |

#### Returns

`undefined` \| `Error`

An error if exists

***

### isValid()

```ts
static isValid(data: PublicKeyVariants): boolean
```

Check if the parameters are valid

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `data` | [`PublicKeyVariants`](../type-aliases/PublicKeyVariants.md) | The encoded data in various formats |

#### Returns

`boolean`

true If the public key would be valid

***

### toJSON()

```ts
toJSON(): PublicKeyDto
```

#### Returns

[`PublicKeyDto`](../interfaces/PublicKeyDto.md)

A plain object of the PublicKey

#### Implementation of

[`IPublicKey`](../interfaces/IPublicKey.md).[`toJSON`](../interfaces/IPublicKey.md#tojson)

***

### toBuffer()

```ts
toBuffer(): Buffer
```

Will output the PublicKey to a DER Buffer

#### Returns

`Buffer`

A DER hex encoded buffer

#### Implementation of

[`IPublicKey`](../interfaces/IPublicKey.md).[`toBuffer`](../interfaces/IPublicKey.md#tobuffer)

***

### toString()

```ts
toString(): string
```

Will output the PublicKey to a DER encoded hex string

#### Returns

`string`

A DER hex encoded string

#### Implementation of

[`IPublicKey`](../interfaces/IPublicKey.md).[`toString`](../interfaces/IPublicKey.md#tostring)

***

### inspect()

```ts
inspect(): string
```

Will return a string formatted for the console

#### Returns

`string`

Public key string inspection

#### Implementation of

[`IPublicKey`](../interfaces/IPublicKey.md).[`inspect`](../interfaces/IPublicKey.md#inspect)
