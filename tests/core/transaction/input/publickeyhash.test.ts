import { describe, expect, test } from "vitest";
import type { IInput } from "../../../../src/core/transaction/interfaces";
import { PrivateKey, Script, ScriptFactory, SighashType } from "../../../../src";
import PublicKeyHashInput from "../../../../src/core/transaction/input/publickeyhash";
import Output from "../../../../src/core/transaction/output";
import Signature from "../../../../src/crypto/signature";
import TxSignature from "../../../../src/core/transaction/txsignature";

describe('PublicKeyHashInput', () => {

  let vin: IInput = {
    amount: '1000022086',
    outpoint: "d9f77974b326631688d4e965e7047486a073fd890cb06361c7f4d57aa54bd829",
    scriptSig: Script.empty(),
    type: 0,
    sequenceNumber: 0xffffffff - 1 
  }

  let privKey1 = new PrivateKey();
  let privKey2 = new PrivateKey();
  let script = ScriptFactory.buildPublicKeyHashOut(privKey1.publicKey);

  describe("#getSubscript", () => {
    test("should fail on subscript if output not provided", () => {
      let input = new PublicKeyHashInput(vin);
      expect(() => input.getSubscript()).toThrow("missing associated output");
    });

    test("should return subscript as output scriptPubKey", () => {
      let input = new PublicKeyHashInput(vin);
      let script = ScriptFactory.buildPublicKeyHashOut(new PrivateKey().publicKey);
      input.output = new Output(1000n, script, 0);
      expect(input.getSubscript().toHex()).toBe(script.toHex());
    });
  });
  
  describe("#canSign", () => {

    test("should return false if output not provided or privkey not match", () => {
      let input = new PublicKeyHashInput(vin);
      expect(input.canSign(privKey1)).toBe(false);

      input.output = new Output(1000n, script, 0);
      expect(input.canSign(privKey2)).toBe(false);
    });

    test("should return true if privkey match", () => {
      let input = new PublicKeyHashInput(vin);
      input.output = new Output(1000n, script, 0);
      expect(input.canSign(privKey1)).toBe(true);
    });
  });

  describe("#isFullySigned", () => {
    test("should return false if scriptSig missing", () => {
      let input = new PublicKeyHashInput(vin);
      expect(input.isFullySigned()).toBe(false);
    });

    test("should return false if scriptSig not pkh-in", () => {
      let input = new PublicKeyHashInput(vin);
      input.scriptSig = ScriptFactory.buildPublicKeyHashOut(new PrivateKey().publicKey);
      expect(input.isFullySigned()).toBe(false);
    });

    test("should return true if scriptSig is pkh-in", () => {
      let signature = Signature.fromString('046fa2f97d628bcfd5476c3d4b0440341fd537ca5680d975a577d578d4c29d350631709e336719db5464db3d12c84c6c953891821edb757abf4f288781dddbb4');
      let input = new PublicKeyHashInput(vin);
      input.addSignature(new TxSignature({
        inputIndex: 0,
        publicKey: privKey1.publicKey,
        signature: signature,
        sigType: SighashType.ALL,
        subscript: script
      }));

      expect(input.scriptSig.isPublicKeyHashIn()).toBe(true);
      expect(input.isFullySigned()).toBe(true);
    });
  });

  describe("#estimateSize", () => {
    test("should estimate without signature", () => {
      let input = new PublicKeyHashInput(vin);
      expect(input.isFullySigned()).toBe(false);
      expect(input.estimateSize()).toBe(145);
    });

    test("should estimate with signature", () => {
      let signature = Signature.fromString('046fa2f97d628bcfd5476c3d4b0440341fd537ca5680d975a577d578d4c29d350631709e336719db5464db3d12c84c6c953891821edb757abf4f288781dddbb4');
      let input = new PublicKeyHashInput(vin);
      input.addSignature(new TxSignature({
        inputIndex: 0,
        publicKey: privKey1.publicKey,
        signature: signature,
        sigType: SighashType.ALL,
        subscript: script
      }));

      expect(input.isFullySigned()).toBe(true);
      expect(input.estimateSize()).toBe(145);
    });
  });
});