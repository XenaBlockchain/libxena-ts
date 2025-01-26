import { isNil, isNumber, isObject, isString } from "lodash-es";
import type { HDPublicKeyBuffers, HDPublicKeyDto, HDPublicKeyMinimalDto, IHDPrivateKey, IHDPublicKey, IPublicKey } from "../common/interfaces";
import HDKeyUtils from "./hdkey.utils";
import { networks } from "../core/network/network-manager";
import BufferUtils from "../utils/buffer.utils";
import type { Network } from "../core/network/network";
import ValidationUtils from "../utils/validation.utils";
import { InvalidB58Checksum, InvalidDerivationArgument, InvalidHardenedIndex, InvalidPath } from "./exceptions";
import Base58Check from "../encoding/base58check";
import PublicKey from "./publickey";
import Hash from "../crypto/hash";
import BN from "../crypto/bn.extension";
import Point from "../crypto/point";

export default class HDPublicKey implements IHDPublicKey {

  private static readonly PublicKeySize = 33;
  private static readonly PublicKeyStart = HDKeyUtils.ChainCodeEnd;
  private static readonly PublicKeyEnd = this.PublicKeyStart + this.PublicKeySize;
  private static readonly ChecksumStart = this.PublicKeyEnd;
  private static readonly ChecksumEnd = this.ChecksumStart + HDKeyUtils.CheckSumSize;

  readonly publicKey!: IPublicKey;
  readonly network!: Network;
  readonly depth!: number;
  readonly parentFingerPrint!: Buffer;
  readonly fingerPrint!: Buffer;
  readonly chainCode!: Buffer;
  readonly childIndex!: number;
  readonly checksum!: Buffer;
  readonly xpubkey!: string;

  /**
   * The representation of an hierarchically derived public key.
   *
   * See https://github.com/bitcoin/bips/blob/master/bip-0032.mediawiki
   *
   * @param arg
   */
  constructor(arg: string | Buffer | HDPublicKeyDto | HDPublicKeyMinimalDto | IHDPublicKey | IHDPrivateKey) {
    if (isNil(arg)) {
      throw new TypeError("Must supply an argument to create a HDPublicKey");
    }
    if (arg instanceof HDPublicKey) {
      return arg;
    }

    let params = HDPublicKey._classifyArgument(arg);

    this.publicKey = params.publicKey;
    this.network = params.network;
    this.depth = params.depth;
    this.parentFingerPrint = params.parentFingerPrint;
    this.fingerPrint = params.fingerPrint;
    this.chainCode = params.chainCode;
    this.childIndex = params.childIndex;
    this.xpubkey = params.xpubkey;
    this.checksum = params.checksum;
  }

  private static _classifyArgument(arg: string | Buffer | HDPublicKeyDto | HDPublicKeyMinimalDto | IHDPublicKey | IHDPrivateKey): IHDPublicKey {
    if (isString(arg) || BufferUtils.isBuffer(arg)) {
      let xpubkey = arg.toString();
      if (HDKeyUtils.isValidSerialized(xpubkey)) {
        return this._buildFromSerialized(xpubkey);
      }
      throw HDKeyUtils.getSerializedError(arg);
    }

    if (this._isIHDPubKey(arg)) {
      return arg;
    }
    if (this._isMinimalDtoObject(arg)) {
      return this._buildFromMinimalObject(arg);
    }
    if (this._isDtoObject(arg)) {
      return this._buildFromObject(arg);
    }
    if (this._isIHDPrivKey(arg)) {
      return this._buildFromHDPrivateKey(arg);
    }

    throw new TypeError('Invalid argument type for creation, must be string, json, buffer, or object');
  }

  private static _isDtoObject(data: unknown): data is HDPublicKeyDto {
    return isObject(data) && 'xpubkey' in data && !('privateKey' in data) && 'publicKey' in data && isString(data.publicKey);
  }

  private static _isMinimalDtoObject(data: unknown): data is HDPublicKeyMinimalDto {
    return isObject(data) && !('xpubkey' in data) && !('privateKey' in data) && 'publicKey' in data && isString(data.publicKey);
  }

