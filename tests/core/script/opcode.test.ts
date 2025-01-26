import { describe, expect, test } from "vitest";
import ScriptOpcode, { Opcode } from "../../../src/core/script/opcode";

describe('Opcode', () => {

  test('should create a new Opcode', () => {
    let opcode = new ScriptOpcode(5);
    expect(opcode).toBeDefined();
  });

  test('should convert to a string with this handy syntax', () => {
    expect(new ScriptOpcode(0).toString()).toBe('OP_0');
    expect(new ScriptOpcode(96).toString()).toBe('OP_16');
    expect(new ScriptOpcode(97).toString()).toBe('OP_NOP');

    expect(new ScriptOpcode(Opcode.OP_0).toString()).toBe('OP_0');
    expect(new ScriptOpcode(Opcode.OP_16).toString()).toBe('OP_16');
    expect(new ScriptOpcode(Opcode.OP_NOP).toString()).toBe('OP_NOP');
  });

  test('should convert to a number with this handy syntax', () => {
    expect(new ScriptOpcode('OP_0').toNumber()).toBe(0);
    expect(new ScriptOpcode('OP_16').toNumber()).toBe(96);
    expect(new ScriptOpcode('OP_NOP').toNumber()).toBe(97);

    expect(new ScriptOpcode(Opcode.OP_0).toNumber()).toBe(0);
    expect(new ScriptOpcode(Opcode.OP_16).toNumber()).toBe(96);
    expect(new ScriptOpcode(Opcode.OP_NOP).toNumber()).toBe(97);
  });

  describe('#fromNumber', () => {
    test('should work for 0', () => {
      expect(ScriptOpcode.fromNumber(0).num).toBe(0);
      expect(ScriptOpcode.fromNumber(Opcode.OP_FALSE).num).toBe(0);
    });
    
    test('should fail for non-number', () => {
      expect(() => ScriptOpcode.fromNumber('a string' as any)).toThrow('Invalid Argument');
    });
  });

  describe('#set', () => {
    test('should work for object', () => {
      expect(new ScriptOpcode(42).num).toBe(42);
    });
    test('should fail for empty-object', () => {
      expect(() => new ScriptOpcode(undefined as any)).toThrow(TypeError);
    });
  });

  describe('#toNumber', () => {
    test('should work for 0', () => {
      expect(ScriptOpcode.fromNumber(0).toNumber()).toBe(0);
    });
  });

  describe('#buffer', () => {
    test('should correctly input/output a buffer', () => {
      let buf = Buffer.from('a6', 'hex');
      expect(ScriptOpcode.fromBuffer(buf).toBuffer()).toEqual(buf);
    });
  });

  describe('#fromString', () => {
    test('should work for OP_0', () => {
      expect(ScriptOpcode.fromString('OP_0').num).toBe(0);
    });
    test('should fail for invalid string', () => {
      expect(() => ScriptOpcode.fromString('OP_SATOSHI')).toThrow('Invalid opcodestr');
      expect(() => ScriptOpcode.fromString('BANANA')).toThrow('Invalid opcodestr');
    });
    test('should fail for non-string', () => {
      expect(() => ScriptOpcode.fromString(123 as any)).toThrow('Invalid Argument');
    });
  });

  describe('#toString', () => {
    test('should work for OP_0', () => {
      expect(ScriptOpcode.fromString('OP_0').toString()).toBe('OP_0');
    });

    test('should not work for non-opcode', () => {
      expect(() => new ScriptOpcode('OP_NOTACODE').toString()).toThrow('Opcode does not have a string representation');
    });

    test('should work for every non-duplicate opcode', () => {
      Object.keys(Opcode).filter(k => k.startsWith("OP")).forEach(key => {
        if (key === 'OP_TRUE' || key === 'OP_FALSE') return;
        if (key === 'OP_NOP2' || key === 'OP_NOP3') return;
        expect(ScriptOpcode.fromString(key).toString()).toBe(key);
      });
    });
  });

  describe('Reverse Lookup', () => {
    test('should exist and have ops 185 and 188', () => {
      expect(Opcode[185]).toBe('OP_NOP10');
      expect(Opcode[188]).toBe('OP_REVERSEBYTES');
    });
  });

  let smallints = [
    new ScriptOpcode('OP_0'),
    new ScriptOpcode('OP_1'),
    new ScriptOpcode('OP_2'),
    new ScriptOpcode('OP_3'),
    new ScriptOpcode('OP_4'),
    new ScriptOpcode('OP_5'),
    new ScriptOpcode('OP_6'),
    new ScriptOpcode('OP_7'),
    new ScriptOpcode('OP_8'),
    new ScriptOpcode('OP_9'),
    new ScriptOpcode('OP_10'),
    new ScriptOpcode('OP_11'),
    new ScriptOpcode('OP_12'),
    new ScriptOpcode('OP_13'),
    new ScriptOpcode('OP_14'),
    new ScriptOpcode('OP_15'),
    new ScriptOpcode('OP_16')
  ];

  describe('@smallInt', () => {
    let testSmallInt = (n: number, op: ScriptOpcode): void => {
      expect(ScriptOpcode.smallInt(n).toString()).toBe(op.toString());
    };

    for (let i = 0; i < smallints.length; i++) {
      let op = smallints[i];
      test('should work for small int ' + op, () => testSmallInt(i, op));
    }

    test('with not number',() => {
      expect(() => ScriptOpcode.smallInt('2' as any)).toThrow('Invalid Argument');
    });

    test('with n equal -1',() => {
      expect(() => ScriptOpcode.smallInt(-1)).toThrow('Invalid Argument');
    });

    test('with n equal 17',() => {
      expect(() => ScriptOpcode.smallInt(17)).toThrow('Invalid Argument');
    });
  });

  describe('@isSmallIntOp', () => {
    let testIsSmallInt = (op: ScriptOpcode): void => {
      expect(ScriptOpcode.isSmallIntOp(op)).true;
    };

    for (let i = 0; i < smallints.length; i++) {
      let op = smallints[i];
      test('should work for small int ' + op, () => testIsSmallInt(op));
    }

    test('should work for non-small ints', () => {
      expect(ScriptOpcode.isSmallIntOp(new ScriptOpcode('OP_RETURN'))).false;
      expect(ScriptOpcode.isSmallIntOp(new ScriptOpcode('OP_CHECKSIG'))).false;
      expect(ScriptOpcode.isSmallIntOp(new ScriptOpcode('OP_IF'))).false;
      expect(ScriptOpcode.isSmallIntOp(new ScriptOpcode('OP_NOP'))).false;
    });

  });

  describe('#inspect', () => {
    test('should output opcode by name, hex, and decimal', () => {
      expect(ScriptOpcode.fromString('OP_NOP').inspect()).toBe('<Opcode: OP_NOP, hex: 61, decimal: 97>');
      expect(ScriptOpcode.fromString('OP_CHECKDATASIGVERIFY').inspect()).toBe('<Opcode: OP_CHECKDATASIGVERIFY, hex: bb, decimal: 187>');
    });
  });

  describe('decodeOP_N', () => {
    test('should return 0 for Opcode.OP_0', () => {
      expect(ScriptOpcode.decodeOP_N(Opcode.OP_0)).toBe(0);
      expect(ScriptOpcode.decodeOP_N(Opcode.OP_FALSE)).toBe(0);
    });
  
    test('should return correct number for Opcode.OP_1 to Opcode.OP_16', () => {
      for (let i = Opcode.OP_1; i <= Opcode.OP_16; i++) {
        expect(ScriptOpcode.decodeOP_N(i)).toBe(i - (Opcode.OP_1 - 1));
      }
    });
  
    test('should throw an error for invalid opcodes', () => {
      expect(() => ScriptOpcode.decodeOP_N(200)).toThrow('Invalid opcode: 200');
    });
  });
});
