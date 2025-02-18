[**libnexa-ts**](../index.md)

***

[libnexa-ts](../index.md) / BNExtended

# Class: BNExtended

## Extends

- `BN`

## Constructors

### new BNExtended()

```ts
new BNExtended(
   number: 
  | string
  | number
  | Buffer<ArrayBufferLike>
  | Uint8Array<ArrayBufferLike>
  | number[]
  | BN, 
   base?: number | "hex", 
   endian?: Endianness): BNExtended
```

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `number` | \| `string` \| `number` \| `Buffer`\<`ArrayBufferLike`\> \| `Uint8Array`\<`ArrayBufferLike`\> \| `number`[] \| `BN` |
| `base`? | `number` \| `"hex"` |
| `endian`? | `Endianness` |

#### Returns

[`BNExtended`](BNExtended.md)

#### Inherited from

```ts
BN.constructor
```

### new BNExtended()

```ts
new BNExtended(number: 
  | string
  | number
  | Buffer<ArrayBufferLike>
  | Uint8Array<ArrayBufferLike>
  | number[]
  | BN, endian?: Endianness): BNExtended
```

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `number` | \| `string` \| `number` \| `Buffer`\<`ArrayBufferLike`\> \| `Uint8Array`\<`ArrayBufferLike`\> \| `number`[] \| `BN` |
| `endian`? | `Endianness` |

#### Returns

[`BNExtended`](BNExtended.md)

#### Inherited from

```ts
BN.constructor
```

## Properties

| Property | Modifier | Type | Inherited from |
| ------ | ------ | ------ | ------ |
| <a id="bn"></a> `BN` | `static` | *typeof* `BN` | `BN.BN` |
| <a id="wordsize"></a> `wordSize` | `static` | `26` | `BN.wordSize` |
| <a id="zero"></a> `Zero` | `static` | [`BNExtended`](BNExtended.md) | - |
| <a id="one"></a> `One` | `static` | [`BNExtended`](BNExtended.md) | - |
| <a id="minus1"></a> `Minus1` | `static` | [`BNExtended`](BNExtended.md) | - |

## Methods

### red()

```ts
static red(reductionContext: BN | IPrimeName): ReductionContext
```

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `reductionContext` | `BN` \| `IPrimeName` |

#### Returns

`ReductionContext`

#### Description

create a reduction context

#### Inherited from

```ts
BN.red
```

***

### mont()

```ts
static mont(num: BN): ReductionContext
```

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `num` | `BN` |

#### Returns

`ReductionContext`

#### Description

create a reduction context  with the Montgomery trick.

#### Inherited from

```ts
BN.mont
```

***

### isBN()

```ts
static isBN(b: any): b is BN
```

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `b` | `any` |

#### Returns

`b is BN`

#### Description

returns true if the supplied object is a BN.js instance

#### Inherited from

```ts
BN.isBN
```

***

### max()

```ts
static max(left: BN, right: BN): BN
```

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `left` | `BN` |
| `right` | `BN` |

#### Returns

`BN`

#### Description

returns the maximum of 2 BN instances.

#### Inherited from

```ts
BN.max
```

***

### min()

```ts
static min(left: BN, right: BN): BN
```

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `left` | `BN` |
| `right` | `BN` |

#### Returns

`BN`

#### Description

returns the minimum of 2 BN instances.

#### Inherited from

```ts
BN.min
```

***

### fromNumber()

```ts
static fromNumber(num: number): BNExtended
```

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `num` | `number` |

#### Returns

[`BNExtended`](BNExtended.md)

***

### fromBigInt()

```ts
static fromBigInt(num: bigint): BNExtended
```

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `num` | `bigint` |

#### Returns

[`BNExtended`](BNExtended.md)

***

### fromString()

```ts
static fromString(str: string, base?: number | "hex"): BNExtended
```

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `str` | `string` |
| `base`? | `number` \| `"hex"` |

#### Returns

[`BNExtended`](BNExtended.md)

***

### fromBuffer()

```ts
static fromBuffer(buf: Buffer, opts?: BNOptions): BNExtended
```

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `buf` | `Buffer` |
| `opts`? | [`BNOptions`](../interfaces/BNOptions.md) |

#### Returns

[`BNExtended`](BNExtended.md)

***

### fromScriptNumBuffer()

```ts
static fromScriptNumBuffer(
   buf: Buffer, 
   fRequireMinimal?: boolean, 
   size?: number): BNExtended
```

