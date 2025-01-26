[**libnexa-ts**](../index.md)

***

[libnexa-ts](../index.md) / PrivateKey

# Class: PrivateKey

## Implements

- [`IPrivateKey`](../interfaces/IPrivateKey.md)

## Constructors

### new PrivateKey()

```ts
new PrivateKey(data?: Partial<IPrivateKey>): PrivateKey
```

Instantiate a PrivateKey.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `data`? | `Partial`\<[`IPrivateKey`](../interfaces/IPrivateKey.md)\> | The private key data |

#### Returns

[`PrivateKey`](PrivateKey.md)

#### Remarks

Better to use [`PrivateKey.from`](PrivateKey.md#from) method to init private key from various formats if the formart unknown.

#### Example

```ts
// generate a new random key
let key = new PrivateKey();

// encode into wallet import format
let exported = key.toWIF();

// instantiate from the exported (and saved) private key
let imported = PrivateKey.fromWIF(exported);
```

## Properties

| Property | Modifier | Type |
| ------ | ------ | ------ |
| <a id="fromstring"></a> `fromString` | `static` | (`str`: `string`, `network`?: [`Networkish`](../type-aliases/Networkish.md)) => [`PrivateKey`](PrivateKey.md) |
| <a id="fromobject"></a> `fromObject` | `static` | (`obj`: [`PrivateKeyDto`](../interfaces/PrivateKeyDto.md)) => [`PrivateKey`](PrivateKey.md) |
| <a id="bn"></a> `bn` | `public` | [`BNExtended`](BNExtended.md) |
| <a id="compressed"></a> `compressed` | `public` | `boolean` |
| <a id="network-2"></a> `network` | `public` | [`Network`](Network.md) |
| <a id="toobject"></a> `toObject` | `public` | () => [`PrivateKeyDto`](../interfaces/PrivateKeyDto.md) |

## Accessors

### publicKey

#### Get Signature

```ts
get publicKey(): PublicKey
```

##### Returns

[`PublicKey`](PublicKey.md)

#### Implementation of

[`IPrivateKey`](../interfaces/IPrivateKey.md).[`publicKey`](../interfaces/IPrivateKey.md#publickey)

## Methods

### fromBuffer()

```ts
static fromBuffer(buf: Buffer, network?: Networkish): PrivateKey
```

Instantiate a PrivateKey from a Buffer with the DER or WIF representation

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `buf` | `Buffer` |
| `network`? | [`Networkish`](../type-aliases/Networkish.md) |

#### Returns

[`PrivateKey`](PrivateKey.md)

***

### fromWIF()

```ts
static fromWIF(str: string, network?: Networkish): PrivateKey
```

Instantiate a PrivateKey from a WIF string

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `str` | `string` | The WIF encoded private key string |
| `network`? | [`Networkish`](../type-aliases/Networkish.md) | - |

#### Returns

[`PrivateKey`](PrivateKey.md)

A new valid instance of PrivateKey

***

### fromJSON()

```ts
static fromJSON(obj: PrivateKeyDto): PrivateKey
```

Instantiate a PrivateKey from a plain JavaScript object

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `obj` | [`PrivateKeyDto`](../interfaces/PrivateKeyDto.md) | The output from privateKey.toObject() |

#### Returns

[`PrivateKey`](PrivateKey.md)

***

### fromRandom()

```ts
static fromRandom(network?: Networkish): PrivateKey
```

Instantiate a PrivateKey from random bytes

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `network`? | [`Networkish`](../type-aliases/Networkish.md) | Either "mainnet" or "testnet" |

#### Returns

[`PrivateKey`](PrivateKey.md)

A new valid instance of PrivateKey

***

### getValidationError()

```ts
static getValidationError(data: PrivateKeyVariants, network?: Networkish): undefined | Error
```

Check if there would be any errors when initializing a PrivateKey

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `data` | [`PrivateKeyVariants`](../type-aliases/PrivateKeyVariants.md) | The encoded data in various formats |
| `network`? | [`Networkish`](../type-aliases/Networkish.md) | Either "mainnet" or "testnet" |

#### Returns

`undefined` \| `Error`

An error if exists

***

### isValid()

```ts
static isValid(data?: PrivateKeyVariants, network?: Networkish): boolean
```

Check if the parameters are valid

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `data`? | [`PrivateKeyVariants`](../type-aliases/PrivateKeyVariants.md) | The encoded data in various formats |
| `network`? | [`Networkish`](../type-aliases/Networkish.md) | Either "mainnet" or "testnet" |

#### Returns

`boolean`

true If the private key would be valid

***

### from()

```ts
static from(data?: PrivateKeyVariants, network?: Networkish): PrivateKey
```

Helper to instantiate PrivateKey from different kinds of arguments.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `data`? | [`PrivateKeyVariants`](../type-aliases/PrivateKeyVariants.md) |
| `network`? | [`Networkish`](../type-aliases/Networkish.md) |

#### Returns

[`PrivateKey`](PrivateKey.md)

***

### toString()

```ts
toString(): string
```

Will output the PrivateKey encoded as hex string

#### Returns

`string`

#### Implementation of

[`IPrivateKey`](../interfaces/IPrivateKey.md).[`toString`](../interfaces/IPrivateKey.md#tostring)

***

### toWIF()

```ts
toWIF(): string
```

Will encode the PrivateKey to a WIF string

#### Returns

`string`

A WIF representation of the private key

#### Implementation of

[`IPrivateKey`](../interfaces/IPrivateKey.md).[`toWIF`](../interfaces/IPrivateKey.md#towif)

***

### toBigNumber()

```ts
toBigNumber(): BNExtended
```

Will return the private key as a BN instance

#### Returns

[`BNExtended`](BNExtended.md)

A BN instance of the private key

#### Implementation of

[`IPrivateKey`](../interfaces/IPrivateKey.md).[`toBigNumber`](../interfaces/IPrivateKey.md#tobignumber)

***

### toBuffer()

```ts
toBuffer(): Buffer
```

Will return the private key as a BN buffer

#### Returns

`Buffer`

A buffer of the private key

#### Implementation of

[`IPrivateKey`](../interfaces/IPrivateKey.md).[`toBuffer`](../interfaces/IPrivateKey.md#tobuffer)

***

### toBufferNoPadding()

```ts
toBufferNoPadding(): Buffer
```

Will return the private key as a BN buffer without leading zero padding

#### Returns

`Buffer`

A buffer of the private key

#### Implementation of

[`IPrivateKey`](../interfaces/IPrivateKey.md).[`toBufferNoPadding`](../interfaces/IPrivateKey.md#tobuffernopadding)

***

### toPublicKey()

```ts
toPublicKey(): PublicKey
```

Will return the corresponding public key

#### Returns

[`PublicKey`](PublicKey.md)

A public key generated from the private key

#### Implementation of

[`IPrivateKey`](../interfaces/IPrivateKey.md).[`toPublicKey`](../interfaces/IPrivateKey.md#topublickey)

***

### toJSON()

```ts
toJSON(): PrivateKeyDto
```

#### Returns

[`PrivateKeyDto`](../interfaces/PrivateKeyDto.md)

A plain object representation

#### Implementation of

[`IPrivateKey`](../interfaces/IPrivateKey.md).[`toJSON`](../interfaces/IPrivateKey.md#tojson)

***

### inspect()

```ts
inspect(): string
```

Will return a string formatted for the console

#### Returns

`string`

Private key details

#### Implementation of

[`IPrivateKey`](../interfaces/IPrivateKey.md).[`inspect`](../interfaces/IPrivateKey.md#inspect)
