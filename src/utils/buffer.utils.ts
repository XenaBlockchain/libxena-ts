import crypto from "crypto";
import ValidationUtils from "./validation.utils";

export default class BufferUtils {

  /**
   * Fill a buffer with a value.
   *
   * @param buffer
   * @param value
   * @return filled buffer
   * 
   * @deprecated use `buffer.fill(value)`
   */
  public static fill(buffer: Buffer, value: number): Buffer {
    ValidationUtils.validateArgumentType(buffer, 'Buffer', 'buffer');
    ValidationUtils.validateArgumentType(value, 'number', 'value');

    return buffer.fill(value);
  }

  /**
   *
   * @param original buffer
   * @return Return a copy of a buffer
   * 
   * @deprecated use `Buffer.from(original) or Buffer.copyBytesFrom(original)`
   */
  public static copy(original: Buffer): Buffer {
    let buffer = Buffer.alloc(original.length);
    original.copy(buffer);
    return buffer;
  }

  /**
   * Tests for both node's Buffer and Uint8Array
   *
   * @param arg
   * @return Returns true if the given argument is an instance of a buffer. 
   */
  public static isBuffer(arg: unknown): arg is Buffer {
    return Buffer.isBuffer(arg) || arg instanceof Uint8Array;
  }

  /**
   * Tests for both node's Buffer and Uint8Array
   *
   * @param arg
   * @return Returns true if the given argument is an instance of a hash160 or hash256 buffer. 
   */
  public static isHashBuffer(arg: unknown): boolean {
    return this.isBuffer(arg) && (arg.length === 20 || arg.length === 32);
  }

  /**
   * Returns a zero-filled byte array
   *
   * @param length
   * 
   * @deprecated use `Buffer.alloc(length)`
   */
  public static emptyBuffer(length: number): Buffer {
    ValidationUtils.validateArgumentType(length, 'number', 'length');
    return Buffer.alloc(length);
  }

  /**
   * Reverse a buffer
   * @param param
   * @return new reversed buffer
   */
  public static reverse(param: Buffer): Buffer {
    return (Buffer.from(param)).reverse();
  }

  /**
   * Transforms a buffer into a string with a number in hexa representation
   *
   * Shorthand for <tt>buffer.toString('hex')</tt>
   *
   * @param buffer
   * @return string
   */
  public static bufferToHex(buffer: Buffer): string {
    ValidationUtils.validateArgumentType(buffer, 'Buffer', 'buffer');
    return buffer.toString('hex');
  }

  /**
   * Transforms a number from 0 to 255 into a Buffer of size 1 with that value
   *
   * @param integer
   * @return Buffer
   */
  public static integerAsSingleByteBuffer(integer: number): Buffer {
    ValidationUtils.validateArgumentType(integer, 'number', 'integer');
    return Buffer.from([integer & 0xff]);
  }

  
  /**
   * Transforms the first byte of an array into a number ranging from -128 to 127
   * 
   * @param buffer
   * @return number
   */
  public static integerFromSingleByteBuffer(buffer: Buffer): number {
    ValidationUtils.validateArgumentType(buffer, 'Buffer', 'buffer');
    return buffer[0];
  }

  /**
   * Transform a 4-byte integer into a Buffer of length 4.
   *
   * @param integer
   * @return Buffer
   */
  public static integerAsBuffer(integer: number): Buffer {
    ValidationUtils.validateArgumentType(integer, 'number', 'integer');
    let bytes = [];
    bytes.push((integer >> 24) & 0xff);
    bytes.push((integer >> 16) & 0xff);
    bytes.push((integer >> 8) & 0xff);
    bytes.push(integer & 0xff);
    return Buffer.from(bytes);
  }

  /**
   * Transform the first 4 values of a Buffer into a number, in little endian encoding
   *
   * @param buffer
   * @return integer
   */
  public static integerFromBuffer(buffer: Buffer): number {
    ValidationUtils.validateArgumentType(buffer, 'Buffer', 'buffer');
    return buffer[0] << 24 | buffer[1] << 16 | buffer[2] << 8 | buffer[3];
  }

  /* secure random bytes that sometimes throws an error due to lack of entropy */
  public static getRandomBuffer(size: number): Buffer {
    return crypto.randomBytes(size);
  }
}