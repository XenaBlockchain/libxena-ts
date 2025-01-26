[**libnexa-ts**](../index.md)

***

[libnexa-ts](../index.md) / IPrivateKey

# Interface: IPrivateKey

## Properties

| Property | Type |
| ------ | ------ |
| <a id="compressed"></a> `compressed` | `boolean` |
| <a id="network"></a> `network` | [`Network`](../classes/Network.md) |
| <a id="bn"></a> `bn` | [`BNExtended`](../classes/BNExtended.md) |

## Accessors

### publicKey

#### Get Signature

```ts
get publicKey(): IPublicKey
```

##### Returns

[`IPublicKey`](IPublicKey.md)

## Methods

### toString()

```ts
toString(): string
```

#### Returns

`string`

***

### toWIF()

```ts
toWIF(): string
```

#### Returns

`string`

***

### toBigNumber()

```ts
toBigNumber(): BNExtended
```

#### Returns

[`BNExtended`](../classes/BNExtended.md)

***

### toBuffer()

```ts
toBuffer(): Buffer
```

#### Returns

`Buffer`

***

### toBufferNoPadding()

```ts
toBufferNoPadding(): Buffer
```

#### Returns

`Buffer`

***

### toPublicKey()

```ts
toPublicKey(): IPublicKey
```

#### Returns

[`IPublicKey`](IPublicKey.md)

***

### toJSON()

```ts
toJSON(): PrivateKeyDto
```

#### Returns

[`PrivateKeyDto`](PrivateKeyDto.md)

***

### toObject()

```ts
toObject(): PrivateKeyDto
```

#### Returns

[`PrivateKeyDto`](PrivateKeyDto.md)

***

### inspect()

```ts
inspect(): string
```

#### Returns

`string`
