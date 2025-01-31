import { inRange, isArray, isObject, isString, isUndefined } from "lodash-es";
import type { IScript, ScriptChunk } from "../../common/interfaces";
import BufferUtils from "../../utils/buffer.utils";
import ValidationUtils from "../../utils/validation.utils";
import BufferReader from "../../encoding/bufferreader";
import BufferWriter from "../../encoding/bufferwriter";
import ScriptOpcode, { Opcode } from "./opcode";
import CommonUtils from "../../utils/common.utils";
import BN from "../../crypto/bn.extension";

export type ScriptElement = string | number | bigint | boolean | Buffer | ScriptOpcode | ScriptChunk | Script;

/**
 * A nexa transaction script. Each transaction's inputs and outputs
 * has a script that is evaluated to validate it's spending.
 *
 * @see {@link https://spec.nexa.org/script/1script/}
 */
export default class Script implements IScript {

  chunks: ScriptChunk[];

  constructor(from?: Buffer | string | IScript) {
    this.chunks = [];

    if (!from) {
      return;
    }

    if (BufferUtils.isBuffer(from)) {
      return Script.fromBuffer(from);
    } else if (from instanceof Script) {
      return Script.fromBuffer(from.toBuffer());
    } else if (isString(from)) {
      return Script.fromString(from);
    } else if (Script._isScriptObject(from)) {
      this.set(from);
    }
  }

  private static _isScriptObject(obj: unknown): obj is IScript {
    return isObject(obj) && 'chunks' in obj && isArray(obj.chunks);
  }

  private static _isScriptChunk(obj: unknown): obj is ScriptChunk {
    return isObject(obj) && 'opcodenum' in obj;
  }

  public set(obj: IScript): this {
    ValidationUtils.validateArgument(Script._isScriptObject(obj), 'obj');
    this.chunks = obj.chunks;
    return this;
  }

  /**
  * @returns a new empty script
  */
  public static empty(): Script {
   return new Script();
  }

  public static fromBuffer(buffer: Buffer): Script {
    let script = new Script();
    script.chunks = [];
  
    let br = new BufferReader(buffer);
    while (!br.finished()) {
      try {
        let opcodenum = br.readUInt8();
  
        let len, buf;
        if (opcodenum > 0 && opcodenum < Opcode.OP_PUSHDATA1) {
          len = opcodenum;
          script.chunks.push({
            buf: br.read(len),
            len: len,
            opcodenum: opcodenum
          });
        } else if (opcodenum === Opcode.OP_PUSHDATA1) {
          len = br.readUInt8();
          buf = br.read(len);
          script.chunks.push({
            buf: buf,
            len: len,
            opcodenum: opcodenum
          });
        } else if (opcodenum === Opcode.OP_PUSHDATA2) {
          len = br.readUInt16LE();
          buf = br.read(len);
          script.chunks.push({
            buf: buf,
            len: len,
            opcodenum: opcodenum
          });
        } else if (opcodenum === Opcode.OP_PUSHDATA4) {
          len = br.readUInt32LE();
          buf = br.read(len);
          script.chunks.push({
            buf: buf,
            len: len,
            opcodenum: opcodenum
          });
        } else {
          script.chunks.push({
            opcodenum: opcodenum
          });
        }
      } catch (e) {
        throw e instanceof RangeError ? new Error(`Invalid script buffer: can't parse valid script from given buffer ${buffer.toString('hex')}`) : e;
      }
    }
  
    return script;
  }
  
  public toBuffer(): Buffer {
    let bw = new BufferWriter();

    this.chunks.forEach(chunk => {
      bw.writeUInt8(chunk.opcodenum);
      if (chunk.buf) {
        if (chunk.opcodenum < Opcode.OP_PUSHDATA1) {
          bw.write(chunk.buf);
        } else if (chunk.opcodenum === Opcode.OP_PUSHDATA1) {
          bw.writeUInt8(chunk.len!);
          bw.write(chunk.buf);
        } else if (chunk.opcodenum === Opcode.OP_PUSHDATA2) {
          bw.writeUInt16LE(chunk.len!);
          bw.write(chunk.buf);
        } else if (chunk.opcodenum === Opcode.OP_PUSHDATA4) {
          bw.writeUInt32LE(chunk.len!);
          bw.write(chunk.buf);
        }
      }
    });
  
    return bw.concat();
  }

