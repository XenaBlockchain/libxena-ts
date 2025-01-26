import { isNil, isObject } from "lodash-es";
import type { IBlock } from "../../common/interfaces";
import ValidationUtils from "../../utils/validation.utils";
import Transaction from "../transaction/transaction";
import BlockHeader from "./blockheader";
import BufferUtils from "../../utils/buffer.utils";
import BufferReader from "../../encoding/bufferreader";
import BufferWriter from "../../encoding/bufferwriter";
import Hash from "../../crypto/hash";
import BN from "../../crypto/bn.extension";

export default class Block implements IBlock {

  public header: BlockHeader;
  public transactions: Transaction[];

  constructor(data: Buffer | IBlock) {
    ValidationUtils.validateArgument(!isNil(data), 'data is required');

    if (BufferUtils.isBuffer(data)) {
      data = Block._fromBufferReader(new BufferReader(data));
    } else if (!isObject(data)) {
      throw new TypeError('Unrecognized argument for Block');
    }

    this.header = data.header instanceof BlockHeader 
      ? data.header 
      : BlockHeader.fromObject(data.header);

    this.transactions = [];
    data.transactions.forEach(tx => {
      if (tx instanceof Transaction) {
        this.transactions.push(tx);
      } else {
        this.transactions.push(new Transaction().fromObject(tx));
      }
    });
  }

  public get hash(): string {
    return this.header.hash;
  }

  /**
   * @param obj A plain JavaScript object
   * @returns An instance of block
   */
  public static fromObject(obj: IBlock): Block {
    return new Block(obj);
  }

  /**
   * @param br A BufferReader of the block
   * @returns An object representing the block data
   */
  private static _fromBufferReader(br: BufferReader): IBlock {
    ValidationUtils.validateState(!br.finished(), 'No block data received');
    let header = BlockHeader.fromBufferReader(br);
    let txNum = br.readVarintNum();
    let transactions: Transaction[] = [];
    for (let i = 0; i < txNum; i++) {
      transactions.push(new Transaction().fromBufferReader(br));
    }
    return { header, transactions };
  }

  /**
   * @param br A buffer reader of the block
   * @returns An instance of block
   */
  public static fromBufferReader(br: BufferReader): Block {
    ValidationUtils.validateArgument(!isNil(br), 'br is required');
    let info = Block._fromBufferReader(br);
    return new Block(info);
  }

  /**
   * @param buf A buffer of the block
   * @returns An instance of block
   */
  public static fromBuffer(buf: Buffer): Block {
    return Block.fromBufferReader(new BufferReader(buf));
  }

  /**
   * @param str A hex encoded string of the block
   * @returns A hex encoded string of the block
   */
  public static fromString(str: string): Block {
    let buf = Buffer.from(str, 'hex');
    return Block.fromBuffer(buf);
  }

  public toJSON = this.toObject;

  /**
   * @returns A plain object with the block properties
   */
  public toObject(): IBlock {
    return {
      header: this.header.toObject(),
      transactions: this.transactions.map(tx => tx.toObject())
    };
  }

  /**
   * @param bw An existing instance of BufferWriter (optional)
   * @returns An instance of BufferWriter representation of the Block
   */
  public toBufferWriter(bw?: BufferWriter): BufferWriter {
    if (!bw) {
      bw = new BufferWriter();
    }
    bw.write(this.header.toBuffer());
    bw.writeVarintNum(this.transactions.length);
    for (let tx of this.transactions) {
      tx.toBufferWriter(bw);
    }
    return bw;
  }

  /**
   * @returns A buffer of the block
   */
  public toBuffer(): Buffer {
    return this.toBufferWriter().toBuffer();
  }

  /**
   * @returns A hex encoded string of the block
   */
  public toString(): string {
    return this.toBuffer().toString('hex');
  }

  /**
   * @returns A string formatted for the console
   */
  public inspect(): string {
    return `<Block ${this.hash}>`;
  }

  /**
   * Will iterate through each transaction and return an array of hashes
   * @returns An array with transaction hashes
   */
  public getTransactionHashes(): Buffer[] {
    return this.transactions.map(tx => Buffer.from(tx.id, 'hex').reverse());
  }

  /**
   * Will build a merkle tree of all the transactions, ultimately arriving at
   * a single point, the merkle root.
   * 
   * @see {@link https://spec.nexa.org/blocks/merkle-tree/}
   * @returns An array with each level of the tree after the other.
   */
  public getMerkleTree(): Buffer[] {
    let tree = this.getTransactionHashes();

    let j = 0;
    for (let size = this.transactions.length; size > 1; size = Math.floor((size + 1) / 2)) {
      for (let i = 0; i < size; i += 2) {
        let i2 = Math.min(i + 1, size - 1);
        let buf = Buffer.concat([tree[j + i], tree[j + i2]]);
        tree.push(Hash.sha256sha256(buf));
      }
      j += size;
    }

    return tree;
  }

  /**
   * Calculates the merkleRoot from the transactions.
   * 
   * @returns A buffer of the merkle root hash
   */
  public getMerkleRoot(): Buffer {
    let tree = this.getMerkleTree();
    return tree[tree.length - 1];
  }

  /**
   * Verifies that the transactions in the block match the header merkle root
   * 
   * @returns true If the merkle roots match
   */
  public validMerkleRoot(): boolean {
    let h = BN.fromString(BufferUtils.reverse(this.header.merkleRoot).toString('hex'), 'hex');
    let c = BN.fromString(this.getMerkleRoot().toString('hex'), 'hex');

    return h.eq(c);
  }
}