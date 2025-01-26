import { describe, expect, test } from "vitest";
import Point from "../../src/crypto/point";
import BN from "../../src/crypto/bn.extension";
import type { curve } from 'elliptic';
import { ec as EC } from 'elliptic';

describe('Point', () => {

  let valid = {
    x: 'ac242d242d23be966085a2b2b893d989f824e06c9ad0395a8a52f055ba39abb2',
    y: '4836ab292c105a711ed10fcfd30999c31ff7c02456147747e03e739ad527c380',
  };
  
  test('should create a point from x and y', () => {
    let p = Point.ecPoint(valid.x, valid.y);
    expect(p).toBeDefined();
  });

  describe('#getX', () => {
    test('should return x', () => {
      let p = Point.ecPoint(valid.x, valid.y);
      let x = p.getX();
      expect(x.toString('hex', 64)).toBe(valid.x);
    });

    test('should be convertable to a buffer', () => {
      let p = Point.ecPoint(valid.x,valid.y);
      let a = p.getX().toBuffer({size: 32});
      expect(a.length).toBe(32);
      expect(a).toEqual(Buffer.from(valid.x, 'hex'));
    });
  });

  describe('#getY', () => {
    test('should return y', () => {
      let p = Point.ecPoint(valid.x,valid.y);
      expect(p.getY().toString('hex', 64)).toBe(valid.y);
    });

    test('should be convertable to a buffer', () => {
      let p = Point.ecPoint(valid.x,valid.y);
      let a = p.getY().toBuffer({size: 32});
      expect(a.length).toBe(32);
      expect(a).toEqual(Buffer.from(valid.y, 'hex'));
    });
  });

  describe('#add', () => {
    test('should accurately add g to itself', () => {
      let p1 = Point.getG();
      let p2 = Point.getG();
      let p3 = p1.add(p2);
      expect(p3.getX().toString()).toBe('89565891926547004231252920425935692360644145829622209833684329913297188986597');
      expect(p3.getY().toString()).toBe('12158399299693830322967808612713398636155367887041628176798871954788371653930');
    });
  });

  describe('#mul', () => {
    test('should accurately multiply g by 2', () => {
      let g = Point.getG();
      let b = g.mul(new BN(2));
      expect(b.getX().toString()).toBe('8956589192654700423125292042593569236064414582962220983'+
                                       '3684329913297188986597');
      expect(b.getY().toString()).toBe('1215839929969383032296780861271339863615536788704162817'+
                                       '6798871954788371653930');
    });

    test('should accurately multiply g by n-1', () => {
      let g = Point.getG();
      let n = Point.getN();
      let b = g.mul(n.sub(new BN(1)));
      expect(b.getX().toString()).toBe('55066263022277343669578718895168534326250603453777594175'+
                                       '500187360389116729240');
      expect(b.getY().toString()).toBe('83121579216557378445487899878180864668798711284981320763'+
                                       '518679672151497189239');
    });

    //not sure if this is technically accurate or not...
    //normally, you should always multiply g by something less than n
    //but it is the same result in OpenSSL
    test('should accurately multiply g by n+1', () => {
      let g = Point.getG();
      let n = Point.getN();
      let b = g.mul(n.add(new BN(1)));
      expect(b.getX().toString()).toBe('550662630222773436695787188951685343262506034537775941755'+
                                       '00187360389116729240');
      expect(b.getY().toString()).toBe('326705100207588169780830851305070431844712733806592432759'+
                                       '38904335757337482424');
    });
  });

  describe('@fromX', () => {
    test('should return g', () => {
      let g = Point.getG();
      let p = Point.ecPointFromX(false, g.getX());
      expect(g.eq(p)).true;
    });
  });

  describe('#validate', () => {
    test('should describe this point as valid', () => {
      let p = Point.ecPoint(valid.x, valid.y);
      expect(p.validate()).toBeDefined();
    });

    test('should describe this point as invalid because of zero y', () => {
      let x = 'ac242d242d23be966085a2b2b893d989f824e06c9ad0395a8a52f055ba39abb2';
      let y = '0000000000000000000000000000000000000000000000000000000000000000';
      expect(() => Point.ecPoint(x, y)).toThrow('Invalid y value for curve.');
    });


    test('should describe this point as invalid because of invalid y', () => {
      let x = 'ac242d242d23be966085a2b2b893d989f824e06c9ad0395a8a52f055ba39abb2';
      let y = '00000000000000000000000000000000000000000000000000000000000000FF';
      expect(() => Point.ecPoint(x, y)).toThrow('Invalid y value for curve.');
    });

    test('should describe this point as invalid because out of curve bounds', () => {
      // point larger than max
      let x = 'FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEDCE6AF48A03BBFD25E8CD0364141';
      // calculated y of x
      let y = 'ed3970f129bc2ca7c7c6cf92fa7da4de6a1dfc9c14da4bf056aa868d3dd74034';
      expect(() => Point.ecPoint(x, y)).toThrow('Point does not lie on the curve');
    });

    test('should describe this point as invalid because out of curve bounds', () => {
      let x = '0000000000000000000000000000000000000000000000000000000000000000';
      expect(() => Point.ecPointFromX(false, x)).toThrow('Invalid X');
    });

    test('should throw an error when the point is infinity', () => {
      expect(() => Point.ecPoint(null as any, null as any)).toThrow('Point cannot be equal to Infinity');
    });

    test('should throw an error when point times N is not infinity', () => {
      // Use a valid point to ensure it passes the initial validations
      let validPoint = Point.getG(); // Generator point on the curve, always valid
      // Create the Point instance
      let point = Point.ecPoint(validPoint.getX(), validPoint.getY());

      let ec = new EC('secp256k1').curve as curve.short;
      // Override the multiplication to simulate an invalid result
      point.ecPoint.mul = () => ec.point(new BN(1), new BN(1)); // An arbitrary point not at infinity

      expect(() => point.validate()).toThrow('Point times N must be infinity');
    });
  });

  describe('#hasSquare', () => {
    test('should return true when Y is a square modulo p', () => {
      let validPoint = Point.getG(); // Generator point on the curve, always valid
      // Create the Point instance
      let point = new Point(validPoint.ecPoint);
      expect(point.hasSquare()).true;
    });

    test('should return false when Y is not a square modulo p', () => {
      // Create a point with known valid x and non-square Y
      let x = new BN(1);
      let nonSquareY = new BN(3); // Non-square Y

      let ec = new EC('secp256k1').curve as curve.short;
      let invalidPoint = ec.point(x, nonSquareY);

      // Create a Point instance without validation
      let point = new Point(invalidPoint, true); // Skip validation

      // Validate that hasSquare correctly identifies the non-square Y
      expect(point.hasSquare()).false;
    });
  });

  describe('@pointToCompressed', () => {
    test('should correctly compress a point with even y-coordinate', () => {
      let x = new BN('55066263022277343669578718895168534326250603453777594175500187360389116729240'); // Example x
      let y = new BN('32670510020758816978083085130507043184471273380659243275938904335757337482424'); // Example even y
      let point = Point.ecPoint(x, y);
  
      // Expected prefix is 0x02 because y is even
      let compressed = Point.pointToCompressed(point);
      expect(compressed[0]).toBe(0x02);
      expect(compressed.length).toBe(33); // 1 byte prefix + 32 bytes x
    });
  
    test('should correctly compress a point with odd y-coordinate', () => {
      let x = new BN(1); // Example x
      let y = new BN("85895366384747149408010284714111852077055649506395260922968891100383188440129"); // Example odd y
      let point = Point.ecPoint(x, y);
  
      // Expected prefix is 0x03 because y is odd
      let compressed = Point.pointToCompressed(point);
      expect(compressed[0]).toBe(0x03);
      expect(compressed.length).toBe(33); // 1 byte prefix + 32 bytes x
    });
  });
});