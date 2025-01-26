import { isNil, isObject, isString } from "lodash-es";
import type { IBlockHeader } from "../../common/interfaces";
import BN from "../../crypto/bn.extension";
import BufferReader from "../../encoding/bufferreader";
import BufferUtils from "../../utils/buffer.utils";
import ValidationUtils from "../../utils/validation.utils";
import BufferWriter from "../../encoding/bufferwriter";
import Hash from "../../crypto/hash";

export default class BlockHeader implements IBlockHeader {

  public static readonly MAX_TIME_OFFSET = 2 * 60 * 60;

  public prevHash: Buffer;
  public bits: number;
  public ancestorHash: Buffer;
  public merkleRoot: Buffer;
  public txFilter: Buffer;
  public time: number;
  public height: number;
  public chainWork: Buffer;
  public size: number;
  public txCount: number;
  public poolFee: number;
  public utxoCommitment: Buffer;
  public minerData: Buffer;
  public nonce: Buffer;

  constructor(data: Buffer | IBlockHeader) {
    ValidationUtils.validateArgument(!isNil(data), 'data is required');

    if (BufferUtils.isBuffer(data)) {
      data = BlockHeader._fromBufferReader(new BufferReader(data));
    } else if (!isObject(data)) {
      throw new TypeError('Unrecognized argument for BlockHeader');
    }
  
    this.prevHash = isString(data.prevHash) ? Buffer.from(data.prevHash, 'hex') : data.prevHash;
    this.bits = data.bits;
    this.ancestorHash = isString(data.ancestorHash) ? Buffer.from(data.ancestorHash, 'hex') : data.ancestorHash;
    this.merkleRoot = isString(data.merkleRoot) ? Buffer.from(data.merkleRoot, 'hex') : data.merkleRoot;
    this.txFilter = isString(data.txFilter) ? Buffer.from(data.txFilter, 'hex') : data.txFilter;
    this.time = data.time;
    this.height = data.height;
    this.chainWork = isString(data.chainWork) ? Buffer.from(data.chainWork, 'hex') : data.chainWork;
    this.size = data.size;
    this.txCount = data.txCount;
    this.poolFee = data.poolFee;
    this.utxoCommitment = isString(data.utxoCommitment) ? Buffer.from(data.utxoCommitment, 'hex') : data.utxoCommitment;
    this.minerData = isString(data.minerData) ? Buffer.from(data.minerData, 'hex') : data.minerData;
    this.nonce = isString(data.nonce) ? Buffer.from(data.nonce, 'hex') : data.nonce;

    if (data.hash) {
      ValidationUtils.validateState(this.hash === data.hash,
        'Argument object hash property does not match block hash.'
      );
    }
  }

  public get hash(): string {
    return this._getHash().reverse().toString('hex');
  }

  /**
   * @returns The little endian hash buffer of the header
   */
  private _getHash(): Buffer {
    let miniHeader = new BufferWriter();
    miniHeader.writeReverse(this.prevHash);
    miniHeader.writeInt32LE(this.bits);

    let miniHash = Hash.sha256(miniHeader.toBuffer())

    let extHeader = new BufferWriter();
    extHeader.writeReverse(this.ancestorHash);
    extHeader.writeReverse(this.txFilter);
    extHeader.writeReverse(this.merkleRoot);
    extHeader.writeInt32LE(this.time);
    extHeader.writeUInt64LEBN(BN.fromNumber(this.height));
    extHeader.writeReverse(this.chainWork);
    extHeader.writeUInt64LEBN(BN.fromNumber(this.size));
    extHeader.writeUInt64LEBN(BN.fromNumber(this.txCount));
    extHeader.writeUInt64LEBN(BN.fromNumber(this.poolFee));
    extHeader.writeVarLengthBuf(this.utxoCommitment);
    extHeader.writeVarLengthBuf(this.minerData);
    extHeader.writeVarLengthBuf(this.nonce);

    let extHash = Hash.sha256(extHeader.toBuffer());

    let commintment = new BufferWriter();
    commintment.write(miniHash);
    commintment.write(extHash);

    return Hash.sha256(commintment.toBuffer());
  }

  /**
   * @param br A BufferReader of the block header
   * @returns An object representing block header data
   */
  private static _fromBufferReader(br: BufferReader): IBlockHeader {
    return {
      prevHash: br.readReverse(32),
      bits: br.readUInt32LE(),
      ancestorHash: br.readReverse(32),
      merkleRoot: br.readReverse(32),
      txFilter: br.readReverse(32),
      time: br.readUInt32LE(),
      height: br.readCoreVarintNum(),
      chainWork: br.readReverse(32),
      size: br.readUInt64LEBN().toNumber(),
      txCount: br.readCoreVarintNum(),
      poolFee: br.readCoreVarintNum(),
      utxoCommitment: br.readVarLengthBuffer(),
      minerData: br.readVarLengthBuffer(),
      nonce: br.readVarLengthBuffer(),
    };
  }

