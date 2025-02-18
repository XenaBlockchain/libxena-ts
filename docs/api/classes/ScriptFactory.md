[**libnexa-ts**](../index.md)

***

[libnexa-ts](../index.md) / ScriptFactory

# Class: ScriptFactory

A factory class for creating scripts with predefined configurations and flags.

## Constructors

### new ScriptFactory()

```ts
new ScriptFactory(): ScriptFactory
```

#### Returns

[`ScriptFactory`](ScriptFactory.md)

## Methods

### buildScriptTemplateOut()

```ts
static buildScriptTemplateOut(
   to: string | PublicKey | Address, 
   groupId?: string | Buffer<ArrayBufferLike> | Address, 
   groupAmount?: bigint | Buffer<ArrayBufferLike>): Script
```

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `to` | `string` \| [`PublicKey`](PublicKey.md) \| [`Address`](Address.md) | destination address or public key |
| `groupId`? | `string` \| `Buffer`\<`ArrayBufferLike`\> \| [`Address`](Address.md) | group id buffer or group address or hex id - only if its token output script |
| `groupAmount`? | `bigint` \| `Buffer`\<`ArrayBufferLike`\> | optional. quantity amount buffer or bigint - only if its token output script |

#### Returns

[`Script`](Script.md)

a new pay to public key / script template output for the given address or public key

***

### buildDataOut()

```ts
static buildDataOut(data?: string | Buffer<ArrayBufferLike> | Script, encoding?: BufferEncoding): Script
```

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `data`? | `string` \| `Buffer`\<`ArrayBufferLike`\> \| [`Script`](Script.md) | the data to embed in the output |
| `encoding`? | `BufferEncoding` | the type of encoding of the string |

#### Returns

[`Script`](Script.md)

a new OP_RETURN script with data

***

### buildOutFromAddress()

```ts
static buildOutFromAddress(
   address: string | Address, 
   groupId?: string | Buffer<ArrayBufferLike> | Address, 
   groupAmount?: bigint | Buffer<ArrayBufferLike>): Script
```

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `address` | `string` \| [`Address`](Address.md) | the pay to address |
| `groupId`? | `string` \| `Buffer`\<`ArrayBufferLike`\> \| [`Address`](Address.md) | optional. only for p2st addresses |
| `groupAmount`? | `bigint` \| `Buffer`\<`ArrayBufferLike`\> | optional. only for p2st addresses |

#### Returns

[`Script`](Script.md)

an output script built from the address

***

### buildScriptTemplateIn()

```ts
static buildScriptTemplateIn(
   template: Opcode | Script, 
   constraint: Opcode | Script, 
   satisfier: Buffer<ArrayBufferLike> | Script): Script
```

Builds a scriptSig (a script for an input) that signs a script template
output script.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `template` | [`Opcode`](../enumerations/Opcode.md) \| [`Script`](Script.md) | the template script or OP_1 for well-known |
| `constraint` | [`Opcode`](../enumerations/Opcode.md) \| [`Script`](Script.md) | the constraint script or OP_FALSE |
| `satisfier` | `Buffer`\<`ArrayBufferLike`\> \| [`Script`](Script.md) | the satisfier script or buffer |

#### Returns

[`Script`](Script.md)

***

### buildPublicKeyHashOut()

```ts
static buildPublicKeyHashOut(to: string | PublicKey | Address): Script
```

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `to` | `string` \| [`PublicKey`](PublicKey.md) \| [`Address`](Address.md) | destination address or public key |

#### Returns

[`Script`](Script.md)

a new pay to public key hash output for the given
address or public key

***

### buildPublicKeyHashIn()

```ts
static buildPublicKeyHashIn(publicKey: PublicKey, signature: Buffer<ArrayBufferLike> | Signature): Script
```

Builds a scriptSig (a script for an input) that signs a public key hash
output script. (SIGHASH_ALL only)

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `publicKey` | [`PublicKey`](PublicKey.md) |  |
| `signature` | `Buffer`\<`ArrayBufferLike`\> \| [`Signature`](Signature.md) | a Signature object, or the signature in DER canonical encoding |

#### Returns

[`Script`](Script.md)

***

### buildTokenDescriptionLegacy()

```ts
static buildTokenDescriptionLegacy(
   ticker: string, 
   name: string, 
   docUrl?: string, 
   docHash?: string, 
   decimals?: number): Script
```

Build OP_RETURN output script for Legacy Token Description

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `ticker` | `string` | the ticker as utf8. |
| `name` | `string` | the ticker as utf8. |
| `docUrl`? | `string` | optional. the description document url |
| `docHash`? | `string` | optional. the document hash hex. |
| `decimals`? | `number` | optional. the decimals for the token amount. |

#### Returns

[`Script`](Script.md)

the output OP_RETURN script

#### Throws

Error if docUrl provided and is invalid

***

### buildTokenDescription()

```ts
static buildTokenDescription(
   ticker: string, 
   name: string, 
   zipURL: string, 
   zipHash: string, 
   decimals: number): Script
```

Build OP_RETURN output script for NRC1 Token Description

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `ticker` | `string` | the ticker as utf8. |
| `name` | `string` | the ticker as utf8. |
| `zipURL` | `string` | the zip file url. |
| `zipHash` | `string` | the zip file hash hex. |
| `decimals` | `number` | the decimals for the token amount. |

#### Returns

[`Script`](Script.md)

the output OP_RETURN script

#### Throws

Error if zipURL invalid

***

### buildNFTCollectionDescription()

```ts
static buildNFTCollectionDescription(
   ticker: string, 
   name: string, 
   zipURL: string, 
   zipHash: string): Script
```

Build OP_RETURN output script for an NFT Collection Description (NRC2)

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `ticker` | `string` | the ticker as utf8. |
| `name` | `string` | the ticker as utf8. |
| `zipURL` | `string` | the zip file url. |
| `zipHash` | `string` | the zip file hash hex. |

#### Returns

[`Script`](Script.md)

the output OP_RETURN script

#### Throws

Error if zipURL invalid

***

### buildNFTDescription()

```ts
static buildNFTDescription(zipURL: string, zipHash: string): Script
```

Build OP_RETURN output script for an NFT that belongs to an NFT Collection (NRC3)

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `zipURL` | `string` | the zip file url. |
| `zipHash` | `string` | the zip file hash hex. |

#### Returns

[`Script`](Script.md)

the output OP_RETURN script

#### Throws

Error if zipURL invalid
