import Base32 from "../../encoding/base32";
import BufferUtils from "../../utils/buffer.utils";
import ValidationUtils from "../../utils/validation.utils";

export enum AddressType {
  PayToPublicKeyHash = 'P2PKH',
  PayToScriptTemplate = 'P2ST',
  GroupIdAddress = 'GROUP'
}

interface AddressParts {
  prefix: string;
  type: AddressType;
  data: Buffer;
}

export default class AddressFormatter {

  private static readonly VALID_PREFIXES = ['nexa', 'nexatest'];
  
  /** @see encodeAddress */
  public static encode(prefix: string, type: AddressType, data: Buffer): string {
    return this.encodeAddress({ prefix, type, data })
  }

  /**
   * Encodes a hash from a given type into a Nexa address with the given prefix.
   *
   * @param address Object contains Network prefix (E.g.: 'nexa'), Type of address to generate and data to encode.
   */
  public static encodeAddress(address: AddressParts): string {
    ValidationUtils.validateArgument(typeof address.prefix === 'string' && this.isValidPrefix(address.prefix), 'Invalid prefix: ' + address.prefix + '.');
    ValidationUtils.validateArgument(typeof address.type === 'string', 'Invalid type: ' + address.type + '.');
    ValidationUtils.validateArgument(BufferUtils.isBuffer(address.data), 'Invalid data: ' + address.data + '.');

    let eight0 = [0,0,0,0, 0,0,0,0];
    let prefixData = this.prefixToArray(address.prefix).concat([0]);
    let versionByte = this.getTypeBits(address.type);
    let payloadData = this.convertBits(Buffer.concat([Buffer.from([versionByte]), address.data]), 8, 5);
    let checksumData = prefixData.concat(payloadData).concat(eight0);
    let payload = payloadData.concat(this.checksumToArray(this.polymod(checksumData)));
    return address.prefix + ':' + Base32.encode(payload);
  }

  /**
   * Decodes the given address into its constituting prefix, type and data. See {@link encodeAddress}.
   *
   * @param {string} address Address to decode. E.g.: 'nexa:qpm2qsznhks23z7629mms6s4cwef74vcwvgpsey0xy'.
   */
  public static decode(address: string): AddressParts {
    ValidationUtils.validateArgument(typeof address === 'string' && this.hasSingleCase(address), 'Invalid address: ' + address + '.');

    let pieces = address.toLowerCase().split(':');
    ValidationUtils.validateState(pieces.length === 2, 'Missing prefix: ' + address + '.');
    
    let prefix = pieces[0];
    let payload = Base32.decode(pieces[1]);
    ValidationUtils.validateState(this.validChecksum(prefix, payload), 'Invalid checksum: ' + address + '.');

    let convertedBits = this.convertBits(payload.slice(0, -8), 5, 8, true);
    let versionByte = convertedBits.shift();
    let hash = convertedBits;
    // no length limits in nexa: validate(getHashSize(versionByte) === hash.length * 8, 'Invalid hash size: ' + address + '.');
    let type = this.getType(versionByte!);
    
    return {
      prefix: prefix,
      type: type,
      data: Buffer.from(hash),
    };
  }

  /**
   * Checks whether a string is a valid prefix; ie., it has a single letter case
   * and is one of the above.
   * 
   * @param prefix
   */
  private static isValidPrefix(prefix: string): boolean {
    return this.hasSingleCase(prefix) && this.VALID_PREFIXES.includes(prefix.toLowerCase());
  }

  /**
   * Derives an array from the given prefix to be used in the computation
   * of the address' checksum.
   *
   * @param prefix Network prefix. E.g.: 'nexa'.
   */
  private static prefixToArray(prefix: string): number[] {
    let result: number[] = [];
    for (let i = 0; i < prefix.length; ++i) {
      result.push(prefix.charCodeAt(i) & 31);
    }
    return result;
  }

  /**
   * Returns an array representation of the given checksum to be encoded
   * within the address' payload.
   *
   * @param checksum Computed checksum.
   */
  private static checksumToArray(checksum: number): number[] {
    let result: number[] = [];
    for (let i = 0; i < 8; ++i) {
      result.push(checksum & 31);
      checksum /= 32;
    }
    return result.reverse();
  }

  /**
   * Returns the bit representation of the given type within the version byte.
   *
   * @param type Address type. Either 'P2PKH' or 'P2SH'.
   */
  private static getTypeBits(type: AddressType): number {
    switch (type) {
      case AddressType.PayToPublicKeyHash:
        return 0;
      case AddressType.PayToScriptTemplate:
        return 19<<3;
      case AddressType.GroupIdAddress:
        return 11<<3;
      default:
        throw new TypeError('Invalid type: ' + type + '.');
    }
  }

