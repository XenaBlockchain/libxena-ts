[**libnexa-ts**](../index.md)

***

[libnexa-ts](../index.md) / Point

# Class: Point

## Constructors

### new Point()

```ts
new Point(point: ShortPoint, skipValidation: boolean): Point
```

#### Parameters

| Parameter | Type | Default value |
| ------ | ------ | ------ |
| `point` | `ShortPoint` | `undefined` |
| `skipValidation` | `boolean` | `false` |

#### Returns

[`Point`](Point.md)

## Properties

| Property | Modifier | Type |
| ------ | ------ | ------ |
| <a id="ecpoint"></a> `ecPoint` | `public` | `ShortPoint` |

## Methods

### ecPoint()

```ts
static ecPoint(
   x: BNInput, 
   y: BNInput, 
   isRed?: boolean): Point
```

Instantiate a valid secp256k1 Point from the X and Y coordinates.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `x` | `BNInput` | The X coordinate |
| `y` | `BNInput` | The Y coordinate |
| `isRed`? | `boolean` | - |

#### Returns

[`Point`](Point.md)

#### See

[https://github.com/indutny/elliptic](https://github.com/indutny/elliptic)

#### Throws

A validation error if exists

***

### ecPointFromX()

```ts
static ecPointFromX(odd: boolean, x: BNInput): Point
```

Instantiate a valid secp256k1 Point from only the X coordinate

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `odd` | `boolean` | If the Y coordinate is odd |
| `x` | `BNInput` | The X coordinate |

#### Returns

[`Point`](Point.md)

#### Throws

A validation error if exists

***

### getG()

```ts
static getG(): Point
```

Will return a secp256k1 ECDSA base point.

#### Returns

[`Point`](Point.md)

An instance of the base point.

#### See

[https://en.bitcoin.it/wiki/Secp256k1](https://en.bitcoin.it/wiki/Secp256k1)

***

### getN()

```ts
static getN(): BNExtended
```

Will return the max of range of valid private keys as governed by the secp256k1 ECDSA standard.

#### Returns

[`BNExtended`](BNExtended.md)

A BN instance of the number of points on the curve

#### See

[https://en.bitcoin.it/wiki/Private\_key#Range\_of\_valid\_ECDSA\_private\_keys](https://en.bitcoin.it/wiki/Private_key#Range_of_valid_ECDSA_private_keys)

***

### pointToCompressed()

```ts
static pointToCompressed(point: Point): Buffer
```

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `point` | [`Point`](Point.md) |

#### Returns

`Buffer`

***

### getX()

```ts
getX(): BNExtended
```

Will return the X coordinate of the Point

#### Returns

[`BNExtended`](BNExtended.md)

A BN instance of the X coordinate

***

### getY()

```ts
getY(): BNExtended
```

Will return the Y coordinate of the Point

#### Returns

[`BNExtended`](BNExtended.md)

A BN instance of the Y coordinate

***

### add()

```ts
add(p: Point): Point
```

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `p` | [`Point`](Point.md) |

#### Returns

[`Point`](Point.md)

***

### mul()

```ts
mul(k: BNExtended): Point
```

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `k` | [`BNExtended`](BNExtended.md) |

#### Returns

[`Point`](Point.md)

***

### mulAdd()

```ts
mulAdd(
   k1: BNExtended, 
   p2: Point, 
   k2: BNExtended): Point
```

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `k1` | [`BNExtended`](BNExtended.md) |
| `p2` | [`Point`](Point.md) |
| `k2` | [`BNExtended`](BNExtended.md) |

#### Returns

[`Point`](Point.md)

***

### eq()

```ts
eq(p: Point): boolean
```

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `p` | [`Point`](Point.md) |

#### Returns

`boolean`

***

### validate()

```ts
validate(): this
```

Will determine if the point is valid

#### Returns

`this`

An instance of the same Point

#### See

[https://www.iacr.org/archive/pkc2003/25670211/25670211.pdf](https://www.iacr.org/archive/pkc2003/25670211/25670211.pdf)

#### Throws

A validation error if exists

***

### hasSquare()

```ts
hasSquare(): boolean
```

#### Returns

`boolean`
