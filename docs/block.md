# Nexa Block

A Block instance represents the information of a block in the nexa network. Given a hexadecimal string representation of the serialization of a block with its transactions, you can instantiate a Block instance. Methods are provided to calculate and check the merkle root hash (if enough data is provided), but transactions won't necessarily be valid spends, and this class won't validate them. A binary representation as a `Buffer` instance is also valid input for a Block's constructor.

```javascript
// instantiate a new block instance from hex string
let block = Block.fromString(hexEncodedBlock);

// will verify that the corresponding block transactions match the header
assert(block.validMerkleRoot());

// blocks have several properties
assert(block.header); // an instance of block header, more info below
assert(block.transactions); // an array of transactions, more info below
```

For detailed technical information about a block please visit [Block](https://spec.nexa.org/blocks/block/) on the Nexa Specs site.

## Block Header

Each instance of Block has a BlockHeader _(which can be instantiated separately)_. The header has validation methods, to verify that the block.

```javascript
// will verify that the nonce demonstrates enough proof of work
assert(block.header.validProofOfWork());

// will verify that timestamp is not too far in the future
assert(block.header.validTimestamp());

// each header has the following properties
assert(block.header.prevHash);
assert(block.header.bits); // target
assert(block.header.ancestorHash);
assert(block.header.merkleRoot);
assert(block.header.txFilter);
assert(block.header.time);
assert(block.header.height);
assert(block.header.chainWork);
assert(block.header.size);
assert(block.header.txCount);
assert(block.header.poolFee);
assert(block.header.utxoCommitment);
assert(block.header.minerData);
assert(block.header.nonce);
```

For more information about the specific properties of a block header please visit [Block](https://spec.nexa.org/blocks/block/) page on the Nexa Specs site.

## Transactions

The set of transactions in a block is an array of instances of [Transaction](transaction.md) and can be explored by iterating on the block's `transactions` member.

```javascript
for (let i in block.transactions) {
  let transaction = block.transactions[i];
}
```

## API Reference
- [Block](api/classes/Block.md)
- [BlockHeader](api/classes/BlockHeader.md)