[**libnexa-ts**](../index.md)

***

[libnexa-ts](../index.md) / GroupToken

# Class: GroupToken

A util class with methods for group tokenization.

## Constructors

### new GroupToken()

```ts
new GroupToken(): GroupToken
```

#### Returns

[`GroupToken`](GroupToken.md)

## Properties

| Property | Modifier | Type | Default value | Description |
| ------ | ------ | ------ | ------ | ------ |
| <a id="parent_group_id_size"></a> `PARENT_GROUP_ID_SIZE` | `readonly` | `32` | `32` | - |
| <a id="authflags"></a> `authFlags` | `readonly` | `object` | `undefined` | - |
| `authFlags.AUTHORITY` | `public` | `bigint` | `undefined` | Is this a controller utxo (forces negative number in amount) |
| `authFlags.MINT` | `public` | `bigint` | `undefined` | Can mint tokens |
| `authFlags.MELT` | `public` | `bigint` | `undefined` | Can melt tokens |
| `authFlags.BATON` | `public` | `bigint` | `undefined` | Can create authorities |
| `authFlags.RESCRIPT` | `public` | `bigint` | `undefined` | Can change the redeem script |
| `authFlags.SUBGROUP` | `public` | `bigint` | `undefined` | Can create subgroups |
| `authFlags.NONE` | `public` | `bigint` | `0n` | - |
| `authFlags.ALL_FLAG_BITS` | `public` | `bigint` | `undefined` | - |
| `authFlags.ACTIVE_FLAG_BITS` | `public` | `bigint` | `undefined` | Has all permissions |
| `authFlags.RESERVED_FLAG_BITS` | `public` | `bigint` | `undefined` | - |

## Methods

### findGroupId()

```ts
static findGroupId(
   outpoint: string | Buffer, 
   opReturnScript: null | Buffer | Script, 
   authFlag: bigint, 
   idFlag: GroupIdFlag): GroupIdData
```

Calculate a group ID based on the provided inputs. Pass 'null' to opReturnScript if there is not
going to be an OP_RETURN output in the transaction.

#### Parameters

