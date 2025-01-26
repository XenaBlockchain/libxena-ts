import { describe, expect, test, vi } from "vitest";
import { AddressType } from "../../../src/core/address/address-formatter";
import BufferUtils from "../../../src/utils/buffer.utils";
import AddressFormatter from "../../../src/core/address/address-formatter";

describe('AddressFormatter', () => {

  const PREFIXES = ['nexa', 'nexatest'];
  const ADDRESS_TYPES = [AddressType.PayToPublicKeyHash, AddressType.PayToScriptTemplate, AddressType.GroupIdAddress];
  const VALID_SIZES = [20, 24, 28, 32, 40, 48, 56, 64];

  /* Generate with libnexakotlin code
    val v = listOf(intArrayOf(118, 160, 64,  83, 189, 160, 168, 139, 218, 81, 119, 184, 106, 21, 195, 178, 159, 85,  152, 115).map{ it.toByte()}.toByteArray(), intArrayOf(203, 72, 18, 50, 41,  156, 213, 116, 49,  81, 172, 75, 45, 99, 174, 25,  142, 123, 176, 169).map{ it.toByte()}.toByteArray(), intArrayOf(1,   31, 40,  228, 115, 201, 95, 64,  19,  215, 213, 62, 197, 251, 195, 180, 45, 248, 237, 16).map{ it.toByte()}.toByteArray())

    v.map { "'" + PayAddress(ChainSelector.NEXA, PayAddressType.P2PKH, it).toString() + "'" }.joinToString(", ")
    v.map { "'" + PayAddress(ChainSelector.NEXATESTNET, PayAddressType.P2PKH, it).toString() + "'" }.joinToString(", ")
    v.map { "'" + PayAddress(ChainSelector.REGTEST, PayAddressType.P2PKH, it).toString() + "'" }.joinToString(", ")

 val cs = ChainSelector.NEXA
 val n = listOf(SatoshiScript.ungroupedP2pkt(cs, intArrayOf(118, 160, 64,  83, 189, 160, 168, 139, 218, 81, 119, 184, 106, 21, 195, 178, 159, 85,  152, 115).map{ it.toByte()}.toByteArray()), SatoshiScript.ungroupedP2pkt(cs, intArrayOf(203, 72, 18, 50, 41,  156, 213, 116, 49,  81, 172, 75, 45, 99, 174, 25,  142, 123, 176, 169).map{ it.toByte()}.toByteArray()), SatoshiScript.ungroupedP2pkt(cs, intArrayOf(1,   31, 40,  228, 115, 201, 95, 64,  19,  215, 213, 62, 197, 251, 195, 180, 45, 248, 237, 16).map{ it.toByte()}.toByteArray()))


  // TEMPLATE_TEST_DATA bytes
  n.map { it.asSerializedByteArray().map{ it.toUByte().toString() }.joinToString(", ","[","]")}.joinToString(",")

  // proper addresses
  // Nexa
  n.map { "'" + it.address.toString() + "'" }.joinToString(", ")
  // testnet
  val t = n.map { PayAddress(ChainSelector.NEXATESTNET, it.address!!.type, it.address!!.data) }
  t.map { "'" + it.toString() + "'" }.joinToString(", ") 
  // regtest
  val r = n.map { PayAddress(ChainSelector.REGTEST, it.address!!.type, it.address!!.data) }
  r.map { "'" + it.toString() + "'" }.joinToString(", ") 
  */
    
  const TEST_HASHES = [
    Buffer.from([118, 160, 64,  83, 189, 160, 168, 139, 218, 81, 119, 184, 106, 21, 195, 178, 159, 85,  152, 115]),
    Buffer.from([203, 72, 18, 50, 41,  156, 213, 116, 49,  81, 172, 75, 45, 99, 174, 25,  142, 123, 176, 169]),
    Buffer.from([1,   31, 40,  228, 115, 201, 95, 64,  19,  215, 213, 62, 197, 251, 195, 180, 45, 248, 237, 16]),
  ];

  const TEMPLATE_TEST_DATA = [
    Buffer.from([23, 0, 81, 20, 215, 141, 90, 154, 136, 165, 86, 167, 64, 194, 211, 196, 224, 108, 150, 134, 162, 59, 13, 173]),
    Buffer.from([23, 0, 81, 20, 14, 117, 126, 87, 128, 164, 50, 254, 79, 91, 119, 10, 243, 79, 60, 100, 248, 85, 8, 73]),
    Buffer.from([23, 0, 81, 20, 136, 147, 216, 155, 75, 229, 39, 244, 234, 1, 140, 161, 16, 91, 165, 141, 252, 222, 164, 44]),
  ];

  const GROUP_TEST_DATA = [
    Buffer.from([69, 186, 137, 200, 188, 227, 190, 66, 184, 138, 216, 15, 101, 201, 158, 7, 214, 211, 149, 65, 197, 214, 197, 240, 94, 250, 30, 68, 182, 152, 0, 0]),
    Buffer.from([54, 44, 27, 141, 141, 64, 64, 225, 217, 194, 52, 61, 142, 57, 69, 86, 99, 162, 234, 42, 90, 98, 208, 16, 254, 136, 223, 172, 71, 28, 0, 0]),
    Buffer.from([202, 207, 61, 149, 129, 97, 169, 37, 194, 138, 151, 13, 60, 64, 222, 236, 26, 63, 224, 103, 150, 254, 27, 74, 123, 104, 243, 119, 205, 185, 0, 0]),
  ];
    
  const EXPECTED_P2PKH_OUTPUTS = [
    'nexa:qpm2qsznhks23z7629mms6s4cwef74vcwvgpsey0xy', 'nexa:qr95sy3j9xwd2ap32xkykttr4cvcu7as4yrtkg2qqa', 'nexa:qqq3728yw0y47sqn6l2na30mcw6zm78dzq0jl7vjk6'
  ];

  const EXPECTED_TEMPLATE_OUTPUTS = [
    'nexa:nqtsq5g567x44x5g54t2wsxz60zwqmyks63rkrddsfq94pd2', 'nexa:nqtsq5g5pe6hu4uq5se0un6mwu90xneuvnu92zzf850pfkqg', 'nexa:nqtsq5g53zfa3x6tu5nlf6sp3js3qka93h7dafpvjaw8nmvm'
  ];

  const EXPECTED_GROUP_OUTPUTS = [
    'nexa:tpzm4zwghn3mus4c3tvq7ewfncrad5u4g8zad30stmapu39knqqqqx4x3rhhm', 'nexa:tqmzcxud34qypcwecg6rmr3eg4tx8gh29fdx95qsl6ydltz8rsqqqx90ywc9a', 'nexa:tr9v70v4s9s6jfwz32ts60zqmmkp50lqv7t0ux620d50xa7dhyqqqcg6kdm6f'
  ];

  const EXPECTED_P2PKH_OUTPUTS_TESTNET = [
    'nexatest:qpm2qsznhks23z7629mms6s4cwef74vcwvx26kzw52', 'nexatest:qr95sy3j9xwd2ap32xkykttr4cvcu7as4ydqu8vpjn', 'nexatest:qqq3728yw0y47sqn6l2na30mcw6zm78dzqpe432ny5'
  ];

  const EXPECTED_TEMPLATE_OUTPUTS_TESTNET = [
    'nexatest:nqtsq5g567x44x5g54t2wsxz60zwqmyks63rkrddl4stwnzu', 'nexatest:nqtsq5g5pe6hu4uq5se0un6mwu90xneuvnu92zzfggl0jy07', 'nexatest:nqtsq5g53zfa3x6tu5nlf6sp3js3qka93h7dafpvap7fgfrd'
  ];

  const EXPECTED_GROUP_OUTPUTS_TESTNET = [
    'nexatest:tpzm4zwghn3mus4c3tvq7ewfncrad5u4g8zad30stmapu39knqqqq9xdy9pg2', 'nexatest:tqmzcxud34qypcwecg6rmr3eg4tx8gh29fdx95qsl6ydltz8rsqqq9ky3gw6v', 'nexatest:tr9v70v4s9s6jfwz32ts60zqmmkp50lqv7t0ux620d50xa7dhyqqqmm3rtd9c'
  ];

  describe('#encode()', () => {
    test('should fail on an invalid prefix', () => {
      expect(() => 
        AddressFormatter.encodeAddress({ prefix: 'some invalid prefix', type: ADDRESS_TYPES[0], data: Buffer.from([]) })
      ).toThrow("Invalid prefix");
    });

    test('should fail on a prefix with mixed letter case', () => {
      expect(() => 
        AddressFormatter.encodeAddress({ prefix: 'NeXa', type: ADDRESS_TYPES[0], data: Buffer.from([]) })
      ).toThrow("Invalid prefix");
    });

    test('should fail on an invalid type', () => {
      expect(() => 
        AddressFormatter.encodeAddress({ prefix: PREFIXES[0], type: 'some invalid type' as any, data: Buffer.from([]) })
      ).toThrow("Invalid type");
    });

    test('should encode test hashes on mainnet correctly', () => {
      for (const index in TEST_HASHES) {
        expect(AddressFormatter.encode('nexa', AddressType.PayToPublicKeyHash, TEST_HASHES[index])).toBe(EXPECTED_P2PKH_OUTPUTS[index]);
        expect(AddressFormatter.encode('nexa', AddressType.PayToScriptTemplate, TEMPLATE_TEST_DATA[index])).toBe(EXPECTED_TEMPLATE_OUTPUTS[index]);
        expect(AddressFormatter.encode('nexa', AddressType.GroupIdAddress, GROUP_TEST_DATA[index])).toBe(EXPECTED_GROUP_OUTPUTS[index]);
      }
    });

    test('should encode test hashes on testnet correctly', () => {
      for (const index in TEST_HASHES) {
        expect(AddressFormatter.encode('nexatest', AddressType.PayToPublicKeyHash, TEST_HASHES[index])).toBe(EXPECTED_P2PKH_OUTPUTS_TESTNET[index]);
        expect(AddressFormatter.encode('nexatest', AddressType.PayToScriptTemplate, TEMPLATE_TEST_DATA[index])).toBe(EXPECTED_TEMPLATE_OUTPUTS_TESTNET[index]);
        expect(AddressFormatter.encode('nexatest', AddressType.GroupIdAddress, GROUP_TEST_DATA[index])).toBe(EXPECTED_GROUP_OUTPUTS_TESTNET[index]);
      }
    });
  });

  describe('#decode()', () => {
    test('should fail when the version byte is invalid', () => {
      expect(() => 
        AddressFormatter.decode('nexa:zpm2qsznhks23z7629mms6s4cwef74vcwvrqekrq9w')
      ).toThrow("Invalid checksum");

      vi.spyOn(AddressFormatter as any, 'convertBits').mockImplementation(() => [39,20,30]);

      expect(() => 
        AddressFormatter.decode('nexa:qpm2qsznhks23z7629mms6s4cwef74vcwvgpsey0xy')
      ).toThrow("Invalid address type in version byte");

      vi.restoreAllMocks();
    });

    test('should fail when given an address with mixed letter case', () => {
      expect(() => 
        AddressFormatter.decode('NEXA:NQTSQ5G567X44X5G54T2WSXZ60ZWQMYKS63RKRdDSFQ94PD2')
      ).toThrow("Invalid address");
      expect(() => 
        AddressFormatter.decode('Nexa:nqtsq5g567x44x5g54t2wsxz60zwqmyks63rkrddsfq94pd2')
      ).toThrow("Invalid address");
      expect(() => 
        AddressFormatter.decode('Nexa:nQTsq5g567x44x5g54t2wsxz60zwqmyks63rkrddsfq94pd2')
      ).toThrow("Invalid address");
    });

    test('should decode a valid address regardless of letter case', () => {
      expect(AddressFormatter.decode('nexa:nqtsq5g567x44x5g54t2wsxz60zwqmyks63rkrddsfq94pd2').data)
        .toEqual(AddressFormatter.decode('NEXA:NQTSQ5G567X44X5G54T2WSXZ60ZWQMYKS63RKRDDSFQ94PD2').data);
    });
    
    test('should fail when decoding for a different network', () => {
      for (const network of PREFIXES) {
        for (const anotherNetwork of PREFIXES) {
          if (network !== anotherNetwork) {
            const hash = BufferUtils.getRandomBuffer(20);
            expect(() => {
              const address = AddressFormatter.encode(network, ADDRESS_TYPES[0], hash);
              const invalidAddress = [anotherNetwork, address.split(':')[1]].join(':');
              AddressFormatter.decode(invalidAddress);
            }).toThrow();
          }
        } 
      }
    });
  });
  
  describe('#encode() #decode()', () => {
    test('should encode and decode all sizes correctly', () => {
      for (const size of VALID_SIZES) {
        const hash = BufferUtils.getRandomBuffer(size);
        const address = AddressFormatter.encode(PREFIXES[0], ADDRESS_TYPES[0], hash);
        const { prefix, type, data: actualHash } = AddressFormatter.decode(address);
        expect(prefix).toBe(PREFIXES[0]);
        expect(type).toBe(ADDRESS_TYPES[0]);
        expect(actualHash).toEqual(hash);
      }
    });
  
    test('should encode and decode all types and networks', () => {
      for (const type of ADDRESS_TYPES) {
        for (const network of PREFIXES) {
          const hash = BufferUtils.getRandomBuffer(20);
          const address = AddressFormatter.encode(network, type, hash);
          const { prefix, type: actualType, data: actualHash } = AddressFormatter.decode(address);
          expect(prefix).toBe(network);
          expect(actualType).toBe(type);
          expect(actualHash).toEqual(hash);
        }
      }
    });
  
    test('should encode and decode many random hashes', () => {
      const NUM_TESTS = 1000;
      for (let i = 0; i < NUM_TESTS; ++i) {
        for (const type of ADDRESS_TYPES) {
          const hash = BufferUtils.getRandomBuffer(20);
          const address = AddressFormatter.encode(PREFIXES[0], type, hash);
          const { prefix, type: actualType, data: actualHash } = AddressFormatter.decode(address);
          expect(prefix).toBe(PREFIXES[0]);
          expect(actualType).toBe(type);
          expect(actualHash).toEqual(hash);
        }
      }
    });
  });
});