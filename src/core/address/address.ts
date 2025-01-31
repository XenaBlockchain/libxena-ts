import { isArray, isNil, isString } from "lodash-es";
import type { Networkish } from "../../common/types";
import ValidationUtils from "../../utils/validation.utils";
import { networks } from "../network/network-manager";
import AddressFormatter, { AddressType } from "./address-formatter";
import type { Network } from "../network/network";
import type { AddressDto } from "../../common/interfaces";
import CommonUtils from "../../utils/common.utils";
import PublicKey from "../../keys/publickey";
import Hash from "../../crypto/hash";
import Script from "../script/script";
import type { ScriptElement } from "../script/script";
import { Opcode } from "../script/opcode";
import BufferUtils from "../../utils/buffer.utils";
import BufferWriter from "../../encoding/bufferwriter";

export default class Address {

  public readonly data!: Buffer;
  public readonly network!: Network;
  public readonly type!: AddressType;

  /* c8 ignore start */
  /** @deprecated use data */
  public get hashBuffer(): Buffer {
    return this.data;
  }
  /* c8 ignore stop */

  /**
   * Instantiate an address from an address String or Buffer, a public key or script hash Buffer,
   * or an instance of {@link PublicKey} or {@link Script}.
   *
   * This is an immutable class, and if the first parameter provided to this constructor is an
   * `Address` instance, the same argument will be returned.
   *
   * An address has two key properties: `network` and `type`. The type is either
   * `AddressType.PayToPublicKeyHash` (value is the `'P2PKH'` string)
   * or `AddressType.PayToScriptTemplate` (the string `'P2ST'`). The network is an instance of {@link Network} or network name.
   * You can quickly check whether an address is of a given kind by using the methods
   * `isPayToPublicKeyHash` and `isPayToScriptTemplate`
   *
   * @example
   * ```javascript
   * // validate that an input field is valid
   * let error = Address.getValidationError(input, 'testnet');
   * if (!error) {
   *   let address = new Address(input, 'testnet');
   * } else {
   *   // invalid network or checksum (typo?)
   *   let message = error.messsage;
   * }
   *
   * // get an address from a public key
   * let address = Address.fromPublicKey(publicKey, 'testnet').toString();
   * ```
   *
   * @param data The encoded data in various formats
   * @param network The network: 'mainnet' (default) or 'testnet'
   * @param type The type of address: 'P2ST' (default) or 'P2PKH' or 'GROUP'
   * @returns A new valid and frozen instance of an Address
   */
  constructor(data: Address | string | Buffer, network?: Networkish, type?: AddressType) {
    ValidationUtils.validateArgument(!isNil(data), 'First argument is required, please include address data.');

    if (data instanceof Address) {
      return data; // Immutable instance
    }

    if (isString(data)) {
      return Address.fromString(data);
    }

    ValidationUtils.validateArgument(BufferUtils.isBuffer(data), "data must be Address, string or Buffer");

    Address.validateParams(network, type);

    this.data = data;
    this.network = networks.get(network) || networks.defaultNetwork;
    this.type = type || AddressType.PayToScriptTemplate;
  }

  public static validateParams(network?: Networkish, type?: AddressType): void {
    if (network && !networks.get(network)) {
      throw new TypeError('Second argument must be "mainnet" or "testnet".');
    }
  
    if (type && (type !== AddressType.PayToScriptTemplate && type !== AddressType.GroupIdAddress && type !== AddressType.PayToPublicKeyHash)) {
      throw new TypeError('Third argument must be "P2ST", "P2PKH" or "GROUP"');
    }
  }

  /**
   * @param address string
   * 
   * @returns A new valid and frozen instance of an Address
   */
  public static fromString(address: string): Address {
    ValidationUtils.validateArgument(isString(address), 'parameter supplied is not a string.');
    ValidationUtils.validateArgument(address.length > 34, 'Invalid Address string provided');

    let parts = AddressFormatter.decode(address);
    let network = networks.get(parts.prefix, 'prefix');
    return new Address(parts.data, network, parts.type);
  }

