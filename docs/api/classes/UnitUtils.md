[**libnexa-ts**](../index.md)

***

[libnexa-ts](../index.md) / UnitUtils

# Class: UnitUtils

Utility for handling and converting nexa units.
You can consult for different representation of a unit using it's
{format} method or the fixed unit methods like {parse}.

## Example

```ts
let nex = UnitUtils.formatNEXA(546); // "5.46"
let sats = UnitUtils.parseNEXA("5.46"); // 546n
let mex = UnitUtils.formatUnits(100000000, UnitType.MEX) // "1.00000000";
let units = UnitUtils.parseUnits('1.0', 5); // 100000n
```

## Constructors

### new UnitUtils()

```ts
new UnitUtils(): UnitUtils
```

#### Returns

[`UnitUtils`](UnitUtils.md)

## Methods

### formatUnits()

```ts
static formatUnits(value: BigNumberish, unit?: number): string
```

Converts `value` into a decimal string, assuming `unit` decimal
 places. The `unit` may be the number of decimal places or the enum of
 a unit (e.g. ``UnitType.MEX`` for 8 decimal places).

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `value` | [`BigNumberish`](../type-aliases/BigNumberish.md) |
| `unit`? | `number` |

#### Returns

`string`

***

### parseUnits()

```ts
static parseUnits(value: string, unit?: number): bigint
```

Converts the decimal string `value` to a BigInt, assuming
 `unit` decimal places. The `unit` may the number of decimal places
 or the name of a unit (e.g. ``UnitType.KEX`` for 5 decimal places).

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `value` | `string` |
| `unit`? | `number` |

#### Returns

`bigint`

***

### formatNEXA()

```ts
static formatNEXA(sats: BigNumberish): string
```

Converts `value` into a decimal string using 2 decimal places.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `sats` | [`BigNumberish`](../type-aliases/BigNumberish.md) |

#### Returns

`string`

***

### parseNEXA()

```ts
static parseNEXA(nexa: string): bigint
```

Converts the decimal string `NEXA` to a BigInt, using 2 decimal places.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `nexa` | `string` |

#### Returns

`bigint`
