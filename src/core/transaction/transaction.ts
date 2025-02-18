import { isNil, isNumber, isObject, isUndefined } from "lodash-es";
import BufferUtils from "../../utils/buffer.utils";
import CommonUtils from "../../utils/common.utils";
import Script from "../script/script";
import Input from "./input/input";
import Output from "./output";
import type { ITransaction, TxVerifyOptions } from "./interfaces";
import BufferWriter from "../../encoding/bufferwriter";
import { Opcode } from "../script/opcode";
import Hash from "../../crypto/hash";
import ValidationUtils from "../../utils/validation.utils";
import type Address from "../address/address";
import ScriptFactory from "../script/script.factory";
import type { IScript } from "../../common/interfaces";
import BufferReader from "../../encoding/bufferreader";
import PublicKeyHashInput from "./input/publickeyhash";
import PublicKeyTemplateInput from "./input/publickeytemplate";
import ScriptTemplateInput from "./input/scripttemplate";

/**
 * Represents a transaction, a set of inputs and outputs to change ownership of tokens
 */
export default class Transaction implements ITransaction {

  public static readonly CURRENT_VERSION = 0;
  public static readonly FEE_PER_BYTE = 3;

  // Minimum amount for an output for it not to be considered a dust output
  public static readonly DUST_AMOUNT = 546;

  // Max amount of satoshis in circulation
  public static readonly MAX_MONEY = 21000000 * 1e8;

  // nlocktime limit to be considered block height rather than a timestamp
  public static readonly NLOCKTIME_BLOCKHEIGHT_LIMIT = 5e8;

  // Max value for an unsigned 32 bit value
  public static readonly NLOCKTIME_MAX_VALUE = 4294967295;

  public version: number;
  public inputs: Input[];
  public outputs: Output[];
  public nLockTime: number;

  private _feePerByte?: number;
  private _fee?: number
  private _changeIndex?: number;
  private _changeScript?: Script;

  constructor(serializedTx?: ITransaction | string | Buffer) {
    this.version = Transaction.CURRENT_VERSION;
    this.inputs = [];
    this.outputs = [];
    this.nLockTime = 0;

    if (serializedTx) {
      if (BufferUtils.isBuffer(serializedTx)) {
        this.fromBuffer(serializedTx);
      } else if (CommonUtils.isHexa(serializedTx as string)) {
        this.fromString(serializedTx as string);
      } else if (isObject(serializedTx)) {
        this.fromObject(serializedTx);
      } else {
        throw new TypeError("Must provide an object or string to deserialize a transaction");
      }
    }
  }

  public get id(): string {
    let buf = new BufferWriter().write(this._getTxIdem()).write(this._getTxSatisfier()).toBuffer();
    return Hash.sha256sha256(buf).reverse().toString('hex');
  }

  public get idem(): string {
    return this._getTxIdem().reverse().toString('hex');
  }

  public get outputAmount(): bigint {
    return this.outputs.reduce((total, output) => total + output.value, 0n);
  }

  public get inputAmount(): bigint {
    return this.inputs.reduce((total, input) => total + input.amount, 0n);
  }

  private _getTxIdem(): Buffer {
    return Hash.sha256sha256(this._toIdemBuffer());
  }
  
  private _getTxSatisfier(): Buffer {
    return Hash.sha256sha256(this._toSatisfierBuffer());
  }

  /**
   * Create a 'shallow' copy of the transaction, by serializing and deserializing.
   * it dropping any additional information that inputs and outputs may have hold
   *
   * @param transaction
   */
  public static shallowCopy(transaction: Transaction): Transaction {
    return new Transaction(transaction.toBuffer());
  }

  /**
   * Analogous to nexad's IsCoinBase function in transaction.h
   */
  public isCoinbase(): boolean {
    return this.inputs.length === 0;
  }

  /**
   * Retrieve a possible error that could appear when trying to serialize and
   * broadcast this transaction.
   *
   * @param opts allows to skip certain tests.
   */
  public getSerializationError(opts?: TxVerifyOptions): Error | undefined {
    if (this._invalidAmount()) {
      return new Error('Output satoshis are invalid');
    }

    if (this.outputs.length > 256) {
      return new Error('Too many outputs (> 256)');
    }
    if (this.inputs.length > 256) {
      return new Error('Too many inputs (> 256)');
    }

    let unspent = this.getUnspentValue();
    let unspentError: Error | undefined;
    if (unspent < 0) {
      if (!opts?.disableMoreOutputThanInput) {
        unspentError = new Error('Invalid outputs amount sum');
      }
    } else {
      unspentError = this._hasFeeError(unspent);
    }

    return unspentError ||
      this._hasDustOutputs(opts) ||
      this._isMissingSignatures(opts);
  }

