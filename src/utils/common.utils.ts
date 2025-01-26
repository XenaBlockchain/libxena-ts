import { isString } from "lodash-es";

export default class CommonUtils {

  /**
   * Determines whether a string contains only hexadecimal values
   * 
   * @param value
   * @returns true if the string is the hexa representation of a number
   */
  public static isHexa(value: string): boolean {
    return isString(value) && value.length % 2 === 0 && /^[0-9a-fA-F]+$/.test(value);
  }

  /**
   * Test if an argument is a valid JSON object. If it is, returns a truthy
   * value (the json object decoded), so no double JSON.parse call is necessary
   *
   * @param arg
   * @return false if the argument is not a JSON string.
   */
  public static isValidJSON(arg: string): object | boolean {
    if (!isString(arg)) {
      return false;
    }

    try {
      return JSON.parse(arg);
    } catch {
      return false;
    }
  }

  public static cloneArray<T>(array: T[]): T[] {
    return [...array];
  }

  /**
   * Checks that a value is a natural number.
   *
   * @param value
   * @return true if a positive integer or zero.
   */
  public static isNaturalNumber(value: number): boolean {
    return typeof value === 'number' &&
      isFinite(value) &&
      Math.floor(value) === value &&
      value >= 0;
  }

  /**
   * Checks that a value is a natural number.
   *
   * @param value
   * @return true if a positive integer or zero.
   */
  public static isNaturalBigInt(value: bigint): boolean {
    return typeof value === 'bigint' && value >= 0n;
  }
}