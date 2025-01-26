import { describe, expect, test } from "vitest";
import Hash from "../../src/crypto/hash";

describe('Hash', function() {
  let buf = Buffer.from([0, 1, 2, 3, 253, 254, 255]);
  let str = 'test string';

  describe('#sha1', function() {
    test('calculates the hash of this buffer correctly', function() {
      let hash = Hash.sha1(buf);
      expect(hash.toString('hex')).toBe('de69b8a4a5604d0486e6420db81e39eb464a17b2');
      hash = Hash.sha1(Buffer.alloc(0));
      expect(hash.toString('hex')).toBe('da39a3ee5e6b4b0d3255bfef95601890afd80709');
    });

    test('throws an error when the input is not a buffer', function() {
      expect(() => Hash.sha1(str as any)).toThrow('Invalid Argument');
    });
  });

  describe('#sha256', function() {
    test('calculates the hash of this buffer correctly', function() {
      let hash = Hash.sha256(buf);
      expect(hash.toString('hex')).toBe('6f2c7b22fd1626998287b3636089087961091de80311b9279c4033ec678a83e8');
    });

    test('fails when the input is not a buffer', function() {
      expect(() => Hash.sha256(str as any)).toThrow('Invalid Argument');
    });
  });

  describe('#sha256hmac', function() {
    test('computes this known big key correctly', function() {
      let key = Buffer.from('b613679a0814d9ec772f95d778c35fc5ff1697c493715653c6c712144292c5ad' +
        'b613679a0814d9ec772f95d778c35fc5ff1697c493715653c6c712144292c5ad' +
        'b613679a0814d9ec772f95d778c35fc5ff1697c493715653c6c712144292c5ad' +
        'b613679a0814d9ec772f95d778c35fc5ff1697c493715653c6c712144292c5ad');
      let data = Buffer.alloc(0);
      expect(Hash.sha256hmac(data, key).toString('hex'))
        .toBe('fb1f87218671f1c0c4593a88498e02b6dfe8afd814c1729e89a1f1f6600faa23');
    });

    test('computes this known empty test vector correctly', function() {
      let key =  Buffer.alloc(0);
      let data =  Buffer.alloc(0);
      expect(Hash.sha256hmac(data, key).toString('hex'))
        .toBe('b613679a0814d9ec772f95d778c35fc5ff1697c493715653c6c712144292c5ad');
    });

    test('computes this known non-empty test vector correctly', function() {
      let key = Buffer.from('key');
      let data =  Buffer.from('The quick brown fox jumps over the lazy dog');
      expect(Hash.sha256hmac(data, key).toString('hex'))
        .toBe('f7bc83f430538424b13298e6aa6fb143ef4d59a14946175997479dbc2d1a3cd8');
    });
  });

  describe('#sha256sha256', function() {
    test('calculates the hash of this buffer correctly', function() {
      let hash = Hash.sha256sha256(buf);
      expect(hash.toString('hex')).toBe('be586c8b20dee549bdd66018c7a79e2b67bb88b7c7d428fa4c970976d2bec5ba');
    });

    test('fails when the input is not a buffer', function() {
      expect(() => Hash.sha256sha256(str as any)).toThrow('Invalid Argument');
    });
  });

  describe('#sha256ripemd160', function() {
    test('calculates the hash of this buffer correctly', function() {
      let hash = Hash.sha256ripemd160(buf);
      expect(hash.toString('hex')).toBe('7322e2bd8535e476c092934e16a6169ca9b707ec');
    });

    test('fails when the input is not a buffer', function() {
      expect(() => Hash.sha256ripemd160(str as any)).toThrow('Invalid Argument');
    });
  });

  describe('#ripemd160', function() {
    test('calculates the hash of this buffer correctly', function() {
      let hash = Hash.ripemd160(buf);
      expect(hash.toString('hex')).toBe('fa0f4565ff776fee0034c713cbf48b5ec06b7f5c');
    });

    test('fails when the input is not a buffer', function() {
      expect(() => Hash.ripemd160(str as any)).toThrow('Invalid Argument');
    });
  });

  describe('#sha512', function() {
    test('calculates the hash of this buffer correctly', function() {
      let hash = Hash.sha512(buf);
      expect(hash.toString('hex'))
        .toBe('c0530aa32048f4904ae162bc14b9eb535eab6c465e960130005fedd' +
          'b71613e7d62aea75f7d3333ba06e805fc8e45681454524e3f8050969fe5a5f7f2392e31d0');
    });

    test('fails when the input is not a buffer', function() {
      expect(() => Hash.sha512(str as any)).toThrow('Invalid Argument');
    });
  });

  describe('#sha512hmac', function() {
    test('calculates this known empty test vector correctly', function() {
      let hex = 'b936cee86c9f87aa5d3c6f2e84cb5a4239a5fe50480a6ec66b70ab5b1f4a' +
        'c6730c6c515421b327ec1d69402e53dfb49ad7381eb067b338fd7b0cb22247225d47';
      expect(Hash.sha512hmac(Buffer.alloc(0), Buffer.alloc(0)).toString('hex')).toBe(hex);
    });

    test('calculates this known non-empty test vector correctly', function() {
      let hex = 'c40bd7c15aa493b309c940e08a73ffbd28b2e4cb729eb94480d727e4df577' +
        'b13cc403a78e6150d83595f3b17c4cc331f12ca5952691de3735a63c1d4c69a2bac';
      let data = Buffer.from('test1');
      let key = Buffer.from('test2');
      expect(Hash.sha512hmac(data, key).toString('hex')).toBe(hex);
    });
  });
});