  private _invalidAmount(): boolean {
    return this.outputs.some(out => out.invalidValue());
  }
  
  private _hasDustOutputs(opts?: TxVerifyOptions): Error | undefined {
    if (opts?.disableDustOutputs) {
      return;
    }
    
    let hasDust = this.outputs.some(output => output.value < Transaction.DUST_AMOUNT && !output.scriptPubKey.isDataOut());
    return hasDust ? new Error('Dust amount detected in one output') : undefined;
  }

  private _hasFeeError(unspent: bigint): Error | undefined {
    if (!isUndefined(this._fee) && BigInt(this._fee) !== unspent) {
      return new Error(`Unspent value is ${unspent} but specified fee is ${this._fee}`);
    }
  }

  private _estimateFee(): number {
    let estimatedSize = this._estimateSize();
    let available = this.getUnspentValue();
    let feeRate = this._feePerByte || Transaction.FEE_PER_BYTE;
    const calcFee = (size: number): number => {
      return size * feeRate;
    }
    let feeWithChange = Math.ceil(calcFee(estimatedSize) + calcFee(this._estimateSizeOfChangeOutput()));
    if (!this._changeScript || available <= feeWithChange || available - BigInt(feeWithChange) < Transaction.DUST_AMOUNT) {
      return Number(available);
    }
    return feeWithChange;
  }

  private _estimateSizeOfChangeOutput(): number {
    /* c8 ignore start */
    if (!this._changeScript) {
      return 0; // should not reach here
    }
    /* c8 ignore stop */

    let scriptLen = this._changeScript.toBuffer().length;
    // 1 byte for type + 8 bytes for amount + script size + actual script size
    return 1 + 8 + BufferWriter.varintBufNum(scriptLen).length + scriptLen;
  }

  private _estimateSize(): number {
    let result = 4 + 1; // locktime + version

    result += this.inputs.length < 253 ? 1 : 3;
    this.inputs.forEach(input => {
      result += input.estimateSize();
    });
    
    result += this.outputs.length < 253 ? 1 : 3;
    this.outputs.forEach(output => {
      result += output.toBufferWriter().toBuffer().length;
    });
  
    return result;
  }
  
  private _isMissingSignatures(opts?: TxVerifyOptions): Error | undefined {
    if (opts?.disableIsFullySigned) {
      return;
    }
    if (!this.isFullySigned()) {
      return new Error('Some inputs have not been fully signed');
    }
  }

  public isFullySigned(): boolean {
    if (this.inputs.some(input => input.isFullySigned === Input.prototype.isFullySigned)) {
      throw new Error("Unable to verify signature: Unrecognized script kind, or not enough information to execute script."
         + " This usually happens when creating a transaction from a serialized transaction")
    }
    return this.inputs.every(input => input.isFullySigned());
  }

  /**
   * @returns true if the transaction has enough info on all inputs to be correctly validated
   */
  public hasAllUtxoInfo(): boolean {
    return this.inputs.every(input => !isUndefined(input.output));
  }

  public getUnspentValue(): bigint {
    return this.inputAmount - this.outputAmount;
  }

  /**
   * Calculates the fee of the transaction.
   *
   * If there's a fixed fee set, return that.
   *
   * If there is no change output set, the fee is the
   * total value of the outputs minus inputs. Note that
   * a serialized transaction only specifies the value
   * of its outputs. (The value of inputs are recorded
   * in the previous transaction outputs being spent.)
   * This method therefore raises a "MissingPreviousOutput"
   * error when called on a serialized transaction.
   *
   * If there's no fee set and no change address,
   * estimate the fee based on size.
   *
   * @return fee of this transaction in satoshis
   */
  public getFee(): number {
    if (this.isCoinbase()) {
      return 0;
    }
    if (!isUndefined(this._fee)) {
      return this._fee;
    }
    // if no change output is set, fees should equal all the unspent amount
    if (!this._changeScript) {
      return Number(this.getUnspentValue());
    }
    return this._estimateFee();
  }

