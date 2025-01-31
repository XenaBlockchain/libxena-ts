import { describe, test, expect, vi } from "vitest";
import Script from "../../../src/core/script/script";
import ScriptFactory from "../../../src/core/script/script.factory";
import ScriptOpcode, { Opcode } from "../../../src/core/script/opcode";
import PublicKey from "../../../src/keys/publickey";
import Signature from "../../../src/crypto/signature";
import Hash from "../../../src/crypto/hash";
import BufferReader from "../../../src/encoding/bufferreader";
import { GroupIdType } from "../../../src";


describe('Script', () => {

  test('should make a new script', () => {
    let script = new Script();
    expect(script).toBeInstanceOf(Script);
    expect(script.chunks).toEqual([]);
  });

  test('should make a new script when from is null', () => {
    let script = new Script(null as any);
    expect(script).toBeInstanceOf(Script);
    expect(script.chunks).toEqual([]);
  });

  test('should make a new script from another script', () => {
    let script = Script.empty().add(Opcode.OP_1);
    let script2 = new Script(script);
    expect(script2).toBeInstanceOf(Script);
    expect(script2.chunks.length).toBe(1);
    expect(script2.chunks[0].opcodenum).toBe(Opcode.OP_1);
    expect(script2 === script).toBe(false);
  });

  describe('#set', () => {
    let script = new Script();

    test('should be object', () => {
      expect(() => script.set(null as any)).toThrow("Invalid Argument");
    });

    test('chunks should be array', () => {
      expect(() => script.set({chunks: 1} as any)).toThrow("Invalid Argument");
    });

    test('set chunks', () => {
      script.set({chunks: [1]} as any);
      expect(script.chunks).toEqual([1]);
    });
  });

  describe('#fromBuffer', () => {
    
    test('should throw on invalid script buffer', () => {
      let buf = Buffer.alloc(1);
      buf[0] = Opcode.OP_PUSHDATA1;
      expect(() => Script.fromBuffer(buf)).toThrow('Invalid script buffer');

      // just to satisfy coverage because ts not allow typing in catch block
      vi.spyOn(BufferReader.prototype, 'readUInt8').mockImplementation(() => {
        throw new TypeError('wrong type');
      });
      expect(() => Script.fromBuffer(buf)).toThrow('wrong type');
      vi.restoreAllMocks();
    });

    test('should parse this buffer containing an OP code', () => {
      let buf = Buffer.alloc(1);
      buf[0] = Opcode.OP_0;
      let script = Script.fromBuffer(buf);
      expect(script.chunks.length).toBe(1);
      expect(script.chunks[0].opcodenum).toBe(buf[0]);
    });

    test('should parse this buffer containing another OP code', () => {
      let buf = Buffer.alloc(1);
      buf[0] = Opcode.OP_CHECKMULTISIG;
      let script = Script.fromBuffer(buf);
      expect(script.chunks.length).toBe(1);
      expect(script.chunks[0].opcodenum).toBe(buf[0]);
    });

    test('should parse this buffer containing three bytes of data', () => {
      let buf = Buffer.from([3, 1, 2, 3]);
      let script = Script.fromBuffer(buf);
      expect(script.chunks.length).toBe(1);
      expect(script.chunks[0].buf?.toString('hex')).toBe('010203');
    });

    test('should parse this buffer containing OP_PUSHDATA1 and three bytes of data', () => {
      let buf = Buffer.from([0, 0, 1, 2, 3]);
      buf[0] = Opcode.OP_PUSHDATA1;
      buf.writeUInt8(3, 1);
      let script = Script.fromBuffer(buf);
      expect(script.chunks.length).toBe(1);
      expect(script.chunks[0].buf?.toString('hex')).toBe('010203');
    });

    test('should parse this buffer containing OP_PUSHDATA2 and three bytes of data', () => {
      let buf = Buffer.from([0, 0, 0, 1, 2, 3]);
      buf[0] = Opcode.OP_PUSHDATA2;
      buf.writeUInt16LE(3, 1);
      let script = Script.fromBuffer(buf);
      expect(script.chunks.length).toBe(1);
      expect(script.chunks[0].buf?.toString('hex')).toBe('010203');
    });

    test('should parse this buffer containing OP_PUSHDATA4 and three bytes of data', () => {
      let buf = Buffer.from([0, 0, 0, 0, 0, 1, 2, 3]);
      buf[0] = Opcode.OP_PUSHDATA4;
      buf.writeUInt16LE(3, 1);
      let script = Script.fromBuffer(buf);
      expect(script.chunks.length).toBe(1);
      expect(script.chunks[0].buf?.toString('hex')).toBe('010203');
    });

    test('should parse this buffer an OP code, data, and another OP code', () => {
      let buf = Buffer.from([0, 0, 0, 0, 0, 0, 1, 2, 3, 0]);
      buf[0] = Opcode.OP_0;
      buf[1] = Opcode.OP_PUSHDATA4;
      buf.writeUInt16LE(3, 2);
      buf[buf.length - 1] = Opcode.OP_0;
      let script = Script.fromBuffer(buf);
      expect(script.chunks.length).toBe(3);
      expect(script.chunks[0].opcodenum).toBe(buf[0]);
      expect(script.chunks[1].buf?.toString('hex')).toBe('010203');
      expect(script.chunks[2].opcodenum).toBe(buf[buf.length - 1]);
    });

  });

  describe('#toBuffer', () => {

    test('should output this buffer containing an OP code', () => {
      let buf = Buffer.alloc(1);
      buf[0] = Opcode.OP_0;
      let script = Script.fromBuffer(buf);
      expect(script.chunks.length).toBe(1);
      expect(script.chunks[0].opcodenum).toBe(buf[0]);
      expect(script.toBuffer().toString('hex')).toBe(buf.toString('hex'));
    });

    test('should output this buffer containing another OP code', () => {
      let buf = Buffer.alloc(1);
      buf[0] = Opcode.OP_CHECKMULTISIG;
      let script = Script.fromBuffer(buf);
      expect(script.chunks.length).toBe(1);
      expect(script.chunks[0].opcodenum).toBe(buf[0]);
      expect(script.toBuffer().toString('hex')).toBe(buf.toString('hex'));
    });

    test('should output this buffer containing three bytes of data', () => {
      let buf = Buffer.from([3, 1, 2, 3]);
      let script = Script.fromBuffer(buf);
      expect(script.chunks.length).toBe(1);
      expect(script.chunks[0].buf?.toString('hex')).toBe('010203');
      expect(script.toBuffer().toString('hex')).toBe(buf.toString('hex'));
    });

    test('should output this buffer containing OP_PUSHDATA1 and three bytes of data', () => {
      let buf = Buffer.from([0, 0, 1, 2, 3]);
      buf[0] = Opcode.OP_PUSHDATA1;
      buf.writeUInt8(3, 1);
      let script = Script.fromBuffer(buf);
      expect(script.chunks.length).toBe(1);
      expect(script.chunks[0].buf?.toString('hex')).toBe('010203');
      expect(script.toBuffer().toString('hex')).toBe(buf.toString('hex'));
    });

    test('should output this buffer containing OP_PUSHDATA2 and three bytes of data', () => {
      let buf = Buffer.from([0, 0, 0, 1, 2, 3]);
      buf[0] = Opcode.OP_PUSHDATA2;
      buf.writeUInt16LE(3, 1);
      let script = Script.fromBuffer(buf);
      expect(script.chunks.length).toBe(1);
      expect(script.chunks[0].buf?.toString('hex')).toBe('010203');
      expect(script.toBuffer().toString('hex')).toBe(buf.toString('hex'));
    });

    test('should output this buffer containing OP_PUSHDATA4 and three bytes of data', () => {
      let buf = Buffer.from([0, 0, 0, 0, 0, 1, 2, 3]);
      buf[0] = Opcode.OP_PUSHDATA4;
      buf.writeUInt16LE(3, 1);
      let script = Script.fromBuffer(buf);
      expect(script.chunks.length).toBe(1);
      expect(script.chunks[0].buf?.toString('hex')).toBe('010203');
      expect(script.toBuffer().toString('hex')).toBe(buf.toString('hex'));
    });

    test('should output this buffer an OP code, data, and another OP code', () => {
      let buf = Buffer.from([0, 0, 0, 0, 0, 0, 1, 2, 3, 0]);
      buf[0] = Opcode.OP_0;
      buf[1] = Opcode.OP_PUSHDATA4;
      buf.writeUInt16LE(3, 2);
      buf[buf.length - 1] = Opcode.OP_0;
      let script = Script.fromBuffer(buf);
      expect(script.chunks.length).toBe(3);
      expect(script.chunks[0].opcodenum).toBe(buf[0]);
      expect(script.chunks[1].buf?.toString('hex')).toBe('010203');
      expect(script.chunks[2].opcodenum).toBe(buf[buf.length - 1]);
      expect(script.toBuffer().toString('hex')).toBe(buf.toString('hex'));
    });

  });

  describe('#fromASM', () => {
    test('should parse this known script in ASM', () => {
      let asm = 'OP_DUP OP_HASH160 f4c03610e60ad15100929cc23da2f3a799af1725 OP_EQUALVERIFY OP_CHECKSIG';
      let script = Script.fromASM(asm);
      expect(script.chunks[0].opcodenum).toBe(Opcode.OP_DUP);
      expect(script.chunks[1].opcodenum).toBe(Opcode.OP_HASH160);
      expect(script.chunks[2].opcodenum).toBe(20);
      expect(script.chunks[2].buf?.toString('hex')).toBe('f4c03610e60ad15100929cc23da2f3a799af1725');
      expect(script.chunks[3].opcodenum).toBe(Opcode.OP_EQUALVERIFY);
      expect(script.chunks[4].opcodenum).toBe(Opcode.OP_CHECKSIG);
    });

    test('should parse this known problematic script in ASM', () => {
      let asm = 'OP_RETURN 026d02 0568656c6c6f';
      let script = Script.fromASM(asm);
      expect(script.toASM()).toBe(asm);
    });

    test('should parse this long PUSHDATA1 script in ASM', () => {
      let buf = Buffer.alloc(220, 0);
      let asm = 'OP_RETURN ' + buf.toString('hex');
      let script = Script.fromASM(asm);
      expect(script.chunks[1].opcodenum).toBe(Opcode.OP_PUSHDATA1);
      expect(script.toASM()).toBe(asm);
    });

    test('should parse this long PUSHDATA2 script in ASM', () => {
      let buf = Buffer.alloc(1024, 0);
      let asm = 'OP_RETURN ' + buf.toString('hex');
      let script = Script.fromASM(asm);
      expect(script.chunks[1].opcodenum).toBe(Opcode.OP_PUSHDATA2)
      expect(script.toASM()).toBe(asm);
    });

    test('should parse this long PUSHDATA4 script in ASM', () => {
      let buf = Buffer.alloc(Math.pow(2, 17), 0);
      let asm = 'OP_RETURN ' + buf.toString('hex');
      let script = Script.fromASM(asm);
      expect(script.chunks[1].opcodenum).toBe(Opcode.OP_PUSHDATA4)
      expect(script.toASM()).toBe(asm);
    });
  });

  describe('#fromString', () => {

    test('should throw on invalid string', () => {
      expect(() => Script.fromString('300 ')).toThrow('Invalid script');
      expect(() => Script.fromString('OP_0 OP_PUSHDATA4 3 010203 OP_0')).toThrow('Pushdata data must start with 0x');
    });

    test('should parse these known scripts', () => {
      expect(Script.fromString('OP_0 OP_PUSHDATA4 3 0x010203 OP_0').toString()).toBe('OP_0 OP_PUSHDATA4 3 0x010203 OP_0');
      expect(Script.fromString('OP_0 OP_PUSHDATA2 3 0x010203 OP_0').toString()).toBe('OP_0 OP_PUSHDATA2 3 0x010203 OP_0');
      expect(Script.fromString('OP_0 OP_PUSHDATA1 3 0x010203 OP_0').toString()).toBe('OP_0 OP_PUSHDATA1 3 0x010203 OP_0');
      expect(Script.fromString('OP_0 3 0x010203 OP_0').toString()).toBe('OP_0 3 0x010203 OP_0');
      expect(Script.fromString(Script.fromString('OP_0 3 0x010203 OP_0').toHex()).toString()).toBe('OP_0 3 0x010203 OP_0');
    });

  });

  describe('#toString #toASM #inspect', () => {

    test('should work with an empty script', () => {
      let script = new Script();
      expect(script.toString()).toBe('');
    });

    test('should output this buffer an OP code, data, and another OP code', () => {
      let buf = Buffer.from([0, 0, 0, 0, 0, 0, 1, 2, 3, 0]);
      buf[0] = Opcode.OP_0;
      buf[1] = Opcode.OP_PUSHDATA4;
      buf.writeUInt16LE(3, 2);
      buf[buf.length - 1] = Opcode.OP_0;
      let script = Script.fromBuffer(buf);
      expect(script.chunks.length).toBe(3);
      expect(script.chunks[0].opcodenum).toBe(buf[0]);
      expect(script.chunks[1].buf?.toString('hex')).toBe('010203');
      expect(script.chunks[2].opcodenum).toBe(buf[buf.length - 1]);
      expect(script.toString()).toBe('OP_0 OP_PUSHDATA4 3 0x010203 OP_0');
      expect(script.inspect()).toBe("<Script: OP_0 OP_PUSHDATA4 3 0x010203 OP_0>");
    });

    test('should parse this script with number as ASM', () => {
      expect(Script.empty().add(Opcode.OP_1).add(220).toASM()).toBe('OP_1 dc');
    });

    test('should output this known script as ASM', () => {
      let script = Script.fromHex('76a914f4c03610e60ad15100929cc23da2f3a799af172588ac');
      expect(script.toASM()).toBe('OP_DUP OP_HASH160 f4c03610e60ad15100929cc23da2f3a799af1725 OP_EQUALVERIFY OP_CHECKSIG');
    });

    test('should output this known script with pushdata1 opcode as ASM', () => {
      let script = Script.fromHex('00483045022100beb1d83771c04faaeb40bded4f031ed0e0730aaab77cf70102ecd05734a1762002206f168fb00f3b9d7c04b8c78e1fc11e81b9caa49885a904bf22780a7e14a8373101483045022100a319839e37828bf164ff45de34a3fe22d542ebc8297c5d87dbc56fc3068ff9d5022077081a877b6e7f104d8a2fe0985bf2eb7de2e08edbac9499fc3710a353f65461014c69522103a70ae7bde64333461fb88aaafe12ad6c67ca17c8213642469ae191e0aabc7251210344a62338c8ddf138771516d38187146242db50853aa588bcb10a5e49c86421a52102b52a1aed304c4d6cedcf82911f90ca6e1ffed0a5b8f7f19c68213d6fcbde677e53ae');
      expect(script.toASM()).toBe('0 3045022100beb1d83771c04faaeb40bded4f031ed0e0730aaab77cf70102ecd05734a1762002206f168fb00f3b9d7c04b8c78e1fc11e81b9caa49885a904bf22780a7e14a8373101 3045022100a319839e37828bf164ff45de34a3fe22d542ebc8297c5d87dbc56fc3068ff9d5022077081a877b6e7f104d8a2fe0985bf2eb7de2e08edbac9499fc3710a353f6546101 522103a70ae7bde64333461fb88aaafe12ad6c67ca17c8213642469ae191e0aabc7251210344a62338c8ddf138771516d38187146242db50853aa588bcb10a5e49c86421a52102b52a1aed304c4d6cedcf82911f90ca6e1ffed0a5b8f7f19c68213d6fcbde677e53ae');
    });

    test('should output this known script with op_return opcode group data as ASM', () => {
      let script = Script.fromHex('6a043a564c05044e5553440a4e6174697665205553443268747470733a2f2f6e6174697665732e636173682f6170692f737461626c65732f6e7573642f676574546f6b656e496e666f20940106cb0d5a4ef94577ef444f765674008210e2e8f7679bdb4df8fe42cbe61456');
      expect(script.toASM()).toBe('OP_RETURN 3a564c05 4e555344 4e617469766520555344 68747470733a2f2f6e6174697665732e636173682f6170692f737461626c65732f6e7573642f676574546f6b656e496e666f 940106cb0d5a4ef94577ef444f765674008210e2e8f7679bdb4df8fe42cbe614 OP_6');
    });

    test('should OP_1NEGATE opcode as -1 with ASM', () => {
      let script = Script.fromString('OP_1NEGATE');
      expect(script.toASM()).toBe('-1');
    });

  });

  describe('toHex', () => {
    test('should return an hexa string "03010203" as expected from [3, 1, 2, 3]', () => {
      let buf =  Buffer.from([3, 1, 2, 3]);
      let script = Script.fromBuffer(buf);
      expect(script.toHex()).toBe('03010203');
    });
  });

  describe('#isDataOut', () => {

    test('should know this is a (blank) OP_RETURN script', () => {
      expect(new Script('OP_RETURN').isDataOut()).toBe(true);
    });

    test('validates that this two part OP_RETURN is standard', () => {
      expect(Script.fromASM('OP_RETURN 026d02 0568656c6c6f').isDataOut()).toBe(true);
    });

    test('validates that this 40-byte OP_RETURN is standard', () => {
      let buf =  Buffer.alloc(40);
      buf.fill(0);
      expect(new Script('OP_RETURN 40 0x' + buf.toString('hex')).isDataOut()).toBe(true);
    });

    test('validates that this 80-byte OP_RETURN is standard', () => {
      let buf =  Buffer.alloc(80);
      buf.fill(0);
      expect(new Script('OP_RETURN OP_PUSHDATA1 80 0x' + buf.toString('hex')).isDataOut()).toBe(true);
    });

    test('validates that this 220-byte OP_RETURN is standard', () => {
      let buf =  Buffer.alloc(220);
      buf.fill(0);
      expect(new Script('OP_RETURN OP_PUSHDATA1 220 0x' + buf.toString('hex')).isDataOut()).toBe(true);
    });

    test('validates that this 40-byte long OP_CHECKMULTISIG is not standard op_return', () => {
      let buf =  Buffer.alloc(40);
      buf.fill(0);
      expect(new Script('OP_CHECKMULTISIG 40 0x' + buf.toString('hex')).isDataOut()).toBe(false);
    });

    test('validates that this 221-byte OP_RETURN is not a valid standard OP_RETURN', () => {
      let buf =  Buffer.alloc(221);
      buf.fill(0);
      expect(new Script('OP_RETURN OP_PUSHDATA1 221 0x' + buf.toString('hex')).isDataOut()).toBe(false);
    });
  });

  describe('#isTokenDescriptionOut', () => {

    test('validates wrong length', () => {
      let s = new Script('OP_RETURN');
      expect(s.isTokenDescriptionOut()).toBe(false);

      s = ScriptFactory.buildTokenDescriptionLegacy("a", "b", "https://google.com/", "ab12ab1ab1ab2a3a3b21", 6);
      s.add(Buffer.from('hello'));
      expect(s.isTokenDescriptionOut()).toBe(false);
    });

    test('validates that this wrong identifier OP_RETURN is not token description', () => {
      expect(Script.fromASM('OP_RETURN 026d02 0568656c6c6f').isTokenDescriptionOut()).toBe(false);
    });

    test('validates that these correct OP_RETURN descriptions', () => {
      let s = ScriptFactory.buildTokenDescriptionLegacy("abc", "abc", "https://google.com/", "ab12ab1ab1ab2a3a3b21", 6);
      expect(s.isTokenDescriptionOut()).toBe(true);

      s = ScriptFactory.buildTokenDescription("abc", "abc", "https://google.com/", "ab12ab1ab1ab2a3a3b21", 6);
      expect(s.isTokenDescriptionOut()).toBe(true);

      s = ScriptFactory.buildNFTCollectionDescription("abc", "abc", "https://google.com/", "ab12ab1ab1ab2a3a3b21");
      expect(s.isTokenDescriptionOut()).toBe(true);

      s = ScriptFactory.buildNFTDescription("https://google.com/", "ab12ab1ab1ab2a3a3b21");
      expect(s.isTokenDescriptionOut()).toBe(true);
    });

    test('validates that is not token description op_return', () => {
      let buf =  Buffer.alloc(40);
      buf.fill(0);
      expect(new Script('OP_CHECKMULTISIG 40 0x' + buf.toString('hex')).isTokenDescriptionOut()).toBe(false);
    });

    test('validates that this OP_RETURN is not a valid token description pushes', () => {
      expect(new Script('OP_RETURN 026d0206 OP_NOP 1 0x01').isTokenDescriptionOut()).toBe(false);
    });
  });

  describe('#isPublicKeyHashIn', () => {

    test('should identify this known pubkeyhashin (uncompressed pubkey version)', () => {
      expect(new Script('73 0x3046022100bb3c194a30e460d81d34be0a230179c043a656f67e3c5c8bf47eceae7c4042ee0221008bf54ca11b2985285be0fd7a212873d243e6e73f5fad57e8eb14c4f39728b8c601 65 0x04e365859b3c78a8b7c202412b949ebca58e147dba297be29eee53cd3e1d300a6419bc780cc9aec0dc94ed194e91c8f6433f1b781ee00eac0ead2aae1e8e0712c6').isPublicKeyHashIn()).toBe(true);
    });

    test('should identify this known pubkeyhashin (hybrid pubkey version w/06)', () => {
      expect(new Script('73 0x3046022100bb3c194a30e460d81d34be0a230179c043a656f67e3c5c8bf47eceae7c4042ee0221008bf54ca11b2985285be0fd7a212873d243e6e73f5fad57e8eb14c4f39728b8c601 65 0x06e365859b3c78a8b7c202412b949ebca58e147dba297be29eee53cd3e1d300a6419bc780cc9aec0dc94ed194e91c8f6433f1b781ee00eac0ead2aae1e8e0712c6').isPublicKeyHashIn()).toBe(true);
    });

    test('should identify this known pubkeyhashin (hybrid pubkey version w/07)', () => {
      expect(new Script('73 0x3046022100bb3c194a30e460d81d34be0a230179c043a656f67e3c5c8bf47eceae7c4042ee0221008bf54ca11b2985285be0fd7a212873d243e6e73f5fad57e8eb14c4f39728b8c601 65 0x07e365859b3c78a8b7c202412b949ebca58e147dba297be29eee53cd3e1d300a6419bc780cc9aec0dc94ed194e91c8f6433f1b781ee00eac0ead2aae1e8e0712c6').isPublicKeyHashIn()).toBe(true);
    });

    test('should identify this known pubkeyhashin (compressed pubkey w/ 0x02)', () => {
      expect(new Script('73 0x3046022100bb3c194a30e460d81d34be0a230179c043a656f67e3c5c8bf47eceae7c4042ee0221008bf54ca11b2985285be0fd7a212873d243e6e73f5fad57e8eb14c4f39728b8c601 21 0x02aec6b86621e7fef63747fbfd6a6e7d54c8e1052044ef2dd2c5e46656ef1194d4').isPublicKeyHashIn()).toBe(true);
    });

    test('should identify this known pubkeyhashin (compressed pubkey w/ 0x03)', () => {
      expect(new Script('73 0x3046022100bb3c194a30e460d81d34be0a230179c043a656f67e3c5c8bf47eceae7c4042ee0221008bf54ca11b2985285be0fd7a212873d243e6e73f5fad57e8eb14c4f39728b8c601 21 0x03e724d93c4fda5f1236c525de7ffac6c5f1f72b0f5cdd1fc4b4f5642b6d055fcc').isPublicKeyHashIn()).toBe(true);
    });

    test('should identify this known non-pubkeyhashin (bad ops length)', () => {
      expect(new Script('73 0x3046022100bb3c194a30e460d81d34be0a230179c043a656f67e3c5c8bf47eceae7c4042ee0221008bf54ca11b2985285be0fd7a212873d243e6e73f5fad57e8eb14c4f39728b8c601 65 0x04e365859b3c78a8b7c202412b949ebca58e147dba297be29eee53cd3e1d300a6419bc780cc9aec0dc94ed194e91c8f6433f1b781ee00eac0ead2aae1e8e0712c6 OP_CHECKSIG').isPublicKeyHashIn()).toBe(false);
    });

    test('should identify this known pubkey', () => {
      expect(new Script('70 0x3043021f336721e4343f67c835cbfd465477db09073dc38a936f9c445d573c1c8a7fdf022064b0e3cb6892a9ecf870030e3066bc259e1f24841c9471d97f9be08b73f6530701 33 0x0370b2e1dcaa8f51cb0ead1221dd8cb31721502b3b5b7d4b374d263dfec63a4369').isPublicKeyHashIn()).toBe(true);
    });

    test('should identify this known non-pubkeyhashin (bad version)', () => {
      expect(new Script('70 0x3043021f336721e4343f67c835cbfd465477db09073dc38a936f9c445d573c1c8a7fdf022064b0e3cb6892a9ecf870030e3066bc259e1f24841c9471d97f9be08b73f6530701 33 0x1270b2e1dcaa8f51cb0ead1221dd8cb31721502b3b5b7d4b374d263dfec63a4369').isPublicKeyHashIn()).toBe(false);
    });

    test('should identify this known non-pubkeyhashin (no public key)', () => {
      expect(new Script('70 0x3043021f336721e4343f67c835cbfd465477db09073dc38a936f9c445d573c1c8a7fdf022064b0e3cb6892a9ecf870030e3066bc259e1f24841c9471d97f9be08b73f6530701 OP_CHECKSIG').isPublicKeyHashIn()).toBe(false);
    });

    test('should identify this known non-pubkeyhashin (no signature)', () => {
      expect(new Script('OP_DROP OP_CHECKSIG').isPublicKeyHashIn()).toBe(false);
    });

  });

  describe('#isPublicKeyHashOut', () => {

    test('should identify this known pubkeyhashout as pubkeyhashout', () => {
      expect(new Script('OP_DUP OP_HASH160 20 0x0000000000000000000000000000000000000000 OP_EQUALVERIFY OP_CHECKSIG').isPublicKeyHashOut()).toBe(true);
    });

    test('should identify this known non-pubkeyhashout as not pubkeyhashout 1', () => {
      expect(new Script('OP_DUP OP_HASH160 20 0x0000000000000000000000000000000000000000').isPublicKeyHashOut()).toBe(false);
    });

    test('should identify this known non-pubkeyhashout as not pubkeyhashout 2', () => {
      expect(new Script('OP_DUP OP_HASH160 2 0x0000 OP_EQUALVERIFY OP_CHECKSIG').isPublicKeyHashOut()).toBe(false);
    });

  });

  describe('#isPushOnly', () => {
    test('should know these scripts are or aren\'t push only', () => {
      expect(new Script('OP_NOP 1 0x01').isPushOnly()).toBe(false);
      expect(new Script('OP_0').isPushOnly()).toBe(true);
      expect(new Script('OP_0 OP_RETURN').isPushOnly()).toBe(false);
      expect(new Script('OP_PUSHDATA1 5 0x1010101010').isPushOnly()).toBe(true);
      expect(new Script('OP_PUSHDATA2 5 0x1010101010').isPushOnly()).toBe(true);
      expect(new Script('OP_PUSHDATA4 5 0x1010101010').isPushOnly()).toBe(true);
      // like bitcoind, we regard OP_RESERVED as being "push only"
      expect(new Script('OP_RESERVED').isPushOnly()).toBe(true);
    });
  });

  describe('#isPublicKeyTemplateIn', () => {

    test('should identify this known non-p2pkt-in (bad ops length)', () => {
      expect(new Script('73 0x3046022100bb3c194a30e460d81d34be0a230179c043a656f67e3c5c8bf47eceae7c4042ee0221008bf54ca11b2985285be0fd7a212873d243e6e73f5fad57e8eb14c4f39728b8c601 65 0x04e365859b3c78a8b7c202412b949ebca58e147dba297be29eee53cd3e1d300a6419bc780cc9aec0dc94ed194e91c8f6433f1b781ee00eac0ead2aae1e8e0712c6 OP_CHECKSIG').isPublicKeyTemplateIn()).toBe(false);
    });

    test('should identify this known pubkey (compressed pubkey w/ 0x02)', () => {
      expect(new Script('34 0x21025f7e53c749d77a065558bec3b208947ea93c449497b17ccfdd7a2c2f3e9687cd 64 0xb4d5f5847ce51730d46b3d266740842938b94009599d68d91f6144756e1632a10a52e2324d14f19b83e33728851f63388df9dc0520fd1774305be338aed6f8ce').isPublicKeyTemplateIn()).toBe(true);
    });

    test('should identify this known pubkey (compressed pubkey w/ 0x03)', () => {
      expect(new Script('34 0x2103e724d93c4fda5f1236c525de7ffac6c5f1f72b0f5cdd1fc4b4f5642b6d055fcc 64 0xb4d5f5847ce51730d46b3d266740842938b94009599d68d91f6144756e1632a10a52e2324d14f19b83e33728851f63388df9dc0520fd1774305be338aed6f8ce').isPublicKeyTemplateIn()).toBe(true);
    });

    test('should identify this known non-pubkeyhashin (bad version)', () => {
      expect(new Script('34 0x211270b2e1dcaa8f51cb0ead1221dd8cb31721502b3b5b7d4b374d263dfec63a4369 64 0xb4d5f5847ce51730d46b3d266740842938b94009599d68d91f6144756e1632a10a52e2324d14f19b83e33728851f63388df9dc0520fd1774305be338aed6f8ce').isPublicKeyTemplateIn()).toBe(false);
    });

    test('should identify this known non-pubkeyhashin (no public key)', () => {
      expect(new Script('34 0x0970b2e1dcaa8f51cb0e17ad1221dd8cb31721502b3b5b7d4b374d263dfec63a4369 64 0xb4d5f5847ce51730d46b3d266740842938b94009599d68d91f6144756e1632a10a52e2324d14f19b83e33728851f63388df9dc0520fd1774305be338aed6f8ce').isPublicKeyTemplateIn()).toBe(false);
    });

    test('should identify this known non-p2pkt-in (no signature)', () => {
      expect(new Script('OP_DROP OP_CHECKSIG').isPublicKeyTemplateIn()).toBe(false);
      expect(new Script('OP_DROP').isPublicKeyTemplateIn()).toBe(false);
    });

  });

  describe('#isPublicKeyTemplateOut', () => {
    test('should identify this known p2pkh as not p2pkt', () => {
      expect(new Script('OP_DUP OP_HASH160 20 0x0000000000000000000000000000000000000000 OP_EQUALVERIFY OP_CHECKSIG').isPublicKeyTemplateOut()).toBe(false);
    });

    test('should identify this non grouped p2pkt as p2pkt', () => {
      expect(new Script('OP_0 OP_1 20 0x4d938ba8e59f1e263c58e7802cacd6eb992e7f47').isPublicKeyTemplateOut()).toBe(true);
    });

    test('should identify this grouped p2pkt as p2pkt', () => {
      expect(new Script('32 0x64a231261d8088338ec38c3e05fc893de9b8fdc78a989cf291ae577e2f960000 2 0x3905 OP_1 20 0x6cfb32733d3cf135dc779f61c8330086cc9161ed').isPublicKeyTemplateOut()).toBe(true);
    });

    test('should identify this bad grouped p2pkt (missing constraint)', () => {
      expect(new Script('32 0x64a231261d8088338ec38c3e05fc893de9b8fdc78a989cf291ae577e2f960000 2 0x3905 OP_1').isPublicKeyTemplateOut()).toBe(false);
    });

    test('should identify this non output', () => {
      expect(new Script('OP_DUP OP_HASH160').isPublicKeyTemplateOut()).toBe(false);
    });
  });

  describe('#isScriptTemplateIn', () => {
    test('should identify this output script', () => {
      expect(new Script('OP_0 OP_1 20 0x4d938ba8e59f1e263c58e7802cacd6eb992e7f47').isScriptTemplateIn()).toBe(false);
    });

    test('should identify this bad size script', () => {
      expect(new Script('7 0x6c756cb1756cad').isScriptTemplateIn()).toBe(false);
    });

    test('should identify this non-push-only script', () => {
      expect(new Script('7 0x6c756cb1756cad OP_DUP').isScriptTemplateIn()).toBe(false);
    });

    test('should identify this known scriptSig (template+constraint)', () => {
      let script = new Script("OP_PUSHDATA1 155 0x6c6c6cc3529d00cd517f7c76010087636d00677f77517f7c76010087636d" +
        "00677f75816868789d00cd517f7c76010087636d00677f7501207f756852798851cd517f7c76010087636d00677f77517f7c7" +
        "6010087636d00677f7581686800c7517f7c76010087636d00677f77517f7c76010087636d00677f758168687b949d51cd517f" +
        "7c76010087636d00677f7501207f75688852cc51c67b949d 40 0x03a0860120a535ef8ceae8135121ad7bc70712e02d56d8c2a3964877f5cc5dbdf16f390000026606");
      expect(script.isScriptTemplateIn()).toBe(true);
    });

    test('should identify this known scriptSig (template+constraint+satisfier)', () => {
      let script = new Script("7 0x6c756cb1756cad 34 0x2103683e3eaff5e4d3ca22a8e2d15451c3af89cee43c6a0b89ae8fdbfa810b52bc98 64 0x6b91229ab013bf986f3c8a0cfe567c4e0e5f02547e85ec44a9a61caec6aa853ca34f9ba2271716f6098f94df8ccbf06db33473c006b3ff0ce716bf012c7f6af2");
      expect(script.isScriptTemplateIn()).toBe(true);
    });
  });

  describe('#isScriptTemplateOut', () => {
    test('should identify this known p2pkt as not p2st', () => {
      expect(new Script('OP_0 OP_1 20 0x4d938ba8e59f1e263c58e7802cacd6eb992e7f47').isScriptTemplateOut()).toBe(false);
    });

    test('should identify this non grouped p2st as p2st', () => {
      expect(new Script('OP_0 20 0x6cfb32733d3cf135dc779f61c8330086cc9161ed 20 0x4d938ba8e59f1e263c58e7802cacd6eb992e7f47').isScriptTemplateOut()).toBe(true);
      expect(new Script('OP_0 20 0x6cfb32733d3cf135dc779f61c8330086cc9161ed OP_FALSE').isScriptTemplateOut()).toBe(true);
    });

    test('should identify this bad p2st (not hash buffer size)', () => {
      expect(new Script('OP_0 19 0x6cfb32733d3cf135dc779f61c8330086cc9161 20 0x4d938ba8e59f1e263c58e7802cacd6eb992e7f47').isScriptTemplateOut()).toBe(false);
      expect(new Script('OP_0 19 0x6cfb32733d3cf135dc779f61c8330086cc9161 OP_FALSE').isScriptTemplateOut()).toBe(false);
      expect(new Script('OP_0 20 0x6cfb32733d3cf135dc779f61c8330086cc9161ed 19 0x4d938ba8e59f1e263c58e7802cacd6eb992e7f').isScriptTemplateOut()).toBe(false);
      expect(new Script('OP_0 20 0x6cfb32733d3cf135dc779f61c8330086cc9161ed OP_TRUE').isScriptTemplateOut()).toBe(false);
    });

    test('should identify this grouped p2st as p2st', () => {
      expect(new Script('32 0x64a231261d8088338ec38c3e05fc893de9b8fdc78a989cf291ae577e2f960000 2 0x3905 20 0x4d938ba8e59f1e263c58e7802cacd6eb992e7f47 20 0x6cfb32733d3cf135dc779f61c8330086cc9161ed').isScriptTemplateOut()).toBe(true);
      expect(new Script('32 0x64a231261d8088338ec38c3e05fc893de9b8fdc78a989cf291ae577e2f960000 2 0x3905 20 0x4d938ba8e59f1e263c58e7802cacd6eb992e7f47 OP_FALSE').isScriptTemplateOut()).toBe(true);
      expect(new Script('32 0x64a231261d8088338ec38c3e05fc893de9b8fdc78a989cf291ae577e2f960000 2 0x3905 20 0x4d938ba8e59f1e263c58e7802cacd6eb992e7f47 20 0x6cfb32733d3cf135dc779f61c8330086cc9161ed OP_4').isScriptTemplateOut()).toBe(true);
      expect(new Script('32 0x64a231261d8088338ec38c3e05fc893de9b8fdc78a989cf291ae577e2f960000 2 0x3905 20 0x4d938ba8e59f1e263c58e7802cacd6eb992e7f47 OP_FALSE OP_4').isScriptTemplateOut()).toBe(true);
    });

    test('should identify this bad grouped p2st (missing constraint)', () => {
      expect(new Script('32 0x64a231261d8088338ec38c3e05fc893de9b8fdc78a989cf291ae577e2f960000 2 0x3905 20 0x4d938ba8e59f1e263c58e7802cacd6eb992e7f47').isScriptTemplateOut()).toBe(false);
    });

    test('should identify this non output', () => {
      expect(new Script('OP_DUP OP_HASH160').isScriptTemplateOut()).toBe(false);
    });
  });

  describe('#add and #prepend', () => {

    test('should add these ops', () => {
      expect(new Script().add(1).add(10).add(186).add(0x81).toString()).toBe('0x01 0x0a OP_CHECKDATASIG OP_BIN2NUM');
      expect(new Script().add(1n).add(10n).add(186n).add(0x81n).toString()).toBe('OP_1 OP_10 2 0xba00 OP_1NEGATE');
      expect(new Script().add(1000).add(true).add(false).toString()).toBe('0x03e8 OP_1 OP_0');
      expect(new Script().add('OP_CHECKMULTISIG').toString()).toBe('OP_CHECKMULTISIG');
      expect(new Script().add('OP_1').add('OP_2').toString()).toBe('OP_1 OP_2');
      expect(new Script().add(new ScriptOpcode('OP_1')).add(new ScriptOpcode(Opcode.OP_2)).toString()).toBe('OP_1 OP_2');
      expect(new Script().add(Opcode.OP_CHECKMULTISIG).toString()).toBe('OP_CHECKMULTISIG');
      expect(Script.empty().add(Opcode.OP_CHECKMULTISIG).toString()).toBe('OP_CHECKMULTISIG');
    });

    test('should prepend these ops', () => {
      expect(new Script().prepend('OP_CHECKMULTISIG').toString()).toBe('OP_CHECKMULTISIG');
      expect(new Script().prepend('OP_1').prepend('OP_2').toString()).toBe('OP_2 OP_1');
    });

    test('should add and prepend correctly', () => {
      expect(new Script().add('OP_1').prepend('OP_2').add('OP_3').prepend('OP_4').toString()).toBe('OP_4 OP_2 OP_1 OP_3');
    });

    test('should add these push data', () => {
      let buf =  Buffer.alloc(1);
      buf.fill(0);
      expect(new Script().add(buf).toString()).toBe('1 0x00');
      buf =  Buffer.alloc(255);
      buf.fill(0);
      expect(new Script().add(buf).toString()).toBe('OP_PUSHDATA1 255 0x' + buf.toString('hex'));
      buf =  Buffer.alloc(256);
      buf.fill(0);
      expect(new Script().add(buf).toString()).toBe('OP_PUSHDATA2 256 0x' + buf.toString('hex'));
      buf =  Buffer.alloc(Math.pow(2, 16));
      buf.fill(0);
      expect(new Script().add(buf).toString()).toBe('OP_PUSHDATA4 ' + Math.pow(2, 16) + ' 0x' + buf.toString('hex'));
    });

    test('should add both pushdata and non-pushdata chunks', () => {
      expect(new Script().add('OP_CHECKMULTISIG').toString()).toBe('OP_CHECKMULTISIG');
      expect(new Script().add(Opcode.OP_CHECKMULTISIG).toString()).toBe('OP_CHECKMULTISIG');
      let buf =  Buffer.alloc(1);
      buf.fill(0);
      expect(new Script().add(buf).toString()).toBe('1 0x00');
    });

    test('should throw on too big push data', () => {
      let buf = Buffer.alloc(Math.pow(2, 32));
      expect(() => new Script().add(buf)).toThrow("You can't push that much data");
    });

    test('should work for no data OP_RETURN', () => {
      expect(new Script().add(Opcode.OP_RETURN).add( Buffer.alloc(0)).toString()).toBe('OP_RETURN');
    });
    test('works with objects', () => {
      expect(new Script().add({
        opcodenum: 106
      }).toString()).toBe('OP_RETURN');
    });
    test('works with another script', () => {
      let someScript = new Script('OP_2 21 0x038282263212c609d9ea2a6e3e172de238d8c39cabd5ac1ca10646e23fd5f51508 ' +
        '21 0x038282263212c609d9ea2a6e3e172de238d8c39cabd5ac1ca10646e23fd5f51508 OP_2 OP_CHECKMULTISIG');
      let s = new Script().add(someScript);
      expect(s.toString()).toBe(someScript.toString());
    });
    test('fails with wrong type', () => {
      expect(() => new Script().add([] as any)).toThrow('Invalid script chunk');
    });
  });

  describe('#findAndDelete', () => {
    test('should find and delete this buffer', () => {
      expect(new Script('OP_RETURN 2 0xf0f0')
        .findAndDelete(new Script('2 0xf0f0'))
        .toString()
        ).toBe('OP_RETURN');
    });
    test('should do nothing', () => {
      expect(new Script('OP_RETURN 2 0xf0f0')
        .findAndDelete(new Script('2 0xffff'))
        .toString()
        ).toBe('OP_RETURN 2 0xf0f0');
    });
  });


  describe('#checkMinimalPush', () => {

    test('should check these minimal pushes', () => {
      expect(new Script().add(1).checkMinimalPush(0)).toBe(true);
      expect(new Script().add(0).checkMinimalPush(0)).toBe(true);
      expect(new Script().add(-1).checkMinimalPush(0)).toBe(true);
      expect(new Script().add(1000).checkMinimalPush(0)).toBe(true);
      expect(new Script().add(0xffffffff).checkMinimalPush(0)).toBe(true);
      expect(new Script().add(0xffffffffffffffffn).checkMinimalPush(0)).toBe(true);
      expect(new Script().add(Buffer.from([0])).checkMinimalPush(0)).toBe(true);
      expect(new Script().add({ buf: Buffer.from([]), opcodenum: Opcode.OP_0 }).checkMinimalPush(0)).toBe(true);

      expect(new Script().add({ buf: Buffer.from([]), opcodenum: Opcode.OP_1 }).checkMinimalPush(0)).toBe(false);
      expect(new Script().add({ buf: Buffer.from([5]), opcodenum: Opcode.OP_1 }).checkMinimalPush(0)).toBe(false);
      expect(new Script().add({ buf: Buffer.from([0x81]), opcodenum: Opcode.OP_1 }).checkMinimalPush(0)).toBe(false);

      let buf =  Buffer.alloc(75);
      buf.fill(1);
      expect(new Script().add(buf).checkMinimalPush(0)).toBe(true);

      buf =  Buffer.alloc(76);
      buf.fill(1);
      expect(new Script().add(buf).checkMinimalPush(0)).toBe(true);

      buf =  Buffer.alloc(256);
      buf.fill(1);
      expect(new Script().add(buf).checkMinimalPush(0)).toBe(true);

      buf =  Buffer.alloc(65536);
      buf.fill(1);
      expect(new Script().add(buf).checkMinimalPush(0)).toBe(true);
    });

  });

  describe('#getPublicKey', () => {
    let publicKey = PublicKey.fromString('02371b6955629ea6fd014b9e14612e72de2729d33ff26ad20b9e7c558c6a611221');

    test('should return the public key for a public key hash input', () => {
      let signature = Signature.fromString('046fa2f97d628bcfd5476c3d4b0440341fd537ca5680d975a577d578d4c29d350631709e336719db5464db3d12c84c6c953891821edb757abf4f288781dddbb4');
      let publicKeyHashInput = ScriptFactory.buildPublicKeyHashIn(publicKey, signature);
      let retrievedPublicKey = publicKeyHashInput.getPublicKey();
      expect(retrievedPublicKey.toString('hex')).toBe(publicKey.toString());
    });

    test('should return the public key for a public key template input', () => {
      let signature = Signature.fromString('046fa2f97d628bcfd5476c3d4b0440341fd537ca5680d975a577d578d4c29d350631709e336719db5464db3d12c84c6c953891821edb757abf4f288781dddbb4');
      let publicKeyTemplateInput = ScriptFactory.buildScriptTemplateIn(Opcode.OP_1, Script.empty().add(publicKey.toBuffer()), Script.empty().add(signature.toBuffer()));
      let retrievedPublicKey = publicKeyTemplateInput.getPublicKey();
      expect(retrievedPublicKey.toString('hex')).toBe(publicKey.toString());
    });

    test('should throw on non pkt/pkh input script', () => {
      expect(() => Script.empty().add(10).getPublicKey()).toThrow("Can't retrieve PublicKey from a non-PKT or non-PKH input");
    })
  });

  describe('#getPublicKeyHash', () => {
    let publicKey = PublicKey.fromString('02371b6955629ea6fd014b9e14612e72de2729d33ff26ad20b9e7c558c6a611221');

    test('should return the public key hash for a public key hash output', () => {
      let publicKeyHashOutput = ScriptFactory.buildPublicKeyHashOut(publicKey);
      let retrievedPublicKeyHash = publicKeyHashOutput.getPublicKeyHash();
      expect(retrievedPublicKeyHash.toString('hex')).toBe(Hash.sha256ripemd160(publicKey.toBuffer()).toString('hex'));
    });

    test('should throw on non pkh output script', () => {
      let output = ScriptFactory.buildScriptTemplateOut(publicKey);
      expect(() => output.getPublicKeyHash()).toThrow("Can't retrieve PublicKeyHash from a non-PKH output");
    })
  });

  describe('#getConstraintHash', () => {
    let publicKey = PublicKey.fromString('02371b6955629ea6fd014b9e14612e72de2729d33ff26ad20b9e7c558c6a611221');

    test('should return the public key constraint for a public key template output', () => {
      let publicKeyTemplateOutput = ScriptFactory.buildScriptTemplateOut(publicKey);
      let retrievedConstraintHash = publicKeyTemplateOutput.getConstraintHash() as Buffer;
      expect(retrievedConstraintHash.toString('hex')).toBe(Hash.sha256ripemd160(Script.empty().add(publicKey.toBuffer()).toBuffer()).toString('hex'));
    });

    test('should return the public key constraint for a public key template with group data output', () => {
      let publicKeyTemplateOutput = ScriptFactory.buildScriptTemplateOut(publicKey, "nexa:tr9v70v4s9s6jfwz32ts60zqmmkp50lqv7t0ux620d50xa7dhyqqqcg6kdm6f", 1000n);
      let retrievedConstraintHash = publicKeyTemplateOutput.getConstraintHash() as Buffer;
      expect(retrievedConstraintHash.toString('hex')).toBe(Hash.sha256ripemd160(Script.empty().add(publicKey.toBuffer()).toBuffer()).toString('hex'));
    });

    test('should return the constraint for a script template output', () => {
      let scriptTemplateOutput = ScriptFactory.buildScriptTemplateOut("nexa:nqcqq9zxrtf9pqwtqyvaqdpctlc4fjxn444a6as5vgwx6eyj9lzaksl3y7ndm6wmvggg29suqvgwkz25ga52jne6");
      let retrievedConstraintHash = scriptTemplateOutput.getConstraintHash() as Buffer;
      expect(retrievedConstraintHash.toString('hex')).toBe(Hash.sha256ripemd160(Script.empty().add(publicKey.toBuffer()).toBuffer()).toString('hex'));
    });

    test('should return the constraint for a script template with group data output', () => {
      let scriptTemplateOutput = ScriptFactory.buildScriptTemplateOut("nexa:nqcqq9zxrtf9pqwtqyvaqdpctlc4fjxn444a6as5vgwx6eyj9lzaksl3y7ndm6wmvggg29suqvgwkz25ga52jne6", "nexa:tr9v70v4s9s6jfwz32ts60zqmmkp50lqv7t0ux620d50xa7dhyqqqcg6kdm6f", 1000n);
      let retrievedConstraintHash = scriptTemplateOutput.getConstraintHash() as Buffer;
      expect(retrievedConstraintHash.toString('hex')).toBe(Hash.sha256ripemd160(Script.empty().add(publicKey.toBuffer()).toBuffer()).toString('hex'));
    });

    test('should return op_false if no constraint for a script template output', () => {
      let scriptTemplateOutput = ScriptFactory.buildScriptTemplateOut("nexa:nqwqq9zxrtf9pqwtqyvaqdpctlc4fjxn444a6asqqvgwkz25z8yfenxr");
      let retrievedConstraintHash = scriptTemplateOutput.getConstraintHash() as Opcode;
      expect(retrievedConstraintHash).toBe(Opcode.OP_FALSE);
    });

    test('should return op_false if no constraint for a script template with group data output', () => {
      let scriptTemplateOutput = ScriptFactory.buildScriptTemplateOut("nexa:nqwqq9zxrtf9pqwtqyvaqdpctlc4fjxn444a6asqqvgwkz25z8yfenxr");
      let retrievedConstraintHash = scriptTemplateOutput.getConstraintHash() as Opcode;
      expect(retrievedConstraintHash).toBe(Opcode.OP_FALSE);
    });

    test('should throw on non pst output script', () => {
      let output = ScriptFactory.buildPublicKeyHashOut(publicKey);
      expect(() => output.getConstraintHash()).toThrow("Can't retrieve ConstraintHash from a non-PST output");
    });
  });

  describe('#getTemplateHash', () => {
    let templateHash = "461ad25081cb0119d034385ff154c8d3ad6bdd76";
    let publicKey = PublicKey.fromString('02371b6955629ea6fd014b9e14612e72de2729d33ff26ad20b9e7c558c6a611221');

    test('should return op_1 for a public key template output', () => {
      let publicKeyTemplateOutput = ScriptFactory.buildScriptTemplateOut(publicKey);
      let retrievedTemplateHash = publicKeyTemplateOutput.getTemplateHash() as Opcode;
      expect(retrievedTemplateHash).toBe(Opcode.OP_1);
    });

    test('should return op_1 for a public key template with group data output', () => {
      let publicKeyTemplateOutput = ScriptFactory.buildScriptTemplateOut(publicKey, "nexa:tr9v70v4s9s6jfwz32ts60zqmmkp50lqv7t0ux620d50xa7dhyqqqcg6kdm6f", 1000n);
      let retrievedTemplateHash = publicKeyTemplateOutput.getTemplateHash() as Opcode;
      expect(retrievedTemplateHash).toBe(Opcode.OP_1);
    });

    test('should return the template for a script template output', () => {
      let scriptTemplateOutput = ScriptFactory.buildScriptTemplateOut("nexa:nqcqq9zxrtf9pqwtqyvaqdpctlc4fjxn444a6as5vgwx6eyj9lzaksl3y7ndm6wmvggg29suqvgwkz25ga52jne6");
      let retrievedTemplateHash = scriptTemplateOutput.getTemplateHash() as Buffer;
      expect(retrievedTemplateHash.toString('hex')).toBe(templateHash);
    });

    test('should return the template for a script template with group data output', () => {
      let scriptTemplateOutput = ScriptFactory.buildScriptTemplateOut("nexa:nqcqq9zxrtf9pqwtqyvaqdpctlc4fjxn444a6as5vgwx6eyj9lzaksl3y7ndm6wmvggg29suqvgwkz25ga52jne6", "nexa:tr9v70v4s9s6jfwz32ts60zqmmkp50lqv7t0ux620d50xa7dhyqqqcg6kdm6f", 1000n);
      let retrievedTemplateHash = scriptTemplateOutput.getTemplateHash() as Buffer;
      expect(retrievedTemplateHash.toString('hex')).toBe(templateHash);
    });

    test('should return the template if no constraint for a script template output', () => {
      let scriptTemplateOutput = ScriptFactory.buildScriptTemplateOut("nexa:nqwqq9zxrtf9pqwtqyvaqdpctlc4fjxn444a6asqqvgwkz25z8yfenxr");
      let retrievedTemplateHash = scriptTemplateOutput.getTemplateHash() as Buffer;
      expect(retrievedTemplateHash.toString('hex')).toBe(templateHash);
    });

    test('should return the template if no constraint for a script template with group data output', () => {
      let scriptTemplateOutput = ScriptFactory.buildScriptTemplateOut("nexa:nqwqq9zxrtf9pqwtqyvaqdpctlc4fjxn444a6asqqvgwkz25z8yfenxr");
      let retrievedTemplateHash = scriptTemplateOutput.getTemplateHash() as Buffer;
      expect(retrievedTemplateHash.toString('hex')).toBe(templateHash);
    });

    test('should throw on non pst output script', () => {
      let output = ScriptFactory.buildPublicKeyHashOut(publicKey);
      expect(() => output.getTemplateHash()).toThrow("Can't retrieve TemplateHash from a non-PST output");
    });
  });

  describe('#getGroupIdType', () => {
    test('should throw on non token desc script', () => {
      let publicKey = PublicKey.fromString('02371b6955629ea6fd014b9e14612e72de2729d33ff26ad20b9e7c558c6a611221');
      let output = ScriptFactory.buildPublicKeyHashOut(publicKey);
      expect(() => output.getGroupIdType()).toThrow("Can't retrieve GroupIdType from a non Token Description output");
    });

    test('should return the group id type for known token description scripts', () => {
      let s = ScriptFactory.buildTokenDescriptionLegacy("abc", "abc", "https://google.com/", "ab12ab1ab1ab2a3a3b21", 6);
      expect(s.getGroupIdType()).toBe(GroupIdType.LEGACY);

      s = ScriptFactory.buildTokenDescription("abc", "abc", "https://google.com/", "ab12ab1ab1ab2a3a3b21", 6);
      expect(s.getGroupIdType()).toBe(GroupIdType.NRC1);

      s = ScriptFactory.buildNFTCollectionDescription("abc", "abc", "https://google.com/", "ab12ab1ab1ab2a3a3b21");
      expect(s.getGroupIdType()).toBe(GroupIdType.NRC2);

      s = ScriptFactory.buildNFTDescription("https://google.com/", "ab12ab1ab1ab2a3a3b21");
      expect(s.getGroupIdType()).toBe(GroupIdType.NRC3);
    });
  });

  describe('equals', () => {
    test('returns true for same script', () => {
      expect(new Script('OP_TRUE').equals(new Script('OP_TRUE'))).toBe(true);
    });
    test('returns false for different chunks sizes', () => {
      expect(new Script('OP_TRUE').equals(new Script('OP_TRUE OP_TRUE'))).toBe(false);
    });
    test('returns false for different opcodes', () => {
      expect(new Script('OP_TRUE OP_TRUE').equals(new Script('OP_TRUE OP_FALSE'))).toBe(false);
    });
    test('returns false for different data', () => {
      expect(new Script().add(Buffer.from('a')).equals(new Script('OP_TRUE'))).toBe(false);
    });
    test('returns false for different data', () => {
      expect(new Script().add(Buffer.from('a')).equals(new Script().add( Buffer.from('b')))).toBe(false);
    });
  });

  describe('#getSignatureOperationsCount', () => {
    // comes from bitcoind src/test/sigopcount_tests
    // only test calls to function with boolean param, not signature ref param
    test('should return zero for empty scripts', () => {
      expect(new Script().getSignatureOperationsCount(false)).toBe(0);
      expect(new Script().getSignatureOperationsCount(true)).toBe(0);
    });
    test('should handle multi-sig multisig scripts from string', () => {
      let s1 = 'OP_1 01 FF OP_2 OP_CHECKMULTISIG';
      expect(new Script(s1).getSignatureOperationsCount(true)).toBe(2);
      s1 += ' OP_IF OP_CHECKSIG OP_ENDIF';
      expect(new Script(s1).getSignatureOperationsCount(true)).toBe(3);
      expect(new Script(s1).getSignatureOperationsCount(false)).toBe(21);
    });

    test('should default the one and only argument to true', () => {
      let s1 = 'OP_1 01 FF OP_2 OP_CHECKMULTISIG';
      let trueCount = new Script(s1).getSignatureOperationsCount(true);
      let falseCount = new Script(s1).getSignatureOperationsCount(false);
      let defaultCount = new Script(s1).getSignatureOperationsCount();
      expect(trueCount).not.toBe(falseCount);
      expect(trueCount).toBe(defaultCount);
    });
  });
});
