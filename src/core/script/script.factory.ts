import { inRange, isEmpty, isNil, isNumber, isString, isUndefined } from "lodash-es";
import PublicKey from "../../keys/publickey";
import ValidationUtils from "../../utils/validation.utils";
import Address from "../address/address";
import Script from "./script";
import ScriptOpcode, { Opcode } from "./opcode";
import CommonUtils from "../../utils/common.utils";
import BN from "../../crypto/bn.extension";
import BufferReader from "../../encoding/bufferreader";
import BufferUtils from "../../utils/buffer.utils";
import Signature from "../../crypto/signature";
import { AddressType } from "../address/address-formatter";
import GroupToken, { GroupIdType } from "../grouptoken";

/**
 * A factory class for creating scripts with predefined configurations and flags.
 */
export default class ScriptFactory {

  /**
   * @param to destination address or public key
   * @param groupId group id buffer or group address or hex id - only if its token output script
   * @param groupAmount optional. quantity amount buffer or bigint - only if its token output script
   * 
   * @returns a new pay to public key / script template output for the given address or public key
   */
  public static buildScriptTemplateOut(to: string | Address | PublicKey, groupId?: string | Address | Buffer, groupAmount?: Buffer | bigint): Script {
    ValidationUtils.validateArgument(!isUndefined(to), "to", "must provide an argument");
    ValidationUtils.validateArgument(to instanceof PublicKey || to instanceof Address || isString(to), "to", "must be address or pubkey");
    ValidationUtils.validateArgument((isNil(groupId) && isNil(groupAmount)) || (!isNil(groupId) && !isNil(groupAmount)), "group data", "both must present or both not present");

    to = this.parseAddress(to);
    ValidationUtils.validateArgument(to.isPayToScriptTemplate(), 'Invalid destination address (not a script template)');

    if (isString(groupId)) {
      if (CommonUtils.isHexa(groupId)) {
        groupId = Buffer.from(groupId, 'hex');
      } else {
        let groupIdAddr = Address.fromString(groupId);
        ValidationUtils.validateArgument(groupIdAddr.isGroupIdentifierAddress(), 'Invalid group id address (not a group)');
        groupId = groupIdAddr.data;
      }
    } else if (groupId instanceof Address) {
      ValidationUtils.validateArgument(groupId.isGroupIdentifierAddress(), 'Invalid group id address (not a group)');
      groupId = groupId.data;
    }

    if (typeof groupAmount === 'bigint') {
      groupAmount = GroupToken.getAmountBuffer(groupAmount);
    }
    
    let bfr = new BufferReader(to.data).readVarLengthBuffer();
    let s = Script.fromBuffer(bfr);

    if (!isNil(groupId) && !isNil(groupAmount)) {
      ValidationUtils.validateArgument(BufferUtils.isBuffer(groupId), 'groupId');
      ValidationUtils.validateArgument(BufferUtils.isBuffer(groupAmount), 'groupAmount');
      // replace OP_0 with group data
      s.chunks = s.chunks.slice(1);
      s.prepend(groupAmount).prepend(groupId);
    }

    return s;
  }

  /**
   * @param data the data to embed in the output
   * @param encoding the type of encoding of the string
   * 
   * @returns a new OP_RETURN script with data
   */
  public static buildDataOut(data?: string | Buffer | Script, encoding?: BufferEncoding): Script {
    ValidationUtils.validateArgument(isUndefined(data) || isString(data) || BufferUtils.isBuffer(data) || data instanceof Script, "data");
    if (isString(data)) {
      data = Buffer.from(data, encoding);
    }

    let s = Script.empty().add(Opcode.OP_RETURN);
    if (!isUndefined(data)) {
      s.add(data);
    }
    return s;
  }

  /**
   * @param address the pay to address
   * @param groupId optional. only for p2st addresses
   * @param groupAmount optional. only for p2st addresses
   * 
   * @return an output script built from the address
   */
  public static buildOutFromAddress(address: Address | string, groupId?: string | Address | Buffer, groupAmount?: Buffer | bigint): Script {
    if (isString(address)) {
      address = Address.fromString(address);
    }
    
    if (address.isPayToPublicKeyHash()) {
      return this.buildPublicKeyHashOut(address);
    } else if (address.isPayToScriptTemplate()) {
      return this.buildScriptTemplateOut(address, groupId, groupAmount);
    }
    throw new Error(`Invalid address type: ${address.type}`);
  }