  /**
   * Calculates the required fee of the transaction.
   * 
   * @remarks this method is different than getFee.
   *  while getFee return the current fee estimation, this method return how much fee is required according to the fee rate.
   * 
   * @returns the required fees of this transaction in satoshis
   */
  public estimateRequiredFee(): number {
    let feeRate = this._feePerByte || Transaction.FEE_PER_BYTE;
    return feeRate * this._estimateSize();
  }

  public clearSignatures(): void {
    this.inputs.forEach(input => input.clearSignatures());
  }

  /**
   * Retrieve a hexa string that can be used with nexad's CLI interface
   * (decoderawtransaction, sendrawtransaction)
   *
   * @param opts allows to skip certain tests.
   */
  public checkedSerialize(opts?: TxVerifyOptions): string {
    let serializationError = this.getSerializationError(opts);
    if (serializationError) {
      throw serializationError;
    }
    return this.toString();
  }

  public uncheckedSerialize = this.toString;

  public toString(): string {
    return this.toBuffer().toString('hex');
  }

  public inspect(): string {
    return `<Transaction: ${this}>`;
  }

  public fromString(string: string): this {
    return this.fromBuffer(Buffer.from(string, 'hex'));
  }

  /**
   * Retrieve a hexa string that can be used with nexad's CLI interface
   * (decoderawtransaction, sendrawtransaction)
   *
   * @param unsafe if true, skip all tests. if it's an object,
   * it's expected to contain a set of flags to skip certain tests.
   * 
   * @see {@link TxVerifyOptions}
   */
  public serialize(unsafe?: boolean | TxVerifyOptions): string {
    if (true === unsafe || (isObject(unsafe) && unsafe.disableAll)) {
      return this.uncheckedSerialize();
    } else {
      return this.checkedSerialize(isObject(unsafe) ? unsafe : undefined);
    }
  }

  /**
   * Manually set the fee for this transaction. Beware that this resets all the signatures
   * for inputs.
   *
   * @param amount satoshis to be set as fees
   * @return this, for chaining
   */
  public setFee(amount: number): this {
    ValidationUtils.validateArgument(isNumber(amount), 'amount must be a number');
    this._fee = amount;
    this._updateChangeOutput();
    return this;
  }

  /**
   * Manually set the fee per Byte for this transaction. Beware that this resets all the signatures
   * for inputs.
   * fee per Byte will be ignored if fee property was set manually
   *
   * @param amount satoshis per Byte to be used as fee rate
   * @return this, for chaining
   */
  public setFeePerByte(amount: number): this {
    ValidationUtils.validateArgument(isNumber(amount), 'amount must be a number');
    this._feePerByte = amount;
    this._updateChangeOutput();
    return this;
  }

  /**
   * Add an output to the transaction.
   *
   * @param output the output to add.
   * @return this, for chaining
   */
  public addOutput(output: Output): this {
    ValidationUtils.validateArgumentType(output, Output, 'output');
    this.outputs.push(output);
    this._updateChangeOutput();
    return this;
  }

  public removeOutput(index: number): this {
    this._removeOutput(index);
    this._updateChangeOutput();
    return this;
  }

  private _removeOutput(index: number): void {
    this.outputs = this.outputs.filter((_, i) => i !== index);
  }

  /**
   * Remove all outputs from the transaction.
   *
   * @return this, for chaining
   */
  public clearOutputs(): this {
    this.outputs = [];
    this.clearSignatures();
    this._updateChangeOutput();
    return this;
  }

  public updateOutputAmount(index: number, sats: bigint | number): void {
    this.outputs[index].value = BigInt(sats);
    this._updateChangeOutput();
  }

  /**
   * Set the change address for this transaction
   *
   * Beware that this resets all the signatures for inputs.
   *
   * @param address An address for change to be sent to.
   * @return this, for chaining
   */
  public setChangeOutput(address: string | Address): this {
    ValidationUtils.validateArgument(!isNil(address), 'address is required.');
    this._changeScript = ScriptFactory.buildOutFromAddress(address);
    this._updateChangeOutput();
    return this;
  }

