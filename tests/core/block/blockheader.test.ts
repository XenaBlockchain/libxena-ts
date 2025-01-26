import { beforeAll, describe, expect, test } from "vitest";
import BlockHeader from "../../../src/core/block/blockheader";
import { blockdata } from "../../data/blk554000";
import BufferReader from "../../../src/encoding/bufferreader";
import BufferWriter from "../../../src/encoding/bufferwriter";

describe('BlockHeader', () => {
  let prevHash: Buffer;
  let bits: number;
  let ancestorHash: Buffer;
  let merkleRoot: Buffer;
  let txFilter: Buffer;
  let time: number;
  let height: number;
  let chainWork: Buffer;
  let size: number;
  let txCount: number;
  let poolFee: number;
  let utxoCommitment: Buffer;
  let minerData: Buffer;
  let nonce: Buffer;

  let newbh: BlockHeader;
  let bhhex: string;
  let bhbuf: Buffer;

  beforeAll(() => {
    const getBuf = (hex: string): Buffer => {
      return Buffer.from(hex, 'hex');
    }

    prevHash =  getBuf(blockdata.prevHashHex);
    bits = blockdata.bits;
    ancestorHash = getBuf(blockdata.ancestorHashHex);
    merkleRoot = getBuf(blockdata.merkleRootHex);
    txFilter = getBuf(blockdata.txFilterHex);
    time = blockdata.time;
    height = blockdata.height;
    chainWork = getBuf(blockdata.chainWorkHex);
    size = blockdata.size;
    txCount = blockdata.txCount;
    poolFee = blockdata.poolFee;
    utxoCommitment = getBuf(blockdata.utxoCommitmentHex);
    minerData = getBuf(blockdata.minerDataHex);
    nonce = getBuf(blockdata.nonceHex);

    newbh = new BlockHeader({
      prevHash,
      bits,
      ancestorHash,
      merkleRoot,
      txFilter,
      time,
      height,
      chainWork,
      size,
      txCount,
      poolFee,
      utxoCommitment,
      minerData,
      nonce
    });

    bhhex = blockdata.blockheaderhex;
    bhbuf = Buffer.from(bhhex, 'hex');
  });

  test('should make a new blockheader', () => {
    expect(new BlockHeader(bhbuf).toBuffer().toString('hex')).toBe(bhhex);
  });

  test('should not make an empty block', () => {
    expect(() => new BlockHeader(undefined as any)).toThrow('data is required');
    expect(() => new BlockHeader(5 as any)).toThrow('Unrecognized argument for BlockHeader');
  });

  describe('#constructor', () => {

    test('should set all the variables', () => {
      let bh = new BlockHeader({
        prevHash,
        bits,
        ancestorHash,
        merkleRoot,
        txFilter,
        time,
        height,
        chainWork,
        size,
        txCount,
        poolFee,
        utxoCommitment,
        minerData,
        nonce
      });
      expect(bh.hash).toBeDefined();
      expect(bh.prevHash).toBeDefined();
      expect(bh.bits).toBeDefined();
      expect(bh.ancestorHash).toBeDefined();
      expect(bh.merkleRoot).toBeDefined();
      expect(bh.txFilter).toBeDefined();
      expect(bh.time).toBeDefined();
      expect(bh.height).toBeDefined();
      expect(bh.chainWork).toBeDefined();
      expect(bh.size).toBeDefined();
      expect(bh.txCount).toBeDefined();
      expect(bh.poolFee).toBeDefined();
      expect(bh.utxoCommitment).toBeDefined();
      expect(bh.minerData).toBeDefined();
      expect(bh.nonce).toBeDefined();

      expect(bh.hash).toBe(blockdata.hash);
      expect(bh.toString()).toBe(bhhex);
    });

    test("will throw an error if the argument object hash property doesn't match", () => {
      expect(() => new BlockHeader({
        hash: '000000000019d6689c085ae165831e934ff763ae46a2a6c172b3f1b60a8ce26f',
        prevHash,
        bits,
        ancestorHash,
        merkleRoot,
        txFilter,
        time,
        height,
        chainWork,
        size,
        txCount,
        poolFee,
        utxoCommitment,
        minerData,
        nonce
      })).toThrow('Argument object hash property does not match block hash.');
    });

  });

  describe('#fromObject', () => {

    test('should set all the variables', () => {
      let bh = BlockHeader.fromObject({
        prevHash: blockdata.prevHashHex,
        bits,
        ancestorHash: blockdata.ancestorHashHex,
        merkleRoot: blockdata.merkleRootHex,
        txFilter: blockdata.txFilterHex,
        time,
        height,
        chainWork: blockdata.chainWorkHex,
        size,
        txCount,
        poolFee,
        utxoCommitment: blockdata.utxoCommitmentHex,
        minerData: blockdata.minerDataHex,
        nonce: blockdata.nonceHex
      });
      expect(bh.hash).toBeDefined();
      expect(bh.prevHash).toBeDefined();
      expect(bh.bits).toBeDefined();
      expect(bh.ancestorHash).toBeDefined();
      expect(bh.merkleRoot).toBeDefined();
      expect(bh.txFilter).toBeDefined();
      expect(bh.time).toBeDefined();
      expect(bh.height).toBeDefined();
      expect(bh.chainWork).toBeDefined();
      expect(bh.size).toBeDefined();
      expect(bh.txCount).toBeDefined();
      expect(bh.poolFee).toBeDefined();
      expect(bh.utxoCommitment).toBeDefined();
      expect(bh.minerData).toBeDefined();
      expect(bh.nonce).toBeDefined();

      expect(bh.hash).toBe(blockdata.hash);
      expect(bh.toString()).toBe(bhhex);
    });

  });

  describe('#toJSON', () => {

    test('should set all the variables', () => {
      let json = newbh.toJSON();
      expect(json.hash).toBeDefined();
      expect(json.prevHash).toBeDefined();
      expect(json.bits).toBeDefined();
      expect(json.ancestorHash).toBeDefined();
      expect(json.merkleRoot).toBeDefined();
      expect(json.txFilter).toBeDefined();
      expect(json.time).toBeDefined();
      expect(json.height).toBeDefined();
      expect(json.chainWork).toBeDefined();
      expect(json.size).toBeDefined();
      expect(json.txCount).toBeDefined();
      expect(json.poolFee).toBeDefined();
      expect(json.utxoCommitment).toBeDefined();
      expect(json.minerData).toBeDefined();
      expect(json.nonce).toBeDefined();

      let bh = new BlockHeader(json);
      expect(bh.hash).toBe(blockdata.hash);
    });

  });

  describe('#fromJSON', () => {

    test('should parse this known json string', () => {

      let jsonString = JSON.stringify(newbh);

      let bh = new BlockHeader(JSON.parse(jsonString));
      expect(bh.hash).toBeDefined();
      expect(bh.prevHash).toBeDefined();
      expect(bh.bits).toBeDefined();
      expect(bh.ancestorHash).toBeDefined();
      expect(bh.merkleRoot).toBeDefined();
      expect(bh.txFilter).toBeDefined();
      expect(bh.time).toBeDefined();
      expect(bh.height).toBeDefined();
      expect(bh.chainWork).toBeDefined();
      expect(bh.size).toBeDefined();
      expect(bh.txCount).toBeDefined();
      expect(bh.poolFee).toBeDefined();
      expect(bh.utxoCommitment).toBeDefined();
      expect(bh.minerData).toBeDefined();
      expect(bh.nonce).toBeDefined();

      expect(bh.hash).toBe(blockdata.hash);
      expect(bh.toString()).toBe(bhhex);
    });

  });

  describe('#fromString/#toString', () => {

    test('should output/input a block hex string', () => {
      let b = BlockHeader.fromString(bhhex);
      expect(b.toString()).toBe(bhhex);
    });

  });

  describe('#fromBuffer/#toBuffer', () => {

    test('should parse this known buffer', () => {
      expect(BlockHeader.fromBuffer(bhbuf).toBuffer().toString('hex')).toBe(bhhex);
    });

  });

  describe('#fromBufferReader', () => {

    test('should parse this known buffer', () => {
      expect(BlockHeader.fromBufferReader(new BufferReader(bhbuf)).toBuffer().toString('hex')).toBe(bhhex);
    });

  });

  describe('#toBufferWriter', () => {

    test('should output this known buffer', () => {
      expect(BlockHeader.fromBuffer(bhbuf).toBufferWriter().concat().toString('hex')).toBe(bhhex);
    });

    test('doesn\'t create a bufferWriter if one provided', () => {
      let writer = new BufferWriter();
      let blockHeader = BlockHeader.fromBuffer(bhbuf);
      expect(blockHeader.toBufferWriter(writer)).toEqual(writer);
    });

  });

  describe('#inspect', () => {

    test('should return the correct inspect of the genesis block', () => {
      let block = BlockHeader.fromBuffer(bhbuf);
      expect(block.inspect()).toBe('<BlockHeader '+block.hash+'>');
    });

  });

  describe('#validTimestamp', () => {

    test('should validate timpstamp as true', () => {
      expect(newbh.validTimestamp()).toBe(true);
    });


    test('should validate timestamp as false', () => {
      let x = BlockHeader.fromObject(newbh.toObject());
      x.time = Math.round(new Date().getTime() / 1000) + BlockHeader.MAX_TIME_OFFSET + 100;

      expect(x.validTimestamp()).toBe(false);
    });

  });

  describe('#validProofOfWork', () => {

    test('should validate proof-of-work as true', () => {
      expect(newbh.validProofOfWork()).toBe(true);
    });

    test('should validate proof of work as false because incorrect proof of work', () => {
      let x = BlockHeader.fromObject(newbh.toObject());
      x.bits = 6666;
      expect(x.validProofOfWork()).toBe(false);
    });
  });

  describe('#getDifficulty', () => {
    test('should get the correct difficulty for block 554000', () => {
      let x = BlockHeader.fromObject(newbh.toObject());
      expect(x.bits).toBe(0x1a5daf40);
      expect(x.getDifficulty()).toBe(179079.2223739485);
    });

    test('should get the correct difficulty for block 3', () => {
      let x = BlockHeader.fromObject(newbh.toObject());
      x.bits = 0x1e010000
      expect(x.getDifficulty()).toBe(0.0039061903953552246);
    });
  });
});