  /**
   * Builds a scriptSig (a script for an input) that signs a script template
   * output script.
   *
   * @param template the template script or OP_1 for well-known
   * @param constraint the constraint script or OP_FALSE
   * @param satisfier the satisfier script or buffer
   */
  public static buildScriptTemplateIn(template: Script | Opcode, constraint: Script | Opcode, satisfier: Buffer | Script): Script {
    ValidationUtils.validateArgument(template instanceof Script || template === Opcode.OP_1, "template");
    ValidationUtils.validateArgument(constraint instanceof Script || constraint === Opcode.OP_FALSE, "constraint");
    ValidationUtils.validateArgument(satisfier instanceof Script || BufferUtils.isBuffer(satisfier), "satisfier");

    let script = Script.empty()
    if (template instanceof Script) {
      script.add(template.toBuffer());
    }
    if (constraint instanceof Script) {
      script.add(constraint.toBuffer());
    }
    if (BufferUtils.isBuffer(satisfier)) {
      satisfier = Script.fromBuffer(satisfier);
    }
    script.add(satisfier);

    return script;
  }

  private static parseAddress(address: string | Address | PublicKey, type?: AddressType): Address {
    if (isString(address)) {
      return Address.fromString(address);
    } else if (address instanceof PublicKey) {
      return Address.fromPublicKey(address, address.network, type);
    }
    return address;
  }

  /**
   * @param to - destination address or public key
   * 
   * @returns a new pay to public key hash output for the given
   * address or public key
   */
  public static buildPublicKeyHashOut(to: string | Address | PublicKey): Script {
    ValidationUtils.validateArgument(!isUndefined(to), "to", "must provide an argument");
    ValidationUtils.validateArgument(to instanceof PublicKey || to instanceof Address || isString(to), "to", "must be address or pubkey");

    to = this.parseAddress(to, AddressType.PayToPublicKeyHash);
    return Script.empty().add(Opcode.OP_DUP).add(Opcode.OP_HASH160).add(to.data).add(Opcode.OP_EQUALVERIFY).add(Opcode.OP_CHECKSIG);
  }

  /**
   * Builds a scriptSig (a script for an input) that signs a public key hash
   * output script. (SIGHASH_ALL only)
   *
   * @param publicKey
   * @param signature a Signature object, or the signature in DER canonical encoding
   */
  public static buildPublicKeyHashIn(publicKey: PublicKey, signature: Signature | Buffer): Script {
    ValidationUtils.validateArgument(publicKey instanceof PublicKey, "publicKey");
    ValidationUtils.validateArgument(signature instanceof Signature || BufferUtils.isBuffer(signature), "signature");

    if (signature instanceof Signature) {
      signature = signature.toBuffer();
    }

    let script = Script.empty()
      .add(signature)
      .add(publicKey.toBuffer());
    return script;
  }

  /**
   * Build OP_RETURN output script for Legacy Token Description
   *
   * @param ticker the ticker as utf8.
   * @param name the ticker as utf8.
   * @param docUrl optional. the description document url
   * @param docHash optional. the document hash hex.
   * @param decimals optional. the decimals for the token amount.
   * 
   * @throws Error if docUrl provided and is invalid
   * 
   * @returns the output OP_RETURN script
   */
  public static buildTokenDescriptionLegacy(ticker: string, name: string, docUrl?: string, docHash?: string, decimals?: number): Script {
    ValidationUtils.validateArgument(isString(ticker) && inRange(ticker.length, 1, 9), 'Ticker must be between 1-8 chars');
    ValidationUtils.validateArgument(isString(name) && !isEmpty(name), 'Name is missing');

    let s = Script.empty()
      .add(Opcode.OP_RETURN)
      .add(BN.fromNumber(GroupIdType.LEGACY).toScriptNumBuffer())
      .add(Buffer.from(ticker))
      .add(Buffer.from(name));

    if (docUrl && docUrl.length > 0) {
      new URL(docUrl); // exception thrown if not valide
      ValidationUtils.validateArgument(isString(docHash) && !isEmpty(docHash), 'You must include document hash if you set document url');
      s.add(Buffer.from(docUrl)).add(Buffer.from(docHash as string, 'hex').reverse());
    } else {
      s.add(Opcode.OP_FALSE).add(Opcode.OP_FALSE);
    }

    if (isNumber(decimals)) {
      ValidationUtils.validateArgument(inRange(decimals, 0, 19), 'decimals must be between 0 and 18');
      s.add(decimals <= 16 ? ScriptOpcode.smallInt(decimals) : BN.fromNumber(decimals).toScriptNumBuffer());
    }

    return s;
  }

