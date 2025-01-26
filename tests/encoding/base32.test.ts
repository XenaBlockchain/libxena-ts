import { describe, expect, test } from "vitest";
import Base32 from "../../src/encoding/base32";

describe('base32', () => {

  test('should encode 0-5', () => {
    let a = Base32.encode([0,1,2,3,4,5]);
    expect(a).toBe('qpzry9');
  });

  test('should encode 0-31', () => {
    let all=[];
    for(let i = 0; i < 32; i++) {
      all.push(i);
    }
    let a = Base32.encode(all);
    expect(a).toBe('qpzry9x8gf2tvdw0s3jn54khce6mua7l');
  });

  test('should fail to encode 35', () => {
    expect(() => Base32.encode([35])).toThrow('Invalid Argument: value 35');
  });

  test('should decode 0-31', () => {
    let a=  'qpzry9x8gf2tvdw0s3jn54khce6mua7lqpzry9x8gf2tvdw0s3jn54khce6mua7l';
    let all=[];
    for(let i = 0; i<32; i++) {
      all.push(i);
    }
    all=all.concat(all);
    expect(Base32.decode(a)).toEqual(all);
  });

  test('should fail decode abc', () => {
    let a=  'abc';
    expect(() => Base32.decode(a)).toThrow('Invalid Argument: value b');
  });

  test('should fail decode Q', () => {
    let a=  'aqQ';
    expect(() => Base32.decode(a)).toThrow('Invalid Argument: value Q');
  });

});