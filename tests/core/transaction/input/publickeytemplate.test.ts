import { describe, expect, test } from "vitest";
import type { IInput } from "../../../../src/core/transaction/interfaces";
import { Opcode, PrivateKey, Script, ScriptFactory, SighashType } from "../../../../src";
import PublicKeyTemplateInput from "../../../../src/core/transaction/input/publickeytemplate";
import Output from "../../../../src/core/transaction/output";
import Signature from "../../../../src/crypto/signature";
import TxSignature from "../../../../src/core/transaction/txsignature";

describe('PublicKeyTemplateInput', () => {

  let vin: IInput = {
    amount: '1000022086',
    outpoint: "d9f77974b326631688d4e965e7047486a073fd890cb06361c7f4d57aa54bd829",
    scriptSig: Script.empty(),
    type: 0,
    sequenceNumber: 0xffffffff - 1 
  }

  let privKey1 = new PrivateKey();
  let privKey2 = new PrivateKey();
  let script = ScriptFactory.buildScriptTemplateOut(privKey1.publicKey);

  describe("#getSubscript", () => {
    test("should return known template as subscript even if output not provided", () => {
      let input = new PublicKeyTemplateInput(vin);
      expect(input.getSubscript().toHex()).toBe(Script.empty().add(Opcode.OP_FROMALTSTACK).add(Opcode.OP_CHECKSIGVERIFY).toHex());
    });

    test("should return known template as subscript on grouped script", () => {
      let input = new PublicKeyTemplateInput(vin);
      let script = ScriptFactory.buildScriptTemplateOut(privKey1.publicKey, 'nexa:tpzm4zwghn3mus4c3tvq7ewfncrad5u4g8zad30stmapu39knqqqqx4x3rhhm', 5000n);
      input.output = new Output(1000n, script, 0);
      expect(input.getSubscript().toHex()).toBe(Script.empty().add(Opcode.OP_FROMALTSTACK).add(Opcode.OP_CHECKSIGVERIFY).toHex());
    });
  });
  
  describe("#canSign", () => {

    test("should return false if output not provided or privkey not match", () => {
      let input = new PublicKeyTemplateInput(vin);
      expect(input.canSign(privKey1)).toBe(false);

      input.output = new Output(1000n, script, 0);
      expect(input.canSign(privKey2)).toBe(false);
    });

    test("should return true if privkey match", () => {
      let input = new PublicKeyTemplateInput(vin);
      input.output = new Output(1000n, script, 0);
      expect(input.canSign(privKey1)).toBe(true);
    });
  });

  describe("#isFullySigned", () => {
    test("should return false if scriptSig missing", () => {
      let input = new PublicKeyTemplateInput(vin);
      expect(input.isFullySigned()).toBe(false);
    });

    test("should return false if scriptSig not pkt-in", () => {
      let signature = Signature.fromString('046fa2f97d628bcfd5476c3d4b0440341fd537ca5680d975a577d578d4c29d350631709e336719db5464db3d12c84c6c953891821edb757abf4f288781dddbb4');
      let input = new PublicKeyTemplateInput(vin);
      input.scriptSig = ScriptFactory.buildPublicKeyHashIn(new PrivateKey().publicKey, signature);
      expect(input.isFullySigned()).toBe(false);
    });

    test("should return true if scriptSig is pkt-in", () => {
      let signature = Signature.fromString('046fa2f97d628bcfd5476c3d4b0440341fd537ca5680d975a577d578d4c29d350631709e336719db5464db3d12c84c6c953891821edb757abf4f288781dddbb4');
      let input = new PublicKeyTemplateInput(vin);
      input.addSignature(new TxSignature({
        inputIndex: 0,
        publicKey: privKey1.publicKey,
        signature: signature,
        sigType: SighashType.ALL,
        subscript: script
      }));

      expect(input.scriptSig.isPublicKeyTemplateIn()).toBe(true);
      expect(input.isFullySigned()).toBe(true);
    });
  });

  describe("#estimateSize", () => {
    test("should estimate without signature", () => {
      let input = new PublicKeyTemplateInput(vin);
      expect(input.isFullySigned()).toBe(false);
      expect(input.estimateSize()).toBe(146);
    });

    test("should estimate with signature", () => {
      let signature = Signature.fromString('046fa2f97d628bcfd5476c3d4b0440341fd537ca5680d975a577d578d4c29d350631709e336719db5464db3d12c84c6c953891821edb757abf4f288781dddbb4');
      let input = new PublicKeyTemplateInput(vin);
      input.addSignature(new TxSignature({
        inputIndex: 0,
        publicKey: privKey1.publicKey,
        signature: signature,
        sigType: SighashType.ALL,
        subscript: script
      }));

      expect(input.isFullySigned()).toBe(true);
      expect(input.estimateSize()).toBe(146);
    });
  });
});