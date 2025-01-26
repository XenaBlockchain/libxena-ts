import { afterEach, describe, expect, test, vi } from "vitest";
import HDPrivateKey from "../../src/keys/hdprivatekey";
import HDPublicKey from "../../src/keys/hdpublickey";
import { networks } from "../../src/core/network/network-manager";
import libnexa from "../../src";
import { ArgumentIsPrivateExtended } from "../../src/keys/exceptions";

describe('HDKeys building with static methods', () => {
  let classes = [HDPublicKey, HDPrivateKey];

  classes.forEach(clazz => {
    const expectStaticMethodFail = (staticMethod: keyof typeof clazz, argument: any, message: string): void => {
      const method = clazz[staticMethod];

      if (typeof method === 'function') {
        expect(() => method(argument)).toThrow(message);
      } else {
        throw new Error(`${staticMethod} is not a callable function`);
      }
    };

    test(clazz.name + ' fromJSON checks that a valid JSON is provided', () => {
      let errorMessage = 'Invalid Argument: No valid argument was provided';
      let method: keyof typeof clazz = 'fromObject';
      expectStaticMethodFail(method, undefined, errorMessage);
      expectStaticMethodFail(method, null, errorMessage);
      expectStaticMethodFail(method, 'invalid JSON', errorMessage);
      expectStaticMethodFail(method, '{\'singlequotes\': true}', errorMessage);
    });
    test(clazz.name + ' fromString checks that a string is provided', () => {
      let errorMessage = 'No valid string was provided';
      let method: keyof typeof clazz = 'fromString';
      expectStaticMethodFail(method, undefined, errorMessage);
      expectStaticMethodFail(method, null, errorMessage);
      expectStaticMethodFail(method, {}, errorMessage);
    });
    test(clazz.name + ' fromObject checks that an object is provided', () => {
      let errorMessage = 'No valid argument was provided';
      let method: keyof typeof clazz = 'fromObject';
      expectStaticMethodFail(method, undefined, errorMessage);
      expectStaticMethodFail(method, null, errorMessage);
      expectStaticMethodFail(method, '', errorMessage);
    });
    test(clazz.name + ' fromMinimalObject checks that an object is provided', () => {
      let errorMessage = 'No valid argument was provided';
      let method: keyof typeof clazz = 'fromMinimalObject';
      expectStaticMethodFail(method, undefined, errorMessage);
      expectStaticMethodFail(method, null, errorMessage);
      expectStaticMethodFail(method, '', errorMessage);
    });
    test(clazz.name + ' fromBuffer checks that a Buffer is provided', () => {
      let errorMessage = 'No valid Buffer was provided';
      let method: keyof typeof clazz = 'fromBuffer';
      expectStaticMethodFail(method, undefined, errorMessage);
      expectStaticMethodFail(method, null, errorMessage);
      expectStaticMethodFail(method, '', errorMessage);
      expectStaticMethodFail(method, {}, errorMessage);
    });
  });
});