  /**
   * This method is useful for hex that represent concatination of multiple headers
   * so it able to serve in a loop.
   * 
   * @param br A BufferReader of the block header
   * @returns An instance of block header
   */
  public static fromBufferReader(br: BufferReader): BlockHeader {
    let info = this._fromBufferReader(br);
    return new BlockHeader(info);
  }

  /**
   * @param header A plain JavaScript block header object
   * @returns An instance of block header
   */
  public static fromObject(header: IBlockHeader): BlockHeader {
    return new BlockHeader(header);
  }

  /**
   * @param buf A buffer of the block header
   * @returns An instance of block header
   */
  public static fromBuffer(buf: Buffer): BlockHeader {
    return this.fromBufferReader(new BufferReader(buf));
  }

  /**
   * @param hex A hex encoded buffer of the block header
   * @returns An instance of block header
   */
  public static fromString(hex: string): BlockHeader {
    let buf = Buffer.from(hex, 'hex');
    return this.fromBuffer(buf);
  }

  public toJSON = this.toObject;

  /**
   * @returns A plain object of the BlockHeader
   */
  public toObject(): IBlockHeader {
    return {
      hash: this.hash,
      prevHash: this.prevHash.toString('hex'),
      bits: this.bits,
      ancestorHash: this.ancestorHash.toString('hex'),
      merkleRoot: this.merkleRoot.toString('hex'),
      txFilter: this.txFilter.toString('hex'),
      time: this.time,
      height: this.height,
      chainWork: this.chainWork.toString('hex'),
      size: this.size,
      txCount: this.txCount,
      poolFee: this.poolFee,
      utxoCommitment: this.utxoCommitment.toString('hex'),
      minerData: this.minerData.toString('hex'),
      nonce: this.nonce.toString('hex'),
    };
  }

  /**
   * @param bw - An existing instance BufferWriter
   * @returns An instance of BufferWriter representation of the BlockHeader
   */
  public toBufferWriter(bw?: BufferWriter): BufferWriter {
    if (!bw) {
      bw = new BufferWriter();
    }
    bw.writeReverse(this.prevHash);
    bw.writeInt32LE(this.bits);
    bw.writeReverse(this.ancestorHash);
    bw.writeReverse(this.merkleRoot);
    bw.writeReverse(this.txFilter);
    bw.writeInt32LE(this.time);
    bw.writeCoreVarintNum(this.height);
    bw.writeReverse(this.chainWork);
    bw.writeUInt64LEBN(BN.fromNumber(this.size));
    bw.writeCoreVarintNum(this.txCount);
    bw.writeCoreVarintNum(this.poolFee);
    bw.writeVarLengthBuf(this.utxoCommitment);
    bw.writeVarLengthBuf(this.minerData);
    bw.writeVarLengthBuf(this.nonce);
    return bw;
  }

  /**
   * @returns A Buffer of the BlockHeader
   */
  public toBuffer(): Buffer {
    return this.toBufferWriter().toBuffer();
  }

  /**
   * @returns A hex encoded string of the BlockHeader
   */
  public toString(): string {
    return this.toBuffer().toString('hex');
  }

  /**
   * @returns A string formatted for the console
   */
  public inspect(): string {
    return `<BlockHeader ${this.hash}>`;
  }

  /**
   * Returns the target difficulty for this block
   * 
   * @param bits the bits number
   * @returns An instance of BN with the decoded difficulty bits
   */
  public getTargetDifficulty(bits?: number): BN {
    let bitsBuf = BN.fromNumber(bits || this.bits).toBuffer({ size: 4, endian: 'little' });

    let exponent = BN.fromBuffer(Buffer.from([bitsBuf[0]]));
    let significand = BN.fromBuffer(bitsBuf.subarray(1));

    let target = significand.toBigInt() * (2n ** (8n * (exponent.toBigInt() - 3n)));
    
    return new BN(target.toString());
  }

  /**
   * @returns the target difficulty for this block
   */
  public getDifficulty(): number {
    let nShift = (this.bits >> 24) & 0xff;

    let dDiff = 0x0000ffff / (this.bits & 0x00ffffff);

    while (nShift < 29)
    {
        dDiff *= 256.0;
        nShift++;
    }
    while (nShift > 29)
    {
        dDiff /= 256.0;
        nShift--;
    }

    return dDiff;
  }

  /**
   * @returns true If timestamp is not too far in the future
   */
  public validTimestamp(): boolean {
    let currentTime = Math.round(new Date().getTime() / 1000);
    return this.time <= currentTime + BlockHeader.MAX_TIME_OFFSET
  }

  /**
   * @returns true If the proof-of-work hash satisfies the target difficulty
   */
  public validProofOfWork(): boolean {
    let pow = BN.fromString(this.hash, 'hex');
    let target = this.getTargetDifficulty();

    return pow.lte(target)
  }
}