Create a BN from a "ScriptNum":
This is analogous to the constructor for CScriptNum in nexad. Many ops in
nexad's script interpreter use CScriptNum, which is not really a proper
bignum. Instead, an error is thrown if trying to input a number bigger than
4 bytes. We copy that behavior here. A third argument, `size`, is provided to
extend the hard limit of 4 bytes, as some usages require more than 4 bytes.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `buf` | `Buffer` |
| `fRequireMinimal`? | `boolean` |
| `size`? | `number` |

#### Returns

[`BNExtended`](BNExtended.md)

***

### copy()

```ts
copy(dest: BN): void
```

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `dest` | `BN` |

#### Returns

`void`

#### Description

Copy to dest number

#### Inherited from

```ts
BN.copy
```

***

### clone()

```ts
clone(): BN
```

#### Returns

`BN`

#### Description

clone number

#### Inherited from

```ts
BN.clone
```

***

### toString()

```ts
toString(base?: number | "hex", length?: number): string
```

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `base`? | `number` \| `"hex"` |
| `length`? | `number` |

#### Returns

`string`

#### Description

convert to base-string and pad with zeroes

#### Inherited from

```ts
BN.toString
```

***

### toJSON()

```ts
toJSON(): string
```

#### Returns

`string`

#### Description

convert to JSON compatible hex string (alias of toString(16))

#### Inherited from

```ts
BN.toJSON
```

***

### toArray()

```ts
toArray(endian?: Endianness, length?: number): number[]
```

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `endian`? | `Endianness` |
| `length`? | `number` |

#### Returns

`number`[]

#### Description

convert to byte Array, and optionally zero pad to length, throwing if already exceeding

#### Inherited from

```ts
BN.toArray
```

***

### toArrayLike()

#### Call Signature

```ts
toArrayLike(
   ArrayType: BufferConstructor, 
   endian?: Endianness, 
   length?: number): Buffer
```

##### Parameters

| Parameter | Type |
| ------ | ------ |
| `ArrayType` | `BufferConstructor` |
| `endian`? | `Endianness` |
| `length`? | `number` |

##### Returns

`Buffer`

##### Description

convert to an instance of `type`, which must behave like an Array

##### Inherited from

```ts
BN.toArrayLike
```

#### Call Signature

```ts
toArrayLike(
   ArrayType: any[], 
   endian?: Endianness, 
   length?: number): any[]
```

##### Parameters

| Parameter | Type |
| ------ | ------ |
| `ArrayType` | `any`[] |
| `endian`? | `Endianness` |
| `length`? | `number` |

##### Returns

`any`[]

##### Description

convert to an instance of `type`, which must behave like an Array

##### Inherited from

```ts
BN.toArrayLike
```

***

### bitLength()

```ts
bitLength(): number
```

#### Returns

`number`

#### Description

get number of bits occupied

#### Inherited from

```ts
BN.bitLength
```

***

### zeroBits()

```ts
zeroBits(): number
```

#### Returns

`number`

#### Description

return number of less-significant consequent zero bits (example: 1010000 has 4 zero bits)

#### Inherited from

```ts
BN.zeroBits
```

***

### byteLength()

```ts
byteLength(): number
```

#### Returns

`number`

#### Description

return number of bytes occupied

#### Inherited from

```ts
BN.byteLength
```

***

### isNeg()

```ts
isNeg(): boolean
```

#### Returns

`boolean`

#### Description

true if the number is negative

#### Inherited from

```ts
BN.isNeg
```

***

### isEven()

```ts
isEven(): boolean
```

#### Returns

`boolean`

#### Description

check if value is even

#### Inherited from

```ts
BN.isEven
```

***

### isOdd()

```ts
isOdd(): boolean
```

#### Returns

`boolean`

#### Description

check if value is odd

#### Inherited from

```ts
BN.isOdd
```

***

### isZero()

```ts
isZero(): boolean
```

#### Returns

`boolean`

#### Description

check if value is zero

#### Inherited from

```ts
BN.isZero
```

***

### cmp()

```ts
cmp(b: BN): -1 | 0 | 1
```

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `b` | `BN` |

#### Returns

`-1` \| `0` \| `1`

#### Description

compare numbers and return `-1 (a < b)`, `0 (a == b)`, or `1 (a > b)` depending on the comparison result

#### Inherited from

```ts
BN.cmp
```

***

### ucmp()

