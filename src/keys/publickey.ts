import { isNil, isObject, isString, isUndefined } from "lodash-es";
import ValidationUtils from "../utils/validation.utils";
import Point from "../crypto/point";
import type { Network } from "../core/network/network";
import { networks } from "../core/network/network-manager";
import BufferUtils from "../utils/buffer.utils";
import BN from "../crypto/bn.extension";
import CommonUtils from "../utils/common.utils";
import type { IPrivateKey, IPublicKey, PublicKeyDto } from "../common/interfaces";

export type PublicKeyVariants = PublicKey | Point | Partial<IPrivateKey> | Partial<IPublicKey> | PublicKeyDto | Buffer | string;

/**
 * Instantiate new PublicKey.
 *
 * There are two internal properties, `network` and `compressed`, that deal with importing
 * a PublicKey from a PrivateKey in WIF format.
 * 
 * @remarks Better to use {@linkcode PublicKey.from} method to init public key from various formats if the formart unknown.
 *
 * @example
 * ```ts
 * // export to as a DER hex encoded string
 * let exported = key.toString();
 *
 * // import the public key
 * let imported = PublicKey.fromString(exported);
 * //or
 * let imported = PublicKey.from(exported);
 * ```
 */
export default class PublicKey implements IPublicKey {

  public point!: Point;
  public compressed!: boolean;
  public network!: Network;

  /**
   * @param data - The pubkey data
   */
  constructor(data: Partial<IPublicKey>) {
    ValidationUtils.validateArgument(!isNil(data), 'First argument is required, please include public key data.');

    if (data instanceof PublicKey) {
      // Return copy, but as it's an immutable object, return same argument
      return data;
    }

    if (PublicKey._isPublicKeyData(data)) {
      data.point.validate();
      this.point = data.point;
      this.compressed = isUndefined(data.compressed) || data.compressed;
      this.network = data.network || networks.defaultNetwork;
    } else {
      throw new TypeError('First argument is an unrecognized data format.');
    }
  }

  public toObject = this.toJSON;
  public toDER = this.toBuffer;

  /**
   * @returns A plain object of the PublicKey
   */
  public toJSON(): PublicKeyDto {
    return {
      x: this.point.getX().toString('hex', 2),
      y: this.point.getY().toString('hex', 2),
      compressed: this.compressed,
      network: this.network.toString()
    };
  }

  /**
   * Will output the PublicKey to a DER Buffer
   *
   * @returns  A DER hex encoded buffer
   */
  public toBuffer(): Buffer {
    let x = this.point.getX();
    let y = this.point.getY();

    let xbuf = x.toBuffer({ size: 32 });
    let ybuf = y.toBuffer({ size: 32 });

    let prefix: Buffer;
    if (!this.compressed) {
      prefix = Buffer.from([0x04]);
      return Buffer.concat([prefix, xbuf, ybuf]);
    } else {
      let odd = ybuf[ybuf.length - 1] % 2;
      if (odd) {
        prefix = Buffer.from([0x03]);
      } else {
        prefix = Buffer.from([0x02]);
      }
      return Buffer.concat([prefix, xbuf]);
    }
  }

  /**
   * Will output the PublicKey to a DER encoded hex string
   *
   * @returns A DER hex encoded string
   */
  public toString(): string {
    return this.toBuffer().toString('hex');
  }

  /**
   * Will return a string formatted for the console
   *
   * @returns Public key string inspection
   */
  public inspect(): string {
    return '<PublicKey: ' + this.toString() + (this.compressed ? '' : ', uncompressed') + '>';
  }

  /**
   * Instantiate a PublicKey from various formats
   * 
   * @param data The encoded data in various formats
   * @param compressed If the public key is compressed
   * @param network The key network
   * @returns New PublicKey instance
   */
  public static from(data: PublicKeyVariants, compressed?: boolean, network?: Network): PublicKey {
    // detect type of data
    if (data instanceof PublicKey) {
      return data;
    } else if (data instanceof Point) {
      return this.fromPoint(data, compressed, network);
    } else if (this._isPublicKeyDto(data)) {
      return this.fromObject(data);
    } else if (this._isPublicKeyData(data)) {
      return new PublicKey(data);
    } else if (this._isPrivateKeyData(data)) {
      return this.fromPrivateKey(data);
    } else if (BufferUtils.isBuffer(data)) {
      return this.fromBuffer(data, true, network);
    } else if (CommonUtils.isHexa(data as string)) {
      return this.fromString(data as string, "hex", network);
    } else {
      throw new TypeError('First argument is an unrecognized data format.');
    }
  }

  public static fromDER = this.fromBuffer;
  public static fromObject = this.fromJSON;
  
  /**
   * Instantiate a PublicKey from a Buffer
   * 
   * @param buf - A DER hex buffer
   * @param strict - if set to false, will loosen some conditions
   * @param network - the network of the key
   * @returns A new valid instance of PublicKey
   */
  public static fromBuffer(buf: Buffer, strict?: boolean, network?: Network): PublicKey {
    ValidationUtils.validateArgument(BufferUtils.isBuffer(buf), 'Must be a hex buffer of DER encoded public key');
    let info = PublicKey._transformDER(buf, strict);
    return new PublicKey({ point: info.point, compressed: info.compressed, network: network });
  }

