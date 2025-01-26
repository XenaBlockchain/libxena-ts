[**libnexa-ts**](../index.md)

***

[libnexa-ts](../index.md) / Transaction

# Class: Transaction

Represents a transaction, a set of inputs and outputs to change ownership of tokens

## Implements

- [`ITransaction`](../interfaces/ITransaction.md)

## Constructors

### new Transaction()

```ts
new Transaction(serializedTx?: string | Buffer | ITransaction): Transaction
```

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `serializedTx`? | `string` \| `Buffer` \| [`ITransaction`](../interfaces/ITransaction.md) |

#### Returns

[`Transaction`](Transaction.md)

## Properties

| Property | Modifier | Type | Default value |
| ------ | ------ | ------ | ------ |
| <a id="current_version"></a> `CURRENT_VERSION` | `readonly` | `0` | `0` |
| <a id="fee_per_byte"></a> `FEE_PER_BYTE` | `readonly` | `3` | `3` |
| <a id="dust_amount"></a> `DUST_AMOUNT` | `readonly` | `546` | `546` |
| <a id="max_money"></a> `MAX_MONEY` | `readonly` | `number` | `undefined` |
| <a id="nlocktime_blockheight_limit"></a> `NLOCKTIME_BLOCKHEIGHT_LIMIT` | `readonly` | `500000000` | `5e8` |
| <a id="nlocktime_max_value"></a> `NLOCKTIME_MAX_VALUE` | `readonly` | `4294967295` | `4294967295` |
| <a id="version"></a> `version` | `public` | `number` | `undefined` |
| <a id="inputs"></a> `inputs` | `public` | [`Input`](Input.md)[] | `undefined` |
| <a id="outputs"></a> `outputs` | `public` | [`Output`](Output.md)[] | `undefined` |
| <a id="nlocktime"></a> `nLockTime` | `public` | `number` | `undefined` |
| <a id="uncheckedserialize"></a> `uncheckedSerialize` | `public` | () => `string` | `undefined` |
| <a id="tojson"></a> `toJSON` | `public` | () => [`ITransaction`](../interfaces/ITransaction.md) | `undefined` |

## Accessors

### id

#### Get Signature

```ts
get id(): string
```

##### Returns

`string`

#### Implementation of