  /** @deprecated use fromString */
  public static decodeNexaAddress = this.fromString;

  /**
   * Will return a cashaddr representation of the address. Always return lower case
   * Can be converted by the caller to uppercase is needed (still valid).
   *
   * @returns Nexa address
   */
  public toString(): string {
    return AddressFormatter.encode(this.network.prefix, this.type, this.data);
  }

  /** @deprecated use toString */
  public toNexaAddress = this.toString;

  /**
   * Will return a string formatted for the console
   *
   * @returns {string} Bitcoin address
   */
  public inspect(): string {
    return `<Address: ${this}, type: ${this.type}, network: ${this.network}>`;
  }

  /**
   * Instantiate an address from an Object
   *
   * @param obj - A JSON object with keys: data, network and type
   * @returns A new valid instance of an Address
   */
  public static fromObject(obj: AddressDto): Address {
    ValidationUtils.validateArgument(isString(obj?.data), 'Must provide a `data` property');
    ValidationUtils.validateArgument(isString(obj?.type), 'Must provide a `type` property');
    ValidationUtils.validateState(CommonUtils.isHexa(obj.data), `Unexpected data property, expected to be hex.`);

    let hashBuffer = Buffer.from(obj.data, 'hex');
    return new Address(hashBuffer, obj.network, obj.type as AddressType);
  }

  /**
   * @returns A plain object with the address information
   */
  public toJSON(): AddressDto {
    return {
      data: this.data.toString('hex'),
      type: this.type,
      network: this.network.toString()
    };
  }

  public toObject = this.toJSON;

  /**
   * @return true if an address is of pay to public key hash type
   */
  public isPayToPublicKeyHash(): boolean {
    return this.type === AddressType.PayToPublicKeyHash;
  }

  /**
   * @return true if an address is of pay to script template type
   */
  public isPayToScriptTemplate(): boolean {
    return this.type === AddressType.PayToScriptTemplate;
  }

  /**
   * @return true if an address is a group token address
   */
  public isGroupIdentifierAddress(): boolean {
    return this.type === AddressType.GroupIdAddress;
  }

  /**
   * Will return a validation error if exists
   *
   * @example
   * ```javascript
   * // a network mismatch error
   * let error = Address.getValidationError('nexatest:nqtsq5g567x44x5g54t2wsxz60zwqmyks63rkrddl4stwnzu', 'testnet');
   * ```
   *
   * @param data The encoded data
   * @param network either a Network instance, 'mainnet', or 'testnet'
   * @param type The type of address: 'P2ST' or 'GROUP' or 'P2PKH'
   * @returns The corresponding error message
   */
  public static getValidationError(data: string | Buffer, network?: Networkish, type?: AddressType): Error | undefined {
    try {
      if (isString(data)) {
        let addr = Address.fromString(data);
        data = addr.data;

        if (network && networks.get(network)?.prefix !== addr.network.prefix) {
          throw new Error('Address has mismatched network type.');
        }
        network = addr.network;

        if (type && type !== addr.type) {
          throw new Error('Address has mismatched type.');
        }
        type = addr.type;
      }
      this.validateParams(network, type);
      AddressFormatter.encode(networks.get(network)?.prefix || networks.defaultNetwork.prefix, type || AddressType.PayToScriptTemplate, data);
    } catch (e) {
      return e as Error;
    }
  }

  /**
   * Will return a boolean if an address is valid
   *
   * @example
   * ```javascript
   * assert(Address.isValid('nexa:nqtsq5g567x44x5g54t2wsxz60zwqmyks63rkrddsfq94pd2', 'mainned'));
   * ```
   *
   * @param data The encoded data
   * @param network either a Network instance, 'mainnet', or 'testnet'
   * @param type The type of address: 'P2ST' or 'GROUP' or 'P2PKH'
   * @returns true if valid
   */
  public static isValid(data: string | Buffer, network?: Networkish, type?: AddressType): boolean {
    return !Address.getValidationError(data, network, type);
  }

