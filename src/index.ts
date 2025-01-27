import { version } from "../package.json";
import Hash from "./crypto/hash";
import BufferUtils from "./utils/buffer.utils";
import CommonUtils from "./utils/common.utils";
import BNExtended from "./crypto/bn.extension";
import BufferReader from "./encoding/bufferreader";
import BufferWriter from "./encoding/bufferwriter";
import UnitUtils from "./utils/unit.utils";
import NetworkManager from "./core/network/network-manager";
import ECDSA from "./crypto/ecdsa";
import Schnorr from "./crypto/schnorr";
import PrivateKey from "./keys/privatekey";
import PublicKey from "./keys/publickey";
import Signature from "./crypto/signature";
import ScriptOpcode, { Opcode } from "./core/script/opcode";
import HDPrivateKey from "./keys/hdprivatekey";
import HDPublicKey from "./keys/hdpublickey";
import Script from "./core/script/script";
import Address from "./core/address/address";
import ScriptFactory from "./core/script/script.factory";
import Message from "./core/message";
import SighashType from "./core/transaction/sighashtype";
import Transaction from "./core/transaction/transaction";
import Output from "./core/transaction/output";
import Input from "./core/transaction/input/input";
import PublicKeyHashInput from "./core/transaction/input/publickeyhash";
import PublicKeyTemplateInput from "./core/transaction/input/publickeytemplate";
import ScriptTemplateInput from "./core/transaction/input/scripttemplate";
import UnspentOutput from "./core/transaction/unspentoutput";
import TxSignature from "./core/transaction/txsignature";
import TxSigner from "./core/transaction/txsigner";
import TransactionBuilder from "./core/transaction/txbuilder";
import Block from "./core/block/block";
import BlockHeader from "./core/block/blockheader";
import GroupToken from "./core/grouptoken";

function versionGuard(version: string): void {
  if (version !== undefined) {
    let message = 'More than one instance of libnexa found. ' +
      'Please make sure to require libnexa and check that submodules do' +
      ' not also include their own libnexa dependency.';
    throw new Error(message);
  }
};

versionGuard(global._libnexa_ver);
global._libnexa_ver = `v${version}`;

const crypto = {
  BN: BNExtended,
  Hash,
  ECDSA,
  Schnorr,
  Signature
}

const encoding = {
  BufferReader,
  BufferWriter,
}

const utils = {
  BufferUtils,
  CommonUtils,
  UnitUtils,
}

const keys = {
  PrivateKey,
  PublicKey,
  HDPrivateKey,
  HDPublicKey
}

const tx = {
  Transaction,
  Input,
  PublicKeyHashInput,
  PublicKeyTemplateInput,
  ScriptTemplateInput,
  Output,
  UnspentOutput,
  TxSignature,
  TxSigner,
  SighashType,
}

/**
 * Singleton instance of {@link NetworkManager}
 */
export const Networks = NetworkManager.getInstance();

const libnexa = {
  versionGuard,
  version: `v${version}`,
  crypto,
  encoding,
  utils,
  keys,
  tx,
  Networks: NetworkManager.getInstance(),
  Opcode,
  Script,
  ScriptFactory,
  ScriptOpcode,
  Address,
  Message,
  TransactionBuilder,
  Block,
  BlockHeader,
  GroupToken,
};

export default libnexa;

export type * from "./common/types";
export type * from "./common/interfaces";
export type * from "./core/transaction/interfaces";
export type { ITxSignature } from "./core/transaction/txsignature";
export type { ScriptElement } from "./core/script/script";
export type { PrivateKeyVariants } from "./keys/privatekey";
export type { PublicKeyVariants } from "./keys/publickey";

export { default as BNExtended } from "./crypto/bn.extension";
export { default as Point } from "./crypto/point";
export { default as Hash } from "./crypto/hash";
export { default as Signature } from "./crypto/signature";
export { default as DigitalSignature} from "./crypto/digital-signature"
export { default as ECDSA } from "./crypto/ecdsa";
export { default as Schnorr } from "./crypto/schnorr";

export { default as BufferReader } from "./encoding/bufferreader";
export { default as BufferWriter } from "./encoding/bufferwriter";

export { Network } from "./core/network/network";
export { default as NetworkManager } from "./core/network/network-manager";

export { UnitType, default as UnitUtils } from "./utils/unit.utils";
export { default as BufferUtils } from "./utils/buffer.utils";
export { default as CommonUtils } from "./utils/common.utils";

export { default as PrivateKey } from "./keys/privatekey";
export { default as PublicKey } from "./keys/publickey";
export { default as HDPrivateKey } from "./keys/hdprivatekey";
export { default as HDPublicKey } from "./keys/hdpublickey";

export { Opcode, default as ScriptOpcode } from "./core/script/opcode";
export { default as Script } from "./core/script/script";
export { default as ScriptFactory } from "./core/script/script.factory";

export { default as Address } from "./core/address/address";
export { AddressType } from "./core/address/address-formatter";

export { default as Block } from "./core/block/block";
export { default as BlockHeader } from "./core/block/blockheader";

export { default as SighashType, InputSighashType, OutputSighashType } from "./core/transaction/sighashtype";
export { default as Transaction } from "./core/transaction/transaction";
export { default as UnspentOutput } from "./core/transaction/unspentoutput";
export { default as Output, OutputType } from "./core/transaction/output";
export { default as Input, InputType } from "./core/transaction/input/input";
export { default as PublicKeyTemplateInput } from "./core/transaction/input/publickeytemplate";
export { default as ScriptTemplateInput } from "./core/transaction/input/scripttemplate";
export { default as PublicKeyHashInput } from "./core/transaction/input/publickeyhash";
export { default as TxSigner } from "./core/transaction/txsigner";
export { default as TxSignature } from "./core/transaction/txsignature";
export { default as TransactionBuilder } from "./core/transaction/txbuilder";

export { default as Message } from "./core/message";
export { default as GroupToken, GroupIdFlag, GroupIdType } from "./core/grouptoken";
