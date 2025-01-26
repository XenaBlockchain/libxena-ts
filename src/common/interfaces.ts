import type BN from "../crypto/bn.extension";
import type Point from "../crypto/point";
import type { Network } from "../core/network/network";
import type { ITransaction } from "../core/transaction/interfaces";

export interface BufferParams {
  buf?: Buffer;
  pos?: number;
}

export interface BufferWriterOptions {
  bufs?: Buffer[];
}

export interface NetworkParams {
  name: string;
  alias: string;
  prefix: string;
  pubkeyhash: number;
  privatekey: number;
  scripthash: number;
  xpubkey: number;
  xprivkey: number;
  networkMagic: number;
  port: number;
  dnsSeeds: string[];
}

export interface BNOptions {
  endian?: "little" | "big";
  size?: number;
  bignum?: boolean;
}

export interface GroupIdData {
  hashBuffer: Buffer;
  nonce: bigint;
}

export interface ISignature {
  r: BN;
  s: BN;
  i?: number; //public key recovery parameter in range [0, 3]
  compressed?: boolean; // whether the recovered pubkey is compressed
  toBuffer(isSchnorr: boolean): Buffer
}

export interface IDigitalSignature {
  hashbuf: Buffer;
  endian?: "big" | "little";
  privkey: IPrivateKey;
  pubkey: IPublicKey;
  sig?: ISignature;
  verified?: boolean;
  sign(): this;
  verify(): this;
}

export interface IPrivateKey {
  compressed: boolean;
  network: Network;
  bn: BN;
  get publicKey(): IPublicKey;
  toString(): string;
  toWIF(): string;
  toBigNumber(): BN;
  toBuffer(): Buffer;
  toBufferNoPadding(): Buffer;
  toPublicKey(): IPublicKey;
  toJSON(): PrivateKeyDto;
  toObject(): PrivateKeyDto;
  inspect(): string;
}

export interface IPublicKey {
  point: Point;
  compressed?: boolean;
  network?: Network;
  toString(): string;
  toJSON(): PublicKeyDto;
  toObject(): PublicKeyDto;
  toDER(): Buffer;
  toBuffer(): Buffer;
  inspect(): string;
}

export interface PrivateKeyDto {
  compressed: boolean;
  network: string;
  bn: string;
}

export interface PublicKeyDto {
  x: string;
  y: string;
  compressed: boolean;
  network: string;
}

interface IHDKey {
  network: Network;
  depth: number;
  parentFingerPrint: Buffer;
  fingerPrint: Buffer;
  chainCode: Buffer;
  childIndex: number;
  checksum: Buffer;
}

export interface IHDPrivateKey extends IHDKey {
  privateKey: IPrivateKey;
  publicKey?: IPublicKey;
  xprivkey: string;
}

export interface IHDPublicKey extends IHDKey {
  publicKey: IPublicKey;
  xpubkey: string;
}

interface HDKeyBuffers {
  version: Buffer;
  depth: Buffer;
  parentFingerPrint: Buffer;
  childIndex: Buffer;
  chainCode: Buffer;
  checksum?: Buffer;
}

export interface HDPublicKeyBuffers extends  HDKeyBuffers {
  publicKey: Buffer;
}

export interface HDPrivateKeyBuffers extends  HDKeyBuffers {
  privateKey: Buffer;
}

interface HDKeyDto {
  network: string;
  depth: number;
  fingerPrint: number;
  parentFingerPrint: number;
  childIndex: number;
  chainCode: string;
  checksum: number;
}

export interface HDPrivateKeyDto extends HDKeyDto {
  privateKey: string;
  xprivkey: string;
}

export interface HDPublicKeyDto extends HDKeyDto {
  publicKey: string;
  xpubkey: string;
}

export type HDPrivateKeyMinimalDto = Omit<HDPrivateKeyDto, 'xprivkey' | 'checksum' | 'fingerPrint'>;
export type HDPublicKeyMinimalDto = Omit<HDPublicKeyDto, 'xpubkey' | 'checksum' | 'fingerPrint'>;

export interface ScriptChunk {
  buf?: Buffer;
  len?: number;
  opcodenum: number;
}

export interface IScript {
  chunks: ScriptChunk[];
}

export interface AddressDto {
  data: string;
  network: string;
  type: string;
}

export interface IMessage {
  message: string;
}

export interface IBlockHeader {
  hash?: string;
  prevHash: string | Buffer;
  bits: number;
  ancestorHash: string | Buffer;
  merkleRoot: string | Buffer;
  txFilter: string | Buffer;
  time: number;
  height: number;
  chainWork: string | Buffer;
  size: number;
  txCount: number;
  poolFee: number;
  utxoCommitment: string | Buffer;
  minerData: string | Buffer;
  nonce: string | Buffer;
}

export interface IBlock {
  header: IBlockHeader;
  transactions: ITransaction[];
}