  public static fromHex(str: string): Script {
    return new Script(Buffer.from(str, 'hex'));
  }

  public static fromString(str: string): Script {
    if (CommonUtils.isHexa(str) || str.length === 0) {
      return this.fromHex(str);
    }

    let script = new Script();
    script.chunks = [];
  
    let tokens = str.split(' ');
    let i = 0;
    while (i < tokens.length) {
      let token = tokens[i];
      let opcode = new ScriptOpcode(token);
      let opcodenum = opcode.toNumber();
  
      if (isUndefined(opcodenum)) {
        opcodenum = parseInt(token);
        if (opcodenum > 0 && opcodenum < Opcode.OP_PUSHDATA1) {
          script.chunks.push({
            buf: Buffer.from(tokens[i + 1].slice(2), 'hex'),
            len: opcodenum,
            opcodenum: opcodenum
          });
          i = i + 2;
        } else {
          throw new Error('Invalid script: ' + JSON.stringify(str));
        }
      } else if (opcodenum === Opcode.OP_PUSHDATA1 ||
        opcodenum === Opcode.OP_PUSHDATA2 ||
        opcodenum === Opcode.OP_PUSHDATA4) {
        if (tokens[i + 2].slice(0, 2) !== '0x') {
          throw new Error('Pushdata data must start with 0x');
        }
        script.chunks.push({
          buf: Buffer.from(tokens[i + 2].slice(2), 'hex'),
          len: parseInt(tokens[i + 1]),
          opcodenum: opcodenum
        });
        i = i + 3;
      } else {
        script.chunks.push({
          opcodenum: opcodenum
        });
        i = i + 1;
      }
    }
    return script;
  }

  public static fromASM(str: string): Script {
    let script = new Script();
    script.chunks = [];
  
    let tokens = str.split(' ');
    let i = 0;
    while (i < tokens.length) {
      let token = tokens[i];
      let opcode = new ScriptOpcode(token);
      let opcodenum = opcode.toNumber();
  
      if (isUndefined(opcodenum)) {
        let buf = Buffer.from(tokens[i], 'hex');
        let len = buf.length;
        if (len >= 0 && len < Opcode.OP_PUSHDATA1) {
          opcodenum = len;
        } else if (len < Math.pow(2, 8)) {
          opcodenum = Opcode.OP_PUSHDATA1;
        } else if (len < Math.pow(2, 16)) {
          opcodenum = Opcode.OP_PUSHDATA2;
        } else if (len < Math.pow(2, 32)) {
          opcodenum = Opcode.OP_PUSHDATA4;
        }
        script.chunks.push({
          buf: buf,
          len: buf.length,
          opcodenum: opcodenum
        });
        i = i + 1;
      } else {
        script.chunks.push({
          opcodenum: opcodenum
        });
        i = i + 1;
      }
    }
    return script;
  }

  private static _chunkToString(chunk: ScriptChunk, toASM = false): string {
    let opcodenum = chunk.opcodenum;
    let str = '';
    if (!chunk.buf) {
      // no data chunk
      if (typeof Opcode[opcodenum] !== 'undefined') {
        if (toASM) {
          // A few cases where the opcode name differs from reverseMap
          // aside from 1 to 16 data pushes.
          if (opcodenum === 0) {
            // OP_0 -> 0
            str = str + ' 0';
          } else if(opcodenum === 79) {
            // OP_1NEGATE -> 1
            str = str + ' -1';
          } else {
            str = str + ' ' + new ScriptOpcode(opcodenum).toString();
          }
        } else {
          str = str + ' ' + new ScriptOpcode(opcodenum).toString();
        }
      } else {
        let numstr = opcodenum.toString(16);
        if (numstr.length % 2 !== 0) {
          numstr = '0' + numstr;
        }
        if (toASM) {
          str = str + ' ' + numstr;
        } else {
          str = str + ' ' + '0x' + numstr;
        }
      }
    } else {
      // data chunk
      if (!toASM && (opcodenum === Opcode.OP_PUSHDATA1 ||
        opcodenum === Opcode.OP_PUSHDATA2 ||
        opcodenum === Opcode.OP_PUSHDATA4)) {
        str = str + ' ' + new ScriptOpcode(opcodenum).toString();
      }
      if (chunk.len! > 0) {
        if (toASM) {
          str = str + ' ' + chunk.buf.toString('hex');
        } else {
          str = str + ' ' + chunk.len + ' ' + '0x' + chunk.buf.toString('hex');
        }
      }
    }
    return str;
  }