  /**
   * Instantiate an address from a PublicKey instance
   *
   * @param pubkey the public key instance
   * @param network either a Network instance, 'mainnet' or 'testnet'
   * @param type address encoding type
   * @returns A new valid and frozen instance of an Address
   */
  public static fromPublicKey(pubkey: PublicKey, network?: Networkish, type?: AddressType): Address {
    let data = this._transformPublicKey(pubkey, type);
    return new Address(data, network, type);
  }

  /**
   * Instantiate an address from a non grouped script template
   *
   * @param templateHash An instance of a template hash Buffer
   * @param constraintHash An instance of a constraint hash Buffer
   * @param visibleArgs An array of push-only args, or hex string represent script buffer, or Script with push args
   * @param network either a Network instance, 'mainnet' or 'testnet'
   * @returns A new valid and frozen instance of an Address
   */
  public static fromScriptTemplate(templateHash: Buffer | Opcode, constraintHash: Buffer | Opcode, visibleArgs?: string | Script | ScriptElement[], network?: Networkish): Address {
    let data = Address._transformScriptTemplate(templateHash, constraintHash, visibleArgs);
    return new Address(data, network, AddressType.PayToScriptTemplate);
  }

  /**
   * Internal function to transform a {@link PublicKey}
   */
  private static _transformPublicKey(pubkey: PublicKey, type = AddressType.PayToScriptTemplate): Buffer {
    ValidationUtils.validateArgument(pubkey instanceof PublicKey, 'Address must be an instance of PublicKey.')

    if (type === AddressType.PayToPublicKeyHash) {
      return Hash.sha256ripemd160(pubkey.toBuffer());
    } else if (type === AddressType.PayToScriptTemplate) {
      let constraint = Script.empty().add(pubkey.toBuffer());
      let constraintHash = Hash.sha256ripemd160(constraint.toBuffer());
      return Address._transformScriptTemplate(Opcode.OP_1, constraintHash);
    } else {
      throw new Error("type must be P2ST or P2PKH");
    }
  }

  /**
   * Internal function to transform a Script Template params
   */
  private static _transformScriptTemplate(templateHash: Buffer | Opcode, constraintHash: Buffer | Opcode, visibleArgs?: string | Script | ScriptElement[]): Buffer {
    if (templateHash != Opcode.OP_1 && !BufferUtils.isHashBuffer(templateHash)) {
      throw new TypeError('templateHash supplied is not a hash buffer or well-known OP_1.');
    }
    if (constraintHash != Opcode.OP_FALSE && !BufferUtils.isHashBuffer(constraintHash)) {
      throw new TypeError('constraintHash supplied is not a hash buffer or OP_FALSE.');
    }

    let scriptTemplate = Script.empty().add(Opcode.OP_FALSE).add(templateHash).add(constraintHash);
    if (visibleArgs) {
      if (isArray(visibleArgs)) {
        visibleArgs.forEach(arg => scriptTemplate.add(arg));
      } else if (visibleArgs instanceof Script) {
        scriptTemplate.add(visibleArgs);
      } else if (CommonUtils.isHexa(visibleArgs)) {
        scriptTemplate.add(Script.fromHex(visibleArgs));
      }
    }

    return new BufferWriter().writeVarLengthBuf(scriptTemplate.toBuffer()).toBuffer();
  }

  /**
   * Will return the transaction output type by the address type
   * 
   * @param address as string
   * @returns 1 - Template, 0 - otherwise
   */
  public static getOutputType(address: string): number {
    return this.fromString(address).getOutputType();
  }

  /**
   * Will return the transaction output type by the address type
   * 
   * @returns 1 - Template, 0 - otherwise
   */
  public getOutputType(): number {
    return this.isPayToScriptTemplate() ? 1 : 0;
  }
}