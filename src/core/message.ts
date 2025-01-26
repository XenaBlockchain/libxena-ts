import { isNil, isString } from "lodash-es";
import ValidationUtils from "../utils/validation.utils";
import BufferWriter from "../encoding/bufferwriter";
import Hash from "../crypto/hash";
import PrivateKey from "../keys/privatekey";
import ECDSA from "../crypto/ecdsa";
import Signature from "../crypto/signature";
import PublicKey from "../keys/publickey";
import Address from "./address/address";
import CommonUtils from "../utils/common.utils";
import type { IMessage } from "../common/interfaces";

export default class Message implements IMessage {

  public static readonly MAGIC_BYTES = Buffer.from('Bitcoin Signed Message:\n');

  message: string;
  error?: string;

  constructor(message: string) {
    ValidationUtils.validateArgument(isString(message), 'First argument should be a string');
    this.message = message;
  }

  /**
   * Will sign a message with a given private key.
   *
   * @param privateKey An instance of PrivateKey
   * @returns A base64 encoded compact signature
   */
  public sign(privateKey: PrivateKey): string {
    let signature = this._sign(privateKey);
    return signature.toCompact().toString('base64');
  }

  /**
   * Will return a boolean of the signature is valid for a given nexa address.
   * If it isn't valid, the specific reason is accessible via the "error" member.
   *
   * @param nexaAddress A nexa address
   * @param signatureString A base64 encoded compact signature
   */
  public verify(nexaAddress: Address | string, signatureString: string): boolean {
    ValidationUtils.validateArgument(!isNil(nexaAddress), 'nexaAddress');
    ValidationUtils.validateArgument(isString(signatureString) && signatureString.length > 0, 'signatureString');

    if (isString(nexaAddress)) {
      nexaAddress = Address.fromString(nexaAddress);
    }

    let signature = Signature.fromCompact(Buffer.from(signatureString, 'base64'));

    // recover the public key
    let ecdsa = new ECDSA();
    ecdsa.hashbuf = this._magicHash();
    ecdsa.sig = signature;
    let publicKey = ecdsa.toPublicKey();

    let signatureAddress = Address.fromPublicKey(publicKey, nexaAddress.network, nexaAddress.type);

    // check that the recovered address and specified address match
    if (nexaAddress.toString() !== signatureAddress.toString()) {
      this.error = 'The signature did not match the message digest';
      return false;
    }

    return this._verify(publicKey, signature);
  }

  private _sign(privateKey: PrivateKey): Signature {
    ValidationUtils.validateArgument(privateKey instanceof PrivateKey, 'First argument should be an instance of PrivateKey');
    let hash = this._magicHash();
    let ecdsa = new ECDSA();
    ecdsa.hashbuf = hash;
    ecdsa.privkey = privateKey;
    ecdsa.pubkey = privateKey.toPublicKey();
    ecdsa.signRandomK();
    ecdsa.calcI();
    return ecdsa.sig as Signature;
  }

  private _magicHash(): Buffer {
    let prefix1 = BufferWriter.varintBufNum(Message.MAGIC_BYTES.length);
    let messageBuffer = Buffer.from(this.message);
    let prefix2 = BufferWriter.varintBufNum(messageBuffer.length);
    let buf = Buffer.concat([prefix1, Message.MAGIC_BYTES, prefix2, messageBuffer]);
    let hash = Hash.sha256sha256(buf);
    return hash;
  }

  private _verify(publicKey: PublicKey, signature: Signature): boolean {
    ValidationUtils.validateArgument(publicKey instanceof PublicKey, 'First argument should be an instance of PublicKey');
    ValidationUtils.validateArgument(signature instanceof Signature, 'Second argument should be an instance of Signature');
    let hash = this._magicHash();
    let verified = ECDSA.verify(hash, signature, publicKey);
    if (!verified) {
      this.error = 'The signature was invalid';
    }
    return verified;
  }

  /**
   * Instantiate a message from a message string
   *
   * @param str A string of the message
   * @returns A new instance of a Message
   */
  public static fromString(str: string): Message {
    return new Message(str);
  }

  /**
   * Instantiate a message from JSON
   *
   * @param json An JSON string or Object with keys: message
   * @returns A new instance of a Message
   */
  public static fromJSON(json: string | IMessage): Message {
    if (CommonUtils.isValidJSON(json as string)) {
      json = JSON.parse(json as string);
    }
    return new Message((json as IMessage).message);
  }

  /**
   * @returns A plain object with the message information
   */
  public toObject(): IMessage {
    return { message: this.message };
  }

  /**
   * @returns A JSON representation as string of the message information
   */
  public toJSON(): string {
    return JSON.stringify(this.toObject());
  }

  /**
   * Will return a the string representation of the message
   */
  public toString(): string {
    return this.message;
  }

  /**
   * Will return a string formatted for the console
   */
  public inspect(): string {
    return `<Message: ${this}>`;
  }
}