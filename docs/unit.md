# Unit Utils

`UnitUtils` is a utility for handling convertion of nexa units. We strongly recommend to always use satoshis to represent amount inside your application and only convert them to other units in the front-end.

To understand the need of using the `UnitUtils` class when dealing with unit conversions, see this example:

```
> 81.99 * 100000 // wrong
8198999.999999999
> import { UnitUtils } from 'libnexa-ts';
> let decimals = 5;
> UnitUtils.parseUnits('81.99', decimals) // correct
8199000n // finest value as bigint
```

## Supported units

The supported units are MEX, KEX and NEXA. The decimal point for each unit can be found as members of the UnitType enum.

```ts
let mexDecimals = UnitType.MEX;  // 8
let kexDecimals = UnitType.KEX;  // 5
let nexDecimals = UnitType.NEXA; // 2
let satsDecimals = 0;            // the finest value
```

## Conversion

Converting amount as string to finest sats amount can be achived with `parse` methods:

```ts
let balance = '123.45';

// from NEXA amount
UnitUtils.parseUnits(balance, UnitType.NEXA); // 12345n sats (as bigint)
UnitUtils.parseUnits(balance, 2);             // 12345n sats
UnitUtils.parseNEXA(balance);                 // 12345n sats

// from KEX amount
UnitUtils.parseUnits(balance, UnitType.KEX); // 12345000n sats
UnitUtils.parseUnits(balance, 5);            // 12345000n sats

// from MEX amount
UnitUtils.parseUnits(balance, UnitType.MEX); // 12345000000n sats
UnitUtils.parseUnits(balance, 8);            // 12345000000n sats
```

Converting sats as bigint to amount string with decimal point can be achived with `format` methods:

```ts
let balance = 12345; // sats amount (can be number, string or bigint)

// to NEXA amount
UnitUtils.formatUnits(balance, UnitType.NEXA); // '123.45' (as string)
UnitUtils.formatUnits(balance, 2);             // '123.45'
UnitUtils.formatNEXA(balance);                 // '123.45'

// to KEX amount
UnitUtils.formatUnits(balance, UnitType.KEX); // '0.12345'
UnitUtils.formatUnits(balance, 5);            // '0.12345'

// to MEX amount
UnitUtils.formatUnits(balance, UnitType.MEX); // '0.00012345'
UnitUtils.formatUnits(balance, 8);            // '0.00012345'
```

Note that `formatNEXA` and `parseNEXA` are are the same as using `UnitType.NEXA` in `formatUnits` and `parseUnits` methods.

## API Reference
- [UnitUtils](api/classes/UnitUtils.md)
