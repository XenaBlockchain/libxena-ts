[**libnexa-ts**](../index.md)

***

[libnexa-ts](../index.md) / ISignature

# Interface: ISignature

## Properties

| Property | Type |
| ------ | ------ |
| <a id="r"></a> `r` | [`BNExtended`](../classes/BNExtended.md) |
| <a id="s"></a> `s` | [`BNExtended`](../classes/BNExtended.md) |
| <a id="i"></a> `i?` | `number` |
| <a id="compressed"></a> `compressed?` | `boolean` |

## Methods

### toBuffer()

```ts
toBuffer(isSchnorr: boolean): Buffer
```

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `isSchnorr` | `boolean` |

#### Returns

`Buffer`
