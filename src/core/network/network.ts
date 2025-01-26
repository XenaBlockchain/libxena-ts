import type { NetworkParams } from "../../common/interfaces";
import BufferUtils from "../../utils/buffer.utils";

export class Network {
  public name: string;
  public alias: string;
  public prefix: string;
  public pubkeyhash: number;
  public privatekey: number;
  public scripthash: number;
  public xpubkey: number;
  public xprivkey: number;
  public networkMagic: Buffer;
  public port: number;
  public dnsSeeds: string[];

  constructor(params: NetworkParams) {
    this.name = params.name;
    this.alias = params.alias;
    this.prefix = params.prefix;
    this.pubkeyhash = params.pubkeyhash;
    this.privatekey = params.privatekey;
    this.scripthash = params.scripthash;
    this.xpubkey = params.xpubkey;
    this.xprivkey = params.xprivkey;
    this.networkMagic = BufferUtils.integerAsBuffer(params.networkMagic);
    this.port = params.port;
    this.dnsSeeds = params.dnsSeeds;
  }

  public toString(): string {
    return this.name;
  }
}

export const liveNetwork = new Network({
  name: 'mainnet',
  alias: 'livenet',
  prefix: 'nexa',
  pubkeyhash: 0x19,
  privatekey: 0x23,
  scripthash: 0x44,
  xpubkey: 0x42696720,
  xprivkey: 0x426c6b73,
  networkMagic: 0x72271221,
  port: 7228,
  dnsSeeds: [ // from https://gitlab.com/nexa/nexa/-/blob/dev/src/chainparams.cpp#L592
    'seed.nextchain.cash',
    'seeder.nexa.org',
    'nexa-seeder.bitcoinunlimited.info'
  ]
});

export const testNetwork = new Network({
  name: 'testnet',
  alias: 'testnet',
  prefix: 'nexatest',
  pubkeyhash: 0x6f,
  privatekey: 0xef,
  scripthash: 0xc4,
  xpubkey: 0x043587cf,
  xprivkey: 0x04358394,
  networkMagic: 0x72271222,
  port: 7230,
  dnsSeeds: [
    'nexa-testnet-seeder.bitcoinunlimited.info',
    'testnetseeder.nexa.org'
  ]
});