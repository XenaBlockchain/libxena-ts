[**libnexa-ts**](../index.md)

***

[libnexa-ts](../index.md) / ScriptTemplateInput

# Class: ScriptTemplateInput

## Extends

- [`Input`](Input.md)

## Constructors

### new ScriptTemplateInput()

```ts
new ScriptTemplateInput(arg: IInput): ScriptTemplateInput
```

Represents a special kind of input of generic ScriptTemplate kind.

WARNING: this is a general case where the signature is similar to p2pkt and added to scriptSig as push signature data.
If you have complex smart contract, consider extending this class (or Input class) and implement the necessary logic,
or sign it manually.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `arg` | [`IInput`](../interfaces/IInput.md) |

#### Returns

[`ScriptTemplateInput`](ScriptTemplateInput.md)

#### Overrides

[`Input`](Input.md).[`constructor`](Input.md#constructors)

## Properties

| Property | Modifier | Type | Default value | Overrides | Inherited from |
| ------ | ------ | ------ | ------ | ------ | ------ |
| <a id="sequence_final"></a> `SEQUENCE_FINAL` | `readonly` | `4294967295` | `0xffffffff` | - | [`Input`](Input.md).[`SEQUENCE_FINAL`](Input.md#sequence_final) |
| <a id="type"></a> `type` | `public` | [`InputType`](../enumerations/InputType.md) | `undefined` | - | [`Input`](Input.md).[`type`](Input.md#type) |
| <a id="outpoint"></a> `outpoint` | `public` | `Buffer` | `undefined` | - | [`Input`](Input.md).[`outpoint`](Input.md#outpoint) |
| <a id="amount"></a> `amount` | `public` | `bigint` | `undefined` | - | [`Input`](Input.md).[`amount`](Input.md#amount) |
| <a id="sequencenumber"></a> `sequenceNumber` | `public` | `number` | `undefined` | - | [`Input`](Input.md).[`sequenceNumber`](Input.md#sequencenumber) |
| <a id="output"></a> `output?` | `public` | [`Output`](Output.md) | `undefined` | - | [`Input`](Input.md).[`output`](Input.md#output) |
| <a id="templatescript"></a> `templateScript` | `public` | [`Script`](Script.md) | `undefined` | - | - |
| <a id="constraintscript"></a> `constraintScript` | `public` | [`OP_FALSE`](../enumerations/Opcode.md#op_false) \| [`Script`](Script.md) | `undefined` | - | - |
| <a id="publickey"></a> `publicKey?` | `public` | [`PublicKey`](PublicKey.md) | `undefined` | - | - |
| <a id="tojson"></a> `toJSON` | `public` | () => [`IInput`](../interfaces/IInput.md) | `undefined` | [`Input`](Input.md).[`toJSON`](Input.md#tojson) | - |

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

### fromObject()

```ts
static fromObject(obj: IInput): ScriptTemplateInput
```

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `obj` | [`IInput`](../interfaces/IInput.md) |

#### Returns

[`ScriptTemplateInput`](ScriptTemplateInput.md)

#### Overrides

[`Input`](Input.md).[`fromObject`](Input.md#fromobject)

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

### toObject()

```ts
toObject(): IInput
```

#### Returns

[`IInput`](../interfaces/IInput.md)

#### Overrides

[`Input`](Input.md).[`toObject`](Input.md#toobject)

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

***

### \_estimateScriptSize()

```ts
protected _estimateScriptSize(): number
```

#### Returns

`number`
