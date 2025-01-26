[**libnexa-ts**](../index.md)

***

[libnexa-ts](../index.md) / Input

# Class: Input

## Extended by

- [`PublicKeyTemplateInput`](PublicKeyTemplateInput.md)
- [`ScriptTemplateInput`](ScriptTemplateInput.md)
- [`PublicKeyHashInput`](PublicKeyHashInput.md)

## Implements

- [`IInput`](../interfaces/IInput.md)

## Constructors

### new Input()

```ts
new Input(params?: IInput): Input
```

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `params`? | [`IInput`](../interfaces/IInput.md) |

#### Returns

[`Input`](Input.md)

## Properties

| Property | Modifier | Type | Default value |
| ------ | ------ | ------ | ------ |
| <a id="sequence_final"></a> `SEQUENCE_FINAL` | `readonly` | `4294967295` | `0xffffffff` |
| <a id="type"></a> `type` | `public` | [`InputType`](../enumerations/InputType.md) | `undefined` |
| <a id="outpoint"></a> `outpoint` | `public` | `Buffer` | `undefined` |
| <a id="amount"></a> `amount` | `public` | `bigint` | `undefined` |
| <a id="sequencenumber"></a> `sequenceNumber` | `public` | `number` | `undefined` |
| <a id="output"></a> `output?` | `public` | [`Output`](Output.md) | `undefined` |
| <a id="tojson"></a> `toJSON` | `public` | () => [`IInput`](../interfaces/IInput.md) | `undefined` |

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

#### Implementation of

[`IInput`](../interfaces/IInput.md).[`scriptSig`](../interfaces/IInput.md#scriptsig)

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

***

### toObject()

```ts
toObject(): IInput
```

#### Returns

[`IInput`](../interfaces/IInput.md)

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

***

### estimateSize()

```ts
estimateSize(): number
```

#### Returns

`number`

***

### isFinal()

```ts
isFinal(): boolean
```

#### Returns

`boolean`

***

### clearSignatures()

```ts
clearSignatures(): this
```

#### Returns

`this`

***

### getSubscript()

```ts
getSubscript(): Script
```

#### Returns

[`Script`](Script.md)

***

### canSign()

```ts
canSign(_privateKey: PrivateKey): boolean
```

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `_privateKey` | [`PrivateKey`](PrivateKey.md) |

#### Returns

`boolean`

true if the provided private key can sign this input

***

### isFullySigned()

```ts
isFullySigned(): boolean
```

#### Returns

`boolean`

***

### addSignature()

```ts
addSignature(_signature: TxSignature): this
```

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `_signature` | [`TxSignature`](TxSignature.md) |

#### Returns

`this`
