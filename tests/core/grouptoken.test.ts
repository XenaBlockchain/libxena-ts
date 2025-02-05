import { describe, expect, test } from "vitest";
import GroupToken, { GroupIdFlag } from "../../src/core/grouptoken";
import { Address, AddressType, PrivateKey, Script } from "../../src";

describe("GroupToken", () => {

  test("should find correct group id data", () => {
    // NUSD mainnet
    let outpoint = "52f8eff19195105ea7595c6ad201a611ab93721e7aa687c0189f17db6a4d251f";
    let opreturn = Script.fromHex("6a043a564c05044e5553440a4e6174697665205553443268747470733a2f2f6e6174697665732e636173682f6170692f737461626c65732f6e7573642f676574546f6b656e496e666f20940106cb0d5a4ef94577ef444f765674008210e2e8f7679bdb4df8fe42cbe61456");
    let id = GroupToken.findGroupId(outpoint, opreturn, GroupToken.authFlags.ACTIVE_FLAG_BITS);

    expect(id.hashBuffer.toString('hex')).toBe('f65163b2b95efebd4b3a760b7dc52f13fc330dd766be2ca7ec0c937c151e0000');
    expect(GroupToken.authFlags.ACTIVE_FLAG_BITS | id.nonce).toBe(18158513697558016911n);
    expect(GroupToken.isGroupCreation(id.hashBuffer, 18158513697558016911n)).toBe(true);
    expect(new Address(id.hashBuffer, 'mainnet', AddressType.GroupIdAddress).toString()).toBe("nexa:trm9zcajh900a02t8fmqklw99uflcvcd6antut98asxfxlq4rcqqqdw80lls5")
    expect(GroupToken.hasIdFlag(id.hashBuffer, GroupIdFlag.DEFAULT)).toBe(true);
    expect(GroupToken.hasIdFlag(id.hashBuffer, GroupIdFlag.NONE)).toBe(true);
    expect(GroupToken.hasIdFlag(id.hashBuffer, GroupIdFlag.COVENANT)).toBe(false);
    expect(GroupToken.hasIdFlag(id.hashBuffer, GroupIdFlag.HOLDS_NEX)).toBe(false);
  });

  test("should not have idFlag in not in size of group id buffer", () => {
    expect(GroupToken.hasIdFlag(Buffer.alloc(30), GroupIdFlag.DEFAULT)).toBe(false);
  });

  describe("#generateSubgroupId/#isSubgroup", () => {
    let group = "nexa:trm9zcajh900a02t8fmqklw99uflcvcd6antut98asxfxlq4rcqqqdw80lls5";

    test("should identify that partent group is not subgroup", () => {
      expect(GroupToken.isSubgroup(group)).toBe(false);
    });

    test("should generate subgroup with number", () => {
      let subgroup = GroupToken.generateSubgroupId(group, 5);
      expect(subgroup.toString('hex')).toBe("f65163b2b95efebd4b3a760b7dc52f13fc330dd766be2ca7ec0c937c151e00000500000000000000");
      expect(GroupToken.isSubgroup(subgroup)).toBe(true);
    });

    test("should generate subgroup with hex", () => {
      let subgroup = GroupToken.generateSubgroupId(group, 'a1b2');
      expect(subgroup.toString('hex')).toBe("f65163b2b95efebd4b3a760b7dc52f13fc330dd766be2ca7ec0c937c151e0000a1b2");
      expect(GroupToken.isSubgroup(subgroup)).toBe(true);
    });

    test("should generate subgroup with buffer", () => {
      let subgroup = GroupToken.generateSubgroupId(group, Buffer.from('a1b2', 'hex'));
      expect(subgroup.toString('hex')).toBe("f65163b2b95efebd4b3a760b7dc52f13fc330dd766be2ca7ec0c937c151e0000a1b2");
      expect(GroupToken.isSubgroup(subgroup)).toBe(true);
    });

    test("should generate subgroup with utf8 string", () => {
      let subgroup = GroupToken.generateSubgroupId(group, "hello");
      expect(subgroup.toString('hex')).toBe("f65163b2b95efebd4b3a760b7dc52f13fc330dd766be2ca7ec0c937c151e000068656c6c6f");
      expect(GroupToken.isSubgroup(subgroup)).toBe(true);
    });

    test("should fail if data is missing", () => {
      expect(() => GroupToken.generateSubgroupId(undefined as any, 3)).toThrow("group is missing");
      expect(() => GroupToken.generateSubgroupId(group, undefined as any)).toThrow("data is missing");
    });
  });

  describe('#getParentGroupId', () => {
    test("should fail if not token id buffer", () => {
      expect(() => GroupToken.getParentGroupId(Buffer.alloc(20))).toThrow("Invalid subgroup");
    });

    let parent = "nexa:tr9v70v4s9s6jfwz32ts60zqmmkp50lqv7t0ux620d50xa7dhyqqqcg6kdm6f";
    let parentHex = "cacf3d958161a925c28a970d3c40deec1a3fe06796fe1b4a7b68f377cdb90000";
    let subgroup = "nexa:tr9v70v4s9s6jfwz32ts60zqmmkp50lqv7t0ux620d50xa7dhyqqp2juz4n4clw63scax5efugg0kgtl0f5rdvvpkmddclrjp8gfpgswkj7kwlhd";
    let subgroupHex = "cacf3d958161a925c28a970d3c40deec1a3fe06796fe1b4a7b68f377cdb90000aa5c15675c7dda8c31d35329e210fb217f7a6836b181b6dadc7c7209d090a20e";

    test("should return the same group if its parent", () => {
      expect(GroupToken.getParentGroupId(parent).toString('hex')).toBe(parentHex);
      expect(GroupToken.getParentGroupId(Address.fromString(parent)).toString('hex')).toBe(parentHex);
      expect(GroupToken.getParentGroupId(Address.fromString(parent).data).toString('hex')).toBe(parentHex);
      expect(GroupToken.getParentGroupId(parentHex).toString('hex')).toBe(parentHex);
    });

    test("should return the parent of the subgroup", () => {
      expect(GroupToken.getParentGroupId(subgroup).toString('hex')).toBe(parentHex);
      expect(GroupToken.getParentGroupId(Address.fromString(subgroup)).toString('hex')).toBe(parentHex);
      expect(GroupToken.getParentGroupId(Address.fromString(subgroup).data).toString('hex')).toBe(parentHex);
      expect(GroupToken.getParentGroupId(subgroupHex).toString('hex')).toBe(parentHex);
    });
  });

  describe('#getAmountBuffer/#getAmountValue', () => {
    test('should handle negative bigint values correctly', () => {
      let buf = GroupToken.getAmountBuffer(-1n);
  
      // Assuming the expected output for negative values as UInt64LE
      // Example: Check if it correctly handles negative BigInt and writes as UInt64LE
      expect(buf.toString('hex')).toBe("ffffffffffffffff"); // Expected buffer for -1 as UInt64LE
      expect(GroupToken.getAmountValue(buf)).toBe(-1n); // signed
      expect(GroupToken.getAmountValue(buf, true)).toBe(18446744073709551615n); // unsigned
    });
  
    test('should handle bigint values less than 0x10000', () => {
      let buf = GroupToken.getAmountBuffer(65535n);
      expect(buf.toString('hex')).toBe("ffff"); // UInt16LE representation of 65535
      expect(GroupToken.getAmountValue(buf)).toBe(65535n);
    });
  
    test('should handle bigint values less than 0x100000000', () => {
      let buf = GroupToken.getAmountBuffer(4294967295n);
      expect(buf.toString('hex')).toBe('ffffffff'); // UInt32LE representation of 4294967295
      expect(GroupToken.getAmountValue(buf)).toBe(4294967295n);
    });
  
    test('should handle bigint values greater than or equal to 0x100000000', () => {
      let buf = GroupToken.getAmountBuffer(18446744073709551615n); // 0xFFFFFFFFFFFFFFFF
      expect(buf.toString('hex')).toBe('ffffffffffffffff'); // UInt64LE representation of 18446744073709551615
      expect(GroupToken.getAmountValue(buf)).toBe(-1n); // signed
      expect(GroupToken.getAmountValue(buf, true)).toBe(18446744073709551615n); // unsigned
    });

    test('should handle this group amount correctly', () => {
      let buf = GroupToken.getAmountBuffer(100n);
      expect(buf.toString('hex')).toBe('6400');
      expect(GroupToken.getAmountValue(buf)).toBe(100n);
    });

    test('should handle this group authority correctly', () => {
      let buf = GroupToken.getAmountBuffer(GroupToken.authFlags.MINT | GroupToken.authFlags.MELT);
      expect(buf.toString('hex')).toBe('0000000000000060');
      expect(GroupToken.getAmountValue(buf)).toBe(6917529027641081856n); // signed should be positive without authority flag
      expect(GroupToken.getAmountValue(buf, true)).toBe(6917529027641081856n); // unsigned

      buf = GroupToken.getAmountBuffer(GroupToken.authFlags.AUTHORITY | GroupToken.authFlags.MINT | GroupToken.authFlags.MELT);
      expect(buf.toString('hex')).toBe('00000000000000e0');
      expect(GroupToken.getAmountValue(buf)).toBe(-2305843009213693952n);
      expect(GroupToken.getAmountValue(buf, true)).toBe(16140901064495857664n);
    });
  });

  describe("Authorities", () => {
    test("should identify that flag is not authority without authority flag", () => {
      expect(GroupToken.isAuthority(123n)).toBe(false);
      expect(GroupToken.isAuthority(GroupToken.authFlags.MINT)).toBe(false);
      expect(GroupToken.isAuthority(GroupToken.authFlags.MELT)).toBe(false);
      expect(GroupToken.isAuthority(GroupToken.authFlags.RESCRIPT)).toBe(false);
      expect(GroupToken.isAuthority(GroupToken.authFlags.BATON)).toBe(false);
      expect(GroupToken.isAuthority(GroupToken.authFlags.SUBGROUP)).toBe(false);
      expect(GroupToken.isAuthority(GroupToken.authFlags.MINT | GroupToken.authFlags.SUBGROUP)).toBe(false);
    });

    test("should identify that flag is not allowing permissions without authority flag", () => {
      expect(GroupToken.allowsMint(GroupToken.authFlags.MINT)).toBe(false);
      expect(GroupToken.allowsMelt(GroupToken.authFlags.MELT)).toBe(false);
      expect(GroupToken.allowsRescript(GroupToken.authFlags.RESCRIPT)).toBe(false);
      expect(GroupToken.allowsRenew(GroupToken.authFlags.BATON)).toBe(false);
      expect(GroupToken.allowsSubgroup(GroupToken.authFlags.SUBGROUP)).toBe(false);
      expect(GroupToken.allowsSubgroup(GroupToken.authFlags.MINT | GroupToken.authFlags.SUBGROUP)).toBe(false);
    });

    test("should identify that authority flag is not allowing permissions without dedicated flags", () => {
      expect(GroupToken.isAuthority(GroupToken.authFlags.AUTHORITY)).toBe(true);
      expect(GroupToken.allowsMint(GroupToken.authFlags.AUTHORITY)).toBe(false);
      expect(GroupToken.allowsMelt(GroupToken.authFlags.AUTHORITY)).toBe(false);
      expect(GroupToken.allowsRescript(GroupToken.authFlags.AUTHORITY)).toBe(false);
      expect(GroupToken.allowsRenew(GroupToken.authFlags.AUTHORITY)).toBe(false);
      expect(GroupToken.allowsSubgroup(GroupToken.authFlags.AUTHORITY)).toBe(false);
    });

    test("should identify that a flag is allowing its own permissions with authority flag", () => {
      expect(GroupToken.isAuthority(GroupToken.authFlags.ACTIVE_FLAG_BITS)).toBe(true);
      expect(GroupToken.allowsMint(GroupToken.authFlags.AUTHORITY | GroupToken.authFlags.MINT)).toBe(true);
      expect(GroupToken.allowsMelt(GroupToken.authFlags.AUTHORITY | GroupToken.authFlags.MELT)).toBe(true);
      expect(GroupToken.allowsRescript(GroupToken.authFlags.AUTHORITY | GroupToken.authFlags.RESCRIPT)).toBe(true);
      expect(GroupToken.allowsRenew(GroupToken.authFlags.AUTHORITY | GroupToken.authFlags.BATON)).toBe(true);
      expect(GroupToken.allowsSubgroup(GroupToken.authFlags.AUTHORITY | GroupToken.authFlags.SUBGROUP)).toBe(true);
      expect(GroupToken.allowsSubgroup(GroupToken.authFlags.AUTHORITY | GroupToken.authFlags.MINT | GroupToken.authFlags.SUBGROUP)).toBe(true);
      expect(GroupToken.allowsMint(GroupToken.authFlags.AUTHORITY | GroupToken.authFlags.MINT | GroupToken.authFlags.SUBGROUP)).toBe(true);
    });
  });

  test("roundtrip sign/verify json doc", () => {
    let privkey = new PrivateKey();
    let doc: any = [{ A: 1, B: 2, C: "abc" }];
    let json = JSON.stringify(doc);
    let sig = GroupToken.signJsonDoc(json, privkey);
    expect(GroupToken.verifyJsonDoc(json, Address.fromPublicKey(privkey.publicKey), sig)).toBe(true);

    // add sig to json and verify, should extract signature from it
    doc[1] = sig;
    json = JSON.stringify(doc);
    expect(GroupToken.verifyJsonDoc(json, Address.fromPublicKey(privkey.publicKey))).toBe(true);
  });
});