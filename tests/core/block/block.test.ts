import { beforeAll, describe, expect, test } from "vitest";
import BlockHeader from "../../../src/core/block/blockheader";
import { Transaction } from "../../../src";
import { blockdata } from "../../data/blk554000";
import { block1, genesis } from "../../data/blk0and1";
import Block from "../../../src/core/block/block";
import BufferReader from "../../../src/encoding/bufferreader";
import BufferWriter from "../../../src/encoding/bufferwriter";

describe('Block', () => {
  let blockhex: string;
  let blockbuf: Buffer;
  let bh: BlockHeader;
  let genesishex: string;
  let genesisbuf: Buffer;
  let genesisidhex: string;
  let blockOneHex: string;
  let blockOneBuf: Buffer;
  let blockOneId: string;

  beforeAll(() => {
    blockhex = blockdata.blockhex;
    blockbuf = Buffer.from(blockhex, 'hex');
    bh = BlockHeader.fromBuffer(Buffer.from(blockdata.blockheaderhex, 'hex'));

    genesishex = genesis.hex;
    genesisbuf =  Buffer.from(genesishex, 'hex');
    genesisidhex = genesis.hashHex;
    blockOneHex = block1.hex;
    blockOneBuf = Buffer.from(blockOneHex, 'hex');
    blockOneId = block1.hashHex;
  });

  test('should make a new block', () => {
    let b = new Block(blockbuf);
    expect(b.toBuffer().toString('hex')).toBe(blockhex);
  });

  test('should not make an empty block', () => {
    expect(() => new Block(undefined as any)).toThrow('data is required');
    expect(() => new Block(5 as any)).toThrow('Unrecognized argument for Block');
  });

  describe('#constructor', () => {

    test('should set these known values', () => {
      let b = new Block({
        header: bh,
        transactions: []
      });
      expect(b.header).toBeDefined();
      expect(b.transactions).toBeDefined();
    });

    test('should properly deserialize blocks', () => {
      let b = Block.fromBuffer(Buffer.from(block1.hex, 'hex'));
      expect(b.transactions.length).toBe(block1.txCount);
      expect(b.transactions[0].isCoinbase()).toBe(true);
      expect(b.transactions[0].outputs.length).toBe(2);

      b = new Block(Buffer.from(blockdata.blockhex, 'hex'));
      expect(b.header.toString()).toEqual(blockdata.blockheaderhex);
      expect(b.transactions.length).toBe(blockdata.txCount);
    });

  });

  describe('#fromJSON', () => {

    test('should set these known values', () => {
      let json = JSON.stringify(Block.fromBuffer(blockbuf));
      let b = Block.fromObject(JSON.parse(json));
      expect(b.header).toBeDefined();
      expect(b.transactions).toBeDefined();
    });

    test('should set these known values', () => {
      let json = JSON.stringify(Block.fromBuffer(blockbuf));
      let b = new Block(JSON.parse(json));
      expect(b.header).toBeDefined();
      expect(b.transactions).toBeDefined();
    });

  });

  describe('#toJSON', () => {

    test('should recover these known values', () => {
      let b = Block.fromBuffer(blockbuf).toJSON();
      expect(b.header).toBeDefined();
      expect(b.transactions).toBeDefined();
      expect(b.transactions.length).toBe(blockdata.txCount);
    });

  });

  describe('#fromString/#toString', () => {

    test('should output/input a block hex string', () => {
      let b = Block.fromString(blockhex);
      expect(b.toString()).toBe(blockhex);
    });

  });

  describe('#fromBuffer', () => {

    test('should make a block from this known buffer', () => {
      let block = Block.fromBuffer(blockbuf);
      expect(block.toBuffer().toString('hex')).toBe(blockhex);
    });

    test('should instantiate from genesis block buffer', () => {
      let x = Block.fromBuffer(genesisbuf);
      expect(x.toBuffer().toString('hex')).toBe(genesishex);
    });

  });

  describe('#fromBufferReader', () => {

    test('should make a block from this known buffer', () => {
      let block = Block.fromBufferReader(new BufferReader(blockbuf));
      expect(block.toBuffer().toString('hex')).toBe(blockhex);
    });

  });

  describe('#toBuffer', () => {

    test('should recover a block from this known buffer', () => {
      let block = Block.fromBuffer(blockbuf);
      expect(block.toBuffer().toString('hex')).toBe(blockhex);
    });

  });

  describe('#toBufferWriter', () => {

    test('should recover a block from this known buffer', () => {
      let block = Block.fromBuffer(blockbuf);
      expect(block.toBufferWriter().concat().toString('hex')).toBe(blockhex);
    });

    test('doesn\'t create a bufferWriter if one provided', () => {
      let writer = new BufferWriter();
      let block = Block.fromBuffer(blockbuf);
      expect(block.toBufferWriter(writer)).toEqual(writer);
    });

  });

  describe('#toObject', () => {

    test('should recover a block from mainnet', () => {
      let block = Block.fromBuffer(blockbuf);
      expect(block.hash).toBe(blockdata.hash);
      expect(Block.fromObject(block.toObject()).toString()).toBe(blockhex)
    });

    test('roundtrips correctly', () => {
      let block = Block.fromBuffer(blockOneBuf);
      let obj = block.toObject();
      let block2 = Block.fromObject(obj);
      expect(block2.toObject()).toEqual(block.toObject());
      expect(block2.hash).toEqual(blockOneId);
    });

  });

  describe('#hash', () => {

    test('should return the correct hash of the genesis block', () => {
      let block = Block.fromBuffer(genesisbuf);
      expect(block.hash).toBe(genesis.hashHex);
    });
  });

  describe('#inspect', () => {

    test('should return the correct inspect of the genesis block', () => {
      let block = Block.fromBuffer(genesisbuf);
      expect(block.inspect()).toBe('<Block ' + genesisidhex + '>');
    });

  });

  describe('#merkleRoot', () => {

    test('should describe as valid merkle root', () => {
      let x = Block.fromBuffer(blockbuf);
      expect(x.validMerkleRoot()).toBe(true);
    });

    test('should describe as invalid merkle root', () => {
      let x = Block.fromBuffer(blockbuf);
      x.transactions.push(new Transaction());
      expect(x.validMerkleRoot()).toBe(false);
    });
  });

});