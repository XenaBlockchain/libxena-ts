import { describe, expect, test } from "vitest";
import TxSignature from "../../../src/core/transaction/txsignature";
import { Opcode, PrivateKey, Script, SighashType } from "../../../src";
import Signature from "../../../src/crypto/signature";

describe("TxSignature", () => {
  
  const mockPublicKey = new PrivateKey().publicKey;
  const mockSubscript = Script.empty().add(Opcode.OP_FROMALTSTACK).add(Opcode.OP_CHECKSIGVERIFY);
  const mockSignature = Signature.fromString('b3421028b6ec39e85148ce517c6484c31dcd54f241fec44d1334dc46c4d8e555c5ca06a37f3bb799806abb3035aec03c626ba9089e5f8fd3738837989dd2cacb');
  const mockSigType = SighashType.ALL;

  test('should instantiate TxSignature correctly with valid arguments', () => {
    const validArgs = {
      publicKey: mockPublicKey,
      inputIndex: 0,
      subscript: mockSubscript,
      signature: mockSignature,
      sigType: mockSigType
    };

    const txSignature = new TxSignature(validArgs);

    expect(txSignature.inputIndex).toBe(validArgs.inputIndex);
    expect(txSignature.publicKey).toBe(validArgs.publicKey);
    expect(txSignature.subscript).toBe(validArgs.subscript);
    expect(txSignature.signature).toBe(validArgs.signature);
    expect(txSignature.sigType).toBe(validArgs.sigType);
  });

  test('should handle string inputs and convert them correctly', () => {
    const validArgs = {
      publicKey: mockPublicKey.toString(),
      inputIndex: 1,
      subscript: mockSubscript.toHex(),
      signature: mockSignature.toString(),
      sigType: mockSigType.toString()
    };

    const txSignature = new TxSignature(validArgs);

    expect(txSignature.publicKey.toBuffer()).toEqual(mockPublicKey.toBuffer());
    expect(txSignature.subscript.toBuffer()).toEqual(mockSubscript.toBuffer());
    expect(txSignature.signature).toEqual(mockSignature);
    expect(txSignature.sigType).toEqual(mockSigType);
  });

  test('should throw error for invalid publicKey', () => {
    const invalidArgs = {
      publicKey: null,
      inputIndex: 1,
      subscript: mockSubscript,
      signature: mockSignature,
      sigType: mockSigType
    };

    expect(() => new TxSignature(invalidArgs as any)).toThrowError('publicKey');
  });

  test('should throw error for invalid subscript', () => {
    const invalidArgs = {
      publicKey: mockPublicKey,
      inputIndex: 1,
      subscript: null,
      signature: mockSignature,
      sigType: mockSigType
    };

    expect(() => new TxSignature(invalidArgs as any)).toThrowError('subscript');
  });

  test('should throw error for invalid inputIndex', () => {
    const invalidArgs = {
      publicKey: mockPublicKey,
      inputIndex: 'not-a-number',
      subscript: mockSubscript,
      signature: mockSignature,
      sigType: mockSigType
    };

    expect(() => new TxSignature(invalidArgs as any)).toThrowError('inputIndex must be a number');
  });

  test('should throw error for invalid signature', () => {
    const invalidArgs = {
      publicKey: mockPublicKey,
      inputIndex: 0,
      subscript: mockSubscript,
      signature: null,
      sigType: mockSigType
    };

    expect(() => new TxSignature(invalidArgs as any)).toThrowError('signature');
  });

  test('should throw error for invalid sigType', () => {
    const invalidArgs = {
      publicKey: mockPublicKey,
      inputIndex: 0,
      subscript: mockSubscript,
      signature: mockSignature,
      sigType: null
    };

    expect(() => new TxSignature(invalidArgs as any)).toThrowError('sigtype must be a sigtype object or string');
  });

  test('should convert to JSON correctly', () => {
    const validArgs = {
      publicKey: mockPublicKey,
      inputIndex: 0,
      subscript: mockSubscript,
      signature: mockSignature,
      sigType: mockSigType
    };

    const txSignature = new TxSignature(validArgs);
    const json = txSignature.toJSON();

    expect(json).toEqual({
      publicKey: validArgs.publicKey.toString(),
      inputIndex: validArgs.inputIndex,
      subscript: validArgs.subscript.toHex(),
      signature: validArgs.signature.toString(),
      sigType: validArgs.sigType.toString()
    });
  });

  test('should create instance from object', () => {
    const validArgs = {
      publicKey: mockPublicKey,
      inputIndex: 0,
      subscript: mockSubscript,
      signature: mockSignature,
      sigType: mockSigType
    };

    const txSignature = TxSignature.fromObject(validArgs);

    expect(txSignature.inputIndex).toBe(validArgs.inputIndex);
    expect(txSignature.publicKey).toBe(validArgs.publicKey);
    expect(txSignature.signature).toBe(validArgs.signature);
    expect(txSignature.sigType).toBe(validArgs.sigType);
  });

  test('should serialize satisfier correctly', () => {
    const validArgs = {
      publicKey: mockPublicKey,
      inputIndex: 0,
      subscript: mockSubscript,
      signature: mockSignature,
      sigType: SighashType.ALL
    };

    const txSignature = TxSignature.fromObject(validArgs);

    expect(txSignature.toTxSatisfier()).toEqual(txSignature.signature.toTxFormat());
    expect(txSignature.toTxSatisfier()).toEqual(txSignature.signature.toTxFormat(txSignature.sigType.toBuffer()));

    txSignature.sigType.setFirstNIn(1).setFirstNOut(1);
    expect(txSignature.toTxSatisfier()).not.toEqual(txSignature.signature.toTxFormat());
    expect(txSignature.toTxSatisfier()).toEqual(txSignature.signature.toTxFormat(txSignature.sigType.toBuffer()));
  })
});