  public toASM(): string {
    return this.chunks.map(chunk => Script._chunkToString(chunk, true)).join('').substring(1);
  }
  
  public toString(): string {
    return this.chunks.map(chunk => Script._chunkToString(chunk)).join('').substring(1);
  }
  
  public toHex(): string {
    return this.toBuffer().toString('hex');
  }
  
  public inspect(): string {
    return `<Script: ${this}>`;
  }

  /**
   * Adds a script element to the end of the script.
   *
   * @param param a script element to add
   * @returns this script instance
   *
   */
  public add(param: ScriptElement): this {
    this._addByType(param, false);
    return this;
  }

  public append = this.add;

  /**
   * Adds a script element at the start of the script.
   * @param param a script element to add
   * @returns this script instance
   */
  public prepend(param: ScriptElement): this {
    this._addByType(param, true);
    return this;
  }

  private _addByType(obj: ScriptElement, prepend: boolean): void {
    if (typeof obj === 'string') {
      this._addOpcode(obj, prepend);
    } else if (typeof obj === 'number') {
      this._addOpcode(obj, prepend);
    } else if (obj instanceof ScriptOpcode) {
      this._addOpcode(obj, prepend);
    } else if (typeof obj === 'bigint') {
      if (obj <= 16n) {
        this._addOpcode(ScriptOpcode.smallInt(Number(obj)), prepend);
      } else if (obj === 0x81n) {
        this._addOpcode(Opcode.OP_1NEGATE, prepend);
      } else {
        this._addBuffer(new BN(obj.toString()).toScriptNumBuffer(), prepend);
      }
    } else if (typeof obj === 'boolean') {
      this._addOpcode(obj ? Opcode.OP_TRUE : Opcode.OP_FALSE, prepend);
    } else if (BufferUtils.isBuffer(obj)) {
      this._addBuffer(obj, prepend);
    } else if (obj instanceof Script) {
      this.chunks = this.chunks.concat(obj.chunks);
    } else if (Script._isScriptChunk(obj)) {
      this._insertAtPosition(obj, prepend);
    } else {
      throw new Error('Invalid script chunk');
    }
  }

  private _insertAtPosition(chunk: ScriptChunk, prepend: boolean): void {
    if (prepend) {
      this.chunks.unshift(chunk);
    } else {
      this.chunks.push(chunk);
    }
  }

  private _addOpcode(opcode: string | number | ScriptOpcode, prepend: boolean): this {
    let op: number;
    if (typeof opcode === 'number') {
      op = opcode;
    } else if (opcode instanceof ScriptOpcode) {
      op = opcode.toNumber();
    } else {
      op = new ScriptOpcode(opcode).toNumber();
    }
    this._insertAtPosition({ opcodenum: op }, prepend);
    return this;
  }
  
  private _addBuffer(buf: Buffer, prepend: boolean): this {
    let opcodenum;
    let len = buf.length;
    if (len >= 0 && len < Opcode.OP_PUSHDATA1) {
      opcodenum = len;
    } else if (len < Math.pow(2, 8)) {
      opcodenum = Opcode.OP_PUSHDATA1;
    } else if (len < Math.pow(2, 16)) {
      opcodenum = Opcode.OP_PUSHDATA2;
    } else if (len < Math.pow(2, 32)) {
      opcodenum = Opcode.OP_PUSHDATA4;
    } else {
      throw new Error("You can't push that much data");
    }
    this._insertAtPosition({
      buf: buf,
      len: len,
      opcodenum: opcodenum
    }, prepend);
    return this;
  }