  private static _isIHDPubKey(data: unknown): data is IHDPublicKey {
    return isObject(data) && 'xpubkey' in data && !('privateKey' in data) && 'publicKey' in data && data.publicKey instanceof PublicKey;
  }

  private static _isIHDPrivKey(data: unknown): data is IHDPrivateKey {
    return isObject(data) && 'privateKey' in data && isObject(data.privateKey) && 'bn' in data.privateKey;
  }
  
  /**
   * Verifies that a given path is valid.
   *
   * @param arg
   * @return {boolean}
   */
  public static isValidPath(arg: string | number): boolean {
    if (isString(arg)) {
      let indexes = HDKeyUtils.getDerivationIndexes(arg);
      return indexes !== null && indexes.every(HDPublicKey.isValidPath);
    }

    if (isNumber(arg)) {
      return arg >= 0 && arg < HDKeyUtils.Hardened;
    }

    return false;
  }

  /**
   * Create a HDPublicKey from a buffer argument
   *
   * @param buf
   */
  public static fromBuffer(buf: Buffer): HDPublicKey {
    ValidationUtils.validateArgument(BufferUtils.isBuffer(buf), 'No valid Buffer was provided');
    return new HDPublicKey(buf);
  }

  /**
   * Return a buffer representation of the xpubkey
   */
  public toBuffer(): Buffer {
    return Buffer.from(this.xpubkey);
  }

  public static fromString(xpubkey: string): HDPublicKey {
    ValidationUtils.validateArgument(isString(xpubkey), 'No valid string was provided');
    return new HDPublicKey(xpubkey);
  }
  
  /**
   * Returns the base58 checked representation of the public key
   * @return a string starting with "xpub..." in livenet
   */
  public toString(): string {
    return this.xpubkey;
  }

  /**
   * Returns the console representation of this extended public key.
   */
  public inspect(): string {
    return `<HDPublicKey: ${this}>`;
  }

  public static fromObject(arg: HDPublicKeyDto): HDPublicKey {
    ValidationUtils.validateArgument(isObject(arg), 'No valid argument was provided');
    return new HDPublicKey(arg);
  }

  public static fromMinimalObject(arg: HDPublicKeyMinimalDto): HDPublicKey {
    ValidationUtils.validateArgument(isObject(arg), 'No valid argument was provided');
    let params = this._buildFromMinimalObject(arg);
    return new HDPublicKey(params);
  }

  public toJSON = this.toObject;

  /**
   * Returns a plain JavaScript object with information to reconstruct a key.
   */
  public toObject(): HDPublicKeyDto {
    return {
      network: this.network.name,
      depth: this.depth,
      fingerPrint: BufferUtils.integerFromBuffer(this.fingerPrint),
      parentFingerPrint: BufferUtils.integerFromBuffer(this.parentFingerPrint),
      childIndex: this.childIndex,
      chainCode: this.chainCode.toString('hex'),
      publicKey: this.publicKey.toString(),
      checksum: BufferUtils.integerFromBuffer(this.checksum),
      xpubkey: this.xpubkey
    };
  }

  /**
   * Get a derivated child based on a string or number.
   *
   * If the first argument is a string, it's parsed as the full path of
   * derivation. Valid values for this argument include "m" (which returns the
   * same public key), "m/0/1/40/2/1000".
   *
   * Note that hardened keys can't be derived from a public extended key.
   *
   * If the first argument is a number, the child with that index will be
   * derived. See the example usage for clarification.
   *
   * @example
   * ```javascript
   * let parent = new HDPublicKey('xpub...');
   * let child_0_1_2 = parent.deriveChild(0).deriveChild(1).deriveChild(2);
   * let copy_of_child_0_1_2 = parent.deriveChild("m/0/1/2");
   * assert(child_0_1_2.xpubkey === copy_of_child_0_1_2.xpubkey);
   * ```
   *
   * @param {string|number} arg
   */
  public deriveChild(arg: string | number, hardened?: boolean): HDPublicKey {
    if (isNumber(arg)) {
      return this._deriveWithNumber(arg, hardened);
    } 
    if (isString(arg)) {
      return this._deriveFromString(arg);
    } 
    throw new InvalidDerivationArgument(arg);
  }

