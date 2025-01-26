import { describe, expect, test } from "vitest";
import PrivateKey from "../../src/keys/privatekey";
import PublicKey from "../../src/keys/publickey";
import { networks } from "../../src/core/network/network-manager";
import Base58Check from "../../src/encoding/base58check";
import Point from "../../src/crypto/point";
import BN from "../../src/crypto/bn.extension";

import validbase58 from "../data/base58_keys_valid.json" assert { type: 'json' };
import invalidbase58 from "../data/base58_keys_invalid.json" assert { type: 'json' };

describe('PrivateKey', () => {
  let hex = 'bb166827f219d47c1dfe96456b5002b306fee25ba58aac084ec1cb9f43b1707d';
  let hex2 = '8080808080808080808080808080808080808080808080808080808080808080';
  let buf = Buffer.from(hex, 'hex');
  let wifTestnet = 'cS5xNfqSqpLhJJuZDt9vKjv99wsopMtfFy4tmYPinfUUc9mYVMAR';
  let wifTestnetUncompressed = '92c7ChyHjKt8mhm5ajQKRdupcZNUptQV9q3hGyxSnEhfRqZTtKY';
  let wifLivenet = '6HZk5zTRZ144PtVa7bGfu6d3SPDf8kxN51U9xqYa2oQtwRKu3fxj';
  let wifLivenetUncompressed = '2C4FDQQmtXuwGMDCeUnUrDbqoHjzDEVrdSbjWRdZzZLYkugNq2y';
  let wifNamecoin = '74pxNKNpByQ2kMow4d9kF6Z77BYeKztQNLq3dSyU4ES1K5KLNiz';

  test('should create a new random private key', () => {
    let a = new PrivateKey();
    expect(a).toBeDefined();
    expect(a.bn).toBeDefined();
  });

  test('should create a privatekey from hexa string', () => {
    let a = PrivateKey.from(hex2);
    expect(a).toBeDefined();
    expect(a.bn).toBeDefined();
  });

  test('should create a new random testnet private key with only one argument', () => {
    let b = PrivateKey.from(undefined, networks.testnet);
    expect(b).toBeDefined();
    expect(b.bn).toBeDefined();
  });

  test('should create a private key from a custom network WIF string', () => {
    let nmc = {
      name: 'namecoin',
      alias: 'namecoin',
      prefix: 'nmc',
      pubkeyhash: 0x34,
      privatekey: 0xB4,
      // these below aren't the real NMC version numbers
      scripthash: 0x08,
      xpubkey: 0x0278b20e,
      xprivkey: 0x0278ade4,
      networkMagic: 0xf9beb4fe,
      port: 20001,
      dnsSeeds: [
        'localhost',
        'mynet.localhost'
      ]
    }
    let nmcNet = networks.create(nmc);
    networks.add(nmc);
    let a = PrivateKey.from(wifNamecoin, nmcNet);
    expect(a).toBeDefined();
    expect(a.bn).toBeDefined();
    networks.remove(nmcNet);
  });

  test('should create a new random testnet private key with empty data', () => {
    let a =  PrivateKey.from(null, networks.testnet);
    expect(a).toBeDefined();
    expect(a.bn).toBeDefined();
  });

  test('should create a private key from WIF string', () => {
    let a = PrivateKey.from('6GqJ1wtQpc6c7BGqnCCU8htomva2Ws3nsZdmXqi4RTGZHzRmZdMc');
    expect(a).toBeDefined();
    expect(a.bn).toBeDefined();
  });

  test('should create a private key from WIF buffer', () => {
    let a = PrivateKey.from(Base58Check.decode('6GqJ1wtQpc6c7BGqnCCU8htomva2Ws3nsZdmXqi4RTGZHzRmZdMc'));
    expect(a).toBeDefined();
    expect(a.bn).toBeDefined();
  });

  // TODO: fix mainnet wifs
  describe('nexad compliance', () => {
    validbase58.map(d => {
      if ((d[2] as any).isPrivkey) {
        test('should instantiate WIF private key ' + d[0] + ' with correct properties', () => {
          let network = networks.mainnet;
          if ((d[2] as any).isTestnet) {
            network = networks.testnet;
            let key = PrivateKey.from(d[0] as string);
            expect(key.compressed).toBe((d[2] as any).isCompressed);
            expect(key.network).toBe(network);
          }
        });
      }
    });
    invalidbase58.map(d => {
      test('should describe input ' + d[0].slice(0,10) + '... as invalid', () => {
        expect(() => {
          return PrivateKey.from(d[0]);
        }).toThrow(Error);
      });
    });
  });

  describe('instantiation', () => {
    test('should not be able to instantiate private key greater than N', () => {
      expect(() => PrivateKey.from(Point.getN())).toThrow('Number must be less than N');
    });

    test('should not be able to instantiate private key because of network mismatch', () => {
      expect(() => PrivateKey.from('6HZk5zTRZ144PtVa7bGfu6d3SPDf8kxN51U9xqYa2oQtwRKu3fxj', 'testnet')).toThrow('Private key network mismatch');
    });

    test('should not be able to instantiate private key WIF is too long', () => {
      expect(() => {
        let buf = Base58Check.decode('6HZk5zTRZ144PtVa7bGfu6d3SPDf8kxN51U9xqYa2oQtwRKu3fxj');
        let buf2 = Buffer.concat([buf, Buffer.from([0x01])]);
        return PrivateKey.from(buf2);
      }).toThrow('Length of buffer must be 33 (uncompressed) or 34 (compressed');
    });

    test('should not be able to instantiate private key WIF because of unknown network byte', () => {
      expect(() => {
        let buf = Base58Check.decode('6HZk5zTRZ144PtVa7bGfu6d3SPDf8kxN51U9xqYa2oQtwRKu3fxj');
        let buf2 = Buffer.concat([ Buffer.from('ff', 'hex'), buf.subarray(1, 33)]);
        return PrivateKey.from(buf2);
      }).toThrow('Invalid network');
    });

    test('should not be able to instantiate private key WIF because of network mismatch', () => {
      expect(() => PrivateKey.from(wifNamecoin, 'testnet')).toThrow('Invalid network');
    });

    test('can be instantiated from a hex string', () => {
      let privhex = '906977a061af29276e40bf377042ffbde414e496ae2260bbf1fa9d085637bfff';
      let pubhex = '02a1633cafcc01ebfb6d78e39f687a1f0995c62fc95f51ead10a02ee0be551b5dc';
      let privkey = PrivateKey.from(privhex);
      expect(privkey.publicKey.toString()).toBe(pubhex);
      expect(PublicKey.fromPrivateKey(privkey).toString()).toBe(pubhex);
    });

    test('should not be able to instantiate because of unrecognized data', () => {
      expect(() => new PrivateKey(new Error() as any)).toThrow('First argument is an unrecognized data type.');
      expect(() => PrivateKey.from(new Error() as any)).toThrow('First argument is an unrecognized data type.');
    });

    test('should not create a zero private key', () => {
      expect(() => {
        let bn = new BN(0);
        return PrivateKey.from(bn);
       }).toThrow(TypeError);
    });

    test('should create a mainnet private key', () => {
      let privkey = PrivateKey.from(BN.fromBuffer(buf), 'mainnet');
      expect(privkey.toWIF()).toBe(wifLivenet);
    });

    test('should create a default network private key', () => {
      // keep the original
      let network = networks.defaultNetwork;
      networks.defaultNetwork = networks.mainnet;
      let a = PrivateKey.from(BN.fromBuffer(buf));
      expect(a.network).toBe(networks.mainnet);
      // change the default
      networks.defaultNetwork = networks.testnet;
      let b = PrivateKey.from(BN.fromBuffer(buf));
      expect(b.network).toBe(networks.testnet);
      // restore the default
      networks.defaultNetwork = network;
    });

    test('returns the same instance if a PrivateKey is provided (immutable)', () => {
      let privkey = new PrivateKey();
      expect(new PrivateKey(privkey)).toBe(privkey);
      expect(PrivateKey.from(privkey)).toBe(privkey);

      let data = { bn: privkey.bn, network: "" }
      expect(new PrivateKey(data as any)).toEqual(privkey);
    });
  });

  describe('#json/object', () => {

    test('should input/output json', () => {
      let json = JSON.stringify({
        bn: '96c132224121b509b7d0a16245e957d9192609c5637c6228311287b1be21627a',
        compressed: false,
        network: 'mainnet'
      });
      let key = PrivateKey.fromObject(JSON.parse(json));
      expect(JSON.stringify(key)).toBe(json);
      key = PrivateKey.from(JSON.parse(json));
      expect(JSON.stringify(key)).toBe(json);

      let json2 = JSON.stringify({
        bn: '96c132224121b509b7d0a16245e957d9192609c5637c6228311287b1be21627a',
        compressed: false,
        network: 'wrongnet'
      });
      let key2 = PrivateKey.fromObject(JSON.parse(json2));
      expect(JSON.stringify(key2)).toBe(json); // mainnet if wrong network
    });

    test('input json should correctly initialize network field', () => {
      ['livenet', 'testnet', 'mainnet'].forEach(net => {
        let pk = PrivateKey.fromObject({
          bn: '96c132224121b509b7d0a16245e957d9192609c5637c6228311287b1be21627a',
          compressed: false,
          network: net
        });
        expect(pk.network).toEqual(networks.get(net));
      });
    });

    test('fails on invalid argument', () => {
      expect(() => {
        return PrivateKey.fromJSON('¹' as any);
      }).toThrow();
    });

    test('also accepts an object as argument', () => {
      expect(() => PrivateKey.fromObject(new PrivateKey().toObject())).not.toThrow();
    });
  });

  describe('#toString', () => {
    test('should output this address correctly', () => {
      let privkey = PrivateKey.fromWIF(wifLivenetUncompressed);
      expect(privkey.toWIF()).toBe(wifLivenetUncompressed);
    });
  });

  describe('#inspect', () => {
    test('should output known livenet address for console', () => {
      let privkey = PrivateKey.fromWIF('6K6rFy758zSHLXVHqFSkhtMt3DnVotNKtgeJhYyPyPXarqqiyQDC');
      expect(privkey.inspect()).toBe(
        '<PrivateKey: e8ed5fa79f2d11548e50d004f8975ab096ddf848bae473d23f6fd3686a1b9707, network: mainnet>'
      );
    });

    test('should output known testnet address for console', () => {
      let privkey = PrivateKey.fromWIF('cR4qogdN9UxLZJXCNFNwDRRZNeLRWuds9TTSuLNweFVjiaE4gPaq');
      expect(privkey.inspect()).toBe(
        '<PrivateKey: 67fd2209ce4a95f6f1d421ab3fbea47ada13df11b73b30c4d9a9f78cc80651ac, network: testnet>'
      );
    });

    test('outputs "uncompressed" for uncompressed imported WIFs', () => {
      let privkey = PrivateKey.fromWIF(wifLivenetUncompressed);
      expect(privkey.inspect()).toBe('<PrivateKey: 86661e2102d6e0330a70f61df1c9f9b096f0b5c2c6d20e625a3df387e522ca07, network: mainnet, uncompressed>');
    });
  });

  describe('#getValidationError', () =>{
    test('should get an error because private key greater than N', () => {
      let n = Point.getN();
      let a = PrivateKey.getValidationError(n) as Error;
      expect(a.message).toBe('Number must be less than N');
    });

    test('should validate as false because private key greater than N', () => {
      let n = Point.getN();
      let a = PrivateKey.isValid(n);
      expect(a).false;
    });

    test('should recognize that undefined is an invalid private key', () => {
      expect(PrivateKey.isValid()).false;
    });

    test('should validate as true', () => {
      let a = PrivateKey.isValid('6GqJ1wtQpc6c7BGqnCCU8htomva2Ws3nsZdmXqi4RTGZHzRmZdMc');
      expect(a).true;
    });
  });

  describe('buffer serialization', () => {
    test('returns an expected value when creating a PrivateKey from a buffer', () => {
      let privkey = PrivateKey.from(BN.fromBuffer(buf), 'mainnet');
      expect(privkey.toString()).toBe(buf.toString('hex'));
    });

    test('roundtrips correctly when using toBuffer/fromBuffer', () => {
      let privkey = PrivateKey.from(BN.fromBuffer(buf));
      let toBuffer = PrivateKey.from(privkey.toBuffer());
      let fromBuffer = PrivateKey.fromBuffer(toBuffer.toBuffer());
      expect(fromBuffer.toString()).toBe(privkey.toString());
    });

    test('will output a 31 byte buffer', () => {
      let bn = BN.fromBuffer(Buffer.from('9b5a0e8fee1835e21170ce1431f9b6f19b487e67748ed70d8a4462bc031915', 'hex'));
      let privkey = PrivateKey.from(bn);
      let buffer = privkey.toBufferNoPadding();
      expect(buffer.length).toBe(31);
    });

    test('will output a 32 byte buffer', () => {
      let bn = BN.fromBuffer(Buffer.from('9b5a0e8fee1835e21170ce1431f9b6f19b487e67748ed70d8a4462bc031915', 'hex'));
      let privkey = PrivateKey.from(bn);
      let buffer = privkey.toBuffer();
      expect(buffer.length).toBe(32);
    });

    test('should return buffer with length equal 32', () => {
      let bn = BN.fromBuffer(buf.subarray(0, 31));
      let privkey = PrivateKey.from(bn, 'mainnet');
      let expected = Buffer.concat([ Buffer.from([0]), buf.subarray(0, 31) ]);
      expect(privkey.toBuffer().toString('hex')).toBe(expected.toString('hex'));
    });
  });

  describe('#toBigNumber', () => {
    test('should output known BN', () => {
      let a = BN.fromBuffer(buf);
      let privkey = PrivateKey.from(a, 'mainnet');
      let b = privkey.toBigNumber();
      expect(b.toString('hex')).toBe(a.toString('hex'));
    });
  });

  describe('#fromRandom', () => {
    test('should set bn gt 0 and lt n, and should be compressed', () => {
      let privkey = PrivateKey.fromRandom();
      expect(privkey.bn.gt(new BN(0))).true;
      expect(privkey.bn.lt(Point.getN())).true;
      expect(privkey.compressed).true;
    });
  });

  describe('#fromWIF', () => {
    test('should parse this compressed testnet address correctly', () => {
      let privkey = PrivateKey.fromWIF(wifLivenet);
      expect(privkey.toWIF()).toBe(wifLivenet);
    });
  });

  describe('#toWIF', () => {
    test('should parse this compressed testnet address correctly', () => {
      let privkey = PrivateKey.fromWIF(wifTestnet);
      expect(privkey.toWIF()).toBe(wifTestnet);
    });
  });

  describe('#fromString', () => {
    test('should parse this uncompressed testnet address correctly', () => {
      let privkey = PrivateKey.fromString(wifTestnetUncompressed);
      expect(privkey.toWIF()).toBe(wifTestnetUncompressed);
    });
  });

  describe('#toString', () => {
    test('should parse this uncompressed livenet address correctly', () => {
      let privkey = PrivateKey.fromString(wifLivenetUncompressed);
      expect(privkey.toString()).toBe("86661e2102d6e0330a70f61df1c9f9b096f0b5c2c6d20e625a3df387e522ca07");
    });
  });

  describe('#toPublicKey', () => {
    test('should convert this known PrivateKey to known PublicKey', () => {
      let privhex = '906977a061af29276e40bf377042ffbde414e496ae2260bbf1fa9d085637bfff';
      let pubhex = '02a1633cafcc01ebfb6d78e39f687a1f0995c62fc95f51ead10a02ee0be551b5dc';
      let privkey = PrivateKey.from(new BN(Buffer.from(privhex, 'hex')));
      let pubkey = privkey.toPublicKey();
      expect(pubkey.toString()).toBe(pubhex);
    });

    test('should have a "publicKey" property', () => {
      let privhex = '906977a061af29276e40bf377042ffbde414e496ae2260bbf1fa9d085637bfff';
      let pubhex = '02a1633cafcc01ebfb6d78e39f687a1f0995c62fc95f51ead10a02ee0be551b5dc';
      let privkey = PrivateKey.from(new BN(Buffer.from(privhex, 'hex')));
      expect(privkey.publicKey.toString()).toBe(pubhex);
    });

    test('should convert this known PrivateKey to known PublicKey and preserve compressed=true', () => {
      let privwif = '6HZk5zTRZ144PtVa7bGfu6d3SPDf8kxN51U9xqYa2oQtwRKu3fxj';
      let privkey = PrivateKey.from(privwif, 'livenet');
      let pubkey = privkey.toPublicKey();
      expect(pubkey.compressed).true;
    });

    test('should convert this known PrivateKey to known PublicKey and preserve compressed=false', () => {
      let privwif = '92jJzK4tbURm1C7udQXxeCBvXHoHJstDXRxAMouPG1k1XUaXdsu';
      let privkey = PrivateKey.from(privwif, 'testnet');
      let pubkey = privkey.toPublicKey();
      expect(pubkey.compressed).false;
    });
  });

  // test('creates an address as expected from WIF, livenet', () => {
  //   let privkey = new PrivateKey('5J2NYGstJg7aJQEqNwYp4enG5BSfFdKXVTtBLvHicnRGD5kjxi6');
  //   privkey.publicKey.toAddress().toString().should.equal('bitcoincash:qqtv79nz6p246lxt6ja526nhmgdk5qtn9gdc6kt4us');
  // });

  // test('creates an address as expected from WIF, testnet', () => {
  //   let privkey = new PrivateKey('92VYMmwFLXRwXn5688edGxYYgMFsc3fUXYhGp17WocQhU6zG1kd');
  //   privkey.publicKey.toAddress().toString().should.equal('bchtest:qpv7q8crqr6872wprm7626kzkt4gafx8gc2x9ecrpr');
  // });

});