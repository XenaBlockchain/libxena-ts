import { describe, test, expect, vi } from "vitest";
import HDPublicKey from "../../src/keys/hdpublickey";
import Base58Check from "../../src/encoding/base58check";
import { InvalidB58Checksum, InvalidDerivationArgument, InvalidHardenedIndex, InvalidLength, InvalidNetwork, InvalidNetworkArgument, InvalidPath } from "../../src/keys/exceptions";
import HDKeyUtils from "../../src/keys/hdkey.utils";
import { networks } from "../../src/core/network/network-manager";
import { HDPrivateKey } from "../../src";

describe('HDPublicKey interface', () => {

  const xprivkey = 'F6rxzJdAfE9XecsrTeyXrcye1XYFbXHxs7iYWHvt2p1KwHKkmDVEcmFufzURFUTL5MbhuCNYDu2gTFkYexfPZq4BviayRVd2qjPS7BMtby7quzcV';
  const xpubkey = 'F6iYrtTLfKQK1KVwsr91bWQseEKAoStsUCcEqwcLqbbtjnxLXLcrhbqXGmXLPtpH4dG2qaicf26BL4EVwCC1LjMSWCcGgQwzrJ5Xx3JjG9ov1LhH';
  const xpubkeyTestnet = 'tpubD6NzVbkrYhZ4WZaiWHz59q5EQ61bd6dUYfU4ggRWAtNAyyYRNWT6ktJ7UHJEXURvTfTfskFQmK7Ff4FRkiRN5wQH8nkGAb6aKB4Yyeqsw5m';
  const json = '{"network":"mainnet","depth":0,"fingerPrint":876747070,"parentFingerPrint":0,"childIndex":0,"chainCode":"873dff81c02f525623fd1fe5167eac3a55a049de3d314bb42ee227ffed37d508","publicKey":"0339a36013301597daef41fbe593a02cc513d0b55527ec2df1050e2e8ff49c85c2","checksum":-1244189348,"xpubkey":"F6iYrtTLfKQK1KVwsr91bWQseEKAoStsUCcEqwcLqbbtjnxLXLcrhbqXGmXLPtpH4dG2qaicf26BL4EVwCC1LjMSWCcGgQwzrJ5Xx3JjG9ov1LhH"}';
  const derived_0_1_200000 = 'F6iYrtZBH8fcwLpXe3jaFcGie4YbkkDZYkgsuRs9gdwsj7zRcGwDYiLrJ9x9kz9GAx448jmnEszrk3tJCsxk6GAEcfM4Goiu1PgP74oBJgzNZfgN';

  const expectFail = (func: () => void, error: new (...args: any[]) => Error): void => {
    expect(() => func()).toThrow(error)
  };

  const expectDerivationFail = (argument: any, error: new (...args: any[]) => Error): void => {
    return expectFail(() => {
      let publicKey = new HDPublicKey(xpubkey);
      publicKey.deriveChild(argument);
    }, error);
  };

  const expectFailBuilding = (argument: any, error: new (...args: any[]) => Error): void => {
    return expectFail(() => new HDPublicKey(argument), error);
  };

  describe('creation formats', () => {

    test('returns same argument if already an instance of HDPublicKey', () => {
      let publicKey = new HDPublicKey(xpubkey);
      expect(publicKey).toBe(new HDPublicKey(publicKey));
    });

    test('returns the correct xpubkey for a xprivkey', () => {
      let publicKey = new HDPublicKey(new HDPrivateKey(xprivkey));
      expect(publicKey.xpubkey).toBe(xpubkey);
    });

    test('fails when user doesn\'t supply an argument', () => {
      expectFailBuilding(null, TypeError);
    });

    test('doesn\'t recognize an invalid argument', () => {
      expectFailBuilding(1, TypeError);
      expectFailBuilding(true, TypeError);
    });


    describe('xpubkey string serialization errors', () => {
      test('fails on invalid length', () => {
        expectFailBuilding(Base58Check.encode(Buffer.from([1, 2, 3])), InvalidLength);
      });
      test('fails on invalid base58 encoding', () => {
        expectFailBuilding(xpubkey + '1', InvalidB58Checksum);
      });
      test('user can ask if a string is valid', () => {
        expect(HDKeyUtils.isValidSerialized(xpubkey)).toBe(true);
      });
    });

    test('can be generated from a json', () => {
      expect(new HDPublicKey(JSON.parse(json)).xpubkey).toBe(xpubkey);
    });

    test('can generate a json that has a particular structure', () => {
        expect(new HDPublicKey(JSON.parse(json)).toJSON()).toEqual(new HDPublicKey(xpubkey).toJSON());
    });

    test('checks the checksum', () => {
      vi.spyOn(HDPublicKey as any, '_buildFromSerialized').mockImplementation((key: any) => {
        let decoded = Base58Check.decode(key);
        let buffers = {
          version: decoded.subarray(HDKeyUtils.VersionStart, HDKeyUtils.VersionEnd),
          depth: decoded.subarray(HDKeyUtils.DepthStart, HDKeyUtils.DepthEnd),
          parentFingerPrint: decoded.subarray(HDKeyUtils.ParentFingerPrintStart, HDKeyUtils.ParentFingerPrintEnd),
          childIndex: decoded.subarray(HDKeyUtils.ChildIndexStart, HDKeyUtils.ChildIndexEnd),
          chainCode: decoded.subarray(HDKeyUtils.ChainCodeStart, HDKeyUtils.ChainCodeEnd),
          publicKey: decoded.subarray(HDKeyUtils.ChainCodeEnd, HDKeyUtils.ChainCodeEnd+33),
          checksum: Buffer.from([0,1,2,3]), // invalid checksum
        };
        return (HDPublicKey as any)._buildFromBuffers(buffers);
      });
  
      expect(() => new HDPublicKey(xpubkey)).toThrow(InvalidB58Checksum);
      
      vi.restoreAllMocks();
    });
  });

  describe('error checking on serialization', () => {
    const compareType = (a: any, b: any): void => {
      expect(a instanceof b).toBe(true);
    };
    test('throws invalid argument when argument is not a string or buffer', () => {
      compareType(HDKeyUtils.getSerializedError(1 as any), TypeError);
    });
    test('if a network is provided, validates that data corresponds to it', () => {
      compareType(HDKeyUtils.getSerializedError(xpubkey, 'testnet'), InvalidNetwork);
    });
    test('recognizes invalid network arguments', () => {
      compareType(HDKeyUtils.getSerializedError(xpubkey, 'invalid'), InvalidNetworkArgument);
    });
    test('recognizes a valid network', () => {
      expect(HDKeyUtils.getSerializedError(xpubkey, 'mainnet')).toBeNull();
    });
  });

  test('toString() returns the same value as .xpubkey', () => {
    let pubKey = new HDPublicKey(xpubkey);
    expect(pubKey.toString()).toBe(pubKey.xpubkey);
  });

  test('publicKey property matches network', () => {
    let mainnet = new HDPublicKey(xpubkey);
    let testnet = new HDPublicKey(xpubkeyTestnet);

    expect(mainnet.publicKey.network).toEqual(networks.mainnet);
    expect(testnet.publicKey.network).toEqual(networks.testnet);
  });

  test('inspect() displays correctly', () => {
    let pubKey = new HDPublicKey(xpubkey);
    expect(pubKey.inspect()).toBe('<HDPublicKey: ' + pubKey.xpubkey + '>');
  });

  describe('conversion to/from buffer', () => {

    test('should roundtrip to an equivalent object', () => {
      let pubKey = new HDPublicKey(xpubkey);
      let toBuffer = pubKey.toBuffer();
      let fromBuffer = HDPublicKey.fromBuffer(toBuffer);
      let roundTrip = new HDPublicKey(fromBuffer.toBuffer());
      expect(roundTrip.xpubkey).toBe(xpubkey);
    });
  });

  describe('conversion to different formats', () => {
    let plainObject = JSON.parse(json);
    test('roundtrips to JSON and to Object', () => {
      let pubkey = new HDPublicKey(xpubkey);
      expect(HDPublicKey.fromObject(pubkey.toJSON()).xpubkey).toBe(xpubkey);
    });
    test('recovers state from Object', () => {
      expect(new HDPublicKey(plainObject).xpubkey).toBe(xpubkey);
    });
  });

  describe('derivation', () => {
    test('derivation is the same whether deriving with number or string', () => {
      let pubkey = new HDPublicKey(xpubkey);
      let derived1 = pubkey.deriveChild(0).deriveChild(1).deriveChild(200000);
      let derived2 = pubkey.deriveChild('m/0/1/200000');
      expect(derived1.xpubkey).toBe(derived_0_1_200000);
      expect(derived2.xpubkey).toBe(derived_0_1_200000);
    });

    test('allows special parameters m, M', () => {
      const expectDerivationSuccess = (argument: string): void => {
        expect(new HDPublicKey(xpubkey).deriveChild(argument).xpubkey).toBe(xpubkey);
      };
      expectDerivationSuccess('m');
      expectDerivationSuccess('M');
    });

    test('doesn\'t allow object arguments for derivation', () => {
      expectFail(() => new HDPublicKey(xpubkey).deriveChild({} as any), InvalidDerivationArgument);
    });

    test('needs first argument for derivation', () => {
      expectFail(() => new HDPublicKey(xpubkey).deriveChild('s'), InvalidPath);
    });

    test('doesn\'t allow other parameters like m\' or M\' or "s"', () => {
      /* jshint quotmark: double */
      expectDerivationFail("m'", InvalidHardenedIndex);
      expectDerivationFail("M'", InvalidHardenedIndex);
      expectDerivationFail("1", InvalidPath);
      expectDerivationFail("S", InvalidPath);
      expectDerivationFail(-1, InvalidPath);
    });

    test('can\'t derive hardened keys', () => {
      expectFail(() => new HDPublicKey(xpubkey).deriveChild(HDKeyUtils.Hardened), InvalidHardenedIndex);
    });

    test('can\'t derive hardened keys via second argument', () => {
      expectFail(() => new HDPublicKey(xpubkey).deriveChild(5, true), InvalidHardenedIndex);
    });

    test('validates correct paths', () => {
      let valid;

      valid = HDPublicKey.isValidPath('m/123/12');
      expect(valid).toBe(true);

      valid = HDPublicKey.isValidPath('m');
      expect(valid).toBe(true);

      valid = HDPublicKey.isValidPath(123);
      expect(valid).toBe(true);
    });

    test('rejects illegal paths', () => {
      let valid;

      valid = HDPublicKey.isValidPath('m/-1/12');
      expect(valid).toBe(false);

      valid = HDPublicKey.isValidPath("m/0'/12");
      expect(valid).toBe(false);

      valid = HDPublicKey.isValidPath("m/8000000000/12");
      expect(valid).toBe(false);

      valid = HDPublicKey.isValidPath('bad path');
      expect(valid).toBe(false);

      valid = HDPublicKey.isValidPath(-1);
      expect(valid).toBe(false);

      valid = HDPublicKey.isValidPath(8000000000);
      expect(valid).toBe(false);

      valid = HDPublicKey.isValidPath(HDKeyUtils.Hardened);
      expect(valid).toBe(false);

      valid = HDPublicKey.isValidPath(undefined as any);
      expect(valid).toBe(false);
    });
  });
});