  private _deriveWithNumber(index: number, hardened?: boolean): HDPublicKey {
    if (index >= HDKeyUtils.Hardened || hardened) {
      throw new InvalidHardenedIndex();
    }
    if (index < 0) {
      throw new InvalidPath(index);
    }
  
    let indexBuffer = BufferUtils.integerAsBuffer(index);
    let data = Buffer.concat([this.publicKey.toBuffer(), indexBuffer]);
    let hash = Hash.sha512hmac(data, this.chainCode);
    let leftPart = BN.fromBuffer(hash.subarray(0, 32), {size: 32});
    let chainCode = hash.subarray(32, 64);
  
    let publicKey: PublicKey;
    try {
      publicKey = PublicKey.fromPoint(Point.getG().mul(leftPart).add(this.publicKey.point));
    } catch {
      return this._deriveWithNumber(index + 1);
    }

    let buffers: HDPublicKeyBuffers = {
      version: BufferUtils.integerAsBuffer(this.network.xpubkey),
      depth: BufferUtils.integerAsSingleByteBuffer(this.depth + 1),
      parentFingerPrint: this.fingerPrint,
      childIndex: BufferUtils.integerAsBuffer(index),
      publicKey: publicKey.toBuffer(),
      chainCode: chainCode
    };
    let derived = HDPublicKey._buildFromBuffers(buffers);
  
    return new HDPublicKey(derived);
  }

  private _deriveFromString(path: string): HDPublicKey {
    if (path.includes("'")) {
      throw new InvalidHardenedIndex();
    }
    if (!HDPublicKey.isValidPath(path)) {
      throw new InvalidPath(path);
    }

    const deriveKeys = (baseKey: HDPublicKey, indexes: number[]): HDPublicKey => {
      return indexes.reduce((prev, idx) => prev._deriveWithNumber(idx), baseKey);
    }
  
    let indexes = HDKeyUtils.getDerivationIndexes(path);
    return deriveKeys(this, indexes!);
  }

  private static _buildFromObject(arg: HDPublicKeyDto): IHDPublicKey {
    return {
      network: networks.get(arg.network)!,
      depth: arg.depth,
      fingerPrint: BufferUtils.integerAsBuffer(arg.fingerPrint),
      parentFingerPrint: BufferUtils.integerAsBuffer(arg.parentFingerPrint),
      childIndex: arg.childIndex,
      chainCode: Buffer.from(arg.chainCode, 'hex'),
      xpubkey: arg.xpubkey,
      checksum: BufferUtils.integerAsBuffer(arg.checksum),
      publicKey: PublicKey.fromString(arg.publicKey, undefined, networks.get(arg.network)!)
    }
  }

  private static _buildFromMinimalObject(arg: HDPublicKeyMinimalDto): IHDPublicKey {
    let buffers = {
      version: BufferUtils.integerAsBuffer(networks.get(arg.network)!.xpubkey),
      depth: BufferUtils.integerAsSingleByteBuffer(arg.depth),
      parentFingerPrint: BufferUtils.integerAsBuffer(arg.parentFingerPrint),
      childIndex: BufferUtils.integerAsBuffer(arg.childIndex),
      chainCode: Buffer.from(arg.chainCode, 'hex'),
      publicKey: Buffer.from(arg.publicKey,'hex'),
    };
    return this._buildFromBuffers(buffers);
  }

  private static _buildFromHDPrivateKey(hdPrivateKey: IHDPrivateKey): IHDPublicKey {
    let point = Point.getG().mul(hdPrivateKey.privateKey.bn);
    let buffers: HDPublicKeyBuffers = {
      version: BufferUtils.integerAsBuffer(hdPrivateKey.network.xpubkey),
      depth: BufferUtils.integerAsSingleByteBuffer(hdPrivateKey.depth),
      parentFingerPrint: hdPrivateKey.parentFingerPrint,
      childIndex: BufferUtils.integerAsBuffer(hdPrivateKey.childIndex),
      chainCode: hdPrivateKey.chainCode,
      publicKey: Point.pointToCompressed(point),
    };

    return this._buildFromBuffers(buffers);
  }

