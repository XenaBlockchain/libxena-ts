[**libnexa-ts**](../index.md)

***

[libnexa-ts](../index.md) / IPublicKey

# Interface: IPublicKey

## Properties

| Property | Type |
| ------ | ------ |
| <a id="point"></a> `point` | [`Point`](../classes/Point.md) |
| <a id="compressed"></a> `compressed?` | `boolean` |
| <a id="network"></a> `network?` | [`Network`](../classes/Network.md) |

## Methods

### toString()

```ts
toString(): string
```

#### Returns

`string`

***

### toJSON()

```ts
toJSON(): PublicKeyDto
```

#### Returns

[`PublicKeyDto`](PublicKeyDto.md)

***

### toObject()

```ts
toObject(): PublicKeyDto
```

#### Returns

[`PublicKeyDto`](PublicKeyDto.md)

***

### toDER()

```ts
toDER(): Buffer
```

#### Returns

`Buffer`

***

### toBuffer()

```ts
toBuffer(): Buffer
```

#### Returns

`Buffer`

***

### inspect()

```ts
inspect(): string
```

#### Returns

`string`