  /**
   * Retrieves the address type from its bit representation within the
   * version byte.
   *
   * @param versionByte
   */
  private static getType(versionByte: number): AddressType {
    switch (versionByte & 248) {
      case 0:
        return AddressType.PayToPublicKeyHash;
      case 19<<3:
        return AddressType.PayToScriptTemplate;
      case 11<<3:
        return AddressType.GroupIdAddress;
      default:
        throw new Error('Invalid address type in version byte: ' + versionByte + '.');
    }
  }

  /**
   * Returns true if, and only if, the given string contains either uppercase
   * or lowercase letters, but not both.
   *
   * @param string Input string.
   */
  private static hasSingleCase(string: string): boolean {
    return string === string.toLowerCase() || string === string.toUpperCase();
  }

  /**
  * Verify that the payload has not been corrupted by checking that the
  * checksum is valid.
  *
  * @param prefix Network prefix. E.g.: 'nexa'.
  * @param payload Array of 5-bit integers containing the address' payload.
  */
  private static validChecksum(prefix: string, payload: number[]): boolean {
    let prefixData = this.prefixToArray(prefix).concat([0]);
    return this.polymod(prefixData.concat(payload)) === 0;
  }

  /**
   * Computes a checksum from the given input data as specified for the CashAddr
   * format: https://github.com/Bitcoin-UAHF/spec/blob/master/cashaddr.md.
   *
   * @param data Array of 5-bit integers over which the checksum is to be computed.
   */
  private static polymod(data: number[]): number {
    let GENERATOR1 = [0x98, 0x79, 0xf3, 0xae, 0x1e];
    let GENERATOR2 = [0xf2bc8e61, 0xb76d99e2, 0x3e5fb3c4, 0x2eabe2a8, 0x4f43e470];
    // Treat c as 8 bits + 32 bits
    let c0 = 0, c1 = 1, C = 0;
    for (let j = 0; j < data.length; j++) {
      // Set C to c shifted by 35
      C = c0 >>> 3;
      // 0x[07]ffffffff
      c0 &= 0x07;
      // Shift as a whole number
      c0 <<= 5;
      c0 |= c1 >>> 27;
      // 0xffffffff >>> 5
      c1 &= 0x07ffffff;
      c1 <<= 5;
      // xor the last 5 bits
      c1 ^= data[j];
      for (let i = 0; i < GENERATOR1.length; ++i) {
        if (C & (1 << i)) {
          c0 ^= GENERATOR1[i];
          c1 ^= GENERATOR2[i];
        }
      }
    }
    c1 ^= 1;
    // Negative numbers -> large positive numbers
    if (c1 < 0) {
      c1 ^= 1 << 31;
      c1 += (1 << 30) * 2;
    }
    // Unless bitwise operations are used,
    // numbers are consisting of 52 bits, except
    // the sign bit. The result is max 40 bits,
    // so it fits perfectly in one number!
    return c0 * (1 << 30) * 4 + c1;
  }

  /**
   * Converts an array of integers made up of `from` bits into an
   * array of integers made up of `to` bits. The output array is
   * zero-padded if necessary, unless strict mode is true.
   * Original by Pieter Wuille: https://github.com/sipa/bech32.
   *
   * @param data Array of integers made up of `from` bits.
   * @param from Length in bits of elements in the input array.
   * @param to Length in bits of elements in the output array.
   * @param strict Require the conversion to be completed without padding.
   */
  private static convertBits(data: Buffer | number[], from: number, to: number, strict = false): number[] {
    let accumulator = 0;
    let bits = 0;
    let result = [];
    let mask = (1 << to) - 1;
    for (let i=0; i<data.length; i++) {
      let value = data[i];
      ValidationUtils.validateArgument(!(value < 0 || (value >> from) !== 0), 'value ' + value);
  
      accumulator = (accumulator << from) | value;
      bits += from;
      while (bits >= to) {
        bits -= to;
        result.push((accumulator >> bits) & mask);
      }
    }
    if (!strict) {
      if (bits > 0) {
        result.push((accumulator << (to - bits)) & mask);
      }
    } else {
      ValidationUtils.validateState(!(bits >= from || ((accumulator << (to - bits)) & mask)),  'Conversion requires padding but strict mode was used');
    }
    return result;
  }
}