**libnexa-ts**

***

# libnexa-ts

## Enumerations

| Enumeration | Description |
| ------ | ------ |
| [AddressType](enumerations/AddressType.md) | - |
| [GroupIdFlag](enumerations/GroupIdFlag.md) | - |
| [NFTIdentifier](enumerations/NFTIdentifier.md) | Represent NFT creation identifier in OP_RETURN script |
| [Opcode](enumerations/Opcode.md) | - |
| [InputType](enumerations/InputType.md) | - |
| [OutputType](enumerations/OutputType.md) | - |
| [InputSighashType](enumerations/InputSighashType.md) | - |
| [OutputSighashType](enumerations/OutputSighashType.md) | - |
| [UnitType](enumerations/UnitType.md) | - |

## Classes

| Class | Description |
| ------ | ------ |
| [Address](classes/Address.md) | - |
| [Block](classes/Block.md) | - |
| [BlockHeader](classes/BlockHeader.md) | - |
| [GroupToken](classes/GroupToken.md) | A util class with methods for group tokenization. |
| [Message](classes/Message.md) | - |
| [NetworkManager](classes/NetworkManager.md) | NetworkManager is a singleton service, containing map values that correspond to version numbers for each nexa network. Currently only supporting "mainnet" (a.k.a. "livenet") and "testnet", with option to add custom networks. |
| [Network](classes/Network.md) | - |
| [ScriptOpcode](classes/ScriptOpcode.md) | - |
| [ScriptFactory](classes/ScriptFactory.md) | A factory class for creating scripts with predefined configurations and flags. |
| [Script](classes/Script.md) | A nexa transaction script. Each transaction's inputs and outputs has a script that is evaluated to validate it's spending. |
| [Input](classes/Input.md) | - |
| [PublicKeyHashInput](classes/PublicKeyHashInput.md) | Represents a special kind of input of PayToPublicKeyHash kind. |
| [PublicKeyTemplateInput](classes/PublicKeyTemplateInput.md) | Represents a special kind of input of PayToPublicKeyTemplate kind. |
| [ScriptTemplateInput](classes/ScriptTemplateInput.md) | - |
| [Output](classes/Output.md) | - |
| [SighashType](classes/SighashType.md) | - |
| [Transaction](classes/Transaction.md) | Represents a transaction, a set of inputs and outputs to change ownership of tokens |
| [TransactionBuilder](classes/TransactionBuilder.md) | - |
| [TxSignature](classes/TxSignature.md) | - |
| [TxSigner](classes/TxSigner.md) | - |
| [UnspentOutput](classes/UnspentOutput.md) | - |
| [BNExtended](classes/BNExtended.md) | - |
| [DigitalSignature](classes/DigitalSignature.md) | - |
| [ECDSA](classes/ECDSA.md) | IMPORTANT: ECDSA only used for compact message signing. for transactions signing, use Schnorr. |
| [Hash](classes/Hash.md) | - |
| [Point](classes/Point.md) | - |
| [Schnorr](classes/Schnorr.md) | - |
| [Signature](classes/Signature.md) | - |
| [BufferReader](classes/BufferReader.md) | - |
| [BufferWriter](classes/BufferWriter.md) | - |
| [HDPrivateKey](classes/HDPrivateKey.md) | - |
| [HDPublicKey](classes/HDPublicKey.md) | - |
| [PrivateKey](classes/PrivateKey.md) | - |
| [PublicKey](classes/PublicKey.md) | Instantiate new PublicKey. |
| [BufferUtils](classes/BufferUtils.md) | - |
| [CommonUtils](classes/CommonUtils.md) | - |
| [UnitUtils](classes/UnitUtils.md) | Utility for handling and converting nexa units. You can consult for different representation of a unit using it's {format} method or the fixed unit methods like {parse}. |

## Interfaces

| Interface | Description |
| ------ | ------ |
| [BufferParams](interfaces/BufferParams.md) | - |
| [BufferWriterOptions](interfaces/BufferWriterOptions.md) | - |
| [NetworkParams](interfaces/NetworkParams.md) | - |
| [BNOptions](interfaces/BNOptions.md) | - |
| [GroupIdData](interfaces/GroupIdData.md) | - |
| [ISignature](interfaces/ISignature.md) | - |
| [IDigitalSignature](interfaces/IDigitalSignature.md) | - |
| [IPrivateKey](interfaces/IPrivateKey.md) | - |
| [IPublicKey](interfaces/IPublicKey.md) | - |
| [PrivateKeyDto](interfaces/PrivateKeyDto.md) | - |
| [PublicKeyDto](interfaces/PublicKeyDto.md) | - |
| [IHDPrivateKey](interfaces/IHDPrivateKey.md) | - |
| [IHDPublicKey](interfaces/IHDPublicKey.md) | - |
| [HDPublicKeyBuffers](interfaces/HDPublicKeyBuffers.md) | - |
| [HDPrivateKeyBuffers](interfaces/HDPrivateKeyBuffers.md) | - |
| [HDPrivateKeyDto](interfaces/HDPrivateKeyDto.md) | - |
| [HDPublicKeyDto](interfaces/HDPublicKeyDto.md) | - |
| [ScriptChunk](interfaces/ScriptChunk.md) | - |
| [IScript](interfaces/IScript.md) | - |
| [AddressDto](interfaces/AddressDto.md) | - |
| [IMessage](interfaces/IMessage.md) | - |
| [IBlockHeader](interfaces/IBlockHeader.md) | - |
| [IBlock](interfaces/IBlock.md) | - |
| [UTXO](interfaces/UTXO.md) | - |
| [IOutput](interfaces/IOutput.md) | - |
| [IInput](interfaces/IInput.md) | - |
| [ScriptTemplateObject](interfaces/ScriptTemplateObject.md) | - |
| [ITransaction](interfaces/ITransaction.md) | - |
| [TxVerifyOptions](interfaces/TxVerifyOptions.md) | Contain a set of flags to skip certain tests: |
| [ITxSignature](interfaces/ITxSignature.md) | - |

## Type Aliases

| Type alias | Description |
| ------ | ------ |
| [HDPrivateKeyMinimalDto](type-aliases/HDPrivateKeyMinimalDto.md) | - |
| [HDPublicKeyMinimalDto](type-aliases/HDPublicKeyMinimalDto.md) | - |
| [EndianType](type-aliases/EndianType.md) | - |
| [Numeric](type-aliases/Numeric.md) | Any type that can be used where a numeric value is needed. |
| [BigNumberish](type-aliases/BigNumberish.md) | Any type that can be used where a big number is needed. |
| [Networkish](type-aliases/Networkish.md) | Any type that can be used where a network is needed. |
| [Bufferish](type-aliases/Bufferish.md) | Any type that can be used where a Buffer is needed. |
| [ScriptElement](type-aliases/ScriptElement.md) | - |
| [PrivateKeyVariants](type-aliases/PrivateKeyVariants.md) | - |
| [PublicKeyVariants](type-aliases/PublicKeyVariants.md) | - |

## Variables

| Variable | Description |
| ------ | ------ |
| [Networks](variables/Networks.md) | Singleton instance of [NetworkManager](classes/NetworkManager.md) |
| [libnexa](variables/libnexa.md) | - |
