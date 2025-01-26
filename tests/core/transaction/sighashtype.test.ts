import { describe, expect, test } from "vitest";
import SighashType, { InputSighashType, OutputSighashType } from "../../../src/core/transaction/sighashtype";

describe("SighashType", () => {

  test("should make new instance with sign-all", () => {
    let sighash = new SighashType();
    expect(sighash.inType).toBe(InputSighashType.ALL);
    expect(sighash.outType).toBe(OutputSighashType.ALL);
    expect(sighash.inData).toEqual([]);
    expect(sighash.outData).toEqual([]);
  });

  test("should make new instance with ALL with sign-all", () => {
    let sighash = SighashType.ALL;
    expect(sighash.inType).toBe(InputSighashType.ALL);
    expect(sighash.outType).toBe(OutputSighashType.ALL);
    expect(sighash.inData).toEqual([]);
    expect(sighash.outData).toEqual([]);
    expect(sighash.hasAll()).toBe(true);

    let sighash2 = SighashType.ALL;
    expect(sighash === sighash2).toBe(false);
    expect(sighash2).toStrictEqual(sighash);

    let sighash3 = new SighashType();
    expect(sighash === sighash3).toBe(false);
    expect(sighash3).toStrictEqual(sighash);
  });

  describe("#set", () => {
    test("should set anyoneCanPay correctly", () => {
      let sighash = new SighashType().setAnyoneCanPay();
      expect(sighash.inType).toBe(InputSighashType.THISIN);
      expect(sighash.outType).toBe(OutputSighashType.ALL);
      expect(sighash.inData).toEqual([]);
      expect(sighash.outData).toEqual([]);
    });

    test("should set firstn-in correctly", () => {
      let sighash = new SighashType().setFirstNIn(1);
      expect(sighash.inType).toBe(InputSighashType.FIRSTN);
      expect(sighash.outType).toBe(OutputSighashType.ALL);
      expect(sighash.inData).toEqual([1]);
      expect(sighash.outData).toEqual([]);
    });

    test("should set firstn-out correctly", () => {
      let sighash = new SighashType().setFirstNOut(1);
      expect(sighash.inType).toBe(InputSighashType.ALL);
      expect(sighash.outType).toBe(OutputSighashType.FIRSTN);
      expect(sighash.inData).toEqual([]);
      expect(sighash.outData).toEqual([1]);
    });

    test("should set two-out correctly", () => {
      let sighash = new SighashType().set2Out(0, 1);
      expect(sighash.inType).toBe(InputSighashType.ALL);
      expect(sighash.outType).toBe(OutputSighashType.TWO);
      expect(sighash.inData).toEqual([]);
      expect(sighash.outData).toEqual([0, 1]);
    });

    test("should fail on non-uint8", () => {
      expect(() => new SighashType().setFirstNIn(-1)).toThrow("out of range");
      expect(() => new SighashType().setFirstNIn(300)).toThrow("out of range");
      expect(() => new SighashType().setFirstNOut(-1)).toThrow("out of range");
      expect(() => new SighashType().setFirstNOut(300)).toThrow("out of range");
      expect(() => new SighashType().set2Out(-1, 1)).toThrow("out of range");
      expect(() => new SighashType().set2Out(1, -1)).toThrow("out of range");
      expect(() => new SighashType().set2Out(1, 300)).toThrow("out of range");
      expect(() => new SighashType().set2Out(300, 1)).toThrow("out of range");
    });
  });

  describe("#toBuffer", () => {

    test("should fail on missing data", () => {
      let sighash = new SighashType();
      sighash.inType = InputSighashType.FIRSTN;
      expect(() => sighash.toBuffer()).toThrow("Missing input data");

      let sighash2 = new SighashType();
      sighash2.outType = OutputSighashType.FIRSTN;
      expect(() => sighash2.toBuffer()).toThrow("Missing output data");

      let sighash3 = new SighashType();
      sighash3.outType = OutputSighashType.TWO;
      expect(() => sighash3.toBuffer()).toThrow("Missing output data");
      sighash3.outData = [2];
      expect(() => sighash3.toBuffer()).toThrow("Missing output data");
    });

    test("should fail on invalid type", () => {
      let sighash = new SighashType();
      sighash.inType = 4 as any;
      expect(() => sighash.toBuffer()).toThrow("Malformed sighash type");

      let sighash2 = new SighashType();
      sighash2.outType = 4 as any;
      expect(() => sighash2.toBuffer()).toThrow("Malformed sighash type");
    });

    test("should return empty buffer for ALL", () => {
      expect(new SighashType().toBuffer()).toEqual(Buffer.alloc(0));
      expect(SighashType.ALL.toBuffer()).toEqual(Buffer.alloc(0));
    });

    test("should return empty buffer for ALL", () => {
      expect(new SighashType().toBuffer()).toEqual(Buffer.alloc(0));
      expect(SighashType.ALL.toBuffer()).toEqual(Buffer.alloc(0));
    });

    test("should serialize all-out correctly", () => {
      expect(new SighashType().setAnyoneCanPay().toBuffer()).toEqual(Buffer.from([0x20]));
      expect(new SighashType().setFirstNIn(1).toBuffer()).toEqual(Buffer.from([0x10, 0x01]));
    });

    test("should serialize all-in types correctly", () => {
      expect(new SighashType().setFirstNOut(2).toBuffer()).toEqual(Buffer.from([0x01, 0x02]));
      expect(new SighashType().set2Out(1, 2).toBuffer()).toEqual(Buffer.from([0x02, 0x01, 0x02]));
    });

    test("should serialize combinations correctly", () => {
      expect(new SighashType().setAnyoneCanPay().setFirstNOut(3).toBuffer()).toEqual(Buffer.from([0x21, 0x03]));
      expect(new SighashType().setAnyoneCanPay().set2Out(1, 2).toBuffer()).toEqual(Buffer.from([0x22, 0x01, 0x02]));
      expect(new SighashType().setFirstNIn(4).setFirstNOut(3).toBuffer()).toEqual(Buffer.from([0x11, 0x04, 0x03]));
      expect(new SighashType().setFirstNIn(4).set2Out(1, 2).toBuffer()).toEqual(Buffer.from([0x12, 0x04, 0x01, 0x02]));
    });
  });

  describe("#fromBuffer", () => {

    test("should fail on invalid type", () => {
      expect(() => SighashType.fromBuffer(undefined as any)).toThrow();
      expect(() => SighashType.fromBuffer(3 as any)).toThrow();
      expect(() => SighashType.fromBuffer(Buffer.from([0x31]))).toThrow("Invalid sighash buffer");
      expect(() => SighashType.fromBuffer(Buffer.from([0x13]))).toThrow("Invalid sighash buffer");
    });

    test("should fail on wrong length buffer", () => {
      expect(() => SighashType.fromBuffer(Buffer.from([0x11, 0x01, 0x01, 0x01]))).toThrow("Invalid sighash buffer");
      expect(() => SighashType.fromBuffer(Buffer.from([0x11]))).toThrow("Invalid sighash buffer");
    });

    test("should parse these buffers correctly", () => {
      expect(SighashType.fromBuffer(Buffer.alloc(0))).toStrictEqual(new SighashType());
      expect(SighashType.fromBuffer(Buffer.from([]))).toStrictEqual(new SighashType());
      expect(SighashType.fromBuffer(Buffer.from([0x20]))).toStrictEqual(new SighashType().setAnyoneCanPay());
      expect(SighashType.fromBuffer(Buffer.from([0x10, 0x01]))).toStrictEqual(new SighashType().setFirstNIn(1));
      expect(SighashType.fromBuffer(Buffer.from([0x01, 0x02]))).toStrictEqual(new SighashType().setFirstNOut(2));
      expect(SighashType.fromBuffer(Buffer.from([0x02, 0x01, 0x02]))).toStrictEqual(new SighashType().set2Out(1, 2));
      expect(SighashType.fromBuffer(Buffer.from([0x21, 0x03]))).toStrictEqual(new SighashType().setAnyoneCanPay().setFirstNOut(3));
      expect(SighashType.fromBuffer(Buffer.from([0x22, 0x01, 0x02]))).toStrictEqual(new SighashType().setAnyoneCanPay().set2Out(1, 2));
      expect(SighashType.fromBuffer(Buffer.from([0x11, 0x04, 0x03]))).toStrictEqual(new SighashType().setFirstNIn(4).setFirstNOut(3));
      expect(SighashType.fromBuffer(Buffer.from([0x12, 0x04, 0x01, 0x02]))).toStrictEqual(new SighashType().setFirstNIn(4).set2Out(1, 2));
    });
  });

  describe("#hex", () => {
    test("should convert to hex correctly", () => {
      expect(SighashType.ALL.toHex()).toBe("");
      expect(new SighashType().setAnyoneCanPay().set2Out(1, 2).toHex()).toBe("220102");
    });

    test("should parse this hex correctly", () => {
      expect(SighashType.fromHex("")).toStrictEqual(SighashType.ALL);
      expect(SighashType.fromHex("110403")).toStrictEqual(new SighashType().setFirstNIn(4).setFirstNOut(3));
    });

    test("should roundtrip from/to hex", () =>{
      let hex = new SighashType().setFirstNIn(4).setFirstNOut(3).toHex();
      let sig = SighashType.fromHex(hex);
      expect(sig.toHex()).toBe(hex);
    });

    test("should fail on non-hex", () => {
      expect(() => SighashType.fromHex("hello world")).toThrow("Not a hex string");
      expect(() => SighashType.fromHex(undefined as any)).toThrow("Not a hex string");
      expect(() => SighashType.fromHex(6 as any)).toThrow("Not a hex string");
    });
  });

  describe("#toString", () => {
    test("should convert to string correctly", () => {
      expect(SighashType.ALL.toString()).toBe("ALL");
      expect(new SighashType().setAnyoneCanPay().toString()).toBe("THIS_IN|ALL_OUT");
      expect(new SighashType().setFirstNIn(1).toString()).toBe("FIRST_1_IN|ALL_OUT");
      expect(new SighashType().setFirstNOut(2).toString()).toBe("ALL_IN|FIRST_2_OUT");
      expect(new SighashType().set2Out(1, 2).toString()).toBe("ALL_IN|1_2_OUT");
      expect(new SighashType().setAnyoneCanPay().setFirstNOut(3).toString()).toBe("THIS_IN|FIRST_3_OUT");
      expect(new SighashType().setAnyoneCanPay().set2Out(1, 2).toString()).toBe("THIS_IN|1_2_OUT");
      expect(new SighashType().setFirstNIn(4).setFirstNOut(3).toString()).toBe("FIRST_4_IN|FIRST_3_OUT");
      expect(new SighashType().setFirstNIn(4).set2Out(1, 2).toString()).toBe("FIRST_4_IN|1_2_OUT");
    });

    test("should return invalid on unknown types", () => {
      let sighash = new SighashType();
      sighash.inType = 4 as any;
      expect(sighash.toString()).toBe("INVALID");

      let sighash2 = new SighashType();
      sighash2.outType = 4 as any;
      expect(sighash2.toString()).toBe("INVALID");
    });
  });

  describe("#fromString", () => {
    test("should convert from string correctly", () => {
      expect(SighashType.fromString("ALL")).toStrictEqual(SighashType.ALL);
      expect(SighashType.fromString("THIS_IN|ALL_OUT")).toStrictEqual(new SighashType().setAnyoneCanPay());
      expect(SighashType.fromString("FIRST_1_IN|ALL_OUT")).toStrictEqual(new SighashType().setFirstNIn(1));
      expect(SighashType.fromString("ALL_IN|FIRST_2_OUT")).toStrictEqual(new SighashType().setFirstNOut(2));
      expect(SighashType.fromString("ALL_IN|1_2_OUT")).toStrictEqual(new SighashType().set2Out(1, 2));
      expect(SighashType.fromString("THIS_IN|FIRST_3_OUT")).toStrictEqual(new SighashType().setAnyoneCanPay().setFirstNOut(3));
      expect(SighashType.fromString("THIS_IN|1_2_OUT")).toStrictEqual(new SighashType().setAnyoneCanPay().set2Out(1, 2));
      expect(SighashType.fromString("FIRST_4_IN|FIRST_3_OUT")).toStrictEqual(new SighashType().setFirstNIn(4).setFirstNOut(3));
      expect(SighashType.fromString("FIRST_4_IN|1_2_OUT")).toStrictEqual(new SighashType().setFirstNIn(4).set2Out(1, 2));
    });

    test("should fail on invalid string", () => {
      expect(() => SighashType.fromString(4 as any)).toThrow("Not a string");
      expect(() => SighashType.fromString("THIS_IN")).toThrow("Not a sighash string");
      expect(() => SighashType.fromString("FIRST_1_OUT|ALL_OUT")).toThrow("Not a sighash string");
      expect(() => SighashType.fromString("FIRST_S_IN|ALL_OUT")).toThrow("Not a sighash string");
      expect(() => SighashType.fromString("SOME|ALL_OUT")).toThrow("Not a sighash string");
      expect(() => SighashType.fromString("ALL_IN|SOME")).toThrow("Not a sighash string");
      expect(() => SighashType.fromString("ALL_IN|FIRST_S_OUT")).toThrow("Not a sighash string");
      expect(() => SighashType.fromString("ALL_IN|FIRST_1_IN")).toThrow("Not a sighash string");
      expect(() => SighashType.fromString("ALL_IN|1_S_OUT")).toThrow("Not a sighash string");
      expect(() => SighashType.fromString("ALL_IN|G_1_OUT")).toThrow("Not a sighash string");
    });
  });
});