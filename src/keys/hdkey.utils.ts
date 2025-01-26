import { isNull, isString, isUndefined } from "lodash-es";
import type { Networkish } from "../common/types";
import { networks } from "../core/network/network-manager";
import BufferUtils from "../utils/buffer.utils";
import { ArgumentIsPrivateExtended, InvalidB58Char, InvalidB58Checksum, InvalidLength, InvalidNetwork, InvalidNetworkArgument } from "./exceptions";
import Base58 from "../encoding/base58";
import Base58Check from "../encoding/base58check";

export default class HDKeyUtils {

  public static readonly Hardened = 0x80000000;
  public static readonly MaxIndex = 2 * HDKeyUtils.Hardened;

  public static readonly RootElementAlias = ['m', 'M', 'm\'', 'M\''];

  public static readonly VersionSize = 4;
  public static readonly DepthSize = 1;
  public static readonly ParentFingerPrintSize = 4;
  public static readonly ChildIndexSize = 4;
  public static readonly ChainCodeSize = 32;
  public static readonly CheckSumSize = 4;

  public static readonly DataSize = 78;
  public static readonly SerializedByteSize = 82;

  public static readonly VersionStart = 0;
  public static readonly VersionEnd = HDKeyUtils.VersionStart + HDKeyUtils.VersionSize;
  public static readonly DepthStart = HDKeyUtils.VersionEnd;
  public static readonly DepthEnd = HDKeyUtils.DepthStart + HDKeyUtils.DepthSize;
  public static readonly ParentFingerPrintStart = HDKeyUtils.DepthEnd;
  public static readonly ParentFingerPrintEnd = HDKeyUtils.ParentFingerPrintStart + HDKeyUtils.ParentFingerPrintSize;
  public static readonly ChildIndexStart = HDKeyUtils.ParentFingerPrintEnd;
  public static readonly ChildIndexEnd = HDKeyUtils.ChildIndexStart + HDKeyUtils.ChildIndexSize;
  public static readonly ChainCodeStart = HDKeyUtils.ChildIndexEnd;
  public static readonly ChainCodeEnd = HDKeyUtils.ChainCodeStart + HDKeyUtils.ChainCodeSize;

  /**
  * Util function that splits a string path into a derivation index array.
  * It will return null if the string path is malformed.
  * It does not validate if indexes are in bounds.
  *
  * @param path
  */
  public static getDerivationIndexes(path: string): number[] | null {
    // Special cases:
    if (this.RootElementAlias.includes(path)) {
      return [];
    }

    let steps = path.split('/');
    if (!this.RootElementAlias.includes(steps[0])) {
      return null;
    }

    let indexes = steps.slice(1).map(step => {
      let isHardened = step.slice(-1) === "'";
      if (isHardened) {
        step = step.slice(0, -1);
      }

      if (!step || step[0] === '-') {
        return NaN;
      }

      let index = +step; // cast to number
      if (isHardened) {
        index += this.Hardened;
      }

      return index;
    });

    return indexes.some(isNaN) ? null : indexes;
  }

  private static _validateNetwork(data: Buffer, networkArg: Networkish, isPrivate = false): Error | null {
    let network = networks.get(networkArg);
    if (!network) {
      return new InvalidNetworkArgument(networkArg);
    }
    let version = data.subarray(this.VersionStart, this.VersionEnd);
    if (BufferUtils.integerFromBuffer(version) !== (isPrivate ? network.xprivkey : network.xpubkey)) {
      return new InvalidNetwork(version);
    }
    return null;
  }

  /**
   * Verifies that a given serialized hd key in base58 with checksum format
   * is valid.
   *
   * @param data - the serialized hd key
   * @param network - optional, if present, checks that the network provided matches the network serialized.
   */
  public static isValidSerialized(data: Buffer | string, network?: Networkish, isPrivate = false): boolean {
    return isNull(this.getSerializedError(data, network, isPrivate));
  }

  /**
   * Checks what's the error that causes the validation of a serialized public key
   * in base58 with checksum to fail.
   *
   * @param data - the serialized hd key
   * @param network - optional, if present, checks that the network provided matches the network serialized.
   */
  public static getSerializedError(data: string | Buffer, network?: Networkish, isPrivate = false): Error | null {
    if (!(isString(data) || BufferUtils.isBuffer(data))) {
      return new TypeError('Expected string or buffer')
    }

    if (!Base58.validCharacters(data)) {
      return new InvalidB58Char('(unknown)', data);
    }

    try {
      data = Base58Check.decode(data as string);
    } catch {
      return new InvalidB58Checksum(data);
    }

    if (data.length !== HDKeyUtils.DataSize) {
      return new InvalidLength(data);
    }

    if (!isUndefined(network)) {
      let error = this._validateNetwork(data, network, isPrivate);
      if (error) {
        return error;
      }
    }
    
    if (!isPrivate) {
      let version = BufferUtils.integerFromBuffer(data.subarray(0, 4));
      if (version === networks.mainnet.xprivkey || version === networks.testnet.xprivkey ) {
        return new ArgumentIsPrivateExtended();
      }
    }
    
    return null;
  }
}