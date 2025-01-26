import Hash from "../../../crypto/hash";
import type PrivateKey from "../../../keys/privatekey";
import { Opcode } from "../../script/opcode";
import Script from "../../script/script";
import ScriptFactory from "../../script/script.factory";
import Output from "../output";
import type TxSignature from "../txsignature";
import Input from "./input";

/**
 * Represents a special kind of input of PayToPublicKeyTemplate kind.
 */
export default class PublicKeyTemplateInput extends Input {

  public static readonly SCRIPT_SIZE = 100; // pubkey push script (1 + 34) + sigsize (1 + 64)

  public override getSubscript(): Script {
    return Script.empty().add(Opcode.OP_FROMALTSTACK).add(Opcode.OP_CHECKSIGVERIFY);
  }

  public override canSign(privateKey: PrivateKey): boolean {
    if (!(this.output instanceof Output)) {
      return false;
    }
    let constraintHash = Hash.sha256ripemd160(Script.empty().add(privateKey.publicKey.toBuffer()).toBuffer());
    return constraintHash.equals(this.output.scriptPubKey.getConstraintHash() as Buffer);
  }

  public override isFullySigned(): boolean {
    return this.scriptSig.isPublicKeyTemplateIn();
  }

  public override addSignature(signature: TxSignature): this {
    let constraint = Script.empty().add(signature.publicKey.toBuffer());
    let satisfier = Script.empty().add(signature.toTxSatisfier());
    this.scriptSig = ScriptFactory.buildScriptTemplateIn(Opcode.OP_1, constraint, satisfier);
    return this;
  }

  public override estimateSize(): number {
    if (this.isFullySigned()) {
      return super.estimateSize();
    }
    // type + outpoint + scriptlen + script + sequence + amount
    return 1 + 32 + 1 + PublicKeyTemplateInput.SCRIPT_SIZE + 4 + 8;
  }
}