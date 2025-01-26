import { isObject, isString, isUndefined } from "lodash-es";
import BN from "../../crypto/bn.extension";
import CommonUtils from "../../utils/common.utils";
import ValidationUtils from "../../utils/validation.utils";
import Script from "../script/script";
import type BufferReader from "../../encoding/bufferreader";
import BufferWriter from "../../encoding/bufferwriter";
import type { IOutput } from "./interfaces";

export enum  OutputType {
  SATOSCRIPT = 0,
  TEMPLATE = 1,
  INFER = 0x8000 // Not a real type: implies the type should be infered from the script at construction time
}

export default class Output implements IOutput {

  public type: OutputType;

  private _value!: bigint;
  private _scriptPubKey!: Script;

  constructor(value: bigint | number | string, scriptPubKey: Script | string, type = OutputType.INFER) {
    this.type = type;
    this.value = value;
    this.scriptPubKey = scriptPubKey;
  }

  public get value(): bigint {
    return this._value;
  }

  public set value(sats: bigint | number | string) {
    sats = BigInt(sats);
    ValidationUtils.validateArgument(CommonUtils.isNaturalBigInt(sats), "Output value is not a natural bigint");
    this._value = sats;
  }

  public get scriptPubKey(): Script {
    return this._scriptPubKey;
  }

  public set scriptPubKey(script: Script | string) {
    if (!isUndefined(this._scriptPubKey)) {
      this.type = OutputType.INFER;
    }

    if (script instanceof Script) {
      this._scriptPubKey = script;
    } else if (isString(script)) {
      this._scriptPubKey = Script.fromString(script);
    } else {
      throw new TypeError('Invalid argument type: script');
    }

    // in case we replace script or type wasn't passed in c'tor, we need to define the output type
    if (this.type == OutputType.INFER) {
      this.type = this._scriptPubKey.isPublicKeyTemplateOut() || this._scriptPubKey.isScriptTemplateOut()
              ? OutputType.TEMPLATE : OutputType.SATOSCRIPT;
    }
  }

  public invalidValue(): string | false {
    if (this.value > BigInt(Number.MAX_SAFE_INTEGER)) {
      return 'transaction txout value greater than max safe integer';
    }
    if (this.value < 0n) {
      return 'transaction txout negative';
    }
    return false;
  }

  public toObject(): IOutput {
    return {
      type: this.type,
      value: this.value.toString(),
      scriptPubKey: this.scriptPubKey.toHex()
    };
  }

  public toJSON = this.toObject;
  
  public static fromObject(data: IOutput): Output {
    ValidationUtils.validateArgument(isObject(data), "data", "Unrecognized argument for Output")
    return new Output(data.value, data.scriptPubKey, data.type);
  }

  public inspect(): string {
    return `<Output (type: ${this.type}) (${this.value.toString()} sats) ${this.scriptPubKey.inspect()}>`;
  }

  public static fromBufferReader(br: BufferReader): Output {
    let type = br.readVarintNum();
    let value = br.readUInt64LEBN();
  
    let size = br.readVarintNum();
    let scriptBuf = size !== 0 ? br.read(size) : Buffer.from([]);

    return new Output(value.toBigInt(), Script.fromBuffer(scriptBuf), type);
  }

  public toBufferWriter(writer?: BufferWriter): BufferWriter {
    if (!writer) {
      writer = new BufferWriter();
    }
    writer.writeUInt8(this.type);
    writer.writeUInt64LEBN(BN.fromBigInt(this.value));
    writer.writeVarLengthBuf(this.scriptPubKey.toBuffer());
    
    return writer;
  }
}