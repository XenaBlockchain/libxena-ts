import { describe, expect, test } from "vitest";
import BN from "../../src/crypto/bn.extension";

describe('BN', () => {
  test('should create a bn', () => {
    let bn = new BN(50);
    expect(bn).toBeDefined();
    expect(bn.toString()).toBe('50');
  });

  test('should parse this number', () => {
    let bn = new BN(999970000);
    expect(bn.toString()).toBe('999970000');
  });

  test('should parse numbers below and at bn.js internal word size', () => {
    let bn = new BN(Math.pow(2, 26) - 1);
    expect(bn.toString()).toBe((Math.pow(2, 26) - 1).toString());
    bn = new BN(Math.pow(2, 26));
    expect(bn.toString()).toBe((Math.pow(2, 26)).toString());
  });

  describe('#add', () => {
    test('should add two small numbers together', () => {
      let bn1 = new BN(50);
      let bn2 = new BN(75);
      let bn3 = bn1.add(bn2);
      expect(bn3.toString()).toBe('125');
    });
  });

  describe('#sub', () => {
    test('should subtract a small number', () => {
      let bn1 = new BN(50);
      let bn2 = new BN(25);
      let bn3 = bn1.sub(bn2);
      expect(bn3.toString()).toBe('25');
    });
  });

  describe('#gt', () => {
    test('should say 1 is greater than 0', () => {
      let bn1 = new BN(1);
      let bn0 = new BN(0);
      expect(bn1.gt(bn0)).toBe(true);
    });

    test('should say a big number is greater than a small big number', () => {
      let bn1 = new BN('24023452345398529485723980457');
      let bn0 = new BN('34098234283412341234049357');
      expect(bn1.gt(bn0)).toBe(true);
    });

    test('should say a big number is great than a standard number', () => {
      let bn1 = new BN('24023452345398529485723980457');
      let bn0 = new BN(5);
      expect(bn1.gt(bn0)).toBe(true);
    });
  });

  describe('to/from ScriptNumBuffer', () => {
    [0, 1, 10, 128, 256, 1000, 65536, 65537, -1, -128, -1000, -65536, -65537].forEach(n => {
      test('rountrips correctly for ' + n, () => {
        expect(BN.fromScriptNumBuffer(new BN(n).toScriptNumBuffer()).toNumber()).toBe(n);
        expect(BN.fromScriptNumBuffer(new BN(n).toScriptNumBuffer()).toBigInt()).toBe(BigInt(n));
      });
    });

    test('should throw an error for non-minimally encoded script number', () => {
      expect(() => BN.fromScriptNumBuffer(Buffer.from([0x01, 0x00]), true)).toThrow('non-minimally encoded script number');
      expect(() => BN.fromScriptNumBuffer(Buffer.from([0x00]), true)).toThrow('non-minimally encoded script number');
    });
  });

  describe('to ScriptBigNumBuffer', () => {
    test('rountrips correctly', () => {
      expect(new BN(0).toScriptBigNumBuffer().toString('hex')).toBe('0000');
      expect(new BN(1).toScriptBigNumBuffer().toString('hex')).toBe('0100');
      expect(new BN(10).toScriptBigNumBuffer().toString('hex')).toBe('0a00');
      expect(new BN(256).toScriptBigNumBuffer().toString('hex')).toBe('000100');
      expect(new BN(1000).toScriptBigNumBuffer().toString('hex')).toBe('e80300');
      expect(new BN(65536).toScriptBigNumBuffer().toString('hex')).toBe('00000100');
      expect(new BN(65537).toScriptBigNumBuffer().toString('hex')).toBe('01000100');
      expect(new BN(-1).toScriptBigNumBuffer().toString('hex')).toBe('0180');
      expect(new BN(-1000).toScriptBigNumBuffer().toString('hex')).toBe('e80380');
      expect(new BN(-65536).toScriptBigNumBuffer().toString('hex')).toBe('00000180');
      expect(new BN(-65537).toScriptBigNumBuffer().toString('hex')).toBe('01000180');
    });
  });

  describe('#fromNumber', () => {
    test('should make BN from a number', () => {
      expect(BN.fromNumber(5).toString()).toBe('5');
    });
  });

  describe('#fromBigInt', () => {
    test('should make BN from a bigint', () => {
      expect(BN.fromBigInt(5n).toString()).toBe('5');
    });
  });

  describe('#fromString', () => {
    test('should make BN from a string', () => {
      expect(BN.fromString('5').toString()).toBe('5');
    });
    test('should work with hex string', () => {
      expect(BN.fromString('7fffff0000000000000000000000000000000000000000000000000000000000', 16).toString(16))
        .toBe('7fffff0000000000000000000000000000000000000000000000000000000000');
    });
  });

  describe('#toString', () => {
    test('should make a string', () => {
      expect(new BN(5).toString()).toBe('5');
    });
  });

  describe('@fromBuffer', () => {
    test('should work with big endian', () => {
      let bn = BN.fromBuffer(Buffer.from('0001', 'hex'), {
        endian: 'big'
      });
      expect(bn.toString()).toBe('1');
    });

    test('should work with big endian 256', () => {
      let bn = BN.fromBuffer(Buffer.from('0100', 'hex'), {
        endian: 'big'
      });
      expect(bn.toString()).toBe('256');
    });

    test('should work with little endian if we specify the size', () => {
      let bn = BN.fromBuffer(Buffer.from('0100', 'hex'), {
        size: 2,
        endian: 'little'
      });
      expect(bn.toString()).toBe('1');
    });

  });

  describe('#toBuffer', () => {
    test('should create a 4 byte buffer', () => {
      let bn = new BN(1);
      expect(bn.toBuffer({ size: 4 }).toString('hex')).toBe('00000001');
      expect(bn.toBuffer("be", 4).toString('hex')).toBe('00000001');
    });

    test('should create a 4 byte buffer in little endian', () => {
      let bn = new BN(1);
      expect(bn.toBuffer({ size: 4, endian: 'little' }).toString('hex')).toBe('01000000');
      expect(bn.toBuffer("le", 4).toString('hex')).toBe('01000000');
    });

    test('should create a 2 byte buffer even if you ask for a 1 byte', () => {
      let bn = new BN('ff00', 16);
      expect(bn.toBuffer({ size: 1 }).toString('hex')).toBe('ff00');
    });

    test('should create a 4 byte buffer even if you ask for a 1 byte', () => {
      let bn = new BN('ffffff00', 16);
      expect(bn.toBuffer({ size: 1 }).toString('hex')).toBe('ffffff00');
    });
  });

  describe('#getSize', () => {
    test('should get correct size', () => {
      let bn = new BN('ff00', 16);
      expect(bn.getSize()).toBe(2.125);
    });
  });

  describe('safeAdd', () => {
    const maxSize = 8;
    test('should add two numbers without overflow', () => {
      const bn1 = new BN(10);
      const bn2 = new BN(20);
      const result = bn1.safeAdd(bn2, maxSize);
      expect(result.toString()).toEqual('30'); // 10 + 20 = 30
    });

    test('should throw an error for overflow in addition', () => {
      const bn1 = new BN(BigInt(2n ** 63n).toString());
      const bn2 = new BN(BigInt(2n ** 63n).toString());
      expect(() => bn1.safeAdd(bn2, maxSize)).toThrow('overflow'); // Addition exceeds maxSize
    });
  });

  // Test for safeSub
  describe('safeSub', () => {
    const maxSize = 8;
    test('should subtract two numbers without overflow', () => {
      const bn1 = new BN(50);
      const bn2 = new BN(20);
      const result = bn1.safeSub(bn2, maxSize);
      expect(result.toString()).toEqual('30'); // 50 - 20 = 30
    });

    test('should throw an error for overflow in subtraction', () => {
      const bn1 = new BN(BigInt(2n ** 64n).toString());
      const bn2 = new BN(BigInt(2n ** 64n).toString());
      expect(() => bn1.safeSub(bn2, maxSize)).toThrow('overflow'); // Subtraction exceeds maxSize
    });
  });

  // Test for safeMul
  describe('safeMul', () => {
    const maxSize = 8;
    test('should multiply two numbers without overflow', () => {
      const bn1 = new BN(10);
      const bn2 = new BN(3);
      const result = bn1.safeMul(bn2, maxSize);
      expect(result.toString()).toEqual('30'); // 10 * 3 = 30
    });

    test('should throw an error for overflow in multiplication', () => {
      const bn1 = new BN(2 ** 32);
      const bn2 = new BN(2 ** 32);
      expect(() => bn1.safeMul(bn2, maxSize)).toThrow('overflow'); // Multiplication exceeds maxSize
    });
  });
});