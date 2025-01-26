# Script

All Nexa transactions have scripts embedded into its inputs and outputs.  The scripts use a very simple programming language, which is evaluated from left to right using a stack. The language is designed such that it guarantees all scripts will execute in a limited amount of time (it is not Turing-Complete).

When a transaction is validated, the input scripts are concatenated with the output scripts and evaluated. To be valid, all transaction scripts must evaluate to true.  A good analogy for how this works is that the output scripts are puzzles that specify in which conditions can those nexas be spent. The input scripts provide the correct data to make those output scripts evaluate to true.

For more detailed information about the Nexa scripting language, check the online reference on Nexa's [Script](https://spec.nexa.org/script/1script/) and [Script Template](https://spec.nexa.org/addresses/scriptTemplates/) Specifications.

The `ScriptFactory` class gives simple static utilities to create most common script types.

The `Script` object provides an interface to construct, parse, and identify nexa scripts. This class is useful if you want to create custom input or output scripts. In other case, you should probably use `Transaction`.

## Script creation

Here's how to use `ScriptFactory` to create the most common script types:

### Pay to Script Template (P2ST)

This is the default address type for the Nexa blockchain that also support tokens.
We advise you use this for any new implementations.

```ts
// create a new p2pkt (well-known-1) paying to a specific address
let address = 'nexa:nqtsq5g526zghf6l37jny5437nwzj3ml69sjjmzc3l4zagg9';
let script = ScriptFactory.buildScriptTemplateOut(address);
// or use the generic method that classify by address type
let script = ScriptFactory.buildOutFromAddress(address);

assert(script.toString() === 'OP_0 OP_1 20 0x56848ba75f8fa53252b1f4dc29477fd161296c58');

// with group token
let group = 'nexa:tr9v70v4s9s6jfwz32ts60zqmmkp50lqv7t0ux620d50xa7dhyqqqcg6kdm6f';
let groupAmount = 1000n;

let script = ScriptFactory.buildScriptTemplateOut(address, group, groupAmount);
// or use the generic method that classify by address type
let script = ScriptFactory.buildOutFromAddress(address, group, groupAmount);

assert(script.toString() === '32 0xcacf3d958161a925c28a970d3c40deec1a3fe06796fe1b4a7b68f377cdb90000 2 0xe803 OP_1 20 0x56848ba75f8fa53252b1f4dc29477fd161296c58');

// create a new p2st (not well-known-1) paying to a specific address
let address2 = 'nexa:nqcqq9zxrtf9pqwtqyvaqdpctlc4fjxn444a6as5s4uuwkur6gsckl6l6cv9dn3xuuhp0aqdqwpr5pzjjyzue07u';
let script = ScriptFactory.buildOutFromAddress(address);
assert(script.toString() === 'OP_0 20 0x461ad25081cb0119d034385ff154c8d3ad6bdd76 20 0x8579c75b83d2218b7f5fd61856ce26e72e17f40d 3 0x823a04 OP_2');
```

### Pay to Public Key Hash (P2PKH)

Pay to public key hash is a legacy address type which does not support tokens.
New implementations SHOULD NOT use this type, but use only Script Template.

```ts
// create a new p2pkh paying to a specific address
let address = 'nexa:qryh034vs398uz94s9ek2df55dl52n7kxufz430csv';
let script = ScriptFactory.buildPublicKeyHashOut(address);

// or use the generic method that classify by address type
let script = ScriptFactory.buildOutFromAddress(address);

assert(script.toString() === 'OP_DUP OP_HASH160 20 0xecae7d092947b7ee4998e254aa48900d26d2ce1d OP_EQUALVERIFY OP_CHECKSIG');
```

### Data output

Data outputs are used to push data into the blockchain.

```ts
let data = 'hello world!!!';
let script = ScriptFactory.buildDataOut(data);
assert(script.toString() === 'OP_RETURN 14 0x68656c6c6f20776f726c64212121');
```

### Token Description

There are multiple token descriptions (OP_RETURN Identifiers) the library supports. See the `ScriptFactory` API Referece below and the official [Nexa Token Description Document](https://spec.nexa.org/tokens/tokenDescription/) for a technical overview and detailed breakdown.

### Custom Scripts

To create a custom `Script` instance, you must rely on the lower-level methods `add` and `prepend`. Both methods accept the same parameter types, and insert an opcode or data at the beginning (`prepend`) or end (`add`) of the `Script`.

```ts
let script = new Script()
  .add('OP_IF')                       // add an opcode by name
  .prepend(114)                       // add OP_2SWAP by code
  .add(Opcode.OP_NOT)                 // add an opcode enum ref
  .add(Buffer.from('bacacafe', 'hex')) // add a data buffer (will append the size of the push operation first)

assert(script.toString() === 'OP_2SWAP OP_IF OP_NOT 4 0xbacacafe');
```

## Script Parsing and Identification

`Script` has an easy interface to parse raw scripts from the network or nexad, and to extract useful information. An illustrative example (for more options check the API reference)

```ts
let raw_script_buf = Buffer.from('00146cfb32733d3cf135dc779f61c8330086cc9161ed144d938ba8e59f1e263c58e7802cacd6eb992e7f47', 'hex');
let s = new Script(raw_script_buf);

console.log(s.toString());
// 'OP_0 20 0x6cfb32733d3cf135dc779f61c8330086cc9161ed 20 0x4d938ba8e59f1e263c58e7802cacd6eb992e7f47'

s.isPublicKeyHashOut() // false
s.isPublicKeyTemplateOut() // false
s.isScriptTemplateOut() // true

let s2 = new Script('OP_0 OP_1 20 0x4d938ba8e59f1e263c58e7802cacd6eb992e7f47');
s2.isPublicKeyHashOut() // false
s2.isPublicKeyTemplateOut() // true
s2.isScriptTemplateOut() // false
```

## API Reference
- [Script](api/classes/Script.md)
- [ScriptFactory](api/classes/ScriptFactory.md)
- [Opcode](api/enumerations/Opcode.md)
- [ScriptOpcode](api/classes/ScriptOpcode.md)