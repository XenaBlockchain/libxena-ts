import { describe, expect, test } from "vitest";
import UnspentOutput from "../../../src/core/transaction/unspentoutput";
import type { UTXO } from "../../../src/core/transaction/interfaces";

describe('UnspentOutput', () => {

  let sampleData1: UTXO = {
    outpoint: '6edf63608beb7988e78943dec5bcf054bcc37830f3cd02fdeafd432023b290ba',
    scriptPubKey: 'OP_0 OP_1 20 0x9a4359fa456808ad6dafac55cf3f58e1490b8168',
    satoshis: 5874591n
  };

  let sampleData2: UTXO = {
    outpoint: '36fe45350bd5959fa0dfd3c5d00cbd3f300f8f7dab3c420678ef16805a475a9a',
    scriptPubKey: '005114a3587bbd62f4307aaedcaebb9ce809e4b50f58f1',
    amount: '60725.26'
  };

  let sampleData3: UTXO = {
    outpoint: '36fe45350bd5959fa0dfd3c5d00cbd3f300f8f7dab3c420678ef16805a475a9a',
    address: 'nexa:nqtsq5g55dv8h0tz7sc84tku46aee6qfuj6s7k83r2z0u0fv',
    amount: '60725.26'
  };

  test('roundtrip from raw data', () => {
    expect(new UnspentOutput(sampleData2).toObject()).toEqual(sampleData2);
  });

  test('script and address conversion', () => {
    expect(new UnspentOutput(sampleData3).toObject()).toEqual(sampleData2);
  });

  test('fails if no outpoint is provided', () => {
    expect(() => new UnspentOutput({} as any)).toThrow("Invalid outpoint hash");
  });

  test('displays nicely on the console', () => {
    let expected = '<UnspentOutput: 6edf63608beb7988e78943dec5bcf054bcc37830f3cd02fdeafd432023b290ba' +
                   ', satoshis: 5874591, script: OP_0 OP_1 20 0x9a4359fa456808ad6dafac55cf3f58e1490b8168>';
    expect(new UnspentOutput(sampleData1).inspect()).toBe(expected);
  });

  describe('checking the constructor parameters', () => {
    let noAmount = {
      outpoint: '36fe45350bd5959fa0dfd3c5d00cbd3f300f8f7dab3c420678ef16805a475a9a',
      scriptPubKey: 'OP_DUP OP_HASH160 20 0x88d9931ea73d60eaf7e5671efc0552b912911f2a OP_EQUALVERIFY OP_CHECKSIG',
    };
    let zero = {
      outpoint: '36fe45350bd5959fa0dfd3c5d00cbd3f300f8f7dab3c420678ef16805a475a9a',
      scriptPubKey: 'OP_DUP OP_HASH160 20 0x88d9931ea73d60eaf7e5671efc0552b912911f2a OP_EQUALVERIFY OP_CHECKSIG',
      amount: '0'
    };
    let noScript = {
      outpoint: '36fe45350bd5959fa0dfd3c5d00cbd3f300f8f7dab3c420678ef16805a475a9a',
      amount: '0'
    };
    let notHex = {
      outpoint: 'myoutpoint',
      scriptPubKey: 'OP_DUP OP_HASH160 20 0x88d9931ea73d60eaf7e5671efc0552b912911f2a OP_EQUALVERIFY OP_CHECKSIG',
      amount: '0'
    };
    test('fails when no amount is defined', () => {
      expect(() => new UnspentOutput(noAmount)).toThrow('Must provide satoshis or amount');
    });
    test('fails when no script is defined', () => {
      expect(() => new UnspentOutput(noScript)).toThrow('Must provide script or address');
    });
    test('fails when outpoint is not hex', () => {
      expect(() => new UnspentOutput(notHex)).toThrow('Invalid outpoint hash');
    });
    test('does not fail when amount is zero', () => {
      expect(() => new UnspentOutput(zero)).not.toThrow();
    });
  });

  test('toString returns outpoint hash', () => {
    let expected = '6edf63608beb7988e78943dec5bcf054bcc37830f3cd02fdeafd432023b290ba';
    expect(new UnspentOutput(sampleData1).toString()).toBe(expected);
  });

  test('to/from JSON roundtrip', () => {
    let utxo = new UnspentOutput(sampleData2);
    let obj = UnspentOutput.fromObject(utxo.toJSON()).toObject();
    expect(obj).toEqual(sampleData2);

    let str = JSON.stringify(UnspentOutput.fromObject(obj));
    expect(JSON.parse(str)).toEqual(sampleData2);

    let str2 = JSON.stringify(new UnspentOutput(JSON.parse(str)));
    expect(JSON.parse(str2)).toEqual(sampleData2);
  });
});