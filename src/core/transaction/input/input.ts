import { isNil, isObject, isString, isUndefined } from "lodash-es";
import Script from "../../script/script";
import Output from "../output";
import type { IInput } from "../interfaces";
import BufferUtils from "../../../utils/buffer.utils";
import ValidationUtils from "../../../utils/validation.utils";
import type BufferReader from "../../../encoding/bufferreader";
import BufferWriter from "../../../encoding/bufferwriter";
import BN from "../../../crypto/bn.extension";
import type PrivateKey from "../../../keys/privatekey";
import type TxSignature from "../txsignature";

export enum  InputType {
  UTXO = 0,
  READ_ONLY = 1
}

export default class Input implements IInput {

  public static readonly SEQUENCE_FINAL = 0xffffffff;

  public type!: InputType;
  public outpoint!: Buffer;
  public amount!: bigint;
  public sequenceNumber!: number
  public output?: Output;

  private _scriptSig!: Script;

  constructor(params?: IInput) {
    if (params) {
      this._set(params);
    }    
  }

  public get scriptSig(): Script {
    return this._scriptSig;
  }

  public set scriptSig(script: string | Script) {
    if (script instanceof Script) {
      this._scriptSig = script;
    } else if (isString(script)) {
      this._scriptSig = Script.fromString(script);
    } else {
      throw new TypeError('Invalid argument type: script');
    }
  }

  private _set(params: IInput): void {
    this.type = InputType.UTXO;
    if (isNil(params.scriptSig)) {
      throw new TypeError('Need a script to create an input');
    }
    this.scriptSig = params.scriptSig;
    this.outpoint = BufferUtils.isBuffer(params.outpoint) ? params.outpoint : Buffer.from(params.outpoint, 'hex');
    this.amount = BigInt(params.amount);
    this.sequenceNumber = isUndefined(params.sequenceNumber) ? Input.SEQUENCE_FINAL : params.sequenceNumber;
    if (params.output) {
      this.output = params.output instanceof Output ? params.output : Output.fromObject(params.output);
    }
  }

  public static fromObject(obj: IInput): Input {
    ValidationUtils.validateArgument(isObject(obj), "obj");
    return new Input(obj);
  }

  public toJSON = this.toObject;

  public toObject(): IInput {
    return {
      type: this.type,
      outpoint: this.outpoint.toString('hex'),
      amount: this.amount.toString(),
      sequenceNumber: this.sequenceNumber,
      scriptSig: this.scriptSig.toHex(),
      output: this.output?.toObject()
    };
  }

  public static fromBufferReader(br: BufferReader): Input {
    let input = new Input();
    input.type = br.readUInt8();
    input.outpoint = br.readReverse(32);
    input.scriptSig = Script.fromBuffer(br.readVarLengthBuffer());
    input.sequenceNumber = br.readUInt32LE();
    input.amount = br.readUInt64LEBN().toBigInt();
    return input;
  }
  
  public toBufferWriter(writer?: BufferWriter, includeScript = true): BufferWriter {
    if (!writer) {
      writer = new BufferWriter();
    }
    writer.writeUInt8(this.type);
    writer.writeReverse(this.outpoint);
    if (includeScript) {
      writer.writeVarLengthBuf(this.scriptSig.toBuffer());
    }
    writer.writeUInt32LE(this.sequenceNumber);
    writer.writeUInt64LEBN(BN.fromBigInt(this.amount));
    return writer;
  }

  public estimateSize(): number {
    return this.toBufferWriter().toBuffer().length;
  }

  public isFinal(): boolean {
    return this.sequenceNumber !== Input.SEQUENCE_FINAL;
  }

  public clearSignatures(): this {
    this.scriptSig = Script.empty();
    return this;
  }

  public getSubscript(): Script {
    throw Error(`Abstract Method Invocation: Input#getSubscript`);
  }

  /**
   * @returns true if the provided private key can sign this input
   */
  public canSign(_privateKey: PrivateKey): boolean {
    throw Error(`Abstract Method Invocation: Input#canSign`);
  }
  
  public isFullySigned(): boolean {
    throw Error(`Abstract Method Invocation: Input#isFullySigned`);
  }

  public addSignature(_signature: TxSignature): this {
    throw Error(`Abstract Method Invocation: Input#addSignature`);
  }
}