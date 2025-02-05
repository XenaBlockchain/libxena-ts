import { describe, test, expect } from "vitest";
import BufferUtils from "../../../src/utils/buffer.utils";
import type { Network } from "../../../src/core/network/network";
import { networks } from "../../../src/core/network/network-manager";
import type { NetworkParams } from "../../../src";

describe('Network and NetworkManager', () => {

  let customnet: Network;

  test('should contain all Network', () => {
    expect(networks.mainnet).toBeDefined();
    expect(networks.testnet).toBeDefined();
    expect(networks.defaultNetwork).toBeDefined();
  });

  test('should be able to define a custom Network', () => {
    let custom: NetworkParams = {
      name: 'customnet',
      prefix: "cnet",
      alias: 'mynet',
      pubkeyhash: 0x10,
      privatekey: 0x90,
      scripthash: 0x08,
      xpubkey: 0x0278b20e,
      xprivkey: 0x0278ade4,
      networkMagic: 0xe7beb4d4,
      port: 20001,
      dnsSeeds: [
        'localhost',
        'mynet.localhost'
      ]
    };
    networks.add(custom);
    customnet = networks.get('customnet')!;
    for (let _key in custom) {
      let key = _key as keyof Network;
      if (key !== 'networkMagic') {
        expect(customnet[key]).toBe(custom[key]);
      } else {
        let expected = Buffer.from('e7beb4d4', 'hex');
        expect(customnet[key]).toEqual(expected);
      }
    }
  });

  test('can remove a custom network', function() {
    expect(networks.get('customnet')).toBeDefined();
    networks.remove(customnet);
    expect(networks.get('customnet')).not.toBeDefined();
  });

  test('can remove a custom network by name', function() {
    let custom: NetworkParams = {
      name: 'customnet',
      prefix: "cnet",
      alias: 'mynet',
      pubkeyhash: 0x10,
      privatekey: 0x90,
      scripthash: 0x08,
      xpubkey: 0x0278b20e,
      xprivkey: 0x0278ade4,
      networkMagic: 0xe7beb4d4,
      port: 20001,
      dnsSeeds: [
        'localhost',
        'mynet.localhost'
      ]
    };
    networks.add(custom);
    networks.remove("customnet_wrong_name");
    expect(networks.get('customnet')).toBeDefined();
    networks.remove("customnet");
    expect(networks.get('customnet')).not.toBeDefined();
  });

  test('should have network magic for testnet', () => {
    let testnet = networks.get('testnet');
    expect(BufferUtils.isBuffer(testnet!.networkMagic)).true;
  });

  test('should not set a network map for an undefined value', () => {
    let network = networks.get(undefined);
    expect(network).not.toBeDefined();
    network = networks.get();
    expect(network).not.toBeDefined();
    let somenet = networks.get('somenet');
    expect(somenet).not.toBeDefined();
    let numnet = networks.get(555);
    expect(numnet).not.toBeDefined();
  });

  let constants = ['name', 'alias', 'pubkeyhash', 'scripthash', 'xpubkey', 'xprivkey'];

  constants.forEach(key => {
    test('should have constant '+key+' for livenet and testnet', () =>{
      expect(networks.testnet.hasOwnProperty(key)).true;
      expect(networks.mainnet.hasOwnProperty(key)).true;
    });
  });

  test('tests only for the specified key', () => {
    expect(networks.get(0x6f, 'pubkeyhash')).toEqual(networks.testnet);
    expect(networks.get(0x6f, 'privatekey')).not.toBeDefined();
    expect(networks.get(0x19, 'pubkeyhash')).toEqual(networks.livenet);
    expect(networks.get(0x19, 'privatekey')).not.toBeDefined();

    expect(networks.get(0x72271221, 'networkMagic')).toEqual(networks.mainnet);
    expect(networks.get(0x72271222, 'networkMagic')).toEqual(networks.testnet);
    expect(networks.get(0x72271226, 'networkMagic')).not.toBeDefined();
  });

  test('should have testnet network', () => {
    expect(networks.get('testnet')?.name).toBe('testnet');
    expect(networks.get(networks.testnet)?.name).toBe('testnet');
    expect(networks.get(networks.create({ name: 'testnet', networkMagic: 0x72271222 } as any))?.alias).toBe('testnet');
  });

  test('should have livenet network', () => {
    expect(networks.get('livenet')?.name).toBe('mainnet');
    expect(networks.get('livenet')?.alias).toBe('livenet');
    expect(networks.get(networks.mainnet)?.name).toBe('mainnet');
  });

  test('should have correct prefix', () => {
    expect(networks.get('testnet')?.prefix).toBe('nexatest');
    expect(networks.get('mainnet')?.prefix).toBe('nexa');
  });

  test('converts to string using the "name" property', () => {
    expect(networks.mainnet.toString()).toBe('mainnet');
  });
});