[`ITransaction`](../interfaces/ITransaction.md).[`id`](../interfaces/ITransaction.md#id)

***

### idem

#### Get Signature

```ts
get idem(): string
```

##### Returns

`string`

#### Implementation of

[`ITransaction`](../interfaces/ITransaction.md).[`idem`](../interfaces/ITransaction.md#idem)

***

### outputAmount

#### Get Signature

```ts
get outputAmount(): bigint
```

##### Returns

`bigint`

***

### inputAmount

#### Get Signature

```ts
get inputAmount(): bigint
```

##### Returns

`bigint`

## Methods

### shallowCopy()

```ts
static shallowCopy(transaction: Transaction): Transaction
```

Create a 'shallow' copy of the transaction, by serializing and deserializing.
it dropping any additional information that inputs and outputs may have hold

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `transaction` | [`Transaction`](Transaction.md) |  |

#### Returns

[`Transaction`](Transaction.md)

***

### isCoinbase()

```ts
isCoinbase(): boolean
```

Analogous to nexad's IsCoinBase function in transaction.h

#### Returns

`boolean`

***

### getSerializationError()

```ts
getSerializationError(opts?: TxVerifyOptions): undefined | Error
```

Retrieve a possible error that could appear when trying to serialize and
broadcast this transaction.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `opts`? | [`TxVerifyOptions`](../interfaces/TxVerifyOptions.md) | allows to skip certain tests. |

#### Returns

`undefined` \| `Error`

***

### isFullySigned()

```ts
isFullySigned(): boolean
```

#### Returns

`boolean`

***

### hasAllUtxoInfo()

```ts
hasAllUtxoInfo(): boolean
```

#### Returns

`boolean`

true if the transaction has enough info on all inputs to be correctly validated

***

### getUnspentValue()

```ts
getUnspentValue(): bigint
```

#### Returns

`bigint`

***

### getFee()

```ts
getFee(): number
```

Calculates the fee of the transaction.

If there's a fixed fee set, return that.

If there is no change output set, the fee is the
total value of the outputs minus inputs. Note that
a serialized transaction only specifies the value
of its outputs. (The value of inputs are recorded
in the previous transaction outputs being spent.)
This method therefore raises a "MissingPreviousOutput"
error when called on a serialized transaction.

If there's no fee set and no change address,
estimate the fee based on size.

#### Returns

`number`

fee of this transaction in satoshis

***

### clearSignatures()

```ts
clearSignatures(): void
```

#### Returns

`void`

***

### checkedSerialize()

```ts
checkedSerialize(opts?: TxVerifyOptions): string
```

Retrieve a hexa string that can be used with nexad's CLI interface
(decoderawtransaction, sendrawtransaction)

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `opts`? | [`TxVerifyOptions`](../interfaces/TxVerifyOptions.md) | allows to skip certain tests. |

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

### inspect()

```ts
inspect(): string
```

#### Returns

`string`

***

### fromString()

```ts
fromString(string: string): this
```

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `string` | `string` |

#### Returns

`this`

***

### serialize()

```ts
serialize(unsafe?: boolean | TxVerifyOptions): string
```

Retrieve a hexa string that can be used with nexad's CLI interface
(decoderawtransaction, sendrawtransaction)

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `unsafe`? | `boolean` \| [`TxVerifyOptions`](../interfaces/TxVerifyOptions.md) | if true, skip all tests. if it's an object, it's expected to contain a set of flags to skip certain tests. |

#### Returns

`string`

#### See

[TxVerifyOptions](../interfaces/TxVerifyOptions.md)

***

### setFee()

```ts
setFee(amount: number): this
```

Manually set the fee for this transaction. Beware that this resets all the signatures
for inputs.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `amount` | `number` | satoshis to be set as fees |

#### Returns

`this`

this, for chaining

***

### setFeePerByte()

```ts
setFeePerByte(amount: number): this
```

Manually set the fee per Byte for this transaction. Beware that this resets all the signatures
for inputs.
fee per Byte will be ignored if fee property was set manually

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `amount` | `number` | satoshis per Byte to be used as fee rate |

#### Returns

`this`

this, for chaining

***

### addOutput()

```ts
addOutput(output: Output): this
```

Add an output to the transaction.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `output` | [`Output`](Output.md) | the output to add. |

#### Returns

`this`

this, for chaining

***

### removeOutput()

```ts
removeOutput(index: number): this
```

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `index` | `number` |

#### Returns

`this`

***

### clearOutputs()

```ts
clearOutputs(): this
```

Remove all outputs from the transaction.

#### Returns

`this`

this, for chaining

***

### updateOutputAmount()

```ts
updateOutputAmount(index: number, sats: number | bigint): void
```

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `index` | `number` |
| `sats` | `number` \| `bigint` |

#### Returns

`void`

***

### setChangeOutput()

```ts
setChangeOutput(address: string | Address): this
```

Set the change address for this transaction

Beware that this resets all the signatures for inputs.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `address` | `string` \| [`Address`](Address.md) | An address for change to be sent to. |

#### Returns

`this`

this, for chaining

***

### getChangeOutput()

```ts
getChangeOutput(): undefined | Output
```

#### Returns

`undefined` \| [`Output`](Output.md)

change output, if it exists

***

### uncheckedAddInput()

```ts
uncheckedAddInput(input: Input): this
```

Add an input to this transaction, without checking that the input has information about
the output that it's spending.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `input` | [`Input`](Input.md) | the input to add |

#### Returns

`this`

this, for chaining

***

### addInput()

```ts
addInput(
   input: Input, 
   outputScript?: string | Buffer | IScript, 
   amount?: number | bigint): this
```

Add an input to this transaction. The input must be an instance of the `Input` class.
It should have information about the Output that it's spending, but if it's not already
set, two additional parameters, `outputScript` and `amount` can be provided.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `input` | [`Input`](Input.md) |  |
| `outputScript`? | `string` \| `Buffer` \| [`IScript`](../interfaces/IScript.md) |  |
| `amount`? | `number` \| `bigint` |  |

#### Returns

`this`

this, for chaining

***

### removeInput()

```ts
removeInput(outpoint: string): this
```

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `outpoint` | `string` |

#### Returns

`this`

***

### setLockTime()

```ts
setLockTime(locktime: number): this
```

Sets nLockTime so that transaction is not valid until the desired date or height.
Beware that this method will also set the inputs sequence number to max_int - 1

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `locktime` | `number` |  |

#### Returns

`this`

#### Remarks

nLockTime considered as height if the value is between 0 - 499,999,999.
 above that considered as date (unix timestamp).

#### See

[NLOCKTIME\_BLOCKHEIGHT\_LIMIT](Transaction.md#nlocktime_blockheight_limit)

***

### getLockTime()

```ts
getLockTime(): null | number | Date
```

Returns a semantic version of the transaction's nLockTime.
 If nLockTime is 0, it returns null,
 if it is < 500000000, it returns a block height (number)
 else it returns a Date object.

#### Returns

`null` \| `number` \| `Date`

***

### toBuffer()

```ts
toBuffer(): Buffer
```

#### Returns

`Buffer`

***

### toBufferWriter()

```ts
toBufferWriter(writer?: BufferWriter, withInputsScripts?: boolean): BufferWriter
```

#### Parameters

| Parameter | Type | Default value |
| ------ | ------ | ------ |
| `writer`? | [`BufferWriter`](BufferWriter.md) | `undefined` |
| `withInputsScripts`? | `boolean` | `true` |

#### Returns

[`BufferWriter`](BufferWriter.md)

***

### fromBuffer()

```ts
fromBuffer(buffer: Buffer): this
```

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `buffer` | `Buffer` |

#### Returns

`this`

***

### fromBufferReader()

```ts
fromBufferReader(reader: BufferReader): this
```

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `reader` | [`BufferReader`](BufferReader.md) |

#### Returns

`this`

***

### toObject()

```ts
toObject(): ITransaction
```

#### Returns

[`ITransaction`](../interfaces/ITransaction.md)

***

### fromObject()

```ts
fromObject(transaction: ITransaction): this
```

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `transaction` | [`ITransaction`](../interfaces/ITransaction.md) |

#### Returns

`this`