  /**
   * Compares a script with another script
   */
  public equals(script: Script): boolean {
    ValidationUtils.validateState(script instanceof Script, 'Must provide another script');
    if (this.chunks.length !== script.chunks.length) {
      return false;
    }

    for (let i = 0; i < this.chunks.length; i++) {
      if (BufferUtils.isBuffer(this.chunks[i].buf) && !BufferUtils.isBuffer(script.chunks[i].buf)) {
        return false;
      }
      if (BufferUtils.isBuffer(this.chunks[i].buf) && !this.chunks[i].buf!.equals(script.chunks[i].buf!)) {
        return false;
      } else if (this.chunks[i].opcodenum !== script.chunks[i].opcodenum) {
        return false;
      }
    }
    return true;
  }

  /**
   * Analogous to nexad's FindAndDelete. Find and delete equivalent chunks,
   * typically used with push data chunks. Note that this will find and delete
   * not just the same data, but the same data with the same push data op as
   * produced by default. i.e., if a pushdata in a tx does not use the minimal
   * pushdata op, then when you try to remove the data it is pushing, it will not
   * be removed, because they do not use the same pushdata op.
   */
  public findAndDelete(script: Script): this {
    let buf = script.toBuffer();
    let hex = buf.toString('hex');
    for (let i = 0; i < this.chunks.length; i++) {
      let script2 = new Script({ chunks: [this.chunks[i]] });
      let buf2 = script2.toBuffer();
      let hex2 = buf2.toString('hex');
      if (hex === hex2) {
        this.chunks.splice(i, 1);
      }
    }
    return this
  }

  /**
   * Comes from nexad's script interpreter CheckMinimalPush function
   * @returns true if the chunk {i} is the smallest way to push that particular data.
   */
  public checkMinimalPush(i: number): boolean {
    let chunk = this.chunks[i];
    let buf = chunk.buf;
    let opcodenum = chunk.opcodenum;
    if (!buf) {
      return true;
    }
    if (buf.length === 0) {
      // Could have used OP_0.
      return opcodenum === Opcode.OP_0;
    } else if (buf.length === 1 && buf[0] >= 1 && buf[0] <= 16) {
      // Could have used OP_1 .. OP_16.
      // return opcodenum === Opcode.OP_1 + (buf[0] - 1);
      return false;
    } else if (buf.length === 1 && buf[0] === 0x81) {
      // Could have used OP_1NEGATE
      return false;
    } else if (buf.length <= 75) {
      // Could have used a direct push (opcode indicating number of bytes pushed + those bytes).
      return opcodenum === buf.length;
    } else if (buf.length <= 255) {
      // Could have used OP_PUSHDATA.
      return opcodenum === Opcode.OP_PUSHDATA1;
    } else if (buf.length <= 65535) {
      // Could have used OP_PUSHDATA2.
      return opcodenum === Opcode.OP_PUSHDATA2;
    }
    return true;
  }

  /**
   * Comes from bitcoind's script GetSigOpCount(boolean) function
   * @param accurate default true
   * @returns number of signature operations required by this script
   */
  public getSignatureOperationsCount(accurate = true): number {
    let n = 0;
    let lastOpcode = Opcode.OP_INVALIDOPCODE;

    this.chunks.forEach(chunk => {
      let opcode = chunk.opcodenum;
      if (opcode == Opcode.OP_CHECKSIG || opcode == Opcode.OP_CHECKSIGVERIFY) {
        n++;
      } else if (opcode == Opcode.OP_CHECKMULTISIG || opcode == Opcode.OP_CHECKMULTISIGVERIFY) {
        if (accurate && lastOpcode >= Opcode.OP_1 && lastOpcode <= Opcode.OP_16) {
          n += ScriptOpcode.decodeOP_N(lastOpcode);
        } else {
          n += 20;
        }
      }
      lastOpcode = opcode;
    });
    
    return n;
  }

  /**
   * @returns true if the script is only composed of data pushing
   * opcodes or small int opcodes (OP_0, OP_1, ..., OP_16)
   */
  public isPushOnly(): boolean {
    return this.chunks.every(chunk => 
      chunk.opcodenum <= Opcode.OP_16 ||
      chunk.opcodenum === Opcode.OP_PUSHDATA1 ||
      chunk.opcodenum === Opcode.OP_PUSHDATA2 ||
      chunk.opcodenum === Opcode.OP_PUSHDATA4
    );
  }

