import { isUndefined } from "lodash-es";
import Schnorr from "../../crypto/schnorr";
import type Signature from "../../crypto/signature";
import type PrivateKey from "../../keys/privatekey";
import ValidationUtils from "../../utils/validation.utils";
import type Script from "../script/script";
import type SighashType from "./sighashtype";
import { InputSighashType, OutputSighashType } from "./sighashtype";
import type Transaction from "./transaction";
import type PublicKey from "../../keys/publickey";
import BufferWriter from "../../encoding/bufferwriter";
import Hash from "../../crypto/hash";
import BN from "../../crypto/bn.extension";

interface SighashComponents {
  hashPrevouts: Buffer;
  hashSequence: Buffer;
  hashInputAmounts: Buffer;
  hashOutputs: Buffer;
}

export default class TxSigner {

  /**
   * Create a signature
   * 
   * @param transaction the transaction to sign
   * @param inputNumber the input index for the signature
   * @param sighashType the sighash type
   * @param subscript the script that will be signed
   * @param privateKey the privkey to sign with
   * @returns The signature
   */
  public static sign(transaction: Transaction, inputNumber: number, sighashType: SighashType, subscript: Script, privateKey: PrivateKey): Signature {
    let hashbuf = this.buildSighash(transaction, inputNumber, sighashType, subscript);
    return Schnorr.sign(hashbuf, privateKey, 'little') as Signature;
  }

  /**
   * Verify a signature
   * 
   * @param transaction the transaction to verify
   * @param inputNumber the input index for the signature
   * @param signature the signature to verify
   * @param sighashType the sighash type
   * @param subscript the script that will be verified
   * @param publicKey the pubkey that correspond to the signing privkey
   * @returns true if signature is valid
   */
  public static verify(transaction: Transaction, inputNumber: number, signature: Signature, sighashType: SighashType, subscript: Script, publicKey: PublicKey): boolean {
    ValidationUtils.validateArgument(!isUndefined(transaction), 'transaction');
    ValidationUtils.validateArgument(!isUndefined(signature), 'signature');
    ValidationUtils.validateArgument(!isUndefined(sighashType), 'sighashType');

    let hashbuf = this.buildSighash(transaction, inputNumber, sighashType, subscript);
    return Schnorr.verify(hashbuf, signature, publicKey, 'little');
  }

  /**
   * Returns a buffer of length 32 bytes with the hash that needs to be signed for OP_CHECKSIG(VERIFY).
   *
   * @param transaction the transaction to sign
   * @param inputNumber the input index for the signature
   * @param sighashType the sighash type
   * @param subscript the script that will be signed
   */
  public static buildSighash(transaction: Transaction, inputNumber: number, sighashType: SighashType, subscript: Script): Buffer {
    let components = this._getSighashComponents(transaction, inputNumber, sighashType);
    let writer = new BufferWriter();

    // Version
    writer.writeUInt8(transaction.version);

    // Input prevouts/nSequence (none/all, depending on flags)
    writer.write(components.hashPrevouts);
    writer.write(components.hashInputAmounts);
    writer.write(components.hashSequence);

    // scriptCode of the input (serialized as scripts inside CTxOuts)
    writer.writeVarLengthBuf(subscript.toBuffer());

    // Outputs (none/one/all, depending on flags)
    writer.write(components.hashOutputs);

    // Locktime
    writer.writeUInt32LE(transaction.nLockTime);

    // sighashType 
    writer.writeVarLengthBuf(sighashType.toBuffer());

    let buf = writer.toBuffer();
    return Hash.sha256sha256(buf).reverse();
  }

