import { isNumber, isString } from "lodash-es";
import BufferUtils from "../../utils/buffer.utils";
import ValidationUtils from "../../utils/validation.utils";

export enum Opcode {
  // push value
  OP_FALSE = 0,
  OP_0 = OP_FALSE,
  OP_PUSHDATA1 = 76,
  OP_PUSHDATA2 = 77,
  OP_PUSHDATA4 = 78,
  OP_1NEGATE = 79,
  OP_RESERVED = 80,
  OP_TRUE = 81,
  OP_1 = OP_TRUE,
  OP_2 = 82,
  OP_3 = 83,
  OP_4 = 84,
  OP_5 = 85,
  OP_6 = 86,
  OP_7 = 87,
  OP_8 = 88,
  OP_9 = 89,
  OP_10 = 90,
  OP_11 = 91,
  OP_12 = 92,
  OP_13 = 93,
  OP_14 = 94,
  OP_15 = 95,
  OP_16 = 96,

  // control
  OP_NOP = 97,
  OP_INVALID_CONTROL1 = 98,
  OP_IF = 99,
  OP_NOTIF = 100,
  OP_JUMP = 101,
  OP_INVALID_CONTROL2 = 102,
  OP_ELSE = 103,
  OP_ENDIF = 104,
  OP_VERIFY = 105,
  OP_RETURN = 106,

  // stack ops
  OP_TOALTSTACK = 107,
  OP_FROMALTSTACK = 108,
  OP_2DROP = 109,
  OP_2DUP = 110,
  OP_3DUP = 111,
  OP_2OVER = 112,
  OP_2ROT = 113,
  OP_2SWAP = 114,
  OP_IFDUP = 115,
  OP_DEPTH = 116,
  OP_DROP = 117,
  OP_DUP = 118,
  OP_NIP = 119,
  OP_OVER = 120,
  OP_PICK = 121,
  OP_ROLL = 122,
  OP_ROT = 123,
  OP_SWAP = 124,
  OP_TUCK = 125,

  // splice ops
  OP_CAT = 126,
  OP_SPLIT = 127,
  OP_NUM2BIN = 128,
  OP_BIN2NUM = 129,
  OP_SIZE = 130,

  // bit logic
  OP_INVERT = 131,
  OP_AND = 132,
  OP_OR = 133,
  OP_XOR = 134,
  OP_EQUAL = 135,
  OP_EQUALVERIFY = 136,
  OP_RESERVED1 = 137,
  OP_RESERVED2 = 138,

  // numeric
  OP_1ADD = 139,
  OP_1SUB = 140,
  OP_2MUL = 141,
  OP_2DIV = 142,
  OP_NEGATE = 143,
  OP_ABS = 144,
  OP_NOT = 145,
  OP_0NOTEQUAL = 146,

  OP_ADD = 147,
  OP_SUB = 148,
  OP_MUL = 149,
  OP_DIV = 150,
  OP_MOD = 151,
  OP_LSHIFT = 152,
  OP_RSHIFT = 153,

  OP_BOOLAND = 154,
  OP_BOOLOR = 155,
  OP_NUMEQUAL = 156,
  OP_NUMEQUALVERIFY = 157,
  OP_NUMNOTEQUAL = 158,
  OP_LESSTHAN = 159,
  OP_GREATERTHAN = 160,
  OP_LESSTHANOREQUAL = 161,
  OP_GREATERTHANOREQUAL = 162,
  OP_MIN = 163,
  OP_MAX = 164,

  OP_WITHIN = 165,

  // crypto
  OP_RIPEMD160 = 166,
  OP_SHA1 = 167,
  OP_SHA256 = 168,
  OP_HASH160 = 169,
  OP_HASH256 = 170,
  OP_CODESEPARATOR = 171,
  OP_CHECKSIG = 172,
  OP_CHECKSIGVERIFY = 173,
  OP_CHECKMULTISIG = 174,
  OP_CHECKMULTISIGVERIFY = 175,

  // timelocks
  OP_NOP2 = 177,
  OP_CHECKLOCKTIMEVERIFY = OP_NOP2,
  OP_NOP3 = 178,
  OP_CHECKSEQUENCEVERIFY = OP_NOP3,

  // expansion
  OP_NOP1 = 176,
  OP_NOP4 = 179,
  OP_NOP5 = 180,
  OP_NOP6 = 181,
  OP_NOP7 = 182,
  OP_NOP8 = 183,
  OP_NOP9 = 184,
  OP_NOP10 = 185,

  // More crypto
  OP_CHECKDATASIG = 186,
  OP_CHECKDATASIGVERIFY = 187,