  /**
   * @returns true if this is a pay to script template output script
   * @remarks for well-known-1 template use {@link isPublicKeyTemplateOut}
   */
  public isScriptTemplateOut(): boolean {
    if (this.chunks.length < 3) {
      return false;
    }
    
    let hasGroup = this.chunks[0].opcodenum !== Opcode.OP_0;
    let minLength = hasGroup ? 4 : 3;
    let templateIndex = hasGroup ? 2 : 1;
    let constraintIndex = hasGroup ? 3 : 2;

    let isTemplate = this.chunks.length >= minLength
      && BufferUtils.isHashBuffer(this.chunks[templateIndex].buf)
      && (BufferUtils.isHashBuffer(this.chunks[constraintIndex].buf) || this.chunks[constraintIndex].opcodenum === Opcode.OP_FALSE);

    if (hasGroup) {
      isTemplate &&= !!(
        this.chunks[0].buf && this.chunks[0].buf.length >= 32 && // group id
        this.chunks[1].buf && this.chunks[1].buf.length >= 2 && this.chunks[1].buf.length <= 8 // group amount
      );
    }

    if (isTemplate && this.chunks.length > minLength) {
      let visibleArgs = new Script({chunks: this.chunks.slice(minLength)});
      isTemplate = visibleArgs.isPushOnly();
    }
    return isTemplate;
  }

  /**
   * Checks if this script is a valid pay to script template input script
   * 
   * @returns true if this is a pay to script template form input script
   * @remarks for well-known-1 template use {@link isPublicKeyTemplateIn}
   */
  public isScriptTemplateIn(): boolean {
    // we do not know the length or content of satisfier / template / costraint scripts,
    // only that must be push-only and template must exist
    return this.chunks.length > 1
      && BufferUtils.isBuffer(this.chunks[0].buf)
      && this.isPushOnly()
  }

  /**
   * @returns true if this is a pay to pubkey template output script (well-known-1, p2pkt)
   */
  public isPublicKeyTemplateOut(): boolean {
    if (this.chunks.length < 3) {
      return false;
    }

    let hasGroup = this.chunks[0].opcodenum !== Opcode.OP_0;
    let minLength = hasGroup ? 4 : 3;
    let templateIndex = hasGroup ? 2 : 1;
    let constraintIndex = hasGroup ? 3 : 2;

    let isTemplate = this.chunks.length === minLength
      && this.chunks[templateIndex].opcodenum === Opcode.OP_1
      && (BufferUtils.isHashBuffer(this.chunks[constraintIndex].buf));

    if (hasGroup) {
      isTemplate &&= !!(
        this.chunks[0].buf && this.chunks[0].buf.length >= 32 && // group id
        this.chunks[1].buf && this.chunks[1].buf.length >= 2 && this.chunks[1].buf.length <= 8 // group amount
      );
    }

    return isTemplate;
  }

  /**
   * @returns true if this is a pay to public key template input script
   */
  public isPublicKeyTemplateIn(): boolean {
    if (this.chunks.length != 2) {
      return false;
    }

    let pubkeyPushBuf = this.chunks[0].buf;
    let signatureBuf = this.chunks[1].buf;
    if (signatureBuf && signatureBuf.length >= 64 && signatureBuf.length <= 68 && pubkeyPushBuf?.length === 34) {
      let pubkeyBuf = Script.fromBuffer(pubkeyPushBuf).chunks[0].buf;
      return pubkeyBuf?.length === 33 && (pubkeyBuf[0] === 0x03 || pubkeyBuf[0] === 0x02);
    }

    return false;
  }
  
  /**
   * @returns true if this is a pay to pubkey hash output script
   */
  public isPublicKeyHashOut(): boolean {
    return !!(this.chunks.length === 5 &&
      this.chunks[0].opcodenum === Opcode.OP_DUP &&
      this.chunks[1].opcodenum === Opcode.OP_HASH160 &&
      this.chunks[2].buf &&
      this.chunks[2].buf.length === 20 &&
      this.chunks[3].opcodenum === Opcode.OP_EQUALVERIFY &&
      this.chunks[4].opcodenum === Opcode.OP_CHECKSIG);
  }

