import { describe, expect, test } from "vitest";
import Transaction from "../../../src/core/transaction/transaction";
import PublicKeyTemplateInput from "../../../src/core/transaction/input/publickeytemplate";
import Output, { OutputType } from "../../../src/core/transaction/output";
import { Script, ScriptFactory } from "../../../src";
import PublicKeyHashInput from "../../../src/core/transaction/input/publickeyhash";
import ScriptTemplateInput from "../../../src/core/transaction/input/scripttemplate";
import Input from "../../../src/core/transaction/input/input";

describe("Transaction", () => {

  const coinbaseTx = "00000201eed29a3b0000000017005114009b6557e49ced88ae43f460951314dc3cd7f8c00000000000000000000f6a0331e20a0008000000000000000000000000";
  const tx_1_hex = "000100586bd3a9b0d073ad91f3823d42952f8a3e88c6367605f48e540d7b39d9aa351664222103d5a8794dab5d72ebbd852e472d2beb8771a7271ae94deac24aaa20405508555b4080dd1d4e9bcd71af0f99030c568efc5d86bb15afc2e999de1ef1c209065b49bc1e5432bed9c365e2ef0a8eadc67732efd465db59797498fe7deff99a3b74ab2ffeffffff42520f000000000002013885010000000000170051147c3c698ab7d549fd2111a4015515aa78ac7098e9012fcc0d000000000017005114022f2ba4af739b538ecdc8036eaaa37233be98fa94e00a00"
  const tx_token_hex = "0002004dab57b58c34658e486a3219c7dc86adf0126d2276e00ee7dc01391e2e51e7cc64222103f36f2ee1490ac26b32b9fc2318f7400ecde5a1c46f2f958f09992b0fcd39b2654055f4c4fcfc45c0b3a45f9edac96954141071b8e473144fd1cfc7d89888a19578d7d16f50013ec59ce8c9a02b37e818f3942ed37ccda437ec049d15a4105ba9acfeffffff220200000000000000055b82b3479593f0448686b61002fac3512526bd6bac5074a2e830c78b98783364222102189e3c04b9cf56b0552aa218027ad7e26b0d24e36a9342fda3de612361ccc0f140a1a63ed5ad62965297b11e7d4e56a73e5dece8cc2cc7357e24fe2d6b934d6fef5bfeef9235a42e6db1a43afb8e36d71ba2563da37ee61ae5ab5fbd42648f0ef3feffffff13d2ca0100000000020122020000000000003a20a535ef8ceae8135121ad7bc70712e02d56d8c2a3964877f5cc5dbdf16f39000002a8615114992792ba57597a472a41c957122aa5a71280b0950163cdca010000000017005114d82722d7a48fdd05f3c24515309a944c44a8592741c30a00";

  test('should serialize and deserialize correctly a given transaction', () => {
    let transaction = new Transaction(tx_1_hex);
    expect(transaction.uncheckedSerialize()).toBe(tx_1_hex);
  });

  test('should identify coinbase tx', () => {
    let buf = Buffer.from(coinbaseTx, 'hex');
    let transaction = new Transaction(buf);
    expect(transaction.isCoinbase()).toBe(true);
    expect(transaction.outputs.length).toBe(2);
    expect(transaction.getFee()).toBe(0);
  });

  test('should identify deserialized parameters correctly', () => {
    // took from block #705,347
    let transaction = new Transaction(tx_token_hex);
    expect(transaction.toString()).toBe(tx_token_hex);
    expect(transaction.inspect()).toBe(`<Transaction: ${tx_token_hex}>`);
    expect(transaction.inputs.length).toBe(2);
    expect(transaction.outputs.length).toBe(2);
    expect(transaction.id).toBe("4f3c37b742cb0cb12bdded1caecd718f197130ec0731525e423bf61051d6064a");
    expect(transaction.idem).toBe("75cbbafa2d57850aba036f73faba6e015bf4c823d1a028ee4dffe5ca2adff3d2");
    expect(transaction.outputAmount).toBe(30068613n);
    expect(transaction.inputAmount).toBe(30069813n);
    expect(transaction.getUnspentValue()).toBe(1200n);
    expect(transaction.getFee()).toBe(1200);
    expect(transaction.isCoinbase()).toBe(false);
    expect(transaction.hasAllUtxoInfo()).toBe(false);
    expect(transaction.getLockTime()).toBe(705345);
    expect(() => transaction.isFullySigned()).toThrow("This usually happens when creating a transaction from a serialized transaction");
  });

  test('fails if an invalid parameter is passed to constructor', () => {
    expect(() => new Transaction(1 as any)).toThrow("Must provide an object or string to deserialize a transaction");
  });

  test('should copy tx and not return same instance', () => {
    let transaction = new Transaction(tx_1_hex);
    let copy = new Transaction(transaction);
    expect(transaction !== copy).toBe(true);
    expect(copy.serialize(true)).toBe(tx_1_hex);
    expect(copy.serialize({ disableAll: true })).toBe(tx_1_hex);
  });

  test('toObject/fromObject roundtrip', () => {
    let transaction = new Transaction(tx_token_hex).toObject();
    let newTx = new Transaction(transaction);
    expect(newTx.toObject()).toEqual(transaction);
  });

  test('shallow copy should drop custom properties', () => {
    let tx = new Transaction();
    tx.addInput(new PublicKeyTemplateInput({ 
      amount: 1004098n,
      outpoint: "1635aad9397b0d548ef4057636c6883e8a2f95423d82f391ad73d0b0a9d36b58",
      scriptSig: "222103d5a8794dab5d72ebbd852e472d2beb8771a7271ae94deac24aaa20405508555b4080dd1d4e9bcd71af0f99030c568efc5d86bb15afc2e999de1ef1c209065b49bc1e5432bed9c365e2ef0a8eadc67732efd465db59797498fe7deff99a3b74ab2f",
      type: 0,
      sequenceNumber: 4294967294,
      output: new Output(1004098n, "00511431011a39884b2f6f46445787661d73cadd4726df", OutputType.TEMPLATE)
    }));
    tx.addOutput(new Output(99640n, "0051147c3c698ab7d549fd2111a4015515aa78ac7098e9", OutputType.TEMPLATE));
    tx.addOutput(new Output(904239n, "005114022f2ba4af739b538ecdc8036eaaa37233be98fa", OutputType.TEMPLATE));
    tx.nLockTime = 712852;

    let newTx = Transaction.shallowCopy(tx);
    expect(newTx.toString()).toBe(tx.toString());
    expect(newTx.inputs[0].output).not.toBeDefined();
  });

  test('should calculate fees correctly', () => {
    let tx = new Transaction();
    tx.addInput(new PublicKeyTemplateInput({ 
      amount: 1004098n,
      outpoint: "1635aad9397b0d548ef4057636c6883e8a2f95423d82f391ad73d0b0a9d36b58",
      scriptSig: "222103d5a8794dab5d72ebbd852e472d2beb8771a7271ae94deac24aaa20405508555b4080dd1d4e9bcd71af0f99030c568efc5d86bb15afc2e999de1ef1c209065b49bc1e5432bed9c365e2ef0a8eadc67732efd465db59797498fe7deff99a3b74ab2f",
      type: 0,
      sequenceNumber: 4294967294,
      output: new Output(1004098n, "00511431011a39884b2f6f46445787661d73cadd4726df", OutputType.TEMPLATE)
    }));
    tx.addOutput(new Output(99640n, "0051147c3c698ab7d549fd2111a4015515aa78ac7098e9", OutputType.TEMPLATE));
    expect(tx.estimateRequiredFee()).toBeLessThan(tx.getFee());
    
    tx.setChangeOutput("nexa:nqtsq5g5qghjhf90wwd48rkdeqpka24rwgemax86uhhhxmge");
    expect(tx.getFee()).toBe(657);
    expect(tx.getFee()).toBe(tx.estimateRequiredFee());

    tx.setFeePerByte(1);
    expect(tx.getFee()).toBe(219);
    expect(tx.getFee()).toBe(tx.estimateRequiredFee());

    tx = new Transaction();
    for(let i = 0; i < 255; i++) {
      tx.addInput(new PublicKeyTemplateInput({ 
        amount: 1004098n,
        outpoint: "1635aad9397b0d548ef4057636c6883e8a2f95423d82f391ad73d0b0a9d36b58",
        scriptSig: "222103d5a8794dab5d72ebbd852e472d2beb8771a7271ae94deac24aaa20405508555b4080dd1d4e9bcd71af0f99030c568efc5d86bb15afc2e999de1ef1c209065b49bc1e5432bed9c365e2ef0a8eadc67732efd465db59797498fe7deff99a3b74ab2f",
        type: 0,
        sequenceNumber: 4294967294,
        output: new Output(1004098n, "00511431011a39884b2f6f46445787661d73cadd4726df", OutputType.TEMPLATE)
      }));
      tx.addOutput(new Output(99640n, "0051147c3c698ab7d549fd2111a4015515aa78ac7098e9", OutputType.TEMPLATE));
    }
    tx.setChangeOutput("nexa:nqtsq5g5qghjhf90wwd48rkdeqpka24rwgemax86uhhhxmge");

    let expectedFee = 255 * (1 + 32 + 1 + PublicKeyTemplateInput.SCRIPT_SIZE + 4 + 8); // inputs
    expectedFee += 256 * (1 + 8 + 1 + 23) // outputs
    expectedFee += 3 + 3 // vin/vout sizes
    expectedFee += 4 + 1; // locktime + version
    expect(tx.getFee()).toBe(expectedFee * Transaction.FEE_PER_BYTE);
  });

  test("fromObject with multiple input types", () => {
    let tx = new Transaction();
    tx.addInput(new PublicKeyTemplateInput({ 
      amount: 1004098n,
      outpoint: "1635aad9397b0d548ef4057636c6883e8a2f95423d82f391ad73d0b0a9d36b58",
      scriptSig: "222103d5a8794dab5d72ebbd852e472d2beb8771a7271ae94deac24aaa20405508555b4080dd1d4e9bcd71af0f99030c568efc5d86bb15afc2e999de1ef1c209065b49bc1e5432bed9c365e2ef0a8eadc67732efd465db59797498fe7deff99a3b74ab2f",
      type: 0,
      sequenceNumber: 4294967294,
      output: new Output(1004098n, "00511431011a39884b2f6f46445787661d73cadd4726df", OutputType.TEMPLATE)
    }));
    tx.addInput(new PublicKeyHashInput({ 
      amount: 1004098n,
      outpoint: "1635aad9397b0d548ef4057636c6883e8a2f95423d82f391ad73d0b0a9d36b58",
      scriptSig: "222103d5a8794dab5d72ebbd852e472d2beb8771a7271ae94deac24aaa20405508555b4080dd1d4e9bcd71af0f99030c568efc5d86bb15afc2e999de1ef1c209065b49bc1e5432bed9c365e2ef0a8eadc67732efd465db59797498fe7deff99a3b74ab2f",
      type: 0,
      sequenceNumber: 4294967294,
      output: new Output(1004098n, "OP_DUP OP_HASH160 20 0xcb481232299cd5743151ac4b2d63ae198e7bb0a9 OP_EQUALVERIFY OP_CHECKSIG", OutputType.SATOSCRIPT)
    }));

    let template = Script.fromHex('6c756cb1756cad');
    let constraint = Script.fromHex('2103683e3eaff5e4d3ca22a8e2d15451c3af89cee43c6a0b89ae8fdbfa810b52bc98');
    tx.addInput(new ScriptTemplateInput({ 
      amount: 1004098n,
      outpoint: "1635aad9397b0d548ef4057636c6883e8a2f95423d82f391ad73d0b0a9d36b58",
      scriptSig: "7 0x6c756cb1756cad 34 0x2103683e3eaff5e4d3ca22a8e2d15451c3af89cee43c6a0b89ae8fdbfa810b52bc98 64 0x6b91229ab013bf986f3c8a0cfe567c4e0e5f02547e85ec44a9a61caec6aa853ca34f9ba2271716f6098f94df8ccbf06db33473c006b3ff0ce716bf012c7f6af2",
      type: 0,
      sequenceNumber: 4294967294,
      output: new Output(1004098n, "0014461ad25081cb0119d034385ff154c8d3ad6bdd76148579c75b83d2218b7f5fd61856ce26e72e17f40d03823a0452", OutputType.TEMPLATE),
      templateData: { templateScript: template, constraintScript: constraint }
    }));

    tx.addOutput(new Output(99640n, "0051147c3c698ab7d549fd2111a4015515aa78ac7098e9", OutputType.TEMPLATE));
    tx.addOutput(new Output(904239n, "005114022f2ba4af739b538ecdc8036eaaa37233be98fa", OutputType.TEMPLATE));

    let obj = tx.toObject();
    let newTx = new Transaction(obj);
    expect(newTx.inputs[0]).toBeInstanceOf(PublicKeyTemplateInput);
    expect(newTx.inputs[1]).toBeInstanceOf(PublicKeyHashInput);
    expect(newTx.inputs[2]).toBeInstanceOf(ScriptTemplateInput);

    delete (obj.inputs[2] as any).templateData;
    newTx = new Transaction(obj);
    expect(newTx.inputs[2]).not.toBeInstanceOf(ScriptTemplateInput);
    expect(newTx.inputs[2]).toBeInstanceOf(Input);

    //fail on unspendable out script
    obj.inputs[0].output!.scriptPubKey = ScriptFactory.buildDataOut("hello world");
    expect(() => new Transaction(obj)).toThrow("Unsupported input script type");
  });

  describe("Input/Output manipulation", () => {

    test("should add/remove/update inputs and outputs", () => {
      let tx = new Transaction();
      tx.addInput(new PublicKeyTemplateInput({ 
        amount: 1004098n,
        outpoint: "1635aad9397b0d548ef4057636c6883e8a2f95423d82f391ad73d0b0a9d36b58",
        scriptSig: "222103d5a8794dab5d72ebbd852e472d2beb8771a7271ae94deac24aaa20405508555b4080dd1d4e9bcd71af0f99030c568efc5d86bb15afc2e999de1ef1c209065b49bc1e5432bed9c365e2ef0a8eadc67732efd465db59797498fe7deff99a3b74ab2f",
        type: 0,
        sequenceNumber: 4294967294,
        output: new Output(1004098n, "00511431011a39884b2f6f46445787661d73cadd4726df", OutputType.TEMPLATE)
      }));
      tx.addOutput(new Output(99640n, "0051147c3c698ab7d549fd2111a4015515aa78ac7098e9", OutputType.TEMPLATE));
      tx.addOutput(new Output(904239n, "005114022f2ba4af739b538ecdc8036eaaa37233be98fa", OutputType.TEMPLATE));
      tx.nLockTime = 712852;

      expect(tx.serialize()).toBe(tx_1_hex);

      tx.setFeePerByte(1);
      tx.removeOutput(1);
      expect(tx.outputs.length).toBe(1);
      tx.setChangeOutput("nexa:nqtsq5g5qghjhf90wwd48rkdeqpka24rwgemax86uhhhxmge");
      expect(tx.outputs.length).toBe(2);
      tx.inputs[0].scriptSig = "222103d5a8794dab5d72ebbd852e472d2beb8771a7271ae94deac24aaa20405508555b4080dd1d4e9bcd71af0f99030c568efc5d86bb15afc2e999de1ef1c209065b49bc1e5432bed9c365e2ef0a8eadc67732efd465db59797498fe7deff99a3b74ab2f";
      expect(tx.outputs[1].toObject()).toEqual(new Output(904239n, "005114022f2ba4af739b538ecdc8036eaaa37233be98fa", OutputType.TEMPLATE).toObject());
      expect(tx.serialize()).toBe(tx_1_hex);
      expect(tx.getFee()).toBe(219)
      expect(tx.getChangeOutput()?.toObject()).toEqual(tx.outputs[1].toObject());

      tx.updateOutputAmount(0, 1004008n);
      expect(tx.getChangeOutput()).not.toBeDefined();
      expect(tx.outputs.length).toBe(1);

      tx.clearOutputs();
      expect(tx.outputs.length).toBe(1); // only change should be defined if input exist
      expect(tx.getChangeOutput()).toBeDefined();
      expect(tx.inputs[0].scriptSig.toHex()).toBe("");

      tx.setFee(300);
      expect(tx.getChangeOutput()?.value).toBe(1004098n - 300n);
      expect(tx.toObject()).toEqual(new Transaction(tx).toObject()) // copy with change index

      tx.removeInput("1635aad9397b0d548ef4057636c6883e8a2f95423d82f391ad73d0b0a9d36b58");
      expect(tx.inputs.length).toBe(0);

      expect(() => {
        tx.addInput(new PublicKeyTemplateInput({ 
          amount: 1004098n,
          outpoint: "1635aad9397b0d548ef4057636c6883e8a2f95423d82f391ad73d0b0a9d36b58",
          scriptSig: "222103d5a8794dab5d72ebbd852e472d2beb8771a7271ae94deac24aaa20405508555b4080dd1d4e9bcd71af0f99030c568efc5d86bb15afc2e999de1ef1c209065b49bc1e5432bed9c365e2ef0a8eadc67732efd465db59797498fe7deff99a3b74ab2f",
          type: 0,
          sequenceNumber: 4294967294,
          //output: new Output(1004098n, "00511431011a39884b2f6f46445787661d73cadd4726df", OutputType.TEMPLATE)
        }));
      }).toThrow("Need information about the UTXO script and amount");

      expect(() => {
        tx.addInput(new PublicKeyTemplateInput({ 
          amount: 1004098n,
          outpoint: "1635aad9397b0d548ef4057636c6883e8a2f95423d82f391ad73d0b0a9d36b58",
          scriptSig: "222103d5a8794dab5d72ebbd852e472d2beb8771a7271ae94deac24aaa20405508555b4080dd1d4e9bcd71af0f99030c568efc5d86bb15afc2e999de1ef1c209065b49bc1e5432bed9c365e2ef0a8eadc67732efd465db59797498fe7deff99a3b74ab2f",
          type: 0,
          sequenceNumber: 4294967294,
          //output: new Output(1004098n, "00511431011a39884b2f6f46445787661d73cadd4726df", OutputType.TEMPLATE)
        }), "00511431011a39884b2f6f46445787661d73cadd4726df", 1004098n);
      }).not.toThrow();

      expect(() => {
        tx.addInput(new PublicKeyTemplateInput({ 
          amount: 1004098n,
          outpoint: "1635aad9397b0d548ef4057636c6883e8a2f95423d82f391ad73d0b0a9d36b58",
          scriptSig: "222103d5a8794dab5d72ebbd852e472d2beb8771a7271ae94deac24aaa20405508555b4080dd1d4e9bcd71af0f99030c568efc5d86bb15afc2e999de1ef1c209065b49bc1e5432bed9c365e2ef0a8eadc67732efd465db59797498fe7deff99a3b74ab2f",
          type: 0,
          sequenceNumber: 4294967294,
          //output: new Output(1004098n, "00511431011a39884b2f6f46445787661d73cadd4726df", OutputType.TEMPLATE)
        }), Script.fromHex("00511431011a39884b2f6f46445787661d73cadd4726df"), 1004098n);
      }).not.toThrow();
    });
  });

  describe("getSerializationError", () => {

    test("should fail on invalid amount", () => {
      let tx = new Transaction();
      tx.addOutput(new Output(BigInt(Number.MAX_SAFE_INTEGER)+3n, "0051147c3c698ab7d549fd2111a4015515aa78ac7098e9"));
      expect(() => tx.serialize()).toThrow("Output satoshis are invalid");
      tx.clearOutputs();

      tx.addInput(new PublicKeyTemplateInput({ 
        amount: 1004098n,
        outpoint: "1635aad9397b0d548ef4057636c6883e8a2f95423d82f391ad73d0b0a9d36b58",
        scriptSig: "222103d5a8794dab5d72ebbd852e472d2beb8771a7271ae94deac24aaa20405508555b4080dd1d4e9bcd71af0f99030c568efc5d86bb15afc2e999de1ef1c209065b49bc1e5432bed9c365e2ef0a8eadc67732efd465db59797498fe7deff99a3b74ab2f",
        type: 0,
        sequenceNumber: 4294967294,
        output: new Output(1004098n, "00511431011a39884b2f6f46445787661d73cadd4726df", OutputType.TEMPLATE)
      }));
      tx.addOutput(new Output(1000000n, "0051147c3c698ab7d549fd2111a4015515aa78ac7098e9"));
      tx.addOutput(new Output(1000000n, "0051147c3c698ab7d549fd2111a4015515aa78ac7098e9"));
      expect(() => tx.serialize()).toThrow("Invalid outputs amount sum");
      expect(() => tx.serialize({ disableMoreOutputThanInput: true })).not.toThrow();
    });

    test("should fail on too many inputs/outputs", () => {
      let tx = new Transaction();
      for(let i = 0; i < 300; i++) {
        tx.addOutput(new Output(1000n, "0051147c3c698ab7d549fd2111a4015515aa78ac7098e9"));
      }
      expect(() => tx.serialize()).toThrow("Too many outputs");
      tx.clearOutputs();

      for(let i = 0; i < 300; i++) {
        tx.addInput(new PublicKeyTemplateInput({ 
          amount: 1004098n,
          outpoint: "1635aad9397b0d548ef4057636c6883e8a2f95423d82f391ad73d0b0a9d36b58",
          scriptSig: "222103d5a8794dab5d72ebbd852e472d2beb8771a7271ae94deac24aaa20405508555b4080dd1d4e9bcd71af0f99030c568efc5d86bb15afc2e999de1ef1c209065b49bc1e5432bed9c365e2ef0a8eadc67732efd465db59797498fe7deff99a3b74ab2f",
          type: 0,
          sequenceNumber: 4294967294,
          output: new Output(1004098n, "00511431011a39884b2f6f46445787661d73cadd4726df", OutputType.TEMPLATE)
        }));
      }
      expect(() => tx.serialize()).toThrow("Too many inputs");
    });

    test("should fail on fees problem", () => {
      let tx = new Transaction();
      tx.addInput(new PublicKeyTemplateInput({ 
        amount: 1004098n,
        outpoint: "1635aad9397b0d548ef4057636c6883e8a2f95423d82f391ad73d0b0a9d36b58",
        scriptSig: "222103d5a8794dab5d72ebbd852e472d2beb8771a7271ae94deac24aaa20405508555b4080dd1d4e9bcd71af0f99030c568efc5d86bb15afc2e999de1ef1c209065b49bc1e5432bed9c365e2ef0a8eadc67732efd465db59797498fe7deff99a3b74ab2f",
        type: 0,
        sequenceNumber: 4294967294,
        output: new Output(1004098n, "00511431011a39884b2f6f46445787661d73cadd4726df", OutputType.TEMPLATE)
      }));
      tx.addOutput(new Output(1000000n, "0051147c3c698ab7d549fd2111a4015515aa78ac7098e9"));
      tx.setFee(43);
      expect(() => tx.serialize()).toThrow(`Unspent value is ${1004098n - 1000000n} but specified fee is ${43}`)
    });

    test("should fail on dust output", () => {
      let tx = new Transaction();
      tx.addInput(new PublicKeyTemplateInput({ 
        amount: 1004098n,
        outpoint: "1635aad9397b0d548ef4057636c6883e8a2f95423d82f391ad73d0b0a9d36b58",
        scriptSig: "222103d5a8794dab5d72ebbd852e472d2beb8771a7271ae94deac24aaa20405508555b4080dd1d4e9bcd71af0f99030c568efc5d86bb15afc2e999de1ef1c209065b49bc1e5432bed9c365e2ef0a8eadc67732efd465db59797498fe7deff99a3b74ab2f",
        type: 0,
        sequenceNumber: 4294967294,
        output: new Output(1004098n, "00511431011a39884b2f6f46445787661d73cadd4726df", OutputType.TEMPLATE)
      }));
      tx.addOutput(new Output(500n, "0051147c3c698ab7d549fd2111a4015515aa78ac7098e9"));
      expect(() => tx.serialize()).toThrow("Dust amount detected in one output");
      expect(() => tx.serialize({ disableDustOutputs: true })).not.toThrow();

      // op return
      tx.outputs[0].scriptPubKey = "6a0438564c050541474e41520541474e41522968747470733a2f2f61676e61722e70616765732e6465762f7075626c69632f61676e61722e6a736f6e20cea0308d9b165bd440e0336c5ae89b9ee04dfce95a7e1797de150794fdd6e5e052"
      expect(() => tx.serialize()).not.toThrow();
    });

    test("should fail on missing signature", () => {
      let tx = new Transaction();
      tx.addInput(new PublicKeyTemplateInput({ 
        amount: 1004098n,
        outpoint: "1635aad9397b0d548ef4057636c6883e8a2f95423d82f391ad73d0b0a9d36b58",
        scriptSig: Script.empty(),
        type: 0,
        sequenceNumber: 4294967294,
        output: new Output(1004098n, "00511431011a39884b2f6f46445787661d73cadd4726df", OutputType.TEMPLATE)
      }));
      tx.addOutput(new Output(100500n, "0051147c3c698ab7d549fd2111a4015515aa78ac7098e9"));
      expect(() => tx.serialize()).toThrow("Some inputs have not been fully signed");
      expect(() => tx.serialize({ disableIsFullySigned: true })).not.toThrow();
    });
  });

  describe("get/set nLockTime", () => {

    test("should return null if locktime is 0 (default)", () => {
      let tx = new Transaction();
      expect(tx.getLockTime()).toBe(null);
    });

    test("should return blockheight if locktime is below NLOCKTIME_BLOCKHEIGHT_LIMIT", () => {
      let tx = new Transaction();
      tx.setLockTime(Transaction.NLOCKTIME_BLOCKHEIGHT_LIMIT - 100);
      expect(tx.getLockTime()).toBe(Transaction.NLOCKTIME_BLOCKHEIGHT_LIMIT - 100);
    });

    test("should return date if locktime is greater or equal NLOCKTIME_BLOCKHEIGHT_LIMIT", () => {
      let tx = new Transaction();
      tx.setLockTime(Transaction.NLOCKTIME_BLOCKHEIGHT_LIMIT);
      expect(tx.getLockTime()).toEqual(new Date(1000 * Transaction.NLOCKTIME_BLOCKHEIGHT_LIMIT));

      tx.setLockTime(Transaction.NLOCKTIME_BLOCKHEIGHT_LIMIT + 5);
      expect(tx.getLockTime()).toEqual(new Date(1000 * (Transaction.NLOCKTIME_BLOCKHEIGHT_LIMIT+5)));
    });

    test("should set all inputs sequence number to max_int-1", () => {
      let tx = new Transaction();
      tx.addInput(new PublicKeyTemplateInput({ 
        amount: 1004098n,
        outpoint: "1635aad9397b0d548ef4057636c6883e8a2f95423d82f391ad73d0b0a9d36b58",
        scriptSig: Script.empty(),
        type: 0,
        output: new Output(1004098n, "00511431011a39884b2f6f46445787661d73cadd4726df", OutputType.TEMPLATE)
      }));
      tx.addInput(new PublicKeyTemplateInput({ 
        amount: 1004098n,
        outpoint: "1635aad9397b0d548ef4057636c6883e8a2f95423d82f391ad73d0b0a9d36b58",
        scriptSig: Script.empty(),
        type: 0,
        output: new Output(1004098n, "00511431011a39884b2f6f46445787661d73cadd4726df", OutputType.TEMPLATE)
      }));
      expect(tx.inputs[0].sequenceNumber).toBe(Input.SEQUENCE_FINAL);
      expect(tx.inputs[1].sequenceNumber).toBe(Input.SEQUENCE_FINAL);

      tx.setLockTime(Transaction.NLOCKTIME_BLOCKHEIGHT_LIMIT - 100);
      expect(tx.getLockTime()).toBe(Transaction.NLOCKTIME_BLOCKHEIGHT_LIMIT - 100);

      expect(tx.inputs[0].sequenceNumber).toBe(Input.SEQUENCE_FINAL-1);
      expect(tx.inputs[1].sequenceNumber).toBe(Input.SEQUENCE_FINAL-1);
    });

    test("set should fail if not a number", () => {
      let tx = new Transaction();
      expect(() => tx.setLockTime('asd' as any)).toThrow("must be a number");
    });
  });

  describe("Partial Transaction (incomplete)", () => {

    test("should deserialize this tx correctly", () => {
      let partialTxHex = "00010004d36333fbc90d17cf5929b44de1eccceb864d9e574c95e7622dc20953170bc267222102abca6942cd9d0427d0b7efec0cbbefb4cbcbb835464ebe0f36b1e3dc3533ed5943b3421028b6ec39e85148ce517c6484c31dcd54f241fec44d1334dc46c4d8e555c5ca06a37f3bb799806abb3035aec03c626ba9089e5f8fd3738837989dd2cacb110101ffffffff2202000000000000030122e60b540200000017005114d7828a3a7027a04ac8a6cb96c7ccfc15eacd9b8901e8030000000000001700511409263ef5bee25e974d2d53d6dfb637c3c55362130122020000000000004540cacf3d958161a925c28a970d3c40deec1a3fe06796fe1b4a7b68f377cdb9000079701a1cc57ce124662772c6e107702fa855a0392296afbefe612f73c2aefc64020100f200000000";
      let tx = new Transaction(partialTxHex);
      expect(tx).toBeDefined();
      expect(tx.uncheckedSerialize()).toBe(partialTxHex);
      expect(tx.id).toBe("51c1aca7c6aef44397e0997ae827ab33dc9651f0c7b964b64faeecb4c2315809");
      expect(tx.idem).toBe("968e271e5f0fc7396f618570dd9e50ac01319df4b3c5a2e56ce5c7371f0829df");

      expect(tx.inputs.length).toBe(1);
      expect(tx.inputs[0].amount).toBe(546n);
      expect(tx.inputs[0].scriptSig.toHex()).toBe("222102abca6942cd9d0427d0b7efec0cbbefb4cbcbb835464ebe0f36b1e3dc3533ed5943b3421028b6ec39e85148ce517c6484c31dcd54f241fec44d1334dc46c4d8e555c5ca06a37f3bb799806abb3035aec03c626ba9089e5f8fd3738837989dd2cacb110101");
      
      expect(tx.outputs.length).toBe(3);
      expect(tx.outputs[0].value).toBe(10000000546n);
      expect(tx.outputs[1].value).toBe(1000n);
      expect(tx.outputs[2].value).toBe(546n);
      expect(tx.outputs[0].scriptPubKey.toHex()).toBe("005114d7828a3a7027a04ac8a6cb96c7ccfc15eacd9b89");
      expect(tx.outputs[1].scriptPubKey.toHex()).toBe("00511409263ef5bee25e974d2d53d6dfb637c3c5536213");
      expect(tx.outputs[2].scriptPubKey.toHex()).toBe("40cacf3d958161a925c28a970d3c40deec1a3fe06796fe1b4a7b68f377cdb9000079701a1cc57ce124662772c6e107702fa855a0392296afbefe612f73c2aefc64020100f2");
    
      expect(tx.getUnspentValue()).toBe(-10000001546n);
    });
  });
});