  // additional byte string operations
  OP_REVERSEBYTES = 188,

  // Transaction Introspection Opcodes
  OP_INPUTINDEX = 192,
  OP_ACTIVEBYTECODE = 193,
  OP_TXVERSION = 194,
  OP_TXINPUTCOUNT = 195,
  OP_TXOUTPUTCOUNT = 196,
  OP_TXLOCKTIME = 197,
  OP_UTXOVALUE = 198,
  OP_UTXOBYTECODE = 199,
  OP_OUTPOINTHASH = 200,
  OP_INPUTBYTECODE = 202,
  OP_INPUTSEQUENCENUMBER = 203,
  OP_OUTPUTVALUE = 204,
  OP_OUTPUTBYTECODE = 205,
  OP_INPUTTYPE = 206,
  OP_OUTPUTTYPE = 207,
  OP_INPUTVALUE = 208,

  // NEXA opcodes
  OP_PARSE = 230,
  OP_STORE = 231,
  OP_LOAD = 232,
  OP_PLACE = 233,
  OP_PUSH_TX_STATE = 234,
  OP_SETBMD = 235,
  OP_BIN2BIGNUM = 236,
  OP_EXEC = 237,
  // OP_GROUPDATA = 238,

  // The first op_code value after all defined opcodes
  FIRST_UNDEFINED_OP_VALUE,

  OP_INVALIDOPCODE = 255,
}

type OpcodeKey = keyof typeof Opcode;

export default class ScriptOpcode {

  num: number;

  constructor(val: number | string) {
    if (isNumber(val)) {
      this.num = val;
    } else if (isString(val)) {
      this.num = Opcode[val as OpcodeKey];
    } else {
      throw new TypeError('Unrecognized val type: "' + typeof(val) + '" for Opcode');
    }
  }

  public static fromBuffer(buf: Buffer): ScriptOpcode {
    ValidationUtils.validateArgument(BufferUtils.isBuffer(buf), 'buf must be Buffer');
    return new ScriptOpcode(Number('0x' + buf.toString('hex')));
  }
  
  public static fromNumber(num: number): ScriptOpcode {
    ValidationUtils.validateArgument(isNumber(num), 'num must be number');
    return new ScriptOpcode(num);
  }
  
  public static fromString(str: string): ScriptOpcode {
    ValidationUtils.validateArgument(isString(str), 'str must be string');

    let value = Opcode[str as OpcodeKey];
    if (typeof value === 'undefined') {
      throw new TypeError('Invalid opcodestr');
    }
    return new ScriptOpcode(value);
  }

  public static smallInt(n: number): ScriptOpcode {
    ValidationUtils.validateArgument(isNumber(n), 'n should be number');
    ValidationUtils.validateArgument(n >= 0 && n <= 16, 'n must be between 0 and 16');

    if (n === 0) {
      return new ScriptOpcode('OP_0');
    }
    return new ScriptOpcode(Opcode.OP_1 + n - 1);
  }

  /**
   * @returns true if opcode is one of OP_0, OP_1, ..., OP_16
   */
  public static isSmallIntOp(opcode: ScriptOpcode | number): boolean {
    if (opcode instanceof ScriptOpcode) {
      opcode = opcode.toNumber();
    }
    return opcode === Opcode.OP_0 || (opcode >= Opcode.OP_1 && opcode <= Opcode.OP_16);
  }

  public toHex(): string {
    return this.num.toString(16);
  }
  
  public toBuffer(): Buffer {
    return Buffer.from(this.toHex(), 'hex');
  }
  
  public toNumber(): number {
    return this.num;
  }
  
  public toString(): string {
    let str = Opcode[this.num];
    if (typeof str === 'undefined') {
      throw new Error('Opcode does not have a string representation');
    }
    return str;
  }

  /**
   * Will return a string formatted for the console
   *
   * @returns Script opcode
   */
  public inspect(): string {
    return '<Opcode: ' + this.toString() + ', hex: '+this.toHex()+', decimal: '+this.num+'>';
  }

  /**
   * Comes from nexad's script DecodeOP_N function
   * @param opcode
   * @returns numeric value in range of 0 to 16
   */
  public static decodeOP_N(opcode: number): number {
    if (opcode === Opcode.OP_0) {
      return 0;
    } else if (opcode >= Opcode.OP_1 && opcode <= Opcode.OP_16) {
      return opcode - (Opcode.OP_1 - 1);
    } else {
      throw new Error('Invalid opcode: ' + JSON.stringify(opcode));
    }
  }
}