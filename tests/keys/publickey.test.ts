import { describe, expect, test } from "vitest";
import PublicKey from "../../src/keys/publickey";
import Point from "../../src/crypto/point";
import { networks } from "../../src/core/network/network-manager";
import BN from "../../src/crypto/bn.extension";
import PrivateKey from "../../src/keys/privatekey";

describe('PublicKey', () => {
  let invalidPoint = '0400000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000';

  describe('validating errors on creation', () => {
    test('errors if data is missing', () => {
      expect(() => new PublicKey(undefined as any)).toThrow('First argument is required, please include public key data.');
      expect(() => PublicKey.from(undefined as any)).toThrow('First argument is an unrecognized data format.');
    });

    test('errors if an invalid point is provided', () => {
      expect(() => new PublicKey(invalidPoint as any)).toThrow('First argument is an unrecognized data format.');
      expect(() => PublicKey.from(invalidPoint)).toThrow('Point does not lie on the curve');
    });

    test('errors if a point not on the secp256k1 curve is provided', () => {
      expect(() => PublicKey.from(Point.ecPoint(1000, 1000))).toThrow('Point does not lie on the curve');
    });

    test('errors if the argument is of an unrecognized type', () => {
      expect(() => new PublicKey(new Error() as any)).toThrow('First argument is an unrecognized data format.');
      expect(() => PublicKey.from(new Error() as any)).toThrow('First argument is an unrecognized data format.');
    });
  });

  describe('instantiation', () => {

    test('from a private key', () => {
      let privhex = '906977a061af29276e40bf377042ffbde414e496ae2260bbf1fa9d085637bfff';
      let pubhex = '02a1633cafcc01ebfb6d78e39f687a1f0995c62fc95f51ead10a02ee0be551b5dc';
      let privkey = PrivateKey.from(new BN(Buffer.from(privhex, 'hex')));
      let pk = PublicKey.from(privkey);
      expect(pk.toString()).toBe(pubhex);
    });

    test('from a compressed public key', () => {
      let publicKeyHex = '031ff0fe0f7b15ffaa85ff9f4744d539139c252a49710fb053bb9f2b933173ff9a';
      let publicKey = PublicKey.from(publicKeyHex);
      expect(publicKey.toString()).toBe(publicKeyHex);
    });

    test('from another publicKey', () => {
      let publicKeyHex = '031ff0fe0f7b15ffaa85ff9f4744d539139c252a49710fb053bb9f2b933173ff9a';
      let publicKey = PublicKey.from(publicKeyHex);
      let publicKey2 = PublicKey.from(publicKey);
      let publicKey3 = new PublicKey(publicKey);
      let publicKey4 = PublicKey.from({ point: publicKey.point, compressed: publicKey.compressed, network: publicKey.network });
      expect(publicKey).toEqual(publicKey2);
      expect(publicKey).toEqual(publicKey3);
      expect(publicKey).toEqual(publicKey4);
    });

    test('sets the network to defaultNetwork if none provided', () => {
      let publicKeyHex = '031ff0fe0f7b15ffaa85ff9f4744d539139c252a49710fb053bb9f2b933173ff9a';
      let publicKey = PublicKey.from(publicKeyHex);
      expect(publicKey.network).toEqual(networks.defaultNetwork);
    });

    test('from a hex encoded DER string', () => {
      let pk = PublicKey.from('041ff0fe0f7b15ffaa85ff9f4744d539139c252a49710fb053bb9f2b933173ff9a7baad41d04514751e6851f5304fd243751703bed21b914f6be218c0fa354a341');
      expect(pk.point).toBeDefined();
      expect(pk.point.getX().toString(16)).toBe('1ff0fe0f7b15ffaa85ff9f4744d539139c252a49710fb053bb9f2b933173ff9a');
    });

    test('from a hex encoded DER buffer', () => {
      let pk = PublicKey.from(Buffer.from('041ff0fe0f7b15ffaa85ff9f4744d539139c252a49710fb053bb9f2b933173ff9a7baad41d04514751e6851f5304fd243751703bed21b914f6be218c0fa354a341', 'hex'));
      expect(pk.point).toBeDefined();
      expect(pk.point.getX().toString(16)).toBe('1ff0fe0f7b15ffaa85ff9f4744d539139c252a49710fb053bb9f2b933173ff9a');
    });

    test('from a point', () => {
      let p = Point.ecPoint('86a80a5a2bfc48dddde2b0bd88bd56b0b6ddc4e6811445b175b90268924d7d48',
                        '3b402dfc89712cfe50963e670a0598e6b152b3cd94735001cdac6794975d3afd');
      let a = PublicKey.from(p);
      expect(a.point).toBeDefined();
      expect(a.point.toString()).toBe(p.toString());
    });
  });

  describe('#getValidationError', () =>{

    test('should recieve an invalid point error', () => {
      let error = PublicKey.getValidationError(invalidPoint);
      expect(error).toBeDefined();
      expect(error!.message).toBe('Point does not lie on the curve');
    });

    test('should recieve a boolean as false', () => {
      let valid = PublicKey.isValid(invalidPoint);
      expect(valid).false;
    });

    test('should recieve a boolean as true for uncompressed', () => {
      let valid = PublicKey.isValid('041ff0fe0f7b15ffaa85ff9f4744d539139c252a49710fb053bb9f2b933173ff9a7baad41d04514751e6851f5304fd243751703bed21b914f6be218c0fa354a341');
      expect(valid).true;
    });

    test('should recieve a boolean as true for compressed', () => {
      let valid = PublicKey.isValid('031ff0fe0f7b15ffaa85ff9f4744d539139c252a49710fb053bb9f2b933173ff9a');
      expect(valid).true;
    });

  });

  describe('#fromPoint', () => {

    test('should instantiate from a point', () => {
      let p = Point.ecPoint('86a80a5a2bfc48dddde2b0bd88bd56b0b6ddc4e6811445b175b90268924d7d48',
                        '3b402dfc89712cfe50963e670a0598e6b152b3cd94735001cdac6794975d3afd');
      let b = PublicKey.fromPoint(p);
      expect(b.point).toBeDefined();
      expect(b.point.toString()).toBe(p.toString());
    });

    test('should error because paramater is not a point', () => {
      expect(() => PublicKey.fromPoint(new Error() as any)).toThrow('First argument must be an instance of Point.');
    });
  });

  describe('#json/object', () => {

    test('should input/ouput json', () => {
      let json = JSON.stringify({
        x: '1ff0fe0f7b15ffaa85ff9f4744d539139c252a49710fb053bb9f2b933173ff9a',
        y: '7baad41d04514751e6851f5304fd243751703bed21b914f6be218c0fa354a341',
        compressed: false,
        network: 'mainnet'
      });
      let pubkey = PublicKey.from(JSON.parse(json));
      expect(JSON.stringify(pubkey)).toEqual(json);
    });

    test('fails if "y" is not provided', () => {
      expect(() => PublicKey.from({x: '1ff0fe0f7b15ffaa85ff9f4744d539139c252a49710fb053bb9f2b933173ff9a'} as any)).toThrow();
    });

    test('fails if invalid JSON is provided', () => {
      expect(() =>   PublicKey.fromJSON('¹' as any)).toThrow();
    });

    test('works for X starting with 0x00', () => {
      let a = PublicKey.from('030589ee559348bd6a7325994f9c8eff12bd5d73cc683142bd0dd1a17abc99b0dc');
      let b = PublicKey.from('03'+a.toObject().x);
      expect(b.toString()).toBe(a.toString());
    });

  });

  describe('#fromPrivateKey', () => {
    test('should make a public key from a privkey', () => {
      expect(PublicKey.fromPrivateKey(PrivateKey.fromRandom())).toBeDefined();
    });

    test('should throw error because not an instance of privkey', () => {
      expect(() => PublicKey.fromPrivateKey(new Error() as any)).toThrow('Must be data of PrivateKey');
    });
  });

  describe('#fromBuffer', () => {

    test('should parse this uncompressed public key', () => {
      let pk = PublicKey.fromBuffer(Buffer.from('041ff0fe0f7b15ffaa85ff9f4744d539139c252a49710fb053bb9f2b933173ff9a7baad41d04514751e6851f5304fd243751703bed21b914f6be218c0fa354a341', 'hex'));
      expect(pk.point.getX().toString(16)).toBe('1ff0fe0f7b15ffaa85ff9f4744d539139c252a49710fb053bb9f2b933173ff9a');
      expect(pk.point.getY().toString(16)).toBe('7baad41d04514751e6851f5304fd243751703bed21b914f6be218c0fa354a341');
      expect(pk.compressed).false;
    });

    test('should parse this uncompressed public key', () => {  
      let pk = PublicKey.fromBuffer(Buffer.from('061ff0fe0f7b15ffaa85ff9f4744d539139c252a49710fb053bb9f2b933173ff9a84552be2fbaeb8ae197ae0acfb02dbc8ae8fc412de46eb0941de73ef5cab58ee', 'hex'), false);
      expect(pk.point.getX().toString(16)).toBe('1ff0fe0f7b15ffaa85ff9f4744d539139c252a49710fb053bb9f2b933173ff9a');
      expect(pk.point.getY().toString(16)).toBe('84552be2fbaeb8ae197ae0acfb02dbc8ae8fc412de46eb0941de73ef5cab58ee');
      expect(pk.compressed).false;
    });

    test('should parse this uncompressed public key', () => {
      let pk = PublicKey.fromBuffer(Buffer.from('071ff0fe0f7b15ffaa85ff9f4744d539139c252a49710fb053bb9f2b933173ff9a84552be2fbaeb8ae197ae0acfb02dbc8ae8fc412de46eb0941de73ef5cab58ee', 'hex'), false);
      expect(pk.point.getX().toString(16)).toBe('1ff0fe0f7b15ffaa85ff9f4744d539139c252a49710fb053bb9f2b933173ff9a');
      expect(pk.point.getY().toString(16)).toBe('84552be2fbaeb8ae197ae0acfb02dbc8ae8fc412de46eb0941de73ef5cab58ee');
      expect(pk.compressed).false;
    });

    test('should parse this compressed public key', () => {
      let pk = PublicKey.fromBuffer(Buffer.from('031ff0fe0f7b15ffaa85ff9f4744d539139c252a49710fb053bb9f2b933173ff9a', 'hex'));
      expect(pk.point.getX().toString(16)).toBe('1ff0fe0f7b15ffaa85ff9f4744d539139c252a49710fb053bb9f2b933173ff9a');
      expect(pk.point.getY().toString(16)).toBe('7baad41d04514751e6851f5304fd243751703bed21b914f6be218c0fa354a341');
    });

    test('should parse this compressed public key', () => {
      let pk = PublicKey.fromBuffer(Buffer.from('021ff0fe0f7b15ffaa85ff9f4744d539139c252a49710fb053bb9f2b933173ff9a', 'hex'));
      expect(pk.point.getX().toString(16)).toBe('1ff0fe0f7b15ffaa85ff9f4744d539139c252a49710fb053bb9f2b933173ff9a');
      expect(pk.point.getY().toString(16)).toBe('84552be2fbaeb8ae197ae0acfb02dbc8ae8fc412de46eb0941de73ef5cab58ee');
    });

    test('should throw an error on this invalid public key', () => {
      expect(() => PublicKey.fromBuffer(Buffer.from('091ff0fe0f7b15ffaa85ff9f4744d539139c252a49710fb053bb9f2b933173ff9a', 'hex'))).toThrow();
    });

    test('should throw error because not a buffer', () => {
      expect(() => PublicKey.fromBuffer('091ff0fe0f7b15ffaa85ff9f4744d539139c252a49710fb053bb9f2b933173ff9a' as any)).toThrow('Must be a hex buffer of DER encoded public key');
    });

    test('should throw error because buffer is the incorrect length', () => {
      expect(() => 
        PublicKey.fromBuffer(Buffer.from('041ff0fe0f7b15ffaa85ff9f4744d539139c252a49710fb053bb9f2b933173ff9a7baad41d04514751e6851f5304fd243751703bed21b914f6be218c0fa354a34112', 'hex'))
      ).toThrow('Length of x and y must be 32 bytes');
    });

    test('should throw an error for prefix 0x06 when strict = true', () => {
      expect(() => 
        PublicKey.fromBuffer(Buffer.from('061ff0fe0f7b15ffaa85ff9f4744d539139c252a49710fb053bb9f2b933173ff9a84552be2fbaeb8ae197ae0acfb02dbc8ae8fc412de46eb0941de73ef5cab58ee', 'hex'))
      ).toThrow('Invalid DER format public key');
    });
  
    test('should throw an error for prefix 0x07 when strict = true', () => {
      expect(() => 
        PublicKey.fromBuffer(Buffer.from('071ff0fe0f7b15ffaa85ff9f4744d539139c252a49710fb053bb9f2b933173ff9a84552be2fbaeb8ae197ae0acfb02dbc8ae8fc412de46eb0941de73ef5cab58ee', 'hex'))
      ).toThrow('Invalid DER format public key');
    });

  });

  describe('#fromDER', () => {

    test('should parse this uncompressed public key', () => {
      let pk = PublicKey.fromDER(Buffer.from('041ff0fe0f7b15ffaa85ff9f4744d539139c252a49710fb053bb9f2b933173ff9a7baad41d04514751e6851f5304fd243751703bed21b914f6be218c0fa354a341', 'hex'));
      expect(pk.point.getX().toString(16)).toBe('1ff0fe0f7b15ffaa85ff9f4744d539139c252a49710fb053bb9f2b933173ff9a');
      expect(pk.point.getY().toString(16)).toBe('7baad41d04514751e6851f5304fd243751703bed21b914f6be218c0fa354a341');
    });

    test('should parse this compressed public key', () => {
      let pk = PublicKey.fromDER(Buffer.from('031ff0fe0f7b15ffaa85ff9f4744d539139c252a49710fb053bb9f2b933173ff9a', 'hex'));
      expect(pk.point.getX().toString(16)).toBe('1ff0fe0f7b15ffaa85ff9f4744d539139c252a49710fb053bb9f2b933173ff9a');
      expect(pk.point.getY().toString(16)).toBe('7baad41d04514751e6851f5304fd243751703bed21b914f6be218c0fa354a341');
    });

    test('should throw an error on this invalid public key', () => {
      expect(() => PublicKey.fromDER(Buffer.from('091ff0fe0f7b15ffaa85ff9f4744d539139c252a49710fb053bb9f2b933173ff9a', 'hex'))).toThrow();
    });

  });

  describe('#fromString', () => {

    test('should parse this known valid public key', () => {
      let pk = PublicKey.fromString('041ff0fe0f7b15ffaa85ff9f4744d539139c252a49710fb053bb9f2b933173ff9a7baad41d04514751e6851f5304fd243751703bed21b914f6be218c0fa354a341');
      expect(pk.point.getX().toString(16)).toBe('1ff0fe0f7b15ffaa85ff9f4744d539139c252a49710fb053bb9f2b933173ff9a');
      expect(pk.point.getY().toString(16)).toBe('7baad41d04514751e6851f5304fd243751703bed21b914f6be218c0fa354a341');
    });

  });

  describe('#fromX', () => {

    test('should create this known public key', () => {
      let x = BN.fromBuffer(Buffer.from('1ff0fe0f7b15ffaa85ff9f4744d539139c252a49710fb053bb9f2b933173ff9a', 'hex'));
      let pk = PublicKey.fromPoint(Point.ecPointFromX(true, x));
      expect(pk.point.getX().toString(16)).toBe('1ff0fe0f7b15ffaa85ff9f4744d539139c252a49710fb053bb9f2b933173ff9a');
      expect(pk.point.getY().toString(16)).toBe('7baad41d04514751e6851f5304fd243751703bed21b914f6be218c0fa354a341');
    });

  });

  describe('#toBuffer', () => {

    test('should return this compressed DER format', () => {
      let x = BN.fromBuffer(Buffer.from('1ff0fe0f7b15ffaa85ff9f4744d539139c252a49710fb053bb9f2b933173ff9a', 'hex'));
      let pk = PublicKey.fromPoint(Point.ecPointFromX(false, x));
      expect(pk.toBuffer().toString('hex')).toBe('021ff0fe0f7b15ffaa85ff9f4744d539139c252a49710fb053bb9f2b933173ff9a');
    });

    test('should return this compressed DER format', () => {
      let x = BN.fromBuffer(Buffer.from('1ff0fe0f7b15ffaa85ff9f4744d539139c252a49710fb053bb9f2b933173ff9a', 'hex'));
      let pk = PublicKey.fromPoint(Point.ecPointFromX(true, x));
      expect(pk.toBuffer().toString('hex')).toBe('031ff0fe0f7b15ffaa85ff9f4744d539139c252a49710fb053bb9f2b933173ff9a');
    });

    test('should return this uncompressed DER format', () => {
      let x = BN.fromBuffer(Buffer.from('1ff0fe0f7b15ffaa85ff9f4744d539139c252a49710fb053bb9f2b933173ff9a', 'hex'));
      let pk = PublicKey.fromPoint(Point.ecPointFromX(true, x), false);
      expect(pk.toBuffer().toString('hex')).toBe('041ff0fe0f7b15ffaa85ff9f4744d539139c252a49710fb053bb9f2b933173ff9a7baad41d04514751e6851f5304fd243751703bed21b914f6be218c0fa354a341');
    });

  });

  describe('#toDER', () => {

    test('should return this compressed DER format', () => {
      let x = BN.fromBuffer(Buffer.from('1ff0fe0f7b15ffaa85ff9f4744d539139c252a49710fb053bb9f2b933173ff9a', 'hex'));
      let pk = PublicKey.fromPoint(Point.ecPointFromX(true, x));
      expect(pk.toDER().toString('hex')).toBe('031ff0fe0f7b15ffaa85ff9f4744d539139c252a49710fb053bb9f2b933173ff9a');
    });

    test('should return this uncompressed DER format', () => {
      let pk = PublicKey.fromString('041ff0fe0f7b15ffaa85ff9f4744d539139c252a49710fb053bb9f2b933173ff9a7baad41d04514751e6851f5304fd243751703bed21b914f6be218c0fa354a341');
      expect(pk.toDER().toString('hex')).toBe('041ff0fe0f7b15ffaa85ff9f4744d539139c252a49710fb053bb9f2b933173ff9a7baad41d04514751e6851f5304fd243751703bed21b914f6be218c0fa354a341');
    });
  });

  describe('#toString', () => {

    test('should print this known public key', () => {
      let hex = '031ff0fe0f7b15ffaa85ff9f4744d539139c252a49710fb053bb9f2b933173ff9a';
      let pk = PublicKey.fromString(hex);
      expect(pk.toString()).toBe(hex);
    });

  });

  describe('#inspect', () => {
    test('should output known uncompressed pubkey for console', () => {
      let pubkey = PublicKey.fromString('041ff0fe0f7b15ffaa85ff9f4744d539139c252a49710fb053bb9f2b933173ff9a7baad41d04514751e6851f5304fd243751703bed21b914f6be218c0fa354a341');
      expect(pubkey.inspect()).toBe('<PublicKey: 041ff0fe0f7b15ffaa85ff9f4744d539139c252a49710fb053bb9f2b933173ff9a7baad41d04514751e6851f5304fd243751703bed21b914f6be218c0fa354a341, uncompressed>');
    });

    test('should output known compressed pubkey for console', () => {
      let pubkey = PublicKey.fromString('031ff0fe0f7b15ffaa85ff9f4744d539139c252a49710fb053bb9f2b933173ff9a');
      expect(pubkey.inspect()).toBe('<PublicKey: 031ff0fe0f7b15ffaa85ff9f4744d539139c252a49710fb053bb9f2b933173ff9a>');
    });
  });

  describe('#validate', () => {

    test('should not have an error if pubkey is valid', () => {
      let hex = '031ff0fe0f7b15ffaa85ff9f4744d539139c252a49710fb053bb9f2b933173ff9a';
      expect(() => PublicKey.fromString(hex)).not.toThrow();
    });

    test('should throw an error if pubkey is invalid', () => {
      let hex = '041ff0fe0f7b15ffaa85ff9f4744d539139c252a49710fb053bb9f2b933173ff9a0000000000000000000000000000000000000000000000000000000000000000';
      expect(() => PublicKey.fromString(hex)).toThrow('Invalid y value for curve.');
    });

    test('should throw an error if pubkey is invalid', () => {
      let hex = '041ff0fe0f7b15ffaa85ff9f4744d539139c252a49710fb053bb9f2b933173ff9a00000000000000000000000000000000000000000000000000000000000000FF';
      expect(() => PublicKey.fromString(hex)).toThrow('Invalid y value for curve.');
    });

    test('should throw an error if pubkey is infinity', () => {
      expect(() => PublicKey.from(Point.getG().mul(Point.getN()))).toThrow('Point cannot be equal to Infinity');
    });

  });

});
