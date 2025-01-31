import { describe, expect, test } from "vitest";
import PrivateKey from "../../src/keys/privatekey";
import Signature from "../../src/crypto/signature";
import Message from "../../src/core/message";
import { Address } from "../../src";

describe('Message', () => {
  let address = 'nexa:nqtsq5g5v20uv0cyzs6agt9keyls8r6w7sqcn079mtmdhklr';
  let badAddress = 'nexa:nqtsq5g567x44x5g54t2wsxz60zwqmyks63rkrddsfq94pd2';
  let privateKey = PrivateKey.fromWIF('6HZk5zTRZ144PtVa7bGfu6d3SPDf8kxN51U9xqYa2oQtwRKu3fxj');
  let text = 'hello, world';
  let signatureString = 'H60kekN+8JuK8N+tzCALHvXYLepn0zD1OJevvAsKsppBbctSQe0MJ6f3ePPvdyxpT0JOqcBDa9opbnyG014Htm0=';

  let badSignatureString = 'H69qZ4mbZCcvXk7CWjptD5ypnYVLvQ3eMXLM8+1gX21SLH/GaFnAjQrDn37+TDw79i9zHhbiMMwhtvTwnPigZ6k=';

  let signature = Signature.fromCompact(Buffer.from(signatureString, 'base64'));
  let badSignature = Signature.fromCompact(Buffer.from(badSignatureString, 'base64'));

  let publicKey = privateKey.toPublicKey();

  test('will error with incorrect message type', () => {
    expect(() => new Message(new Date() as any)).toThrow('First argument should be a string');
  });

  let signature2: Signature;
  let signature3: string;

  test('can sign a message', () => {
    let message2 = new Message(text);
    signature2 = (message2 as any)._sign(privateKey);
    signature3 = new Message(text).sign(privateKey);
    expect(signature2).toBeDefined();
    expect(signature3).toBeDefined();
  });

  test('sign will error with incorrect private key argument', () => {
    expect(() => {
      let message3 = new Message(text);
      return message3.sign('not a private key' as any);
    }).toThrow('First argument should be an instance of PrivateKey');
  });

  test('can verify a message with signature', () => {
    let message4 = new Message(text);
    let verified = (message4 as any)._verify(publicKey, signature2);
    expect(verified).toBe(true);
  });

  test('can verify a message with existing signature', () => {
    let message5 = new Message(text);
    let verified = (message5 as any)._verify(publicKey, signature);
    expect(verified).toBe(true);
  });

  test('verify will error with incorrect public key argument', () => {
    expect(() => {
      let message6 = new Message(text);
      return (message6 as any)._verify('not a public key', signature);
    }).toThrow('First argument should be an instance of PublicKey');
  });

  test('verify will error with incorrect signature argument', () => {
    expect(() => {
      let message7 = new Message(text);
      return (message7 as any)._verify(publicKey, 'not a signature');
    }).toThrow('Second argument should be an instance of Signature');
  });

  test('verify will correctly identify a bad signature', () => {
    let message8 = new Message(text);
    let verified = (message8 as any)._verify(publicKey, badSignature);
    expect(message8.error).toBeDefined();
    expect(verified).toBe(false);
  });

  test('can verify a message with address and generated signature string', () => {
    let message9 = new Message(text);
    let verified = message9.verify(address, signature3);
    expect(message9.error).not.toBeDefined();
    expect(verified).toBe(true);
  });

  test('will not verify with address mismatch', () => {
    let message10 = new Message(text);
    let verified = message10.verify(badAddress, signatureString);
    expect(message10.error).toBeDefined();
    expect(verified).toBe(false);
  });

  test('will verify with an uncompressed pubkey', () => {
    let privateKey = PrivateKey.from('2C4FDQQmtXuwGMDCeUnUrDbqoHjzDEVrdSbjWRdZzZLYkugNq2y');
    let message = new Message('This is an example of a signed message.');
    let signature = message.sign(privateKey);
    let verified = message.verify(privateKey.toAddress(), signature);
    expect(verified).toBe(true);
  });

  test('can chain methods', () => {
    let verified = new Message(text).verify(address, signatureString);
    expect(verified).toBe(true);
  });

  describe('#json', () => {
    test('roundtrip to-from-to', () => {
      let json = new Message(text).toJSON();
      let message = Message.fromJSON(json);
      expect(message.toString()).toBe(text);
    });

    test('checks that the string parameter is valid JSON', () => {
      expect(() => Message.fromJSON('¹')).toThrow();
    });
  });

  describe('#toString', () => {
    test('message string', () => {
      let message = new Message(text);
      expect(message.toString()).toBe(text);
    });

    test('roundtrip to-from-to', () => {
      let str = new Message(text).toString();
      let message = Message.fromString(str);
      expect(message.toString()).toBe(text);
    });
  });

  describe('#inspect', () => {
    test('should output formatted output correctly', () => {
      let message = new Message(text);
      let output = '<Message: ' + text + '>';
      expect(message.inspect()).toBe(output);
    });
  });

  test('accepts Address for verification', () => {
    let verified = new Message(text).verify(new Address(address), signatureString);
    expect(verified).toBe(true);
  });
});