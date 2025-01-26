# Transaction and TransactionBuilder

libnexa-ts provides a very simple API for creating transactions. We expect this API to be accessible for developers without knowing the working internals of Nexa in deep detail. What follows is a small introduction to transactions with some basic knowledge required to use this API.

A Transaction contains a set of inputs and a set of outputs. Each input contains a reference to another transaction's output, and a signature that allows the value referenced in that output to be used in this transaction.

Note also that an output can be used only once. That's why there's a concept of "change address" in the nexa ecosystem: if an output of 100 NEXA is available for me to spend, but I only need to transmit 10 NEXA, I'll create a transaction with two outputs, one with 10 NEXA that I want to spend, and the other with 90 NEXA to a change address, so I can spend this 90 NEX with another private key that I own.

So, in order to transmit a valid transaction, you must know what other transactions on the network store outputs that have not been spent and that are available for you to spend (meaning that you have the set of keys that can validate you own those funds). The unspent outputs are usually referred to as "utxo"s.

Let's take a look at some very simple transactions:

```ts
let transaction = new TransactionBuilder()
    .from(utxos)                      // Feed information about what unspent outputs one can use
    .to(address, amount)              // Add an output with the given amount of satoshis
    .change(address)                  // Sets up a change address where the rest of the funds will go
    .lockUntilBlockHeight(blockTip)   // Set locktime to the current block height
    .sign(privkeySet)                 // Signs all the inputs it can
    .build()                          // build and get the Transaction instance
```

You can obtain the input and output total amounts of the transaction in satoshis by accessing the fields `inputAmount` and `outputAmount`.

Now, this could just be serialized to hexadecimal ASCII values (`transaction.serialize()`) and sent over to the nexad reference client.

```sh
nexa-cli sendrawtransaction <serialized transaction>
```

You can also override the fee estimation with another amount, specified in satoshis:

```ts
var transaction = new TransactionBuilder().fee(580); // 580 sats (5.8 NEXA)
var transaction = new TransactionBuilder().fee(10000);  // Generous fee of 100 NEXA
```

## Adding inputs

Transaction inputs are instances of either [Input](api/classes/Input.md) or its subclasses. `Input` has some abstract methods, as there is no actual concept of a "signed input" in the Nexa Scripting Language (just valid signatures for `OP_CHECKSIG` and similar opcodes). They are stored in the `inputs` property of `Transaction` instances.

libnexa-ts contains three implementations of `Input`, one for spending _Pay to Public Key Template_ outputs (called `PublicKeyTemplateInput`), one for _Pay to Public Key Hash_ outputs (called `PublicKeyHashInput`) and another to spend _Pay to Script Template_ (`ScriptTemplateInput`) outputs for which the redeem script is a Script Template.

All inputs have the following six properties:

- `type`: a `number` represent the type of the input. usually 0 (UTXO).
- `outpoint`: a `Buffer` with the outpoint hash of the output this input is spending.
- `amount`: a `bigint` with the amount sats this input is spending. usually coming from the utxo.
- `sequenceNumber`: a `number`, the sequence number, see [Nexa's specification on locktime and sequence number](https://spec.nexa.org/transactions/transaction-signing/?h=sequence+number#sequence-numbers-hash).
- `scriptSig`: the `Script` instance for this input.
- `output`: if available, a `Output` instance of the output associated with this input.

`PublicKeyTemplateInput`, `PublicKeyHashInput` and `ScriptTemplateInput` cache the information about signatures, even though this information could somehow be encoded in the script. All need to have the `output` property set in order to calculate the `sighash` so signatures can be created.

In  case of `ScriptTemplateInput`, the `templateData` utxo property (as `ScriptTemplateObject`) is also required in order to calculate the `sighash` so signatures can be created, and stored in the ScriptTemplateInput in the following fields:

- `templateScript`: a `Script`, The script template of the utxo.
- `constraintScript`: a `Script`, The constraint script of the utxo.
- `publicKey`: if available, The public key that match the private key that can sign this input.


> Note that `ScriptTemplateInput` is a general case where the signature is similar to p2pkt and added to scriptSig as push signature data. If you have complex smart contract, consider extending this class (or Input class) and implement the necessary logic, or sign it manually.

Some methods related to adding inputs are:

In TransactionBuilder class:

- `from`: A high level interface to add an input from a UTXO. It has a series of variants:
    - `from(utxo)`: add an input from an [Unspent Transaction Output](api/classes/UnspentOutput.md).
    - `from(utxos)`: same as above, but passing in an array of Unspent Outputs.

In Transaction class:

- `addInput`: Performs a series of checks on an input and appends it to the end of the `inputs` vector and updates the amount of incoming nexas of the transaction.
- `uncheckedAddInput`: adds an input to the end of the `inputs` vector and updates the `inputAmount` without performing any checks.

### PublicKeyTemplateInput and PublicKeyHashInput

These inputs uses the `scriptSig` property to mark the input as unsigned if the script is empty.

### ScriptTemplateInput

uses the `scriptSig` property to mark the input as unsigned if the script is empty or the template/constraint scripts not matching the provided scriptSig.

## Signing a Transaction

### Sign with TransactionBuilder

The following methods in `TransactionBuilder` class are used to manage signatures for a transaction and provide simple API to sign transactions:

- `sign`: takes an array of `PrivateKey` or a single `PrivateKey`, use the `ALL` [signature hash type](sighashtype.md), and attach the signatures to the relevant inputs.

- `signInput`: used to sign specific input; takes the input index, a single `PrivateKey` and the [signature hash type](sighashtype.md) to use, and attach the signatures to the input.


### Sign Manually

The `TxSigner` class is a low level module that provide more control on signing and usually used for manual signing.

The following methods in `TxSigner` class are used to sign/verify signatures for a transaction:

- `sign`: 
    - takes instance of transaction
    - input number as input index in the inputs array
    - the object that defines [signature hash type](sighashtype.md)
    - subscript for the preimage
    - PrivateKey instance.
    - Return the raw `Signature` object for this input.
- `verify`: 
    - takes instance of transaction
    - input number as input index in the inputs array
    - the raw `Signature` object
    - the object that defines [signature hash type](sighashtype.md)
    - subscript for the preimage
    - PublicKey instance.
    - Return true if the public key match the signature for this input.

The `Signature` can be wrapped in `TxSignature` object (see more in API Reference below) and be attached to the input with `addSignature` method.

The following methods in `Input` subclasses are used to manage signatures for an input:

- `canSign`: takes a `PrivateKey` and return true if this privkey can sign this input.
- `getSubscript`: return the correct script for the sighash preimage.
- `addSignature`: takes an element of type `TxSignature` and applies the signature to this input (modifies the script to include the new signature).
- `clearSignatures`: removes all signatures for this input
- `isFullySigned`: returns true if the input is fully signed


## Handling Outputs

Outputs can be added by:

- The `addOutput(output)` method in `Transaction` class, which pushes an `Output` to the end of the `outputs` property and updates the `outputAmount` field. It also clears signatures (as the hash of the transaction may have changed) and updates the change output.
- The `to(address, amount)` method in `TransactionBuilder` class, that adds an output with the script that corresponds to the given address. Builds an output and calls the `addOutput` method of `Transaction`.
- Specifying a [change address](#fee-calculation)

To remove all outputs, you can use `transaction.clearOutputs()`, which preserves change output configuration.

## Serialization

There are a series of methods used for serialization:

- `toObject`: Returns a plain JavaScript object with no methods and enough information to fully restore the state of this transaction. Using other serialization methods (except for `toJSON`) will cause a some information to be lost.

- `toJSON`: Will be called when using `JSON.stringify` to return JSON-encoded string using the output from `toObject`.
- `toString` or `uncheckedSerialize`: Returns an hexadecimal serialization of the transaction.
- `serialize`: Does a series of checks before serializing the transaction.
- `inspect`: Returns a string with some information about the transaction (currently a string formatted as `<Transaction 000...000>`), that only shows the serialized value of the transaction.
- `toBuffer`: Serializes the transaction for sending over the wire in the nexa network.
- `toBufferWriter`: Uses an already existing BufferWriter to copy over the serialized transaction.

## Serialization Checks

When serializing, the library performs a series of checks. These can be disabled by providing an object to the `serialize` method with the checks that you'll like to skip.

- `disableAll`: disable all checks
- `disableIsFullySigned` does not check if all inputs are fully signed
- `disableDustOutputs` does not check for dust outputs being generated
- `disableMoreOutputThanInput` avoids checking that the sum of the output amounts is less than or equal to the sum of the amounts for the outputs being spent in the transaction

These are the current default values in the libnexa library involved on these checks:

- `Transaction.FEE_PER_BYTE`: `3` (satoshis per byte)
- `Transaction.DUST_AMOUNT`: `546` (satoshis)

## Fee calculation

When outputs' value don't sum up to the same amount that inputs, the difference in nexas goes to the miner of the block that includes this transaction. The concept of a "change address" usually is associated with this: an output with an address that can be spent by the creator of the transaction.

For this reason, some methods in the Transaction and TransactionBuilder classes are provided:

- `transaction.setChangeOutput(address)` or `builder.change(address)`: Set up the change address. This will set an internal `_changeScript` property that will store the change script associated with that address.
- `transaction.setFee(amount)` or `builder.fee(amount)`: Sets up the exact amount of fee to pay. If no change address is provided, this might raise an exception.
- `transaction.getFee()`: returns the estimated fee amount to be paid, based on the size of the transaction, but disregarding the priority of the outputs.

Internally, a `_changeIndex` property stores the index of the change output (so it can get updated when a new input or output is added).

## Time-Locking transaction

All nexa transactions contain a locktime field. The locktime indicates the earliest time a transaction can be added to the blockchain. Locktime allows signers to create time-locked transactions which will only become valid in the future, giving the signers a chance to change their minds. Locktime can be set in the form of a nexa block height (the transaction can only be included in a block with a higher height than specified) or a unix timestamp (transaction can only be confirmed after that time).

In libnexa-ts, you can set a `Transaction`'s locktime by using the methods `TransactionBuilder#lockUntilDate` and `TransactionBuilder#lockUntilBlockHeight`, or use `Transaction#setLockTime` directly.

You can also get a friendly version of the locktime field via `Transaction#getLockTime`;

For example:

```ts
let future = new Date(2025,10,30); // Sun Nov 30 2025
let transaction = new TransactionBuilder()
  .lockUntilDate(future)
  .build();
console.log(transaction.getLockTime());
// output similar to: Sun Nov 30 2025 00:00:00 GMT-0300 (ART)
```

## API Reference
- [Transaction](api/classes/Transaction.md)
- [TransactionBuilder](api/classes/TransactionBuilder.md)
- [TxSigner](api/classes/TxSigner.md)
- [TxSignature](api/classes/TxSignature.md)
- [UnspentOutput](api/classes/UnspentOutput.md)
- [Input](api/classes/Input.md)
- [Output](api/classes/Output.md)
- [SighashType](api/classes/SighashType.md)