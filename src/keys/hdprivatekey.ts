import { isNumber, isObject, isString } from "lodash-es";
import HDKeyUtils from "./hdkey.utils";
import { InvalidB58Checksum, InvalidDerivationArgument, InvalidEntropyArgument, InvalidPath, NotEnoughEntropy, TooMuchEntropy } from "./exceptions";
import BufferUtils from "../utils/buffer.utils";
import ValidationUtils from "../utils/validation.utils";
import type { HDPrivateKeyBuffers, HDPrivateKeyDto, HDPrivateKeyMinimalDto, IHDPrivateKey } from "../common/interfaces";
import type { Networkish } from "../common/types";
import Hash from "../crypto/hash";
import PrivateKey from "./privatekey";
import type PublicKey from "./publickey";
import BN from "../crypto/bn.extension";
import Point from "../crypto/point";
import type { Network } from "../core/network/network";
import { networks } from "../core/network/network-manager";
import Base58Check from "../encoding/base58check";
import CommonUtils from "../utils/common.utils";
import HDPublicKey from "./hdpublickey";

export default class HDPrivateKey implements IHDPrivateKey {

  private static readonly MINIMUM_ENTROPY_BITS = 128;
  private static readonly BITS_TO_BYTES = 1 / 8;
  private static readonly MAXIMUM_ENTROPY_BITS = 512;

  private static readonly PrivateKeySize = 32;
  private static readonly PrivateKeyStart = HDKeyUtils.ChainCodeEnd + 1;
  private static readonly PrivateKeyEnd = this.PrivateKeyStart + this.PrivateKeySize;
  private static readonly ChecksumStart = this.PrivateKeyEnd;
  private static readonly ChecksumEnd = this.ChecksumStart + HDKeyUtils.CheckSumSize;

  private _hdPublicKey?: HDPublicKey;

  readonly privateKey!: PrivateKey;
  readonly publicKey!: PublicKey;
  readonly network!: Network;
  readonly depth!: number;
  readonly parentFingerPrint!: Buffer;
  readonly fingerPrint!: Buffer;
  readonly chainCode!: Buffer;
  readonly childIndex!: number;
  readonly checksum!: Buffer;
  readonly xprivkey!: string;

  /**
   * Represents an instance of an hierarchically derived private key.
   *
   * More info on https://github.com/bitcoin/bips/blob/master/bip-0032.mediawiki
   */
  constructor(arg?: string | Buffer | IHDPrivateKey | HDPrivateKeyDto | HDPrivateKeyMinimalDto | Networkish) {
    if (arg instanceof HDPrivateKey) {
      return arg;
    }

    let params = HDPrivateKey._classifyArgument(arg);

    this.privateKey = params.privateKey as PrivateKey;
    this.publicKey = (params.publicKey ?? params.privateKey.toPublicKey()) as PublicKey;
    this.network = params.network;
    this.depth = params.depth;
    this.parentFingerPrint = params.parentFingerPrint;
    this.fingerPrint = params.fingerPrint;
    this.chainCode = params.chainCode;
    this.childIndex = params.childIndex;
    this.xprivkey = params.xprivkey;
    this.checksum = params.checksum;
  }

  private static _classifyArgument(arg?: string | Buffer | IHDPrivateKey | HDPrivateKeyDto | HDPrivateKeyMinimalDto | Networkish): IHDPrivateKey {
    if (!arg) {
      return this._generateRandomly();
    }
    if (networks.get(arg as Networkish)) {
      return this._generateRandomly(arg as Networkish);
    }

    if (isString(arg) || BufferUtils.isBuffer(arg)) {
      let xprivkey = arg.toString();
      if (HDKeyUtils.isValidSerialized(xprivkey, undefined, true)) {
        return this._buildFromSerialized(xprivkey);
      }
      if (CommonUtils.isValidJSON(arg as string)) {
        return this._buildFromObject(JSON.parse(arg as string));
      }
      throw HDKeyUtils.getSerializedError(arg, undefined, true);
    }

    if (this._isIHDPrivKey(arg)) {
      return arg;
    }
    if (this._isMinimalDtoObject(arg)) {
      return this._buildFromMinimalObject(arg);
    }
    if (this._isDtoObject(arg)) {
      return this._buildFromObject(arg);
    }
  
    throw new TypeError('Invalid argument type for creation, must be string, json, buffer, or object');
  }

  public get hdPublicKey(): HDPublicKey {
    return this.getHDPublicKey();
  }

  public get xpubkey(): string {
    return this.getHDPublicKey().xpubkey;
  }

  private static _isDtoObject(data: unknown): data is HDPrivateKeyDto {
    return isObject(data) && 'xprivkey' in data && 'privateKey' in data && isString(data.privateKey);
  }

