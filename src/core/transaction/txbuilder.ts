import { isArray, isDate, isNumber, isObject, isString, isUndefined } from "lodash-es";
import Transaction from "./transaction";
import type { ITransaction, ScriptTemplateObject, UTXO } from "./interfaces";
import UnspentOutput from "./unspentoutput";
import PublicKeyHashInput from "./input/publickeyhash";
import PublicKeyTemplateInput from "./input/publickeytemplate";
import Input from "./input/input";
import Output from "./output";
import Script from "../script/script";
import ScriptTemplateInput from "./input/scripttemplate";
import type Address from "../address/address";
import ScriptFactory from "../script/script.factory";
import ValidationUtils from "../../utils/validation.utils";
import PrivateKey from "../../keys/privatekey";
import SighashType from "./sighashtype";
import TxSignature from "./txsignature";
import TxSigner from "./txsigner";

export default class TransactionBuilder {

  public transaction: Transaction;

  constructor(tx?: ITransaction | string | Buffer) {
    if (tx instanceof Transaction) {
      this.transaction = tx;
    } else {
      this.transaction = new Transaction(tx);
    }
  }

  public build(): Transaction {
    return this.transaction;
  }

  /**
   * Add an input to this transaction. This is a high level interface
   * to add an input, for more control, use {@link Transaction.addInput}.
   *
   * Can receive, as output information, the output of nexad's `listunspent` command,
   * with a slightly fancier format recognized by this sdk:
   *
   * ```
   * {
   *  outpoint: 'fcf7d303d67f19568cf4ab72d36d583baac461e0f62f289b3dff68da96c2117c'
   *  scriptPubKey: '005114891c4b19cbcaefc31770a938ebd6b1fafabb1be6',
   *  satoshis: 181998351
   * }
   * // or alternative:
   * {
   *  outpoint: 'fcf7d303d67f19568cf4ab72d36d583baac461e0f62f289b3dff68da96c2117c'
   *  address: 'nexa:nqtsq5g53ywykxwtethux9ms4yuwh443ltatkxlx3s5pnvwh',
   *  amount: 1819983.51
   *  groupId: <token address if relevant>
   *  groupAmount: <token amount if relevant>
   * }
   * ```
   * Where `address` can be either a string or a nexcore Address object. The
   * same is true for `script`, which can be a string or a nexcore Script.
   * 
   * @see {@link UTXO}
   *
   * Beware that this resets all the signatures for inputs.
   *
   * @example
   * ```javascript
   * let builder = new TransactionBuilder();
   *
   * // From a pay to public key template output from nexad's listunspent
   * builder.from({'outpoint': '0000...', amount: 123.23, scriptPubKey: 'OP_0 OP_1 ...'});
   *
   * // From a pay to public key template output (with optional group data)
   * builder.from({'outpoint': '0000...', satoshis: 12323, address: 'nexa:nqtsq5g...', groupId? 'nexa:tnq...', groupAmount: 56446n });
   *
   * // From a script template output
   * builder.from({'outpoint': '0000...', satoshis: 1000, scriptPubKey: '...', templateData: { templateScript: '...', constraintScript: '...' }};
   * 
   * let transaction = builder.build();
   * ```
   * 
   * @param utxo details on the utxo
   * @returns this, for chaining
   */
  public from(utxo: UTXO | UTXO[]): this {
    if (isArray(utxo)) {
      utxo.forEach(u => this.from(u));
      return this;
    }

    let exist = this.transaction.inputs.some(input => input.outpoint.toString('hex') === utxo.outpoint);
    if (exist) {
      return this;
    }

    return this._fromUtxo(new UnspentOutput(utxo), utxo.templateData);
  }

  private _fromUtxo(utxo: UnspentOutput, templateData?: ScriptTemplateObject): this {
    let clazz;
    if (utxo.scriptPubKey.isPublicKeyHashOut()) {
      clazz = PublicKeyHashInput;
    } else if (utxo.scriptPubKey.isPublicKeyTemplateOut()) {
      clazz = PublicKeyTemplateInput;
    } else if (utxo.scriptPubKey.isScriptTemplateOut() && isObject(templateData)) {
      clazz = ScriptTemplateInput;
    } else {
      clazz = Input;
    }

    let input = new clazz({
      output: new Output(utxo.satoshis, utxo.scriptPubKey),
      outpoint: utxo.outpoint,
      scriptSig: Script.empty(),
      amount: utxo.satoshis,
      templateData: templateData
    });
    this.transaction.addInput(input);
    return this;
  }

  /**
   * Add an output to the transaction.
   *
   * Beware that this resets all the signatures for inputs.
   *
   * @param address the destination address
   * @param amount in satoshis, the nexa amount
   * @param groupId optional. the token address if sending tokens
   * @param groupAmount optional. the token amount if sending tokens
   * 
   * @remarks if sending token, the nexa amount is usually {@link Transaction.DUST_AMOUNT}
   * 
   * @returns this, for chaining
   */
  public to(address: string | Address, amount: number | string | bigint, groupId?: string | Address, groupAmount?: bigint): this {
    let script = ScriptFactory.buildOutFromAddress(address, groupId, groupAmount);
    let output = new Output(amount, script);
    this.transaction.addOutput(output);
    return this;
  }

  /**
   * Add an OP_RETURN output to the transaction.
   *
   * Beware that this resets all the signatures for inputs.
   *
   * @param data the data to be stored in the OP_RETURN output.
   *    In case of a string, the UTF-8 representation will be stored
   * @param isFullScript if the provided data is already an op_return script. default false.
   * @returns this, for chaining
   */
  public addData(data: Buffer | string | Script, isFullScript = false): this {
    let script = isFullScript ? new Script(data) : ScriptFactory.buildDataOut(data);
    let output = new Output(0, script);
    this.transaction.addOutput(output);
    return this;
  }

