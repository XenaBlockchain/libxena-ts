import { describe, expect, test } from "vitest";
import UnitUtils, { UnitType } from "../../src/utils/unit.utils";

describe('UnitUtils', () => {

  describe('formatUnits', () => {
    test('should format units with default decimals (2)', () => {
      const result = UnitUtils.formatUnits('1000');
      expect(result).toBe('10.00');
    });

    test('should format units with specified decimal unit (UnitType.MEX)', () => {
      const result = UnitUtils.formatUnits('100000000', UnitType.MEX);
      expect(result).toBe('1.00000000');
    });

    test('should format units with specified decimal number (5)', () => {
      const result = UnitUtils.formatUnits('100000', 5);
      expect(result).toBe('1.00000');
      const result2 = UnitUtils.formatUnits('100', 5);
      expect(result2).toBe('0.00100');
    });

    test('should throw an error for invalid unit', () => {
      expect(() => UnitUtils.formatUnits('1000', -1)).toThrow('invalid unit');
    });
  });

  describe('parseUnits', () => {
    test('should parse units with default decimals (2)', () => {
      const result = UnitUtils.parseUnits('10.00');
      expect(result).toBe(BigInt('1000'));
    });

    test('should parse units with specified decimal unit (UnitType.KEX)', () => {
      const result = UnitUtils.parseUnits('1.00000', UnitType.KEX);
      expect(result).toBe(BigInt('100000'));
    });

    test('should parse units with specified decimal number (5)', () => {
      const result = UnitUtils.parseUnits('1.00000', 5);
      expect(result).toBe(BigInt('100000'));
      const result2 = UnitUtils.parseUnits('0.001', 5);
      expect(result2).toBe(BigInt('100'));
    });

    test('should throw an error for invalid value type', () => {
      expect(() => UnitUtils.parseUnits(123 as any)).toThrow('must be a string');
    });

    test('should throw an error for invalid unit', () => {
      expect(() => UnitUtils.parseUnits('10.00', -1)).toThrow('invalid unit');
    });
  });

  describe('formatNEXA', () => {
    test('should format NEXA with 2 decimal places', () => {
      const result = UnitUtils.formatNEXA('1000');
      expect(result).toBe('10.00');
    });
  });

  describe('parseNEXA', () => {
    test('should parse NEXA with 2 decimal places', () => {
      const result = UnitUtils.parseNEXA('1');
      expect(result).toBe(BigInt('100'));
    });
  });
});