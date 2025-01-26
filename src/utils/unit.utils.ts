import { isInteger, isNil, isString } from "lodash-es";
import type { BigNumberish } from "../common/types";
import ValidationUtils from "./validation.utils";
import bigDecimal from "js-big-decimal";

export enum UnitType {
  MEX = 8,
  KEX = 5,
  NEXA = 2
}

/**
 * Utility for handling and converting nexa units.
 * You can consult for different representation of a unit using it's
 * {format} method or the fixed unit methods like {parse}.
 *
 * @example
 * ```ts
 * let nex = UnitUtils.formatNEXA(546); // "5.46"
 * let sats = UnitUtils.parseNEXA("5.46"); // 546n
 * let mex = UnitUtils.formatUnits(100000000, UnitType.MEX) // "1.00000000";
 * let units = UnitUtils.parseUnits('1.0', 5); // 100000n
 * ```
 */
export default class UnitUtils {

  /**
   *  Converts `value` into a decimal string, assuming `unit` decimal
   *  places. The `unit` may be the number of decimal places or the enum of
   *  a unit (e.g. ``UnitType.MEX`` for 8 decimal places).
   *
   */
  public static formatUnits(value: BigNumberish, unit?: UnitType | number): string {
    let decimals = 2;
    if (!isNil(unit)) {
      ValidationUtils.validateArgument(isInteger(unit) && unit >= 0, "unit", "invalid unit");
      decimals = unit;
    }

    return bigDecimal.divide(value, Math.pow(10, decimals), decimals);
  }

  /**
  *  Converts the decimal string `value` to a BigInt, assuming
  *  `unit` decimal places. The `unit` may the number of decimal places
  *  or the name of a unit (e.g. ``UnitType.KEX`` for 5 decimal places).
  */
  public static parseUnits(value: string, unit?: UnitType | number): bigint {
    ValidationUtils.validateArgument(isString(value), "value", "must be a string");
    let decimals = 2;
    if (!isNil(unit)) {
      ValidationUtils.validateArgument(isInteger(unit) && unit >= 0, "unit", "invalid unit");
      decimals = unit;
    }

    return BigInt(bigDecimal.multiply(value, Math.pow(10, decimals)));
  }

  /**
  *  Converts `value` into a decimal string using 2 decimal places.
  */
  public static formatNEXA(sats: BigNumberish): string {
    return this.formatUnits(sats, UnitType.NEXA);
  }

  /**
  *  Converts the decimal string `NEXA` to a BigInt, using 2 decimal places.
  */
  public static parseNEXA(nexa: string): bigint {
    return this.parseUnits(nexa, UnitType.NEXA);
  }
}