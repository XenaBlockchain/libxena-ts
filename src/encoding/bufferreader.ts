import ValidationUtils from "../utils/validation.utils";
import BN from "../crypto/bn.extension";
import BufferUtils from "../utils/buffer.utils";
import type { BufferParams } from "../common/interfaces";
import { isObject, isString, isUndefined } from "lodash-es";

export default class BufferReader {

  public buf: Buffer;
  public pos: number;

  constructor(buf?: Buffer | string | BufferParams) {
    this.buf = Buffer.from([]);
    this.pos = 0;

    if (isUndefined(buf)) {
      return;
    }
    
    if (Buffer.isBuffer(buf)) {
      this.set({ buf: buf });
    } else if (isString(buf)) {
      let b = Buffer.from(buf, 'hex');
      if (b.length * 2 != buf.length)  {
        throw new TypeError('Invalid hex string');
      }
      this.set({ buf: b });
    } else if (isObject(buf)) {
      let obj = buf;
      this.set(obj);
    } else {
      throw new TypeError('Unrecognized argument for BufferReader');
    }
  }

  public set(obj: BufferParams): this {
    this.buf = obj.buf || this.buf;
    this.pos = obj.pos || this.pos || 0;
    return this;
  }

  public eof(): boolean {
    return this.pos >= this.buf.length;
  }
  
  public finished = this.eof;

  public read(len: number): Buffer {
    ValidationUtils.validateArgument(!isUndefined(len), 'Must specify a length');
    let buf = this.buf!.subarray(this.pos, this.pos + len);
    this.pos = this.pos + len;
    return buf;
  }
  
  public readAll(): Buffer {
    let buf = this.buf.subarray(this.pos, this.buf.length);
    this.pos = this.buf.length;
    return buf;
  }
  
  public readUInt8(): number {
    let val = this.buf.readUInt8(this.pos);
    this.pos = this.pos + 1;
    return val;
  }

  public readUInt16BE(): number {
    let val = this.buf.readUInt16BE(this.pos);
    this.pos = this.pos + 2;
    return val;
  }
  
  public readUInt16LE(): number {
    let val = this.buf.readUInt16LE(this.pos);
    this.pos = this.pos + 2;
    return val;
  }
  
  public readUInt32BE(): number {
    let val = this.buf.readUInt32BE(this.pos);
    this.pos = this.pos + 4;
    return val;
  }
  
  public readUInt32LE(): number {
    let val = this.buf.readUInt32LE(this.pos);
    this.pos = this.pos + 4;
    return val;
  }
  
  public readInt32LE(): number {
    let val = this.buf.readInt32LE(this.pos);
    this.pos = this.pos + 4;
    return val;
  }

  public readUInt64BEBN(): BN {
    let buf = this.buf.subarray(this.pos, this.pos + 8);
    let bn = BN.fromBuffer(buf);
    this.pos = this.pos + 8;
    return bn;
  }
  
  public readUInt64LEBN(): BN {
    let second = this.buf.readUInt32LE(this.pos);
    let first = this.buf.readUInt32LE(this.pos + 4);
    let combined = (first * 0x100000000) + second;
    // Instantiating an instance of BN with a number is faster than with an
    // array or string. However, the maximum safe number for a double precision
    // floating point is 2 ^ 52 - 1 (0x1fffffffffffff), thus we can safely use
    // non-floating point numbers less than this amount (52 bits). And in the case
    // that the number is larger, we can instatiate an instance of BN by passing
    // an array from the buffer (slower) and specifying the endianness.
    let bn;
    if (combined <= 0x1fffffffffffff) {
      bn = new BN(combined);
    } else {
      let data = this.buf.subarray(this.pos, this.pos + 8);
      bn = new BN(data, 10, 'le');
    }
    this.pos = this.pos + 8;
    return bn;
  }
  
  public readVarintNum(): number {
    let first = this.readUInt8();
    switch (first) {
      case 0xFD:
        return this.readUInt16LE();
      case 0xFE:
        return this.readUInt32LE();
      case 0xFF:
        let bn = this.readUInt64LEBN();
        let n = bn.toNumber();
        if (n <= Math.pow(2, 53)) {
          return n;
        } else {
          throw new Error('number too large to retain precision - use readVarintBN');
        }
    }
    return first;
  }
  
  /**
   * reads a length prepended buffer
   */
  public readVarLengthBuffer(): Buffer {
    let len = this.readVarintNum();
    let buf = this.read(len);
    ValidationUtils.validateState(buf.length === len, 'Invalid length while reading varlength buffer. ' +
      'Expected to read: ' + len + ' and read ' + buf.length);
    return buf;
  }
  
  public readVarintBuf(): Buffer {
    let first = this.buf.readUInt8(this.pos);
    switch (first) {
      case 0xFD:
        return this.read(1 + 2);
      case 0xFE:
        return this.read(1 + 4);
      case 0xFF:
        return this.read(1 + 8);
      default:
        return this.read(1);
    }
  }
  
  public readVarintBN(): BN {
    let first = this.readUInt8();
    switch (first) {
      case 0xFD:
        return new BN(this.readUInt16LE());
      case 0xFE:
        return new BN(this.readUInt32LE());
      case 0xFF:
        return this.readUInt64LEBN();
      default:
        return new BN(first);
    }
  }
  
  public reverse(): this {
    let buf = BufferUtils.reverse(this.buf);
    this.buf = buf;
    return this;
  }

  public readReverse(len?: number): Buffer {
    if (isUndefined(len)) {
      len = this.buf.length;
    }
    let buf = this.buf.subarray(this.pos, this.pos + len);
    this.pos = this.pos + len;
    return BufferUtils.reverse(buf);
  };
  
  public readCoreVarintNum(): number {
    let n = 0;
    while (true) {
      let chData = this.readUInt8();
      n = (n << 7) | (chData & 0x7F);
      if (chData & 0x80) {
        n++;
      } else {
        return n;
      }
    }
  }
}