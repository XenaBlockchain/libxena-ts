import { describe, expect, test } from "vitest";
import CommonUtils from "../../src/utils/common.utils";

describe('isHexa', () => {
  test('does not mistake an integer as valid hexa', () => {
    expect(CommonUtils.isHexa(3 as any)).false;
  });

  test('correctly validates a hexa string', () => {
    expect(CommonUtils.isHexa("abcd")).true;
  });

  test('false on non-hexa string', () => {
    expect(CommonUtils.isHexa("abc")).false;
    expect(CommonUtils.isHexa("abct")).false;
  });
});

describe('isValidJSON', () => {
  let hexa = 0x80808;
  let json = '{"key": ["value", "value2"]}';
  let json2 = '["value", "value2", {"key": "value"}]';

  test('does not mistake an integer as valid json object', () => {
    let valid = CommonUtils.isValidJSON(hexa as any);
    expect(valid).false;
  });

  test('correctly validates a json object', () => {
    let valid = CommonUtils.isValidJSON(json);
    expect(valid).toBeInstanceOf(Object);
  });

  test('correctly validates an array json object', () => {
    let valid = CommonUtils.isValidJSON(json2);
    expect(valid).toBeInstanceOf(Object);
  });

  test('correctly validates wrong json format', () => {
    let valid = CommonUtils.isValidJSON(json2.substring(1));
    expect(valid).false;
  });
});

test('cloneArray', () => {
  expect(CommonUtils.cloneArray([1,2,3])).toEqual([1,2,3]);
});

describe('isNaturalNumber', () => {
  test('false for float', () => {
    let a = CommonUtils.isNaturalNumber(0.1);
    expect(a).false;
  });

  test('false for string float', () => {
    let a = CommonUtils.isNaturalNumber('0.1' as any);
    expect(a).false;
  });

  test('false for string integer', () => {
    let a = CommonUtils.isNaturalNumber('1' as any);
    expect(a).false;
  });

  test('false for negative integer', () => {
    let a = CommonUtils.isNaturalNumber(-1);
    expect(a).false;
  });

  test('false for negative integer string', () => {
    let a = CommonUtils.isNaturalNumber('-1' as any);
    expect(a).false;
  });

  test('false for infinity', () => {
    let a = CommonUtils.isNaturalNumber(Infinity);
    expect(a).false;
  });

  test('false for NaN', () => {
    let a = CommonUtils.isNaturalNumber(NaN);
    expect(a).false;
  });

  test('true for zero', () => {
    let a = CommonUtils.isNaturalNumber(0);
    expect(a).true;
  });

  test('true for positive integer', () => {
    let a = CommonUtils.isNaturalNumber(1000);
    expect(a).true;
  });

  describe('isNaturalBigInt', () => {
    test('false for negative integer', () => {
      let a = CommonUtils.isNaturalBigInt(-1n);
      expect(a).false;
    });
  
    test('false for non bigint', () => {
      let a = CommonUtils.isNaturalBigInt('-1' as any);
      expect(a).false;
    });
  
    test('false for infinity', () => {
      let a = CommonUtils.isNaturalBigInt(Infinity as any);
      expect(a).false;
    });
  
    test('false for NaN', () => {
      let a = CommonUtils.isNaturalBigInt(NaN as any);
      expect(a).false;
    });

    test('true for zero', () => {
      let a = CommonUtils.isNaturalBigInt(0n);
      expect(a).true;
    });
  
    test('true for positive integer', () => {
      let a = CommonUtils.isNaturalBigInt(1000n);
      expect(a).true;
    });
  });
});