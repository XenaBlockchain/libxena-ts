import Hash from "../../../crypto/hash";
import type PrivateKey from "../../../keys/privatekey";
import ValidationUtils from "../../../utils/validation.utils";
import type Script from "../../script/script";
import ScriptFactory from "../../script/script.factory";
import Output from "../output";
import type TxSignature from "../txsignature";
import Input from "./input";

/**
 * Represents a special kind of input of PayToPublicKeyHash kind.
 */
export default class PublicKeyHashInput extends Input {

  public static readonly SCRIPT_SIZE = 99; // pubkey (1 + 33) + sigsize (1 + 64)

  public override getSubscript(): Script {
    ValidationUtils.validateState(this.output instanceof Output, "missing associated output");
    return this.output!.scriptPubKey;
  }

  public override canSign(privateKey: PrivateKey): boolean {
    if (!(this.output instanceof Output)) {
      return false;
    }
    let pkh = Hash.sha256ripemd160(privateKey.publicKey.toBuffer());
    return pkh.equals(this.output.scriptPubKey.getPublicKeyHash());
  }

  public override isFullySigned(): boolean {
    return this.scriptSig.isPublicKeyHashIn();
  }

  public override addSignature(signature: TxSignature): this {
    this.scriptSig = ScriptFactory.buildPublicKeyHashIn(signature.publicKey, signature.signature);
    return this;
  }

  public override estimateSize(): number {
    if (this.isFullySigned()) {
      return super.estimateSize();
    }
    // type + outpoint + scriptlen + script + sequence + amount
    return 1 + 32 + 1 + PublicKeyHashInput.SCRIPT_SIZE + 4 + 8;
  }
}