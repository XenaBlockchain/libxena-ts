[**libnexa-ts**](../index.md)

***

[libnexa-ts](../index.md) / Address

# Class: Address

## Constructors

### new Address()

```ts
new Address(
   data: string | Buffer | Address, 
   network?: Networkish, 
   type?: AddressType): Address
```

Instantiate an address from an address String or Buffer, a public key or script hash Buffer,
or an instance of [PublicKey](PublicKey.md) or [Script](Script.md).

This is an immutable class, and if the first parameter provided to this constructor is an
`Address` instance, the same argument will be returned.

An address has two key properties: `network` and `type`. The type is either
`AddressType.PayToPublicKeyHash` (value is the `'P2PKH'` string)
or `AddressType.PayToScriptTemplate` (the string `'P2ST'`). The network is an instance of [Network](Network.md) or network name.
You can quickly check whether an address is of a given kind by using the methods
`isPayToPublicKeyHash` and `isPayToScriptTemplate`

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `data` | `string` \| `Buffer` \| [`Address`](Address.md) | The encoded data in various formats |
| `network`? | [`Networkish`](../type-aliases/Networkish.md) | The network: 'mainnet' (default) or 'testnet' |
| `type`? | [`AddressType`](../enumerations/AddressType.md) | The type of address: 'P2ST' (default) or 'P2PKH' or 'GROUP' |

#### Returns

[`Address`](Address.md)

A new valid and frozen instance of an Address

#### Example

```javascript
// validate that an input field is valid
let error = Address.getValidationError(input, 'testnet');
if (!error) {
  let address = new Address(input, 'testnet');
} else {
  // invalid network or checksum (typo?)
  let message = error.messsage;
}

// get an address from a public key
let address = Address.fromPublicKey(publicKey, 'testnet').toString();
```

## Properties

| Property | Modifier | Type | Description |
| ------ | ------ | ------ | ------ |
| <a id="decodenexaaddress"></a> ~~`decodeNexaAddress`~~ | `static` | (`address`: `string`) => [`Address`](Address.md) | **Deprecated** use fromString |
| <a id="data-1"></a> `data` | `readonly` | `Buffer` | - |
| <a id="network-1"></a> `network` | `readonly` | [`Network`](Network.md) | - |
| <a id="type-1"></a> `type` | `readonly` | [`AddressType`](../enumerations/AddressType.md) | - |
| <a id="tonexaaddress"></a> ~~`toNexaAddress`~~ | `public` | () => `string` | **Deprecated** use toString |
| <a id="toobject"></a> `toObject` | `public` | () => [`AddressDto`](../interfaces/AddressDto.md) | - |

## Accessors

### hashBuffer

#### Get Signature

```ts
get hashBuffer(): Buffer
```

##### Deprecated

use data

##### Returns

`Buffer`

## Methods

### validateParams()

```ts
static validateParams(network?: Networkish, type?: AddressType): void
```

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `network`? | [`Networkish`](../type-aliases/Networkish.md) |
| `type`? | [`AddressType`](../enumerations/AddressType.md) |

#### Returns

`void`

***

### fromString()

```ts
static fromString(address: string): Address
```

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `address` | `string` | string |

#### Returns

[`Address`](Address.md)

A new valid and frozen instance of an Address

***

### fromObject()

```ts
static fromObject(obj: AddressDto): Address
```

Instantiate an address from an Object

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `obj` | [`AddressDto`](../interfaces/AddressDto.md) | A JSON object with keys: data, network and type |

#### Returns

[`Address`](Address.md)

A new valid instance of an Address

***

### getValidationError()

```ts
static getValidationError(
   data: string | Buffer, 
   network?: Networkish, 
   type?: AddressType): undefined | Error
```

Will return a validation error if exists

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `data` | `string` \| `Buffer` | The encoded data |
| `network`? | [`Networkish`](../type-aliases/Networkish.md) | either a Network instance, 'mainnet', or 'testnet' |
| `type`? | [`AddressType`](../enumerations/AddressType.md) | The type of address: 'P2ST' or 'GROUP' or 'P2PKH' |