  private static _getSighashComponents(transaction: Transaction, inputNumber: number, sighashType: SighashType): SighashComponents {
    ValidationUtils.validateArgument(!sighashType.isInvalid(), 'sighashType');
    let hashPrevouts: Buffer, hashSequence: Buffer, hashInputAmounts: Buffer, hashOutputs: Buffer;

    switch (sighashType.inType) {
      case InputSighashType.FIRSTN:
        let firstN = sighashType.inData[0];
        ValidationUtils.validateArgument(firstN <= transaction.inputs.length, 'firstN out of range');
        hashPrevouts = this._getPrevoutHash(transaction, firstN);
        hashSequence = this._getSequenceHash(transaction, firstN);
        hashInputAmounts = this._getInputAmountHash(transaction, firstN);
        break;
      case InputSighashType.THISIN:
        ValidationUtils.validateArgument(inputNumber < transaction.inputs.length, 'inputNumber out of range');
        hashPrevouts = this._getPrevoutHashOf(transaction, inputNumber);
        hashSequence = this._getSequenceHashOf(transaction, inputNumber);
        hashInputAmounts = this._getInputAmountHashOf(transaction, inputNumber);
        break;
      default: // ALL
        hashPrevouts = this._getPrevoutHash(transaction, transaction.inputs.length);
        hashSequence = this._getSequenceHash(transaction, transaction.inputs.length);
        hashInputAmounts = this._getInputAmountHash(transaction, transaction.inputs.length);
        break;
    }

    switch (sighashType.outType) {
      case OutputSighashType.FIRSTN:
        let firstN = sighashType.outData[0];
        ValidationUtils.validateArgument(firstN <= transaction.outputs.length, 'firstN out of range');
        hashOutputs = this._getOutputsHash(transaction, firstN);
        break;
      case OutputSighashType.TWO:
        let [out1, out2] = sighashType.outData;
        ValidationUtils.validateArgument(out1 < transaction.outputs.length, 'out1 out of range');
        ValidationUtils.validateArgument(out2 < transaction.outputs.length, 'out2 out of range');
        hashOutputs = this._getOutputsHashOf(transaction, out1, out2);
        break;
      default: // ALL
        hashOutputs = this._getOutputsHash(transaction, transaction.outputs.length);
        break;
    }

    return { hashPrevouts, hashSequence, hashInputAmounts, hashOutputs };
  }

  private static _getPrevoutHash(tx: Transaction, firstN: number): Buffer {
    let writer = new BufferWriter();
    for (let i = 0; i < firstN; i++) { 
      writer.writeUInt8(tx.inputs[i].type);
      writer.writeReverse(tx.inputs[i].outpoint);
    }
    let buf = writer.toBuffer();
    return Hash.sha256sha256(buf);
  }

  private static _getPrevoutHashOf(tx: Transaction, inputNumber: number): Buffer {
    let writer = new BufferWriter();
    writer.writeUInt8(tx.inputs[inputNumber].type);
    writer.writeReverse(tx.inputs[inputNumber].outpoint);
    let buf = writer.toBuffer();
    return Hash.sha256sha256(buf);
  }

  private static _getSequenceHash(tx: Transaction, firstN: number): Buffer {
    let writer = new BufferWriter();
    for (let i = 0; i < firstN; i++) { 
      writer.writeUInt32LE(tx.inputs[i].sequenceNumber);
    }
    let buf = writer.toBuffer();
    return Hash.sha256sha256(buf);
  }

  private static _getSequenceHashOf(tx: Transaction, inputNumber: number): Buffer {
    let writer = new BufferWriter();
    writer.writeUInt32LE(tx.inputs[inputNumber].sequenceNumber);
    let buf = writer.toBuffer();
    return Hash.sha256sha256(buf);
  }

  private static _getInputAmountHash(tx: Transaction, firstN: number): Buffer {
    let writer = new BufferWriter();
    for (let i = 0; i < firstN; i++) { 
      writer.writeUInt64LEBN(BN.fromBigInt(tx.inputs[i].amount));
    }
    let buf = writer.toBuffer();
    return Hash.sha256sha256(buf);
  }

  private static _getInputAmountHashOf(tx: Transaction, inputNumber: number): Buffer {
    let writer = new BufferWriter();
    writer.writeUInt64LEBN(BN.fromBigInt(tx.inputs[inputNumber].amount));
    let buf = writer.toBuffer();
    return Hash.sha256sha256(buf);
  }

  private static _getOutputsHash(tx: Transaction, firstN: number): Buffer {
    let writer = new BufferWriter();
    for (let i = 0; i < firstN; i++) { 
      tx.outputs[i].toBufferWriter(writer);
    }
    let buf = writer.toBuffer();
    return Hash.sha256sha256(buf);
  }

  private static _getOutputsHashOf(tx: Transaction, out1: number, out2: number): Buffer {
    let writer = new BufferWriter();
    tx.outputs[out1].toBufferWriter(writer);
    tx.outputs[out2].toBufferWriter(writer);
    let buf = writer.toBuffer();
    return Hash.sha256sha256(buf);
  }
}