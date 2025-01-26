import type { BufferWriterOptions } from "../common/interfaces";
import type BN from "../crypto/bn.extension";
import BufferUtils from "../utils/buffer.utils";
import ValidationUtils from "../utils/validation.utils";

export default class BufferWriter {

  private bufs: Buffer[];
  private bufLen: number;
  
  constructor(obj?: BufferWriterOptions) {
    this.bufs = [];
    this.bufLen = 0;
    
    if (obj) {
      this.set(obj); 
    }
  }

  public set(obj: BufferWriterOptions): this {
    this.bufs = obj.bufs || this.bufs;
    this.bufLen = this.bufs.reduce((prev, buf) => prev + buf.length, 0);
    return this;
  }

  public toBuffer(): Buffer {
    return this.concat();
  }
  
  public concat(): Buffer {
    return Buffer.concat(this.bufs, this.bufLen);
  }

  public write(buf: Buffer): this {
    ValidationUtils.validateArgument(BufferUtils.isBuffer(buf), "buf");
    this.bufs.push(buf);
    this.bufLen += buf.length;
    return this;
  }

  public writeReverse(buf: Buffer): this {
    ValidationUtils.validateArgument(BufferUtils.isBuffer(buf), "buf");
    this.bufs.push(BufferUtils.reverse(buf));
    this.bufLen += buf.length;
    return this;
  }

  public writeUInt8(n: number): this {
    let buf = Buffer.alloc(1);
    buf.writeUInt8(n, 0);
    this.write(buf);
    return this;
  }

  public writeUInt16BE(n: number): this {
    let buf = Buffer.alloc(2);
    buf.writeUInt16BE(n, 0);
    this.write(buf);
    return this;
  }

  public writeUInt16LE(n: number): this {
    let buf = Buffer.alloc(2);
    buf.writeUInt16LE(n, 0);
    this.write(buf);
    return this;
  }

  public writeUInt32BE(n: number): this {
    let buf = Buffer.alloc(4);
    buf.writeUInt32BE(n, 0);
    this.write(buf);
    return this;
  }

  public writeInt32LE(n: number): this {
    let buf = Buffer.alloc(4);
    buf.writeInt32LE(n, 0);
    this.write(buf);
    return this;
  }

  public writeUInt32LE(n: number): this {
    let buf = Buffer.alloc(4);
    buf.writeUInt32LE(n, 0);
    this.write(buf);
    return this;
  }

  public writeUInt64BEBN(bn: BN): this {
    let buf = bn.toBuffer({size: 8});
    this.write(buf);
    return this;
  }

  public writeUInt64LEBN(bn: BN): this {
    let buf = bn.toBuffer({size: 8});
    this.writeReverse(buf);
    return this;
  }

  public writeVarintNum(n: number): this {
    let buf = BufferWriter.varintBufNum(n);
    this.write(buf);
    return this;
  }

  public writeVarintBN(bn: BN): this {
    let buf = BufferWriter.varintBufBN(bn);
    this.write(buf);
    return this;
  }

  public writeVarLengthBuf(buf: Buffer): this {
    ValidationUtils.validateArgument(BufferUtils.isBuffer(buf), "buf");
    this.writeVarintNum(buf.length);
    this.write(buf);
    return this;
  }

  public writeCoreVarintNum(n: number): this {
    let tmp = [];
    let len = 0;

    while (true)
    {
      tmp.push((n & 0x7F) | (len ? 0x80 : 0x00));
      if (n <= 0x7F)
          break;
      n = (n >> 7) - 1;
      len++;
    }

    this.write(Buffer.from(tmp).reverse());
    return this;
  }

  public static varintBufNum(n: number): Buffer {
    let buf = undefined;
    if (n < 253) {
      buf = Buffer.alloc(1);
      buf.writeUInt8(n, 0);
    } else if (n < 0x10000) {
      buf = Buffer.alloc(1 + 2);
      buf.writeUInt8(253, 0);
      buf.writeUInt16LE(n, 1);
    } else if (n < 0x100000000) {
      buf = Buffer.alloc(1 + 4);
      buf.writeUInt8(254, 0);
      buf.writeUInt32LE(n, 1);
    } else {
      buf = Buffer.alloc(1 + 8);
      buf.writeUInt8(255, 0);
      buf.writeInt32LE(n & -1, 1);
      buf.writeUInt32LE(Math.floor(n / 0x100000000), 5);
    }
    return buf;
  }

  public static varintBufBN(bn: BN): Buffer {
    let buf = undefined;
    let n = bn.toNumber();
    if (n < 253) {
      buf = Buffer.alloc(1);
      buf.writeUInt8(n, 0);
    } else if (n < 0x10000) {
      buf = Buffer.alloc(1 + 2);
      buf.writeUInt8(253, 0);
      buf.writeUInt16LE(n, 1);
    } else if (n < 0x100000000) {
      buf = Buffer.alloc(1 + 4);
      buf.writeUInt8(254, 0);
      buf.writeUInt32LE(n, 1);
    } else {
      let bw = new BufferWriter();
      bw.writeUInt8(255);
      bw.writeUInt64LEBN(bn);
      buf = bw.concat();
    }
    return buf;
  }
}