```ts
ucmp(b: BN): -1 | 0 | 1
```

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `b` | `BN` |

#### Returns

`-1` \| `0` \| `1`

#### Description

compare numbers and return `-1 (a < b)`, `0 (a == b)`, or `1 (a > b)` depending on the comparison result

#### Inherited from

```ts
BN.ucmp
```

***

### cmpn()

```ts
cmpn(b: number): -1 | 0 | 1
```

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `b` | `number` |

#### Returns

`-1` \| `0` \| `1`

#### Description

compare numbers and return `-1 (a < b)`, `0 (a == b)`, or `1 (a > b)` depending on the comparison result

#### Inherited from

```ts
BN.cmpn
```

***

### lt()

```ts
lt(b: BN): boolean
```

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `b` | `BN` |

#### Returns

`boolean`

#### Description

a less than b

#### Inherited from

```ts
BN.lt
```

***

### ltn()

```ts
ltn(b: number): boolean
```

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `b` | `number` |

#### Returns

`boolean`

#### Description

a less than b

#### Inherited from

```ts
BN.ltn
```

***

### lte()

```ts
lte(b: BN): boolean
```

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `b` | `BN` |

#### Returns

`boolean`

#### Description

a less than or equals b

#### Inherited from

```ts
BN.lte
```

***

### lten()

```ts
lten(b: number): boolean
```

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `b` | `number` |

#### Returns

`boolean`

#### Description

a less than or equals b

#### Inherited from

```ts
BN.lten
```

***

### gt()

```ts
gt(b: BN): boolean
```

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `b` | `BN` |

#### Returns

`boolean`

#### Description

a greater than b

#### Inherited from

```ts
BN.gt
```

***

### gtn()

```ts
gtn(b: number): boolean
```

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `b` | `number` |

#### Returns

`boolean`

#### Description

a greater than b

#### Inherited from

```ts
BN.gtn
```

***

### gte()

```ts
gte(b: BN): boolean
```

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `b` | `BN` |

#### Returns

`boolean`

#### Description

a greater than or equals b

#### Inherited from

```ts
BN.gte
```

***

### gten()

```ts
gten(b: number): boolean
```

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `b` | `number` |

#### Returns

`boolean`

#### Description

a greater than or equals b

#### Inherited from

```ts
BN.gten
```

***

### eq()

```ts
eq(b: BN): boolean
```

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `b` | `BN` |

#### Returns

`boolean`

#### Description

a equals b

#### Inherited from

```ts
BN.eq
```

***

### eqn()

```ts
eqn(b: number): boolean
```

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `b` | `number` |

#### Returns

`boolean`

#### Description

a equals b

#### Inherited from

```ts
BN.eqn
```

***

### toTwos()

```ts
toTwos(width: number): BN
```

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `width` | `number` |

#### Returns

`BN`

#### Description

convert to two's complement representation, where width is bit width

#### Inherited from

```ts
BN.toTwos
```

***

### fromTwos()

```ts
fromTwos(width: number): BN
```

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `width` | `number` |

#### Returns

`BN`

#### Description

convert from two's complement representation, where width is the bit width

#### Inherited from

```ts
BN.fromTwos
```

***

### neg()

```ts
neg(): BN
```

#### Returns

`BN`

#### Description

negate sign

#### Inherited from

```ts
BN.neg
```

***

### ineg()

```ts
ineg(): BN
```

#### Returns

`BN`

#### Description

negate sign

#### Inherited from

```ts
BN.ineg
```

***

### abs()

```ts
abs(): BN
```

#### Returns

`BN`

#### Description

absolute value

#### Inherited from

```ts
BN.abs
```

***

### iabs()

```ts
iabs(): BN
```

#### Returns

`BN`

#### Description

absolute value

#### Inherited from

```ts
BN.iabs
```

***

### iadd()

```ts
iadd(b: BN): BN
```

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `b` | `BN` |

#### Returns

`BN`

#### Description

addition

#### Inherited from

```ts
BN.iadd
```

***

### addn()

```ts
addn(b: number): BN
```

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `b` | `number` |

#### Returns

`BN`

#### Description

addition

#### Inherited from

```ts
BN.addn
```

***

### iaddn()

```ts
iaddn(b: number): BN
```

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `b` | `number` |

#### Returns

`BN`

#### Description

addition

#### Inherited from

```ts
BN.iaddn
```

***

### isub()

```ts
isub(b: BN): BN
```

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `b` | `BN` |

