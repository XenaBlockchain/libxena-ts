import { isObject, isString, isUndefined } from "lodash-es";
import PublicKey from "../../../keys/publickey";
import ValidationUtils from "../../../utils/validation.utils";
import { Opcode } from "../../script/opcode";
import Script from "../../script/script";
import Input from "./input";
import type PrivateKey from "../../../keys/privatekey";
import type TxSignature from "../txsignature";
import ScriptFactory from "../../script/script.factory";
import Hash from "../../../crypto/hash";
import BufferUtils from "../../../utils/buffer.utils";
import type { IInput } from "../interfaces";

export default class ScriptTemplateInput extends Input {

  public templateScript: Script;
  public constraintScript: Script | Opcode.OP_FALSE;
  public publicKey?: PublicKey;

  /**
   * Represents a special kind of input of generic ScriptTemplate kind.
   * 
   * WARNING: this is a general case where the signature is similar to p2pkt and added to scriptSig as push signature data.
   * If you have complex smart contract, consider extending this class (or Input class) and implement the necessary logic,
   * or sign it manually.
   */
  constructor(arg: IInput) {
    ValidationUtils.validateArgument(isObject(arg?.templateData), 'Missing template object');
    ValidationUtils.validateArgument(isObject(arg?.output), 'Missing associated utxo');

    let td = arg.templateData!;
    ValidationUtils.validateArgument(td.templateScript instanceof Script || isString(td.templateScript), 'Invalid template');
    ValidationUtils.validateArgument(td.constraintScript instanceof Script || isString(td.constraintScript) || td.constraintScript === Opcode.OP_FALSE, 'Invalid constraint');
    ValidationUtils.validateArgument(isUndefined(td.publicKey) || td.publicKey instanceof PublicKey || isString(td.publicKey), 'Invalid pubkey');

    super(arg);
    this.templateScript = isString(td.templateScript) ? Script.fromString(td.templateScript) : td.templateScript;
    this.constraintScript = isString(td.constraintScript) ? Script.fromString(td.constraintScript) : td.constraintScript;
    this.publicKey = isString(td.publicKey) ? PublicKey.fromString(td.publicKey) : td.publicKey;

    let templateHash = this.output!.scriptPubKey.getTemplateHash();
    ValidationUtils.validateState(BufferUtils.isBuffer(templateHash) && templateHash.equals(Hash.sha256ripemd160(this.templateScript.toBuffer())), "Provided template doesn't match to the provided output");

    let constraintHash = this.output!.scriptPubKey.getConstraintHash();
    let isScriptMatch = this.constraintScript instanceof Script && BufferUtils.isBuffer(constraintHash)
                    && constraintHash.equals(Hash.sha256ripemd160(this.constraintScript.toBuffer()));
    ValidationUtils.validateState(constraintHash === this.constraintScript || isScriptMatch, "Provided constraint doesn't match to the provided output"); 
  }

  public override toJSON = this.toObject;

  public override toObject(): IInput {
    let input = super.toObject()
    return {
      ...input,
      templateData: {
        templateScript: this.templateScript.toHex(),
        constraintScript: this.constraintScript === Opcode.OP_FALSE ? Opcode.OP_FALSE : this.constraintScript.toHex(),
        publicKey: this.publicKey?.toString()
      }
    }
  }

  public static override fromObject(obj: IInput): ScriptTemplateInput {
    ValidationUtils.validateArgument(isObject(obj), "obj");
    return new ScriptTemplateInput(obj);
  }

  public override getSubscript(): Script {
    return this.templateScript;
  }

  public override canSign(privateKey: PrivateKey): boolean {
    return this.publicKey?.toString() === privateKey.publicKey.toString();
  }

  public override isFullySigned(): boolean {
    return this.scriptSig.isScriptTemplateIn()
          && this.templateScript.equals(Script.fromBuffer(this.scriptSig.chunks[0].buf!))
          && (!(this.constraintScript instanceof Script) || this.constraintScript.equals(Script.fromBuffer(this.scriptSig.chunks[1].buf!)));
  }

  public override addSignature(signature: TxSignature): this {
    let satisfier = Script.empty().add(signature.toTxSatisfier());
    this.scriptSig = ScriptFactory.buildScriptTemplateIn(this.templateScript, this.constraintScript, satisfier);
    return this;
  }

  public override estimateSize(): number {
    if (this.isFullySigned()) {
      return super.estimateSize();
    }
    let scriptSize = this._estimateScriptSize();

    // type + outpoint + scriptlen + script + sequence + amount
    return 1 + 32 + (scriptSize < 253 ? 1 : 3) + scriptSize + 4 + 8;
  }

  protected _estimateScriptSize(): number {
    // here we calculate by template size, constraint size if not op_false, and satisfier size as sigsize (1 + 64)
    let s = Script.empty().add(this.templateScript.toBuffer());
    if (this.constraintScript instanceof Script) {
      s.add(this.constraintScript.toBuffer());
    }
    return s.toBuffer().length + 1 + 64;
  }
}