  /**
   * Build OP_RETURN output script for NRC1 Token Description
   *
   * @param ticker the ticker as utf8.
   * @param name the ticker as utf8.
   * @param zipURL the zip file url.
   * @param zipHash the zip file hash hex.
   * @param decimals the decimals for the token amount.
   * 
   * @throws Error if zipURL invalid
   * 
   * @returns the output OP_RETURN script
   */
  public static buildTokenDescription(ticker: string, name: string, zipURL: string, zipHash: string, decimals: number): Script {
    ValidationUtils.validateArgument(isString(ticker) && inRange(ticker.length, 2, 9), 'Ticker must be 2-8 chars');
    ValidationUtils.validateArgument(isString(name) && inRange(name.length, 2, 26), 'Name must be 2-25 chars');
    ValidationUtils.validateArgument(isString(zipURL) && !isEmpty(zipURL), 'Zip URL is missing');
    ValidationUtils.validateArgument(isString(zipHash) && !isEmpty(zipHash), 'Zip hash is missing');
    ValidationUtils.validateArgument(isNumber(decimals) && inRange(decimals, 0, 19), 'Decimals must be a number 0-18');
    new URL(zipURL); // exception thrown if not valid

    return Script.empty()
      .add(Opcode.OP_RETURN)
      .add(BN.fromNumber(GroupIdType.NRC1).toScriptNumBuffer())
      .add(Buffer.from(ticker))
      .add(Buffer.from(name))
      .add(Buffer.from(zipURL))
      .add(Buffer.from(zipHash, 'hex').reverse())
      .add(decimals <= 16 ? ScriptOpcode.smallInt(decimals) : BN.fromNumber(decimals).toScriptNumBuffer());
  }

  /**
   * Build OP_RETURN output script for an NFT Collection Description (NRC2)
   *
   * @param ticker the ticker as utf8.
   * @param name the ticker as utf8.
   * @param zipURL the zip file url.
   * @param zipHash the zip file hash hex.
   * 
   * @throws Error if zipURL invalid 
   * 
   * @returns the output OP_RETURN script
   */
  public static buildNFTCollectionDescription(ticker: string, name: string, zipURL: string, zipHash: string): Script {
    ValidationUtils.validateArgument(isString(ticker) && inRange(ticker.length, 2, 9), 'Ticker must be 2-8 chars');
    ValidationUtils.validateArgument(isString(name) && inRange(name.length, 2, 26), 'Name must be 2-25 chars');
    ValidationUtils.validateArgument(isString(zipURL) && !isEmpty(zipURL), 'Zip URL is missing');
    ValidationUtils.validateArgument(isString(zipHash) && !isEmpty(zipHash), 'Zip hash is missing');
    new URL(zipURL); // exception thrown if not valid

    return Script.empty()
      .add(Opcode.OP_RETURN)
      .add(BN.fromNumber(GroupIdType.NRC2).toScriptNumBuffer())
      .add(Buffer.from(ticker))
      .add(Buffer.from(name))
      .add(Buffer.from(zipURL))
      .add(Buffer.from(zipHash, 'hex').reverse())
      .add(ScriptOpcode.smallInt(0));
  }

  /**
   * Build OP_RETURN output script for an NFT that belongs to an NFT Collection (NRC3)
   *
   * @param zipURL the zip file url.
   * @param zipHash the zip file hash hex.
   * 
   * @throws Error if zipURL invalid 
   * 
   * @returns the output OP_RETURN script
   */
  public static buildNFTDescription(zipURL: string, zipHash: string): Script {
    ValidationUtils.validateArgument(isString(zipURL) && !isEmpty(zipURL), 'Zip URL is missing');
    ValidationUtils.validateArgument(isString(zipHash) && !isEmpty(zipHash), 'Zip hash is missing');
    new URL(zipURL); // exception thrown if not valid

    return Script.empty()
      .add(Opcode.OP_RETURN)
      .add(BN.fromNumber(GroupIdType.NRC3).toScriptNumBuffer())
      .add(Buffer.from(zipURL))
      .add(Buffer.from(zipHash, 'hex').reverse());
  }
}