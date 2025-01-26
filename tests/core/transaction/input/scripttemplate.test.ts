import { describe, expect, test } from "vitest";
import type { IInput } from "../../../../src/core/transaction/interfaces";
import { Opcode, PrivateKey, Script, ScriptFactory, SighashType } from "../../../../src";
import PublicKeyTemplateInput from "../../../../src/core/transaction/input/publickeytemplate";
import Output from "../../../../src/core/transaction/output";
import Signature from "../../../../src/crypto/signature";
import TxSignature from "../../../../src/core/transaction/txsignature";
import ScriptTemplateInput from "../../../../src/core/transaction/input/scripttemplate";

describe('ScriptTemplateInput', () => {

  let template = Script.fromHex('6c756cb1756cad');
  let constraint = Script.fromHex('2102371b6955629ea6fd014b9e14612e72de2729d33ff26ad20b9e7c558c6a611221');
  let satisfier = new Script('64 0x6b91229ab013bf986f3c8a0cfe567c4e0e5f02547e85ec44a9a61caec6aa853ca34f9ba2271716f6098f94df8ccbf06db33473c006b3ff0ce716bf012c7f6af2');
  let privkey = PrivateKey.fromString("6KJKgQUXewXCgCuERNb1v8UfiZ25gXD56kJud9ggrRtetidDz9Rd");
  let pubkey = privkey.publicKey;

  let vin: IInput = {
    amount: '1000022086',
    outpoint: "d9f77974b326631688d4e965e7047486a073fd890cb06361c7f4d57aa54bd829",
    scriptSig: Script.empty(),
    type: 0,
    sequenceNumber: 0xffffffff - 1 
  }

  let privKey2 = new PrivateKey();

  describe("instantiation", () => {

    test("should fail without template data", () => {
      expect(() => new ScriptTemplateInput({} as any)).toThrow("Missing template object");
    });

    test("should fail without utxo data", () => {
      let obj = {
        templateData: {
          templateScript: "",
          constraintScript: ""
        }
      }
      expect(() => new ScriptTemplateInput(obj as any)).toThrow("Missing associated utxo");
    });

    test("should fail with invalid template", () => {
      let obj = {
        output: new Output("5000", ""),
        templateData: {
          templateScript: 3,
          constraintScript: 3
        }
      }
      expect(() => new ScriptTemplateInput(obj as any)).toThrow("Invalid template");
    });

    test("should fail with invalid template", () => {
      let obj = {
        output: new Output("5000", ""),
        templateData: {
          templateScript: Script.empty(),
          constraintScript: 3
        }
      }
      expect(() => new ScriptTemplateInput(obj as any)).toThrow("Invalid constraint");
    });

    test("should fail with invalid pubkey if provided", () => {
      let obj = {
        output: new Output("5000", ""),
        templateData: {
          templateScript: Script.empty(),
          constraintScript: 0,
          publicKey: 3
        }
      }
      expect(() => new ScriptTemplateInput(obj as any)).toThrow("Invalid pubkey");
    });

    test("should fail if template is not valid script", () => {
      let obj = {
        ...vin,
        output: {
          type: 1,
          value: 1000022086n,
          scriptPubKey: Script.empty().add('OP_0').add('OP_1').add(Buffer.alloc(20))
        },
        templateData: {
          templateScript: template,
          constraintScript: constraint,
        }
      }
      expect(() => new ScriptTemplateInput(obj)).toThrow("Provided template doesn't match to the provided output");

      let obj2 = {
        ...vin,
        output: {
          type: 1,
          value: 1000022086n,
          scriptPubKey: ScriptFactory.buildScriptTemplateOut("nexa:nqcqq9zxrtf9pqwtqyvaqdpctlc4fjxn444a6as5vgwx6eyj9lzaksl3y7ndm6wmvggg29suqvgwkz25ga52jne6")
        },
        templateData: {
          templateScript: new Script(template).add(2),
          constraintScript: constraint,
        }
      }
      expect(() => new ScriptTemplateInput(obj2)).toThrow("Provided template doesn't match to the provided output");
    });

    test("should fail if constraint is not valid script", () => {
      let obj = {
        ...vin,
        output: {
          type: 1,
          value: 1000022086n,
          scriptPubKey: ScriptFactory.buildScriptTemplateOut("nexa:nqcqq9zxrtf9pqwtqyvaqdpctlc4fjxn444a6as5vgwx6eyj9lzaksl3y7ndm6wmvggg29suqvgwkz25ga52jne6"),
        },
        templateData: {
          templateScript: template,
          constraintScript: new Script(constraint).add(2),
        }
      }
      expect(() => new ScriptTemplateInput(obj)).toThrow("Provided constraint doesn't match to the provided output");

      let obj2 = {
        ...vin,
        output: {
          type: 1,
          value: 1000022086n,
          scriptPubKey: ScriptFactory.buildScriptTemplateOut("nexa:nqcqq9zxrtf9pqwtqyvaqdpctlc4fjxn444a6as5vgwx6eyj9lzaksl3y7ndm6wmvggg29suqvgwkz25ga52jne6"),
        },
        templateData: {
          templateScript: template,
          constraintScript: Opcode.OP_FALSE,
        }
      }
      expect(() => new ScriptTemplateInput(obj2)).toThrow("Provided constraint doesn't match to the provided output");
    });

    test("should build from valid input", () => {
      let obj = {
        ...vin,
        output: {
          type: 1,
          value: 1000022086n,
          scriptPubKey: ScriptFactory.buildScriptTemplateOut("nexa:nqcqq9zxrtf9pqwtqyvaqdpctlc4fjxn444a6as5vgwx6eyj9lzaksl3y7ndm6wmvggg29suqvgwkz25ga52jne6"),
        },
        templateData: {
          templateScript: template,
          constraintScript: constraint,
        }
      }
      let in1 = new ScriptTemplateInput(obj);
      expect(in1).toBeDefined();

      let obj2 = {
        ...vin,
        output: {
          type: 1,
          value: 1000022086n,
          scriptPubKey: ScriptFactory.buildScriptTemplateOut("nexa:nqcqq9zxrtf9pqwtqyvaqdpctlc4fjxn444a6as5vgwx6eyj9lzaksl3y7ndm6wmvggg29suqvgwkz25ga52jne6"),
        },
        templateData: {
          templateScript: template.toHex(),
          constraintScript: constraint.toHex(),
        }
      }
      let in2 = new ScriptTemplateInput(obj2);
      expect(in2).toBeDefined();
      expect(in1).toEqual(in2);

      let obj3 = {
        ...vin,
        output: {
          type: 1,
          value: 1000022086n,
          scriptPubKey: ScriptFactory.buildScriptTemplateOut("nexa:nqcqq9zxrtf9pqwtqyvaqdpctlc4fjxn444a6as5vgwx6eyj9lzaksl3y7ndm6wmvggg29suqvgwkz25ga52jne6"),
        },
        templateData: {
          templateScript: template,
          constraintScript: constraint,
          publicKey: pubkey
        }
      }
      let in3 = new ScriptTemplateInput(obj3);
      expect(in3).toBeDefined();

      let obj4 = {
        ...vin,
        output: {
          type: 1,
          value: 1000022086n,
          scriptPubKey: ScriptFactory.buildScriptTemplateOut("nexa:nqcqq9zxrtf9pqwtqyvaqdpctlc4fjxn444a6as5vgwx6eyj9lzaksl3y7ndm6wmvggg29suqvgwkz25ga52jne6"),
        },
        templateData: {
          templateScript: template.toHex(),
          constraintScript: constraint.toHex(),
          publicKey: pubkey.toString()
        }
      }
      let in4 = new ScriptTemplateInput(obj4);
      expect(in4).toBeDefined();
      expect(in3.publicKey!.toString()).toBe(in4.publicKey!.toString());
      in3.publicKey = undefined;
      in4.publicKey = undefined;
      expect(in3).toEqual(in4);
    });

    test('fromObject should work', () => {
      expect(() => ScriptTemplateInput.fromObject(12 as any)).toThrow("Invalid Argument");
      expect(() => ScriptTemplateInput.fromObject(undefined as any)).toThrow("Invalid Argument");

      let obj = {
        ...vin,
        output: {
          type: 1,
          value: 1000022086n,
          scriptPubKey: ScriptFactory.buildScriptTemplateOut("nexa:nqcqq9zxrtf9pqwtqyvaqdpctlc4fjxn444a6as5vgwx6eyj9lzaksl3y7ndm6wmvggg29suqvgwkz25ga52jne6"),
        },
        templateData: {
          templateScript: template,
          constraintScript: constraint,
          publicKey: pubkey
        }
      }
      let input = ScriptTemplateInput.fromObject(obj);
      expect(input).toBeDefined();
      expect(input.templateScript).toEqual(obj.templateData.templateScript);
      expect(input.constraintScript).toEqual(obj.templateData.constraintScript);
      expect(input.publicKey?.toString()).toEqual(obj.templateData.publicKey.toString());
    });

    test('toObject should work', () => {
      let obj = {
        ...vin,
        output: {
          type: 1,
          value: 1000022086n,
          scriptPubKey: ScriptFactory.buildScriptTemplateOut("nexa:nqcqq9zxrtf9pqwtqyvaqdpctlc4fjxn444a6as5vgwx6eyj9lzaksl3y7ndm6wmvggg29suqvgwkz25ga52jne6"),
        },
        templateData: {
          templateScript: template,
          constraintScript: constraint,
          publicKey: pubkey
        }
      }
      let input = ScriptTemplateInput.fromObject(obj);
      let inObj = input.toObject();
      expect(ScriptTemplateInput.fromObject(inObj).toObject()).toEqual(inObj);

      input.constraintScript = Opcode.OP_FALSE;
      inObj = input.toObject();
      expect(inObj.templateData!.constraintScript).toBe(0)
    });
  });

  describe("#getSubscript", () => {
    let obj = {
      ...vin,
      output: {
        type: 1,
        value: 1000022086n,
        scriptPubKey: ScriptFactory.buildScriptTemplateOut("nexa:nqcqq9zxrtf9pqwtqyvaqdpctlc4fjxn444a6as5vgwx6eyj9lzaksl3y7ndm6wmvggg29suqvgwkz25ga52jne6"),
      },
      templateData: {
        templateScript: template,
        constraintScript: constraint,
      }
    }
    let input = new ScriptTemplateInput(obj);

    test("should return the template as subscript", () => {
      expect(input.getSubscript().toHex()).toBe(template.toHex());

      input.templateScript = new Script(template).add(2);
      expect(input.getSubscript().toHex()).toBe(new Script(template).add(2).toHex());
    });
  });
  
  describe("#canSign", () => {

    let obj = {
      ...vin,
      output: {
        type: 1,
        value: 1000022086n,
        scriptPubKey: ScriptFactory.buildScriptTemplateOut("nexa:nqcqq9zxrtf9pqwtqyvaqdpctlc4fjxn444a6as5vgwx6eyj9lzaksl3y7ndm6wmvggg29suqvgwkz25ga52jne6"),
      },
      templateData: {
        templateScript: template,
        constraintScript: constraint
      }
    }

    test("should return false if pubkey not provided or privkey not match", () => {
      let input = ScriptTemplateInput.fromObject(obj);
      expect(input.canSign(privkey)).toBe(false);

      input.publicKey = pubkey;
      expect(input.canSign(privKey2)).toBe(false);
    });

    test("should return true if privkey match", () => {
      let input = ScriptTemplateInput.fromObject(obj);
      input.publicKey = pubkey;
      expect(input.canSign(privkey)).toBe(true);
    });
  });

  describe("#isFullySigned", () => {
    let obj = {
      ...vin,
      output: {
        type: 1,
        value: 1000022086n,
        scriptPubKey: ScriptFactory.buildScriptTemplateOut("nexa:nqcqq9zxrtf9pqwtqyvaqdpctlc4fjxn444a6as5vgwx6eyj9lzaksl3y7ndm6wmvggg29suqvgwkz25ga52jne6"),
      },
      templateData: {
        templateScript: template,
        constraintScript: constraint,
        publicKey: pubkey
      }
    }

    test("should return false if scriptSig missing", () => {
      let input = new ScriptTemplateInput(obj);
      expect(input.isFullySigned()).toBe(false);
    });

    test("should return false if scriptSig not pst-in", () => {
      let signature = Signature.fromString('046fa2f97d628bcfd5476c3d4b0440341fd537ca5680d975a577d578d4c29d350631709e336719db5464db3d12c84c6c953891821edb757abf4f288781dddbb4');
      let input = new PublicKeyTemplateInput(vin);
      input.scriptSig = ScriptFactory.buildPublicKeyHashIn(new PrivateKey().publicKey, signature);
      expect(input.isFullySigned()).toBe(false);
    });

    test("should return false if scriptSig has wrong template", () => {
      let input = new ScriptTemplateInput(obj);
      input.scriptSig = ScriptFactory.buildScriptTemplateIn(new Script(template).add(2), constraint, satisfier);
      expect(input.isFullySigned()).toBe(false);
    });

    test("should return false if scriptSig has wrong constraint", () => {
      let input = new ScriptTemplateInput(obj);
      input.scriptSig = ScriptFactory.buildScriptTemplateIn(template, new Script(constraint).add(2), satisfier);
      expect(input.isFullySigned()).toBe(false);
    });

    test("should return true if scriptSig is pst-in and template+constraint match", () => {
      let signature = Signature.fromString('046fa2f97d628bcfd5476c3d4b0440341fd537ca5680d975a577d578d4c29d350631709e336719db5464db3d12c84c6c953891821edb757abf4f288781dddbb4');
      let input = new ScriptTemplateInput(obj);
      input.addSignature(new TxSignature({
        inputIndex: 0,
        publicKey: pubkey,
        signature: signature,
        sigType: SighashType.ALL,
        subscript: input.getSubscript()
      }));

      expect(input.isFullySigned()).toBe(true);
    });
  });

  describe("#estimateSize", () => {
    let obj = {
      ...vin,
      output: {
        type: 1,
        value: 1000022086n,
        scriptPubKey: ScriptFactory.buildScriptTemplateOut("nexa:nqcqq9zxrtf9pqwtqyvaqdpctlc4fjxn444a6as5vgwx6eyj9lzaksl3y7ndm6wmvggg29suqvgwkz25ga52jne6"),
      },
      templateData: {
        templateScript: template,
        constraintScript: constraint,
        publicKey: pubkey
      }
    }

    test("should estimate without signature", () => {
      let input = new ScriptTemplateInput(obj);
      expect(input.isFullySigned()).toBe(false);
      expect(input.estimateSize()).toBe(1 + 32 + 1 + 108 + 4 + 8);
    });

    test("should estimate with signature", () => {
      let signature = Signature.fromString('046fa2f97d628bcfd5476c3d4b0440341fd537ca5680d975a577d578d4c29d350631709e336719db5464db3d12c84c6c953891821edb757abf4f288781dddbb4');
      let input = new ScriptTemplateInput(obj);
      input.addSignature(new TxSignature({
        inputIndex: 0,
        publicKey: pubkey,
        signature: signature,
        sigType: SighashType.ALL,
        subscript: input.getSubscript()
      }));

      expect(input.isFullySigned()).toBe(true);
      expect(input.estimateSize()).toBe(1 + 32 + 1 + 108 + 4 + 8);
    });

    test("should estimate with big script", () => {
      let input = new ScriptTemplateInput(obj);
      input.constraintScript = constraint.add(constraint.toBuffer()).add(constraint.toBuffer()).add(constraint.toBuffer());

      expect(input.estimateSize()).toBe(1 + 32 + 3 + 356 + 4 + 8);
    });
  });
});