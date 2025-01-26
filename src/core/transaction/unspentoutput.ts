import { isObject, isUndefined } from "lodash-es";
import Script from "../script/script";
import UnitUtils from "../../utils/unit.utils";
import ValidationUtils from "../../utils/validation.utils";
import CommonUtils from "../../utils/common.utils";
import ScriptFactory from "../script/script.factory";
import type { UTXO } from "./interfaces";

export default class UnspentOutput {

  public outpoint: string;
  public scriptPubKey: Script;
  public satoshis: bigint;

  /**
   * Represents an unspent output information: its outpoint hash, associated amount/sats,
   * associated script or address with optional group info,
   *
   * @param utxo the utxo object
   * @param utxo.outpoint the outpoint hash
   * @param utxo.amount amount of nexa associated as string or number
   * @param utxo.satoshis alias for `amount`, but expressed in satoshis (1 NEXA = 100 satoshis) as bigint, string or number
   * @param utxo.scriptPubKey the script that must be resolved to release the funds
   * @param utxo.address optional. can be used instead of the full script
   * @param utxo.groupId optional. can be used instead of the full script
   * @param utxo.groupAmount optional. can be used instead of the full script
   */
  constructor(utxo: UTXO) {
    ValidationUtils.validateArgument(isObject(utxo), 'Must provide an object from where to extract data');
    ValidationUtils.validateArgument(CommonUtils.isHexa(utxo.outpoint), 'Invalid outpoint hash');
    ValidationUtils.validateArgument(!isUndefined(utxo.satoshis) || !isUndefined(utxo.amount), 'Must provide satoshis or amount');
    ValidationUtils.validateArgument(!isUndefined(utxo.scriptPubKey) || !isUndefined(utxo.address), 'Must provide script or address');

    this.outpoint = utxo.outpoint;
    this.satoshis = !isUndefined(utxo.satoshis) ? BigInt(utxo.satoshis) : UnitUtils.parseNEXA(utxo.amount!.toString());
    this.scriptPubKey = !isUndefined(utxo.scriptPubKey) ? new Script(utxo.scriptPubKey) : ScriptFactory.buildOutFromAddress(utxo.address!, utxo.groupId, utxo.groupAmount);
  }

  /**
   * String representation: just the outpoint hash
   */
  public toString(): string {
    return this.outpoint;
  }

  /**
   * Provide an informative output when displaying this object in the console
   */
  public inspect(): string {
    return `<UnspentOutput: ${this}, satoshis: ${this.satoshis}, script: ${this.scriptPubKey}>`;
  }

  /**
   * Deserialize an UnspentOutput from an object
   * @param data
   */
  public static fromObject(data: UTXO): UnspentOutput {
    return new UnspentOutput(data);
  }

  /**
   * Returns a plain object (no prototype or methods) with the associated info for this utxo
   */
  public toObject(): UTXO {
    return {
      outpoint: this.outpoint,
      scriptPubKey: this.scriptPubKey.toHex(),
      amount: UnitUtils.formatNEXA(this.satoshis),
    };
  }

  public toJSON = this.toObject;
}