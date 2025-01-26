# Nexa Sighash Types

Sighash Types are a fundamental mechanism in Nexa transactions, used to determine which parts of a transaction should be signed. For a technical overview and detailed breakdown of all the supported Sighash Types, refer to the [Nexa Sighash Types Spec](https://spec.nexa.org/transactions/sighashtype/).

## Partial / Incomplete Transaction

The Sighash Type object defines the transaction parts to sign. For example, one can sign only their inputs and outputs that represent selling an asset, then pass the transaction to another party. The second party can add their own inputs and outputs to balance and complete the transaction, enabling collaborative or trading workflows.

## Instantiate a SighashType

To specify which parts of the transaction should be signed, you need to work with the SighashType object. For more details on signing transactions, check the [Transaction Module Documentation](transaction.md).

```ts
let sigType = new SighashType();

// Include the first 2 inputs in the signature preimage
sigType.setFirstNIn(2);

// Include the first 2 output in the signature preimage
sigType.setFirstNOut(2);

assert(sigType.toString() === 'FIRST_2_IN|FIRST_2_OUT');
```

In the example above, the first two inputs and outputs are included in the signature preimage. This setup allows other participants to add additional inputs and outputs before broadcasting the transaction to the network.

Alternatively, you can use SighashType.ALL, a static object representing the ALL type, which signs all inputs and outputs in the transaction so no one could alter it (add / remove inputs and outputs).

## API Reference
- [SighashType](api/classes/SighashType.md)