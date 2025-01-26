import BN from "bn.js";
import ValidationUtils from "../utils/validation.utils";
import BufferUtils from "../utils/buffer.utils";
import { isNumber, isString } from "lodash-es";
import type { BNOptions } from "../common/interfaces";

export default class BNExtended extends BN {

  public static Zero = new BNExtended(0);
  public static One = new BNExtended(1);
  public static Minus1 = new BNExtended(-1);

  public static fromNumber(num: number): BNExtended {
    ValidationUtils.validateArgument(isNumber(num), "num");
    return new BNExtended(num);
  }

  public static fromBigInt(num: bigint): BNExtended {
    ValidationUtils.validateArgument(typeof num === 'bigint', "num");
    return new BNExtended(num.toString());
  }
  
  public static fromString(str: string, base?: number | "hex"): BNExtended {
    ValidationUtils.validateArgument(isString(str), "str");
    return new BNExtended(str, base);
  }
  
  public static fromBuffer(buf: Buffer, opts?: BNOptions): BNExtended {
    ValidationUtils.validateArgument(BufferUtils.isBuffer(buf), "buf");
    if (opts?.endian === 'little') {
      buf = BufferUtils.reverse(buf);
    }
    return new BNExtended(buf.toString('hex'), 16);
  }

  /**
   * Create a BN from a "ScriptNum":
   * This is analogous to the constructor for CScriptNum in nexad. Many ops in
   * nexad's script interpreter use CScriptNum, which is not really a proper
   * bignum. Instead, an error is thrown if trying to input a number bigger than
   * 4 bytes. We copy that behavior here. A third argument, `size`, is provided to
   * extend the hard limit of 4 bytes, as some usages require more than 4 bytes.
   */
  public static fromScriptNumBuffer(buf: Buffer, fRequireMinimal?: boolean, size?: number): BNExtended {
    let nMaxNumSize = size || 4;
    ValidationUtils.validateArgument(buf.length <= nMaxNumSize, 'script number overflow');
    if (fRequireMinimal && buf.length > 0) {
      // Check that the number is encoded with the minimum possible
      // number of bytes.
      //
      // If the most-significant-byte - excluding the sign bit - is zero
      // then we're not minimal. Note how this test also rejects the
      // negative-zero encoding, 0x80.
      if ((buf[buf.length - 1] & 0x7f) === 0) {
        // One exception: if there's more than one byte and the most
        // significant bit of the second-most-significant-byte is set
        // it would conflict with the sign bit. An example of this case
        // is +-255, which encode to 0xff00 and 0xff80 respectively.
        // (big-endian).
        if (buf.length <= 1 || (buf[buf.length - 2] & 0x80) === 0) {
          throw new Error('non-minimally encoded script number');
        }
      }
    }
    return BNExtended.fromSM(buf, { endian: 'little' });
  }

  // Override arithmetic methods to ensure they return BNExtended instances
  public override add(b: BN): BNExtended {
    const result = super.add(b).toString();
    return new BNExtended(result);
  }

  public override sub(b: BN): BNExtended {
    const result = super.sub(b).toString();
    return new BNExtended(result);
  }

  public override mul(b: BN): BNExtended {
    const result = super.mul(b).toString();
    return new BNExtended(result);
  }

  public override mod(b: BN): BNExtended {
    const result = super.mod(b).toString();
    return new BNExtended(result);
  }

  public override umod(b: BN): BNExtended {
    const result = super.umod(b).toString();
    return new BNExtended(result);
  }

  public override toNumber(): number {
    return parseInt(this.toString(10), 10);
  }
  
  public toBigInt(): bigint {
    return BigInt(this.toString(10))
  }
  
  public override toBuffer(opts?: BN.Endianness | BNOptions, length?: number): Buffer {
    if (isString(opts)) {
      // compatability with override
      return super.toBuffer(opts, length);
    }

    let hex = this.toString(16, 2);
    let buf: Buffer = Buffer.from(hex, 'hex');

    if (opts?.size) {
      let natlen = hex.length / 2;
      if (natlen > opts.size) {
        buf = BNExtended.trim(buf, natlen);
      } else if (natlen < opts.size) {
        buf = BNExtended.pad(buf, natlen, opts.size);
      }
    }
  
    if (opts?.endian === 'little') {
      buf = BufferUtils.reverse(buf);
    }
  
    return buf;
  }

