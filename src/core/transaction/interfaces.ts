import type PublicKey from "../../keys/publickey";
import type Address from "../address/address";
import type Script from "../script/script";

export interface UTXO {
  outpoint: string;
  satoshis?: bigint | string | number;
  amount?: string | number;
  scriptPubKey?: string | Script;
  address?: string | Address;
  groupId?: string | Address;
  groupAmount?: bigint;
  templateData?: ScriptTemplateObject;
}

export interface IOutput {
  type?: number;
  scriptPubKey: Script | string;
  value: bigint | number | string;
}

export interface IInput {
  type?: number;
  outpoint: string | Buffer;
  scriptSig: string | Script;
  amount: string | bigint;
  sequenceNumber?: number;
  output?: IOutput;
  templateData?: ScriptTemplateObject;
}

export interface ScriptTemplateObject {
  templateScript: Script | string;
  constraintScript: Script | string | number;
  publicKey?: PublicKey | string;
}

export interface ITransaction {
  id: string;
  idem: string;
  version: number;
  inputs: IInput[];
  outputs: IOutput[];
  nLockTime: number;
  fee?: number;
  feePerByte?: number;
  changeIndex?: number;
  changeScript?: string;
}

/**
 * Contain a set of flags to skip certain tests:
 * 
 * * `disableAll`: disable all checks
 * * `disableIsFullySigned`: disable checking if all inputs are fully signed
 * * `disableDustOutputs`: disable checking if there are no outputs that are dust amounts
 * * `disableMoreOutputThanInput`: disable checking if the transaction spends more nexas than the sum of the input amounts
 */
export interface TxVerifyOptions {
  disableAll?: boolean;
  disableDustOutputs?: boolean;
  disableIsFullySigned?: boolean;
  disableMoreOutputThanInput?: boolean;
}