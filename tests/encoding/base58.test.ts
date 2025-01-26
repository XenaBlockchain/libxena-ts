import { describe, expect, test } from "vitest";
import Base58 from "../../src/encoding/base58";

describe('Base58', () => {
  let buf = Buffer.from([0, 1, 2, 3, 253, 254, 255]);
  let enc = '1W7N4RuG';

  test('should make an instance with "new"', () => {
    expect(new Base58()).toBeDefined();
  });

  test('validates characters with no false negatives', () => {
    expect(Base58.validCharacters('123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz')).true;
  });

  test('validates characters from buffer', () => {
    expect(Base58.validCharacters(Buffer.from('123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'))).true;
  });

  test('some characters are invalid (no false positives)', () => {
    expect(Base58.validCharacters('!@#%^$&*()\\')).false;
  });

  test('should allow this handy syntax', () => {
    expect(new Base58(buf).toString()).toBe(enc);
    expect(new Base58(enc).toBuffer()!.toString('hex')).toBe(buf.toString('hex'));
  });

  test('should set a blank buffer', () => {
    expect(new Base58({ buf: Buffer.from([]) }).toBuffer()).toEqual(Buffer.from([]));
  });

  describe('@encode', () => {
    test('should encode the buffer accurately', () => {
      expect(Base58.encode(buf)).toBe(enc);
    });

    test('should throw an error when the Input is not a buffer', () => {
      expect(() => Base58.encode('string' as any)).toThrow('Input should be a buffer');
    });
  });

  describe('@decode', () => {
    test('should decode this encoded value correctly', () => {
      expect(Base58.decode(enc).toString('hex')).toBe(buf.toString('hex'));
    });

    test('should throw an error when Input is not a string', () => {
      expect(() => Base58.decode(5 as any)).toThrow('Input should be a string');
    });
  });

  describe('#toString', () => {
    test('should return encoded string', () => {
      expect(new Base58({buf: buf}).toString()).toBe(enc);
      expect(new Base58({buf: undefined}).toString()).empty;
    });
  });
});
