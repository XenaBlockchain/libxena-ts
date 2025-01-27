[**libnexa-ts**](../index.md)

***

[libnexa-ts](../index.md) / TransactionBuilder

# Class: TransactionBuilder

## Constructors

### new TransactionBuilder()

```ts
new TransactionBuilder(tx?: string | Buffer | ITransaction): TransactionBuilder
```

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `tx`? | `string` \| `Buffer` \| [`ITransaction`](../interfaces/ITransaction.md) |

#### Returns

[`TransactionBuilder`](TransactionBuilder.md)

## Properties

| Property | Modifier | Type |
| ------ | ------ | ------ |
| <a id="transaction"></a> `transaction` | `public` | [`Transaction`](Transaction.md) |

## Methods

### build()

```ts
build(): Transaction
```

#### Returns

[`Transaction`](Transaction.md)

***

### from()

```ts
from(utxo: UTXO | UTXO[]): this
```

Add an input to this transaction. This is a high level interface
to add an input, for more control, use [Transaction.addInput](Transaction.md#addinput).

Can receive, as output information, the output of nexad's `listunspent` command,
with a slightly fancier format recognized by this sdk:

```json
{
 outpoint: "fcf7d303d67f19568cf4ab72d36d583baac461e0f62f289b3dff68da96c2117c"
 scriptPubKey: "005114891c4b19cbcaefc31770a938ebd6b1fafabb1be6",
 satoshis: 181998351
}
// or alternative:
{
 outpoint: "fcf7d303d67f19568cf4ab72d36d583baac461e0f62f289b3dff68da96c2117c"
 address: "nexa:nqtsq5g53ywykxwtethux9ms4yuwh443ltatkxlx3s5pnvwh",
 amount: 1819983.51
 groupId: <token address if relevant>
 groupAmount: <token amount if relevant>
}
```
Where `address` can be either a string or a nexcore Address object. The
same is true for `script`, which can be a string or a nexcore Script.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `utxo` | [`UTXO`](../interfaces/UTXO.md) \| [`UTXO`](../interfaces/UTXO.md)[] | details on the utxo |

#### Returns

`this`

this, for chaining

#### See

[UTXO](../interfaces/UTXO.md)

Beware that this resets all the signatures for inputs.

#### Example

```javascript
let builder = new TransactionBuilder();

// From a pay to public key template output from nexad's listunspent
builder.from({'outpoint': '0000...', amount: 123.23, scriptPubKey: 'OP_0 OP_1 ...'});

// From a pay to public key template output (with optional group data)
builder.from({'outpoint': '0000...', satoshis: 12323, address: 'nexa:nqtsq5g...', groupId? 'nexa:tnq...', groupAmount: 56446n });

// From a script template output
builder.from({'outpoint': '0000...', satoshis: 1000, scriptPubKey: '...', templateData: { templateScript: '...', constraintScript: '...' }};

let transaction = builder.build();
```

***

### to()

```ts
to(
   address: string | Address, 
   amount: string | number | bigint, 
   groupId?: string | Address, 
   groupAmount?: bigint): this
```

Add an output to the transaction.

Beware that this resets all the signatures for inputs.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `address` | `string` \| [`Address`](Address.md) | the destination address |
| `amount` | `string` \| `number` \| `bigint` | in satoshis, the nexa amount |
| `groupId`? | `string` \| [`Address`](Address.md) | optional. the token address if sending tokens |
| `groupAmount`? | `bigint` | optional. the token amount if sending tokens |

#### Returns

`this`

this, for chaining

#### Remarks

if sending token, the nexa amount is usually [Transaction.DUST\_AMOUNT](Transaction.md#dust_amount)

***

### addData()

```ts
addData(data: string | Buffer | Script, isFullScript: boolean): this
```

Add an OP_RETURN output to the transaction.

Beware that this resets all the signatures for inputs.

#### Parameters

| Parameter | Type | Default value | Description |
| ------ | ------ | ------ | ------ |
| `data` | `string` \| `Buffer` \| [`Script`](Script.md) | `undefined` | the data to be stored in the OP_RETURN output. In case of a string, the UTF-8 representation will be stored |
| `isFullScript` | `boolean` | `false` | if the provided data is already an op_return script. default false. |

#### Returns

`this`

this, for chaining

***

### change()

```ts
change(address: string | Address): this
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

### fee()

```ts
fee(amount: number): this
```

Manually set the fee for this transaction. 

Beware that this resets all the signatures for inputs.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `amount` | `number` | satoshis to be used as fee |

#### Returns

`this`

this, for chaining

***

### feePerByte()

```ts
feePerByte(amount: number): this
```

Manually set the fee per Byte rate for this transaction.

Beware that this resets all the signatures for inputs.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `amount` | `number` | satoshis per Byte to be used as fee rate |

#### Returns

`this`

this, for chaining

#### Remarks

fee per Byte will be ignored if fee property was set manually

***

### lockUntilDate()

```ts
lockUntilDate(datetime: number | Date): this
```

Sets nLockTime so that transaction is not valid until the desired date

(a timestamp in seconds since UNIX epoch is also accepted)

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `datetime` | `number` \| `Date` | Date object or unix timestamp number |

#### Returns

`this`

this, for chaining

***

### lockUntilBlockHeight()

```ts
lockUntilBlockHeight(height: number): this
```

Sets nLockTime so that transaction is not valid until the desired block height.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `height` | `number` | the block height |

#### Returns

`this`

this, for chaining

***

### sign()

```ts
sign(privateKey: PrivateKey | PrivateKey[]): this
```

Sign the transaction using one or more private keys.

It tries to sign each input, verifying that the signature will be valid
(matches a public key). Usually this is the last step that should be used with the builder.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `privateKey` | [`PrivateKey`](PrivateKey.md) \| [`PrivateKey`](PrivateKey.md)[] | private key(s) that be used to sign |

#### Returns

`this`

this, for chaining

#### Remarks

this method sign all inputs and outputs (sighash type ALL).
 
if you need to sign a specific input or partial transaction
 (create new or complete existing one), use [signInput](TransactionBuilder.md#signinput) method.

***

### signInput()

```ts
signInput(
   input: string | number, 
   privateKey: PrivateKey, 
   sigtype: SighashType): this
```

Sign specific input using private key and sighash type.

Use sigtype to determine which parts of the transaction to sign.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `input` | `string` \| `number` | The input to sign. can be input index (number) or input outpoint hash (string) |
| `privateKey` | [`PrivateKey`](PrivateKey.md) | private key that be used to sign |
| `sigtype` | [`SighashType`](SighashType.md) | the sighash type to define which parts to include in the sighash |

#### Returns

`this`

this, for chaining
