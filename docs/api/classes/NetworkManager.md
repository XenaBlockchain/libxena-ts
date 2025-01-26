[**libnexa-ts**](../index.md)

***

[libnexa-ts](../index.md) / NetworkManager

# Class: NetworkManager

NetworkManager is a singleton service, containing map values that correspond to version
numbers for each nexa network. Currently only supporting "mainnet"
(a.k.a. "livenet") and "testnet", with option to add custom networks.

## Remarks

should be used as singletone.

## See

[`NetworkManager.getInstance`](NetworkManager.md#getinstance)

## Constructors

### new NetworkManager()

```ts
new NetworkManager(): NetworkManager
```

#### Returns

[`NetworkManager`](NetworkManager.md)

## Accessors

### mainnet

#### Get Signature

```ts
get mainnet(): Network
```

##### Returns

[`Network`](Network.md)

***

### livenet

#### Get Signature

```ts
get livenet(): Network
```

##### Deprecated

use mainnet

##### Returns

[`Network`](Network.md)

***

### testnet

#### Get Signature

```ts
get testnet(): Network
```

##### Returns

[`Network`](Network.md)

***

### defaultNetwork

#### Get Signature

```ts
get defaultNetwork(): Network
```

##### Returns

[`Network`](Network.md)

#### Set Signature

```ts
set defaultNetwork(network: Network): void
```

##### Parameters

| Parameter | Type |
| ------ | ------ |
| `network` | [`Network`](Network.md) |

##### Returns

`void`

## Methods

### getInstance()

```ts
static getInstance(): NetworkManager
```

#### Returns

[`NetworkManager`](NetworkManager.md)

the singleton instance of NetworkManager

***

### get()

```ts
get(arg?: number | Networkish, key?: keyof Network): undefined | Network
```

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `arg`? | `number` \| [`Networkish`](../type-aliases/Networkish.md) |
| `key`? | keyof Network |

#### Returns

`undefined` \| [`Network`](Network.md)

***

### create()

```ts
create(network: NetworkParams): Network
```

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `network` | [`NetworkParams`](../interfaces/NetworkParams.md) |

#### Returns

[`Network`](Network.md)

***

### add()

```ts
add(network: 
  | Network
  | NetworkParams): void
```

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `network` | \| [`Network`](Network.md) \| [`NetworkParams`](../interfaces/NetworkParams.md) |

#### Returns

`void`

***

### remove()

```ts
remove(network: 
  | NetworkParams
  | Networkish): void
```

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `network` | \| [`NetworkParams`](../interfaces/NetworkParams.md) \| [`Networkish`](../type-aliases/Networkish.md) |

#### Returns

`void`
