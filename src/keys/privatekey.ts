import { isNil, isObject, isString, isUndefined } from "lodash-es";
import type { Bufferish, Networkish } from "../common/types";
import type { IPrivateKey, PrivateKeyDto } from "../common/interfaces";
import type { Network } from "../core/network/network";
import { networks } from "../core/network/network-manager";
import BN from "../crypto/bn.extension";
import CommonUtils from "../utils/common.utils";
import BufferUtils from "../utils/buffer.utils";
import Point from "../crypto/point";
import Base58Check from "../encoding/base58check";
import ValidationUtils from "../utils/validation.utils";
import PublicKey from "./publickey";

export type PrivateKeyVariants = BN | string | Bufferish | PrivateKey | IPrivateKey | PrivateKeyDto | null;

export default class PrivateKey implements IPrivateKey {

  private _pubkey?: PublicKey;

  public bn!: BN;
  public compressed!: boolean;
  public network!: Network;

  /**
   * Instantiate a PrivateKey.
   * 
   * @param data The private key data
   * 
   * @remarks Better to use {@linkcode PrivateKey.from} method to init private key from various formats if the formart unknown.
   *
   * @example
   * ```ts
   * // generate a new random key
   * let key = new PrivateKey();
   *
   * // encode into wallet import format
   * let exported = key.toWIF();
   *
   * // instantiate from the exported (and saved) private key
   * let imported = PrivateKey.fromWIF(exported);
   * ```
   */
  constructor(data?: Partial<IPrivateKey>) {
    if (data instanceof PrivateKey) {
      return data;
    }

    if (isNil(data)) {
      data = {
        bn: PrivateKey._getRandomBN(),
        compressed: true,
        network: networks.defaultNetwork
      };
    }

    if (!PrivateKey._isPrivateKeyParams(data)) {
      throw new TypeError('First argument is an unrecognized data type.');
    }

    // validation
    if (!data.bn || data.bn.cmp(new BN(0)) === 0){
      throw new TypeError('Number can not be equal to zero, undefined, null or false');
    }
    if (!data.bn.lt(Point.getN())) {
      throw new TypeError('Number must be less than N');
    }

    this.bn = data.bn;
    this.compressed = isUndefined(data.compressed) ? true : data.compressed;
    this.network = data.network || networks.defaultNetwork;
  }

  public get publicKey(): PublicKey {
    return this.toPublicKey();
  }

  /**
   * Will output the PrivateKey encoded as hex string
   */
  public toString(): string {
    return this.toBuffer().toString('hex');
  }

  /**
   * Will encode the PrivateKey to a WIF string
   *
   * @returns A WIF representation of the private key
   */
  public toWIF(): string {
    let buf: Buffer;
    if (this.compressed) {
      buf = Buffer.concat([Buffer.from([this.network.privatekey]),
                          this.bn.toBuffer({size: 32}),
                          Buffer.from([0x01])]);
    } else {
      buf = Buffer.concat([Buffer.from([this.network.privatekey]),
                          this.bn.toBuffer({size: 32})]);
    }

    return Base58Check.encode(buf);
  }

  /**
   * Will return the private key as a BN instance
   *
   * @returns A BN instance of the private key
   */
  public toBigNumber(): BN {
    return this.bn;
  }

  /**
   * Will return the private key as a BN buffer
   *
   * @returns A buffer of the private key
   */
  public toBuffer(): Buffer {
    return this.bn.toBuffer({size: 32});
  }

  /**
   * Will return the private key as a BN buffer without leading zero padding
   *
   * @returns A buffer of the private key
   */
  public toBufferNoPadding(): Buffer {
    return this.bn.toBuffer();
  }

  /**
   * Will return the corresponding public key
   *
   * @returns A public key generated from the private key
   */
  public toPublicKey(): PublicKey {
    if (!this._pubkey) {
      this._pubkey = PublicKey.fromPrivateKey(this);
    }
    return this._pubkey;
  }

  public toObject = this.toJSON;

  /**
   * @returns A plain object representation
   */
  public toJSON(): PrivateKeyDto {
    return {
      bn: this.bn.toString('hex'),
      compressed: this.compressed,
      network: this.network.toString()
    };
  }

  /**
   * Will return a string formatted for the console
   *
   * @returns Private key details
   */
  public inspect(): string {
    let uncompressed = !this.compressed ? ', uncompressed' : '';
    return `<PrivateKey: ${this.toString()}, network: ${this.network}${uncompressed}>`;
  }

  /**
   * Instantiate a PrivateKey from a Buffer with the DER or WIF representation
   */
  public static fromBuffer(buf: Buffer, network?: Networkish): PrivateKey {
    ValidationUtils.validateArgument(BufferUtils.isBuffer(buf), 'First argument is expected to be a buffer.');
    let data = this._transformBuffer(buf, network);
    return new PrivateKey(data);
  }

  public static fromString = this.fromWIF;

