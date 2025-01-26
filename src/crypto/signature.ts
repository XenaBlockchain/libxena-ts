import { isUndefined } from "lodash-es";
import type { ISignature } from "../common/interfaces";
import BufferUtils from "../utils/buffer.utils";
import ValidationUtils from "../utils/validation.utils";
import BN from "./bn.extension";

export default class Signature implements ISignature {

  public r: BN;
  public s: BN;
  public i?: number;
  public compressed?: boolean;

  constructor(params: Partial<ISignature>) {
    this.r = params.r!;
    this.s = params.s!;
    this.i = params.i;
    this.compressed = params.compressed;
  }

  public toBuffer(isSchnorr = true): Buffer {
    if (isSchnorr) {
      // Schnorr signatures use a 64 byte r,s format.
      return Buffer.concat([this.r.toBuffer({size: 32}), this.s.toBuffer({size: 32})]);
    }
    
    let rnbuf = this.r.toBuffer();
    let snbuf = this.s.toBuffer();
    
    let rneg = rnbuf[0] & 0x80 ? true : false;
    /* c8 ignore next */
    let sneg = snbuf[0] & 0x80 ? true : false;

    let rbuf = rneg ? Buffer.concat([Buffer.from([0x00]), rnbuf]) : rnbuf;
    /* c8 ignore next */
    let sbuf = sneg ? Buffer.concat([Buffer.from([0x00]), snbuf]) : snbuf;

    let rlength = rbuf.length;
    let slength = sbuf.length;
    let length = 2 + rlength + 2 + slength;
    let rheader = 0x02;
    let sheader = 0x02;
    let header = 0x30;

    let der = Buffer.concat([Buffer.from([header, length, rheader, rlength]), rbuf, Buffer.from([sheader, slength]), sbuf]);
    return der;
  }

  public toTxFormat(sighashBuf?: Buffer): Buffer {
    let sigbuf = this.toBuffer();
    if (BufferUtils.isBuffer(sighashBuf)) {
      return Buffer.concat([sigbuf, sighashBuf]);
    }
    return sigbuf;
  }

  public toString(): string {
    return this.toBuffer().toString('hex');
  }

  /**
   * Schnorr signatures are 64 bytes: r [len] 32 || s [len] 32.
   * 
   * There can be a few more bytes that is the sighashtype. It needs to be trimmed before calling this.
   */
  public static fromBuffer(buf: Buffer, strict?: boolean): Signature {
    if (buf.length === 64) {
      let params = this.parseSchnorrEncodedSig(buf);
      return new Signature(params);
    }
    
    let obj = Signature.parseDER(buf, strict);
    return new Signature({ r: obj.r as BN, s: obj.s as BN });
  }

  /**
   * The format used in a tx.
   * schnorr is 64 bytes, the rest are sighashtype bytes
   * 
   * @param buf 
   */
  public static fromTxFormat(buf: Buffer): Signature {
    let sigbuf = buf.subarray(0, 64);
    return Signature.fromBuffer(sigbuf);
  }

  /**
   * This assumes the str is a raw signature and does not have sighashtype.
   * Use {@link Signature.fromTxString} when decoding a tx
   * 
   * @param str the signature hex string
   * @see fromTxString
   */
  public static fromString(str: string): Signature {
    let buf = Buffer.from(str, 'hex');
    return Signature.fromBuffer(buf);
  }

  /**
   * This assumes the str might have sighashtype bytes and will trim it if needed.
   * Use this when decoding a tx signature string
   * 
   * @param str the tx signature hex string
   */
  public static fromTxString(str: string, encoding: BufferEncoding = 'hex'): Signature {
    return Signature.fromTxFormat(Buffer.from(str, encoding))
  }

  private static parseSchnorrEncodedSig(buf: Buffer): Partial<ISignature> {
    let r = buf.subarray(0,32);
    let s = buf.subarray(32, 64);

    return {
      r: BN.fromBuffer(r),
      s: BN.fromBuffer(s),
    };
  }

