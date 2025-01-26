[**libnexa-ts**](../index.md)

***

[libnexa-ts](../index.md) / IDigitalSignature

# Interface: IDigitalSignature

## Properties

| Property | Type |
| ------ | ------ |
| <a id="hashbuf"></a> `hashbuf` | `Buffer` |
| <a id="endian"></a> `endian?` | `"big"` \| `"little"` |
| <a id="privkey"></a> `privkey` | [`IPrivateKey`](IPrivateKey.md) |
| <a id="pubkey"></a> `pubkey` | [`IPublicKey`](IPublicKey.md) |
| <a id="sig"></a> `sig?` | [`ISignature`](ISignature.md) |
| <a id="verified"></a> `verified?` | `boolean` |

## Methods

### sign()

```ts
sign(): this
```

#### Returns

`this`

***

### verify()

```ts
verify(): this
```

#### Returns

`this`
