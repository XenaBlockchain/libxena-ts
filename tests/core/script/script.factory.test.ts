import { describe, expect, test } from "vitest";
import Address from "../../../src/core/address/address";
import ScriptFactory from "../../../src/core/script/script.factory";
import PublicKey from "../../../src/keys/publickey";
import Signature from "../../../src/crypto/signature";
import Script from "../../../src/core/script/script";
import { Opcode } from "../../../src";

describe("ScriptFactory", () => {

  describe('#buildScriptTemplateOut', () => {

    test('should fail on non-template address', () => {
      let address = 'nexa:qpm2qsznhks23z7629mms6s4cwef74vcwvgpsey0xy';
      expect(() => ScriptFactory.buildScriptTemplateOut(address)).toThrow("Invalid destination address");
      expect(() => ScriptFactory.buildScriptTemplateOut(Address.fromString(address))).toThrow("Invalid destination address");
    });

    test('should fail on invalid address argument', () => {
      expect(() => ScriptFactory.buildScriptTemplateOut(undefined as any)).toThrow("must provide an argument");
      expect(() => ScriptFactory.buildScriptTemplateOut(13 as any)).toThrow("must be address or pubkey");
    });

    test('should fail on invalid or missing one of group data', () => {
      let address = 'nexatest:nqtsq5g53zfa3x6tu5nlf6sp3js3qka93h7dafpvap7fgfrd';
      expect(() => ScriptFactory.buildScriptTemplateOut(address, undefined, 100n)).toThrow("group data");
      expect(() => ScriptFactory.buildScriptTemplateOut(address, "nexatest:tpzm4zwghn3mus4c3tvq7ewfncrad5u4g8zad30stmapu39knqqqq9xdy9pg2")).toThrow("group data");
      expect(() => ScriptFactory.buildScriptTemplateOut(address, address, 100n)).toThrow("Invalid group id address (not a group)");
      expect(() => ScriptFactory.buildScriptTemplateOut(address, 13 as any, 100n)).toThrow("Invalid Argument: groupId");
      expect(() => ScriptFactory.buildScriptTemplateOut(address, "nexatest:tpzm4zwghn3mus4c3tvq7ewfncrad5u4g8zad30stmapu39knqqqq9xdy9pg2", 100 as any)).toThrow("Invalid Argument: groupAmount");
    });

    test('should create p2pkt script from template address', () => {
      let address = 'nexatest:nqtsq5g53zfa3x6tu5nlf6sp3js3qka93h7dafpvap7fgfrd';
      let s = ScriptFactory.buildScriptTemplateOut(address);
      expect(s).toBeDefined();
      expect(s.toString()).toBe('OP_0 OP_1 20 0x8893d89b4be527f4ea018ca1105ba58dfcdea42c');
      expect(s.isPublicKeyTemplateOut()).toBe(true);

      let s2 = ScriptFactory.buildScriptTemplateOut(Address.fromString(address));
      expect(s.equals(s2)).toBe(true);
    });

    test('should create p2pkt script from public key', () => {
      let pubkey = PublicKey.from('022df8750480ad5b26950b25c7ba79d3e37d75f640f8e5d9bcd5b150a0f85014da');
      let s = ScriptFactory.buildScriptTemplateOut(pubkey);
      expect(s).toBeDefined();
      expect(s.toString()).toBe('OP_0 OP_1 20 0x0ef8c2437bbc4e9c33204da957e7035681840ea6');
      expect(s.isPublicKeyTemplateOut()).toBe(true);
    });

    test('should create p2pkt script with group data', () => {
      let address = 'nexatest:nqtsq5g53zfa3x6tu5nlf6sp3js3qka93h7dafpvap7fgfrd';
      let group = 'nexatest:tpzm4zwghn3mus4c3tvq7ewfncrad5u4g8zad30stmapu39knqqqq9xdy9pg2';
      let s = ScriptFactory.buildScriptTemplateOut(address, group, 100n);
      expect(s).toBeDefined();
      expect(s.toString()).toBe('32 0x45ba89c8bce3be42b88ad80f65c99e07d6d39541c5d6c5f05efa1e44b6980000 2 0x6400 OP_1 20 0x8893d89b4be527f4ea018ca1105ba58dfcdea42c');
      expect(s.isPublicKeyTemplateOut()).toBe(true);

      let s2 = ScriptFactory.buildScriptTemplateOut(address, Address.fromString(group), 100n);
      expect(s.equals(s2)).toBe(true);
      let s3 = ScriptFactory.buildScriptTemplateOut(address, Address.fromString(group).data, 100n);
      expect(s.equals(s3)).toBe(true);
      let s4 = ScriptFactory.buildScriptTemplateOut(address, Address.fromString(group).data.toString('hex'), 100n);
      expect(s.equals(s4)).toBe(true);
    });
  });

  describe('#buildDataOut', () => {
    test('should create script from no data', () => {
      let s = ScriptFactory.buildDataOut();
      expect(s).toBeDefined();
      expect(s.toString()).toBe('OP_RETURN');
      expect(s.isDataOut()).toBe(true);
    });
    
    test('should create script from empty data', () => {
      let data =  Buffer.alloc(0);
      let s = ScriptFactory.buildDataOut(data);
      expect(s).toBeDefined();
      expect(s.toString()).toBe('OP_RETURN');
      expect(s.isDataOut()).toBe(true);
    });

    test('should create script from some data', () => {
      let data =  Buffer.from('bacacafe0102030405', 'hex');
      let s = ScriptFactory.buildDataOut(data);
      expect(s).toBeDefined();
      expect(s.toString()).toBe('OP_RETURN 9 0xbacacafe0102030405');
      expect(s.isDataOut()).toBe(true);
    });

    test('should create script from string', () => {
      let data = 'hello world!!!';
      let s = ScriptFactory.buildDataOut(data);
      expect(s).toBeDefined();
      expect(s.toString()).toBe('OP_RETURN 14 0x68656c6c6f20776f726c64212121');
      expect(s.isDataOut()).toBe(true);
    });

    test('should create script from a hex string', () => {
      let hexString = 'abcdef0123456789';
      let s = ScriptFactory.buildDataOut(hexString, 'hex');
      expect(s).toBeDefined();
      expect(s.toString()).toBe('OP_RETURN 8 0xabcdef0123456789');
      expect(s.isDataOut()).toBe(true);
    });

    test('should fail on invalid type', () => {
      expect(() => ScriptFactory.buildDataOut(13 as any)).toThrow("Invalid Argument");
    });
  });

  describe('#buildOutFromAddress', () => {
    test('should create this known p2pkt out script', () => {
      let address = "nexatest:nqtsq5g53zfa3x6tu5nlf6sp3js3qka93h7dafpvap7fgfrd";

      expect(ScriptFactory.buildOutFromAddress(address).toString()).toBe("OP_0 OP_1 20 0x8893d89b4be527f4ea018ca1105ba58dfcdea42c");
      expect(ScriptFactory.buildOutFromAddress(Address.fromString(address)).toString()).toBe("OP_0 OP_1 20 0x8893d89b4be527f4ea018ca1105ba58dfcdea42c");

      let group = "nexa:tr9v70v4s9s6jfwz32ts60zqmmkp50lqv7t0ux620d50xa7dhyqqqcg6kdm6f";
      expect(ScriptFactory.buildOutFromAddress(address, group, 100n).toString()).toBe("32 0xcacf3d958161a925c28a970d3c40deec1a3fe06796fe1b4a7b68f377cdb90000 2 0x6400 OP_1 20 0x8893d89b4be527f4ea018ca1105ba58dfcdea42c");
    });

    test('should create this known p2pkh out script', () => {
      let address = "nexa:qr95sy3j9xwd2ap32xkykttr4cvcu7as4yrtkg2qqa";

      expect(ScriptFactory.buildOutFromAddress(address).toString()).toBe("OP_DUP OP_HASH160 20 0xcb481232299cd5743151ac4b2d63ae198e7bb0a9 OP_EQUALVERIFY OP_CHECKSIG");
      expect(ScriptFactory.buildOutFromAddress(Address.fromString(address)).toString()).toBe("OP_DUP OP_HASH160 20 0xcb481232299cd5743151ac4b2d63ae198e7bb0a9 OP_EQUALVERIFY OP_CHECKSIG");
      
      let group = "nexa:tr9v70v4s9s6jfwz32ts60zqmmkp50lqv7t0ux620d50xa7dhyqqqcg6kdm6f"; // should ignore group data on p2pkh
      expect(ScriptFactory.buildOutFromAddress(address, group, 100n).toString()).toBe("OP_DUP OP_HASH160 20 0xcb481232299cd5743151ac4b2d63ae198e7bb0a9 OP_EQUALVERIFY OP_CHECKSIG");
    });

    test('should fail on group id', () => {
      let address = "nexa:tr9v70v4s9s6jfwz32ts60zqmmkp50lqv7t0ux620d50xa7dhyqqqcg6kdm6f";

      expect(() => ScriptFactory.buildOutFromAddress(address)).toThrow("Invalid address type");
      expect(() => ScriptFactory.buildOutFromAddress(Address.fromString(address))).toThrow("Invalid address type");
    });
  });

  describe('#buildScriptTemplateIn', () => {

    test('should create this known p2pkt script', () => {
      let publicKey = PublicKey.fromString('025b4c28f84e125531d439ac4a03ab3e483fa85d78761aa75b323b566608e676aa');
      let constraint = Script.empty().add(publicKey.toBuffer());
      let signature = Signature.fromString('a0253249a3bf7b8dc377a2a31c0d58973ebe4995f4d494419791773dc1ffa93c7c94bbbd9b7a2c0bc86978087fb3efa7237f338404bd9e1efc316fc46a8d4bf1');
      let satisfier = Script.empty().add(signature.toBuffer());

      let script = ScriptFactory.buildScriptTemplateIn(Opcode.OP_1, constraint, satisfier);
      expect(script.toString()).toBe("34 0x21025b4c28f84e125531d439ac4a03ab3e483fa85d78761aa75b323b566608e676aa 64 0xa0253249a3bf7b8dc377a2a31c0d58973ebe4995f4d494419791773dc1ffa93c7c94bbbd9b7a2c0bc86978087fb3efa7237f338404bd9e1efc316fc46a8d4bf1");
      
      script = ScriptFactory.buildScriptTemplateIn(Opcode.OP_1, constraint, satisfier.toBuffer());
      expect(script.toString()).toBe("34 0x21025b4c28f84e125531d439ac4a03ab3e483fa85d78761aa75b323b566608e676aa 64 0xa0253249a3bf7b8dc377a2a31c0d58973ebe4995f4d494419791773dc1ffa93c7c94bbbd9b7a2c0bc86978087fb3efa7237f338404bd9e1efc316fc46a8d4bf1");
    });
    
    test('should create this known script', () => {
      // hodl vault, mainnet, txidem: b54d56a1126657129e7f126479af1a9659b297b2059c034827f8185b84388bd7
      let template = Script.fromHex('6c756cb1756cad');
      let constraint = Script.fromHex('2103683e3eaff5e4d3ca22a8e2d15451c3af89cee43c6a0b89ae8fdbfa810b52bc98');
      let satisfier = new Script('64 0x6b91229ab013bf986f3c8a0cfe567c4e0e5f02547e85ec44a9a61caec6aa853ca34f9ba2271716f6098f94df8ccbf06db33473c006b3ff0ce716bf012c7f6af2');

      let script = ScriptFactory.buildScriptTemplateIn(template, constraint, satisfier);
      expect(script.toString()).toBe("7 0x6c756cb1756cad 34 0x2103683e3eaff5e4d3ca22a8e2d15451c3af89cee43c6a0b89ae8fdbfa810b52bc98 64 0x6b91229ab013bf986f3c8a0cfe567c4e0e5f02547e85ec44a9a61caec6aa853ca34f9ba2271716f6098f94df8ccbf06db33473c006b3ff0ce716bf012c7f6af2");
      
      script = ScriptFactory.buildScriptTemplateIn(template, constraint, satisfier.toBuffer());
      expect(script.toString()).toBe("7 0x6c756cb1756cad 34 0x2103683e3eaff5e4d3ca22a8e2d15451c3af89cee43c6a0b89ae8fdbfa810b52bc98 64 0x6b91229ab013bf986f3c8a0cfe567c4e0e5f02547e85ec44a9a61caec6aa853ca34f9ba2271716f6098f94df8ccbf06db33473c006b3ff0ce716bf012c7f6af2");
    });

    test('should create this known script with multi push satisfier', () => {
      // agnar faucet new, mainnet, txidem: 135d99fd19160e31604587ae737f9ba580579c4d4df071b26ea9d629f33229c5
      let template = Script.fromHex('6c6c6c6c5479009c63557a7cadc3529d00cd517f7c76010087636d00677f77517f7c76010087636d00677f75816868789d00cd517f7c76010087636d00677f7501207f756852798851cd517f7c76010087636d00677f77517f7c76010087636d00677f7581686800c7517f7c76010087636d00677f77517f7c76010087636d00677f758168687b949d51cd517f7c76010087636d00677f7501207f75688852cc51c67b949d7567547a519d547a7cad6d7568');
      let constraint = Script.fromHex('21023c9eeb9287b401019870b53cfd2cd789136704ae3122b5bcdc7d50a07173786603a0860120a535ef8ceae8135121ad7bc70712e02d56d8c2a3964877f5cc5dbdf16f390000026606');
      let satisfier = new Script('64 0x050aa3761bf2df8ff857fac8cc62d4f6f0b473ea3f79997011fc88e0ece81e5aa688ac3bc410bdbd724ca9f9d0fabf1c466f89ebd04514c5f62d454ce9948d7a OP_0');
            
      let script = ScriptFactory.buildScriptTemplateIn(template, constraint, satisfier);
      expect(script.toString()).toBe("OP_PUSHDATA1 178 0x6c6c6c6c5479009c63557a7cadc3529d00cd517f7c76010087636d00677f77517f7c76010087636d00677f75816868789d00cd517f7c76010087636d00677f7501207f756852798851cd517f7c76010087636d00677f77517f7c76010087636d00677f7581686800c7517f7c76010087636d00677f77517f7c76010087636d00677f758168687b949d51cd517f7c76010087636d00677f7501207f75688852cc51c67b949d7567547a519d547a7cad6d7568 74 0x21023c9eeb9287b401019870b53cfd2cd789136704ae3122b5bcdc7d50a07173786603a0860120a535ef8ceae8135121ad7bc70712e02d56d8c2a3964877f5cc5dbdf16f390000026606 64 0x050aa3761bf2df8ff857fac8cc62d4f6f0b473ea3f79997011fc88e0ece81e5aa688ac3bc410bdbd724ca9f9d0fabf1c466f89ebd04514c5f62d454ce9948d7a OP_0");
      
      script = ScriptFactory.buildScriptTemplateIn(template, constraint, satisfier.toBuffer());
      expect(script.toString()).toBe("OP_PUSHDATA1 178 0x6c6c6c6c5479009c63557a7cadc3529d00cd517f7c76010087636d00677f77517f7c76010087636d00677f75816868789d00cd517f7c76010087636d00677f7501207f756852798851cd517f7c76010087636d00677f77517f7c76010087636d00677f7581686800c7517f7c76010087636d00677f77517f7c76010087636d00677f758168687b949d51cd517f7c76010087636d00677f7501207f75688852cc51c67b949d7567547a519d547a7cad6d7568 74 0x21023c9eeb9287b401019870b53cfd2cd789136704ae3122b5bcdc7d50a07173786603a0860120a535ef8ceae8135121ad7bc70712e02d56d8c2a3964877f5cc5dbdf16f390000026606 64 0x050aa3761bf2df8ff857fac8cc62d4f6f0b473ea3f79997011fc88e0ece81e5aa688ac3bc410bdbd724ca9f9d0fabf1c466f89ebd04514c5f62d454ce9948d7a OP_0");
    });

    test('should create this known script with empty satisfier', () => {
      // agnar faucet old, mainnet, txidem: 135d99fd19160e31604587ae737f9ba580579c4d4df071b26ea9d629f33229c5
      let template = Script.fromHex('6c6c6cc3529d00cd517f7c76010087636d00677f77517f7c76010087636d00677f75816868789d00cd517f7c76010087636d00677f7501207f756852798851cd517f7c76010087636d00677f77517f7c76010087636d00677f7581686800c7517f7c76010087636d00677f77517f7c76010087636d00677f758168687b949d51cd517f7c76010087636d00677f7501207f75688852cc51c67b949d');
      let constraint = Script.fromHex('03a0860120a535ef8ceae8135121ad7bc70712e02d56d8c2a3964877f5cc5dbdf16f390000026606');
      let satisfier = Script.empty();
            
      let script = ScriptFactory.buildScriptTemplateIn(template, constraint, satisfier);
      expect(script.toString()).toBe("OP_PUSHDATA1 155 0x6c6c6cc3529d00cd517f7c76010087636d00677f77517f7c76010087636d00677f75816868789d00cd517f7c76010087636d00677f7501207f756852798851cd517f7c76010087636d00677f77517f7c76010087636d00677f7581686800c7517f7c76010087636d00677f77517f7c76010087636d00677f758168687b949d51cd517f7c76010087636d00677f7501207f75688852cc51c67b949d 40 0x03a0860120a535ef8ceae8135121ad7bc70712e02d56d8c2a3964877f5cc5dbdf16f390000026606");
      
      script = ScriptFactory.buildScriptTemplateIn(template, constraint, satisfier.toBuffer());
      expect(script.toString()).toBe("OP_PUSHDATA1 155 0x6c6c6cc3529d00cd517f7c76010087636d00677f77517f7c76010087636d00677f75816868789d00cd517f7c76010087636d00677f7501207f756852798851cd517f7c76010087636d00677f77517f7c76010087636d00677f7581686800c7517f7c76010087636d00677f77517f7c76010087636d00677f758168687b949d51cd517f7c76010087636d00677f7501207f75688852cc51c67b949d 40 0x03a0860120a535ef8ceae8135121ad7bc70712e02d56d8c2a3964877f5cc5dbdf16f390000026606");
    });

    test('should create this script with no constraint', () => {
      let template = Script.fromHex('6c756cb1756cad');
      let constraint = Opcode.OP_FALSE;
      let satisfier = new Script('64 0x6b91229ab013bf986f3c8a0cfe567c4e0e5f02547e85ec44a9a61caec6aa853ca34f9ba2271716f6098f94df8ccbf06db33473c006b3ff0ce716bf012c7f6af2');
            
      let script = ScriptFactory.buildScriptTemplateIn(template, constraint, satisfier);
      expect(script.toString()).toBe("7 0x6c756cb1756cad 64 0x6b91229ab013bf986f3c8a0cfe567c4e0e5f02547e85ec44a9a61caec6aa853ca34f9ba2271716f6098f94df8ccbf06db33473c006b3ff0ce716bf012c7f6af2");
      
      script = ScriptFactory.buildScriptTemplateIn(template, constraint, satisfier.toBuffer());
      expect(script.toString()).toBe("7 0x6c756cb1756cad 64 0x6b91229ab013bf986f3c8a0cfe567c4e0e5f02547e85ec44a9a61caec6aa853ca34f9ba2271716f6098f94df8ccbf06db33473c006b3ff0ce716bf012c7f6af2");
    });

    test('should fail on invalid arguments', () => {
      expect(() => ScriptFactory.buildScriptTemplateIn(13 as any, Opcode.OP_FALSE, Script.empty())).toThrow("Invalid Argument: template");
      expect(() => ScriptFactory.buildScriptTemplateIn(Script.fromHex('6c756cb1756cad'), Opcode.OP_10, Script.empty())).toThrow("Invalid Argument: constraint");
      expect(() => ScriptFactory.buildScriptTemplateIn(Script.fromHex('6c756cb1756cad'), Opcode.OP_FALSE, 13 as any)).toThrow("Invalid Argument: satisfier");

      expect(() => ScriptFactory.buildScriptTemplateIn(undefined as any, Opcode.OP_FALSE, Script.empty())).toThrow("Invalid Argument: template");
      expect(() => ScriptFactory.buildScriptTemplateIn(Script.fromHex('6c756cb1756cad'), undefined as any, Script.empty())).toThrow("Invalid Argument: constraint");
      expect(() => ScriptFactory.buildScriptTemplateIn(Script.fromHex('6c756cb1756cad'), Opcode.OP_FALSE, undefined as any)).toThrow("Invalid Argument: satisfier");
    });
  });

  describe('#buildPublicKeyHashOut', () => {
    test('should create script from livenet address', () => {
      let address = 'nexa:qpm2qsznhks23z7629mms6s4cwef74vcwvgpsey0xy';
      let s = ScriptFactory.buildPublicKeyHashOut(address);
      expect(s).toBeDefined();
      expect(s.toString()).toBe('OP_DUP OP_HASH160 20 0x76a04053bda0a88bda5177b86a15c3b29f559873 OP_EQUALVERIFY OP_CHECKSIG');
      expect(s.isPublicKeyHashOut()).toBe(true);
    });

    test('should create script from testnet address', () => {
      let address = Address.fromString('nexatest:qr95sy3j9xwd2ap32xkykttr4cvcu7as4ydqu8vpjn');
      let s = ScriptFactory.buildPublicKeyHashOut(address);
      expect(s).toBeDefined();
      expect(s.toString()).toBe('OP_DUP OP_HASH160 20 0xcb481232299cd5743151ac4b2d63ae198e7bb0a9 OP_EQUALVERIFY OP_CHECKSIG');
      expect(s.isPublicKeyHashOut()).toBe(true);
    });

    test('should create script from public key', () => {
      let pubkey = PublicKey.from('022df8750480ad5b26950b25c7ba79d3e37d75f640f8e5d9bcd5b150a0f85014da');
      let s = ScriptFactory.buildPublicKeyHashOut(pubkey);
      expect(s).toBeDefined();
      expect(s.toString()).toBe('OP_DUP OP_HASH160 20 0x9674af7395592ec5d91573aa8d6557de55f60147 OP_EQUALVERIFY OP_CHECKSIG');
      expect(s.isPublicKeyHashOut()).toBe(true);
    });
  });

  describe('#buildPublicKeyHashIn', () => {
    let publicKey = PublicKey.fromString('02916e260371aee45c4b9de1fb1e0cac6b51f049126dda63e80221a212db87e678');
    let signature = Signature.fromString('046fa2f97d628bcfd5476c3d4b0440341fd537ca5680d975a577d578d4c29d350631709e336719db5464db3d12c84c6c953891821edb757abf4f288781dddbb4');
    
    test('should create this known script', () => {
      let script = ScriptFactory.buildPublicKeyHashIn(publicKey, signature);
      expect(script.toString()).toBe("64 0x046fa2f97d628bcfd5476c3d4b0440341fd537ca5680d975a577d578d4c29d350631709e336719db5464db3d12c84c6c953891821edb757abf4f288781dddbb4 33 0x02916e260371aee45c4b9de1fb1e0cac6b51f049126dda63e80221a212db87e678");
      
      script = ScriptFactory.buildPublicKeyHashIn(publicKey, signature.toBuffer());
      expect(script.toString()).toBe("64 0x046fa2f97d628bcfd5476c3d4b0440341fd537ca5680d975a577d578d4c29d350631709e336719db5464db3d12c84c6c953891821edb757abf4f288781dddbb4 33 0x02916e260371aee45c4b9de1fb1e0cac6b51f049126dda63e80221a212db87e678");
    });

    test('should fail on invalid arguments', () => {
      expect(() => ScriptFactory.buildPublicKeyHashIn(13 as any, signature)).toThrow("Invalid Argument");
      expect(() => ScriptFactory.buildPublicKeyHashIn(publicKey, 13 as any)).toThrow("Invalid Argument");
    });
  });

  describe('#buildTokenDescriptionLegacy', () => {
    test("should fail on invalid params", () => {
      expect(() => ScriptFactory.buildTokenDescriptionLegacy("", "", "", "", 0)).toThrow("Ticker must be between 1-8 chars");
      expect(() => ScriptFactory.buildTokenDescriptionLegacy("a".repeat(10), "", "", "", 0)).toThrow("Ticker must be between 1-8 chars");
      expect(() => ScriptFactory.buildTokenDescriptionLegacy("anc", "", "", "", 0)).toThrow("Name is missing");
      expect(() => ScriptFactory.buildTokenDescriptionLegacy("anc", "abc", "abc", "")).toThrow("Invalid URL");
      expect(() => ScriptFactory.buildTokenDescriptionLegacy("anc", "abc", "https://google.com/", "", 0)).toThrow("You must include document hash if you set document url");
      expect(() => ScriptFactory.buildTokenDescriptionLegacy("anc", "abc", "https://google.com/", "anc", -1)).toThrow("decimals must be between 0 and 18");
      expect(() => ScriptFactory.buildTokenDescriptionLegacy("anc", "abc", "https://google.com/", "anc", 19)).toThrow("decimals must be between 0 and 18");
    });

    test("should create this known desc", () => {
      let s = ScriptFactory.buildTokenDescriptionLegacy("LOG", "Martin Inu", undefined, undefined, 18);
      expect(s.toHex()).toBe("6a0438564c05034c4f470a4d617274696e20496e7500000112");

      s = ScriptFactory.buildTokenDescriptionLegacy("ZZZ", "ZZZ", undefined, undefined, 8);
      expect(s.toHex()).toBe("6a0438564c05035a5a5a035a5a5a000058");

      s = ScriptFactory.buildTokenDescriptionLegacy("SMT", "SomeTest", "https://niftyart.cash/td/nifty.json", "b0fa910a48c81cd09b414850ebec6ba040bf3f8b9e0cc39cfd13e03a02be4a0b", 8);
      expect(s.toHex()).toBe("6a0438564c0503534d5408536f6d65546573742368747470733a2f2f6e696674796172742e636173682f74642f6e696674792e6a736f6e200b4abe023ae013fd9cc30c9e8b3fbf40a06beceb5048419bd01cc8480a91fab058");
    });
    
  });

  describe('#buildTokenDescription', () => {
    test("should fail on invalid params", () => {
      expect(() => ScriptFactory.buildTokenDescription("", "", "", "", 0)).toThrow("Ticker must be 2-8 chars");
      expect(() => ScriptFactory.buildTokenDescription("a".repeat(10), "", "", "", 0)).toThrow("Ticker must be 2-8 chars");
      expect(() => ScriptFactory.buildTokenDescription("anc", "", "", "", 0)).toThrow("Name must be 2-25 chars");
      expect(() => ScriptFactory.buildTokenDescription("anc", "b".repeat(26), "", "", 0)).toThrow("Name must be 2-25 chars");
      expect(() => ScriptFactory.buildTokenDescription("anc", "abc", "", "", 0)).toThrow("Zip URL is missing");
      expect(() => ScriptFactory.buildTokenDescription("anc", "abc", "abc", "", 0)).toThrow("Zip hash is missing");
      expect(() => ScriptFactory.buildTokenDescription("anc", "abc", "abc", "anc", "a" as any)).toThrow("Decimals must be a number 0-18");
      expect(() => ScriptFactory.buildTokenDescription("anc", "abc", "abc", "anc", -1)).toThrow("Decimals must be a number 0-18");
      expect(() => ScriptFactory.buildTokenDescription("anc", "abc", "abc", "anc", 19)).toThrow("Decimals must be a number 0-18");
      expect(() => ScriptFactory.buildTokenDescription("anc", "abc", "abc", "anc", 0)).toThrow("Invalid URL");
    });

    test("should create this known desc", () => {
      let s = ScriptFactory.buildTokenDescription("NUSD", "Native USD", "https://natives.cash/api/stables/nusd/getTokenInfo", "14e6cb42fef84ddb9b67f7e8e21082007456764f44ef7745f94e5a0dcb060194", 6);
      expect(s.toHex()).toBe("6a043a564c05044e5553440a4e6174697665205553443268747470733a2f2f6e6174697665732e636173682f6170692f737461626c65732f6e7573642f676574546f6b656e496e666f20940106cb0d5a4ef94577ef444f765674008210e2e8f7679bdb4df8fe42cbe61456");

      s = ScriptFactory.buildTokenDescription("NUSD", "Native USD", "https://natives.cash/api/stables/nusd/getTokenInfo", "14e6cb42fef84ddb9b67f7e8e21082007456764f44ef7745f94e5a0dcb060194", 18);
      expect(s.toHex()).toBe("6a043a564c05044e5553440a4e6174697665205553443268747470733a2f2f6e6174697665732e636173682f6170692f737461626c65732f6e7573642f676574546f6b656e496e666f20940106cb0d5a4ef94577ef444f765674008210e2e8f7679bdb4df8fe42cbe6140112");
    });
  });

  describe('#buildNFTCollectionDescription', () => {
    test("should fail on invalid params", () => {
      expect(() => ScriptFactory.buildNFTCollectionDescription("", "", "", "")).toThrow("Ticker must be 2-8 chars");
      expect(() => ScriptFactory.buildNFTCollectionDescription("a".repeat(10), "", "", "")).toThrow("Ticker must be 2-8 chars");
      expect(() => ScriptFactory.buildNFTCollectionDescription("anc", "", "", "")).toThrow("Name must be 2-25 chars");
      expect(() => ScriptFactory.buildNFTCollectionDescription("anc", "b".repeat(26), "", "")).toThrow("Name must be 2-25 chars");
      expect(() => ScriptFactory.buildNFTCollectionDescription("anc", "abc", "", "")).toThrow("Zip URL is missing");
      expect(() => ScriptFactory.buildNFTCollectionDescription("anc", "abc", "abc", "")).toThrow("Zip hash is missing");
      expect(() => ScriptFactory.buildNFTCollectionDescription("anc", "abc", "abc", "anc")).toThrow("Invalid URL");
    });

    test("should create this known desc", () => {
      let s = ScriptFactory.buildNFTCollectionDescription("LDC", "Legendary Duelist Cards", "https://ipfs.io/ipfs/bafkvmiblm2dd4me5yr6v5f2ywxvexmxfvgrlc6yq5sedmgdtnu5xnnffce", "2b66863e309dc47d5e9758b5ea4bb2e5a9a2b17b10ec883618736d3b76b4a511");
      expect(s.toHex()).toBe("6a043b564c05034c4443174c6567656e64617279204475656c6973742043617264734c5068747470733a2f2f697066732e696f2f697066732f6261666b766d69626c6d326464346d6535797236763566327977787665786d78667667726c63367971357365646d6764746e7535786e6e666663652011a5b4763b6d73183688ec107bb1a2a9e5b24beab558975e7dc49d303e86662b00");
    });
  });

  describe('#buildNFTDescription', () => {
    test("should fail on invalid params", () => {
      expect(() => ScriptFactory.buildNFTDescription("", "")).toThrow("Zip URL is missing");
      expect(() => ScriptFactory.buildNFTDescription("url", "")).toThrow("Zip hash is missing");
      expect(() => ScriptFactory.buildNFTDescription("url", "0000")).toThrow("Invalid URL");
    });

    test("should create this known desc", () => {
      let s = ScriptFactory.buildNFTDescription("https://ipfs.io/ipfs/bafyfmieoiknc6wnfcn6vvdand636bdpomforeypq5afvqbbrgjl3hrlctq", "3cacb9a4e71067df9ccb43bc0126c5ea48bc85101491592958bdebb1da057767");
      expect(s.toHex()).toBe("6a043c564c054c5068747470733a2f2f697066732e696f2f697066732f62616679666d69656f696b6e6336776e66636e36767664616e643633366264706f6d666f72657970713561667671626272676a6c3368726c63747120677705dab1ebbd58295991141085bc48eac52601bc43cb9cdf6710e7a4b9ac3c");
    });
  });
});