  /**
   * Set the change address for this transaction
   *
   * Beware that this resets all the signatures for inputs.
   *
   * @param address An address for change to be sent to.
   * @returns this, for chaining
   */
  public change(address: Address | string): this {
    this.transaction.setChangeOutput(address);
    return this;
  }

  /**
   * Manually set the fee for this transaction. 
   * 
   * Beware that this resets all the signatures for inputs.
   *
   * @param amount satoshis to be used as fee
   * @returns this, for chaining
   */
  public fee(amount: number): this {
    this.transaction.setFee(amount);
    return this;
  }

  /**
   * Manually set the fee per Byte rate for this transaction.
   * 
   * Beware that this resets all the signatures for inputs.
   * 
   * @remarks fee per Byte will be ignored if fee property was set manually
   *
   * @param amount satoshis per Byte to be used as fee rate
   * @returns this, for chaining
   */
  public feePerByte(amount: number): this {
    this.transaction.setFeePerByte(amount);
    return this;
  }

  /**
   * Sets nLockTime so that transaction is not valid until the desired date
   * 
   * (a timestamp in seconds since UNIX epoch is also accepted)
   *
   * @param datetime Date object or unix timestamp number
   * @returns this, for chaining
   */
  public lockUntilDate(datetime: number | Date): this {
    ValidationUtils.validateArgument(!isUndefined(datetime), 'datetime');
    if (isNumber(datetime) && datetime < Transaction.NLOCKTIME_BLOCKHEIGHT_LIMIT) {
      throw new Error("Lock Time can't be earlier than UNIX date 500 000 000");
    }
    if (isDate(datetime)) {
      datetime = datetime.getTime() / 1000;
    }

    this.transaction.setLockTime(datetime);
    return this;
  };

  /**
   * Sets nLockTime so that transaction is not valid until the desired block height.
   *
   * @param height the block height
   * @returns this, for chaining
   */
  public lockUntilBlockHeight(height: number): this {
    if (height >= Transaction.NLOCKTIME_BLOCKHEIGHT_LIMIT) {
      throw new Error("Block Height can be at most 2^32 - 1");
    }
    if (height < 0) {
      throw new Error("Block Height cannot be negative");
    }

    this.transaction.setLockTime(height);
    return this;
  }

  /**
   * Sign the transaction using one or more private keys.
   *
   * It tries to sign each input, verifying that the signature will be valid
   * (matches a public key). Usually this is the last step that should be used with the builder.
   * 
   * @remarks this method sign all inputs and outputs (sighash type ALL).
   *  
   * if you need to sign a specific input or partial transaction
   *  (create new or complete existing one), use {@link signInput} method.
   *
   * @param privateKey private key(s) that be used to sign
   * @returns this, for chaining
   */
  public sign(privateKey: PrivateKey | PrivateKey[]): this {
    ValidationUtils.validateState(this.transaction.hasAllUtxoInfo(), 'Not all utxo information is available to sign the transaction.');

    if (isArray(privateKey)) {
      privateKey.forEach(key => this.sign(key));
      return this;
    }

    this._getSignatures(privateKey, SighashType.ALL).forEach(sig => this._applySignature(sig));
    return this;
  }

  /**
   * Sign specific input using private key and sighash type.
   * 
   * Use sigtype to determine which parts of the transaction to sign.
   * 
   * @param input The input to sign. can be input index (number) or input outpoint hash (string)
   * @param privateKey private key that be used to sign
   * @param sigtype the sighash type to define which parts to include in the sighash
   * @returns this, for chaining
   */
  public signInput(input: number | string, privateKey: PrivateKey, sigtype: SighashType): this {
    if (isString(input)) {
      input = this.transaction.inputs.findIndex(inp => inp.outpoint.toString('hex') === input);
    }
    ValidationUtils.validateArgument(input >= 0 && input < this.transaction.inputs.length, 'input', 'out of range.');
    ValidationUtils.validateState(this.transaction.inputs[input].canSign(privateKey), 'The provided key cannot sign this input');

    let txSig = this._getSignature(input, privateKey, sigtype);
    this._applySignature(txSig);
    return this;
  }

  private _getSignatures(privKey: PrivateKey, sigtype: SighashType): TxSignature[] {
    ValidationUtils.validateArgument(privKey instanceof PrivateKey, 'privKey', 'not a private key');

    let signatures: TxSignature[] = [];
    for (let i = 0; i < this.transaction.inputs.length; i++) {
      if (!this.transaction.inputs[i].canSign(privKey)) {
        continue;
      }
      let txSig = this._getSignature(i, privKey, sigtype);
      signatures.push(txSig);
    }

    return signatures;
  }

  private _getSignature(index: number, privKey: PrivateKey, sigtype: SighashType): TxSignature {
    let subscript = this.transaction.inputs[index].getSubscript();
    return new TxSignature({
      inputIndex: index,
      publicKey: privKey.publicKey,
      subscript: subscript,
      signature: TxSigner.sign(this.transaction, index, sigtype, subscript, privKey),
      sigType: sigtype
    });
  }

  private _applySignature(signature: TxSignature): void {
    let isValid = TxSigner.verify(this.transaction, signature.inputIndex, signature.signature, signature.sigType, signature.subscript, signature.publicKey);
    ValidationUtils.validateState(isValid, 'Signature is invalid');

    this.transaction.inputs[signature.inputIndex].addSignature(signature);
  }
}