  /**
   * @returns {boolean} if this is a pay to public key hash input script
   */
  public isPublicKeyHashIn(): boolean {
    if (this.chunks.length != 2) {
      return false;
    }

    let signatureBuf = this.chunks[0].buf;
    let pubkeyBuf = this.chunks[1].buf;
    if (signatureBuf && signatureBuf.length && pubkeyBuf && pubkeyBuf.length) {
      let version = pubkeyBuf[0];
      if ((version === 0x04 || version === 0x06 || version === 0x07) && pubkeyBuf.length === 65) {
        return true;
      } else if ((version === 0x03 || version === 0x02) && pubkeyBuf.length === 33) {
        return true;
      }
    }

    return false;
  }

  /**
   * @returns true if this is a valid standard OP_RETURN output
   */
  public isDataOut(): boolean {
    let step1 = this.chunks.length >= 1 &&
      this.chunks[0].opcodenum === Opcode.OP_RETURN &&
      this.toBuffer().length <= 223; // 223 instead of 220 because (+1 for OP_RETURN, +2 for the pushdata opcodes)
    if (!step1) return false;
    let chunks = this.chunks.slice(1);
    let script2 = new Script({chunks: chunks});
    return script2.isPushOnly();
  }

  /**
   * @returns true if this is a valid Token Description OP_RETURN output
   */
  public isTokenDescriptionOut(): boolean {
    let step1 = inRange(this.chunks.length, 2, 8) &&
      this.chunks[0].opcodenum === Opcode.OP_RETURN &&
      this.chunks[1].len === 4;
    
    return step1 && new Script({chunks: this.chunks.slice(1)}).isPushOnly();
  }

  /**
   * Will retrieve the Public Key buffer from p2pkt/p2pkh input scriptSig
   */
  public getPublicKey(): Buffer {
    ValidationUtils.validateState(this.isPublicKeyHashIn() || this.isPublicKeyTemplateIn(), "Can't retrieve PublicKey from a non-PKT or non-PKH input");
    return this.isPublicKeyHashIn() ? this.chunks[1].buf! : Script.fromBuffer(this.chunks[0].buf!).chunks[0].buf!;
  }

  /**
   * Will retrieve the Public Key Hash buffer from p2pkh output scriptPubKey
   */
  public getPublicKeyHash(): Buffer {
    ValidationUtils.validateState(this.isPublicKeyHashOut(), "Can't retrieve PublicKeyHash from a non-PKH output");
    return this.chunks[2].buf!;
  }

  /**
   * Will retrieve the Template Hash from p2pkt/p2st output scriptPubKey
   * 
   * @returns OP_1 if its p2pkt, otherwise the template hash buffer
   */
  public getTemplateHash(): Buffer | Opcode.OP_1 {
    ValidationUtils.validateState(this.isPublicKeyTemplateOut() || this.isScriptTemplateOut(), "Can't retrieve TemplateHash from a non-PST output");
    if (this.isPublicKeyTemplateOut()) {
      return Opcode.OP_1;
    }
    let hasGroup = this.chunks[0].opcodenum !== Opcode.OP_0;
    return hasGroup ? this.chunks[2].buf! : this.chunks[1].buf!;
  }
  
  /**
   * Will retrieve the Constraint Hash from p2pkt/p2st output scriptPubKey
   * 
   * @returns The constraint hash buffer, or OP_FALSE if not included
   */
  public getConstraintHash(): Buffer | Opcode.OP_FALSE {
    ValidationUtils.validateState(this.isPublicKeyTemplateOut() || this.isScriptTemplateOut(), "Can't retrieve ConstraintHash from a non-PST output");
    let hasGroup = this.chunks[0].opcodenum !== Opcode.OP_0;
    let constraintIndex = hasGroup ? 3 : 2;
    if (this.isPublicKeyTemplateOut()) {
      return this.chunks[constraintIndex].buf!;
    }
    return this.chunks[constraintIndex].opcodenum === Opcode.OP_FALSE ? Opcode.OP_FALSE : this.chunks[constraintIndex].buf!;
  }

  /**
   * Will retrieve the Group Identifier number from Token Description OP_RETURN output
   * 
   * @remarks This method doesn't check if the group id number is fit to NRC1/NRC2 etc. 
   */
  public getGroupIdType(): number {
    ValidationUtils.validateState(this.isTokenDescriptionOut(), "Can't retrieve GroupIdType from a non Token Description output");
    return BN.fromScriptNumBuffer(this.chunks[1].buf!).toNumber();
  }
}