#### Returns

`BN`

#### Description

subtraction

#### Inherited from

```ts
BN.isub
```

***

### subn()

```ts
subn(b: number): BN
```

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `b` | `number` |

#### Returns

`BN`

#### Description

subtraction

#### Inherited from

```ts
BN.subn
```

***

### isubn()

```ts
isubn(b: number): BN
```

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `b` | `number` |

#### Returns

`BN`

#### Description

subtraction

#### Inherited from

```ts
BN.isubn
```

***

### imul()

```ts
imul(b: BN): BN
```

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `b` | `BN` |

#### Returns

`BN`

#### Description

multiply

#### Inherited from

```ts
BN.imul
```

***

### muln()

```ts
muln(b: number): BN
```

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `b` | `number` |

#### Returns

`BN`

#### Description

multiply

#### Inherited from

```ts
BN.muln
```

***

### imuln()

```ts
imuln(b: number): BN
```

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `b` | `number` |

#### Returns

`BN`

#### Description

multiply

#### Inherited from

```ts
BN.imuln
```

***

### sqr()

```ts
sqr(): BN
```

#### Returns

`BN`

#### Description

square

#### Inherited from

```ts
BN.sqr
```

***

### isqr()

```ts
isqr(): BN
```

#### Returns

`BN`

#### Description

square

#### Inherited from

```ts
BN.isqr
```

***

### pow()

```ts
pow(b: BN): BN
```

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `b` | `BN` |

#### Returns

`BN`

#### Description

raise `a` to the power of `b`

#### Inherited from

```ts
BN.pow
```

***

### div()

```ts
div(b: BN): BN
```

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `b` | `BN` |

#### Returns

`BN`

#### Description

divide

#### Inherited from

```ts
BN.div
```

***

### divn()

```ts
divn(b: number): BN
```

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `b` | `number` |

#### Returns

`BN`

#### Description

divide

#### Inherited from

```ts
BN.divn
```

***

### idivn()

```ts
idivn(b: number): BN
```

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `b` | `number` |

#### Returns

`BN`

#### Description

divide

#### Inherited from

```ts
BN.idivn
```

***

### divmod()

```ts
divmod(
   b: BN, 
   mode?: "div" | "mod", 
   positive?: boolean): object
```

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `b` | `BN` |
| `mode`? | `"div"` \| `"mod"` |
| `positive`? | `boolean` |

#### Returns

`object`

##### div

```ts
div: BN;
```

##### mod

```ts
mod: BN;
```

#### Description

division with remainder

#### Inherited from

```ts
BN.divmod
```

***

### ~~modn()~~

```ts
modn(b: number): number
```

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `b` | `number` |

#### Returns

`number`

#### Deprecated

#### Description

reduct

#### Inherited from

```ts
BN.modn
```

***

### modrn()

```ts
modrn(b: number): number
```

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `b` | `number` |

#### Returns

`number`

#### Description

reduct

#### Inherited from

```ts
BN.modrn
```

***

### divRound()

```ts
divRound(b: BN): BN
```

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `b` | `BN` |

#### Returns

`BN`

#### Description

rounded division

#### Inherited from

```ts
BN.divRound
```

***

### or()

```ts
or(b: BN): BN
```

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `b` | `BN` |

#### Returns

`BN`

#### Description

or

#### Inherited from

```ts
BN.or
```

***

### ior()

```ts
ior(b: BN): BN
```

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `b` | `BN` |

#### Returns

`BN`

#### Description

or

#### Inherited from

```ts
BN.ior
```

***

### uor()

```ts
uor(b: BN): BN
```

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `b` | `BN` |

#### Returns

`BN`

#### Description

or

#### Inherited from

```ts
BN.uor
```

***

### iuor()

```ts
iuor(b: BN): BN
```

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `b` | `BN` |

#### Returns

`BN`

#### Description

or

#### Inherited from

```ts
BN.iuor
```

***

### and()

```ts
and(b: BN): BN
```

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `b` | `BN` |

#### Returns

`BN`

#### Description

and

#### Inherited from

```ts
BN.and
```

***

### iand()

```ts
iand(b: BN): BN
```

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `b` | `BN` |

#### Returns

`BN`

#### Description

and

#### Inherited from

```ts
BN.iand
```

***

### uand()

```ts
uand(b: BN): BN
```

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `b` | `BN` |

#### Returns

`BN`

#### Description

and

