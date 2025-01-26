import { describe, expect, test, vi } from "vitest";
import Schnorr from "../../src/crypto/schnorr";
import { Hash, PrivateKey, PublicKey } from "../../src";
import BN from "../../src/crypto/bn.extension";
import Signature from "../../src/crypto/signature";

// Test Vectors used from
// https://github.com/sipa/bips/blob/bip-schnorr/bip-schnorr/test-vectors.csv

describe("#Schnorr", () => {
  test('instantiation', () => {
    let schnorr = new Schnorr();
    expect(schnorr).toBeDefined();

    let schnorr2 = new Schnorr({ verified: false });
    expect(schnorr2).toBeDefined();
  });

  let schnorr = new Schnorr();

  test("Sign/Verify bitcoin-abc-test-spec", () => {
    schnorr.hashbuf = Hash.sha256((Buffer.from('Very deterministic message', 'utf-8')));
    schnorr.endian = 'big';
    schnorr.privkey = PrivateKey.from(Buffer.from('12b004fff7f4b69ef8650e767f18f11ede158148b425660723b9f9a66e61f747', 'hex'), 'mainnet');
    schnorr.privkey2pubkey();
    schnorr.sign();
    expect(schnorr.verify().verified).true
    expect(schnorr.toPublicKey().toString()).toBe(schnorr.pubkey.toString());
  });

  test("Sign Schnorr padding", () => {
    schnorr.hashbuf = Hash.sha256((Buffer.from('Very deterministic messageg6', 'utf-8')));
    schnorr.endian = undefined;
    schnorr.privkey = PrivateKey.from(Buffer.from('12b004fff7f4b69ef8650e767f18f11ede158148b425660723b9f9a66e61f747', 'hex'), 'mainnet');
    schnorr.privkey2pubkey();
    schnorr.sign();
    expect(schnorr.verify().verified).true
    let x = new Signature(schnorr.sig!);
    let str = x.toBuffer().toString('hex');
    expect(str).toBe("005e7ab0906a0164306975916350214a69fb80210cf7e37533f197c3d18b23d1b794262dc663d9e99605784b14ee1ecfca27b602e88dbc87af85f9907c214ea3");
  });

  // Following Test Vectors used from
  // https://github.com/sipa/bips/blob/bip-schnorr/bip-schnorr/test-vectors.csv

  test('Sign/Verify Test 2', () => {
    let hashbuf = (new BN(0)).toBuffer({ size: 32 });
    let privbn = new BN(1);

    let privkey = PrivateKey.from(privbn);

    let schnorrSig = new Schnorr({
      hashbuf: hashbuf,
      endian: "big",
      privkey: privkey
    });
    schnorrSig.sign();

    let verified = schnorrSig.verify().verified;
    expect(verified).true;
  });

  test("Sign/Verify 3", () => {
    schnorr.hashbuf = Buffer.from('243F6A8885A308D313198A2E03707344A4093822299F31D0082EFA98EC4E6C89', 'hex');
    schnorr.endian = 'big';
    schnorr.privkey = PrivateKey.from(Buffer.from('B7E151628AED2A6ABF7158809CF4F3C762E7160F38B4DA56A784D9045190CFEF', 'hex'), 'mainnet');
    schnorr.privkey2pubkey();
    schnorr.sign();
    expect(schnorr.verify().verified).true
  });

  test("Sign/Verify Test 4", () => {
    let schnorr = new Schnorr();
    schnorr.hashbuf = Buffer.from('5E2D58D8B3BCDF1ABADEC7829054F90DDA9805AAB56C77333024B9D0A508B75C', 'hex');
    schnorr.endian = 'big';
    schnorr.privkey = PrivateKey.from(Buffer.from('C90FDAA22168C234C4C6628B80DC1CD129024E088A67CC74020BBEA63B14E5C9', 'hex'), 'mainnet');
    schnorr.privkey2pubkey();
    schnorr.sign();
    expect(schnorr.verify().verified).true
  });

  test('Verify Test 5', () => {
    schnorr.hashbuf = Buffer.from('FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF', 'hex');
    schnorr.endian = 'big';
    schnorr.privkey = PrivateKey.from(Buffer.from('0B432B2677937381AEF05BB02A66ECD012773062CF3FA2549E44F58ED2401710', 'hex'), 'livenet');
    schnorr.privkey2pubkey();
    schnorr.sign();
    expect(schnorr.verify().verified).true
  });

  test("Verify Test 6 should fail", () => {
    schnorr.hashbuf = Buffer.from('4DF3C3F68FCC83B27E9D42C90431A72499F17875C81A599B566C9889B9696703', 'hex');
    schnorr.endian = 'big';
    schnorr.pubkey = PublicKey.from("02D69C3509BB99E412E68B0FE8544E72837DFA30746D8BE2AA65975F29D22DC7B9", true);
    schnorr.sig = Signature.fromString("00000000000000000000003B78CE563F89A0ED9414F5AA28AD0D96D6795F9C63EE374AC7FAE927D334CCB190F6FB8FD27A2DDC639CCEE46D43F113A4035A2C7F");
    expect(schnorr.verify().verified).false
  });

  test("Verify Test should pass from scripts_test", () => {
    // schnorr.hashbuf = Buffer.from('f4a222b692e7f86c299f878c4b981242238f49b467b8d990219fbf5cfc0838cd', 'hex');
    schnorr.hashbuf = Buffer.from('cd3808fc5cbf9f2190d9b867b4498f234212984b8c879f296cf8e792b622a2f4', 'hex');
    schnorr.endian = 'big';
    schnorr.pubkey = PublicKey.from("0479be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798483ada7726a3c4655da4fbfc0e1108a8fd17b448a68554199c47d08ffb10d4b8", false);
    schnorr.sig = Signature.fromString("0df4be7f5fe74b2855b92082720e889038e15d8d747334fa3f300ef4ab1db1eea56aa83d1d60809ff6703791736be87cfb6cbc5c4036aeed3b4ea4e6dab35090");
    expect(schnorr.verify().verified).true
  });

  test("Verify Test 7, public key not on the curve", () => {
    expect(() => {
      return PublicKey.from("02EEFDEA4CDB677750A420FEE807EACF21EB9898AE79B9768766E4FAA04A2D4A34");
    }).toThrow("Invalid X");
  });


  test("Verify Test 8, has_square_y(R) is false", () => {
    schnorr.hashbuf = Buffer.from('243F6A8885A308D313198A2E03707344A4093822299F31D0082EFA98EC4E6C89', 'hex');
    schnorr.endian = 'big';
    schnorr.pubkey = PublicKey.from("02DFF1D77F2A671C5F36183726DB2341BE58FEAE1DA2DECED843240F7B502BA659", true);
    schnorr.sig = Signature.fromString("F9308A019258C31049344F85F89D5229B531C845836F99B08601F113BCE036F9935554D1AA5F0374E5CDAACB3925035C7C169B27C4426DF0A6B19AF3BAEAB138");
    expect(schnorr.verify().verified).false
  });

  test("Verify Test 9, negated message", () => {
    schnorr.hashbuf = Buffer.from('243F6A8885A308D313198A2E03707344A4093822299F31D0082EFA98EC4E6C89', 'hex');
    schnorr.endian = 'big';
    schnorr.pubkey = PublicKey.from("02DFF1D77F2A671C5F36183726DB2341BE58FEAE1DA2DECED843240F7B502BA659", true);
    schnorr.sig = Signature.fromString("10AC49A6A2EBF604189C5F40FC75AF2D42D77DE9A2782709B1EB4EAF1CFE9108D7003B703A3499D5E29529D39BA040A44955127140F81A8A89A96F992AC0FE79");
    expect(schnorr.verify().verified).false
  });

  test("Verify Test 10, sG - eP is infinite. Test fails in single verification if has_square_y(inf) is defined as true and x(inf) as 0", () => {
    schnorr.hashbuf = Buffer.from('243F6A8885A308D313198A2E03707344A4093822299F31D0082EFA98EC4E6C89', 'hex');
    schnorr.endian = 'big';
    schnorr.pubkey = PublicKey.from("02DFF1D77F2A671C5F36183726DB2341BE58FEAE1DA2DECED843240F7B502BA659", true);
    schnorr.sig = Signature.fromString("000000000000000000000000000000000000000000000000000000000000000099D2F0EBC2996808208633CD9926BF7EC3DAB73DAAD36E85B3040A698E6D1CE0");
    expect(schnorr.verify().verified).false
  });

  test("Verify Test 11, sig[0:32] is not an X coordinate on the curve", () => {
    schnorr.hashbuf = Buffer.from('243F6A8885A308D313198A2E03707344A4093822299F31D0082EFA98EC4E6C89', 'hex');
    schnorr.endian = 'big';
    schnorr.pubkey = PublicKey.from("02DFF1D77F2A671C5F36183726DB2341BE58FEAE1DA2DECED843240F7B502BA659", true);
    schnorr.sig = Signature.fromString("4A298DACAE57395A15D0795DDBFD1DCB564DA82B0F269BC70A74F8220429BA1D4160BCFC3F466ECB8FACD19ADE57D8699D74E7207D78C6AEDC3799B52A8E0598");
    expect(schnorr.verify().verified).false
  });

  test("Verify Test 12, sig[0:32] is equal to field size", () => {
    schnorr.hashbuf = Buffer.from('243F6A8885A308D313198A2E03707344A4093822299F31D0082EFA98EC4E6C89', 'hex');
    schnorr.endian = 'big';
    schnorr.pubkey = PublicKey.from("02DFF1D77F2A671C5F36183726DB2341BE58FEAE1DA2DECED843240F7B502BA659", true);
    schnorr.sig = Signature.fromString("FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEFFFFFC2F4160BCFC3F466ECB8FACD19ADE57D8699D74E7207D78C6AEDC3799B52A8E0598");
    expect(schnorr.verify().verified).false
  });

  test("Verify Test 13, sig[32:64] is equal to curve order", () => {
    schnorr.hashbuf = Buffer.from('243F6A8885A308D313198A2E03707344A4093822299F31D0082EFA98EC4E6C89', 'hex');
    schnorr.endian = 'big';
    schnorr.pubkey = PublicKey.from("02DFF1D77F2A671C5F36183726DB2341BE58FEAE1DA2DECED843240F7B502BA659", true);
    schnorr.sig = Signature.fromString("667C2F778E0616E611BD0C14B8A600C5884551701A949EF0EBFD72D452D64E84FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141");
    expect(schnorr.verify().verified).false
  });

  test("Verify Test 14, public key is not a valid X coordinate because it exceeds the field size", () => {
    schnorr.hashbuf = Buffer.from('243F6A8885A308D313198A2E03707344A4093822299F31D0082EFA98EC4E6C89', 'hex');
    schnorr.endian = 'big';
    schnorr.pubkey = PublicKey.from("02FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEFFFFFC30", true);
    schnorr.sig = Signature.fromString("667C2F778E0616E611BD0C14B8A600C5884551701A949EF0EBFD72D452D64E844160BCFC3F466ECB8FACD19ADE57D8699D74E7207D78C6AEDC3799B52A8E0598");
    expect(schnorr.verify().verified).false
  });

  test("Schnorr nonceFunctionRFC6979", () => {
    let privkey = [247, 229, 95, 194, 90, 177, 180, 124, 16, 212, 194, 1, 4, 84, 217, 63, 135, 141, 214, 161, 83, 44, 149, 178, 196, 172, 199, 160, 224, 226, 3, 171]
    let msgbuf = [203, 64, 126, 5, 128, 46, 163, 26, 233, 17, 17, 84, 85, 232, 237, 114, 254, 233, 21, 23, 122, 3, 27, 106, 32, 178, 75, 75, 119, 76, 13, 176]
    let k = schnorr.nonceFunctionRFC6979(Buffer.from(privkey), Buffer.from(msgbuf));
    expect(k.toString()).toBe('40736259912772382559816990380041422373693363729339996443093592104584195165');
  });

  test('Schnorr Sign/Verify Test X, case previously produced 63 byte signature', () => {
    let hashbuf = Buffer.from('a330930ce36be70a744d057dd2a2d0c55a8418ee706e662fcb8d4ab5ef845e03', 'hex');
    let privbn = Buffer.from('ef209804744733771a07eac71d2288db0b3030c91fa49382037fb8a5aad0f1ca', 'hex');
    let privkey = PrivateKey.from(privbn);
    let schnorrSig = new Schnorr({
      hashbuf: hashbuf,
      endian: 'little',
      privkey: privkey
    });
    schnorrSig.sign();
    let verified = schnorrSig.verify().verified;
    expect(verified).true;

    let staticSig = Schnorr.sign(hashbuf, privkey, 'little');
    expect(staticSig).toEqual(schnorrSig.sig);

    let staticVerify = Schnorr.verify(hashbuf, staticSig, privkey.publicKey, 'little');
    expect(staticVerify).toBe(schnorrSig.verified);
  });

  describe('Schnorr.sigError', () => { 
    test('should return an error if hashbuf is not a buffer', () => {
      let schnorr = new Schnorr();
      schnorr.hashbuf = null as any; // Simulate an invalid hashbuf
      expect(schnorr.sigError()).toBe('hashbuf must be a 32 byte buffer');
    });
  
    test('should return an error if hashbuf length is not 32', () => {
      let schnorr = new Schnorr();
      schnorr.hashbuf = Buffer.alloc(31); // Invalid length
      expect(schnorr.sigError()).toBe('hashbuf must be a 32 byte buffer');
    });

    test('should return an error if signature length is not 64 or 65 bytes', () => {
      let schnorr = new Schnorr();
      schnorr.hashbuf = Buffer.alloc(32); // Valid hashbuf
  
      // Mock `sig` with invalid lengths
      schnorr.sig = {
        r: new BN(123), // Example value
        s: new BN(456), // Example value
      } as Signature;

      // Mock Schnorr.getProperSizeBuffer to return invalid lengths
      vi.spyOn(Schnorr as any, 'getProperSizeBuffer')
      .mockImplementationOnce(() => Buffer.alloc(32)) // Mock r
      .mockImplementationOnce(() => Buffer.alloc(31)); // Mock s

      expect(schnorr.sigError()).toBe('signature must be a 64 byte or 65 byte array');
    });
  });

});