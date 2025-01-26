# Networks

Libnexa-ts provides support for the main Nexa network as well as for `nexatest`, the current test blockchain. We encourage the use of `Networks.mainnet` and `Networks.testnet` as constants. Note that the library sometimes may check for equality against this object. Please avoid creating a deep copy of this object.

The `Networks` variable (alias to the `NetworkManager` singleton service) has a function, `get(...)` that returns an instance of a `Network` or `undefined`. The only argument to this function is some kind of identifier of the network: either its name, a reference to a Network object, or a number used as a magic constant to identify the network.

## Setting the Default Network

Most projects will only need to work with one of the networks. The value of `Networks.defaultNetwork` can be set to `Networks.testnet` if the project will need to only to work on testnet (the default is `Networks.mainnet`).

To change default network to testnet:
```ts
import { Networks } from 'libnexa-ts';

Networks.defaultNetwork = Networks.testnet;

// OR use NetworkManager singleton instance directly
import { NetworkManager } from 'libnexa-ts';

NetworkManager.defaultNetwork = NetworkManager.testnet;
```

## Network constants

The functionality of testnet and mainnet is mostly similar (except for some relaxed block validation rules on testnet). They differ in the constants being used for human representation of base58 encoded strings. These are sometimes referred to as "version" constants. See `Network` class in API reference.

## API Reference
- [Network](api/classes/Network.md)
- [NetworkManager](api/classes/NetworkManager.md)
- [Networks const variable](api/variables/Networks.md)
