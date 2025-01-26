import bs58 from 'bs58';
import type { BufferParams } from "../common/interfaces";

export default class Base58 {

  private static readonly ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'.split('');

  private buf?: Buffer;

  constructor(obj?: string | Buffer | BufferParams) {
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

  public toBuffer(): Buffer | undefined {
    return this.buf;
  }
  
  public toString(): string {
    return this.buf ? Base58.encode(this.buf) : "";
  }

  private fromBuffer(buf: Buffer): this {
    this.buf = buf;
    return this;
  }
  
  private fromString(str: string): this {
    let buf = Base58.decode(str);
    this.buf = buf;
    return this;
  }

  private set(obj: BufferParams): this {
    this.buf = obj.buf || this.buf || undefined;
    return this;
  }

  public static encode(buf: Buffer): string {
    if (!Buffer.isBuffer(buf)) {
      throw new Error('Input should be a buffer');
    }
    return bs58.encode(buf);
  }

  public static decode(str: string): Buffer {
    if (typeof str !== 'string') {
      throw new Error('Input should be a string');
    }
    return Buffer.from(bs58.decode(str));
  }

  
  public static validCharacters(chars: Buffer | string): boolean {
    if (Buffer.isBuffer(chars)) {
      chars = chars.toString();
    }

    return chars.split("").every(char => Base58.ALPHABET.includes(char));
  }
}