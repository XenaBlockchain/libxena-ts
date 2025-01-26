import { describe, expect, test } from "vitest";
import BufferUtils from "../../src/utils/buffer.utils";

test('check fill', () => {
  expect(BufferUtils.fill(Buffer.from([0,0,0]), 3)).toEqual(Buffer.from([3,3,3]));
  expect(() => BufferUtils.fill(Buffer.from([0,0,0]), "3" as any)).toThrow("Invalid Argument");
  expect(() => BufferUtils.fill("abc" as any, 3)).toThrow("Invalid Argument");
})

test('check copy', () => {
  expect(BufferUtils.copy(Buffer.from([0,0,0]))).toEqual(Buffer.from([0,0,0]));
})

test('check isBuffer', () => {
  expect(BufferUtils.isBuffer(Buffer.from([3]))).true;
  expect(BufferUtils.isBuffer(new Uint8Array())).true;
  expect(BufferUtils.isBuffer([])).false;
})

test('check emptyBuffer', () => {
  expect(BufferUtils.emptyBuffer(3)).toEqual(Buffer.from([0,0,0]));
  expect(() => BufferUtils.emptyBuffer("abc" as any)).toThrow("Invalid Argument");
})

test('check reverse', () => {
  expect(BufferUtils.reverse(Buffer.from([1,2,3]))).toEqual(Buffer.from([3,2,1]));
})

test('check bufferToHex', () => {
  expect(BufferUtils.bufferToHex(Buffer.from([1,2,3]))).toBe("010203");
  expect(() => BufferUtils.bufferToHex("abc" as any)).toThrow("Invalid Argument");
})

test('check integerAsSingleByteBuffer', () => {
  expect(BufferUtils.integerAsSingleByteBuffer(3)).toEqual(Buffer.from([3]));
  expect(() => BufferUtils.integerAsSingleByteBuffer("abc" as any)).toThrow("Invalid Argument");
})

test('check integerFromSingleByteBuffer', () => {
  expect(BufferUtils.integerFromSingleByteBuffer(Buffer.from([3]))).toBe(3);
  expect(BufferUtils.integerFromSingleByteBuffer(Buffer.from([1,2,3]))).toBe(1);
  expect(() => BufferUtils.integerFromSingleByteBuffer("abc" as any)).toThrow("Invalid Argument");
})

test('check integerAsBuffer', () => {
  expect(BufferUtils.integerAsBuffer(6)).toEqual(Buffer.from([0,0,0,6]));
  expect(BufferUtils.integerAsBuffer(0xFFFFFFFF)).toEqual(Buffer.from([255,255,255,255]));
  expect(() => BufferUtils.integerAsBuffer(BigInt(Number.MAX_VALUE) as any)).toThrow("Invalid Argument");
})

test('check integerFromBuffer', () => {
  expect(BufferUtils.integerFromBuffer(Buffer.from([0,0,0,6]))).toBe(6);
  expect(BufferUtils.integerFromBuffer(Buffer.from([127,255,255,255]))).toBe(0x7FFFFFFF);
  expect(() => BufferUtils.integerAsBuffer("aa" as any)).toThrow("Invalid Argument");
})

describe('isHashBuffer', () => {
  test('should return true for a buffer with length 20', () => {
    let buffer = Buffer.alloc(20);
    expect(BufferUtils.isHashBuffer(buffer)).toBe(true);
  });

  test('should return true for a buffer with length 32', () => {
    let buffer = Buffer.alloc(32);
    expect(BufferUtils.isHashBuffer(buffer)).toBe(true);
  });

  test('should return false for a buffer with a length other than 20 or 32', () => {
    let buffer = Buffer.alloc(10);
    expect(BufferUtils.isHashBuffer(buffer)).toBe(false);
  });

  test('should return false for a non-buffer object', () => {
    let nonBuffer = { length: 20 };
    expect(BufferUtils.isHashBuffer(nonBuffer)).toBe(false);
  });

  test('should return false for null', () => {
    let value = null;
    expect(BufferUtils.isHashBuffer(value)).toBe(false);
  });

  test('should return false for undefined', () => {
    let value = undefined;
    expect(BufferUtils.isHashBuffer(value)).toBe(false);
  });

  test('should return false for a string', () => {
    let string = 'this is not a buffer';
    expect(BufferUtils.isHashBuffer(string)).toBe(false);
  });

  test('should return false for a number', () => {
    let value = 12345;
    expect(BufferUtils.isHashBuffer(value)).toBe(false);
  });

  test('should return false for an array', () => {
    let array = [1, 2, 3, 4, 5];
    expect(BufferUtils.isHashBuffer(array)).toBe(false);
  });
});

describe('@getRandomBuffer', () => {
  test('should return a buffer', () => {
    let bytes = BufferUtils.getRandomBuffer(8);
    expect(bytes.length).toBe(8);
    expect(Buffer.isBuffer(bytes)).true;
  });

  test('should not equate two 256 bit random buffers', () => {
    let bytes1 = BufferUtils.getRandomBuffer(32);
    let bytes2 = BufferUtils.getRandomBuffer(32);
    expect(bytes1.toString('hex')).not.toBe(bytes2.toString('hex'));
  });

  test('should generate 100 8 byte buffers in a row that are not equal', () => {
    let hexs: string[] = [];
    for (let i = 0; i < 100; i++) {
      hexs[i] = BufferUtils.getRandomBuffer(8).toString('hex');
    }
    for (let i = 0; i < 100; i++) {
      for (let j = i + 1; j < 100; j++) {
        expect(hexs[i]).not.toBe(hexs[j]);
      }
    }
  });
});