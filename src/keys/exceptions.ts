export class InvalidDerivationArgument extends Error {
  constructor(arg: unknown) {
    super(`Invalid derivation argument: got ${arg}`);
  }
}

export class InvalidPath extends Error {
  constructor(arg: unknown) {
    super(`Invalid derivation path, it should look like: "m/1/100", got "${arg}"`);
  }
}

export class InvalidB58Char extends Error {
  constructor(char: unknown, data: unknown) {
    super(`Invalid Base58 character: ${char} in ${data}`);
  }
}

export class InvalidB58Checksum extends Error {
  constructor(arg: unknown) {
    super(`Invalid Base58 checksum for ${arg}`);
  }
}

export class InvalidLength extends Error {
  constructor(arg: unknown) {
    super(`Invalid length for xprivkey string in ${arg}`);
  }
}

export class InvalidNetwork extends Error {
  constructor(arg: unknown) {
    super(`Invalid version for network: got ${arg}`);
  }
}

export class InvalidNetworkArgument extends Error {
  constructor(arg: unknown) {
    super(`Invalid network: must be "mainnet" or "testnet", got ${arg}`);
  }
}

export class InvalidEntropyArgument extends Error {
  constructor(arg: unknown) {
    super(`Invalid entropy: must be an hexa string or binary buffer, got ${arg}`);
  }
}

export class TooMuchEntropy extends Error {
  constructor(arg: unknown) {
    super(`Invalid entropy: more than 512 bits is non standard, got ${arg}`);
  }
}

export class NotEnoughEntropy extends Error {
  constructor(arg: unknown) {
    super(`Invalid entropy: at least 128 bits needed, got ${arg}`);
  }
}

export class ArgumentIsPrivateExtended extends Error {
  constructor() {
    super(`Argument is an extended private key`);
  }
}

export class InvalidHardenedIndex extends Error {
  constructor() {
    super(`Invalid argument: creating a hardened path requires an HDPrivateKey`);
  }
}