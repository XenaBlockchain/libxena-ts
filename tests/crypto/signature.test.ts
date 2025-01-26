import { describe, expect, test } from "vitest";
import Signature from "../../src/crypto/signature";
import BN from "../../src/crypto/bn.extension";

describe('Signature', () => {
  test('should work with conveniently setting r, s', () => {
    let sig = new Signature({ r: new BN(1), s: new BN(2) });
    expect(sig).toBeDefined();
  });

  describe('#set', () => {
    test('should set compressed', () => {
      expect(new Signature({ r: new BN(1), s: new BN(2), compressed: true })).toBeDefined();
    });
  });

  describe('#fromCompact', () => {
    test('should create a signature from a compressed signature', () => {
      let blank = Buffer.alloc(32);
      blank.fill(0);
      let compressed = Buffer.concat([
        Buffer.from([0 + 27 + 4]),
        blank,
        blank
      ]);
      let sig = Signature.fromCompact(compressed);
      expect(sig.r.cmp(BN.Zero)).toBe(0);
      expect(sig.s.cmp(BN.Zero)).toBe(0);
      expect(sig.compressed).true;
    });

    test('should create a signature from an uncompressed signature', () => {
      let sigHexaStr = '1cd5e61ab5bfd0d1450997894cb1a53e917f89d82eb43f06fa96f32c96e061aec12fc1188e8b' +
        '0dc553a2588be2b5b68dbbd7f092894aa3397786e9c769c5348dc6';
      let sig = Signature.fromCompact(Buffer.from(sigHexaStr, 'hex'));
      let r = 'd5e61ab5bfd0d1450997894cb1a53e917f89d82eb43f06fa96f32c96e061aec1';
      let s = '2fc1188e8b0dc553a2588be2b5b68dbbd7f092894aa3397786e9c769c5348dc6';
      expect(sig.r.toString('hex')).toBe(r);
      expect(sig.s.toString('hex')).toBe(s);
      expect(sig.compressed).false;
    });

    test('should validate and throw for invalid i values in fromCompact', () => {
      // Craft a buffer with an invalid i value
      // i = buf.subarray(0, 1)[0] - 27 - 4; => i = 5 (invalid)
      // We need val to be set such that (val - 27 - 4) = 5 => val = 36
      let invalidIVal = 36; // (5 + 27 + 4)
      let r = Buffer.alloc(32, 0); // 32 bytes of 0
      let s = Buffer.alloc(32, 0); // 32 bytes of 0
      let buf = Buffer.concat([Buffer.from([invalidIVal]), r, s]);
  
      expect(() => Signature.fromCompact(buf)).toThrow('i must be 0, 1, 2, or 3');
    });
  });

  describe('#fromBuffer', () => {
    test('should parse this format signature', () => {
      let buf = Buffer.from('8614db4614a9688e60db0e54679b7c8633c316dfc517729343364bec97d8d3aaf3363469806866d279e1bf40931a58b449697cdb9f065a1b676f2ad515ff30bf', 'hex');
      let sig = Signature.fromBuffer(buf);
      expect(sig.r.toBuffer({ size: 32 }).toString('hex')).toBe('8614db4614a9688e60db0e54679b7c8633c316dfc517729343364bec97d8d3aa');
      expect(sig.s.toBuffer({ size: 32 }).toString('hex')).toBe('f3363469806866d279e1bf40931a58b449697cdb9f065a1b676f2ad515ff30bf');
    });
  });

  describe('#fromString', () => {
    test('should parse this signature in hex', () => {
      let buf =  Buffer.from('8614db4614a9688e60db0e54679b7c8633c316dfc517729343364bec97d8d3aaf3363469806866d279e1bf40931a58b449697cdb9f065a1b676f2ad515ff30bf', 'hex');
      let sig = Signature.fromString(buf.toString('hex'));
      expect(sig.r.toBuffer({ size: 32 }).toString('hex')).toBe('8614db4614a9688e60db0e54679b7c8633c316dfc517729343364bec97d8d3aa');
      expect(sig.s.toBuffer({ size: 32 }).toString('hex')).toBe('f3363469806866d279e1bf40931a58b449697cdb9f065a1b676f2ad515ff30bf');
    });
  });

  describe('#toCompact', () => {
    test('should return a compact buffer with default parameters', () => {
      let params = {
        i: 1,
        compressed: true,
        r: new BN('1234', 16),
        s: new BN('5678', 16)
      };
      let signature = new Signature(params);
      let result = signature.toCompact();
      
      // Expected values:
      // - val = 1 + 27 + 4 = 32 (0x20 in hex)
      // - r and s are padded to 32 bytes: r = 0...01234, s = 0...05678
      let expectedHex = '20' + '0000000000000000000000000000000000000000000000000000000000001234' + 
                                '0000000000000000000000000000000000000000000000000000000000005678';
      expect(result.toString('hex')).toBe(expectedHex);
    });
  
    test('should validate and throw for invalid i values', () => {
      let params = {
        i: 4, // Invalid i value for testing
        compressed: true,
        r: new BN('1234', 16),
        s: new BN('5678', 16)
      };
      let signature = new Signature(params);
      expect(() => signature.toCompact(5)).toThrow('i must be equal to 0, 1, 2, or 3');
    });
  
    test('should correctly adjust val for uncompressed', () => {
      let params = {
        i: 0,
        compressed: false,
        r: new BN('1234', 16),
        s: new BN('5678', 16)
      };
      let signature = new Signature(params);
      let result = signature.toCompact();
      
      // Expected values:
      // - val = 0 + 27 = 27 (0x1b in hex)
      // - r and s are padded to 32 bytes: r = 0...01234, s = 0...05678
      let expectedHex = '1b' + '0000000000000000000000000000000000000000000000000000000000001234' + 
                                '0000000000000000000000000000000000000000000000000000000000005678';
      expect(result.toString('hex')).toBe(expectedHex);
    });
  
    test('should accept i and compressed as arguments', () => {
      let params = {
        i: 3,
        compressed: false,
        r: new BN('1234', 16),
        s: new BN('5678', 16)
      };
      let signature = new Signature(params);
      let result = signature.toCompact(2, true);
      
      // Expected values:
      // - val = 2 + 27 + 4 = 33 (0x21 in hex)
      // - r and s are padded to 32 bytes: r = 0...01234, s = 0...05678
      let expectedHex = '21' + '0000000000000000000000000000000000000000000000000000000000001234' + 
                                '0000000000000000000000000000000000000000000000000000000000005678';
      expect(result.toString('hex')).toBe(expectedHex);
    });
  
    test('should handle r and s properly as buffers of size 32', () => {
      let params = {
        i: 0,
        compressed: true,
        r: new BN('1', 16),
        s: new BN('2', 16)
      };
      let signature = new Signature(params);
      let result = signature.toCompact();
      
      // Expected values:
      // - val = 0 + 27 + 4 = 31 (0x1f in hex)
      // - r and s are padded to 32 bytes: r = 0...0001, s = 0...0002
      let expectedHex = '1f' + '0000000000000000000000000000000000000000000000000000000000000001' + 
                                '0000000000000000000000000000000000000000000000000000000000000002';
      expect(result.toString('hex')).toBe(expectedHex);
    });
  });

  describe('#toTxFormat', () => {
    test('should parse this known signature and rebuild it with or without sighash types', () => {
      let original = 'b3421028b6ec39e85148ce517c6484c31dcd54f241fec44d1334dc46c4d8e555c5ca06a37f3bb799806abb3035aec03c626ba9089e5f8fd3738837989dd2cacb110101';
      let buf =  Buffer.from(original, 'hex');
      let sig = Signature.fromTxFormat(buf);
      let sighash = buf.subarray(64);

      expect(sighash).toEqual(Buffer.from("110101", 'hex'));
      expect(sig.toTxFormat().toString('hex')).not.toBe(original);
      expect(sig.toTxFormat().toString('hex')).toBe(buf.subarray(0, 64).toString('hex'));
      expect(sig.toTxFormat(sighash).toString('hex')).toBe(original);
    });

  });

  describe('#fromTxFormat', () => {
    test('should convert from this known tx-format buffer', () => {
      let buf =  Buffer.from('8614db4614a9688e60db0e54679b7c8633c316dfc517729343364bec97d8d3aaf3363469806866d279e1bf40931a58b449697cdb9f065a1b676f2ad515ff30bf', 'hex');
      let sig = Signature.fromTxFormat(buf);
      expect(sig.r.toString('hex')).toBe('8614db4614a9688e60db0e54679b7c8633c316dfc517729343364bec97d8d3aa');
      expect(sig.s.toString('hex')).toBe('f3363469806866d279e1bf40931a58b449697cdb9f065a1b676f2ad515ff30bf');
    });

    test('should parse this known signature and rebuild it', () => {
      let hex = '8614db4614a9688e60db0e54679b7c8633c316dfc517729343364bec97d8d3aaf3363469806866d279e1bf40931a58b449697cdb9f065a1b676f2ad515ff30bf';
      let buf = Buffer.from(hex, 'hex');
      let sig = Signature.fromTxFormat(buf);
      expect(sig.toTxFormat().toString('hex')).toBe(hex);
    });
  });

  describe('#fromTxString', () => {
    test('should convert from this known tx-format string', () => {
      let sig = Signature.fromTxString('8614db4614a9688e60db0e54679b7c8633c316dfc517729343364bec97d8d3aaf3363469806866d279e1bf40931a58b449697cdb9f065a1b676f2ad515ff30bf');
      expect(sig.r.toString('hex')).toBe('8614db4614a9688e60db0e54679b7c8633c316dfc517729343364bec97d8d3aa');
      expect(sig.s.toString('hex')).toBe('f3363469806866d279e1bf40931a58b449697cdb9f065a1b676f2ad515ff30bf');
    });

    test('should parse this known signature and rebuild it', () => {
      let hex = '8614db4614a9688e60db0e54679b7c8633c316dfc517729343364bec97d8d3aaf3363469806866d279e1bf40931a58b449697cdb9f065a1b676f2ad515ff30bf';
      let sig = Signature.fromTxString(hex);
      expect(sig.toTxFormat().toString('hex')).toBe(hex);
    });
  });

  describe('#toBuffer', () => {
    test('should convert these known r and s values into a known signature', () => {
      let r = new BN('8614db4614a9688e60db0e54679b7c8633c316dfc517729343364bec97d8d3aa', 'hex');
      let s = new BN('f3363469806866d279e1bf40931a58b449697cdb9f065a1b676f2ad515ff30bf', 'hex');
      let sig = new Signature({ r: r, s: s });
      let sigbuf = sig.toBuffer();
      expect(sigbuf.toString('hex')).toBe('8614db4614a9688e60db0e54679b7c8633c316dfc517729343364bec97d8d3aaf3363469806866d279e1bf40931a58b449697cdb9f065a1b676f2ad515ff30bf');
    });

    test('should convert these known r and s values into a known signature', function() {
      let r = new BN('63173831029936981022572627018246571655303050627048489594159321588908385378810');
      let s = new BN('4331694221846364448463828256391194279133231453999942381442030409253074198130');
      let sig = new Signature({ r: r, s: s });
      let der = sig.toBuffer(false);
      expect(der.toString('hex')).toBe('30450221008bab1f0a2ff2f9cb8992173d8ad73c229d31ea8e10b0f4d4ae1a0d8ed76021fa02200993a6ec81755b9111762fc2cf8e3ede73047515622792110867d12654275e72');
    });
  });

  describe('#toString', () => {
    test('should convert this signature in to hex DER', () => {
      let r = new BN('8614db4614a9688e60db0e54679b7c8633c316dfc517729343364bec97d8d3aa', 'hex');
      let s = new BN('f3363469806866d279e1bf40931a58b449697cdb9f065a1b676f2ad515ff30bf', 'hex');
      let sig = new Signature({
        r: r,
        s: s
      });
      let hex = sig.toString();
      expect(hex).toBe('8614db4614a9688e60db0e54679b7c8633c316dfc517729343364bec97d8d3aaf3363469806866d279e1bf40931a58b449697cdb9f065a1b676f2ad515ff30bf');
    });
  });

  describe('#parseDER', function() {

    test('should parse this signature generated in node', function() {
      let sighex = '30450221008bab1f0a2ff2f9cb8992173d8ad73c229d31ea8e10b0f4d4ae1a0d8ed76021fa02200993a6ec81755b9111762fc2cf8e3ede73047515622792110867d12654275e72';
      let sig = Buffer.from(sighex, 'hex');
      let parsed = Signature.parseDER(sig);
      expect(parsed.header).toBe(0x30);
      expect(parsed.length).toBe(69);
      expect(parsed.rlength).toBe(33);
      expect(parsed.rneg).toBe(true);
      expect((parsed.rbuf as Buffer).toString('hex')).toBe('008bab1f0a2ff2f9cb8992173d8ad73c229d31ea8e10b0f4d4ae1a0d8ed76021fa');
      expect((parsed.r as BN).toString()).toBe('63173831029936981022572627018246571655303050627048489594159321588908385378810');
      expect(parsed.slength).toBe(32);
      expect(parsed.sneg).toBe(false);
      expect((parsed.sbuf as Buffer).toString('hex')).toBe('0993a6ec81755b9111762fc2cf8e3ede73047515622792110867d12654275e72');
      expect((parsed.s as BN).toString()).toBe('4331694221846364448463828256391194279133231453999942381442030409253074198130');
    });

    test('should parse this 69 byte signature', function() {
      let sighex = '3043021f59e4705959cc78acbfcf8bd0114e9cc1b389a4287fb33152b73a38c319b50302202f7428a27284c757e409bf41506183e9e49dfb54d5063796dfa0d403a4deccfa';
      let sig = Buffer.from(sighex, 'hex');
      let parsed = Signature.parseDER(sig);
      expect(parsed.header).toBe(0x30);
      expect(parsed.length).toBe(67);
      expect(parsed.rlength).toBe(31);
      expect(parsed.rneg).toBe(false);
      expect((parsed.rbuf as Buffer).toString('hex')).toBe('59e4705959cc78acbfcf8bd0114e9cc1b389a4287fb33152b73a38c319b503');
      expect((parsed.r as BN).toString()).toBe('158826015856106182499128681792325160381907915189052224498209222621383996675');
      expect(parsed.slength).toBe(32);
      expect(parsed.sneg).toBe(false);
      expect((parsed.sbuf as Buffer).toString('hex')).toBe('2f7428a27284c757e409bf41506183e9e49dfb54d5063796dfa0d403a4deccfa');
      expect((parsed.s as BN).toString()).toBe('21463938592353267769710297084836796652964571266930856168996063301532842380538');
    });

    test('should parse this 68 byte signature', function() {
      let sighex = '3042021e17cfe77536c3fb0526bd1a72d7a8e0973f463add210be14063c8a9c37632022061bfa677f825ded82ba0863fb0c46ca1388dd3e647f6a93c038168b59d131a51';
      let sig = Buffer.from(sighex, 'hex');
      let parsed = Signature.parseDER(sig);
      expect(parsed.header).toBe(0x30);
      expect(parsed.length).toBe(66);
      expect(parsed.rlength).toBe(30);
      expect(parsed.rneg).toBe(false);
      expect((parsed.rbuf as Buffer).toString('hex')).toBe('17cfe77536c3fb0526bd1a72d7a8e0973f463add210be14063c8a9c37632');
      expect((parsed.r as BN).toString()).toBe('164345250294671732127776123343329699648286106708464198588053542748255794');
      expect(parsed.slength).toBe(32);
      expect(parsed.sneg).toBe(false);
      expect((parsed.sbuf as Buffer).toString('hex')).toBe('61bfa677f825ded82ba0863fb0c46ca1388dd3e647f6a93c038168b59d131a51');
      expect((parsed.s as BN).toString()).toBe('44212963026209759051804639008236126356702363229859210154760104982946304432721');
    });

    test('should parse this signature from script_valid.json', function() {
      let sighex = '304502203e4516da7253cf068effec6b95c41221c0cf3a8e6ccb8cbf1725b562e9afde2c022100ab1e3da73d67e32045a20e0b999e049978ea8d6ee5480d485fcf2ce0d03b2ef051';
      let sig = Buffer.from(sighex, 'hex');
      let parsed = Signature.parseDER(sig, false);
      expect(parsed).toBeDefined();
    });
  });
});