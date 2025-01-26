import { expect, test } from "vitest";
import ValidationUtils from "../../src/utils/validation.utils";
import Base58 from "../../src/encoding/base58";

test('can be used to assert state', () => {
  expect(() => ValidationUtils.validateState(false, 'testing')).toThrow("Invalid State");
});

test('throws no false negative', () => {
  expect(() => ValidationUtils.validateState(true, 'testing')).not.toThrow();
});

test('can be used to check an argument', () => {
  expect(() => ValidationUtils.validateArgument(false, 'testing')).toThrow("Invalid Argument");
  expect(() => ValidationUtils.validateArgument(true, 'testing')).not.toThrow("Invalid Argument");
});

test('can be used to check an argument type', () => {
  let error;
  try {
    ValidationUtils.validateArgumentType(1, 'string', 'argumentName');
  } catch (e) {
    error = e as Error;
    expect(error.message).toBe('Invalid Argument for argumentName, expected string but got number');
  }
  expect(error).toBeDefined();
});

test('has no false negatives when used to check an argument type', () => {
  expect(() => ValidationUtils.validateArgumentType('a String', 'string', 'argumentName')).not.toThrow();
});

test('can be used to check an argument type for a class', () => {
  let error;
  try {
    ValidationUtils.validateArgumentType(1, Base58);
  } catch (e) {
    error = e as Error;
    let fail = !(~error.message.indexOf('Invalid Argument for (unknown name)'));
    expect(fail).toBeFalsy();
  }
  expect(error).toBeDefined();
});

test('has no false negatives when checking a type for a class', () => {
  expect(() => ValidationUtils.validateArgumentType(new Base58("1234"), Base58)).not.toThrow();
});

test('formats correctly a message on checkArgument', () => {
  let error: any;
  try {
    ValidationUtils.validateArgument(null as any, 'parameter must be provided');
  } catch (e) {
    error = e;
  }
  expect(error.message).toBe('Invalid Argument: parameter must be provided. ');
});
