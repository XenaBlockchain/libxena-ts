import { isNil, isString } from "lodash-es";
import BufferReader from "../../encoding/bufferreader";
import BufferWriter from "../../encoding/bufferwriter";
import BufferUtils from "../../utils/buffer.utils";
import CommonUtils from "../../utils/common.utils";
import ValidationUtils from "../../utils/validation.utils";

export enum InputSighashType {
  ALL = 0,
  FIRSTN = 1,
  THISIN = 2,
  LAST_VALID = THISIN, // end indicator
}

export enum OutputSighashType {
  ALL = 0,
  FIRSTN = 1,
  TWO = 2,
  LAST_VALID = TWO, // end indicator
}

export default class SighashType {

  /**
   * the longest sighashtype in bytes 
   * (for use in calculating tx fees by tx length estimation) 
   */
  public static readonly MAX_SIZE = 4;

  inType: InputSighashType;
  outType: OutputSighashType;

  inData: number[];
  outData: number[];

  constructor() {
    this.inType = InputSighashType.ALL;
    this.outType = OutputSighashType.ALL;
    this.inData = [];
    this.outData = [];
  }

  /**
   * creates a sighash that is the most restrictive -- it signs all inputs and outputs
   */
  public static get ALL(): SighashType {
    return new SighashType();
  }

  public hasAll(): boolean {
    return this.inType == InputSighashType.ALL && this.outType == OutputSighashType.ALL;
  }

  public isInvalid(): boolean {
    return this.inType > InputSighashType.LAST_VALID || this.outType > OutputSighashType.LAST_VALID
  }

  /** 
   * Anyone can pay signs only the current input, so other entities can add addtl inputs to complete the partial tx
   */
  public setAnyoneCanPay(): this {
    this.inType = InputSighashType.THISIN;
    this.inData = [];
    return this;
  }

  /**
   * Include only the n first inputs in the preimage sighash
   * 
   * @param n The first inputs to include
   */
  public setFirstNIn(n: number): this {
    ValidationUtils.validateArgument(n >= 0 && n < 256, "n", "out of range (0-255).");
    this.inType = InputSighashType.FIRSTN;
    this.inData = [n];
    return this;
  }

  /**
   * Include only the n first outputs in the preimage sighash
   * 
   * @param n The first outputs to include
   */
  public setFirstNOut(n: number): this {
    ValidationUtils.validateArgument(n >= 0 && n < 256, "n", "out of range (0-255).");
    this.outType = OutputSighashType.FIRSTN;
    this.outData = [n];
    return this;
  }

  /**
   * Include specific 2 outputs in the preimage sighash
   * 
   * @param a The 1st output to include
   * @param b The 2nd output to include
   */
  public set2Out(a: number, b: number): this {
    ValidationUtils.validateArgument(a >= 0 && a < 256, "a", "out of range (0-255).");
    ValidationUtils.validateArgument(b >= 0 && b < 256, "b", "out of range (0-255).");
    this.outType = OutputSighashType.TWO;
    this.outData = [a, b];
    return this;
  }

  public toBuffer(): Buffer {
    if (this.hasAll()) {
      return Buffer.alloc(0);
    }

    let bw = new BufferWriter();
    let sigtype = (this.inType << 4) | this.outType;
    bw.writeUInt8(sigtype);

    switch (this.inType) {
      case InputSighashType.FIRSTN:
        ValidationUtils.validateState(this.inData.length > 0, "Missing input data");
        bw.writeUInt8(this.inData[0]);
        break;
      case InputSighashType.THISIN:
      case InputSighashType.ALL:
        break;
      default:
        throw new Error("Malformed sighash type");
    }

    switch (this.outType)  {
      case OutputSighashType.TWO:
        ValidationUtils.validateState(this.outData.length > 1, "Missing output data");
        bw.writeUInt8(this.outData[0]);
        bw.writeUInt8(this.outData[1]);
        break;
      case OutputSighashType.FIRSTN:
        ValidationUtils.validateState(this.outData.length > 0, "Missing output data");
        bw.writeUInt8(this.outData[0]);
      break;
      case OutputSighashType.ALL:
        break;
      default:
        throw new Error("Malformed sighash type");
    }

    return bw.toBuffer();
  }

