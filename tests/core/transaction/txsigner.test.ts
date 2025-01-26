import { describe, expect, test } from "vitest";
import { Opcode, Output, OutputType, PrivateKey, PublicKey, PublicKeyTemplateInput, Script, SighashType, Transaction } from "../../../src";
import TxSigner from "../../../src/core/transaction/txsigner";
import Signature from "../../../src/crypto/signature";

describe("TxSigner", () => {

  const privkey = new PrivateKey();
  const tx_1_hex = "000100586bd3a9b0d073ad91f3823d42952f8a3e88c6367605f48e540d7b39d9aa351664222103d5a8794dab5d72ebbd852e472d2beb8771a7271ae94deac24aaa20405508555b4080dd1d4e9bcd71af0f99030c568efc5d86bb15afc2e999de1ef1c209065b49bc1e5432bed9c365e2ef0a8eadc67732efd465db59797498fe7deff99a3b74ab2ffeffffff42520f000000000002013885010000000000170051147c3c698ab7d549fd2111a4015515aa78ac7098e9012fcc0d000000000017005114022f2ba4af739b538ecdc8036eaaa37233be98fa94e00a00"

  let tx_1 = new Transaction();
  tx_1.addInput(new PublicKeyTemplateInput({ 
    amount: 1004098n,
    outpoint: "1635aad9397b0d548ef4057636c6883e8a2f95423d82f391ad73d0b0a9d36b58",
    scriptSig: "222103d5a8794dab5d72ebbd852e472d2beb8771a7271ae94deac24aaa20405508555b4080dd1d4e9bcd71af0f99030c568efc5d86bb15afc2e999de1ef1c209065b49bc1e5432bed9c365e2ef0a8eadc67732efd465db59797498fe7deff99a3b74ab2f",
    type: 0,
    sequenceNumber: 4294967294,
    output: new Output(1004098n, "00511431011a39884b2f6f46445787661d73cadd4726df", OutputType.TEMPLATE)
  }));
  tx_1.addOutput(new Output(99640n, "0051147c3c698ab7d549fd2111a4015515aa78ac7098e9", OutputType.TEMPLATE));
  tx_1.addOutput(new Output(904239n, "005114022f2ba4af739b538ecdc8036eaaa37233be98fa", OutputType.TEMPLATE));
  tx_1.nLockTime = 712852;

  test("should verify this known tx", () => {
    let tx = new Transaction(tx_1_hex);
    let pkey = PublicKey.from(tx.inputs[0].scriptSig.getPublicKey());
    let sig = Signature.fromBuffer(tx.inputs[0].scriptSig.chunks[1].buf!);
    let wellKnownTemplate = Script.empty().add(Opcode.OP_FROMALTSTACK).add(Opcode.OP_CHECKSIGVERIFY);
    expect(TxSigner.verify(tx, 0, sig, SighashType.ALL, wellKnownTemplate, pkey)).toBe(true);
    expect(TxSigner.verify(tx, 0, sig, SighashType.ALL, wellKnownTemplate, privkey.publicKey)).toBe(false);
  });

  test("roundtrip sign/verify with all sighash types", () => {
    let sighashType = new SighashType();
    let sig_all = TxSigner.sign(tx_1, 0, sighashType, tx_1.inputs[0].getSubscript(), privkey);
    expect(sig_all).toBeDefined();
    expect(TxSigner.verify(tx_1, 0, sig_all, sighashType, tx_1.inputs[0].getSubscript(), privkey.publicKey)).toBe(true);

    sighashType = new SighashType().setFirstNIn(1);
    let sig_in1 = TxSigner.sign(tx_1, 0, sighashType, tx_1.inputs[0].getSubscript(), privkey);
    expect(sig_in1).toBeDefined();
    expect(TxSigner.verify(tx_1, 0, sig_in1, sighashType, tx_1.inputs[0].getSubscript(), privkey.publicKey)).toBe(true);

    sighashType = new SighashType().setAnyoneCanPay();
    let sig_this_in = TxSigner.sign(tx_1, 0, sighashType, tx_1.inputs[0].getSubscript(), privkey);
    expect(sig_this_in).toBeDefined();
    expect(TxSigner.verify(tx_1, 0, sig_this_in, sighashType, tx_1.inputs[0].getSubscript(), privkey.publicKey)).toBe(true);

    sighashType = new SighashType().setFirstNOut(2);
    let sig_out2 = TxSigner.sign(tx_1, 0, sighashType, tx_1.inputs[0].getSubscript(), privkey);
    expect(sig_out2).toBeDefined();
    expect(TxSigner.verify(tx_1, 0, sig_out2, sighashType, tx_1.inputs[0].getSubscript(), privkey.publicKey)).toBe(true);

    sighashType = new SighashType().setFirstNIn(1).setFirstNOut(2);
    let sig_in1_out2 = TxSigner.sign(tx_1, 0, sighashType, tx_1.inputs[0].getSubscript(), privkey);
    expect(sig_in1_out2).toBeDefined();
    expect(TxSigner.verify(tx_1, 0, sig_in1_out2, sighashType, tx_1.inputs[0].getSubscript(), privkey.publicKey)).toBe(true);
    // preimage should be different than ALL even if first1|first2 and ALL is the same thing
    expect(sig_all.toString()).not.toBe(sig_in1_out2.toString());
    expect(TxSigner.verify(tx_1, 0, sig_all, sighashType, tx_1.inputs[0].getSubscript(), privkey.publicKey)).toBe(false);

    sighashType = new SighashType().set2Out(0, 1);
    let sig_2out = TxSigner.sign(tx_1, 0, sighashType, tx_1.inputs[0].getSubscript(), privkey);
    expect(sig_2out).toBeDefined();
    expect(TxSigner.verify(tx_1, 0, sig_2out, sighashType, tx_1.inputs[0].getSubscript(), privkey.publicKey)).toBe(true);

    sighashType = new SighashType().setFirstNIn(1).set2Out(0, 1);
    let sig_in1_2out = TxSigner.sign(tx_1, 0, sighashType, tx_1.inputs[0].getSubscript(), privkey);
    expect(sig_in1_2out).toBeDefined();
    expect(TxSigner.verify(tx_1, 0, sig_in1_2out, sighashType, tx_1.inputs[0].getSubscript(), privkey.publicKey)).toBe(true);

    sighashType = new SighashType().setFirstNIn(1).setFirstNOut(1);
    let sig_in1_out1 = TxSigner.sign(tx_1, 0, sighashType, tx_1.inputs[0].getSubscript(), privkey);
    expect(sig_in1_out1).toBeDefined();
    expect(TxSigner.verify(tx_1, 0, sig_in1_out1, sighashType, tx_1.inputs[0].getSubscript(), privkey.publicKey)).toBe(true);
  });

  test("should fail if sighashtype is out of range", () => {
    let privkey = new PrivateKey();

    let sighashType = new SighashType().setFirstNIn(2);
    expect(() => TxSigner.sign(tx_1, 0, sighashType, tx_1.inputs[0].getSubscript(), privkey)).toThrow("out of range");

    sighashType = new SighashType().setAnyoneCanPay();
    expect(() => TxSigner.sign(tx_1, 1, sighashType, tx_1.inputs[0].getSubscript(), privkey)).toThrow("out of range");

    sighashType = new SighashType().setFirstNOut(3);
    expect(() => TxSigner.sign(tx_1, 0, sighashType, tx_1.inputs[0].getSubscript(), privkey)).toThrow("out of range");
    
    sighashType = new SighashType().set2Out(0, 2);
    expect(() => TxSigner.sign(tx_1, 0, sighashType, tx_1.inputs[0].getSubscript(), privkey)).toThrow("out of range");

    sighashType = new SighashType().set2Out(2, 1);
    expect(() => TxSigner.sign(tx_1, 0, sighashType, tx_1.inputs[0].getSubscript(), privkey)).toThrow("out of range");
  });
  
});