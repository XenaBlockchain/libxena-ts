[**libnexa-ts**](../index.md)

***

[libnexa-ts](../index.md) / PublicKeyTemplateInput

# Class: PublicKeyTemplateInput

Represents a special kind of input of PayToPublicKeyTemplate kind.

## Extends

- [`Input`](Input.md)

## Constructors

### new PublicKeyTemplateInput()

```ts
new PublicKeyTemplateInput(params?: IInput): PublicKeyTemplateInput
```

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `params`? | [`IInput`](../interfaces/IInput.md) |

#### Returns

[`PublicKeyTemplateInput`](PublicKeyTemplateInput.md)

#### Inherited from

[`Input`](Input.md).[`constructor`](Input.md#constructors)

## Properties

| Property | Modifier | Type | Default value | Inherited from |
| ------ | ------ | ------ | ------ | ------ |
| <a id="sequence_final"></a> `SEQUENCE_FINAL` | `readonly` | `4294967295` | `0xffffffff` | [`Input`](Input.md).[`SEQUENCE_FINAL`](Input.md#sequence_final) |
| <a id="script_size"></a> `SCRIPT_SIZE` | `readonly` | `100` | `100` | - |
| <a id="type"></a> `type` | `public` | [`InputType`](../enumerations/InputType.md) | `undefined` | [`Input`](Input.md).[`type`](Input.md#type) |
| <a id="outpoint"></a> `outpoint` | `public` | `Buffer` | `undefined` | [`Input`](Input.md).[`outpoint`](Input.md#outpoint) |
| <a id="amount"></a> `amount` | `public` | `bigint` | `undefined` | [`Input`](Input.md).[`amount`](Input.md#amount) |
| <a id="sequencenumber"></a> `sequenceNumber` | `public` | `number` | `undefined` | [`Input`](Input.md).[`sequenceNumber`](Input.md#sequencenumber) |
| <a id="output"></a> `output?` | `public` | [`Output`](Output.md) | `undefined` | [`Input`](Input.md).[`output`](Input.md#output) |
| <a id="tojson"></a> `toJSON` | `public` | () => [`IInput`](../interfaces/IInput.md) | `undefined` | [`Input`](Input.md).[`toJSON`](Input.md#tojson) |

## Accessors

### scriptSig

#### Get Signature

```ts
get scriptSig(): Script
```

##### Returns

[`Script`](Script.md)

#### Set Signature

```ts
set scriptSig(script: string | Script): void
```

##### Parameters

| Parameter | Type |
| ------ | ------ |
| `script` | `string` \| [`Script`](Script.md) |

##### Returns

`void`

#### Inherited from

[`Input`](Input.md).[`scriptSig`](Input.md#scriptsig)

## Methods

### fromObject()

```ts
static fromObject(obj: IInput): Input
```

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `obj` | [`IInput`](../interfaces/IInput.md) |

#### Returns

[`Input`](Input.md)

#### Inherited from

[`Input`](Input.md).[`fromObject`](Input.md#fromobject)

***

### fromBufferReader()

```ts
static fromBufferReader(br: BufferReader): Input
```

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `br` | [`BufferReader`](BufferReader.md) |

#### Returns

[`Input`](Input.md)

#### Inherited from

[`Input`](Input.md).[`fromBufferReader`](Input.md#frombufferreader)

***

### toObject()

```ts
toObject(): IInput
```

#### Returns

[`IInput`](../interfaces/IInput.md)

#### Inherited from

[`Input`](Input.md).[`toObject`](Input.md#toobject)

***

### toBufferWriter()

```ts
toBufferWriter(writer?: BufferWriter, includeScript?: boolean): BufferWriter
```

#### Parameters

| Parameter | Type | Default value |
| ------ | ------ | ------ |
| `writer`? | [`BufferWriter`](BufferWriter.md) | `undefined` |
| `includeScript`? | `boolean` | `true` |

#### Returns

[`BufferWriter`](BufferWriter.md)

#### Inherited from

[`Input`](Input.md).[`toBufferWriter`](Input.md#tobufferwriter)

***

### isFinal()

```ts
isFinal(): boolean
```

#### Returns

`boolean`

#### Inherited from

[`Input`](Input.md).[`isFinal`](Input.md#isfinal)

***

### clearSignatures()

```ts
clearSignatures(): this
```

#### Returns

`this`

#### Inherited from

[`Input`](Input.md).[`clearSignatures`](Input.md#clearsignatures)

***

### getSubscript()

```ts
getSubscript(): Script
```

#### Returns

[`Script`](Script.md)

#### Overrides

[`Input`](Input.md).[`getSubscript`](Input.md#getsubscript)

***

### canSign()

```ts
canSign(privateKey: PrivateKey): boolean
```

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `privateKey` | [`PrivateKey`](PrivateKey.md) |

#### Returns

`boolean`

true if the provided private key can sign this input

#### Overrides

[`Input`](Input.md).[`canSign`](Input.md#cansign)

***

### isFullySigned()

```ts
isFullySigned(): boolean
```

#### Returns

`boolean`

#### Overrides

[`Input`](Input.md).[`isFullySigned`](Input.md#isfullysigned)

***

### addSignature()

```ts
addSignature(signature: TxSignature): this
```

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `signature` | [`TxSignature`](TxSignature.md) |

#### Returns

`this`

#### Overrides

[`Input`](Input.md).[`addSignature`](Input.md#addsignature)

***

### estimateSize()

```ts
estimateSize(): number
```

#### Returns

`number`

#### Overrides

[`Input`](Input.md).[`estimateSize`](Input.md#estimatesize)