  private static _isMinimalDtoObject(data: unknown): data is HDPrivateKeyMinimalDto {
    return isObject(data) && !('xprivkey' in data) && 'privateKey' in data && isString(data.privateKey);
  }

  private static _isIHDPrivKey(data: unknown): data is IHDPrivateKey {
    return isObject(data) && 'xprivkey' in data && 'privateKey' in data && data.privateKey instanceof PrivateKey;
  }

  /**
   * Verifies that a given path is valid.
   *
   * @param arg
   * @param hardened
   */
  public static isValidPath(arg: string | number, hardened?: boolean): boolean {
    if (isString(arg)) {
      let indexes = HDKeyUtils.getDerivationIndexes(arg);
      return indexes !== null && indexes.every(i => this.isValidPath(i));
    }

    if (isNumber(arg)) {
      if (arg < HDKeyUtils.Hardened && hardened === true) {
        arg += HDKeyUtils.Hardened;
      }
      return arg >= 0 && arg < HDKeyUtils.MaxIndex;
    }

    return false;
  }

  public static fromString(xprivkey: string): HDPrivateKey {
    ValidationUtils.validateArgument(isString(xprivkey), 'No valid string was provided');
    return new HDPrivateKey(xprivkey);
  }

  /**
   * Returns the string representation of this private key (ext privkey).
   */
  public toString(): string {
    return this.xprivkey;
  }

  /**
   * Build a HDPrivateKey from a buffer
   *
   * @param {Buffer} buf
   */
  public static fromBuffer(buf: Buffer): HDPrivateKey {
    ValidationUtils.validateArgument(BufferUtils.isBuffer(buf), 'No valid Buffer was provided');
    return new HDPrivateKey(buf);
  }

  /**
   * Returns a buffer representation of the HDPrivateKey
   */
  public toBuffer(): Buffer {
    return Buffer.from(this.xprivkey);
  }

  public toJSON = this.toObject;

  /**
   * Returns a plain object with a representation of this private key.
   */
  public toObject(): HDPrivateKeyDto {
    return {
      network: this.network.name,
      depth: this.depth,
      fingerPrint: BufferUtils.integerFromBuffer(this.fingerPrint),
      parentFingerPrint: BufferUtils.integerFromBuffer(this.parentFingerPrint),
      childIndex: this.childIndex,
      chainCode: this.chainCode.toString('hex'),
      privateKey: this.privateKey.toString(),
      checksum: BufferUtils.integerFromBuffer(this.checksum),
      xprivkey: this.xprivkey,
    };
  }

  public static fromObject(arg: HDPrivateKeyDto): HDPrivateKey {
    ValidationUtils.validateArgument(isObject(arg), 'No valid argument was provided');
    return new HDPrivateKey(arg);
  }

  public static fromMinimalObject(arg: HDPrivateKeyMinimalDto): HDPrivateKey {
    ValidationUtils.validateArgument(isObject(arg), 'No valid argument was provided');
    let params = this._buildFromMinimalObject(arg);
    return new HDPrivateKey(params);
  }

  /**
   * Generate a private key from a seed, as described in BIP32
   *
   * @param seed
   * @param network
   * @return HDPrivateKey
   */
  public static fromSeed(seed: string | Buffer, network: Networkish = networks.defaultNetwork): HDPrivateKey {
    let params = this._buildFromSeed(seed, network);
    return new HDPrivateKey(params);
  }
  
  /**
   * Get a derived child based on a string or number.
   *
   * If the first argument is a string, it's parsed as the full path of
   * derivation. Valid values for this argument include "m" (which returns the
   * same private key), "m/0/1/40/2'/1000", where the ' quote means a hardened
   * derivation.
   *
   * If the first argument is a number, the child with that index will be
   * derived. If the second argument is truthy, the hardened version will be
   * derived. See the example usage for clarification.
   *
   * @example
   * ```javascript
   * let parent = new HDPrivateKey('xprv...');
   * let child_0_1_2h = parent.deriveChild(0).deriveChild(1).deriveChild(2, true);
   * let copy_of_child_0_1_2h = parent.deriveChild("m/0/1/2'");
   * assert(child_0_1_2h.xprivkey === copy_of_child_0_1_2h.xprivkey);
   * ```
   *
   * @param arg
   * @param hardened
   * @return HDPrivateKey
   */
  public deriveChild(arg: string | number, hardened?: boolean): HDPrivateKey {
    if (isNumber(arg)) {
      return this._deriveWithNumber(arg, hardened);
    }
    if (isString(arg)) {
      return this._deriveFromString(arg);
    }
    throw new InvalidDerivationArgument(arg);
  }

