[**libnexa-ts**](../index.md)

***

[libnexa-ts](../index.md) / UnspentOutput

# Class: UnspentOutput

## Constructors

### new UnspentOutput()

```ts
new UnspentOutput(utxo: UTXO): UnspentOutput
```

Represents an unspent output information: its outpoint hash, associated amount/sats,
associated script or address with optional group info,

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `utxo` | [`UTXO`](../interfaces/UTXO.md) | the utxo object |

#### Returns

[`UnspentOutput`](UnspentOutput.md)

## Properties

| Property | Modifier | Type |
| ------ | ------ | ------ |
| <a id="outpoint"></a> `outpoint` | `public` | `string` |
| <a id="scriptpubkey"></a> `scriptPubKey` | `public` | [`Script`](Script.md) |
| <a id="satoshis"></a> `satoshis` | `public` | `bigint` |
| <a id="tojson"></a> `toJSON` | `public` | () => [`UTXO`](../interfaces/UTXO.md) |

## Methods

### fromObject()

```ts
static fromObject(data: UTXO): UnspentOutput
```

Deserialize an UnspentOutput from an object

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `data` | [`UTXO`](../interfaces/UTXO.md) |  |

#### Returns

[`UnspentOutput`](UnspentOutput.md)

***

### toString()

```ts
toString(): string
```

String representation: just the outpoint hash

#### Returns

`string`

***

### inspect()

```ts
inspect(): string
```

Provide an informative output when displaying this object in the console

#### Returns

`string`

***

### toObject()

```ts
toObject(): UTXO
```

Returns a plain object (no prototype or methods) with the associated info for this utxo

#### Returns

[`UTXO`](../interfaces/UTXO.md)
