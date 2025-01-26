import Hash from "../crypto/hash";
import Base58 from "./base58";
import type { BufferParams } from "../common/interfaces";
import { isString } from "lodash-es";

export default class Base58Check {

  private buf?: Buffer;

  constructor(obj?: Buffer | string | BufferParams) {
    if (Buffer.isBuffer(obj)) {
      let buf = obj;
      this.fromBuffer(buf);
    } else if (typeof obj === 'string') {
      let str = obj;
      this.fromString(str);
    } else if (obj) {
      this.set(obj);
    }
  }

  public static validChecksum(data: string | Buffer, checksum?: string | Buffer): boolean {
    if (isString(data)) {
      data = Buffer.from(Base58.decode(data));
    }
    if (isString(checksum)) {
      checksum =  Buffer.from(Base58.decode(checksum));
    }
    if (!checksum) {
      checksum = data.subarray(-4);
      data = data.subarray(0, -4);
    }
    return Base58Check.checksum(data).toString('hex') === checksum.toString('hex');
  };
  
  public static decode(s: string): Buffer {
    if (typeof s !== 'string') {
      throw new Error('Input must be a string');
    }
  
    let buf = Buffer.from(Base58.decode(s));
  
    if (buf.length < 4) {
      throw new Error("Input string too short");
    }

    let data = buf.subarray(0, -4);
    let csum = buf.subarray(-4);
  
    let hash = Hash.sha256sha256(data);
    let hash4 = hash.subarray(0, 4);
  
    if (csum.toString('hex') !== hash4.toString('hex')) {
      throw new Error("Checksum mismatch");
    }
  
    return data;
  }
  
  public static checksum(buffer: Buffer): Buffer {
    return Hash.sha256sha256(buffer).subarray(0, 4);
  }
  
  public static encode(buf: Buffer): string {
    if (!Buffer.isBuffer(buf))
      throw new Error('Input must be a buffer');
    let checkedBuf = Buffer.alloc(buf.length + 4);
    let hash = Base58Check.checksum(buf);
    buf.copy(checkedBuf);
    hash.copy(checkedBuf, buf.length);
    return Base58.encode(checkedBuf);
  }

  public toBuffer(): Buffer | undefined {
    return this.buf;
  }
  
  public toString(): string {
    return this.buf ? Base58Check.encode(this.buf) : "";
  }

  private fromBuffer(buf: Buffer): this {
    this.buf = buf;
    return this;
  }
  
  private fromString(str: string): this {
    let buf = Base58Check.decode(str);
    this.buf = buf;
    return this;
  }

  private set(obj: BufferParams): this {
    this.buf = obj.buf || this.buf || undefined;
    return this;
  }
}