  private _deriveWithNumber(index: number, hardened?: boolean): HDPrivateKey {
    if (!HDPrivateKey.isValidPath(index, hardened)) {
      throw new InvalidPath(index);
    }
  
    hardened = index >= HDKeyUtils.Hardened ? true : hardened;
    if (index < HDKeyUtils.Hardened && hardened === true) {
      index += HDKeyUtils.Hardened;
    }
  
    let indexBuffer = BufferUtils.integerAsBuffer(index);
    let data;
    if (hardened) {
      // This will use a 32 byte zero padded serialization of the private key
      let privateKeyBuffer = this.privateKey.toBuffer();
      ValidationUtils.validateState(privateKeyBuffer.length === 32, 'length of private key buffer is expected to be 32 bytes');
      data = Buffer.concat([Buffer.from([0]), privateKeyBuffer, indexBuffer]);
    } else {
      data = Buffer.concat([this.publicKey.toBuffer(), indexBuffer]);
    }
    let hash = Hash.sha512hmac(data, this.chainCode);
    let leftPart = BN.fromBuffer(hash.subarray(0, 32), { size: 32 });
    let chainCode = hash.subarray(32, 64);
  
    let privateKey = leftPart.add(this.privateKey.toBigNumber()).umod(Point.getN()).toBuffer({ size: 32 });
  
    if (!PrivateKey.isValid(privateKey)) {
      // Index at this point is already hardened, we can pass null as the hardened arg
      return this._deriveWithNumber(index + 1);
    }

    let buffers: HDPrivateKeyBuffers = {
      version: BufferUtils.integerAsBuffer(this.network.xprivkey),
      depth: BufferUtils.integerAsSingleByteBuffer(this.depth + 1),
      parentFingerPrint: this.fingerPrint,
      childIndex: BufferUtils.integerAsBuffer(index),
      privateKey: privateKey,
      chainCode: chainCode,
    };
    let derived = HDPrivateKey._buildFromBuffers(buffers);
  
    return new HDPrivateKey(derived);
  }
  
  private _deriveFromString(path: string): HDPrivateKey {
    if (!HDPrivateKey.isValidPath(path)) {
      throw new InvalidPath(path);
    }

    const deriveKeys = (baseKey: HDPrivateKey, indexes: number[]): HDPrivateKey => {
      return indexes.reduce((prev, idx) => prev._deriveWithNumber(idx), baseKey);
    }
  
    let indexes = HDKeyUtils.getDerivationIndexes(path);
    return deriveKeys(this, indexes!);
  }

  private static _buildFromSeed(seed: string | Buffer, network: Networkish = networks.defaultNetwork): IHDPrivateKey {
    if (CommonUtils.isHexa(seed as string)) {
      seed = Buffer.from(seed as string, 'hex');
    }
    if (!Buffer.isBuffer(seed)) {
      throw new InvalidEntropyArgument(seed);
    }
    if (seed.length < this.MINIMUM_ENTROPY_BITS * this.BITS_TO_BYTES) {
      throw new NotEnoughEntropy(seed);
    }
    if (seed.length > this.MAXIMUM_ENTROPY_BITS * this.BITS_TO_BYTES) {
      throw new TooMuchEntropy(seed);
    }
    let hash = Hash.sha512hmac(seed, Buffer.from('Bitcoin seed'));

    let buffers: HDPrivateKeyBuffers = {
      version: BufferUtils.integerAsBuffer((networks.get(network) || networks.defaultNetwork).xprivkey),
      depth: BufferUtils.integerAsSingleByteBuffer(0),
      parentFingerPrint: BufferUtils.integerAsBuffer(0),
      childIndex: BufferUtils.integerAsBuffer(0),
      privateKey: hash.subarray(0, 32),
      chainCode: hash.subarray(32, 64),
    };

    return this._buildFromBuffers(buffers);
  }

  private static _buildFromObject(arg: HDPrivateKeyDto): IHDPrivateKey {
    return {
      network: networks.get(arg.network)!,
      depth: arg.depth,
      fingerPrint: BufferUtils.integerAsBuffer(arg.fingerPrint),
      parentFingerPrint: BufferUtils.integerAsBuffer(arg.parentFingerPrint),
      childIndex: arg.childIndex,
      chainCode: Buffer.from(arg.chainCode, 'hex'),
      xprivkey: arg.xprivkey,
      checksum: BufferUtils.integerAsBuffer(arg.checksum),
      privateKey: PrivateKey.fromString(arg.privateKey, arg.network)
    }
  }