#### Inherited from

```ts
BN.uand
```

***

### iuand()

```ts
iuand(b: BN): BN
```

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `b` | `BN` |

#### Returns

`BN`

#### Description

and

#### Inherited from

```ts
BN.iuand
```

***

### andln()

```ts
andln(b: number): BN
```

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `b` | `number` |

#### Returns

`BN`

#### Description

and (NOTE: `andln` is going to be replaced with `andn` in future)

#### Inherited from

```ts
BN.andln
```

***

### xor()

```ts
xor(b: BN): BN
```

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `b` | `BN` |

#### Returns

`BN`

#### Description

xor

#### Inherited from

```ts
BN.xor
```

***

### ixor()

```ts
ixor(b: BN): BN
```

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `b` | `BN` |

#### Returns

`BN`

#### Description

xor

#### Inherited from

```ts
BN.ixor
```

***

### uxor()

```ts
uxor(b: BN): BN
```

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `b` | `BN` |

#### Returns

`BN`

#### Description

xor

#### Inherited from

```ts
BN.uxor
```

***

### iuxor()

```ts
iuxor(b: BN): BN
```

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `b` | `BN` |

#### Returns

`BN`

#### Description

xor

#### Inherited from

```ts
BN.iuxor
```

***

### setn()

```ts
setn(b: number, value: boolean | 0 | 1): BN
```

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `b` | `number` |
| `value` | `boolean` \| `0` \| `1` |

#### Returns

`BN`

#### Description

set specified bit to value

#### Inherited from

```ts
BN.setn
```

***

### shln()

```ts
shln(b: number): BN
```

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `b` | `number` |

#### Returns

`BN`

#### Description

shift left

#### Inherited from

```ts
BN.shln
```

***

### ishln()

```ts
ishln(b: number): BN
```

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `b` | `number` |

#### Returns

`BN`

#### Description

shift left

#### Inherited from

```ts
BN.ishln
```

***

### ushln()

```ts
ushln(b: number): BN
```

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `b` | `number` |

#### Returns

`BN`

#### Description

shift left

#### Inherited from

```ts
BN.ushln
```

***

### iushln()

```ts
iushln(b: number): BN
```

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `b` | `number` |

#### Returns

`BN`

#### Description

shift left

#### Inherited from

```ts
BN.iushln
```

***

### shrn()

```ts
shrn(b: number): BN
```

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `b` | `number` |

#### Returns

`BN`

#### Description

shift right

#### Inherited from

```ts
BN.shrn
```

***

### ishrn()

```ts
ishrn(b: number): BN
```

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `b` | `number` |

#### Returns

`BN`

#### Description

