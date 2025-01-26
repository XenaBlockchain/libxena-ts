[**libnexa-ts**](../index.md)

***

[libnexa-ts](../index.md) / libnexa

# Variable: libnexa

```ts
const libnexa: object;
```

## Type declaration

### versionGuard()

```ts
versionGuard: (version: string) => void;
```

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `version` | `string` |

#### Returns

`void`

### version

```ts
version: string;
```

### crypto

```ts
crypto: object;
```

#### crypto.BN

```ts
BN: typeof BNExtended = BNExtended;
```

#### crypto.Hash

```ts
Hash: typeof Hash;
```

#### crypto.ECDSA

```ts
ECDSA: typeof ECDSA;
```

#### crypto.Schnorr

```ts
Schnorr: typeof Schnorr;
```

#### crypto.Signature

```ts
Signature: typeof Signature;
```

### encoding

```ts
encoding: object;
```

#### encoding.BufferReader

```ts
BufferReader: typeof BufferReader;
```

#### encoding.BufferWriter

```ts
BufferWriter: typeof BufferWriter;
```

### utils

```ts
utils: object;
```

#### utils.BufferUtils

```ts
BufferUtils: typeof BufferUtils;
```

#### utils.CommonUtils

```ts
CommonUtils: typeof CommonUtils;
```

#### utils.UnitUtils

```ts
UnitUtils: typeof UnitUtils;
```

### keys

```ts
keys: object;
```

#### keys.PrivateKey

```ts
PrivateKey: typeof PrivateKey;
```

#### keys.PublicKey

```ts
PublicKey: typeof PublicKey;
```

#### keys.HDPrivateKey

```ts
HDPrivateKey: typeof HDPrivateKey;
```

#### keys.HDPublicKey

```ts
HDPublicKey: typeof HDPublicKey;
```

### tx

```ts
tx: object;
```

#### tx.Transaction

```ts
Transaction: typeof Transaction;
```

#### tx.Input

```ts
Input: typeof Input;
```

#### tx.PublicKeyHashInput

```ts
PublicKeyHashInput: typeof PublicKeyHashInput;
```

#### tx.PublicKeyTemplateInput

```ts
PublicKeyTemplateInput: typeof PublicKeyTemplateInput;
```

#### tx.ScriptTemplateInput

```ts
ScriptTemplateInput: typeof ScriptTemplateInput;
```

#### tx.Output

```ts
Output: typeof Output;
```

#### tx.UnspentOutput

```ts
UnspentOutput: typeof UnspentOutput;
```

#### tx.TxSignature

```ts
TxSignature: typeof TxSignature;
```

#### tx.TxSigner

```ts
TxSigner: typeof TxSigner;
```

#### tx.SighashType

```ts
SighashType: typeof SighashType;
```

### Networks

```ts
Networks: NetworkManager;
```

### Opcode

```ts
Opcode: typeof Opcode;
```

### Script

```ts
Script: typeof Script;
```

### ScriptFactory

```ts
ScriptFactory: typeof ScriptFactory;
```

### ScriptOpcode

```ts
ScriptOpcode: typeof ScriptOpcode;
```

### Address

```ts
Address: typeof Address;
```

### Message

```ts
Message: typeof Message;
```

### TransactionBuilder

```ts
TransactionBuilder: typeof TransactionBuilder;
```

### Block

```ts
Block: typeof Block;
```

### BlockHeader

```ts
BlockHeader: typeof BlockHeader;
```

### GroupToken

```ts
GroupToken: typeof GroupToken;
```