  private static _buildFromMinimalObject(arg: HDPrivateKeyMinimalDto): IHDPrivateKey {
    let buffers = {
      version: BufferUtils.integerAsBuffer(networks.get(arg.network)!.xprivkey),
      depth: BufferUtils.integerAsSingleByteBuffer(arg.depth),
      parentFingerPrint: BufferUtils.integerAsBuffer(arg.parentFingerPrint),
      childIndex: BufferUtils.integerAsBuffer(arg.childIndex),
      chainCode: Buffer.from(arg.chainCode, 'hex'),
      privateKey: Buffer.from(arg.privateKey,'hex'),
    };
    return this._buildFromBuffers(buffers);
  }

  private static _buildFromSerialized(xprivkey: string): IHDPrivateKey {
    let decoded = Base58Check.decode(xprivkey);
    let buffers: HDPrivateKeyBuffers = {
      version: decoded.subarray(HDKeyUtils.VersionStart, HDKeyUtils.VersionEnd),
      depth: decoded.subarray(HDKeyUtils.DepthStart, HDKeyUtils.DepthEnd),
      parentFingerPrint: decoded.subarray(HDKeyUtils.ParentFingerPrintStart, HDKeyUtils.ParentFingerPrintEnd),
      childIndex: decoded.subarray(HDKeyUtils.ChildIndexStart, HDKeyUtils.ChildIndexEnd),
      chainCode: decoded.subarray(HDKeyUtils.ChainCodeStart, HDKeyUtils.ChainCodeEnd),
      privateKey: decoded.subarray(this.PrivateKeyStart, this.PrivateKeyEnd),
      checksum: decoded.subarray(this.ChecksumStart, this.ChecksumEnd),
    }
    return this._buildFromBuffers(buffers);
  }

  /**
   * Receives a object with buffers in all the properties and populates the
   * internal structure
   */
  private static _buildFromBuffers(arg: HDPrivateKeyBuffers): IHDPrivateKey {
    HDPrivateKey._validateBufferArguments(arg);

    let sequence = [
      arg.version, arg.depth, arg.parentFingerPrint, arg.childIndex, arg.chainCode,
      Buffer.alloc(1), arg.privateKey
    ];
    let concat = Buffer.concat(sequence);

    if (!arg.checksum?.length) {
      arg.checksum = Base58Check.checksum(concat);
    } else if (arg.checksum.toString() !== Base58Check.checksum(concat).toString()) {
      throw new InvalidB58Checksum(concat);
    }

    let network = networks.get(BufferUtils.integerFromBuffer(arg.version))!;
    let privateKey = PrivateKey.from(BN.fromBuffer(arg.privateKey), network);
    let publicKey = privateKey.toPublicKey();

    return {
      xprivkey: Base58Check.encode(concat),
      network: network,
      depth: BufferUtils.integerFromSingleByteBuffer(arg.depth),
      privateKey: privateKey,
      publicKey: publicKey,
      fingerPrint: Hash.sha256ripemd160(publicKey.toBuffer()).subarray(0, HDKeyUtils.ParentFingerPrintSize),
      chainCode: arg.chainCode,
      childIndex: BufferUtils.integerFromBuffer(arg.childIndex),
      parentFingerPrint: arg.parentFingerPrint,
      checksum: arg.checksum
    }
  }

  private static _validateBufferArguments(arg: HDPrivateKeyBuffers): void {
    const checkBuffer = (name: string, size: number): void => {
      let buff = arg[name as keyof HDPrivateKeyBuffers];
      ValidationUtils.validateArgument(BufferUtils.isBuffer(buff), name + ' argument is not a buffer');
      ValidationUtils.validateArgument(buff!.length === size, name + ' has not the expected size: found ' + buff!.length + ', expected ' + size);
    };

    checkBuffer('version', HDKeyUtils.VersionSize);
    checkBuffer('depth', HDKeyUtils.DepthSize);
    checkBuffer('parentFingerPrint', HDKeyUtils.ParentFingerPrintSize);
    checkBuffer('childIndex', HDKeyUtils.ChildIndexSize);
    checkBuffer('chainCode', HDKeyUtils.ChainCodeSize);
    checkBuffer('privateKey', this.PrivateKeySize);
    if (arg.checksum?.length) {
      checkBuffer('checksum', HDKeyUtils.CheckSumSize);
    }
  }

  private static _generateRandomly(network?: Networkish): IHDPrivateKey {
    return this._buildFromSeed(BufferUtils.getRandomBuffer(64), network);
  }

  /**
   * Will return the corresponding hd public key
   *
   * @returns An extended public key generated from the hd private key
   */
  public getHDPublicKey(): HDPublicKey {
    if (!this._hdPublicKey) {
      this._hdPublicKey = new HDPublicKey(this);
    }
    return this._hdPublicKey;
  }

  /**
   * Returns the console representation of this extended private key.
   */
  public inspect(): string {
    return `<HDPrivateKey: ${this}>`;
  }
}