  /**
   * Instantiate a PrivateKey from a WIF string
   *
   * @param str - The WIF encoded private key string
   * @returns A new valid instance of PrivateKey
   */
  public static fromWIF(str: string, network?: Networkish): PrivateKey {
    ValidationUtils.validateArgument(isString(str), 'First argument is expected to be a string.');

    let data: Partial<IPrivateKey>;
    if (CommonUtils.isHexa(str)) {
      data = {
        bn: new BN(Buffer.from(str, 'hex')),
        compressed: true,
        network: networks.get(network) || networks.defaultNetwork
      };
    } else {
      data = PrivateKey._transformWIF(str, network);
    }
    return new PrivateKey(data);
  }

  public static fromObject = this.fromJSON;

  /**
   * Instantiate a PrivateKey from a plain JavaScript object
   *
   * @param obj - The output from privateKey.toObject()
   */
  public static fromJSON(obj: PrivateKeyDto): PrivateKey {
    ValidationUtils.validateArgument(isObject(obj), 'First argument is expected to be an object.');
    let data = this._transformObject(obj);
    return new PrivateKey(data);
  }

  /**
   * Instantiate a PrivateKey from random bytes
   *
   * @param network - Either "mainnet" or "testnet"
   * @returns A new valid instance of PrivateKey
   */
  public static fromRandom(network?: Networkish): PrivateKey {
    let data = {
      bn: PrivateKey._getRandomBN(),
      compressed: true,
      network: networks.get(network) || networks.defaultNetwork
    }
    return new PrivateKey(data);
  }

  /**
   * Check if there would be any errors when initializing a PrivateKey
   *
   * @param data - The encoded data in various formats
   * @param network - Either "mainnet" or "testnet"
   * @returns An error if exists
   */

  public static getValidationError(data: PrivateKeyVariants, network?: Networkish): Error | undefined {
    try {
      this.from(data, network);
    } catch (e) {
      return e as Error;
    }
    return undefined;
  }

  /**
   * Check if the parameters are valid
   *
   * @param data - The encoded data in various formats
   * @param network - Either "mainnet" or "testnet"
   * @returns true If the private key would be valid
   */
  public static isValid(data?: PrivateKeyVariants, network?: Networkish): boolean {
    if (!data) {
      return false;
    }
    return !this.getValidationError(data, network);
  }

  /**
   * Helper to instantiate PrivateKey from different kinds of arguments.
   */
  public static from(data?: PrivateKeyVariants, network?: Networkish): PrivateKey {
    // detect type of data
    if (isNil(data)){
      return this.fromRandom(network);
    } else if (data instanceof PrivateKey) {
      return data;
    } else if (data instanceof BN) {
      let info: Partial<IPrivateKey> = {
        bn: data,
        compressed: true,
        network: networks.get(network) || networks.defaultNetwork
      }
      return new PrivateKey(info);
    } else if (BufferUtils.isBuffer(data)) {
      return this.fromBuffer(data, network);
    } else if (this._isPrivateKeyParams(data) && data.bn && data.network){
      return this.fromObject(data);
    } else if (isString(data)) {
      return this.fromString(data, network);
    } else {
      throw new TypeError('First argument is an unrecognized data type.');
    }
  }

  private static _isPrivateKeyParams(data: unknown): data is PrivateKeyDto {
    return isObject(data) && 'bn' in data && 'network' in data;
  }

  private static _getRandomBN(): BN {
    let bn: BN;
    do {
      let privbuf = BufferUtils.getRandomBuffer(32);
      bn = BN.fromBuffer(privbuf);
    } while (!bn.lt(Point.getN()));
    return bn;
  }

  /**
   * Internal function to transform a WIF Buffer into a private key
   */
  private static _transformBuffer(buf: Buffer, network?: Networkish): IPrivateKey {
    if (buf.length === 32) {
      return {
        network: networks.get(network) || networks.defaultNetwork,
        bn: BN.fromBuffer(buf),
        compressed: false,
      } as IPrivateKey;
    }

    let info: Partial<IPrivateKey> = {};

    info.network = networks.get(buf[0], 'privatekey');
    if (!info.network) {
      throw new Error(`Invalid network`);
    }
    if (network && info.network !== networks.get(network)) {
      throw new TypeError('Private key network mismatch');
    }

    if (buf.length === 1 + 32 + 1 && buf[1 + 32 + 1 - 1] === 1) {
      info.compressed = true;
    } else if (buf.length === 1 + 32) {
      info.compressed = false;
    } else {
      throw new Error('Length of buffer must be 33 (uncompressed) or 34 (compressed)');
    }

    info.bn = BN.fromBuffer(buf.subarray(1, 32 + 1));

    return info as IPrivateKey;
  }

  /**
   * Internal function to transform a JSON object into a private key
   */
  private static _transformObject(data: PrivateKeyDto): IPrivateKey {
    return {
      bn: new BN(data.bn, 'hex'),
      network: networks.get(data.network) || networks.defaultNetwork,
      compressed: data.compressed
    } as IPrivateKey;
  }

  /**
   * Internal function to transform a WIF string into a private key
   */
  private static _transformWIF(str: string, network?: Networkish): IPrivateKey {
    return this._transformBuffer(Base58Check.decode(str), network);
  }
}