import { describe, expect, test } from "vitest";
import type { IInput } from "../../../../src/core/transaction/interfaces";
import Input from "../../../../src/core/transaction/input/input";
import { Script } from "../../../../src";
import BufferReader from "../../../../src/encoding/bufferreader";
import Output from "../../../../src/core/transaction/output";

describe('Transaction.Input', () => {

  let vin: IInput = {
    amount: '1000022086',
    outpoint: "d9f77974b326631688d4e965e7047486a073fd890cb06361c7f4d57aa54bd829",
    scriptSig: Script.empty(),
    type: 0,
    sequenceNumber: 0xffffffff - 1 
  }

  test('has abstract methods: "getSubscript", "isFullySigned", "addSignature", "canSign"', () => {
    let input = new Input(vin);
    ["getSubscript", "isFullySigned", "addSignature", "canSign"].forEach(method => {
      expect(() => (input as any)[method]()).toThrow("Abstract Method Invocation");
    })
  });

  describe('instantiation', () => {

    test('fails with no script info', () => {
      expect(() => new Input({} as any)).to.throw('Need a script to create an input');
    });

    test('fromObject should work', () => {
      let input = Input.fromObject(vin);
      expect(input).toBeDefined();
      expect(input.outpoint.toString('hex')).toBe(vin.outpoint);
      expect(input.amount).toBe(1000022086n);
    });

    test('toObject should work', () => {
      let input = new Input(vin);
      let obj = input.toObject();
      expect(Input.fromObject(obj)).toEqual(input);

      obj.scriptSig = 42 as any
      expect(() => Input.fromObject(obj)).toThrow("Invalid argument type: script");
    });
  });

  test('estimateSize returns correct size', () => {
    let input = new Input(vin);
    expect(input.estimateSize()).toBe(1 + 32 + 1 + 0 + 4 + 8);
  });

  test('isFinal should be identified', () => {
    let input = new Input(vin);
    expect(input.isFinal()).toBe(true);
    input.sequenceNumber++;
    expect(input.isFinal()).toBe(false);
  });

  test('should clear sig if requested', () => {
    let input = new Input(vin);
    input.scriptSig = Script.empty().add('OP_1').add('OP_0');
    expect(input.scriptSig.toString()).toBe('OP_1 OP_0');
    input.clearSignatures();
    expect(input.scriptSig.toBuffer()).toEqual(Buffer.alloc(0));
  });

  test('should define associated output if provided', () => {
    let input = new Input(vin);
    expect(input.output).not.toBeDefined();

    let vin2: IInput = {
      amount: '1000022086',
      outpoint: "d9f77974b326631688d4e965e7047486a073fd890cb06361c7f4d57aa54bd829",
      scriptSig: Script.empty(),
      type: 0,
      sequenceNumber: 0xffffffff,
      output: {
        type: 1,
        value: 1000022086n,
        scriptPubKey: Script.empty().add('OP_1').add('OP_0')
      }
    }

    input = new Input(vin2);
    expect(input.output).toBeDefined();
    expect(input.toObject().output).toBeDefined();

    let vin3: IInput = {
      amount: 1000022086n,
      outpoint: Buffer.from("d9f77974b326631688d4e965e7047486a073fd890cb06361c7f4d57aa54bd829", 'hex'),
      scriptSig: Script.empty(),
      type: 0,
      sequenceNumber: undefined,
      output: new Output(1000022086n, Script.empty().add('OP_1').add('OP_0'), 1)
    }

    let input2 = new Input(vin3);
    expect(input2.output).toBeDefined();
    expect(input2.toObject().output).toBeDefined();
    expect(input2).toEqual(input);
  });

  test("should serialize correctly", () => {
    let input = new Input(vin);
    let buf = input.toBufferWriter().toBuffer();
    expect(buf.length).toBe(46);
    let bufNoScript = input.toBufferWriter(undefined, false).toBuffer();
    expect(bufNoScript.length).toBe(45);

    let input2 = Input.fromBufferReader(new BufferReader(buf));

    expect(input2).toEqual(input);
  });
});
