[**libnexa-ts**](../index.md)

***

[libnexa-ts](../index.md) / Script

# Class: Script

A nexa transaction script. Each transaction's inputs and outputs
has a script that is evaluated to validate it's spending.

## See

[https://spec.nexa.org/script/1script/](https://spec.nexa.org/script/1script/)

## Implements

- [`IScript`](../interfaces/IScript.md)

## Constructors

### new Script()

```ts
new Script(from?: string | Buffer | IScript): Script
```

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `from`? | `string` \| `Buffer` \| [`IScript`](../interfaces/IScript.md) |

#### Returns

[`Script`](Script.md)

## Properties

| Property | Modifier | Type |
| ------ | ------ | ------ |
| <a id="chunks"></a> `chunks` | `public` | [`ScriptChunk`](../interfaces/ScriptChunk.md)[] |
| <a id="append"></a> `append` | `public` | (`param`: [`ScriptElement`](../type-aliases/ScriptElement.md)) => `this` |

## Methods

### empty()

```ts
static empty(): Script
```

#### Returns

[`Script`](Script.md)

a new empty script

***

### fromBuffer()

```ts
static fromBuffer(buffer: Buffer): Script
```

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `buffer` | `Buffer` |

#### Returns

[`Script`](Script.md)

***

### fromHex()

```ts
static fromHex(str: string): Script
```

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `str` | `string` |

#### Returns

[`Script`](Script.md)

***

### fromString()

```ts
static fromString(str: string): Script
```

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `str` | `string` |

#### Returns

[`Script`](Script.md)

***

### fromASM()

```ts
static fromASM(str: string): Script
```

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `str` | `string` |

#### Returns

[`Script`](Script.md)

***

### set()

```ts
set(obj: IScript): this
```

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `obj` | [`IScript`](../interfaces/IScript.md) |

#### Returns

`this`

***

### toBuffer()

```ts
toBuffer(): Buffer
```

#### Returns

`Buffer`

***

### toASM()

```ts
toASM(): string
```

#### Returns

`string`

***

### toString()

```ts
toString(): string
```

Returns a string representation of an object.

#### Returns

`string`

***

### toHex()

```ts
toHex(): string
```

#### Returns

`string`

***

### inspect()

```ts
inspect(): string
```

#### Returns

`string`

***

### add()

```ts
add(param: ScriptElement): this
```

Adds a script element to the end of the script.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `param` | [`ScriptElement`](../type-aliases/ScriptElement.md) | a script element to add |

#### Returns

`this`

this script instance

***

### prepend()

```ts
prepend(param: ScriptElement): this
```

Adds a script element at the start of the script.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `param` | [`ScriptElement`](../type-aliases/ScriptElement.md) | a script element to add |

#### Returns

`this`

this script instance

***

### equals()

```ts
equals(script: Script): boolean
```

Compares a script with another script

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `script` | [`Script`](Script.md) |

#### Returns

`boolean`

***

### findAndDelete()

```ts
findAndDelete(script: Script): this
```

Analogous to nexad's FindAndDelete. Find and delete equivalent chunks,
typically used with push data chunks. Note that this will find and delete
not just the same data, but the same data with the same push data op as
produced by default. i.e., if a pushdata in a tx does not use the minimal
pushdata op, then when you try to remove the data it is pushing, it will not
be removed, because they do not use the same pushdata op.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `script` | [`Script`](Script.md) |

#### Returns

`this`

***

### checkMinimalPush()

```ts
checkMinimalPush(i: number): boolean
```

Comes from nexad's script interpreter CheckMinimalPush function

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `i` | `number` |

#### Returns

`boolean`

true if the chunk {i} is the smallest way to push that particular data.

***

### getSignatureOperationsCount()

```ts
getSignatureOperationsCount(accurate: boolean): number
```

Comes from bitcoind's script GetSigOpCount(boolean) function

#### Parameters

| Parameter | Type | Default value | Description |
| ------ | ------ | ------ | ------ |
| `accurate` | `boolean` | `true` | default true |

#### Returns

`number`

number of signature operations required by this script

***

### isPushOnly()

```ts
isPushOnly(): boolean
```

#### Returns

`boolean`

true if the script is only composed of data pushing
opcodes or small int opcodes (OP_0, OP_1, ..., OP_16)

***

### isScriptTemplateOut()

```ts
isScriptTemplateOut(): boolean
```

#### Returns

`boolean`

true if this is a pay to script template output script

#### Remarks

for well-known-1 template use [isPublicKeyTemplateOut](Script.md#ispublickeytemplateout)

***

### isScriptTemplateIn()

```ts
isScriptTemplateIn(): boolean
```

Checks if this script is a valid pay to script template input script

#### Returns

`boolean`

true if this is a pay to script template form input script

#### Remarks

for well-known-1 template use [isPublicKeyTemplateIn](Script.md#ispublickeytemplatein)

***

### isPublicKeyTemplateOut()

```ts
isPublicKeyTemplateOut(): boolean
```

#### Returns

`boolean`

true if this is a pay to pubkey template output script (well-known-1, p2pkt)

***

### isPublicKeyTemplateIn()

```ts
isPublicKeyTemplateIn(): boolean
```

#### Returns

`boolean`

true if this is a pay to public key template input script

***

### isPublicKeyHashOut()

```ts
isPublicKeyHashOut(): boolean
```

#### Returns

`boolean`

true if this is a pay to pubkey hash output script

***

### isPublicKeyHashIn()

```ts
isPublicKeyHashIn(): boolean
```

#### Returns

`boolean`

if this is a pay to public key hash input script

***

### isDataOut()

```ts
isDataOut(): boolean
```

#### Returns

`boolean`

true if this is a valid standard OP_RETURN output

***

### getPublicKey()

```ts
getPublicKey(): Buffer
```

#### Returns

`Buffer`

***

### getPublicKeyHash()

```ts
getPublicKeyHash(): Buffer
```

#### Returns

`Buffer`

***

### getTemplateHash()

```ts
getTemplateHash(): Buffer | OP_TRUE
```

#### Returns

`Buffer` \| [`OP_TRUE`](../enumerations/Opcode.md#op_true)

***

### getConstraintHash()

```ts
getConstraintHash(): Buffer | OP_FALSE
```

#### Returns

`Buffer` \| [`OP_FALSE`](../enumerations/Opcode.md#op_false)