describe('BIP32 compliance', () => {

  test('should initialize test vector 1 from the extended public key', () => {
    expect(new HDPublicKey(vector1_m_public).xpubkey).toBe(vector1_m_public);
  });

  test('should initialize test vector 1 from the extended private key', () => {
    expect(new HDPrivateKey(vector1_m_private).xprivkey).toBe(vector1_m_private);
  });

  test('can not initialize a public key from an extended private key string', () => {
    expect(() => new HDPublicKey(vector1_m_private)).toThrow(ArgumentIsPrivateExtended);
  });

  test('can initialize a public key from an extended private key object', () => {
    expect(new HDPublicKey(new HDPrivateKey(vector1_m_private)).xpubkey).toBe(vector1_m_public);
  });

  test('can initialize a public key from an extended private key', () => {
    expect(new HDPrivateKey(vector1_m_private).xpubkey).toBe(vector1_m_public);
  });

  test('toString should be equal to the `xprivkey` member', () => {
    let privateKey = new HDPrivateKey(vector1_m_private);
    expect(privateKey.toString()).toBe(privateKey.xprivkey);
  });

  test('toString should be equal to the `xpubkey` member', () => {
    let publicKey = new HDPublicKey(vector1_m_public);
    expect(publicKey.toString()).toBe(publicKey.xpubkey);
  });

  test("should get m/0' ext. private key from test vector 1", () => {
    let privateKey = new HDPrivateKey(vector1_m_private).deriveChild("m/0'");
    expect(privateKey.xprivkey).toBe(vector1_m0h_private);
  });

  test("should get m/0' ext. public key from test vector 1", () => {
    expect(new HDPrivateKey(vector1_m_private).deriveChild("m/0'").xpubkey).toBe(vector1_m0h_public);
  });

  test("should get m/0'/1 ext. private key from test vector 1", () => {
    expect(new HDPrivateKey(vector1_m_private).deriveChild("m/0'/1").xprivkey).toBe(vector1_m0h1_private);
  });

  test("should get m/0'/1 ext. public key from test vector 1", () => {
    expect(new HDPrivateKey(vector1_m_private).deriveChild("m/0'/1").xpubkey).toBe(vector1_m0h1_public);
  });

  test("should get m/0'/1 ext. public key from m/0' public key from test vector 1", () => {
    let derivedPublic = new HDPrivateKey(vector1_m_private).deriveChild("m/0'").hdPublicKey.deriveChild("m/1");
    expect(derivedPublic.xpubkey).toBe(vector1_m0h1_public);
  });

  test("should get m/0'/1/2' ext. private key from test vector 1", () => {
    let privateKey = new HDPrivateKey(vector1_m_private);
    let derived = privateKey.deriveChild("m/0'/1/2'");
    expect(derived.xprivkey).toBe(vector1_m0h12h_private);
  });

  test("should get m/0'/1/2' ext. public key from test vector 1", () => {
    expect(new HDPrivateKey(vector1_m_private).deriveChild("m/0'/1/2'")
      .xpubkey).toBe(vector1_m0h12h_public);
  });

  test("should get m/0'/1/2'/2 ext. private key from test vector 1", () => {
    expect(new HDPrivateKey(vector1_m_private).deriveChild("m/0'/1/2'/2")
      .xprivkey).toBe(vector1_m0h12h2_private);
  });

  test("should get m/0'/1/2'/2 ext. public key from m/0'/1/2' public key from test vector 1", () => {
    let derived = new HDPrivateKey(vector1_m_private).deriveChild("m/0'/1/2'").hdPublicKey;
    expect(derived.deriveChild("m/2").xpubkey).toBe(vector1_m0h12h2_public);
  });

  test("should get m/0'/1/2h/2 ext. public key from test vector 1", () => {
    expect(new HDPrivateKey(vector1_m_private).deriveChild("m/0'/1/2'/2")
      .xpubkey).toBe(vector1_m0h12h2_public);
  });

  test("should get m/0'/1/2h/2/1000000000 ext. private key from test vector 1", () => {
    expect(new HDPrivateKey(vector1_m_private).deriveChild("m/0'/1/2'/2/1000000000")
      .xprivkey).toBe(vector1_m0h12h21000000000_private);
  });

  test("should get m/0'/1/2h/2/1000000000 ext. public key from test vector 1", () => {
    expect(new HDPrivateKey(vector1_m_private).deriveChild("m/0'/1/2'/2/1000000000")
      .xpubkey).toBe(vector1_m0h12h21000000000_public);
  });

  test("should get m/0'/1/2'/2/1000000000 ext. public key from m/0'/1/2'/2 public key from test vector 1", () => {
    let derived = new HDPrivateKey(vector1_m_private).deriveChild("m/0'/1/2'/2").hdPublicKey;
    expect(derived.deriveChild("m/1000000000").xpubkey).toBe(vector1_m0h12h21000000000_public);
  });

  test('should initialize test vector 2 from the extended public key', () => {
    expect(new HDPublicKey(vector2_m_public).xpubkey).toBe(vector2_m_public);
  });

  test('should initialize test vector 2 from the extended private key', () => {
    expect(new HDPrivateKey(vector2_m_private).xprivkey).toBe(vector2_m_private);
  });

  test('should get the extended public key from the extended private key for test vector 2', () => {
    expect(new HDPrivateKey(vector2_m_private).xpubkey).toBe(vector2_m_public);
  });

  test("should get m/0 ext. private key from test vector 2", () => {
    expect(new HDPrivateKey(vector2_m_private).deriveChild(0).xprivkey).toBe(vector2_m0_private);
  });

  test("should get m/0 ext. public key from test vector 2", () => {
    expect(new HDPrivateKey(vector2_m_private).deriveChild(0).xpubkey).toBe(vector2_m0_public);
  });

  test("should get m/0 ext. public key from m public key from test vector 2", () => {
    expect(new HDPrivateKey(vector2_m_private).hdPublicKey.deriveChild(0).xpubkey).toBe(vector2_m0_public);
  });

  test("should get m/0/2147483647h ext. private key from test vector 2", () => {
    expect(new HDPrivateKey(vector2_m_private).deriveChild("m/0/2147483647'")
      .xprivkey).toBe(vector2_m02147483647h_private);
  });

  test("should get m/0/2147483647h ext. public key from test vector 2", () => {
    expect(new HDPrivateKey(vector2_m_private).deriveChild("m/0/2147483647'")
      .xpubkey).toBe(vector2_m02147483647h_public);
  });

  test("should get m/0/2147483647h/1 ext. private key from test vector 2", () => {
    expect(new HDPrivateKey(vector2_m_private).deriveChild("m/0/2147483647'/1")
      .xprivkey).toBe(vector2_m02147483647h1_private);
  });

  test("should get m/0/2147483647h/1 ext. public key from test vector 2", () => {
    expect(new HDPrivateKey(vector2_m_private).deriveChild("m/0/2147483647'/1")
      .xpubkey).toBe(vector2_m02147483647h1_public);
  });

  test("should get m/0/2147483647h/1 ext. public key from m/0/2147483647h public key from test vector 2", () => {
    let derived = new HDPrivateKey(vector2_m_private).deriveChild("m/0/2147483647'").hdPublicKey;
    expect(derived.deriveChild(1).xpubkey).toBe(vector2_m02147483647h1_public);
  });

  test("should get m/0/2147483647h/1/2147483646h ext. private key from test vector 2", () => {
    expect(new HDPrivateKey(vector2_m_private).deriveChild("m/0/2147483647'/1/2147483646'")
      .xprivkey).toBe(vector2_m02147483647h12147483646h_private);
  });

  test("should get m/0/2147483647h/1/2147483646h ext. public key from test vector 2", () => {
    expect(new HDPrivateKey(vector2_m_private).deriveChild("m/0/2147483647'/1/2147483646'")
      .xpubkey).toBe(vector2_m02147483647h12147483646h_public);
  });

  test("should get m/0/2147483647h/1/2147483646h/2 ext. private key from test vector 2", () => {
    expect(new HDPrivateKey(vector2_m_private).deriveChild("m/0/2147483647'/1/2147483646'/2")
      .xprivkey).toBe(vector2_m02147483647h12147483646h2_private);
  });

  test("should get m/0/2147483647h/1/2147483646h/2 ext. public key from test vector 2", () => {
    expect(new HDPrivateKey(vector2_m_private).deriveChild("m/0/2147483647'/1/2147483646'/2")
      .xpubkey).toBe(vector2_m02147483647h12147483646h2_public);
  });

  test("should get m/0/2147483647h/1/2147483646h/2 ext. public key from m/0/2147483647h/2147483646h public key from test vector 2", () => {
    let derivedPublic = new HDPrivateKey(vector2_m_private)
      .deriveChild("m/0/2147483647'/1/2147483646'").hdPublicKey;
      expect(derivedPublic.deriveChild("m/2")
      .xpubkey).toBe(vector2_m02147483647h12147483646h2_public);
  });

  test('should use full 32 bytes for private key data that is hashed (as per bip32)', () => {
    // https://github.com/bitcoin/bips/blob/master/bip-0032.mediawiki
    let key = new HDPrivateKey({
      network: 'testnet',
      depth: 0,
      parentFingerPrint: 0,
      childIndex: 0,
      privateKey: "00000055378cf5fafb56c711c674143f9b0ee82ab0ba2924f19b64f5ae7cdbfd",
      chainCode: "9c8a5c863e5941f3d99453e6ba66b328bb17cf0b8dec89ed4fc5ace397a1c089"
    });
    let derived = key.deriveChild("m/44'/0'/0'/0/0'");
    expect(derived.privateKey.toString()).toBe('3348069561d2a0fb925e74bf198762acc47dce7db27372257d2d959a9e6f8aeb');
  });

  describe('edge cases', () => {
    afterEach(() => {
      vi.restoreAllMocks();
    });
    test('will handle edge case that derived private key is invalid', () => {
      let invalid =  Buffer.from('0000000000000000000000000000000000000000000000000000000000000000', 'hex');
      let privateKeyHex =  '5f72914c48581fc7ddeb944a9616389200a9560177d24f458258e5b04527bcd1';
      let chainCodeHex =  '39816057bba9d952fe87fe998b7fd4d690a1bb58c2ff69141469e4d1dffb4b91';
      let unstubbed = libnexa.crypto.BN.prototype.toBuffer;
      let count = 0;
      vi.spyOn(libnexa.crypto.BN.prototype, 'toBuffer').mockImplementation(function (this: typeof libnexa.crypto.BN, ...args) {
        // On the fourth call to the function give back an invalid private key
        // otherwise use the normal behavior.
        if (++count === 4) {
          return invalid;
        }
        return unstubbed.apply(this, args);
      });
      let isValidSpy = vi.spyOn(libnexa.keys.PrivateKey, 'isValid');
      let key = new HDPrivateKey({
        network: 'testnet',
        depth: 0,
        parentFingerPrint: 0,
        childIndex: 0,
        privateKey: privateKeyHex,
        chainCode: chainCodeHex
      });
      let derived = key.deriveChild("m/44'");
      expect(isValidSpy).toBeCalledTimes(2);
      expect(derived.privateKey.toString()).toBe('b15bce3608d607ee3a49069197732c656bca942ee59f3e29b4d56914c1de6825');
      expect(isValidSpy).toBeCalledTimes(2);
    });
    test('will handle edge case that a derive public key is invalid', () => {
      let publicKeyHex = '029e58b241790284ef56502667b15157b3fc58c567f044ddc35653860f9455d099';
      let chainCodeHex = '39816057bba9d952fe87fe998b7fd4d690a1bb58c2ff69141469e4d1dffb4b91';
      let key = new HDPublicKey({
        network: 'testnet',
        depth: 0,
        parentFingerPrint: 0,
        childIndex: 0,
        chainCode: chainCodeHex,
        publicKey: publicKeyHex
      });
      let unstubbed = libnexa.keys.PublicKey.fromPoint;
      libnexa.keys.PublicKey.fromPoint = () => {
        libnexa.keys.PublicKey.fromPoint = unstubbed;
        throw new Error('Point cannot be equal to Infinity');
      };
      let deriveSpy = vi.spyOn(key as any, '_deriveWithNumber');
      key.deriveChild("m/44");
      expect(deriveSpy).toBeCalledTimes(2);
      expect(key.publicKey.toString()).toBe('029e58b241790284ef56502667b15157b3fc58c567f044ddc35653860f9455d099');
    });
  });

  describe('seed', () => {

    test('should initialize a new BIP32 correctly from test vector 1 seed', () => {
      let seededKey = HDPrivateKey.fromSeed(vector1_master, networks.mainnet);
      expect(seededKey.xprivkey).toBe(vector1_m_private);
      expect(seededKey.xpubkey).toBe(vector1_m_public);
    });

    test('should initialize a new BIP32 correctly from test vector 2 seed', () => {
      let seededKey = HDPrivateKey.fromSeed(vector2_master, networks.mainnet);
      expect(seededKey.xprivkey).toBe(vector2_m_private);
      expect(seededKey.xpubkey).toBe(vector2_m_public);
    });
  });
});