  /**
   * @returns change output, if it exists
   */
  public getChangeOutput(): Output | undefined {
    if (!isUndefined(this._changeIndex)) {
      return this.outputs[this._changeIndex];
    }
    return undefined;
  }

  private _updateChangeOutput(): void {
    if (!this._changeScript) {
      return;
    }
    this.clearSignatures();
    if (!isUndefined(this._changeIndex)) {
      this._removeOutput(this._changeIndex);
    }
    let available = this.getUnspentValue();
    let fee = this.getFee();
    let changeAmount = available - BigInt(fee);

    if (changeAmount >= Transaction.DUST_AMOUNT) {
      this._changeIndex = this.outputs.length;
      this.outputs.push(new Output(changeAmount, this._changeScript));
    } else {
      this._changeIndex = undefined;
    }
  }

  /**
   * Add an input to this transaction, without checking that the input has information about
   * the output that it's spending.
   *
   * @param input the input to add
   * @return this, for chaining
   */
  public uncheckedAddInput(input: Input): this {
    ValidationUtils.validateArgumentType(input, Input, 'input');
    this.inputs.push(input);
    this._updateChangeOutput();
    return this;
  }

  /**
   * Add an input to this transaction. The input must be an instance of the `Input` class.
   * It should have information about the Output that it's spending, but if it's not already
   * set, two additional parameters, `outputScript` and `amount` can be provided.
   *
   * @param input
   * @param outputScript
   * @param amount
   * @return this, for chaining
   */
  public addInput(input: Input, outputScript?: IScript | Buffer | string, amount?: bigint | number): this {
    ValidationUtils.validateArgumentType(input, Input, 'input');
    if (isUndefined(input.output) && (isUndefined(outputScript) || isUndefined(amount))) {
      throw new Error('Need information about the UTXO script and amount');
    }
    if (isUndefined(input.output) && !isUndefined(outputScript) && !isUndefined(amount)) {
      let scriptPubKey = outputScript instanceof Script ? outputScript : new Script(outputScript);
      input.output = new Output(BigInt(amount), scriptPubKey);
    }
    return this.uncheckedAddInput(input);
  }

  public removeInput(outpoint: string): this {
    this.inputs = this.inputs.filter(input => input.outpoint.toString('hex') != outpoint);
    this._updateChangeOutput();
    return this;
  }

  /**
   * Sets nLockTime so that transaction is not valid until the desired date or height.
   * Beware that this method will also set the inputs sequence number to max_int - 1
   * 
   * @remarks nLockTime considered as height if the value is between 0 - 499,999,999.
   *  above that considered as date (unix timestamp).
   * 
   * @see {@link NLOCKTIME_BLOCKHEIGHT_LIMIT}
   * 
   * @param locktime 
   * @returns 
   */
  public setLockTime(locktime: number): this {
    ValidationUtils.validateArgument(isNumber(locktime), 'locktime', 'must be a number');

    this.inputs.forEach(input => {
      if (input.sequenceNumber === Input.SEQUENCE_FINAL) {
        input.sequenceNumber = Input.SEQUENCE_FINAL - 1;
      }
    });

    this.nLockTime = locktime;
    return this;
  }

  /**
   *  Returns a semantic version of the transaction's nLockTime.
   *  If nLockTime is 0, it returns null,
   *  if it is < 500000000, it returns a block height (number)
   *  else it returns a Date object.
   */
  public getLockTime(): number | Date | null {
    if (!this.nLockTime) {
      return null;
    }
    if (this.nLockTime < Transaction.NLOCKTIME_BLOCKHEIGHT_LIMIT) {
      return this.nLockTime;
    }
    return new Date(1000 * this.nLockTime);
  }

  public toBuffer(): Buffer {
    return this.toBufferWriter().toBuffer();
  }

  public toBufferWriter(writer?: BufferWriter, withInputsScripts = true): BufferWriter {
    if (!writer) {
      writer = new BufferWriter();
    }
    writer.writeUInt8(this.version);

    writer.writeVarintNum(this.inputs.length);
    this.inputs.forEach(input => input.toBufferWriter(writer, withInputsScripts));

    writer.writeVarintNum(this.outputs.length);
    this.outputs.forEach(output => output.toBufferWriter(writer));

    writer.writeUInt32LE(this.nLockTime);
    return writer;
  }

