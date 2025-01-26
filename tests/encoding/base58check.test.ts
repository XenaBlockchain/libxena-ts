import { describe, expect, test } from "vitest";
import Base58 from "../../src/encoding/base58";
import Base58Check from "../../src/encoding/base58check";

describe('Base58Check', () => {
  let buf = Buffer.from([0, 1, 2, 3, 253, 254, 255]);
  let enc = '14HV44ipwoaqfg';

  test('should make an instance with "new"', () => {
    expect(new Base58Check()).toBeDefined();
  });

  test('should allow this handy syntax', () => {
    expect(new Base58Check(buf).toString()).toBe(enc);
    expect(new Base58Check(enc).toBuffer()!.toString('hex')).toBe(buf.toString('hex'));
  });

  describe('@validChecksum', () => {
    test('can validate a serialized string', () => {
      let address = '3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy';
      expect(Base58Check.validChecksum(address)).true;
  
      address = address + 'a';
      expect(Base58Check.validChecksum(address)).false;
    });

    test('should return true when the checksum is correct (strings as input)', () => {
      // Example data and checksum as strings (base58 encoded)
      const dataString = '3MNQE1X'; // This is an example base58-encoded string
  
      // Ensuring checksum is correct for the provided data
      const dataBuffer = Buffer.from(Base58.decode(dataString));
      const correctChecksumBuffer = Base58Check.checksum(dataBuffer).subarray(0, 4);
      const correctChecksumString = Base58.encode(correctChecksumBuffer);
  
      // Calling validChecksum method
      const isValid = Base58Check.validChecksum(dataString, correctChecksumString);
  
      expect(isValid).toBe(true);
    });
  
    test('should return false when the checksum is incorrect (strings as input)', () => {
      const dataString = '3MNQE1X'; // Example base58-encoded string
      const wrongChecksumString = '11111'; // Intentionally incorrect checksum
  
      // Calling validChecksum method with incorrect checksum
      const isValid = Base58Check.validChecksum(dataString, wrongChecksumString);
  
      expect(isValid).toBe(false);
    });
  });

  describe('#set', () => {
    test('should set a buf', () => {
      let b58 = new Base58Check({buf: buf});
      expect(b58.toBuffer()).toBeDefined();
    });
  });

  describe('@encode', () => {
    test('should encode the buffer accurately', () => {
      expect(Base58Check.encode(buf)).toBe(enc);
    });

    test('should throw an error when the input is not a buffer', () => {
      expect(() =>  Base58Check.encode('string' as any)).toThrow('Input must be a buffer');
    });
  });

  describe('@decode', () => {
    test('should decode this encoded value correctly', () => {
      expect(Base58Check.decode(enc).toString('hex')).toBe(buf.toString('hex'));
    });

    test('should throw an error when input is not a string', () => {
      expect(() => Base58Check.decode(5 as any)).toThrow('Input must be a string');
    });

    test('should throw an error when input is too short', () => {
      expect(() => Base58Check.decode(enc.slice(0, 1))).toThrow('Input string too short');
    });

    test('should throw an error when there is a checksum mismatch', () => {
      let buf2 = Base58.decode(enc);
      buf2[0] = buf2[0] + 1;
      let enc2 = Base58.encode(buf2);
      expect(() => Base58Check.decode(enc2)).toThrow('Checksum mismatch');
    });
  });

  describe('#fromBuffer', () => {
    test('should set a buf', () => {
      expect(new Base58Check(buf).toBuffer()).toBeDefined();
    });

    test('should set buffer', () => {
      let b58 = new Base58Check(buf);
      expect(b58.toBuffer()).toBeDefined();
      expect(b58.toBuffer()!.toString('hex')).toBe(buf.toString('hex'));
    });
  });

  describe('#fromString', () => {
    test('should convert this known string to a buffer', () => {
      expect(new Base58Check(enc).toBuffer()!.toString('hex')).toBe(buf.toString('hex'));
    });
  });

  describe('#toBuffer', () => {
    test('should return the buffer', () => {
      let b58 = new Base58Check({buf: buf});
      expect(b58.toBuffer()!.toString('hex')).toBe(buf.toString('hex'));
    });

  });

  describe('#toString', () => {
    test('should return encoded string', () => {
      expect(new Base58Check({buf: buf}).toString()).toBe(enc);
      expect(new Base58Check({buf: undefined}).toString()).empty;
    });
  });
});