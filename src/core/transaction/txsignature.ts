import { isNil, isNumber, isObject, isString } from "lodash-es";
import Signature from "../../crypto/signature";
import PublicKey from "../../keys/publickey";
import Script from "../script/script";
import ValidationUtils from "../../utils/validation.utils";
import SighashType from "./sighashtype";
import CommonUtils from "../../utils/common.utils";

export interface ITxSignature {
  inputIndex: number;
  publicKey: PublicKey | string;
  subscript: Script | string;
  signature: Signature | string;
  sigType: SighashType | string;
}

export default class TxSignature implements ITxSignature {

  public inputIndex: number;
  public publicKey: PublicKey;
  public subscript: Script;
  public signature: Signature;
  public sigType: SighashType;

  /**
   * Wrapper around Signature with fields related to signing a transaction specifically
   */
  constructor(arg: ITxSignature) {
    TxSignature._validateArgs(arg);

    this.inputIndex = arg.inputIndex;
    this.publicKey = isString(arg.publicKey) ? PublicKey.fromString(arg.publicKey) : arg.publicKey;
    this.subscript = isString(arg.subscript) ? Script.fromHex(arg.subscript) : arg.subscript;
    this.signature = isString(arg.signature) ? Signature.fromString(arg.signature) : arg.signature;
    this.sigType = isString(arg.sigType) ? SighashType.fromString(arg.sigType) : arg.sigType;
  }

  private static _validateArgs(arg: ITxSignature): void {
    ValidationUtils.validateArgument(isObject(arg), 'TxSignature must be instantiated from an object');
    ValidationUtils.validateArgument(!isNil(arg.publicKey) && !!PublicKey.from(arg.publicKey), 'publicKey');
    ValidationUtils.validateArgument(!isNil(arg.inputIndex), 'inputIndex');
    ValidationUtils.validateState(isNumber(arg.inputIndex), 'inputIndex must be a number');
    ValidationUtils.validateArgument(!isNil(arg.subscript), 'subscript');
    ValidationUtils.validateState(arg.subscript instanceof Script || CommonUtils.isHexa(arg.subscript!), 'subscript must be an object or hexa value');
    ValidationUtils.validateArgument(!isNil(arg.signature), 'signature');
    ValidationUtils.validateState(arg.signature instanceof Signature || CommonUtils.isHexa(arg.signature!), 'signature must be an object or hexa value');
    ValidationUtils.validateState(arg.sigType instanceof SighashType || isString(arg.sigType), 'sigtype must be a sigtype object or string');
  }

  public toJSON = this.toObject;

  public toObject(): ITxSignature {
    return {
      inputIndex: this.inputIndex,
      publicKey: this.publicKey.toString(),
      subscript: this.subscript.toHex(),
      signature: this.signature.toString(),
      sigType: this.sigType.toString()
    }
  }

  public static fromObject(arg: ITxSignature): TxSignature {
    return new TxSignature(arg);
  }

  public toTxSatisfier(): Buffer {
    return this.signature.toTxFormat(this.sigType.toBuffer());
  }
}