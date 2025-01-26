import crypto from "crypto";
import BufferUtils from "../utils/buffer.utils";
import ValidationUtils from "../utils/validation.utils";

enum SHA_BLOCKSIZE {
  SHA256 = 512,
  SHA512 = 1024,
}

export default class Hash {

  public static sha1(buf: Buffer): Buffer {
    ValidationUtils.validateArgument(BufferUtils.isBuffer(buf), "buf", "Must be Buffer");
    return crypto.createHash('sha1').update(buf).digest();
  }

  public static sha256(buf: Buffer): Buffer {
    ValidationUtils.validateArgument(BufferUtils.isBuffer(buf), "buf", "Must be Buffer");
    return crypto.createHash('sha256').update(buf).digest();
  }

  public static sha512(buf: Buffer): Buffer {
    ValidationUtils.validateArgument(BufferUtils.isBuffer(buf), "buf", "Must be Buffer");
    return crypto.createHash('sha512').update(buf).digest();
  }

  public static ripemd160(buf: Buffer): Buffer {
    ValidationUtils.validateArgument(BufferUtils.isBuffer(buf), "buf", "Must be Buffer");
    return crypto.createHash('ripemd160').update(buf).digest();
  }

  public static sha256sha256(buf: Buffer): Buffer {
    ValidationUtils.validateArgument(BufferUtils.isBuffer(buf), "buf", "Must be Buffer");
    return this.sha256(this.sha256(buf));
  }
  
  public static sha256ripemd160(buf: Buffer): Buffer {
    ValidationUtils.validateArgument(BufferUtils.isBuffer(buf), "buf", "Must be Buffer");
    return this.ripemd160(this.sha256(buf));
  }

  public static sha256hmac(data: Buffer, key: Buffer): Buffer {
    return Hash.hmac(Hash.sha256, SHA_BLOCKSIZE.SHA256, data, key);
  };
  
  public static sha512hmac(data: Buffer, key: Buffer): Buffer {
    return Hash.hmac(Hash.sha512, SHA_BLOCKSIZE.SHA512, data, key);
  };

  private static hmac(hashf: (buf: Buffer) => Buffer, size: SHA_BLOCKSIZE, data: Buffer, key: Buffer): Buffer {
    //http://en.wikipedia.org/wiki/Hash-based_message_authentication_code
    //http://tools.ietf.org/html/rfc4868#section-2
    ValidationUtils.validateArgument(BufferUtils.isBuffer(data), "data", "Must be Buffer");
    ValidationUtils.validateArgument(BufferUtils.isBuffer(key), "key", "Must be Buffer");
  
    let blocksize = size / 8;
  
    if (key.length > blocksize) {
      key = hashf(key);
    } else if (key.length < blocksize) {
      let fill = Buffer.alloc(blocksize);
      fill.fill(0);
      key.copy(fill);
      key = fill;
    }
  
    let o_key = Buffer.alloc(blocksize);
    o_key.fill(0x5c);
  
    let i_key = Buffer.alloc(blocksize);
    i_key.fill(0x36);
  
    let o_key_pad = Buffer.alloc(blocksize);
    let i_key_pad = Buffer.alloc(blocksize);
    for (let i = 0; i < blocksize; i++) {
      o_key_pad[i] = o_key[i] ^ key[i];
      i_key_pad[i] = i_key[i] ^ key[i];
    }
  
    return hashf(Buffer.concat([o_key_pad, hashf(Buffer.concat([i_key_pad, data]))]));
  }
}