shift right (unimplemented https://github.com/indutny/bn.js/blob/master/lib/bn.js#L2086)

#### Inherited from

```ts
BN.ishrn
```

***

### ushrn()

```ts
ushrn(b: number): BN
```

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `b` | `number` |

#### Returns

`BN`

#### Description

shift right

#### Inherited from

```ts
BN.ushrn
```

***

### iushrn()

```ts
iushrn(b: number): BN
```

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `b` | `number` |

#### Returns

`BN`

#### Description

shift right

#### Inherited from

```ts
BN.iushrn
```

***

### testn()

```ts
testn(b: number): boolean
```

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `b` | `number` |

#### Returns

`boolean`

#### Description

test if specified bit is set

#### Inherited from

```ts
BN.testn
```

***

### maskn()

```ts
maskn(b: number): BN
```

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `b` | `number` |

#### Returns

`BN`

#### Description

clear bits with indexes higher or equal to `b`

#### Inherited from

```ts
BN.maskn
```

***

### imaskn()

```ts
imaskn(b: number): BN
```

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `b` | `number` |

#### Returns

`BN`

#### Description

clear bits with indexes higher or equal to `b`

#### Inherited from

```ts
BN.imaskn
```

***

### bincn()

```ts
bincn(b: number): BN
```

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `b` | `number` |

#### Returns

`BN`

#### Description

add `1 << b` to the number

#### Inherited from

```ts
BN.bincn
```

***

### notn()

```ts
notn(w: number): BN
```

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `w` | `number` |

#### Returns

`BN`

#### Description

not (for the width specified by `w`)

#### Inherited from

```ts
BN.notn
```

***

### inotn()

```ts
inotn(w: number): BN
```

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `w` | `number` |

#### Returns

`BN`

#### Description

not (for the width specified by `w`)

#### Inherited from

```ts
BN.inotn
```

***

### gcd()

```ts
gcd(b: BN): BN
```

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `b` | `BN` |

#### Returns

`BN`

#### Description

GCD

#### Inherited from

```ts
BN.gcd
```

***

### egcd()

```ts
egcd(b: BN): object
```

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `b` | `BN` |

#### Returns

`object`

##### a

```ts
a: BN;
```

##### b

```ts
b: BN;
```

##### gcd

```ts
gcd: BN;
```

#### Description

Extended GCD results `({ a: ..., b: ..., gcd: ... })`

#### Inherited from

```ts
BN.egcd
```

***

### invm()

```ts
invm(b: BN): BN
```

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `b` | `BN` |

#### Returns

`BN`

#### Description

inverse `a` modulo `b`

#### Inherited from

```ts
BN.invm
```

***

### toRed()

```ts
toRed(reductionContext: ReductionContext): RedBN
```

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `reductionContext` | `ReductionContext` |

#### Returns

`RedBN`

#### Description

Convert number to red

#### Inherited from

```ts
BN.toRed
```

***

### add()

```ts
add(b: BN): BNExtended
```

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `b` | `BN` |

#### Returns

[`BNExtended`](BNExtended.md)

#### Description

addition

#### Overrides

```ts
BN.add
```

***

### sub()

```ts
sub(b: BN): BNExtended
```

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `b` | `BN` |

#### Returns

[`BNExtended`](BNExtended.md)

#### Description

subtraction

#### Overrides

```ts
BN.sub
```

***

### mul()

```ts
mul(b: BN): BNExtended
```

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `b` | `BN` |

#### Returns

[`BNExtended`](BNExtended.md)

#### Description

multiply

#### Overrides

```ts
BN.mul
```

***

### mod()

```ts
mod(b: BN): BNExtended
```

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `b` | `BN` |

#### Returns

[`BNExtended`](BNExtended.md)

#### Description

reduct

#### Overrides

```ts
BN.mod
```

***

### umod()

```ts
umod(b: BN): BNExtended
```

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `b` | `BN` |

#### Returns

[`BNExtended`](BNExtended.md)

#### Description

reduct

#### Overrides

```ts
BN.umod
```

***

### toNumber()

```ts
toNumber(): number
```

#### Returns

`number`

#### Description

convert to Javascript Number (limited to 53 bits)

#### Overrides

```ts
BN.toNumber
```

***

### toBigInt()

```ts
toBigInt(): bigint
```

#### Returns

`bigint`

***

### toBuffer()

```ts
toBuffer(opts?: Endianness | BNOptions, length?: number): Buffer
```

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `opts`? | `Endianness` \| [`BNOptions`](../interfaces/BNOptions.md) |
| `length`? | `number` |

#### Returns

`Buffer`

#### Description

convert to Node.js Buffer (if available). For compatibility with browserify and similar tools, use this instead: a.toArrayLike(Buffer, endian, length)

#### Overrides

```ts
BN.toBuffer
```

***

### toScriptNumBuffer()

```ts
toScriptNumBuffer(): Buffer
```

The corollary to the above, with the notable exception that we do not throw
an error if the output is larger than four bytes. (Which can happen if
performing a numerical operation that results in an overflow to more than 4
bytes).

#### Returns

`Buffer`

***

### toScriptBigNumBuffer()

```ts
toScriptBigNumBuffer(): Buffer
```

#### Returns

`Buffer`

***

### getSize()

```ts
getSize(): number
```

#### Returns

`number`

***

### safeAdd()

```ts
safeAdd(bigNumToAdd: BNExtended, maxSize: number): BNExtended
```

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `bigNumToAdd` | [`BNExtended`](BNExtended.md) |
| `maxSize` | `number` |

#### Returns

[`BNExtended`](BNExtended.md)

***

### safeSub()

```ts
safeSub(bigNumToSubtract: BNExtended, maxSize: number): BNExtended
```

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `bigNumToSubtract` | [`BNExtended`](BNExtended.md) |
| `maxSize` | `number` |

#### Returns

[`BNExtended`](BNExtended.md)

***

### safeMul()

```ts
safeMul(bigNumToMultiply: BNExtended, maxSize: number): BNExtended
```

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `bigNumToMultiply` | [`BNExtended`](BNExtended.md) |
| `maxSize` | `number` |

#### Returns

[`BNExtended`](BNExtended.md)
