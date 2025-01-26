# Message Verification and Signing
Libnexa-ts implementation of Nexa message signing and verification.
This is used to cryptographically prove that a certain message was signed by the holder of an address private key.

## Example

### Sign a message

```ts
let privateKey = PrivateKey.fromWIF('6J6fqYmE6yr97naoJXEqzWuKiKKbngKm9CPxaSj9YTfRPLRGn38A');
let msg = new Message('hello, world');
let signature = msg.sign(privateKey);
console.log(signature);
// H4+z1TV9oUYfVJq58JbyP5IMULLSIgPEWbLrBdj+hOKFE+uwCbHhssTTFcRSzeQiiYNw9RqjPuEjNE6vC3zBw/w=
```

### Verify a message

```ts
let address = 'nexa:nqtsq5g5r4av5a20rcp4zx5d5q4uhndshc49h9q3s4tcppn7';
let signature = 'H4+z1TV9oUYfVJq58JbyP5IMULLSIgPEWbLrBdj+hOKFE+uwCbHhssTTFcRSzeQiiYNw9RqjPuEjNE6vC3zBw/w=';

let msg = new Message('hello, world');
let verified = msg.verify(address, signature);
console.log(verified);
// true
```

## API Reference
- [Message](api/classes/Message.md)
