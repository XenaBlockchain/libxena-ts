import BufferWriter from "../encoding/bufferwriter";
import { isEmpty, isNumber, isString, isUndefined } from "lodash-es";
import Script from "./script/script";
import BN from "../crypto/bn.extension";
import Hash from "../crypto/hash";
import type { GroupIdData } from "../common/interfaces";
import Address from "./address/address";
import BufferUtils from "../utils/buffer.utils";
import ValidationUtils from "../utils/validation.utils";
import CommonUtils from "../utils/common.utils";
import Message from "./message";
import type PrivateKey from "../keys/privatekey";

export enum GroupIdFlag {
  NONE = 0,
  COVENANT = 1, // covenants/encumberances -- output script template must match input
  HOLDS_NEX = 2, // group inputs and outputs must balance NEX, token quantity MUST be 0
  GROUP_RESERVED_BITS = 0xFFFF & ~(COVENANT | HOLDS_NEX),
  DEFAULT = NONE,
}

/**
 * Represent NFT creation identifier in OP_RETURN script
 */
export enum NFTIdentifier {
  /** Legacy token */
  LEGACY = 88888888,
  /** Token */
  NRC1 = 88888890,
  /** NFT Collection */
  NRC2 = 88888891,
  /** NFT that belongs to a collection */
  NRC3 = 88888892,
}

// ts/js does not support enums with bigint, so we use const object for now
const AUTH_FLAGS = {
  /** Is this a controller utxo (forces negative number in amount) */
  AUTHORITY: 1n << 63n,
  /** Can mint tokens */
  MINT: 1n << 62n,
  /** Can melt tokens */
  MELT: 1n << 61n,
  /** Can create authorities */
  BATON: 1n << 60n,
  /** Can change the redeem script */
  RESCRIPT: 1n << 59n,
  /** Can create subgroups */
  SUBGROUP: 1n << 58n,
  NONE: 0n,
  ALL_FLAG_BITS: 0xffffn << (64n - 16n),
}

const ACTIVE_FLAG_BITS = AUTH_FLAGS.AUTHORITY | AUTH_FLAGS.MINT | AUTH_FLAGS.MELT | AUTH_FLAGS.BATON | AUTH_FLAGS.RESCRIPT | AUTH_FLAGS.SUBGROUP;

/**
 * A util class with methods for group tokenization.
 */
export default class GroupToken {

  public static readonly PARENT_GROUP_ID_SIZE = 32;

  public static readonly authFlags = {
    ...AUTH_FLAGS,
    /** Has all permissions */
    ACTIVE_FLAG_BITS,
    RESERVED_FLAG_BITS: ACTIVE_FLAG_BITS & ~AUTH_FLAGS.ALL_FLAG_BITS
  };

  /**
   * Calculate a group ID based on the provided inputs. Pass 'null' to opReturnScript if there is not
   * going to be an OP_RETURN output in the transaction.
   *
   * @param outpoint The input outpoint hash hex or buffer
   * @param opReturnScript opReturn output script
   * @param authFlag group authority flag (use {@link GroupToken.authFlags})
   * @param idFlag group id flag
   * 
   * @returns Object with group id hash buffer and the nonce bigint
   */
  public static findGroupId(outpoint: string | Buffer, opReturnScript: Script | Buffer | null, authFlag: bigint, idFlag = GroupIdFlag.DEFAULT): GroupIdData {
    let hash: Buffer;
    let groupFlags = 0;
    let nonce = 0n;

    if (isString(outpoint)) {
      outpoint = Buffer.from(outpoint, 'hex').reverse();
    }
    if (opReturnScript instanceof Script) {
      opReturnScript = opReturnScript.toBuffer();
    }

    do {
      let writer = new BufferWriter();
      nonce += 1n;
      nonce = (nonce & ~this.authFlags.ALL_FLAG_BITS) | authFlag;

      writer.write(outpoint);
      if (opReturnScript != null) {
        writer.writeVarLengthBuf(opReturnScript);
      }
      writer.writeUInt64LEBN(BN.fromBigInt(nonce));

      hash = Hash.sha256sha256(writer.toBuffer());
      groupFlags = (hash[30] << 8) | hash[31];
    } while (groupFlags != idFlag);

    return {hashBuffer: hash, nonce: nonce};
  }