#### Returns

`undefined` \| `Error`

The corresponding error message

#### Example

```javascript
// a network mismatch error
let error = Address.getValidationError('nexatest:nqtsq5g567x44x5g54t2wsxz60zwqmyks63rkrddl4stwnzu', 'testnet');
```

***

### isValid()

```ts
static isValid(
   data: string | Buffer, 
   network?: Networkish, 
   type?: AddressType): boolean
```

Will return a boolean if an address is valid

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `data` | `string` \| `Buffer` | The encoded data |
| `network`? | [`Networkish`](../type-aliases/Networkish.md) | either a Network instance, 'mainnet', or 'testnet' |
| `type`? | [`AddressType`](../enumerations/AddressType.md) | The type of address: 'P2ST' or 'GROUP' or 'P2PKH' |

#### Returns

`boolean`

true if valid

#### Example

```javascript
assert(Address.isValid('nexa:nqtsq5g567x44x5g54t2wsxz60zwqmyks63rkrddsfq94pd2', 'mainned'));
```

***

### fromPublicKey()

```ts
static fromPublicKey(
   pubkey: PublicKey, 
   network?: Networkish, 
   type?: AddressType): Address
```

Instantiate an address from a PublicKey instance

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `pubkey` | [`PublicKey`](PublicKey.md) | the public key instance |
| `network`? | [`Networkish`](../type-aliases/Networkish.md) | either a Network instance, 'mainnet' or 'testnet' |
| `type`? | [`AddressType`](../enumerations/AddressType.md) | address encoding type |

#### Returns

[`Address`](Address.md)

A new valid and frozen instance of an Address

***

### fromScriptTemplate()

```ts
static fromScriptTemplate(
   templateHash: Buffer | Opcode, 
   constraintHash: Buffer | Opcode, 
   visibleArgs?: 
  | string
  | Script
  | ScriptElement[], 
   network?: Networkish): Address
```

Instantiate an address from a non grouped script template

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `templateHash` | `Buffer` \| [`Opcode`](../enumerations/Opcode.md) | An instance of a template hash Buffer |
| `constraintHash` | `Buffer` \| [`Opcode`](../enumerations/Opcode.md) | An instance of a constraint hash Buffer |
| `visibleArgs`? | \| `string` \| [`Script`](Script.md) \| [`ScriptElement`](../type-aliases/ScriptElement.md)[] | An array of push-only args, or hex string represent script buffer, or Script with push args |
| `network`? | [`Networkish`](../type-aliases/Networkish.md) | either a Network instance, 'mainnet' or 'testnet' |

#### Returns

[`Address`](Address.md)

A new valid and frozen instance of an Address

***

### getOutputType()

```ts
static getOutputType(address: string): number
```

Will return the transaction output type by the address type

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `address` | `string` | as string |

#### Returns

`number`

1 - Template, 0 - otherwise

***

### toString()

```ts
toString(): string
```

Will return a cashaddr representation of the address. Always return lower case
Can be converted by the caller to uppercase is needed (still valid).

#### Returns

`string`

Nexa address

***

### inspect()

```ts
inspect(): string
```

Will return a string formatted for the console

#### Returns

`string`

Bitcoin address

***

### toJSON()

```ts
toJSON(): AddressDto
```

#### Returns

[`AddressDto`](../interfaces/AddressDto.md)

A plain object with the address information

***

### isPayToPublicKeyHash()

```ts
isPayToPublicKeyHash(): boolean
```

#### Returns

`boolean`

true if an address is of pay to public key hash type

***

### isPayToScriptTemplate()

```ts
isPayToScriptTemplate(): boolean
```

#### Returns

`boolean`

true if an address is of pay to script template type

***

### isGroupIdentifierAddress()

```ts
isGroupIdentifierAddress(): boolean
```

#### Returns

`boolean`

true if an address is of pay to grouped template type

***

### getOutputType()

```ts
getOutputType(): number
```

Will return the transaction output type by the address type

#### Returns

`number`

1 - Template, 0 - otherwise