  private static _buildFromSerialized(xpubkey: string): IHDPublicKey {
    let decoded = Base58Check.decode(xpubkey);
    let buffers: HDPublicKeyBuffers = {
      version: decoded.subarray(HDKeyUtils.VersionStart, HDKeyUtils.VersionEnd),
      depth: decoded.subarray(HDKeyUtils.DepthStart, HDKeyUtils.DepthEnd),
      parentFingerPrint: decoded.subarray(HDKeyUtils.ParentFingerPrintStart, HDKeyUtils.ParentFingerPrintEnd),
      childIndex: decoded.subarray(HDKeyUtils.ChildIndexStart, HDKeyUtils.ChildIndexEnd),
      chainCode: decoded.subarray(HDKeyUtils.ChainCodeStart, HDKeyUtils.ChainCodeEnd),
      publicKey: decoded.subarray(this.PublicKeyStart, this.PublicKeyEnd),
      checksum: decoded.subarray(this.ChecksumStart, this.ChecksumEnd),
    };

    return this._buildFromBuffers(buffers);
  }
  
  /**
   * Receives a object with buffers in all the properties and populates the
   * internal structure
   *
   * @param arg
   */
  private static _buildFromBuffers(arg: HDPublicKeyBuffers): IHDPublicKey {
    HDPublicKey._validateBufferArguments(arg);

    let sequence = [ arg.version, arg.depth, arg.parentFingerPrint, arg.childIndex, arg.chainCode, arg.publicKey ];
    let concat = Buffer.concat(sequence);
    let checksum = Base58Check.checksum(concat);

    if (!arg.checksum || !arg.checksum.length) {
      arg.checksum = checksum;
    } else if (arg.checksum.toString('hex') !== checksum.toString('hex')) {
      throw new InvalidB58Checksum(concat);
    }

    let network = networks.get(BufferUtils.integerFromBuffer(arg.version))!;
    let publicKey = PublicKey.fromBuffer(arg.publicKey, true, network);

    return {
      xpubkey: Base58Check.encode(concat),
      network: network,
      depth: BufferUtils.integerFromSingleByteBuffer(arg.depth),
      publicKey: publicKey,
      fingerPrint: Hash.sha256ripemd160(publicKey.toBuffer()).subarray(0, HDKeyUtils.ParentFingerPrintSize),
      chainCode: arg.chainCode,
      childIndex: BufferUtils.integerFromBuffer(arg.childIndex),
      parentFingerPrint: arg.parentFingerPrint,
      checksum: arg.checksum
    };
  }

  private static _validateBufferArguments(arg: HDPublicKeyBuffers): void {
    const checkBuffer = (name: string, size: number): void => {
      let buff = arg[name as keyof HDPublicKeyBuffers];
      ValidationUtils.validateArgument(BufferUtils.isBuffer(buff), name + ` argument is not a buffer, it\'s ${typeof buff}`);
      ValidationUtils.validateArgument(buff!.length === size, name + ' has not the expected size: found ' + buff!.length + ', expected ' + size);
    };
    
    checkBuffer('version', HDKeyUtils.VersionSize);
    checkBuffer('depth', HDKeyUtils.DepthSize);
    checkBuffer('parentFingerPrint', HDKeyUtils.ParentFingerPrintSize);
    checkBuffer('childIndex', HDKeyUtils.ChildIndexSize);
    checkBuffer('chainCode', HDKeyUtils.ChainCodeSize);
    checkBuffer('publicKey', HDPublicKey.PublicKeySize);
    if (arg.checksum?.length) {
      checkBuffer('checksum', HDKeyUtils.CheckSumSize);
    }
  }
}