  private _toIdemBuffer(): Buffer {
    let writer = new BufferWriter();
    return this.toBufferWriter(writer, false).toBuffer();
  }

  private _toSatisfierBuffer(): Buffer {
    let writer = new BufferWriter();

    writer.writeInt32LE(this.inputs.length);
    this.inputs.forEach(input => {
      writer.write(input.scriptSig.toBuffer());
      writer.writeUInt8(Opcode.OP_INVALIDOPCODE);
    });

    return writer.toBuffer();
  }

  public fromBuffer(buffer: Buffer): this {
    let reader = new BufferReader(buffer);
    return this.fromBufferReader(reader);
  }
  
  public fromBufferReader(reader: BufferReader): this {
    ValidationUtils.validateState(!reader.finished(), 'No transaction data received');
  
    this.version = reader.readUInt8();
    let sizeTxIns = reader.readVarintNum();
    for (let i = 0; i < sizeTxIns; i++) {
      this.inputs.push(Input.fromBufferReader(reader));
    }
    let sizeTxOuts = reader.readVarintNum();
    for (let i = 0; i < sizeTxOuts; i++) {
      this.outputs.push(Output.fromBufferReader(reader));
    }
    this.nLockTime = reader.readUInt32LE();
    return this;
  }

  public toJSON = this.toObject;

  public toObject(): ITransaction {
    let obj: ITransaction = {
      id: this.id,
      idem: this.idem,
      version: this.version,
      inputs: this.inputs.map(input => input.toObject()),
      outputs: this.outputs.map(output => output.toObject()),
      nLockTime: this.nLockTime
    };
    if (!isUndefined(this._changeScript)) {
      obj.changeScript = this._changeScript.toHex();
    }
    if (!isUndefined(this._changeIndex)) {
      obj.changeIndex = this._changeIndex;
    }
    if (!isUndefined(this._fee)) {
      obj.fee = this._fee;
    }
    if (!isUndefined(this._feePerByte)) {
      obj.feePerByte = this._feePerByte;
    }
    return obj;
  }

  public fromObject(transaction: ITransaction): this {
    ValidationUtils.validateArgument(isObject(transaction), 'transaction');
    if (transaction instanceof Transaction) {
      transaction = transaction.toObject();
    }

    this.nLockTime = transaction.nLockTime;
    this.version = transaction.version;

    for (let input of transaction.inputs) {
      if (isUndefined(input.output?.scriptPubKey)) {
        this.uncheckedAddInput(new Input(input));
        continue;
      }

      let script = new Script(input.output.scriptPubKey);
      let txin: Input;
      if (script.isPublicKeyHashOut()) {
        txin = new PublicKeyHashInput(input);
      } else if (script.isPublicKeyTemplateOut()) {
        txin = new PublicKeyTemplateInput(input);
      } else if (script.isScriptTemplateOut()) {
        if ('templateData' in input) {
          txin = new ScriptTemplateInput(input);
        } else {
          txin = new Input(input);
        }
      } else {
        throw new Error(`Unsupported input script type: ${script}`);
      }
      this.addInput(txin);
    }

    for(let output of transaction.outputs) {
      this.addOutput(Output.fromObject(output));
    }

    if (!isUndefined(transaction.changeIndex)) {
      this._changeIndex = transaction.changeIndex;
    }
    if (!isUndefined(transaction.changeScript)) {
      this._changeScript = new Script(transaction.changeScript);
    }
    if (!isUndefined(transaction.fee)) {
      this._fee = transaction.fee;
    }
    if (!isUndefined(transaction.feePerByte)) {
      this._feePerByte = transaction.feePerByte;
    }
    this._checkConsistency(transaction);
    return this;
  }

  private _checkConsistency(transaction: ITransaction): void {
    if (!isUndefined(this._changeIndex)) {
      ValidationUtils.validateState(!isUndefined(this._changeScript), 'Change script is expected.');
      ValidationUtils.validateState(!isUndefined(this.outputs[this._changeIndex]), 'Change index points to undefined output.');
      ValidationUtils.validateState(this.outputs[this._changeIndex].scriptPubKey.toHex() ===
        this._changeScript?.toHex(), 'Change output has an unexpected script.');
    }
    if (transaction?.id) {
      ValidationUtils.validateState(transaction.id === this.id, 'Id in object does not match transaction id.');
    }
  }
}