  public static fromBuffer(buf: Buffer): SighashType {
    ValidationUtils.validateArgument(BufferUtils.isBuffer(buf), "buf");
    if (buf.length == 0) {
      return this.ALL;
    }

    let sighash = new SighashType();
    let br = new BufferReader(buf);
    let type = br.readUInt8();

    sighash.outType = type & 0x0f;
    sighash.inType = type >> 4;

    if (sighash.isInvalid()) {
      throw new Error("Invalid sighash buffer");
    }

    const safeRead = (br: BufferReader): number => {
      if (br.finished()) {
        throw new Error("Invalid sighash buffer");
      }
      return br.readUInt8();
    }

    if (sighash.inType == InputSighashType.FIRSTN) {
      sighash.inData.push(safeRead(br));
    }

    if (sighash.outType == OutputSighashType.FIRSTN) {
      sighash.outData.push(safeRead(br));
    } else if (sighash.outType == OutputSighashType.TWO) {
      sighash.outData.push(safeRead(br));
      sighash.outData.push(safeRead(br));
    }

    if (!br.finished()) {
      throw new Error("Invalid sighash buffer");
    }

    return sighash;
  }

  /**
   * Convert to a hex representation of the sighash
   */
  public toHex(): string {
    return this.toBuffer().toString('hex');
  }

  /**
   * Create sighash for hex represantation
   * @see toHex 
   */
  public static fromHex(hex: string): SighashType {
    if(typeof hex === 'string' && hex.length === 0) {
      return this.ALL;
    }
    ValidationUtils.validateArgument(CommonUtils.isHexa(hex), "Not a hex string");
    return this.fromBuffer(Buffer.from(hex, 'hex'));
  }

  /** 
   * Convert to a human readable representation of the sighash
   */
  public toString(): string {
    if (this.hasAll()) {
      return "ALL";
    }

    let ret = "";

    switch (this.inType) {
      case InputSighashType.ALL:
        ret += "ALL_IN";
        break;
      case InputSighashType.THISIN:
        ret += "THIS_IN";
        break;
      case InputSighashType.FIRSTN:
        ret += `FIRST_${this.inData[0]}_IN`;
        break;
      default:
        return "INVALID";
    }

    ret += "|";

    switch (this.outType) {
      case OutputSighashType.ALL:
        ret += "ALL_OUT";
        break;
      case OutputSighashType.TWO:
        ret += `${this.outData[0]}_${this.outData[1]}_OUT`;
        break;
      case OutputSighashType.FIRSTN:
        ret += `FIRST_${this.outData[0]}_OUT`;
        break;
      default:
        return "INVALID";
    }
    
    return ret;
  }

  /**
   * Create sighash from human readable represantation
   * @see toString 
   */
  public static fromString(str: string): SighashType {
    ValidationUtils.validateArgument(isString(str), "Not a string");
    if (str == "ALL") {
      return this.ALL;
    }

    ValidationUtils.validateArgument(str.includes("|"), "Not a sighash string");
    let sighash = new SighashType();
    let [inStr, outStr] = str.split("|");

    if (inStr == "THIS_IN") {
      sighash.inType = InputSighashType.THISIN;
    } else if (inStr != "ALL_IN") {
      let match = inStr.match(/^FIRST_(\d+)_IN$/);
      ValidationUtils.validateState(!isNil(match), "Not a sighash string");
      sighash.setFirstNIn(parseInt(match![1]));
    }

    if (outStr != "ALL_OUT") {
      let fnMatch = outStr.match(/^FIRST_(\d+)_OUT$/);
      let twMatch = outStr.match(/^(\d+)_(\d+)_OUT$/);
      if (fnMatch) {
        sighash.setFirstNOut(parseInt(fnMatch[1]));
      } else if (twMatch) {
        sighash.set2Out(parseInt(twMatch[1]), parseInt(twMatch[2]));
      } else {
        throw new Error("Not a sighash string");
      }
    }

    return sighash;
  }
}