  /**
   * The corollary to the above, with the notable exception that we do not throw
   * an error if the output is larger than four bytes. (Which can happen if
   * performing a numerical operation that results in an overflow to more than 4
   * bytes).
   */
  public toScriptNumBuffer(): Buffer {
    return this.toSM({  endian: 'little' });
  }

  public toScriptBigNumBuffer(): Buffer {
    return this.toSM({ endian: 'little', bignum: true });
  }

  public getSize(): number {
    const bin = this.toString(2).replace('-', '');
    const numBits = bin.length + 1;
    return numBits / 8;
  }
  
  public safeAdd(bigNumToAdd: BNExtended, maxSize: number): BNExtended {
    const sum = this.add(bigNumToAdd);
    this.checkOperationForOverflow(bigNumToAdd, sum, maxSize);
    return sum;
  }
  
  public safeSub(bigNumToSubtract: BNExtended, maxSize: number): BNExtended {
    const difference = this.sub(bigNumToSubtract);
    this.checkOperationForOverflow(bigNumToSubtract, difference, maxSize);
    return difference;
  }
  
  public safeMul(bigNumToMultiply: BNExtended, maxSize: number): BNExtended {
    const product = this.mul(bigNumToMultiply);
    this.checkOperationForOverflow(bigNumToMultiply, product, maxSize);
    return product;
  }

  private checkOperationForOverflow(operand: BNExtended, result: BNExtended, maxSize: number): void {
    if (this.getSize() > maxSize || operand.getSize() > maxSize || result.getSize() > 8) {
      throw new Error('overflow');
    }
  }
  
  private toSMBigEndian(): Buffer {
    let buf;
    if (this.cmp(BNExtended.Zero) === -1) {
      buf = this.neg().toBuffer();
      if (buf[0] & 0x80) {
        buf = Buffer.concat([Buffer.from([0x80]), buf]);
      } else {
        buf[0] = buf[0] | 0x80;
      }
    } else {
      buf = this.toBuffer();
      if (buf[0] & 0x80) {
        buf = Buffer.concat([Buffer.from([0x00]), buf]);
      }
    }
  
    if (buf.length === 1 && buf[0] === 0) {
      buf = Buffer.from([]);
    }
    return buf;
  }
  
  private toBigNumSMBigEndian(): Buffer {
    let buf;
    if (this.cmp(BNExtended.Zero) === -1) {
      buf = this.neg().toBuffer();
      buf = Buffer.concat([Buffer.from([0x80]), buf]);
    } else {
      buf = this.toBuffer();
      buf = Buffer.concat([Buffer.from([0x00]), buf]);
    }

    return buf;
  }
  
  private toSM(opts: BNOptions): Buffer {
    let buf = opts?.bignum ? this.toBigNumSMBigEndian() : this.toSMBigEndian();
  
    if (opts?.endian === 'little') {
      buf = BufferUtils.reverse(buf);
    }

    return buf;
  }

  /**
 * Instantiate a BigNumber from a "signed magnitude buffer"
 * (a buffer where the most significant bit represents the sign (0 = positive, -1 = negative))
 */
  private static fromSM(buf: Buffer, opts?: BNOptions): BNExtended {
    if (buf.length === 0) {
      return this.fromBuffer(Buffer.from([0]));
    }

    if (opts?.endian === 'little') {
      buf = BufferUtils.reverse(buf);
    }

    let ret;
    if (buf[0] & 0x80) {
      buf[0] = buf[0] & 0x7f;
      ret = this.fromBuffer(buf);
      ret.neg().copy(ret);
    } else {
      ret = this.fromBuffer(buf);
    }
    return ret;
  }

  private static trim(buf: Buffer, natlen: number): Buffer {
    return buf.subarray(natlen - buf.length, natlen);
  }
  
  private static pad(buf: Buffer, natlen: number, size: number): Buffer {
    let rbuf = Buffer.alloc(size);
    for (let i = 0; i < buf.length; i++) {
      rbuf[rbuf.length - 1 - i] = buf[buf.length - 1 - i];
    }
    for (let i = 0; i < size - natlen; i++) {
      rbuf[i] = 0;
    }
    return rbuf;
  }
}