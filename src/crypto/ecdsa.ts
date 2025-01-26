import { isUndefined } from "lodash-es";
import type { IPrivateKey, IPublicKey, ISignature } from "../common/interfaces";
import type { EndianType } from "../common/types";
import BufferUtils from "../utils/buffer.utils";
import BN from "./bn.extension";
import DigitalSignature from "./digital-signature";
import Point from "./point";
import Hash from "./hash";
import ValidationUtils from "../utils/validation.utils";
import PublicKey from "../keys/publickey";

/**
 * IMPORTANT: ECDSA only used for compact message signing.
 * for transactions signing, use Schnorr.
 */
export default class ECDSA extends DigitalSignature {

  k?: BN;

  public override set(obj: Partial<ECDSA>): this {
    this.k = obj.k || this.k;
    return super.set(obj);
  }

  public override sigError(): boolean | string {
    if (!BufferUtils.isBuffer(this.hashbuf) || this.hashbuf.length !== 32) {
      return 'hashbuf must be a 32 byte buffer';
    }
  
    let r = this.sig!.r;
    let s = this.sig!.s;
    if (!(r.gt(BN.Zero) && r.lt(Point.getN())) || !(s.gt(BN.Zero) && s.lt(Point.getN()))) {
      return 'r and s not in range';
    }
  
    let e = BN.fromBuffer(this.hashbuf, this.endian ? { endian: this.endian } : undefined);
    let n = Point.getN();
    let sinv = s.invm(n);
    let u1 = sinv.mul(e).umod(n);
    let u2 = sinv.mul(r).umod(n);
  
    let p = Point.getG().mulAdd(new BN(u1), this.pubkey.point, new BN(u2));

    /* c8 ignore start */
    if (p.ecPoint.isInfinity()) {
      return 'p is infinity';
    }
    /* c8 ignore stop */

    if (p.getX().umod(n).cmp(r) !== 0) {
      return 'Invalid signature';
    } else {
      return false;
    }
  }

  protected override _findSignature(d: BN, e: BN): Partial<ISignature> {
    let N = Point.getN();
    let G = Point.getG();
    // try different values of k until r, s are valid
    let badrs = 0;
    let k, Q, r, s;
    do {
      if (!this.k || badrs > 0) {
        this.deterministicK(badrs);
      }
      badrs++;
      k = this.k;
      Q = G.mul(k!);
      r = Q.ecPoint.x!.umod(N);
      s = k!.invm(N).mul(e.add(d.mul(r))).umod(N);
    } while (r.cmp(BN.Zero) <= 0 || s.cmp(BN.Zero) <= 0);

    s = ECDSA.toLowS(new BN(s));
    return { s: s, r: new BN(r) };
  }

  private static toLowS(s: BN): BN {
    //enforce low s
    //see BIP 62, "low S values in signatures"
    if (s.gt(BN.fromBuffer(Buffer.from('7FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF5D576E7357A4501DDFE92F46681B20A0', 'hex')))) {
      s = Point.getN().sub(s);
    }
    return s;
  }

  public calcI(): this {
    for (let i = 0; i < 4; i++) {
      this.sig!.i = i;
      let Qprime;
      try {
        Qprime = this.toPublicKey();
        /* c8 ignore next 3 */
      } catch {
        continue;
      }
  
      if (Qprime.point.eq(this.pubkey.point)) {
        this.sig!.compressed = this.pubkey.compressed;
        return this;
      }
    /* c8 ignore next 4 */
    }
   
    this.sig!.i = undefined;
    throw new Error(`Unable to find valid recovery factor`);
  }

  public randomK(): this {
    let N = Point.getN();
    let k;
    do {
      k = BN.fromBuffer(BufferUtils.getRandomBuffer(32));
    } while (!(k.lt(N) && k.gt(BN.Zero)));
    this.k = k;
    return this;
  }
  
