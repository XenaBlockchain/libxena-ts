import { describe, expect, test } from "vitest";
import { Address, AddressType, Opcode, PublicKey, Script } from "../../../src";
import { networks } from "../../../src/core/network/network-manager";
import BufferUtils from "../../../src/utils/buffer.utils";

describe('Address', () => {

  let PKHMainnet = [
    'nexa:qpm2qsznhks23z7629mms6s4cwef74vcwvgpsey0xy',
    'nexa:qr95sy3j9xwd2ap32xkykttr4cvcu7as4yrtkg2qqa',
    'nexa:qqq3728yw0y47sqn6l2na30mcw6zm78dzq0jl7vjk6'
  ];

  let PKHTestnet = [
    'nexatest:qpm2qsznhks23z7629mms6s4cwef74vcwvx26kzw52',
    'nexatest:qr95sy3j9xwd2ap32xkykttr4cvcu7as4ydqu8vpjn',
    'nexatest:qqq3728yw0y47sqn6l2na30mcw6zm78dzqpe432ny5'
  ];

  let P2STMainnet = [
    'nexa:nqtsq5g567x44x5g54t2wsxz60zwqmyks63rkrddsfq94pd2',
    'nexa:nqtsq5g5pe6hu4uq5se0un6mwu90xneuvnu92zzf850pfkqg',
    'nexa:nqtsq5g53zfa3x6tu5nlf6sp3js3qka93h7dafpvjaw8nmvm'
  ];

  let P2STTestnet = [
    'nexatest:nqtsq5g567x44x5g54t2wsxz60zwqmyks63rkrddl4stwnzu',
    'nexatest:nqtsq5g5pe6hu4uq5se0un6mwu90xneuvnu92zzfggl0jy07',
    'nexatest:nqtsq5g53zfa3x6tu5nlf6sp3js3qka93h7dafpvap7fgfrd'
  ];

  let GroupMainnet = [
    'nexa:tpzm4zwghn3mus4c3tvq7ewfncrad5u4g8zad30stmapu39knqqqqx4x3rhhm',
    'nexa:tqmzcxud34qypcwecg6rmr3eg4tx8gh29fdx95qsl6ydltz8rsqqqx90ywc9a',
    'nexa:tr9v70v4s9s6jfwz32ts60zqmmkp50lqv7t0ux620d50xa7dhyqqqcg6kdm6f'
  ];

  let GroupTestnet = [
    'nexatest:tpzm4zwghn3mus4c3tvq7ewfncrad5u4g8zad30stmapu39knqqqq9xdy9pg2',
    'nexatest:tqmzcxud34qypcwecg6rmr3eg4tx8gh29fdx95qsl6ydltz8rsqqq9ky3gw6v',
    'nexatest:tr9v70v4s9s6jfwz32ts60zqmmkp50lqv7t0ux620d50xa7dhyqqqmm3rtd9c'
  ];

  test('can\'t build without data', () => {
    expect(() => new Address(undefined as any)).toThrow('First argument is required, please include address data.');
  });

  test('should throw an error because of bad network param', () => {
    expect(() => new Address(Buffer.from([1,2,3]), 'main', 'P2PKH' as any)).toThrow('Second argument must be "mainnet" or "testnet".');
  });

  test('should throw an error because of bad type param', () => {
    expect(() => new Address(Buffer.from([1,2,3]), 'livenet', 'pubkey' as any)).toThrow('Third argument must be "P2ST", "P2PKH" or "GROUP');
  });

  describe('validation', () => {

    test('getValidationError detects network mismatchs', () => {
      let error = Address.getValidationError(P2STMainnet[0], 'testnet');
      expect(error).toBeDefined();
    });

    test('isValid returns true on a valid mainnet/testnet address', () => {
      expect(Address.isValid(P2STMainnet[0], 'mainnet')).toBe(true);
      expect(Address.isValid(P2STTestnet[0], 'testnet')).toBe(true);
      expect(Address.isValid(PKHMainnet[0], 'mainnet')).toBe(true);
      expect(Address.isValid(PKHTestnet[0], 'testnet')).toBe(true);
      expect(Address.isValid(GroupMainnet[0], 'mainnet')).toBe(true);
      expect(Address.isValid(GroupTestnet[0], 'testnet')).toBe(true);
    });

    test('isValid returns false on network mismatch', () => {
      expect(Address.isValid(P2STMainnet[0], 'testnet')).toBe(false);
      expect(Address.isValid(P2STTestnet[0], 'mainnet')).toBe(false);
      expect(Address.isValid(PKHMainnet[0], 'testnet')).toBe(false);
      expect(Address.isValid(PKHTestnet[0], 'mainnet')).toBe(false);
      expect(Address.isValid(GroupMainnet[0], 'testnet')).toBe(false);
      expect(Address.isValid(GroupTestnet[0], 'mainnet')).toBe(false);
    });

    test('validates correctly the P2PKH test vector', () => {
      for (let i = 0; i < PKHMainnet.length; i++) {
        let error = Address.getValidationError(PKHMainnet[i]);
        expect(error).not.toBeDefined();
      }
    });

    test('validates correctly the P2ST test vector', () => {
      for (let i = 0; i < P2STMainnet.length; i++) {
        let error = Address.getValidationError(P2STMainnet[i]);
        expect(error).not.toBeDefined();
      }
    });

    test('validates correctly the GROUP test vector', () => {
      for (let i = 0; i < GroupMainnet.length; i++) {
        let error = Address.getValidationError(GroupMainnet[i]);
        expect(error).not.toBeDefined();
      }
    });

    test('validates correctly the P2ST testnet test vector', () => {
      for (let i = 0; i < P2STTestnet.length; i++) {
        let error = Address.getValidationError(P2STTestnet[i], 'testnet');
        expect(error).not.toBeDefined();
      }
    });

    test('rejects correctly the P2PKH livenet test vector with "testnet" parameter', () => {
      for (let i = 0; i < PKHMainnet.length; i++) {
        let error = Address.getValidationError(PKHMainnet[i], 'testnet');
        expect(error).toBeDefined();
      }
    });

    test('validates correctly the P2PKH mainnet test vector with "mainnet" parameter', () => {
      for (let i = 0; i < PKHMainnet.length; i++) {
        let error = Address.getValidationError(PKHMainnet[i], 'mainnet');
        expect(error).not.toBeDefined();
      }
    });

    test('should not validate on a network mismatch', () => {
      for (let i = 0; i < PKHMainnet.length; i++) {
        let error = Address.getValidationError(PKHMainnet[i], 'testnet', AddressType.PayToPublicKeyHash);
        expect(error).toBeDefined();
        expect(error!.message).toBe('Address has mismatched network type.');
      }
      for (let i = 0; i < PKHTestnet.length; i++) {
        let error = Address.getValidationError(PKHTestnet[i], 'mainnet', AddressType.PayToPublicKeyHash);
        expect(error).toBeDefined();
        expect(error!.message).toBe('Address has mismatched network type.');
      }
    });

    test('should not validate on a type mismatch', () => {
      for (let i = 0; i < PKHMainnet.length; i++) {
        let error = Address.getValidationError(PKHMainnet[i], 'mainnet', AddressType.PayToScriptTemplate);
        expect(error).toBeDefined();
        expect(error!.message).toBe('Address has mismatched type.');
      }
    });

    test('testnet addresses are validated correctly', () => {
      for (let i = 0; i < PKHTestnet.length; i++) {
        let error = Address.getValidationError(PKHTestnet[i], 'testnet');
        expect(error).not.toBeDefined();
      }
    });

    test('address buffer are validated correctly', () => {
      let data = Buffer.from([23, 0, 81, 20, 136, 147, 216, 155, 75, 229, 39, 244, 234, 1, 140, 161, 16, 91, 165, 141, 252, 222, 164, 44]);
      let error = Address.getValidationError(data);
      expect(error).not.toBeDefined();
    });
  });

  describe('instantiation', () => {
    test('can be instantiated from another address', () => {
      let address = Address.fromString(GroupMainnet[1]);
      let address2 = new Address(address.data, address.network, address.type);
      expect(address.toString()).toBe(address2.toString());

      let address3 = new Address(address2);
      expect(address3).toEqual(address2);
    });
  });

  describe('encodings', () => {

    let str = P2STMainnet[2];
    let data = Buffer.from([23, 0, 81, 20, 136, 147, 216, 155, 75, 229, 39, 244, 234, 1, 140, 161, 16, 91, 165, 141, 252, 222, 164, 44]);

    test('should make an address from a string', () => {
      expect(Address.fromString(str).toString()).toBe(str);
      expect(new Address(str).toString()).toBe(str);
    });

    test('should make an address using a non-string network', () => {
      expect(new Address(data, networks.mainnet).toString()).toBe(str);
    });

    test('should throw with bad network param', () => {
      expect(() => new Address(data, 'somenet' as string)).toThrow('Second argument must be "mainnet" or "testnet".');
    });

    test('should error because of unrecognized data format', () => {
      expect(() => new Address(new Error() as any)).toThrow("Invalid Argument");
    });

    test('should error because of incorrect format for pubkey', () => {
      expect(() => Address.fromPublicKey('not-a-key' as any)).toThrow('Address must be an instance of PublicKey.');
    });

    test('should error because of incorrect format for pubkey type', () => {
      let pubkey = PublicKey.fromString('0285e9737a74c30a873f74df05124f2aa6f53042c2fc0a130d6cbd7d16b944b004');
      expect(() => Address.fromPublicKey(pubkey, 'mainnet', AddressType.GroupIdAddress)).toThrow('type must be P2ST or P2PKH');
    });

    test('should error because of incorrect format for script template', () => {
      expect(() => Address.fromScriptTemplate('somestring' as any, Opcode.OP_FALSE)).toThrow('templateHash supplied is not a hash buffer or well-known OP_1.');
      expect(() => Address.fromScriptTemplate('somestring' as any, BufferUtils.emptyBuffer(20))).toThrow('templateHash supplied is not a hash buffer or well-known OP_1.');
      expect(() => Address.fromScriptTemplate(Opcode.OP_1, Opcode.OP_15)).toThrow('constraintHash supplied is not a hash buffer or OP_FALSE.');
      expect(() => Address.fromScriptTemplate(BufferUtils.emptyBuffer(20), Opcode.OP_15)).toThrow('constraintHash supplied is not a hash buffer or OP_FALSE.');

      expect(() => Address.fromScriptTemplate(BufferUtils.emptyBuffer(15), Opcode.OP_FALSE)).toThrow('templateHash supplied is not a hash buffer or well-known OP_1.');
      expect(() => Address.fromScriptTemplate(BufferUtils.emptyBuffer(20), BufferUtils.emptyBuffer(15))).toThrow('constraintHash supplied is not a hash buffer or OP_FALSE.');
    });

    test('should make this address from a compressed pubkey', () => {
      let pubkey = PublicKey.fromString('0285e9737a74c30a873f74df05124f2aa6f53042c2fc0a130d6cbd7d16b944b004');
      let address = Address.fromPublicKey(pubkey, 'mainnet');
      expect(address.toString()).toBe('nexa:nqtsq5g5wpr5aht6qggegag50s7uhrypc23yhp52cmdsspct');
    });

    test('should use the default network for pubkey', () => {
      let pubkey = PublicKey.fromString('0285e9737a74c30a873f74df05124f2aa6f53042c2fc0a130d6cbd7d16b944b004');
      let address = Address.fromPublicKey(pubkey);
      expect(address.network).toEqual(networks.defaultNetwork);
    });

    test('should make this address from an uncompressed pubkey', () => {
      let pubkey = PublicKey.fromString('0485e9737a74c30a873f74df05124f2aa6f53042c2fc0a130d6cbd7d16b944b00' +
        '4833fef26c8be4c4823754869ff4e46755b85d851077771c220e2610496a29d98');
      let a = Address.fromPublicKey(pubkey, 'mainnet');
      expect(a.toString()).toBe('nexa:nqtsq5g5mg28tz2qzn82gvper5w73wyv92a3r8zefalqu0hk');
      let b = Address.fromPublicKey(pubkey, 'mainnet', AddressType.PayToScriptTemplate);
      expect(b.toString()).toBe('nexa:nqtsq5g5mg28tz2qzn82gvper5w73wyv92a3r8zefalqu0hk');
      let c = Address.fromPublicKey(pubkey, 'mainnet', AddressType.PayToPublicKeyHash);
      expect(c.toString()).toBe('nexa:qqazje5ucx2l672lc8cundsa5q9lwdm3rc6cdyxe63');
    });

    test('should derive from this known address string testnet', () => {
      let a = new Address(PKHTestnet[0]);
      let b = new Address(a.toString());
      expect(b.toString()).toBe(PKHTestnet[0]);
      expect(b.network).toEqual(networks.testnet);
    });

    test('should derive from this known address string livenet', () => {
      let a = new Address(P2STMainnet[0]);
      let b = new Address(a.toString());
      expect(b.toString()).toBe(P2STMainnet[0]);
      expect(b.network).toEqual(networks.mainnet);
    });

    test('should derive from this known address string testnet group', () => {
      let address = new Address(GroupTestnet[0]);
      address = new Address(address.toString());
      expect(address.toString()).toBe(GroupTestnet[0]);
      expect(address.network).toEqual(networks.testnet);
    });
  });

  describe('#object', () => {

    let str = P2STMainnet[0];

    test('roundtrip to-from-to', () => {
      let obj = new Address(str).toObject();
      let address = Address.fromObject(obj);
      expect(address.toString()).toBe(str);
    });

    test('will fail with invalid arg', () => {
      expect(() => Address.fromObject('¹' as any)).toThrow("Invalid Argument");
    });
  });

  describe('#toString', () => {

    let str = P2STMainnet[0];

    test('livenet pubkeyhash address', () => {
      let address = new Address(str);
      expect(address.toString()).toBe(str);
    });

    test('scripttemplate address', () => {
      let address = new Address(P2STMainnet[0]);
      expect(address.toString()).toBe(P2STMainnet[0]);
    });

    test('testnet scripttemplate address', () => {
      let address = new Address(P2STTestnet[0]);
      expect(address.toString()).toBe(P2STTestnet[0]);
    });

    test('testnet pubkeyhash address', () => {
      let address = new Address(PKHTestnet[0]);
      expect(address.toString()).toBe(PKHTestnet[0]);
    });

    test('testnet group address', () => {
      let address = new Address(GroupTestnet[0]);
      expect(address.toString()).toBe(GroupTestnet[0]);
    });

    test('mainnet group address', () => {
      let address = new Address(GroupMainnet[0]);
      expect(address.toString()).toBe(GroupMainnet[0]);
    });
  });

  describe('#inspect', () => {
    test('should output formatted output correctly', () => {
      let address = new Address(P2STMainnet[0]);
      let output = '<Address: nexa:nqtsq5g567x44x5g54t2wsxz60zwqmyks63rkrddsfq94pd2, type: P2ST, network: mainnet>';
      expect(address.inspect()).toBe(output);
    });
  });

  describe('questions about the address', () => {
    test('should detect a P2ST address', () => {
      expect(new Address(P2STMainnet[0]).isPayToScriptTemplate()).toBe(true);
      expect(new Address(P2STMainnet[0]).isPayToPublicKeyHash()).toBe(false);
      expect(new Address(P2STMainnet[0]).isGroupIdentifierAddress()).toBe(false);
      expect(new Address(P2STTestnet[0]).isPayToScriptTemplate()).toBe(true);
      expect(new Address(P2STTestnet[0]).isPayToPublicKeyHash()).toBe(false);
      expect(new Address(P2STTestnet[0]).isGroupIdentifierAddress()).toBe(false);
    });
    test('should detect a P2PKH address', () => {
      expect(new Address(PKHMainnet[0]).isPayToPublicKeyHash()).toBe(true);
      expect(new Address(PKHMainnet[0]).isPayToScriptTemplate()).toBe(false);
      expect(new Address(PKHMainnet[0]).isGroupIdentifierAddress()).toBe(false);
      expect(new Address(PKHTestnet[0]).isPayToPublicKeyHash()).toBe(true);
      expect(new Address(PKHTestnet[0]).isPayToScriptTemplate()).toBe(false);
      expect(new Address(PKHTestnet[0]).isGroupIdentifierAddress()).toBe(false);
    });
    test('should detect a GROUP ID address', () => {
      expect(new Address(GroupMainnet[0]).isPayToPublicKeyHash()).toBe(false);
      expect(new Address(GroupMainnet[0]).isPayToScriptTemplate()).toBe(false);
      expect(new Address(GroupMainnet[0]).isGroupIdentifierAddress()).toBe(true);
      expect(new Address(GroupTestnet[0]).isPayToPublicKeyHash()).toBe(false);
      expect(new Address(GroupTestnet[0]).isPayToScriptTemplate()).toBe(false);
      expect(new Address(GroupTestnet[0]).isGroupIdentifierAddress()).toBe(true);
    });
  });

  test('throws an error if it couldn\'t instantiate', () => {
    expect(() => new Address(1 as any)).toThrow("data must be Address, string or Buffer");
  });

  test('can roundtrip from/to a object', () => {
    let address = new Address(P2STMainnet[0]);
    expect(Address.fromObject(address.toObject()).toString()).toBe(P2STMainnet[0]);
  });

  test('will use the default network for an object', () => {
    let obj = {
      hash: Buffer.from('19a7d869032368fd1f1e26e5e73a4ad0e474960e', 'hex'),
      type: AddressType.PayToScriptTemplate
    };
    let address = new Address(obj.hash, undefined, obj.type);
    expect(address.network).toEqual(networks.defaultNetwork);
  });

  test('get correct transaction output type', () => {
    let address = new Address(P2STMainnet[0]);
    expect(address.getOutputType()).toBe(1);

    let address2 = new Address(PKHMainnet[0]);
    expect(address2.getOutputType()).toBe(0);

    expect(Address.getOutputType(P2STMainnet[0])).toBe(1);
    expect(Address.getOutputType(PKHMainnet[0])).toBe(0);
  });

  test('should make address from script templates with visible args', () => {
    let address = Address.fromScriptTemplate(BufferUtils.emptyBuffer(20), BufferUtils.emptyBuffer(20), [1,2]);
    expect(address.toString()).toBe("nexa:nqksq9qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq5qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqypqpqmm07nk");
    let address2 = Address.fromScriptTemplate(BufferUtils.emptyBuffer(20), BufferUtils.emptyBuffer(20), Script.fromBuffer(Buffer.from([1,2])));
    expect(address2.toString()).toBe("nexa:nqksq9qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq5qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqypqpqmm07nk");
    let address3 = Address.fromScriptTemplate(BufferUtils.emptyBuffer(20), BufferUtils.emptyBuffer(20), Buffer.from([1,2]).toString('hex'));
    expect(address3.toString()).toBe("nexa:nqksq9qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq5qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqypqpqmm07nk");
  });
});