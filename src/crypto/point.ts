import BN from "../crypto/bn.extension";
import type { curve, BNInput } from 'elliptic';
import elliptic from 'elliptic';
const EC = elliptic.ec;

export default class Point {

  private static readonly ec = new EC('secp256k1').curve as curve.short;

  public ecPoint: curve.short.ShortPoint;

  private static _g: Point = new Point(this.ec.g);

  constructor(point: curve.short.ShortPoint, skipValidation = false) {
    this.ecPoint = point;
    if (!skipValidation) {
      this.validate();
    }
  }

  /**
   * Will return the X coordinate of the Point
   *
   * @returns A BN instance of the X coordinate
   */
  public getX(): BN {
    return new BN(this.ecPoint.getX().toArray());
  }

  /**
   * Will return the Y coordinate of the Point
   *
   * @returns A BN instance of the Y coordinate
   */
  public getY(): BN {
    return new BN(this.ecPoint.getY().toArray());
  }

  public add(p: Point): Point {
    return new Point(this.ecPoint.add(p.ecPoint) as curve.short.ShortPoint, true);
  }

  public mul(k: BN): Point {
    let p = this.ecPoint.mul(k);
    return new Point(p as curve.short.ShortPoint, true);
  }

  public mulAdd(k1: BN, p2: Point, k2: BN): Point {
    let p = (this.ecPoint as any).mulAdd(k1, p2.ecPoint, k2); // eslint-disable-line @typescript-eslint/no-explicit-any
    return new Point(p as curve.short.ShortPoint, true);
  }

  public eq(p: Point): boolean {
    return this.ecPoint.eq(p.ecPoint);
  }

  /**
   * Will determine if the point is valid
   *
   * @see {@link https://www.iacr.org/archive/pkc2003/25670211/25670211.pdf}
   * @throws A validation error if exists
   * @returns An instance of the same Point
   */
  public validate(): this {
    if (this.ecPoint.isInfinity()){
      throw new Error('Point cannot be equal to Infinity');
    }
  
    let p2;
    try {
      p2 = Point.ec.pointFromX(this.getX(), this.getY().isOdd());
    } catch {
      throw new Error('Point does not lie on the curve');
    }
  
    if (p2.y!.cmp(this.ecPoint.y!) !== 0) {
      throw new Error('Invalid y value for curve.');
    }
  
    if (!(this.ecPoint.mul(Point.getN()).isInfinity())) {
      throw new Error('Point times N must be infinity');
    }
  
    return this;
  }

  public hasSquare(): boolean {
    return !this.ecPoint.isInfinity() && Point.isSquare(this.getY());
  }

  private static isSquare(x: BN): boolean {
    let p = new BN('FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEFFFFFC2F', 'hex');
    let x0 = new BN(x);
    let base = x0.toRed(BN.red(p));
    let res = base.redPow(p.sub(BN.One).div(new BN(2))).fromRed();
    return res.eq(new BN(1));
  }

  /**
   * Instantiate a valid secp256k1 Point from the X and Y coordinates.
   *
   * @param x - The X coordinate
   * @param y - The Y coordinate
   * @see {@link https://github.com/indutny/elliptic}
   * @throws A validation error if exists
   */
  public static ecPoint(x: BNInput, y: BNInput, isRed?: boolean): Point {
    return new Point(this.ec.point(x, y, isRed));
  }

  /**
   *
   * Instantiate a valid secp256k1 Point from only the X coordinate
   * 
   * @param odd - If the Y coordinate is odd
   * @param x - The X coordinate
   * @throws A validation error if exists
   */
  public static ecPointFromX(odd: boolean, x: BNInput): Point {
    let point;
    try {
      point = this.ec.pointFromX(x, odd);
    } catch {
      throw new Error('Invalid X');
    }
    return new Point(point);
  }

  /**
   *
   * Will return a secp256k1 ECDSA base point.
   *
   * @see {@link https://en.bitcoin.it/wiki/Secp256k1}
   * @returns An instance of the base point.
   */
  public static getG(): Point {
    return this._g;
  };

  /**
   *
   * Will return the max of range of valid private keys as governed by the secp256k1 ECDSA standard.
   *
   * @see {@link https://en.bitcoin.it/wiki/Private_key#Range_of_valid_ECDSA_private_keys}
   * @returns A BN instance of the number of points on the curve
   */
  public static getN(): BN {
    return new BN(this.ec.n.toArray());
  };

  public static pointToCompressed(point: Point): Buffer {
    let xbuf = point.getX().toBuffer({size: 32});
    let ybuf = point.getY().toBuffer({size: 32});
  
    let odd = ybuf[ybuf.length - 1] % 2;
    let prefix = Buffer.from(odd ? [0x03] : [0x02]);

    return Buffer.concat([prefix, xbuf]);
  };
}