  private static _getGroupAddressBuffer(group: Address | string | Buffer): Buffer {
    if (BufferUtils.isBuffer(group)) {
      return group;
    }
    
    let groupAddress = new Address(group);
    ValidationUtils.validateArgument(groupAddress.isGroupIdentifierAddress(), 'Invalid group address');
    return groupAddress.data;
  }

  /**
   * Translates a group and additional data into a subgroup identifier
   *
   * @param group the group/token address or data buffer
   * @param data the additional data
   * 
   * @returns the subgroup id buffer
   */
  public static generateSubgroupId(group: Address | string | Buffer, data: number | string | Buffer): Buffer {
    ValidationUtils.validateArgument(!isUndefined(group), 'group is missing');
    ValidationUtils.validateArgument(!isUndefined(data), 'data is missing');

    group = this._getGroupAddressBuffer(group);

    if (BufferUtils.isBuffer(data)) {
      return Buffer.concat([group, data]);
    }

    if (isNumber(data)) {
      let bn = BN.fromNumber(data).toBuffer({ size: 8, endian: "little" });
      return Buffer.concat([group, bn]);
    }

    if (CommonUtils.isHexa(data)) {
      return Buffer.concat([group, Buffer.from(data, 'hex')]);
    }

    return Buffer.concat([group, Buffer.from(data)]);
  }

  /**
   * Get group amount buffer from BigInt to include in output script
   *
   * @param amount
   */
  public static getAmountBuffer(amount: bigint): Buffer {
    let bw = new BufferWriter();
    if (amount < 0n) {
      let bn = BN.fromBigInt(BigInt.asUintN(64, amount));
      bw.writeUInt64LEBN(bn);
    } else if (amount < 0x10000n) {
      bw.writeUInt16LE(Number(amount));
    } else if (amount < 0x100000000n) {
      bw.writeUInt32LE(Number(amount));
    } else {
      let bn = BN.fromBigInt(amount);
      bw.writeUInt64LEBN(bn);
    }
    return bw.toBuffer();
  }

  /**
   * Get group amount value from Buffer
   *
   * @param amountBuf the amount buffer
   * @param unsigned return value as unsigned bigint, default to false
   */
  public static getAmountValue(amountBuf: Buffer, unsigned = false): bigint {
    let amount = BN.fromBuffer(amountBuf, { endian: 'little' }).toBigInt();
    return unsigned ? amount : BigInt.asIntN(64, amount);
  }

  /**
   * @param authFlag the utxo group quantity/authority
   * @returns the nonce
   */
   public static getNonce(authFlag: bigint): bigint {
    authFlag = BigInt.asUintN(64, authFlag);
    return authFlag & ~this.authFlags.ALL_FLAG_BITS;
  }

  /**
   * Check if the group id has the flag
   * 
   * @param groupId the group id address or data buffer
   * @param groupIdFlag the group id flag
   * @returns true if this group id has the flag
   */
   public static hasIdFlag(groupId: Address | string | Buffer, groupIdFlag: GroupIdFlag): boolean {
    groupId = this._getGroupAddressBuffer(groupId);
    return groupId.length >= this.PARENT_GROUP_ID_SIZE ? (((groupId[30] << 8) | groupId[31]) & groupIdFlag) == groupIdFlag : false;
  }

  /**
   * Check if this authority and flag fit to this group creation
   * 
   * @param groupId the group id address or data buffer
   * @param authFlag the output group quantity/authority
   * @param groupIdFlag optional. the group id flag
   * @returns true if this is group creation data
   */
   public static isGroupCreation(groupId: Address | string | Buffer, authFlag: bigint, groupIdFlag = GroupIdFlag.DEFAULT): boolean {
    groupId = this._getGroupAddressBuffer(groupId);
    authFlag = BigInt.asUintN(64, authFlag);
    let hasNonce = this.getNonce(authFlag) != 0n;
    let isAuth = this.isAuthority(authFlag);
    let hasFlag = this.hasIdFlag(groupId, groupIdFlag);
    return isAuth && hasNonce && hasFlag;
  }

