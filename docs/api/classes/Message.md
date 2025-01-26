[**libnexa-ts**](../index.md)

***

[libnexa-ts](../index.md) / Message

# Class: Message

## Implements

- [`IMessage`](../interfaces/IMessage.md)

## Constructors

### new Message()

```ts
new Message(message: string): Message
```

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `message` | `string` |

#### Returns

[`Message`](Message.md)

## Properties

| Property | Modifier | Type |
| ------ | ------ | ------ |
| <a id="magic_bytes"></a> `MAGIC_BYTES` | `readonly` | `Buffer`\<`ArrayBuffer`\> |
| <a id="message-2"></a> `message` | `public` | `string` |
| <a id="error"></a> `error?` | `public` | `string` |

## Methods

### fromString()

```ts
static fromString(str: string): Message
```

Instantiate a message from a message string

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `str` | `string` | A string of the message |

#### Returns

[`Message`](Message.md)

A new instance of a Message

***

### fromJSON()

```ts
static fromJSON(json: string | IMessage): Message
```

Instantiate a message from JSON

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `json` | `string` \| [`IMessage`](../interfaces/IMessage.md) | An JSON string or Object with keys: message |

#### Returns

[`Message`](Message.md)

A new instance of a Message

***

### sign()

```ts
sign(privateKey: PrivateKey): string
```

Will sign a message with a given private key.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `privateKey` | [`PrivateKey`](PrivateKey.md) | An instance of PrivateKey |

#### Returns

`string`

A base64 encoded compact signature

***

### verify()

```ts
verify(nexaAddress: string | Address, signatureString: string): boolean
```

Will return a boolean of the signature is valid for a given nexa address.
If it isn't valid, the specific reason is accessible via the "error" member.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `nexaAddress` | `string` \| [`Address`](Address.md) | A nexa address |
| `signatureString` | `string` | A base64 encoded compact signature |

#### Returns

`boolean`

***

### toObject()

```ts
toObject(): IMessage
```

#### Returns

[`IMessage`](../interfaces/IMessage.md)

A plain object with the message information

***

### toJSON()

```ts
toJSON(): string
```

#### Returns

`string`

A JSON representation as string of the message information

***

### toString()

```ts
toString(): string
```

Will return a the string representation of the message

#### Returns

`string`

***

### inspect()

```ts
inspect(): string
```

Will return a string formatted for the console

#### Returns

`string`
