import ValidationUtils from "../utils/validation.utils";

export default class Base32 {
  /***
   * Charset containing the 32 symbols used in the base32 encoding.
   */
  private static readonly CHARSET = 'qpzry9x8gf2tvdw0s3jn54khce6mua7l';

  /***
   * Inverted index mapping each symbol into its index within the charset.
   */
  private static readonly CHARSET_INVERSE_INDEX = {
    'q': 0, 'p': 1, 'z': 2, 'r': 3, 'y': 4, '9': 5, 'x': 6, '8': 7,
    'g': 8, 'f': 9, '2': 10, 't': 11, 'v': 12, 'd': 13, 'w': 14, '0': 15,
    's': 16, '3': 17, 'j': 18, 'n': 19, '5': 20, '4': 21, 'k': 22, 'h': 23,
    'c': 24, 'e': 25, '6': 26, 'm': 27, 'u': 28, 'a': 29, '7': 30, 'l': 31,
  }

  /***
   * Encodes the given array of 5-bit integers as a base32-encoded string.
   *
   * @param data Array of integers between 0 and 31 inclusive.
   */
  public static encode(data: number[]): string {
    ValidationUtils.validateArgument(data instanceof Array, 'Must be Array');
    let base32 = '';
    data.forEach(value => {
      ValidationUtils.validateArgument(0 <= value && value < 32, 'value ' + value);
      base32 += this.CHARSET[value];
    });
    return base32;
  }

  /***
   * Decodes the given base32-encoded string into an array of 5-bit integers.
   *
   * @param base32 
   */
  public static decode(base32: string): number[] {
    ValidationUtils.validateArgument(typeof base32 === 'string', 'Must be base32-encoded string');
    let data: number[] = [];
    for (let value of base32) {
      ValidationUtils.validateArgument(value in this.CHARSET_INVERSE_INDEX, 'value '+ value);
      data.push(this.CHARSET_INVERSE_INDEX[value as keyof typeof this.CHARSET_INVERSE_INDEX]);
    }
    return data;
  }
}