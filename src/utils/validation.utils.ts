import { isString } from 'lodash-es';

type Class<T> = new (...args: any[]) => T; // eslint-disable-line @typescript-eslint/no-explicit-any

export default class ValidationUtils {

  public static validateState(condition: boolean, message: string): void {
    if (!condition) {
      throw new Error(`Invalid State: ${message}`);
    }
  }

  public static validateArgument(condition: boolean, argumentName: string, message = ""): void {
    if (!condition) {
      throw new Error(`Invalid Argument: ${argumentName}. ${message}`);
    }
  }

  public static validateArgumentType<T>(argument: unknown, type: string | Class<T>, argumentName?: string): void {
    argumentName = argumentName || '(unknown name)';
    if (isString(type)) {
      if (type === 'Buffer') {
        if (!Buffer.isBuffer(argument)) {        
            throw new TypeError(`Invalid Argument for ${argumentName}, expected ${type} but got ${typeof argument}`);
        }
      } else if (typeof argument !== type) {
        throw new TypeError(`Invalid Argument for ${argumentName}, expected ${type} but got ${typeof argument}`);
      }
    } else {
      if (!(argument instanceof type)) {
        throw new TypeError(`Invalid Argument for ${argumentName}, expected ${type} but got ${typeof argument}`);
      }
    }
  }
}
