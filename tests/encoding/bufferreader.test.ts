import { describe, expect, test } from "vitest";
import BufferWriter from "../../src/encoding/bufferwriter";
import BufferReader from "../../src/encoding/bufferreader";
import BN from "../../src/crypto/bn.extension";

describe('BufferReader', () => {
  test('should make a new BufferReader', () => {
    let br = new BufferReader();
    expect(br).toBeDefined();
  });

  test('should create a new bufferreader with a buffer', () => {
    let buf =  Buffer.alloc(0);
    let br = new BufferReader(buf);
    expect(br).toBeDefined();
    expect(Buffer.isBuffer(br.buf)).true;
  });

  test('should create a new bufferreader with a string', () => {
    let buf =  Buffer.alloc(0);
    let br = new BufferReader(buf.toString('hex'));
    expect(br).toBeDefined();
    expect(Buffer.isBuffer(br.buf)).true;
  });

  test('should fail for invalid object', () => {
    expect(() => new BufferReader(5 as any)).toThrow('Unrecognized argument for BufferReader');
  });

  test('should fail for invalid hex', () => {
    expect(() => new BufferReader('hexa')).toThrow('Invalid hex string');
  });

  describe('#set', () => {
    test('should set pos', () => {
      expect(new BufferReader().set({ pos: 1 }).pos).toBe(1);
    });
  });

  describe('#eof', () => {
    test('should return true for a blank br', () => {
      let br = new BufferReader(Buffer.alloc(0));
      expect(br.finished()).true;
      expect(br.eof()).true;
    });
  });

  describe('read', () => {
    test('should return the same buffer', () => {
      let buf =  Buffer.alloc(0);
      let br = new BufferReader(buf);
      expect(br.readAll().toString('hex')).toBe(buf.toString('hex'));
    });

    test('should return a buffer of this length', () => {
      let buf =  Buffer.alloc(10);
      buf.fill(0);
      let br = new BufferReader(buf);
      let buf2 = br.read(2);
      expect(buf2.length).toBe(2);
      expect(br.finished()).false;
      expect(br.pos).toBe(2);
    });

    test('should work with 0 length', () => {
      let buf =  Buffer.alloc(10);
      buf.fill(1);
      let br = new BufferReader(buf);
      let buf2 = br.read(0);
      expect(buf2.length).toBe(0);
      expect(br.finished()).false;
      expect(buf2.toString('hex')).empty;
    });
  });

  describe('readVarLengthBuffer', () => {
    test('returns correct buffer', () => {
      let buf =  Buffer.from('73010000003766404f00000000b305434f00000000f203' +
        '0000f1030000001027000048ee00000064000000004653656520626974636f696' +
        'e2e6f72672f666562323020696620796f7520686176652074726f75626c652063' +
        '6f6e6e656374696e6720616674657220323020466562727561727900473045022' +
        '1008389df45f0703f39ec8c1cc42c13810ffcae14995bb648340219e353b63b53' +
        'eb022009ec65e1c1aaeec1fd334c6b684bde2b3f573060d5b70c3a46723326e4e' +
        '8a4f1', 'hex');

      let br = new BufferReader(buf);
      let b1 = br.readVarLengthBuffer();
      expect(b1.toString('hex')).toBe('010000003766404f00000000b305434f000' +
        '00000f2030000f1030000001027000048ee000000640000000046536565206269' +
        '74636f696e2e6f72672f666562323020696620796f7520686176652074726f756' +
        '26c6520636f6e6e656374696e6720616674657220323020466562727561727900');

      let b2 = br.readVarLengthBuffer();
      expect(b2.toString('hex')).toBe('30450221008389df45f0703f39ec8c1cc42' +
        'c13810ffcae14995bb648340219e353b63b53eb022009ec65e1c1aaeec1fd334c' +
        '6b684bde2b3f573060d5b70c3a46723326e4e8a4f1');
    });

    test('fails on length too big', () => {
      let buf = Buffer.from('0a00', 'hex');
      let br = new BufferReader(buf);
      expect(() => br.readVarLengthBuffer()).toThrow('Invalid length while reading varlength buffer');
    });
  });

  describe('#readUInt8', () => {
    test('should return 1', () => {
      let buf = Buffer.alloc(1);
      buf.writeUInt8(1, 0);
      let br = new BufferReader(buf);
      expect(br.readUInt8()).toBe(1);
    });
  });

  describe('#readUInt16BE', () => {
    test('should return 1', () => {
      let buf =  Buffer.alloc(2);
      buf.writeUInt16BE(1, 0);
      let br = new BufferReader(buf);
      expect(br.readUInt16BE()).toBe(1);
    });
  });

  describe('#readUInt16LE', () => {
    test('should return 1', () => {
      let buf = Buffer.alloc(2);
      buf.writeUInt16LE(1, 0);
      let br = new BufferReader(buf);
      expect(br.readUInt16LE()).toBe(1);
    });
  });

  describe('#readUInt32BE', () => {
    test('should return 1', () => {
      let buf = Buffer.alloc(4);
      buf.writeUInt32BE(1, 0);
      let br = new BufferReader(buf);
      expect(br.readUInt32BE()).toBe(1);
    });
  });

  describe('#readUInt32LE', () => {
    test('should return 1', () => {
      let buf = Buffer.alloc(4);
      buf.writeUInt32LE(1, 0);
      let br = new BufferReader(buf);
      expect(br.readUInt32LE()).toBe(1);
    });
  });

  describe('#readInt32LE', () => {
    test('should return 1', () => {
      let buf = Buffer.alloc(4);
      buf.writeInt32LE(1, 0);
      let br = new BufferReader(buf);
      expect(br.readInt32LE()).toBe(1);
    });
  });

  describe('#readUInt64BEBN', () => {
    test('should return 1', () => {
      let buf = Buffer.alloc(8);
      buf.fill(0);
      buf.writeUInt32BE(1, 4);
      let br = new BufferReader(buf);
      expect(br.readUInt64BEBN().toNumber()).toBe(1);
    });

    test('should return 2^64', () => {
      let buf = Buffer.alloc(8);
      buf.fill(0xff);
      let br = new BufferReader(buf);
      expect(br.readUInt64BEBN().toNumber()).toBe(Math.pow(2, 64));
    });
  });

  describe('#readUInt64LEBN', () => {
    test('should return 1', () => {
      let buf = Buffer.alloc(8);
      buf.fill(0);
      buf.writeUInt32LE(1, 0);
      let br = new BufferReader(buf);
      expect(br.readUInt64LEBN().toNumber()).toBe(1);
    });

    test('should return 10BTC', () => {
      let tenbtc = 10 * 1e8;
      let tenbtcBuffer = Buffer.from('00ca9a3b00000000', 'hex');
      let br = new BufferReader(tenbtcBuffer);
      expect(br.readUInt64LEBN().toNumber()).toBe(tenbtc);
    });

    test('should return 2^30', () => {
      let buf = Buffer.alloc(8);
      buf.fill(0);
      buf.writeUInt32LE(Math.pow(2, 30), 0);
      let br = new BufferReader(buf);
      expect(br.readUInt64LEBN().toNumber()).toBe(Math.pow(2, 30));
    });

    test('should return 2^32 + 1', () => {
      let num = Math.pow(2, 32) + 1;
      let numBuffer =  Buffer.from('0100000001000000', 'hex');
      let br = new BufferReader(numBuffer);
      expect(br.readUInt64LEBN().toNumber()).toBe(num);
    });

    test('should return max number of satoshis', () => {
      let maxSatoshis = 21000000 * 1e8;
      let maxSatoshisBuffer = Buffer.from('0040075af0750700', 'hex');
      let br = new BufferReader(maxSatoshisBuffer);
      expect(br.readUInt64LEBN().toNumber()).toBe(maxSatoshis);
    });

    test('should return 2^53 - 1', () => {
      let maxSafe = Math.pow(2, 53) - 1;
      let maxSafeBuffer = Buffer.from('ffffffffffff1f00', 'hex');
      let br = new BufferReader(maxSafeBuffer);
      expect(br.readUInt64LEBN().toNumber()).toBe(maxSafe);
    });

    test('should return 2^53', () => {
      let bn = new BN('20000000000000', 16);
      let bnBuffer =  Buffer.from('0000000000002000', 'hex');
      let br = new BufferReader(bnBuffer);
      let readbn = br.readUInt64LEBN();
      expect(readbn.cmp(bn)).toBe(0);
    });

    test('should return 0', () => {
      let buf = Buffer.alloc(8);
      buf.fill(0);
      let br = new BufferReader(buf);
      expect(br.readUInt64LEBN().toNumber()).toBe(0);
    });

    test('should return 2^64', () => {
      let buf = Buffer.alloc(8);
      buf.fill(0xff);
      let br = new BufferReader(buf);
      expect(br.readUInt64LEBN().toNumber()).toBe(Math.pow(2, 64));
    });
  });

  describe('#readVarintBuf', () => {
    test('should read a 1 byte varint', () => {
      let buf = Buffer.from([50]);
      let br = new BufferReader(buf);
      expect(br.readVarintBuf().length).toBe(1);
    });

    test('should read a 3 byte varint', () => {
      let buf = Buffer.from([253, 253, 0]);
      let br = new BufferReader(buf);
      expect(br.readVarintBuf().length).toBe(3);
    });

    test('should read a 5 byte varint', () => {
      let buf = Buffer.from([254, 0, 0, 0, 0]);
      buf.writeUInt32LE(50000, 1);
      let br = new BufferReader(buf);
      expect(br.readVarintBuf().length).toBe(5);
    });

    test('should read a 9 byte varint', () => {
      let buf = new BufferWriter().writeVarintBN(new BN(Math.pow(2, 54).toString())).concat();
      let br = new BufferReader(buf);
      expect(br.readVarintBuf().length).toBe(9);
    });
  });

  describe('#readVarintNum', () => {
    test('should read a 1 byte varint', () => {
      let buf = Buffer.from([50]);
      let br = new BufferReader(buf);
      expect(br.readVarintNum()).toBe(50);
    });

    test('should read a 3 byte varint', () => {
      let buf = Buffer.from([253, 253, 0]);
      let br = new BufferReader(buf);
      expect(br.readVarintNum()).toBe(253);
    });

    test('should read a 5 byte varint', () => {
      let buf = Buffer.from([254, 0, 0, 0, 0]);
      buf.writeUInt32LE(50000, 1);
      let br = new BufferReader(buf);
      expect(br.readVarintNum()).toBe(50000);
    });

    test('should throw an error on a 9 byte varint over the javascript uint precision limit', () => {
      let buf = new BufferWriter().writeVarintBN(new BN(Math.pow(2, 54).toString())).concat();
      let br = new BufferReader(buf);
      expect(() => br.readVarintNum()).toThrow('number too large to retain precision - use readVarintBN');
    });

    test('should not throw an error on a 9 byte varint not over the javascript uint precision limit', () => {
      let buf = new BufferWriter().writeVarintBN(new BN(Math.pow(2, 53).toString())).concat();
      let br = new BufferReader(buf);
      expect(() => br.readVarintNum()).not.toThrow('number too large to retain precision - use readVarintBN');
    });
  });

  describe('#readVarintBN', () => {
    test('should read a 1 byte varint', () => {
      let buf = Buffer.from([50]);
      let br = new BufferReader(buf);
      expect(br.readVarintBN().toNumber()).toBe(50);
    });

    test('should read a 3 byte varint', () => {
      let buf = Buffer.from([253, 253, 0]);
      let br = new BufferReader(buf);
      expect(br.readVarintBN().toNumber()).toBe(253);
    });

    test('should read a 5 byte varint', () => {
      let buf = Buffer.from([254, 0, 0, 0, 0]);
      buf.writeUInt32LE(50000, 1);
      let br = new BufferReader(buf);
      expect(br.readVarintBN().toNumber()).toBe(50000);
    });

    test('should read a 9 byte varint', () => {
      let buf = Buffer.concat([Buffer.from([255]), Buffer.from('ffffffffffffffff', 'hex')]);
      let br = new BufferReader(buf);
      expect(br.readVarintBN().toNumber()).toBe(Math.pow(2, 64));
    });

  });

  describe('#reverse', () => {
    test('should reverse this [0, 1]', () => {
      let buf = Buffer.from([0, 1]);
      let br = new BufferReader(buf);
      expect(br.reverse().readAll().toString('hex')).toBe('0100');
    });
  });

  describe('#readReverse', () => {
    test('should reverse this [0, 1]', () => {
      let buf = Buffer.from([0, 1]);
      let br = new BufferReader(buf);
      expect(br.readReverse().toString('hex')).toBe('0100');
    });

    test('should read part of the readder and reverse this [0, 1, 2, 3] and read', () => {
      let buf = Buffer.from([0, 1, 2, 3]);
      let br = new BufferReader(buf);
      expect(br.readReverse(2).toString('hex')).toBe('0100');
    });
  });

  describe('#readCoreVarintNum', () => {
    test('should correctly read a single-byte value (no MSB set)', () => {
      let br = new BufferReader(Buffer.from([0x7F]));      
      expect(br.readCoreVarintNum()).toBe(127);
    });

    test('should correctly read a multi-byte value', () => {
      let br = new BufferReader(Buffer.from([0x81, 0x01]));      
      expect(br.readCoreVarintNum()).toBe(257);
    });

    test('should correctly read a larger multi-byte value', () => {
      let br = new BufferReader(Buffer.from([0x83, 0x82, 0x01]));      
      expect(br.readCoreVarintNum()).toBe(65921 );
    });
  });
});