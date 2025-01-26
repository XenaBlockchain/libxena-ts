import { describe, expect, test, vi } from "vitest";
import ECDSA from "../../src/crypto/ecdsa";
import { Hash, PrivateKey, PublicKey } from "../../src";
import BN from "../../src/crypto/bn.extension";
import Signature from "../../src/crypto/signature";
import BufferUtils from "../../src/utils/buffer.utils";

import vectors from "../data/ecdsa.json" assert { type: 'json' };
import Point from "../../src/crypto/point";

describe('ECDSA', () => {

  test('instantiation', () => {
    let ecdsa = new ECDSA();
    expect(ecdsa).toBeDefined();
  });

  let ecdsa = new ECDSA();
  ecdsa.hashbuf = Hash.sha256(Buffer.from('test data'));
  ecdsa.privkey = PrivateKey.from(BN.fromBuffer(
    Buffer.from('fee0a1f7afebf9d2a5a80c0c98a31c709681cce195cbcd06342b517970c0be1e', 'hex')
  ));
  ecdsa.privkey2pubkey();

  describe('#set', () => {
    test('sets hashbuf', () => {
      expect(new ECDSA().set({ hashbuf: ecdsa.hashbuf }).hashbuf).toBeDefined();
    });
  });

  describe('#calci', () => {
    test('calculates i correctly', () => {
      ecdsa.randomK();
      ecdsa.sign();
      ecdsa.calcI();
      expect(ecdsa.sig?.i).toBeDefined();
    });

    test('calulates this known i', () => {
      let hashbuf = Hash.sha256(Buffer.from('some data'));
      let r = new BN('71706645040721865894779025947914615666559616020894583599959600180037551395766', 10);
      let s = new BN('109412465507152403114191008482955798903072313614214706891149785278625167723646', 10);
      let ecdsa = new ECDSA({
        privkey: PrivateKey.from(BN.fromBuffer(Hash.sha256(Buffer.from('test')))),
        hashbuf: hashbuf,
        sig: new Signature({ r: r, s: s } as Signature)
      });

      ecdsa.calcI();
      expect(ecdsa.sig?.i).toBe(1);

      ecdsa.sig!.i = 5;
      expect(() => ecdsa.toPublicKey()).toThrow("i must be equal to 0, 1, 2, or 3");
      ecdsa.sig!.i = 2;
      expect(ecdsa.toPublicKey()).toBeDefined();
      ecdsa.sig!.i = 1;
    });

  });

  describe('#fromString', () => {

    test('round trip with fromString', () => {
      let str = ecdsa.toString();
      let ecdsa2 = ECDSA.fromString(str);
      expect(ecdsa2.hashbuf).toBeDefined();
      expect(ecdsa2.privkey).toBeDefined();
    });

  });

  describe('#randomK', () => {

    test('should generate a new random k when called twice in a row', () => {
      ecdsa.randomK();
      let k1 = ecdsa.k;
      ecdsa.randomK();
      let k2 = ecdsa.k;
      expect(k1!.cmp(k2!) === 0).false;
    });

    test('should generate a random k that is (almost always) greater than this relatively small number', () => {
      ecdsa.randomK();
      let k1 = ecdsa.k;
      let k2 = new BN(Math.pow(2, 32)).mul(new BN(Math.pow(2, 32))).mul(new BN(Math.pow(2, 32)));
      expect(k2.gt(k1!)).false;
    });

  });

  describe('#deterministicK', () => {
    test('should generate the same deterministic k', () => {
      ecdsa.deterministicK();
      expect(ecdsa.k!.toBuffer().toString('hex')).toBe('fcce1de7a9bcd6b2d3defade6afa1913fb9229e3b7ddf4749b55c4848b2a196e');
    });

    test('should generate the same deterministic k if badrs is set', () => {
      ecdsa.deterministicK(0);
      expect(ecdsa.k!.toBuffer().toString('hex')).toBe('fcce1de7a9bcd6b2d3defade6afa1913fb9229e3b7ddf4749b55c4848b2a196e');
      ecdsa.deterministicK(1);
      expect(ecdsa.k!.toBuffer().toString('hex')).not.toBe('fcce1de7a9bcd6b2d3defade6afa1913fb9229e3b7ddf4749b55c4848b2a196e');
      expect(ecdsa.k!.toBuffer().toString('hex')).toBe('727fbcb59eb48b1d7d46f95a04991fc512eb9dbf9105628e3aec87428df28fd8');
    });

    test('should compute this test vector correctly', () => {
      // test fixture from bitcoinjs
      // https://github.com/bitcoinjs/bitcoinjs-lib/blob/10630873ebaa42381c5871e20336fbfb46564ac8/test/fixtures/ecdsa.json#L6
      let ecdsa = new ECDSA();
      ecdsa.hashbuf = Hash.sha256(Buffer.from('Everything should be made as simple as possible, but not simpler.'));
      ecdsa.privkey = PrivateKey.from(new BN(1));
      ecdsa.privkey2pubkey();
      ecdsa.deterministicK();
      expect(ecdsa.k?.toBuffer().toString('hex')).toBe('ec633bd56a5774a0940cb97e27a9e4e51dc94af737596a0c5cbb3d30332d92a5');
      ecdsa.sign();
      expect(ecdsa.sig?.r.toString()).toBe('23362334225185207751494092901091441011938859014081160902781146257181456271561');
      expect(ecdsa.sig?.s.toString()).toBe('50433721247292933944369538617440297985091596895097604618403996029256432099938');
    });
  });

  describe('#toPublicKey', () => {
    test('should calculate the correct public key', () => {
      ecdsa.k = new BN('114860389168127852803919605627759231199925249596762615988727970217268189974335', 10);
      ecdsa.sign();
      ecdsa.sig!.i = 0;
      let pubkey = ecdsa.toPublicKey();
      expect(pubkey.point.eq(ecdsa.pubkey.point)).true;
    });

    test('should calculate the correct public key for this signature with low s', () => {
      ecdsa.k = new BN('114860389168127852803919605627759231199925249596762615988727970217268189974335', 10);
      ecdsa.sig = Signature.fromString('3045022100ec3cfe0e335791ad278b4ec8eac93d0347' +
        'a97877bb1d54d35d189e225c15f6650220278cf15b05ce47fb37d2233802899d94c774d5480bba9f0f2d996baa13370c43');
      ecdsa.sig.i = 0;
      let pubkey = ecdsa.toPublicKey();
      expect(pubkey.point.eq(ecdsa.pubkey.point)).true;
    });

    test('should calculate the correct public key for this signature with high s', () => {
      ecdsa.k = new BN('114860389168127852803919605627759231199925249596762615988727970217268189974335', 10);
      ecdsa.sign();
      ecdsa.sig = Signature.fromString('3046022100ec3cfe0e335791ad278b4ec8eac93d0347' +
        'a97877bb1d54d35d189e225c15f665022100d8730ea4fa31b804c82ddcc7fd766269f33a079ea38e012c9238f2e2bcff34fe');
      ecdsa.sig.i = 1;
      let pubkey = ecdsa.toPublicKey();
      expect(pubkey.point.eq(ecdsa.pubkey.point)).true;
    });

  });

  describe('#sigError', () => {

    test('should return an error if the hash is invalid', () => {
      let ecdsa = new ECDSA();
      expect(ecdsa.sigError()).toBe('hashbuf must be a 32 byte buffer');
    });

    test('should return an error if r, s are invalid', () => {
      let ecdsa = new ECDSA();
      ecdsa.hashbuf = Hash.sha256(Buffer.from('test'));
      let pk = PublicKey.fromDER(Buffer.from('041ff0fe0f7b15ffaa85ff9f4744d539139c252a49' +
        '710fb053bb9f2b933173ff9a7baad41d04514751e6851f5304fd243751703bed21b914f6be218c0fa354a341', 'hex'));
      ecdsa.pubkey = pk;
      ecdsa.sig = new Signature({ r: new BN(0), s: new BN(0) } as Signature);
      expect(ecdsa.sigError()).toBe('r and s not in range');
    });

    test('should return an error if the signature is incorrect', () => {
      ecdsa.sig = Signature.fromString('3046022100e9915e6236695f093a4128ac2a956c40' +
        'ed971531de2f4f41ba05fac7e2bd019c02210094e6a4a769cc7f2a8ab3db696c7cd8d56bcdbfff860a8c81de4bc6a798b90827');
      ecdsa.sig.r = ecdsa.sig.r.add(new BN(1));
      expect(ecdsa.sigError()).toBe('Invalid signature');
    });

  });

  describe('#sign', () => {

    test('should create a valid signature', () => {
      ecdsa.randomK();
      ecdsa.sign();
      expect(ecdsa.verify().verified).true;
    });

    test('should should throw an error if hashbuf is not 32 bytes', () => {
      let ecdsa2 = new ECDSA().set({
        hashbuf: ecdsa.hashbuf.subarray(0, 31),
        privkey: ecdsa.privkey
      });
      ecdsa2.randomK();
      expect(() => ecdsa2.sign()).toThrow('hashbuf must be a 32 byte buffer');
    });

    test('should default to deterministicK', () => {
      let ecdsa2 = new ECDSA(ecdsa);
      ecdsa2.k = undefined;
      const spy = vi.spyOn(ecdsa2, 'deterministicK');
      ecdsa2.sign();
      expect(spy).toHaveBeenCalledOnce(); // Assert the function was called once
      spy.mockRestore(); // Restore the original implementation
    });

    test('should generate right K', () => {
      let msg1 = Buffer.from('52204d20fd0131ae1afd173fd80a3a746d2dcc0cddced8c9dc3d61cc7ab6e966', 'hex');
      let msg2 = BufferUtils.reverse(msg1);
      let pk = Buffer.from('16f243e962c59e71e54189e67e66cf2440a1334514c09c00ddcc21632bac9808', 'hex');
      let signature1 = ECDSA.sign(msg1, PrivateKey.fromBuffer(pk)).toBuffer(false).toString('hex');
      let signature2 = ECDSA.sign(msg2, PrivateKey.fromBuffer(pk), 'little').toBuffer(false).toString('hex');
      expect(signature1).toEqual(signature2);
    });

  });

  describe('#toString', () => {
    test('should convert this to a string', () => {
      let str = ecdsa.toString();
      expect(typeof str === 'string').true;
    });
  });

  describe('signing and verification', () => {
    describe('@sign', () => {
      test('should produce a signature', () => {
        let sig = ECDSA.sign(ecdsa.hashbuf, ecdsa.privkey);
        expect(sig instanceof Signature).true;
      });

      test('should produce a signature, and be different when called twice', () => {
        ecdsa.signRandomK();
        expect(ecdsa.sig).toBeDefined();
        let ecdsa2 = new ECDSA(ecdsa);
        ecdsa2.signRandomK();
        expect(ecdsa.sig!.toString()).not.toBe(ecdsa2.sig!.toString());
      });
    });

    describe('#verify', () => {
      test('should verify a signature that was just signed', () => {
        ecdsa.sig = Signature.fromString('3046022100e9915e6236695f093a4128ac2a956c' +
          '40ed971531de2f4f41ba05fac7e2bd019c02210094e6a4a769cc7f2a8ab3db696c7cd8d56bcdbfff860a8c81de4bc6a798b90827');
        expect(ecdsa.verify().verified).true;
      });

      test('should verify this known good signature', () => {
        ecdsa.signRandomK();
        expect(ecdsa.verify().verified).true;
      });

      test('should verify a valid signature, and unverify an invalid signature', () => {
        let sig = ECDSA.sign(ecdsa.hashbuf, ecdsa.privkey);
        expect(ECDSA.verify(ecdsa.hashbuf, sig, ecdsa.pubkey)).true;
        let fakesig = new Signature({ r: sig.r.add(new BN(1)), s: sig.s } as Signature);
        expect(ECDSA.verify(ecdsa.hashbuf, fakesig, ecdsa.pubkey)).false;
      });

      test('should work with big and little endian', () => {
        let sig = ECDSA.sign(ecdsa.hashbuf, ecdsa.privkey, 'big');
        expect(ECDSA.verify(ecdsa.hashbuf, sig, ecdsa.pubkey, 'big')).true;
        expect(ECDSA.verify(ecdsa.hashbuf, sig, ecdsa.pubkey, 'little')).false;
        sig = ECDSA.sign(ecdsa.hashbuf, ecdsa.privkey, 'little');
        expect(ECDSA.verify(ecdsa.hashbuf, sig, ecdsa.pubkey, 'big')).false;
        expect(ECDSA.verify(ecdsa.hashbuf, sig, ecdsa.pubkey, 'little')).true;
      });
    });

    describe('vectors', () => {

      vectors.valid.forEach((obj, i) => {
        test('should validate valid vector ' + i, () => {
          let ecdsa = new ECDSA().set({
            privkey: PrivateKey.from(BN.fromBuffer(Buffer.from(obj.d, 'hex'))),
            k: BN.fromBuffer(Buffer.from(obj.k, 'hex')),
            hashbuf: Hash.sha256(Buffer.from(obj.message)),
            sig: new Signature({
              r: new BN(obj.signature.r),
              s: new BN(obj.signature.s),
              i: obj.i
            })
          });
          let ecdsa2 = new ECDSA(ecdsa);
          ecdsa2.k = undefined;
          ecdsa2.sign();
          ecdsa2.calcI();
          expect(ecdsa2.k!.toString()).toBe(ecdsa.k!.toString());
          expect(ecdsa2.sig!.toString()).toBe(ecdsa.sig!.toString());
          expect(ecdsa2.sig!.i).toBe(ecdsa.sig!.i);
          expect(ecdsa.verify().verified).true;
        });
      });

      vectors.invalid.sigError.forEach((obj, i) => {
        test('should validate invalid.sigError vector ' + i + ': ' + obj.description, () => {
          let ecdsa = new ECDSA().set({
            pubkey: PublicKey.fromPoint(Point.ecPointFromX(true, 1)),
            sig: new Signature({ r: new BN(obj.signature.r), s: new BN(obj.signature.s) }),
            hashbuf: Hash.sha256(Buffer.from(obj.message))
          });
          expect(ecdsa.sigError()).toBe(obj.exception);
        });
      });

      vectors.deterministicK.forEach(function(obj, i) {
        test('should validate deterministicK vector ' + i, () => {
          let hashbuf = Hash.sha256(Buffer.from(obj.message));
          let privkey = PrivateKey.from(BN.fromBuffer(Buffer.from(obj.privkey, 'hex')), 'mainnet');
          let ecdsa = new ECDSA({
            privkey: privkey,
            hashbuf: hashbuf
          });
          expect(ecdsa.deterministicK(0).k!.toString('hex')).toBe(obj.k_bad00);
          expect(ecdsa.deterministicK(1).k!.toString('hex')).toBe(obj.k_bad01);
          expect(ecdsa.deterministicK(15).k!.toString('hex')).toBe(obj.k_bad15);
        });
      });

    });
  });
});