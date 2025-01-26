import type { IPrivateKey, IPublicKey, ISignature } from "../common/interfaces";
import type { EndianType } from "../common/types";
import BufferUtils from "../utils/buffer.utils";
import ValidationUtils from "../utils/validation.utils";
import BN from "./bn.extension";
import DigitalSignature from "./digital-signature";
import Point from "./point";
import Hash from "./hash";

export default class Schnorr extends DigitalSignature {

  public override sigError(): boolean | string {
    if (!BufferUtils.isBuffer(this.hashbuf) || this.hashbuf.length !== 32) {
      return 'hashbuf must be a 32 byte buffer';
    }

    let sigLength = Schnorr.getProperSizeBuffer(this.sig!.r).length + Schnorr.getProperSizeBuffer(this.sig!.s).length;
    
    if(!(sigLength === 64 || sigLength === 65)) {
      return 'signature must be a 64 byte or 65 byte array';
    } 

    let hashbuf = this.endian === 'little' ? BufferUtils.reverse(this.hashbuf) : this.hashbuf
    
    let P = this.pubkey.point;
    let G = Point.getG();

    if(P.ecPoint.isInfinity()) return true; /* c8 ignore next */
    
    let r = this.sig!.r;
    let s = this.sig!.s;

    let p = new BN('FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEFFFFFC2F', 'hex');
    let n = Point.getN();

    if(r.gte(p) || s.gte(n)) {
      // ("Failed >= condition") 
      return true;
    }
    
    let Br = Schnorr.getProperSizeBuffer(this.sig!.r);
    let Bp = Point.pointToCompressed(P);
    
    let hash = Hash.sha256(Buffer.concat([Br, Bp, hashbuf]));
    let e = BN.fromBuffer(hash, { endian: 'big' }).umod(n);
    
    let sG = G.mul(s);
    let eP = P.mul(n.sub(e));
    let R = sG.add(eP);
    
    if(R.ecPoint.isInfinity() || !R.hasSquare() || !R.getX().eq(r)) {
      return true;
    } 
    return false;
  }

  /**
   * RFC6979 deterministic nonce generation used from https://reviews.bitcoinabc.org/D2501
   * 
   * @param privkeybuf 
   * @param msgbuf 
   * @return BN nonce
   */
  public nonceFunctionRFC6979(privkeybuf: Buffer, msgbuf: Buffer): BN {
    let V: Buffer = Buffer.from("0101010101010101010101010101010101010101010101010101010101010101","hex");
    let K: Buffer = Buffer.from("0000000000000000000000000000000000000000000000000000000000000000","hex");

    let blob = Buffer.concat([privkeybuf, msgbuf, Buffer.from("", "ascii"), Buffer.from("Schnorr+SHA256  ", "ascii")]);

    K = Hash.sha256hmac(Buffer.concat([V, Buffer.from('00', 'hex'), blob]), K);
    V = Hash.sha256hmac(V,K); 

    K = Hash.sha256hmac(Buffer.concat([V,Buffer.from('01','hex'), blob]), K);
    V = Hash.sha256hmac(V,K);

    let k = new BN(0);
    let T;
    while (true) {
      V = Hash.sha256hmac(V,K);
      T = BN.fromBuffer(V);
      k = T;

      ValidationUtils.validateState(V.length >= 32, "V length should be >= 32");

      if (k.gt(new BN(0)) && k.lt(Point.getN())) {
        break;
      }/* c8 ignore start */

      K = Hash.sha256hmac(Buffer.concat([V, Buffer.from("00", 'hex')]), K);
      V = Hash.sha256hmac(V, K);
    }/* c8 ignore stop */

    return k;
  }

  /**
   * @remarks
   * Important references for schnorr implementation {@link https://spec.nexa.org/forks/2019-05-15-schnorr/}
   * 
   * @param d the private key
   * @param e the message to be signed
   */
  protected override _findSignature(d: BN, e: BN): Partial<ISignature> {
    let n = Point.getN();
    let G = Point.getG();

    ValidationUtils.validateState(!d.lte(new BN(0)), 'privkey out of field of curve');
    ValidationUtils.validateState(!d.gte(n), 'privkey out of field of curve');

    
    let k = this.nonceFunctionRFC6979(d.toBuffer({ size: 32 }), e.toBuffer({ size: 32 }));

    let P = G.mul(d);
    let R = G.mul(k);

    // Find deterministic k
    if(R.hasSquare()) {
      k = k;
    } else {
      k = n.sub(k);
    }
    
    let r = R.getX();
    let e0 = BN.fromBuffer(Hash.sha256(Buffer.concat([Schnorr.getProperSizeBuffer(r), Point.pointToCompressed(P), e.toBuffer({ size: 32 })])));
    
    let s = ((e0.mul(d)).add(k)).mod(n);

    return { r: r, s: s };
  }

  /**
   * Function written to ensure s or r parts of signature is at least 32 bytes, when converting 
   * from a BN to type Buffer.
   * The BN type naturally cuts off leading zeros, e.g.
   * <BN: 4f92d8094f710bc11b93935ac157730dda26c5c2a856650dbd8ebcd730d2d4> 31 bytes
   * Buffer <00 4f 92 d8 09 4f 71 0b c1 1b 93 93 5a c1 57 73 0d da 26 c5 c2 a8 56 65 0d bd 8e bc d7 30 d2 d4> 32 bytes
   * Both types are equal, however Schnorr signatures must be a minimum of 64 bytes.
   * In a previous implementation of this schnorr module, was resulting in 63 byte signatures. 
   * (Although it would have been verified, it's proper to ensure the min requirement)
   * 
   * @param buf the r or s signature part
   */
  private static getProperSizeBuffer(buf: BN): Buffer {
    if (buf.toBuffer().length < 32) {
      return buf.toBuffer({size: 32});
    }
    return buf.toBuffer();
  }

  public static sign(hashbuf: Buffer, privkey: IPrivateKey, endian: EndianType): ISignature {
    return new Schnorr({
      hashbuf: hashbuf,
      endian: endian,
      privkey: privkey
    }).sign().sig!;
  }
  
  public static verify(hashbuf: Buffer, sig: ISignature, pubkey: IPublicKey, endian: EndianType): boolean {
    return new Schnorr({
      hashbuf: hashbuf,
      endian: endian,
      sig: sig,
      pubkey: pubkey
    }).verify().verified!;
  }
}