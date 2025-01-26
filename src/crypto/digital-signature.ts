import { isNil } from "lodash-es";
import type { IDigitalSignature, IPrivateKey, IPublicKey, ISignature } from "../common/interfaces";
import type { EndianType } from "../common/types";
import BufferUtils from "../utils/buffer.utils";
import ValidationUtils from "../utils/validation.utils";
import BN from "./bn.extension";
import Signature from "./signature";

export default abstract class DigitalSignature implements IDigitalSignature {
  
  hashbuf!: Buffer;
  endian?: EndianType;
  privkey!: IPrivateKey;
  pubkey!: IPublicKey;
  sig?: ISignature;
  verified?: boolean;

  constructor(obj?: Partial<IDigitalSignature>) {
    if (obj) {
      this.set(obj);
    }
  }

  protected set(obj: Partial<IDigitalSignature>): this {
    this.hashbuf = obj.hashbuf || this.hashbuf;
    this.endian = obj.endian || this.endian;
    this.privkey = obj.privkey || this.privkey;
    this.pubkey = obj.pubkey || (this.privkey ? this.privkey.publicKey : this.pubkey);
    this.sig = obj.sig || this.sig;
    this.verified = obj.verified || this.verified;
    return this;
  }

  protected abstract _findSignature(d: BN, e: BN): Partial<ISignature>;

  public abstract sigError(): boolean | string;

  public sign(): this {
    let hashbuf = this.hashbuf;
    let privkey = this.privkey;
    let d = privkey.bn;
  
    ValidationUtils.validateState(!isNil(hashbuf) && !isNil(privkey) && !isNil(d), 'invalid parameters');
    ValidationUtils.validateState(BufferUtils.isBuffer(hashbuf) && hashbuf.length === 32, 'hashbuf must be a 32 byte buffer');

    let e = BN.fromBuffer(hashbuf, this.endian ? { endian: this.endian } : undefined);
    
    let obj = this._findSignature(d, e);
    obj.compressed = this.pubkey!.compressed;
    
    this.sig = new Signature(obj);
    return this;
  }

  public verify(): this {
    this.verified = !this.sigError();
    return this;
  }

  public toPublicKey(): IPublicKey {
    return this.privkey.toPublicKey();
  }

  public privkey2pubkey(): void {
    this.pubkey = this.privkey.toPublicKey();
  }
}