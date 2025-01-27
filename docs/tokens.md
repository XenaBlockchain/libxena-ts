# Groups and Tokens

Groups are core concepts in the Nexa ecosystem, allowing for the creation, management, and transfer of custom assets (Tokens / NFTs). Using the `GroupToken` class, you can perform a variety of operations.

For a technical overview and detailed breakdown of all the options, refer to the official [Nexa Group Tokenization](https://spec.nexa.org/tokens/grouptokens/) docs.

## Create a Group Token

Creation of tokens require calculation of the Group ID (the token address and the creation nonce), Token Description output and authority permission.
This information required to build transaction that will create the Group on the network.

### Build a Token Description

Token Description is a OP_RETURN output script that define the properties on the blockchain.

```ts
// legacy token with document json
let legacyDescription = ScriptFactory.buildTokenDescriptionLegacy(ticker, name, docUrl, docHash, decimals);

// NRC1 token with document json inside a zip file
let nrc1Description = ScriptFactory.buildTokenDescription(ticker, name, zipURL, zipHash, decimals);

// NRC2 nft collection with document json inside a zip file
let nrc2Description = ScriptFactory.buildNFTCollectionDescription(ticker, name, zipURL, zipHash);

// NRC3 nft that belong to NRC2 collection
let nrc3Description = ScriptFactory.buildNFTDescription(zipURL, zipHash);
```

See the official [Nexa Token Description Document](https://spec.nexa.org/tokens/tokenDescription/) for a technical overview and detailed breakdown.

### Calculate Group ID

To calculate the Group ID, the info of the transaction that going to create it is needed.

```ts
let outpoint = firstInputOutpointHash; // the first input from the tx
let decriptionScript = nrcDescription; // the Token Description script

// we use the ACTIVE_FLAG_BITS to give the group all authorities permissions
let groupId = GroupToken.findGroupId(outpoint, decriptionScript, GroupToken.authFlags.ACTIVE_FLAG_BITS);

let groupHex = groupId.hashBuffer.toString('hex'); // the token address hex
```

The `groupId` object return information on the `hashBuffer` to create address and information of the `nonce` for the creation transaction.

### Create in Transaction

To actual create the token, need to build a transaction and broadcast it to the network.

```ts
// the token address. toString() will five address like `nexa:t...`
let groupAddress = new Address(groupId.hashBuffer, 'mainnet', AddressType.GroupIdAddress);

// required auth from groupId creation with the nonce
let groupAuthority = GroupToken.authFlags.ACTIVE_FLAG_BITS | groupId.nonce;

let transaction = new TransactionBuilder()
    // Feed information about what unspent output to use
    // This utxo also provided its outpoint hash to the group id craetion
    .from(utxo)
    // Set the token description OP_RETURN script as first output
    // Using 2nd arg `true` meaning we include full script we already created
    .addData(decriptionScript, true)
    // Add output with the group information
    .to(myAddress, Transaction.DUST_AMOUNT, groupAddress, groupAuthority)
    // Sets up a change address where the rest of the funds will go
    .change(myAddress)
    // Set locktime to the current block height
    .lockUntilBlockHeight(blockTip)
    // Signs the transaction
    .sign(privkey)
    .build() 
```

## Checking Authorities

On Nexa blockchain, the transaction output `scriptPubKey` for tokens have `quantity` field, for example:

```json
"scriptPubKey": {
  "asm": "...",
  "hex": "...",
  "type": "scripttemplate",
  "scriptHash": "pay2pubkeytemplate",
  "argsHash": "...",
  "group": "...",
  "groupQuantity": -288230376151658312,
  "groupAuthority": 18158513697557893304,
  "addresses": [
    "..."
  ]
},
```

Negative number means its authority, positive number means its token amount, like sending 1000 tokens will show as `groupQuantity: 1000`

`GroupToken` class provide APIs to check what the authority permissions include.

```ts
// must use bigint to maintain precision
let auth = BigInt('-288230376151658312');

GroupToken.allowsMint(auth) // true
GroupToken.allowsMelt(auth) // true
GroupToken.allowsRescript(auth) // true
GroupToken.allowsRenew(auth) // true
GroupToken.allowsSubgroup(auth) // true

// you can also set the provided flags
// this is the same as 14123288431433875456n (unsigned)
// or -4323455642275676160n (signed)
let auth2 = GroupToken.authFlags.AUTHORITY 
            | GroupToken.authFlags.MINT
            | GroupToken.authFlags.SUBGROUP;

GroupToken.allowsMint(auth2) // true
GroupToken.allowsMelt(auth2) // false
GroupToken.allowsRescript(auth2) // false
GroupToken.allowsRenew(auth2) // false
GroupToken.allowsSubgroup(auth2) // true

// token amount
let auth3 = BigInt('12345678');

GroupToken.allowsMint(auth3) // false
GroupToken.allowsMelt(auth3) // false
GroupToken.allowsRescript(auth3) // false
GroupToken.allowsRenew(auth3) // false
GroupToken.allowsSubgroup(auth3) // false
```

## API Reference
- [GroupToken](api/classes/GroupToken.md)
- [GroupIdType](api/enumerations/GroupIdType.md)
- [GroupIdFlag](api/enumerations/GroupIdFlag.md)
- [ScriptFactory](api/classes/ScriptFactory.md)