  /**
   * For ECDSA. In order to mimic the non-strict DER encoding of OpenSSL, set strict = false.
   */
  public static parseDER(buf: Buffer, strict?: boolean): Record<string, unknown> {
    ValidationUtils.validateArgument(BufferUtils.isBuffer(buf), 'DER formatted signature should be a buffer');
    if (isUndefined(strict)) {
      strict = true;
    }

    let header = buf[0];
    ValidationUtils.validateArgument(header === 0x30, 'Header byte should be 0x30');

    let length = buf[1];
    let buflength = buf.subarray(2).length;
    ValidationUtils.validateArgument(!strict || length === buflength, 'Length byte should length of what follows');

    length = length < buflength ? length : buflength;

    let rheader = buf[2 + 0];
    ValidationUtils.validateArgument(rheader === 0x02, 'Integer byte for r should be 0x02');

    let rlength = buf[2 + 1];
    let rbuf = buf.subarray(2 + 2, 2 + 2 + rlength);
    let r = BN.fromBuffer(rbuf);
    let rneg = buf[2 + 1 + 1] === 0x00 ? true : false;
    ValidationUtils.validateArgument(rlength === rbuf.length, 'Length of r incorrect');

    let sheader = buf[2 + 2 + rlength + 0];
    ValidationUtils.validateArgument(sheader === 0x02, 'Integer byte for s should be 0x02');

    let slength = buf[2 + 2 + rlength + 1];
    let sbuf = buf.subarray(2 + 2 + rlength + 2, 2 + 2 + rlength + 2 + slength);
    let s = BN.fromBuffer(sbuf);
    /* c8 ignore next */
    let sneg = buf[2 + 2 + rlength + 2 + 2] === 0x00 ? true : false;
    ValidationUtils.validateArgument(slength === sbuf.length, 'Length of s incorrect');

    let sumlength = 2 + 2 + rlength + 2 + slength;
    ValidationUtils.validateArgument(length === sumlength - 2, 'Length of signature incorrect');

    let obj = {
      header: header,
      length: length,
      rheader: rheader,
      rlength: rlength,
      rneg: rneg,
      rbuf: rbuf,
      r: r,
      sheader: sheader,
      slength: slength,
      sneg: sneg,
      sbuf: sbuf,
      s: s
    };

    return obj;
  }

  /**
   * ECDSA format. used for sign messages
   */
  public toCompact(i?: number, compressed?: boolean): Buffer {
    i = typeof i === 'number' ? i : this.i;
    compressed = typeof compressed === 'boolean' ? compressed : this.compressed;

    ValidationUtils.validateArgument(i === 0 || i === 1 || i === 2 || i === 3, 'i must be equal to 0, 1, 2, or 3');

    let val = i! + 27 + 4;
    if (compressed === false) {
      val = val - 4;
    }
    let b1 = Buffer.from([val]);
    let b2 = this.r.toBuffer({ size: 32 });
    let b3 = this.s.toBuffer({ size: 32 });

    return Buffer.concat([b1, b2, b3]);
  }

  public static fromCompact(buf: Buffer): Signature {
    ValidationUtils.validateArgument(BufferUtils.isBuffer(buf), 'Argument is expected to be a Buffer');

    let compressed = true;
    let i = buf.subarray(0, 1)[0] - 27 - 4;
    if (i < 0) {
      compressed = false;
      i = i + 4;
    }

    let b2 = buf.subarray(1, 33);
    let b3 = buf.subarray(33, 65);

    ValidationUtils.validateArgument(i === 0 || i === 1 || i === 2 || i === 3, 'i must be 0, 1, 2, or 3');
    ValidationUtils.validateArgument(b2.length === 32, 'r must be 32 bytes');
    ValidationUtils.validateArgument(b3.length === 32, 's must be 32 bytes');

    return new Signature({ r: BN.fromBuffer(b2), s: BN.fromBuffer(b3), i: i, compressed: compressed });
  };
}