  // https://tools.ietf.org/html/rfc6979#section-3.2
  public deterministicK(badrs?: number): this {
    // if r or s were invalid when this function was used in signing,
    // we do not want to actually compute r, s here for efficiency, so,
    // we can increment badrs. explained at end of RFC 6979 section 3.2
    if (isUndefined(badrs)) {
      badrs = 0;
    }
    let v: Buffer = Buffer.alloc(32);
    v.fill(0x01);
    let k: Buffer = Buffer.alloc(32);
    k.fill(0x00);
    let x = this.privkey.bn.toBuffer({ size: 32 });
    let hashbuf = this.endian === 'little' ? BufferUtils.reverse(this.hashbuf) : this.hashbuf
    k = Hash.sha256hmac(Buffer.concat([v, Buffer.from([0x00]), x, hashbuf]), k);
    v = Hash.sha256hmac(v, k);
    k = Hash.sha256hmac(Buffer.concat([v, Buffer.from([0x01]), x, hashbuf]), k);
    v = Hash.sha256hmac(v, k);
    v = Hash.sha256hmac(v, k);
    let T = BN.fromBuffer(v);
    let N = Point.getN();
  
    // also explained in 3.2, we must ensure T is in the proper range (0, N)
    for (let i = 0; i < badrs || !(T.lt(N) && T.gt(BN.Zero)); i++) {
      k = Hash.sha256hmac(Buffer.concat([v, Buffer.from([0x00])]), k);
      v = Hash.sha256hmac(v, k);
      v = Hash.sha256hmac(v, k);
      T = BN.fromBuffer(v);
    }
  
    this.k = T;
    return this;
  }

  public signRandomK(): this {
    this.randomK();
    return this.sign();
  }
  
  public toString(): string {
    let obj: Record<string, string> = {};
    if (this.hashbuf) {
      obj.hashbuf = this.hashbuf.toString('hex');
    }
    if (this.privkey) {
      obj.privkey = this.privkey.toString();
    }
    if (this.pubkey) {
      obj.pubkey = this.pubkey.toString();
    }
    if (this.sig) {
      obj.sig = this.sig.toString();
    }
    if (this.k) {
      obj.k = this.k.toString();
    }
    return JSON.stringify(obj);
  }

  // Information about public key recovery:
  // https://bitcointalk.org/index.php?topic=6430.0
  // http://stackoverflow.com/questions/19665491/how-do-i-get-an-ecdsa-public-key-from-just-a-bitcoin-signature-sec1-4-1-6-k
  public override toPublicKey(): PublicKey {
    let i = this.sig!.i!;
    ValidationUtils.validateArgument(i === 0 || i === 1 || i === 2 || i === 3, 'i must be equal to 0, 1, 2, or 3');

    let e = BN.fromBuffer(this.hashbuf);
    let r = this.sig!.r;
    let s = this.sig!.s;

    // A set LSB signifies that the y-coordinate is odd
    let isYOdd = i & 1;

    // The more significant bit specifies whether we should use the
    // first or second candidate key.
    let isSecondKey = i >> 1;

    let n = Point.getN();
    let G = Point.getG();

    // 1.1 Let x = r + jn
    let x = isSecondKey ? r.add(n) : r;
    let R = Point.ecPointFromX(!!isYOdd, x);

    // 1.4 Check that nR is at infinity
    let nR = R.mul(n);

    /* c8 ignore start */
    if (!nR.ecPoint.isInfinity()) {
      throw new Error('nR is not a valid curve point');
    }
    /* c8 ignore stop */

    // Compute -e from e
    let eNeg = e.neg().umod(n);

    // 1.6.1 Compute Q = r^-1 (sR - eG)
    // Q = r^-1 (sR + -eG)
    let rInv = r.invm(n);

    //let Q = R.multiplyTwo(s, G, eNeg).mul(rInv);
    let Q = R.mul(s).add(G.mul(new BN(eNeg))).mul(new BN(rInv));

    let pubkey = PublicKey.fromPoint(Q, this.sig!.compressed);

    return pubkey;
  }
    
  public static fromString(str: string): ECDSA {
    let obj = JSON.parse(str);
    return new ECDSA(obj);
  }
  
  public static sign(hashbuf: Buffer, privkey: IPrivateKey, endian?: EndianType): ISignature {
    return new ECDSA({
      hashbuf: hashbuf,
      endian: endian,
      privkey: privkey
    }).sign().sig!;
  }
  
  public static verify(hashbuf: Buffer, sig: ISignature, pubkey: IPublicKey, endian?: EndianType): boolean {
    return new ECDSA({
      hashbuf: hashbuf,
      endian: endian,
      sig: sig,
      pubkey: pubkey
    }).verify().verified!;
  }
}