  /**
   * Check if this group is is subgroup
   * 
   * @param groupId the group id address or data buffer
   * @returns true if this group id is subgroup
   */
   public static isSubgroup(groupId: Address | string | Buffer): boolean {
    groupId = this._getGroupAddressBuffer(groupId);
    return groupId.length > this.PARENT_GROUP_ID_SIZE;
  }

  /**
   * Check if the group quantity/authority is Authority flag
   * 
   * @param authFlag the output group quantity/authority
   * @returns true if this is authority flag
   */
  public static isAuthority(authFlag: bigint): boolean {
    return (authFlag & this.authFlags.AUTHORITY) == this.authFlags.AUTHORITY;
  }

  /**
   * Check if the group quantity/authority allows minting
   * 
   * @param authFlag the output group quantity/authority
   * @returns true if this flag allows minting.
   */
  public static allowsMint(authFlag: bigint): boolean {
    return (authFlag & (GroupToken.authFlags.AUTHORITY | GroupToken.authFlags.MINT)) == (GroupToken.authFlags.AUTHORITY | GroupToken.authFlags.MINT);
  }

  /**
   * Check if the group quantity/authority allows melting
   * 
   * @param authFlag the output group quantity/authority
   * @returns true if this flag allows melting.
   */
  public static allowsMelt(authFlag: bigint): boolean {
    return (authFlag & (GroupToken.authFlags.AUTHORITY | GroupToken.authFlags.MELT)) == (GroupToken.authFlags.AUTHORITY | GroupToken.authFlags.MELT);
  }

  /**
   * Check if the group quantity/authority allows creation of new authorities
   * 
   * @param authFlag the output group quantity/authority
   * @returns true if this flag allows creation of authorities.
   */
  public static allowsRenew(authFlag: bigint): boolean {
    return (authFlag & (GroupToken.authFlags.AUTHORITY | GroupToken.authFlags.BATON)) == (GroupToken.authFlags.AUTHORITY | GroupToken.authFlags.BATON);
  }

  /**
   * Check if the group quantity/authority allows rescript
   * 
   * @param authFlag the output group quantity/authority
   * @returns true if this flag allows rescripting.
   */
  public static allowsRescript(authFlag: bigint): boolean {
    return (authFlag & (GroupToken.authFlags.AUTHORITY | GroupToken.authFlags.RESCRIPT)) == (GroupToken.authFlags.AUTHORITY | GroupToken.authFlags.RESCRIPT);
  }

  /**
   * Check if the group quantity/authority allows creation of subgroups
   * 
   * @param authFlag the output group quantity/authority
   * @returns true if this flag allows subgroups
   */
  public static allowsSubgroup(authFlag: bigint): boolean {
    return (authFlag & (GroupToken.authFlags.AUTHORITY | GroupToken.authFlags.SUBGROUP)) == (GroupToken.authFlags.AUTHORITY | GroupToken.authFlags.SUBGROUP);
  }

  /**
  * Verify token description document json signature
  *
  * @param jsonDoc the json TDD as string
  * @param address nexa address that signed the doc
  * @param signature the signature string. optional - if empty, extract from jsonDoc
  * 
  * @returns true if signature match
  */
  public static verifyJsonDoc(jsonDoc: string, address: Address | string, signature?: string): boolean {
    ValidationUtils.validateArgument(!isEmpty(jsonDoc), 'jsonDoc is missing');
    ValidationUtils.validateArgument(!isEmpty(address), 'group is missing');

    let json = jsonDoc.substring(jsonDoc.indexOf('{'), jsonDoc.lastIndexOf('}') + 1);
    if (isUndefined(signature) || isEmpty(signature)) {
      signature = JSON.parse(jsonDoc)[1];
    }
    let msg = new Message(json);
    return msg.verify(address, signature as string);
  }

  /**
   * Sign token description document json
   *
   * @param jsonDoc the json TDD as string
   * @param privKey private key to sign on the doc
   * 
   * @returns the signature string
   */
  public static signJsonDoc(jsonDoc: string, privKey: PrivateKey): string {
    ValidationUtils.validateArgument(!isEmpty(jsonDoc), 'jsonDoc is missing');
    let json = jsonDoc.substring(jsonDoc.indexOf('{'), jsonDoc.lastIndexOf('}') + 1); // trimming
    let msg = new Message(json);
    return msg.sign(privKey);
  }
}