| Parameter | Type | Default value | Description |
| ------ | ------ | ------ | ------ |
| `outpoint` | `string` \| `Buffer` | `undefined` | The input outpoint hash hex or buffer |
| `opReturnScript` | `null` \| `Buffer` \| [`Script`](Script.md) | `undefined` | opReturn output script |
| `authFlag` | `bigint` | `undefined` | group authority flag (use [GroupToken.authFlags](GroupToken.md#authflags)) |
| `idFlag` | [`GroupIdFlag`](../enumerations/GroupIdFlag.md) | `GroupIdFlag.DEFAULT` | group id flag |

#### Returns

[`GroupIdData`](../interfaces/GroupIdData.md)

Object with group id hash buffer and the nonce bigint

***

### generateSubgroupId()

```ts
static generateSubgroupId(group: string | Buffer | Address, data: string | number | Buffer): Buffer
```

Translates a group and additional data into a subgroup identifier

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `group` | `string` \| `Buffer` \| [`Address`](Address.md) | the group/token address or data buffer |
| `data` | `string` \| `number` \| `Buffer` | the additional data |

#### Returns

`Buffer`

the subgroup id buffer

***

### getParentGroupId()

```ts
static getParentGroupId(subgroup: string | Buffer | Address): Buffer
```

Extract the parent group from the provided subgroup.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `subgroup` | `string` \| `Buffer` \| [`Address`](Address.md) | the subgroup address or data buffer |

#### Returns

`Buffer`

the GroupId buffer

#### Remarks

If the input is a group but not subgroup, the group itself return.

***

### getAmountBuffer()

```ts
static getAmountBuffer(amount: bigint): Buffer
```

Get group amount buffer from BigInt to include in output script

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `amount` | `bigint` |  |

#### Returns

`Buffer`

***

### getAmountValue()

```ts
static getAmountValue(amountBuf: Buffer, unsigned: boolean): bigint
```

Get group amount value from Buffer

#### Parameters

| Parameter | Type | Default value | Description |
| ------ | ------ | ------ | ------ |
| `amountBuf` | `Buffer` | `undefined` | the amount buffer |
| `unsigned` | `boolean` | `false` | return value as unsigned bigint, default to false |

#### Returns

`bigint`

***

### getNonce()

```ts
static getNonce(authFlag: bigint): bigint
```

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `authFlag` | `bigint` | the utxo group quantity/authority |

#### Returns

`bigint`

the nonce

***

### hasIdFlag()

```ts
static hasIdFlag(groupId: string | Buffer | Address, groupIdFlag: GroupIdFlag): boolean
```

Check if the group id has the flag

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `groupId` | `string` \| `Buffer` \| [`Address`](Address.md) | the group id address or data buffer |
| `groupIdFlag` | [`GroupIdFlag`](../enumerations/GroupIdFlag.md) | the group id flag |

#### Returns

`boolean`

true if this group id has the flag

***

### isGroupCreation()

```ts
static isGroupCreation(
   groupId: string | Buffer | Address, 
   authFlag: bigint, 
   groupIdFlag: GroupIdFlag): boolean
```

Check if this authority and flag fit to this group creation

#### Parameters

| Parameter | Type | Default value | Description |
| ------ | ------ | ------ | ------ |
| `groupId` | `string` \| `Buffer` \| [`Address`](Address.md) | `undefined` | the group id address or data buffer |
| `authFlag` | `bigint` | `undefined` | the output group quantity/authority |
| `groupIdFlag` | [`GroupIdFlag`](../enumerations/GroupIdFlag.md) | `GroupIdFlag.DEFAULT` | optional. the group id flag |

#### Returns

`boolean`

true if this is group creation data

***

### isSubgroup()

```ts
static isSubgroup(groupId: string | Buffer | Address): boolean
```

Check if this group is is subgroup

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `groupId` | `string` \| `Buffer` \| [`Address`](Address.md) | the group id address or data buffer |

#### Returns

`boolean`

true if this group id is subgroup

***

### isAuthority()

```ts
static isAuthority(authFlag: bigint): boolean
```

Check if the group quantity/authority is Authority flag

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `authFlag` | `bigint` | the output group quantity/authority |

#### Returns

`boolean`

true if this is authority flag

***

### allowsMint()

```ts
static allowsMint(authFlag: bigint): boolean
```

Check if the group quantity/authority allows minting

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `authFlag` | `bigint` | the output group quantity/authority |

#### Returns

`boolean`

true if this flag allows minting.

***

### allowsMelt()

```ts
static allowsMelt(authFlag: bigint): boolean
```

Check if the group quantity/authority allows melting

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `authFlag` | `bigint` | the output group quantity/authority |

#### Returns

`boolean`

true if this flag allows melting.

***

### allowsRenew()

```ts
static allowsRenew(authFlag: bigint): boolean
```

Check if the group quantity/authority allows creation of new authorities

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `authFlag` | `bigint` | the output group quantity/authority |

#### Returns

`boolean`

true if this flag allows creation of authorities.

***

### allowsRescript()

```ts
static allowsRescript(authFlag: bigint): boolean
```

Check if the group quantity/authority allows rescript

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `authFlag` | `bigint` | the output group quantity/authority |

#### Returns

`boolean`

true if this flag allows rescripting.

***

### allowsSubgroup()

```ts
static allowsSubgroup(authFlag: bigint): boolean
```

Check if the group quantity/authority allows creation of subgroups

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `authFlag` | `bigint` | the output group quantity/authority |

#### Returns

`boolean`

true if this flag allows subgroups

***

### verifyJsonDoc()

```ts
static verifyJsonDoc(
   jsonDoc: string, 
   address: string | Address, 
   signature?: string): boolean
```

Verify token description document json signature

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `jsonDoc` | `string` | the json TDD as string |
| `address` | `string` \| [`Address`](Address.md) | nexa address that signed the doc |
| `signature`? | `string` | the signature string. optional - if empty, extract from jsonDoc |

#### Returns

`boolean`

true if signature match

***

### signJsonDoc()

```ts
static signJsonDoc(jsonDoc: string, privKey: PrivateKey): string
```

Sign token description document json

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `jsonDoc` | `string` | the json TDD as string |
| `privKey` | [`PrivateKey`](PrivateKey.md) | private key to sign on the doc |

#### Returns

`string`

the signature string