  /**
   * Instantiate a PublicKey from a Point
   *
   * @param point - A Point instance
   * @param compressed - whether to store this public key as compressed format
   * @param network - the network of the key
   * @returns A new valid instance of PublicKey
   */
  public static fromPoint(point: Point, compressed?: boolean, network?: Network): PublicKey {
    ValidationUtils.validateArgument(point instanceof Point, 'First argument must be an instance of Point.');
    return new PublicKey({ point: point, compressed: compressed, network: network });
  }

  /**
   * Instantiate a PublicKey from a DER hex encoded string
   *
   * @param str - A DER hex string
   * @param encoding - The type of string encoding
   * @param network - the network of the key
   * @returns A new valid instance of PublicKey
   */
  public static fromString(str: string, encoding?: BufferEncoding, network?: Network): PublicKey {
    let buf = Buffer.from(str, encoding || 'hex');
    let info = PublicKey._transformDER(buf);
    return new PublicKey({ point: info.point, compressed: info.compressed, network: network });
  }

  /**
   * Instantiate a PublicKey from PrivateKey data
   *
   * @param data - Object contains data of PrivateKey
   * @returns A new valid instance of PublicKey
   */
  public static fromPrivateKey(data: IPrivateKey): PublicKey {
    ValidationUtils.validateArgument(this._isPrivateKeyData(data), 'data', 'Must be data of PrivateKey');
    let point = Point.getG().mul(data.bn);
    return new PublicKey({ point: point, compressed: data.compressed, network: data.network });
  }

  public static fromJSON(data: PublicKeyDto): PublicKey {
    let info = PublicKey._transformObject(data);
    return new PublicKey(info);
  }

  /**
   * Check if there would be any errors when initializing a PublicKey
   *
   * @param data - The encoded data in various formats
   * @returns An error if exists
   */
  public static getValidationError(data: PublicKeyVariants): Error | undefined {
    try {
      this.from(data);
    } catch (e) {
      return e as Error;
    }
    return undefined;
  }

  /**
   * Check if the parameters are valid
   *
   * @param data - The encoded data in various formats
   * @returns true If the public key would be valid
   */
  public static isValid(data: PublicKeyVariants): boolean {
    return !PublicKey.getValidationError(data);
  }

  private static _isPublicKeyData(data: unknown): data is IPublicKey {
    return isObject(data) && 'point' in data && data.point instanceof Point;
  }

  private static _isPublicKeyDto(data: unknown): data is PublicKeyDto {
    return isObject(data) && 'x' in data && 'y' in data;
  }

  private static _isPrivateKeyData(data: unknown): data is IPrivateKey {
    return isObject(data) && 'bn' in data && 'network' in data
  }

  /**
   * Internal function to transform DER into a public key point
   *
   * @param buf - An hex encoded buffer
   * @param strict - if set to false, will loosen some conditions
   * @returns An object with keys: point and compressed
   */
  private static _transformDER(buf: Buffer, strict?: boolean): Partial<IPublicKey> {
    ValidationUtils.validateArgument(BufferUtils.isBuffer(buf), 'Must be a hex buffer of DER encoded public key');

    strict = isUndefined(strict) ? true : strict;

    if (buf[0] === 0x04 || (!strict && (buf[0] === 0x06 || buf[0] === 0x07))) {
      let xbuf = buf.subarray(1, 33);
      let ybuf = buf.subarray(33, 65);
      if (xbuf.length !== 32 || ybuf.length !== 32 || buf.length !== 65) {
        throw new TypeError('Length of x and y must be 32 bytes');
      }
      let x = new BN(xbuf);
      let y = new BN(ybuf);
      return { point: Point.ecPoint(x, y), compressed: false };
    } else if (buf[0] === 0x03) {
      let xbuf = buf.subarray(1);
      let x = new BN(xbuf);
      return { point: Point.ecPointFromX(true, x), compressed: true };
    } else if (buf[0] === 0x02) {
      let xbuf = buf.subarray(1);
      let x = new BN(xbuf);
      return { point: Point.ecPointFromX(false, x), compressed: true };
    } else {
      throw new TypeError('Invalid DER format public key');
    }
  }

  /**
   * Internal function to transform a JSON into a public key point
   */
  private static _transformObject(json: PublicKeyDto): Partial<IPublicKey> {
    ValidationUtils.validateArgument(isString(json.x), 'x', 'must be a hex string');
    ValidationUtils.validateArgument(isString(json.y), 'y', 'must be a hex string');
    let x = new BN(json.x, 'hex');
    let y = new BN(json.y, 'hex');
    let point = Point.ecPoint(x, y);
    return { point: point, compressed: json.compressed, network: networks.get(json.network) };
  }
}