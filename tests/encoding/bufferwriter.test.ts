import { describe, expect, test } from "vitest";
import BufferWriter from "../../src/encoding/bufferwriter";
import BufferReader from "../../src/encoding/bufferreader";
import BN from "../../src/crypto/bn.extension";

describe('BufferWriter', () => {

  test('should create a new buffer writer', () => {
    let bw = new BufferWriter();
    expect(bw).toBeDefined();
  });

  describe('#set', () => {
    test('set bufs', () => {
      let buf1 = Buffer.from([0]);
      let buf2 = Buffer.from([1]);
      let bw = new BufferWriter().set({bufs: [buf1, buf2]});
      expect(bw.concat().toString('hex')).toBe('0001');

      bw = new BufferWriter().set({});
      expect(bw.concat().toString('hex')).toBe('');
    });

    test('should retain existing this.bufs when obj.bufs is not provided', () => {
      const instance = new BufferWriter({ bufs: [Buffer.from('existing')] });
      const obj = {}; // No bufs in the object
      instance.set(obj);
  
      // Verify that this.bufs remains unchanged
      expect(instance.toBuffer()).toEqual(Buffer.concat([Buffer.from('existing')]));
    });
  });

  describe('#toBuffer', () => {
    test('should concat these two bufs', () => {
      let buf1 = Buffer.from([0]);
      let buf2 =  Buffer.from([1]);
      let bw = new BufferWriter({bufs: [buf1, buf2]});
      expect(bw.toBuffer().toString('hex')).toBe('0001');
    });
  });

  describe('#concat', () => {
    test('should concat these two bufs', () => {
      let buf1 =  Buffer.from([0]);
      let buf2 =  Buffer.from([1]);
      let bw = new BufferWriter({bufs: [buf1, buf2]});
      expect(bw.concat().toString('hex')).toBe('0001');
    });
  });

  describe('#write', () => {
    test('should write a buffer', () => {
      let buf =  Buffer.from([0]);
      let bw = new BufferWriter();
      bw.write(buf);
      expect(bw.concat().toString('hex')).toBe('00');
    });
  });

  describe('#writeUInt8', () => {
    test('should write 1', () => {
      let bw = new BufferWriter();
      expect(bw.writeUInt8(1).concat().toString('hex')).toBe('01');
    });
  });

  describe('#writeUInt16BE', () => {
    test('should write 1', () => {
      let bw = new BufferWriter();
      expect(bw.writeUInt16BE(1).concat().toString('hex')).toBe('0001');
    });
  });

  describe('#writeUInt16LE', () => {
    test('should write 1', () => {
      let bw = new BufferWriter();
      expect(bw.writeUInt16LE(1).concat().toString('hex')).toBe('0100');
    });
  });

  describe('#writeUInt32BE', () => {
    test('should write 1', () => {
      let bw = new BufferWriter();
      expect(bw.writeUInt32BE(1).concat().toString('hex')).toBe('00000001');
    });
  });

  describe('#writeInt32LE', () => {
    test('should write 1', () => {
      let bw = new BufferWriter();
      expect(bw.writeInt32LE(1).concat().toString('hex')).toBe('01000000');
    });
  });

  describe('#writeUInt32LE', () => {
    test('should write 1', () => {
      let bw = new BufferWriter();
      expect(bw.writeUInt32LE(1).concat().toString('hex')).toBe('01000000');
    });
  });

  describe('#writeUInt64BEBN', () => {
    test('should write 1', () => {
      let bw = new BufferWriter();
      expect(bw.writeUInt64BEBN(new BN(1)).concat().toString('hex')).toBe('0000000000000001');
    });
  });

  describe('#writeUInt64LEBN', () => {
    test('should write 1', () => {
      let bw = new BufferWriter();
      expect(bw.writeUInt64LEBN(new BN(1)).concat().toString('hex')).toBe('0100000000000000');
    });
  });

  describe('#writeCoreVarintNum', () => {
    test('should write 1', () => {
      let bw = new BufferWriter();
      expect(bw.writeCoreVarintNum(1).concat().toString('hex')).toBe('01');
    });

    test('should write 128', () => {
      let bw = new BufferWriter();
      expect(bw.writeCoreVarintNum(128).concat().toString('hex')).toBe('8000');
    });
  });

  describe('#writeVarint', () => {
    test('should write a 1 byte varint', () => {
      let bw = new BufferWriter();
      bw.writeVarintNum(1);
      expect(bw.concat().length).toBe(1);
    });

    test('should write a 3 byte varint', () => {
      let bw = new BufferWriter();
      bw.writeVarintNum(1000);
      expect(bw.concat().length).toBe(3);
    });

    test('should write a 5 byte varint', () => {
      let bw = new BufferWriter();
      bw.writeVarintNum(Math.pow(2, 16 + 1));
      expect(bw.concat().length).toBe(5);
    });

    test('should write a 9 byte varint', () => {
      let bw = new BufferWriter();
      bw.writeVarintNum(Math.pow(2, 32 + 1));
      expect(bw.concat().length).toBe(9);
    });

    test('should read back the same value it wrote for a 9 byte varint', () => {
      let bw = new BufferWriter();
      let n = Math.pow(2, 53);
      expect(n).toBe(n + 1); //javascript number precision limit
      bw.writeVarintNum(n);
      let br = new BufferReader({buf: bw.concat()});
      expect(br.readVarintBN().toNumber()).toBe(n);
    });
  });

  describe('#writeVarintBN', () => {
    test('should write a 1 byte varint', () => {
      let bw = new BufferWriter();
      bw.writeVarintBN(new BN(1));
      expect(bw.concat().length).toBe(1);
    });

    test('should write a 3 byte varint', () => {
      let bw = new BufferWriter();
      bw.writeVarintBN(new BN(1000));
      expect(bw.concat().length).toBe(3);
    });

    test('should write a 5 byte varint', () => {
      let bw = new BufferWriter();
      bw.writeVarintBN(new BN(Math.pow(2, 16 + 1)));
      expect(bw.concat().length).toBe(5);
    });

    test('should write a 9 byte varint', () => {
      let bw = new BufferWriter();
      bw.writeVarintBN(new BN(Math.pow(2, 32 + 1)));
      expect(bw.concat().length).toBe(9);
    });
  });

  describe('#writeVarLengthBuf', () => {
    test('should write a 1 byte varint', () => {
      let bw = new BufferWriter();
      bw.writeVarLengthBuf(new BN(1).toBuffer());
      expect(bw.concat().length).toBe(2);
    });

    test('should write a 3 byte varint', () => {
      let bw = new BufferWriter();
      bw.writeVarLengthBuf(new BN(1000).toBuffer());
      expect(bw.concat().length).toBe(3);
    });

    test('should write a 5 byte varint', () => {
      let bw = new BufferWriter();
      bw.writeVarLengthBuf(new BN(Math.pow(2, 16 + 1)).toBuffer());
      expect(bw.concat().length).toBe(4);
    });

    test('should write a 9 byte varint', () => {
      let bw = new BufferWriter();
      bw.writeVarLengthBuf(new BN(Math.pow(2, 32 + 1)).toBuffer());
      expect(bw.concat().length).toBe(6);
    });
  });
});