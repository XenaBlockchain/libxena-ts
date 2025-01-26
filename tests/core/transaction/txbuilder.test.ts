import { describe, expect, test } from "vitest";
import TransactionBuilder from "../../../src/core/transaction/txbuilder";
import { Address, Hash, Input, Opcode, Output, OutputType, PrivateKey, PublicKeyTemplateInput, Script, ScriptFactory, ScriptOpcode, ScriptTemplateInput, SighashType, Transaction, TxSigner } from "../../../src";
import type { UTXO } from "../../../src/core/transaction/interfaces";
import PublicKeyHashInput from "../../../src/core/transaction/input/publickeyhash";
import BNExtended from "../../../src/crypto/bn.extension";
import type { ScriptElement } from "../../../src/core/script/script";
import Signature from "../../../src/crypto/signature";

describe("TransactionBuilder", () => {

  let template = Script.fromHex('6c756cb1756cad');
  let constraint = Script.fromHex('2103683e3eaff5e4d3ca22a8e2d15451c3af89cee43c6a0b89ae8fdbfa810b52bc98');

  let utxos: UTXO[] = [
    {
      outpoint: "1635aad9397b0d548ef4057636c6883e8a2f95423d82f391ad73d0b0a9d36b58",
      address: "nexa:nqtsq5g5xyq35wvgfvhk73jy27rkv8tnetw5wfklg8jw6qpu",
      satoshis: 10098n
    },
    {
      outpoint: "2635aad9397b0d548ef4057636c6883e8a2f95423d82f391ad73d0b0a9d36b58",
      scriptPubKey: "0014461ad25081cb0119d034385ff154c8d3ad6bdd76148579c75b83d2218b7f5fd61856ce26e72e17f40d03823a0452",
      satoshis: 10098n,
      templateData: {
        templateScript: template, constraintScript: constraint
      }
    },
    {
      outpoint: "3635aad9397b0d548ef4057636c6883e8a2f95423d82f391ad73d0b0a9d36b58",
      scriptPubKey: "OP_DUP OP_HASH160 20 0xcb481232299cd5743151ac4b2d63ae198e7bb0a9 OP_EQUALVERIFY OP_CHECKSIG",
      amount: 100.98
    },
    {
      outpoint: "4635aad9397b0d548ef4057636c6883e8a2f95423d82f391ad73d0b0a9d36b58",
      scriptPubKey: "OP_3 OP_HASH160 20 0xcb481232299cd5743151ac4b2d63ae198e7bb0a9 OP_EQUALVERIFY OP_CHECKSIG",
      amount: "100.98"
    }
  ];

  describe("instantiation", () => {
    test("should create new tx if not provided", () => {
      let builder = new TransactionBuilder();
      expect(builder).toBeDefined();
      expect(builder.build()).toEqual(new Transaction());
    });

    test("should continue existing tx if provided", () => {
      let tx = new Transaction();
      tx.addInput(new PublicKeyTemplateInput({ 
        amount: 1004098n,
        outpoint: "1635aad9397b0d548ef4057636c6883e8a2f95423d82f391ad73d0b0a9d36b58",
        scriptSig: Script.empty(),
        type: 0,
        output: new Output(1004098n, "00511431011a39884b2f6f46445787661d73cadd4726df", OutputType.TEMPLATE)
      }));
      let builder = new TransactionBuilder(tx);
      expect(builder).toBeDefined();
      expect(builder.build()).toEqual(tx);
    });
  });

  describe("#from", () => {

    test("should add all utxos correctly", () => {
      let builder = new TransactionBuilder();
      let tx = builder.from(utxos).build();
      expect(tx.inputs.length).toBe(4);
      expect(tx.inputs[0]).toBeInstanceOf(PublicKeyTemplateInput);
      expect(tx.inputs[1]).toBeInstanceOf(ScriptTemplateInput);
      expect(tx.inputs[2]).toBeInstanceOf(PublicKeyHashInput);
      expect(tx.inputs[3]).toBeInstanceOf(Input);

      expect(tx.inputs[3]).not.toBeInstanceOf(PublicKeyTemplateInput);
      expect(tx.inputs[3]).not.toBeInstanceOf(ScriptTemplateInput);
      expect(tx.inputs[3]).not.toBeInstanceOf(PublicKeyHashInput);
    });

    test("should not add duplicate utxo", () => {
      let builder = new TransactionBuilder();
      let tx = builder.from(utxos[0]).from(utxos[0]).build();
      expect(tx.inputs.length).toBe(1);

      let arr = [utxos[0], utxos[0]];
      builder = new TransactionBuilder();
      tx = builder.from(arr).build();
      expect(tx.inputs.length).toBe(1);
    });

    test("should identify as generic input for p2st if templateData not provided", () => {
      let utxo = {
        outpoint: "2635aad9397b0d548ef4057636c6883e8a2f95423d82f391ad73d0b0a9d36b58",
        scriptPubKey: "0014461ad25081cb0119d034385ff154c8d3ad6bdd76148579c75b83d2218b7f5fd61856ce26e72e17f40d03823a0452",
        satoshis: 1004098n,
      }
      let tx = new TransactionBuilder().from(utxo).build();

      expect(tx.inputs[0]).toBeInstanceOf(Input);
      expect(tx.inputs[0]).not.toBeInstanceOf(PublicKeyTemplateInput);
      expect(tx.inputs[0]).not.toBeInstanceOf(ScriptTemplateInput);
      expect(tx.inputs[0]).not.toBeInstanceOf(PublicKeyHashInput);
    });
  });

  describe("#to", () => {

    test("should add p2pkt output correctly", () => {
      let tx = new TransactionBuilder().to("nexa:nqtsq5g5xyq35wvgfvhk73jy27rkv8tnetw5wfklg8jw6qpu", 10000).build();
      expect(tx.outputs.length).toBe(1);
      expect(tx.outputs[0].scriptPubKey.toHex()).toBe("00511431011a39884b2f6f46445787661d73cadd4726df");
      expect(tx.outputs[0].type).toBe(OutputType.TEMPLATE);
      expect(tx.outputs[0].value).toBe(10000n);
    });

    test("should add p2pkt with token output correctly", () => {
      let tx = new TransactionBuilder().to("nexatest:nqtsq5g53zfa3x6tu5nlf6sp3js3qka93h7dafpvap7fgfrd", Transaction.DUST_AMOUNT, "nexatest:tpzm4zwghn3mus4c3tvq7ewfncrad5u4g8zad30stmapu39knqqqq9xdy9pg2", 100n).build();
      expect(tx.outputs.length).toBe(1);
      expect(tx.outputs[0].scriptPubKey.toString()).toBe("32 0x45ba89c8bce3be42b88ad80f65c99e07d6d39541c5d6c5f05efa1e44b6980000 2 0x6400 OP_1 20 0x8893d89b4be527f4ea018ca1105ba58dfcdea42c");
      expect(tx.outputs[0].type).toBe(OutputType.TEMPLATE);
      expect(tx.outputs[0].value).toBe(546n);
    });

    test("can add multiple outputs", () => {
      let tx = new TransactionBuilder()
        .to("nexa:nqtsq5g5xyq35wvgfvhk73jy27rkv8tnetw5wfklg8jw6qpu", 10000)
        .to("nexa:nqtsq5g5xyq35wvgfvhk73jy27rkv8tnetw5wfklg8jw6qpu", Transaction.DUST_AMOUNT, "nexa:tr9v70v4s9s6jfwz32ts60zqmmkp50lqv7t0ux620d50xa7dhyqqqcg6kdm6f", 100n)
        .build();
      expect(tx.outputs.length).toBe(2);
    });

    test("should add p2pkh output correctly", () => {
      let tx = new TransactionBuilder().to("nexa:qpm2qsznhks23z7629mms6s4cwef74vcwvgpsey0xy", 10000).build();
      expect(tx.outputs.length).toBe(1);
      expect(tx.outputs[0].scriptPubKey.toString()).toBe("OP_DUP OP_HASH160 20 0x76a04053bda0a88bda5177b86a15c3b29f559873 OP_EQUALVERIFY OP_CHECKSIG");
      expect(tx.outputs[0].type).toBe(OutputType.SATOSCRIPT);
    });

    test("should add p2st output correctly", () => {
      let tx = new TransactionBuilder().to("nexa:nqcqq9zxrtf9pqwtqyvaqdpctlc4fjxn444a6as5s4uuwkur6gsckl6l6cv9dn3xuuhp0aqdqwpr5pzjjyzue07u", 10000).build();
      expect(tx.outputs.length).toBe(1);
      expect(tx.outputs[0].scriptPubKey.toHex()).toBe("0014461ad25081cb0119d034385ff154c8d3ad6bdd76148579c75b83d2218b7f5fd61856ce26e72e17f40d03823a0452");
      expect(tx.outputs[0].type).toBe(OutputType.TEMPLATE);
    });
  });

  describe("#addData", () => {
    let data = 'hello world!!!';

    test("should add data as op_return", () => {
      let tx = new TransactionBuilder().addData(data).build();
      expect(tx.outputs[0].scriptPubKey.toString()).toBe("OP_RETURN 14 0x68656c6c6f20776f726c64212121");
      expect(tx.outputs[0].type).toBe(OutputType.SATOSCRIPT);
      expect(tx.outputs[0].value).toBe(0n);
    });

    test("should add data as op_return from provided op_return script", () => {
      let s = ScriptFactory.buildDataOut(data);
      let tx = new TransactionBuilder().addData(s, true).build();
      expect(tx.outputs[0].scriptPubKey.toString()).toBe("OP_RETURN 14 0x68656c6c6f20776f726c64212121");
      expect(tx.outputs[0].type).toBe(OutputType.SATOSCRIPT);
      expect(tx.outputs[0].value).toBe(0n);
    });
  });

  describe("#change #fee #feePerByte", () => {
    test("should set and adjust change and fees correctly", () => {
      let script = Script.fromString('0051147c3c698ab7d549fd2111a4015515aa78ac7098e9');
      let tx = new TransactionBuilder()
        .from({
          outpoint: "1635aad9397b0d548ef4057636c6883e8a2f95423d82f391ad73d0b0a9d36b58",
          scriptPubKey: "00511431011a39884b2f6f46445787661d73cadd4726df",
          satoshis: 1004098n
        })
        .to(Address.fromScriptTemplate(script.getTemplateHash(), script.getConstraintHash()), 99640n)
        .change("nexa:nqtsq5g5qghjhf90wwd48rkdeqpka24rwgemax86uhhhxmge")
        .build();
      
      expect(tx.getChangeOutput()).toBeDefined();
      expect(tx.getChangeOutput()?.scriptPubKey.toHex()).toBe("005114022f2ba4af739b538ecdc8036eaaa37233be98fa");
      expect(tx.outputs[1].scriptPubKey.toHex()).toBe("005114022f2ba4af739b538ecdc8036eaaa37233be98fa");
      expect(tx.outputs[1].type).toBe(OutputType.TEMPLATE);
      expect(tx.outputs[1].value).toBe(903801n);
      expect(tx.getFee()).toBe(657);

      tx = new TransactionBuilder()
        .from({
          outpoint: "1635aad9397b0d548ef4057636c6883e8a2f95423d82f391ad73d0b0a9d36b58",
          scriptPubKey: "00511431011a39884b2f6f46445787661d73cadd4726df",
          satoshis: 1004098n
        })
        .to(Address.fromScriptTemplate(script.getTemplateHash(), script.getConstraintHash()), 99640n)
        .change("nexa:nqtsq5g5qghjhf90wwd48rkdeqpka24rwgemax86uhhhxmge")
        .feePerByte(1)
        .build();
      
      expect(tx.getChangeOutput()).toBeDefined();
      expect(tx.getChangeOutput()?.scriptPubKey.toHex()).toBe("005114022f2ba4af739b538ecdc8036eaaa37233be98fa");
      expect(tx.outputs[1].scriptPubKey.toHex()).toBe("005114022f2ba4af739b538ecdc8036eaaa37233be98fa");
      expect(tx.outputs[1].type).toBe(OutputType.TEMPLATE);
      expect(tx.outputs[1].value).toBe(904239n);
      expect(tx.getFee()).toBe(219);

      tx = new TransactionBuilder()
        .from({
          outpoint: "1635aad9397b0d548ef4057636c6883e8a2f95423d82f391ad73d0b0a9d36b58",
          scriptPubKey: "00511431011a39884b2f6f46445787661d73cadd4726df",
          satoshis: 1004098n
        })
        .to(Address.fromScriptTemplate(script.getTemplateHash(), script.getConstraintHash()), 99640n)
        .fee(200) // should not changed after changing tx
        .change("nexa:nqtsq5g5qghjhf90wwd48rkdeqpka24rwgemax86uhhhxmge")
        .build();
      
      expect(tx.getChangeOutput()).toBeDefined();
      expect(tx.getChangeOutput()?.scriptPubKey.toHex()).toBe("005114022f2ba4af739b538ecdc8036eaaa37233be98fa");
      expect(tx.outputs[1].scriptPubKey.toHex()).toBe("005114022f2ba4af739b538ecdc8036eaaa37233be98fa");
      expect(tx.outputs[1].type).toBe(OutputType.TEMPLATE);
      expect(tx.outputs[1].value).toBe(904258n);
      expect(tx.getFee()).toBe(200);
    });
  });

  describe("lockUntilDate/BlockHeight", () => {
    test("should fail on invalid values", () => {
      let builder = new TransactionBuilder();
      expect(() => builder.lockUntilDate(undefined as any)).toThrow();
      expect(() => builder.lockUntilDate(1234)).toThrow("Lock Time can't be earlier than UNIX date 500 000 000");

      expect(() => builder.lockUntilBlockHeight(Transaction.NLOCKTIME_BLOCKHEIGHT_LIMIT+2)).toThrow("Block Height can be at most 2^32 - 1");
      expect(() => builder.lockUntilBlockHeight(-1)).toThrow("Block Height cannot be negative");
    });

    test("should set blockheight correctly", () => {
      let tx = new TransactionBuilder().lockUntilBlockHeight(123456).build();
      expect(tx.getLockTime()).toBe(123456);
    });

    test("should set datetime correctly", () => {
      let date = new Date();
      let timestamp = date.getTime() / 1000;

      let tx = new TransactionBuilder().lockUntilDate(timestamp).build();
      expect(tx.getLockTime()).toEqual(date);

      tx = new TransactionBuilder().lockUntilDate(date).build();
      expect(tx.getLockTime()).toEqual(date);
    });
  });

  describe("#sign", () => {
    test("should fail if missing some utxo info", () => {
      let builder = new TransactionBuilder();
      builder.from([...utxos]).to("nexa:nqtsq5g5xyq35wvgfvhk73jy27rkv8tnetw5wfklg8jw6qpu", 10000);
      builder.transaction.inputs[0].output = undefined;
      expect(() => builder.sign(new PrivateKey())).toThrow("Not all utxo information is available to sign the transaction.");
    });

    test("should fail on unknown input", () => {
      let builder = new TransactionBuilder();
      builder.from(utxos).to("nexa:nqtsq5g5xyq35wvgfvhk73jy27rkv8tnetw5wfklg8jw6qpu", 10000);
      expect(() => builder.sign(new PrivateKey())).toThrow("Abstract Method Invocation: Input#canSign");
    });

    test("should not sign anything if privkeys mismatched", () => {
      let newUtxos = [utxos[0], utxos[1], utxos[2]];
      let builder = new TransactionBuilder();
      let tx = builder.from(newUtxos).to("nexa:nqtsq5g5xyq35wvgfvhk73jy27rkv8tnetw5wfklg8jw6qpu", 10000).sign([new PrivateKey(), new PrivateKey()]).build();
      expect(tx.inputs[0].scriptSig.toHex()).toBe("");
      expect(tx.inputs[1].scriptSig.toHex()).toBe("");
      expect(tx.inputs[2].scriptSig.toHex()).toBe("");
    });

    test("should sign these txs correctly", () => {
      let privkey1 = new PrivateKey();
      let privkey2 = new PrivateKey();

      let utxos: UTXO[] = [
        {
          outpoint: "1635aad9397b0d548ef4057636c6883e8a2f95423d82f391ad73d0b0a9d36b58",
          scriptPubKey: ScriptFactory.buildScriptTemplateOut(privkey1.publicKey),
          satoshis: 10000
        },
        {
          outpoint: "2635aad9397b0d548ef4057636c6883e8a2f95423d82f391ad73d0b0a9d36b58",
          scriptPubKey: ScriptFactory.buildScriptTemplateOut(privkey2.publicKey),
          satoshis: 10000
        },
        {
          outpoint: "3635aad9397b0d548ef4057636c6883e8a2f95423d82f391ad73d0b0a9d36b58",
          scriptPubKey: ScriptFactory.buildPublicKeyHashOut(privkey1.publicKey),
          satoshis: 10000
        }
      ];

      let builder = new TransactionBuilder()
        .from(utxos)
        .to("nexa:nqtsq5g5xyq35wvgfvhk73jy27rkv8tnetw5wfklg8jw6qpu", 10000)
        .sign(privkey1);

      expect(builder.build().isFullySigned()).toBe(false);
      builder.sign(privkey2);
      expect(builder.build().isFullySigned()).toBe(true);

      builder = new TransactionBuilder()
        .from(utxos)
        .to("nexa:nqtsq5g5xyq35wvgfvhk73jy27rkv8tnetw5wfklg8jw6qpu", 10000)
        .sign([privkey1, privkey2]);

      expect(builder.build().isFullySigned()).toBe(true);

      let templateScript = Script.empty()
        .add(Opcode.OP_FROMALTSTACK).add(Opcode.OP_DROP)
        .add(Opcode.OP_FROMALTSTACK).add(Opcode.OP_CHECKLOCKTIMEVERIFY).add(Opcode.OP_DROP)
        .add(Opcode.OP_FROMALTSTACK).add(Opcode.OP_CHECKSIGVERIFY);
      let tHash = Hash.sha256ripemd160(templateScript.toBuffer());
      
      let constraintScript = Script.empty().add(privkey2.publicKey.toBuffer());
      let cHash = Hash.sha256ripemd160(constraintScript.toBuffer());

      const generateVisibleArgs = (args: number[]): ScriptElement[] => {
        return args.map(arg => arg <= 16 ? ScriptOpcode.smallInt(arg) : BNExtended.fromNumber(arg).toScriptNumBuffer());
      }

      builder = new TransactionBuilder()
        .from(utxos)
        .from({
          outpoint: "4635aad9397b0d548ef4057636c6883e8a2f95423d82f391ad73d0b0a9d36b58",
          address: Address.fromScriptTemplate(tHash, cHash, generateVisibleArgs([1, 123456])),
          amount: "1000",
          templateData: { templateScript, constraintScript, publicKey: privkey2.publicKey }
        })
        .to("nexa:nqtsq5g5xyq35wvgfvhk73jy27rkv8tnetw5wfklg8jw6qpu", 10000)
        .sign([privkey1, privkey2]);

      expect(builder.build().isFullySigned()).toBe(true);
    });
  });

  describe("#signInput", () => {

    let privkey = new PrivateKey();
    let privkey2 = new PrivateKey();

    let utxos: UTXO[] = [
      {
        outpoint: "1635aad9397b0d548ef4057636c6883e8a2f95423d82f391ad73d0b0a9d36b58",
        scriptPubKey: ScriptFactory.buildScriptTemplateOut(privkey.publicKey),
        satoshis: 10000
      },
      {
        outpoint: "2635aad9397b0d548ef4057636c6883e8a2f95423d82f391ad73d0b0a9d36b58",
        scriptPubKey: ScriptFactory.buildScriptTemplateOut(privkey.publicKey),
        satoshis: 10000
      },
      {
        outpoint: "3635aad9397b0d548ef4057636c6883e8a2f95423d82f391ad73d0b0a9d36b58",
        scriptPubKey: ScriptFactory.buildPublicKeyHashOut(privkey2.publicKey),
        satoshis: 10000
      }
    ];

    let sighashtype = new SighashType().setFirstNIn(2).setFirstNOut(1);

    test("should attach sighash bytes to signature correctly", () => {
      // one test is basically enough because we have a complete test suite on sighashtypes
      let tx = new TransactionBuilder()
        .from(utxos)
        .to("nexa:nqtsq5g5xyq35wvgfvhk73jy27rkv8tnetw5wfklg8jw6qpu", 10000)
        .signInput(0, privkey, sighashtype)
        .build();
      
      expect(tx.inputs[0].scriptSig.toHex().endsWith('110201')).toBe(true);
      expect(tx.inputs[0].scriptSig.chunks[1].len).toBe(67);
      expect(tx.inputs[1].scriptSig.chunks.length).toBe(0);
      expect(tx.inputs[2].scriptSig.chunks.length).toBe(0);

      let sig = Signature.fromTxFormat(tx.inputs[0].scriptSig.chunks[1].buf!);
      let sigType = SighashType.fromBuffer(tx.inputs[0].scriptSig.chunks[1].buf!.subarray(64));
      expect(TxSigner.verify(tx, 0, sig, sigType, tx.inputs[0].getSubscript(), privkey.publicKey)).toBe(true);
    });

    test("can use outpoint to detect the input to sign on", () => {
      // will use different input now
      let tx = new TransactionBuilder()
        .from(utxos)
        .to("nexa:nqtsq5g5xyq35wvgfvhk73jy27rkv8tnetw5wfklg8jw6qpu", 10000)
        .signInput("2635aad9397b0d548ef4057636c6883e8a2f95423d82f391ad73d0b0a9d36b58", privkey, sighashtype)
        .build();
      
      expect(tx.inputs[1].scriptSig.toHex().endsWith('110201')).toBe(true);
      expect(tx.inputs[1].scriptSig.chunks[1].len).toBe(67);
      expect(tx.inputs[0].scriptSig.chunks.length).toBe(0);
      expect(tx.inputs[2].scriptSig.chunks.length).toBe(0);

      let sig = Signature.fromTxFormat(tx.inputs[1].scriptSig.chunks[1].buf!);
      let sigType = SighashType.fromBuffer(tx.inputs[1].scriptSig.chunks[1].buf!.subarray(64));
      expect(TxSigner.verify(tx, 1, sig, sigType, tx.inputs[1].getSubscript(), privkey.publicKey)).toBe(true);
    });
  });
});