import { describe, expect, test } from "vitest";
import Output, { OutputType } from "../../../src/core/transaction/output";
import Script from "../../../src/core/script/script";
import BufferWriter from "../../../src/encoding/bufferwriter";
import BufferReader from "../../../src/encoding/bufferreader";

describe("Output", () => {
  let output = Output.fromObject({
    type: 1,
    value: 0n,
    scriptPubKey: Script.empty()
  });

  test("throws error with unrecognized argument", () => {
    expect(() => Output.fromObject(12345 as any)).toThrow("Unrecognized argument for Output");
  });

  test("should determine type by script if not provided or infer", () => {
    let out = new Output(output.value, output.scriptPubKey);
    expect(out.type).toBe(0);

    out = new Output(output.value, output.scriptPubKey, OutputType.INFER);
    expect(out.type).toBe(0);

    out = new Output(output.value, output.scriptPubKey, OutputType.SATOSCRIPT);
    expect(out.type).toBe(0);

    out = new Output(output.value, output.scriptPubKey, OutputType.TEMPLATE);
    expect(out.type).toBe(1);

    let data = new Script('OP_RETURN 9 0xbacacafe0102030405');
    out = new Output(output.value, data);
    expect(out.type).toBe(0);

    let p2pkh = new Script('OP_DUP OP_HASH160 20 0x76a04053bda0a88bda5177b86a15c3b29f559873 OP_EQUALVERIFY OP_CHECKSIG');
    out = new Output(output.value, p2pkh);
    expect(out.type).toBe(0);

    let p2pkt = new Script('OP_0 OP_1 20 0x0ef8c2437bbc4e9c33204da957e7035681840ea6');
    out = new Output(output.value, p2pkt);
    expect(out.type).toBe(1);

    let groupedP2pkt = new Script('32 0x45ba89c8bce3be42b88ad80f65c99e07d6d39541c5d6c5f05efa1e44b6980000 2 0x6400 OP_1 20 0x8893d89b4be527f4ea018ca1105ba58dfcdea42c');
    out = new Output(output.value, groupedP2pkt);
    expect(out.type).toBe(1);

    let p2st = new Script('OP_0 20 0x461ad25081cb0119d034385ff154c8d3ad6bdd76 20 0x8579c75b83d2218b7f5fd61856ce26e72e17f40d 3 0x823a04 OP_2');
    out = new Output(output.value, p2st);
    expect(out.type).toBe(1);

    let groupedP2st = new Script('32 0x45ba89c8bce3be42b88ad80f65c99e07d6d39541c5d6c5f05efa1e44b6980000 2 0x6400 20 0x461ad25081cb0119d034385ff154c8d3ad6bdd76 20 0x8579c75b83d2218b7f5fd61856ce26e72e17f40d 3 0x823a04 OP_2');
    out = new Output(output.value, groupedP2st);
    expect(out.type).toBe(1);
  });

  test("should update type on script update", () => {
    let p2pkh = new Script('OP_DUP OP_HASH160 20 0x76a04053bda0a88bda5177b86a15c3b29f559873 OP_EQUALVERIFY OP_CHECKSIG');
    let p2pkt = new Script('OP_0 OP_1 20 0x0ef8c2437bbc4e9c33204da957e7035681840ea6');

    let out = new Output(output.value, p2pkh);
    expect(out.type).toBe(OutputType.SATOSCRIPT);
    out.scriptPubKey = p2pkt;
    expect(out.type).toBe(OutputType.TEMPLATE);

    let out2 = new Output(output.value, p2pkt);
    expect(out2.type).toBe(OutputType.TEMPLATE);
    out2.scriptPubKey = p2pkh;
    expect(out2.type).toBe(OutputType.SATOSCRIPT);
  });

  test("can be assigned a satoshi amount in bigint", () => {
    let newOutput = Output.fromObject({
      type: 1,
      value: 100n,
      scriptPubKey: Script.empty()
    });
    expect(newOutput.value).toBe(100n);
    expect(newOutput.type).toBe(OutputType.TEMPLATE); // don't update template if set explicitly
  });

  test("can be assigned a satoshi amount with a string", () => {
    let newOutput = Output.fromObject({
      type: 1,
      value: "100",
      scriptPubKey: Script.empty()
    });
    expect(newOutput.value).toBe(100n);
  });

  describe("will error if output is not a positive integer", () => {
    test("-100", () => {
      expect(() => Output.fromObject({
          type: 1,
          value: -100n,
          scriptPubKey: Script.empty()
      })).toThrow("Output value is not a natural bigint");
    });

    test("1.1", () => {
      expect(() => Output.fromObject({
        type: 1,
        value: '1.1',
        scriptPubKey: Script.empty()
      })).toThrow("Cannot convert 1.1 to a BigInt");
    });
  });

  let expectEqualOutputs = (a: Output, b: Output): void => {
    expect(a.value).toBe(b.value);
    expect(a.scriptPubKey.toString()).toBe(b.scriptPubKey.toString());
  };

  test("deserializes correctly a simple output", () => {
    let writer = new BufferWriter();
    output.toBufferWriter(writer);
    let deserialized = Output.fromBufferReader(
      new BufferReader(writer.toBuffer())
    );
    expectEqualOutputs(output, deserialized);
  });

  test("deserializes correctly a simple output with empty script", () => {
    let writer = new BufferWriter();
    let out = Output.fromObject(output.toJSON());
    out.scriptPubKey = Script.empty().add('OP_1');

    out.toBufferWriter(writer);
    let deserialized = Output.fromBufferReader(
      new BufferReader(writer.toBuffer())
    );
    expectEqualOutputs(out, deserialized);
  });

  test("can instantiate from an object", () => {
    let out = Output.fromObject(output.toObject());
    expect(out).toBeDefined();
  });

  test("can set a script and change type from a string", () => {
    let newOutput = Output.fromObject(output.toObject());
    newOutput.scriptPubKey = new Script().add(0).toString();
    expect(newOutput.inspect()).toBe("<Output (type: 0) (0 sats) <Script: OP_0>>");
  });

  test("has a inspect property", () => {
    expect(output.inspect()).toBe("<Output (type: 1) (0 sats) <Script: >>");
  });

  let output2 = Output.fromObject({
    type: 1,
    value: 1100000000n,
    scriptPubKey: new Script("OP_0 OP_1 20 0x5dc0ba22a71074641088993ac31b257c3e2b9e14")
  });

  test("toBufferWriter", () => {
    expect(output2.toBufferWriter().toBuffer().toString("hex"))
      .toBe("0100ab904100000000170051145dc0ba22a71074641088993ac31b257c3e2b9e14");
  });

  test("roundtrips to/from object", () => {
    let newOutput = Output.fromObject({
      type: 1,
      value: '50',
      scriptPubKey: new Script().add(0)
    });
    let otherOutput = Output.fromObject(newOutput.toObject());
    expectEqualOutputs(newOutput, otherOutput);

    let otherOutput2 = Output.fromObject(newOutput.toObject());
    expectEqualOutputs(newOutput, otherOutput2);
  });

  test("roundtrips to/from JSON", () => {
    let json = JSON.stringify(output2);
    let o3 = Output.fromObject(JSON.parse(json));
    expect(JSON.stringify(o3)).toBe(json);
  });

  test("setScript fails with invalid input", () => {
    let out = Output.fromObject(output2.toJSON());
    expect(() => { out.scriptPubKey = 45 as any }).toThrow("Invalid argument type: script");
  });

  describe("#invalidvalue", () => {
    test("return error if not in max safe int range", () => {
      let out = Output.fromObject(output2.toJSON());
      out.value = BigInt(Number.MAX_SAFE_INTEGER) + 5n;
      expect(out.invalidValue()).toBe("transaction txout value greater than max safe integer");
    });

    test("return error on negative value", () => {
      let out = Output.fromObject(output2.toJSON());
      (out as any)._value = -1n;
      expect(out.invalidValue()).toBe("transaction txout negative");
    });

    test("return false on valid value", () => {      
      expect(output2.invalidValue()).toBe(false);
    });
  });
});