//test vectors: https://github.com/bitcoin/bips/blob/master/bip-0032.mediawiki (adjusted to Nexa chain params)
let vector1_master = '000102030405060708090a0b0c0d0e0f';
let vector1_m_public = 'F6iYrtTLfKQK1KVwsr91bWQseEKAoStsUCcEqwcLqbbtjnxLXLcrhbqXGmXLPtpH4dG2qaicf26BL4EVwCC1LjMSWCcGgQwzrJ5Xx3JjG9ov1LhH';
let vector1_m_private = 'F6rxzJdAfE9XecsrTeyXrcye1XYFbXHxs7iYWHvt2p1KwHKkmDVEcmFufzURFUTL5MbhuCNYDu2gTFkYexfPZq4BviayRVd2qjPS7BMtby7quzcV';
let vector1_m0h_public = 'F6iYrtVc5K7cUQm4rzk9JiAkH7MGumiRpagirdDmjZhGrm9Xohu9t254Mtfgog5qmNZwNavuDtKiknsa2AayUgPAtGVjQcao7DPSAZErpTPwMWMQ';
let vector1_m0h_private = 'F6rxzJfS5Drq7i8ySoafZpjWeQaMhr7XDVo2WyYJvn6i4FWx3amXoBVSm7cmfFigQmK5ruRRvGL1Ke7PXgRRHUeU7Wf3wZVhyyM8ztNXTQDGktqy';
let vector1_m0h1_public = 'F6iYrtXnCWuAMoTwvqCBkSRe9i6AZq6QvaiT9ZYSa9y3fhnL1wSf1jsUfrEb36AJLnWeiYeXGfkAruU4VktiJ9iLmx9ZLundxh2SSByPbkLsRqPq';
let vector1_m0h1_private = 'F6rxzJhcCReP16qrWe2i1YzQX1KFMuVWKVpkourymNNUsC9kFpK2vuHs55BftfmsUNEruMWBc59bkipLwpMwWbzG6HpYP5Gfi36urZAqpwCJ6gAg';
let vector1_m0h12h_public = 'F6iYrtaPUZRzDWLoLhMyqh23X56Ci4FHSrG38u5gFQJLpsehTMHr8YdK6kg8xeBVBEP62uAd1H89UHQdUDDrarotK1biBVgc6myW7ufJjqfdC3PU';
let vector1_m0h12h_private = 'F6rxzJkDUUBCroihvWCW6oaotNKHW8eNqmNLoFQDSchn2N27hEAE3i3hVydDpDp66LUNPryCzfcYg9EAr3ZgGC1BHQuz3RtEGC39oASb3ZnipdT8';
let vector1_m0h12h2_public = 'F6iYrtccsPs7AgpUKmqTZPHFbxbN294aBUrMLLZZYfFsJC6G4iPUVcQ1TxFbtKWUZeBEmNUkBR8dRL9XameCax7KWjCBSQUAHcAPwvMDazFWNib8';
let vector1_m0h12h2_private = 'F6rxzJnSsJcKozCNuafypVr1yFpSpDTfaPxezgt6jsfJVgTgJbFrQmpPsBCgju8VYo8mpvmLhHXnF43d1WkaiPRidcJa5q8KMk7yWKR4D5FPge9x';
let vector1_m0h12h21000000000_public = 'F6iYrteLdsYiQowrXJBF1VppLGJN1wJ9VJMAN8ox6uYFSQAeZRWst8pG8DMkwxLPWVSKUrB2ivUZDsMEBN4bc3xpMaTLZH1aNQdyajJqWEPVmN4i';
let vector1_m0h12h21000000000_private = 'F6rxzJpAdnHw47Km771mGcPahZXSp1hEtDTU2V8VJ7wgdtY4oJPFoJEeXSJqoXzGki3tuYAjx4tmBu6A8Wvb5vVjMjGDdAd5as2jDbkcZpN3Zi9Q';
let vector2_master = 'fffcf9f6f3f0edeae7e4e1dedbd8d5d2cfccc9c6c3c0bdbab7b4b1aeaba8a5a29f9c999693908d8a8784817e7b7875726f6c696663605d5a5754514e4b484542';
let vector2_m_public = 'F6iYrtTLfKQK1KVwsqkWvcZwvgWtZh61ttEVfdC8ZtYdZmLTPdbstmzJDCRVzEvN3LWPoVGrSvkqVTK1BuyjZrYMfLXGdGtCK8a2cMgQNRhZXdvd';
let vector2_m_private = 'F6rxzJdAfE9XecsrTeb3Bj8iHyjyMmV7HoLoKyWfm6x4mFhsdWUFowQgcRNaqpX78Y7FzSRHeeK8uXrar4C7fsUadKxJBx375sjLqkcWqL314U7T';
let vector2_m0_public = 'F6iYrtWcQb7zxoWmxN27DkMKokKJ643m9bCyxBMsw4Mf1qkKMKaKsMFeHMG5EpPKw8bQEhbLcnyqErPrA59AFjh45g7vuYvvz2vAzVAX2rvKGUGS';
let vector2_m0_private = 'F6rxzJgSQVsDc6tgYArdUrv6B3YNt8SrYWKHcXgR8Gm6DL7jbCShnWg2gaDA6Q2NwBB6pr5XUYKYdy1zyQhkVRm5gGBTaxDX9GDWat2RPhPHC43o';
let vector2_m02147483647h_public = 'F6iYrtXmTqj2VBQx4XtKQAoKTDeyeSnz48h9eGWxTykZnVV5jmsZKy94bZKrqRma3tL1LV7GASpgr9cGkjp2bWbYCQGPY61Z3PeS1MYndhhhcCco';
let vector2_m02147483647h_private = 'F6rxzJhbTkUF8UnreLiqfHN5pWt4SXC5T3oTJcqVfC9zyyrVyejwF8ZSznGwh1NruuRqJkJrNKLkH22W5qwVGA8goqUu9NwkV2jEqfokvTkvRa6n';
let vector2_m02147483647h1_public = 'F6iYrtaaSFk1RM4FFdVzYETU2BbusnKrZEt4uaxTKppE7oNSBShRVGebJTEFDGZmBgChd5HiiHTn5njaapcHcRVy9fbrSgHktcBsDHKTax8WDfep';
let vector2_m02147483647h1_private = 'F6rxzJkQSAVE4eS9qSLWoM2EPUpzfriwx9zNZwGzX3DfKHjrRKZoQS4yhgBL4rB4Xw9314GD54dpfRaBJAeGRD2DBqxiSWiHHsqDE9cBewQArKcR';
let vector2_m02147483647h12147483646h_public = 'F6iYrtbkUAhwmxTCxvTE8xwHZZ7c4h4KvHrhQcfBDMXvXe8hRu3kRNKXJykcJuDtgsaE52jNM5xqnqLuSUFT17P5fNxYtxC5PAUxd9YYAV9ACecw';
let vector2_m02147483647h12147483646h_private = 'F6rxzJmaU5TARFq7YjHkQ5W3vrLgrmTRKCy14xyiQZwMj8W7fmv8LXjuiChhAUsnvZZRHbqVmNTbeowksymMniy7gXoPcLepc23ErVCCB1B8iGAo';
let vector2_m02147483647h12147483646h2_public = 'F6iYrtd7W89AHUdXCfiR2h1RFXrz367s2YBcVGpo6mKH2GvZ1yF5zXxT5AKZJycxy19amYnaaMtMCj3vRxgWVwUmZhDQUbMuU6rFMpqjM9jZgfPx';
let vector2_m02147483647h12147483646h2_private = 'F6rxzJnwW2tNvn1RnUYwHoaBcq64qAWxRTHv9d9LHyiiDmHyFr7TuhNqUPGeAZHTviaWMe9MVfDEUG3ba2KFJTHUuan8L9WL75TNaBZXj5p5j6Gx';
