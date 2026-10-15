'use strict';
/**
 * Virtual Node.js Web Worker Runtime & Multi-File JS/TS Execution Engine
 * Zero external dependencies. Runs identically in Browser Web Workers, Browser Main Thread, and Node.js.
 *
 * Provides complete in-memory shims for:
 *   - Buffer (Uint8Array subclass with full Node.js Buffer read/write/encoding/slice/copy API)
 *   - node:crypto / crypto (pure JS synchronous MD5, SHA-256, HMAC, timingSafeEqual, randomUUID, randomBytes)
 *   - node:zlib / zlib (pure JS IEEE 802.3 CRC-32)
 *   - node:path / path & node:os / os
 *   - node:fs / fs (in-memory POSIX filesystem with inode table, file descriptors, stats, and UI inspector snapshot)
 *   - node:http / http (in-memory loopback HTTP server & client with ephemeral ports, streaming bodies, timeouts, ECONNREFUSED/ETIMEDOUT, and network trace inspector)
 *   - node:assert & node:assert/strict (complete assertion library including throws/rejects/deepStrictEqual)
 *   - Fast TypeScript & ESM-to-CommonJS transpiler
 *   - Structured Test Harness & Console/Process interceptor
 */

function __initVirtualRuntime(rootScope) {
  // =========================================================================
  // 1. UTF-8 / HEX / BASE64 / BASE64URL CODECS & VIRTUAL BUFFER
  // =========================================================================
  const textEncoder = typeof TextEncoder !== 'undefined' ? new TextEncoder() : null;
  const textDecoder = typeof TextDecoder !== 'undefined' ? new TextDecoder('utf-8', { fatal: false }) : null;

  function utf8Encode(str) {
    str = String(str);
    if (textEncoder) return textEncoder.encode(str);
    const out = [];
    for (let i = 0; i < str.length; i++) {
      let c = str.charCodeAt(i);
      if (c < 0x80) {
        out.push(c);
      } else if (c < 0x800) {
        out.push(0xc0 | (c >> 6), 0x80 | (c & 0x3f));
      } else if (c >= 0xd800 && c <= 0xdbff && i + 1 < str.length) {
        const c2 = str.charCodeAt(i + 1);
        if (c2 >= 0xdc00 && c2 <= 0xdfff) {
          c = 0x10000 + (((c & 0x3ff) << 10) | (c2 & 0x3ff));
          out.push(
            0xf0 | (c >> 18),
            0x80 | ((c >> 12) & 0x3f),
            0x80 | ((c >> 6) & 0x3f),
            0x80 | (c & 0x3f)
          );
          i++;
        } else {
          out.push(0xe0 | (c >> 12), 0x80 | ((c >> 6) & 0x3f), 0x80 | (c & 0x3f));
        }
      } else {
        out.push(0xe0 | (c >> 12), 0x80 | ((c >> 6) & 0x3f), 0x80 | (c & 0x3f));
      }
    }
    return new Uint8Array(out);
  }

  function utf8Decode(bytes) {
    if (textDecoder) return textDecoder.decode(bytes);
    let out = '';
    let i = 0;
    while (i < bytes.length) {
      const b0 = bytes[i++];
      if (b0 < 0x80) {
        out += String.fromCharCode(b0);
      } else if ((b0 & 0xe0) === 0xc0) {
        const b1 = bytes[i++] & 0x3f;
        out += String.fromCharCode(((b0 & 0x1f) << 6) | b1);
      } else if ((b0 & 0xf0) === 0xe0) {
        const b1 = bytes[i++] & 0x3f;
        const b2 = bytes[i++] & 0x3f;
        out += String.fromCharCode(((b0 & 0x0f) << 12) | (b1 << 6) | b2);
      } else {
        const b1 = bytes[i++] & 0x3f;
        const b2 = bytes[i++] & 0x3f;
        const b3 = bytes[i++] & 0x3f;
        const cp = (((b0 & 0x07) << 18) | (b1 << 12) | (b2 << 6) | b3) - 0x10000;
        out += String.fromCharCode(0xd800 + (cp >> 10), 0xdc00 + (cp & 0x3ff));
      }
    }
    return out;
  }

  const B64_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  const B64_LOOKUP = new Int16Array(256).fill(-1);
  for (let i = 0; i < B64_CHARS.length; i++) B64_LOOKUP[B64_CHARS.charCodeAt(i)] = i;
  B64_LOOKUP['-'.charCodeAt(0)] = 62;
  B64_LOOKUP['_'.charCodeAt(0)] = 63;

  function base64Encode(bytes, urlSafe = false) {
    let out = '';
    const len = bytes.length;
    for (let i = 0; i < len; i += 3) {
      const b0 = bytes[i];
      const b1 = i + 1 < len ? bytes[i + 1] : 0;
      const b2 = i + 2 < len ? bytes[i + 2] : 0;
      const trip = (b0 << 16) | (b1 << 8) | b2;
      out += B64_CHARS[(trip >> 18) & 0x3f];
      out += B64_CHARS[(trip >> 12) & 0x3f];
      out += i + 1 < len ? B64_CHARS[(trip >> 6) & 0x3f] : (urlSafe ? '' : '=');
      out += i + 2 < len ? B64_CHARS[trip & 0x3f] : (urlSafe ? '' : '=');
    }
    if (urlSafe) {
      out = out.replace(/\+/g, '-').replace(/\//g, '_');
    }
    return out;
  }

  function base64Decode(str) {
    const clean = [];
    for (let i = 0; i < str.length; i++) {
      const code = str.charCodeAt(i);
      if (code === 61 /* '=' */) break;
      const val = code < 256 ? B64_LOOKUP[code] : -1;
      if (val >= 0) clean.push(val);
    }
    const outLen = Math.floor((clean.length * 3) / 4);
    const out = new Uint8Array(outLen);
    let outIdx = 0;
    for (let i = 0; i < clean.length; i += 4) {
      const c0 = clean[i];
      const c1 = i + 1 < clean.length ? clean[i + 1] : 0;
      const c2 = i + 2 < clean.length ? clean[i + 2] : 0;
      const c3 = i + 3 < clean.length ? clean[i + 3] : 0;
      const trip = (c0 << 18) | (c1 << 12) | (c2 << 6) | c3;
      if (outIdx < outLen) out[outIdx++] = (trip >> 16) & 0xff;
      if (outIdx < outLen) out[outIdx++] = (trip >> 8) & 0xff;
      if (outIdx < outLen) out[outIdx++] = trip & 0xff;
    }
    return out;
  }

  function hexEncode(bytes) {
    let out = '';
    for (let i = 0; i < bytes.length; i++) {
      const b = bytes[i];
      out += (b < 16 ? '0' : '') + b.toString(16);
    }
    return out;
  }

  function hexDecode(str) {
    str = String(str);
    const out = [];
    for (let i = 0; i + 1 < str.length; i += 2) {
      const byte = parseInt(str.slice(i, i + 2), 16);
      if (Number.isNaN(byte)) break;
      out.push(byte);
    }
    return new Uint8Array(out);
  }

  class VirtualBuffer extends Uint8Array {
    constructor(arg, byteOffset, length) {
      if (typeof arg === 'number') {
        super(arg);
      } else if (arg instanceof ArrayBuffer || (typeof SharedArrayBuffer !== 'undefined' && arg instanceof SharedArrayBuffer)) {
        super(arg, byteOffset, length);
      } else if (arg !== undefined) {
        super(arg);
      } else {
        super(0);
      }
      this._isVirtualBuffer = true;
    }

    static get [Symbol.species]() {
      return VirtualBuffer;
    }

    static isBuffer(obj) {
      return Boolean(obj && (obj instanceof VirtualBuffer || obj._isVirtualBuffer === true));
    }

    static isEncoding(encoding) {
      if (typeof encoding !== 'string') return false;
      return ['utf8', 'utf-8', 'hex', 'base64', 'base64url', 'ascii', 'latin1', 'binary', 'ucs2', 'ucs-2', 'utf16le', 'utf-16le'].includes(encoding.toLowerCase());
    }

    static from(value, encodingOrOffset, length) {
      if (typeof value === 'string') {
        const enc = (typeof encodingOrOffset === 'string' ? encodingOrOffset : 'utf8').toLowerCase();
        let bytes;
        if (enc === 'utf8' || enc === 'utf-8') {
          bytes = utf8Encode(value);
        } else if (enc === 'hex') {
          bytes = hexDecode(value);
        } else if (enc === 'base64' || enc === 'base64url') {
          bytes = base64Decode(value);
        } else if (enc === 'ascii' || enc === 'latin1' || enc === 'binary') {
          bytes = new Uint8Array(value.length);
          for (let i = 0; i < value.length; i++) bytes[i] = value.charCodeAt(i) & 0xff;
        } else {
          bytes = utf8Encode(value);
        }
        const buf = new VirtualBuffer(bytes.length);
        buf.set(bytes);
        return buf;
      }
      if (value instanceof ArrayBuffer || (typeof SharedArrayBuffer !== 'undefined' && value instanceof SharedArrayBuffer)) {
        const view = new Uint8Array(value, encodingOrOffset || 0, length !== undefined ? length : value.byteLength - (encodingOrOffset || 0));
        Object.setPrototypeOf(view, VirtualBuffer.prototype);
        view._isVirtualBuffer = true;
        return view;
      }
      if (ArrayBuffer.isView(value)) {
        const src = new Uint8Array(value.buffer, value.byteOffset, value.byteLength);
        const buf = new VirtualBuffer(src.length);
        buf.set(src);
        return buf;
      }
      if (Array.isArray(value) || (value && typeof value.length === 'number')) {
        const buf = new VirtualBuffer(value.length);
        for (let i = 0; i < value.length; i++) buf[i] = value[i] & 0xff;
        return buf;
      }
      if (value && typeof value.valueOf === 'function' && value.valueOf() !== value) {
        return VirtualBuffer.from(value.valueOf(), encodingOrOffset, length);
      }
      throw new TypeError('First argument must be a string, Buffer, ArrayBuffer, Array, or array-like object');
    }

    static alloc(size, fill, encoding) {
      if (typeof size !== 'number' || size < 0 || !Number.isFinite(size)) {
        throw new RangeError('Invalid buffer size');
      }
      const buf = new VirtualBuffer(size);
      if (fill !== undefined && size > 0) {
        buf.fill(fill, 0, size, encoding);
      }
      return buf;
    }

    static allocUnsafe(size) {
      return VirtualBuffer.alloc(size);
    }

    static allocUnsafeSlow(size) {
      return VirtualBuffer.alloc(size);
    }

    static concat(list, totalLength) {
      if (!Array.isArray(list)) throw new TypeError('list argument must be an Array');
      if (list.length === 0) return VirtualBuffer.alloc(0);
      let len = totalLength;
      if (len === undefined) {
        len = 0;
        for (let i = 0; i < list.length; i++) len += list[i].length;
      }
      const out = VirtualBuffer.alloc(len);
      let offset = 0;
      for (let i = 0; i < list.length; i++) {
        const chunk = list[i];
        if (offset + chunk.length > len) {
          out.set(chunk.subarray(0, len - offset), offset);
          break;
        }
        out.set(chunk, offset);
        offset += chunk.length;
      }
      return out;
    }

    static byteLength(stringOrBuf, encoding = 'utf8') {
      if (typeof stringOrBuf !== 'string') {
        if (stringOrBuf && typeof stringOrBuf.byteLength === 'number') return stringOrBuf.byteLength;
        if (stringOrBuf && typeof stringOrBuf.length === 'number') return stringOrBuf.length;
        throw new TypeError('The "string" argument must be of type string or an instance of Buffer or ArrayBuffer');
      }
      const enc = (encoding || 'utf8').toLowerCase();
      if (enc === 'utf8' || enc === 'utf-8') return utf8Encode(stringOrBuf).length;
      if (enc === 'ascii' || enc === 'latin1' || enc === 'binary') return stringOrBuf.length;
      if (enc === 'hex') return stringOrBuf.length >>> 1;
      if (enc === 'base64' || enc === 'base64url') return base64Decode(stringOrBuf).length;
      return utf8Encode(stringOrBuf).length;
    }

    static compare(a, b) {
      if (!(a instanceof Uint8Array) || !(b instanceof Uint8Array)) {
        throw new TypeError('Arguments must be Buffers or Uint8Arrays');
      }
      const len = Math.min(a.length, b.length);
      for (let i = 0; i < len; i++) {
        if (a[i] !== b[i]) return a[i] < b[i] ? -1 : 1;
      }
      if (a.length === b.length) return 0;
      return a.length < b.length ? -1 : 1;
    }

    fill(value, offset = 0, end = this.length, encoding = 'utf8') {
      if (typeof offset === 'string') {
        encoding = offset;
        offset = 0;
        end = this.length;
      } else if (typeof end === 'string') {
        encoding = end;
        end = this.length;
      }
      if (typeof value === 'number') {
        super.fill(value & 0xff, offset, end);
        return this;
      }
      const bytes = typeof value === 'string' ? VirtualBuffer.from(value, encoding) : value;
      if (!bytes || bytes.length === 0) {
        super.fill(0, offset, end);
        return this;
      }
      for (let i = offset; i < end; i++) {
        this[i] = bytes[(i - offset) % bytes.length];
      }
      return this;
    }

    subarray(start = 0, end = this.length) {
      const view = Uint8Array.prototype.subarray.call(this, start, end);
      Object.setPrototypeOf(view, VirtualBuffer.prototype);
      view._isVirtualBuffer = true;
      return view;
    }

    slice(start = 0, end = this.length) {
      // In Node.js Buffer.prototype.slice returns a mutable view sharing memory, identical to subarray
      return this.subarray(start, end);
    }

    compare(target, targetStart = 0, targetEnd = target.length, sourceStart = 0, sourceEnd = this.length) {
      const a = this.subarray(sourceStart, sourceEnd);
      const b = target.subarray(targetStart, targetEnd);
      return VirtualBuffer.compare(a, b);
    }

    equals(other) {
      if (!(other instanceof Uint8Array)) return false;
      if (this.length !== other.length) return false;
      return VirtualBuffer.compare(this, other) === 0;
    }

    copy(target, targetStart = 0, sourceStart = 0, sourceEnd = this.length) {
      if (sourceStart >= sourceEnd || targetStart >= target.length) return 0;
      const src = this.subarray(sourceStart, sourceEnd);
      const maxLen = Math.min(src.length, target.length - targetStart);
      target.set(src.subarray(0, maxLen), targetStart);
      return maxLen;
    }

    write(string, offset = 0, length = this.length - offset, encoding = 'utf8') {
      if (typeof offset === 'string') {
        encoding = offset;
        offset = 0;
        length = this.length;
      } else if (typeof length === 'string') {
        encoding = length;
        length = this.length - offset;
      }
      const bytes = VirtualBuffer.from(String(string), encoding);
      const n = Math.min(bytes.length, length, this.length - offset);
      if (n <= 0) return 0;
      this.set(bytes.subarray(0, n), offset);
      return n;
    }

    toString(encoding = 'utf8', start = 0, end = this.length) {
      if (start < 0) start = 0;
      if (end > this.length) end = this.length;
      if (start >= end) return '';
      const sub = Uint8Array.prototype.subarray.call(this, start, end);
      const enc = String(encoding || 'utf8').toLowerCase();
      if (enc === 'utf8' || enc === 'utf-8') return utf8Decode(sub);
      if (enc === 'hex') return hexEncode(sub);
      if (enc === 'base64') return base64Encode(sub, false);
      if (enc === 'base64url') return base64Encode(sub, true);
      if (enc === 'ascii' || enc === 'latin1' || enc === 'binary') {
        let s = '';
        for (let i = 0; i < sub.length; i++) s += String.fromCharCode(sub[i]);
        return s;
      }
      return utf8Decode(sub);
    }

    toJSON() {
      return { type: 'Buffer', data: Array.from(this) };
    }

    _dv() {
      return new DataView(this.buffer, this.byteOffset, this.byteLength);
    }

    readUInt8(offset = 0) { return this._dv().getUint8(offset); }
    readUint8(offset = 0) { return this._dv().getUint8(offset); }
    readInt8(offset = 0) { return this._dv().getInt8(offset); }

    readUInt16BE(offset = 0) { return this._dv().getUint16(offset, false); }
    readUint16BE(offset = 0) { return this._dv().getUint16(offset, false); }
    readUInt16LE(offset = 0) { return this._dv().getUint16(offset, true); }
    readUint16LE(offset = 0) { return this._dv().getUint16(offset, true); }
    readInt16BE(offset = 0) { return this._dv().getInt16(offset, false); }
    readInt16LE(offset = 0) { return this._dv().getInt16(offset, true); }

    readUInt32BE(offset = 0) { return this._dv().getUint32(offset, false); }
    readUint32BE(offset = 0) { return this._dv().getUint32(offset, false); }
    readUInt32LE(offset = 0) { return this._dv().getUint32(offset, true); }
    readUint32LE(offset = 0) { return this._dv().getUint32(offset, true); }
    readInt32BE(offset = 0) { return this._dv().getInt32(offset, false); }
    readInt32LE(offset = 0) { return this._dv().getInt32(offset, true); }

    readBigUInt64BE(offset = 0) { return this._dv().getBigUint64(offset, false); }
    readBigUint64BE(offset = 0) { return this._dv().getBigUint64(offset, false); }
    readBigUInt64LE(offset = 0) { return this._dv().getBigUint64(offset, true); }
    readBigUint64LE(offset = 0) { return this._dv().getBigUint64(offset, true); }
    readBigInt64BE(offset = 0) { return this._dv().getBigInt64(offset, false); }
    readBigInt64LE(offset = 0) { return this._dv().getBigInt64(offset, true); }

    readFloatBE(offset = 0) { return this._dv().getFloat32(offset, false); }
    readFloatLE(offset = 0) { return this._dv().getFloat32(offset, true); }
    readDoubleBE(offset = 0) { return this._dv().getFloat64(offset, false); }
    readDoubleLE(offset = 0) { return this._dv().getFloat64(offset, true); }

    writeUInt8(value, offset = 0) { this._dv().setUint8(offset, Number(value)); return offset + 1; }
    writeUint8(value, offset = 0) { return this.writeUInt8(value, offset); }
    writeInt8(value, offset = 0) { this._dv().setInt8(offset, Number(value)); return offset + 1; }

    writeUInt16BE(value, offset = 0) { this._dv().setUint16(offset, Number(value), false); return offset + 2; }
    writeUint16BE(value, offset = 0) { return this.writeUInt16BE(value, offset); }
    writeUInt16LE(value, offset = 0) { this._dv().setUint16(offset, Number(value), true); return offset + 2; }
    writeUint16LE(value, offset = 0) { return this.writeUInt16LE(value, offset); }
    writeInt16BE(value, offset = 0) { this._dv().setInt16(offset, Number(value), false); return offset + 2; }
    writeInt16LE(value, offset = 0) { this._dv().setInt16(offset, Number(value), true); return offset + 2; }

    writeUInt32BE(value, offset = 0) { this._dv().setUint32(offset, Number(value) >>> 0, false); return offset + 4; }
    writeUint32BE(value, offset = 0) { return this.writeUInt32BE(value, offset); }
    writeUInt32LE(value, offset = 0) { this._dv().setUint32(offset, Number(value) >>> 0, true); return offset + 4; }
    writeUint32LE(value, offset = 0) { return this.writeUInt32LE(value, offset); }
    writeInt32BE(value, offset = 0) { this._dv().setInt32(offset, Number(value) | 0, false); return offset + 4; }
    writeInt32LE(value, offset = 0) { this._dv().setInt32(offset, Number(value) | 0, true); return offset + 4; }

    writeBigUInt64BE(value, offset = 0) { this._dv().setBigUint64(offset, BigInt(value), false); return offset + 8; }
    writeBigUint64BE(value, offset = 0) { return this.writeBigUInt64BE(value, offset); }
    writeBigUInt64LE(value, offset = 0) { this._dv().setBigUint64(offset, BigInt(value), true); return offset + 8; }
    writeBigUint64LE(value, offset = 0) { return this.writeBigUInt64LE(value, offset); }
    writeBigInt64BE(value, offset = 0) { this._dv().setBigInt64(offset, BigInt(value), false); return offset + 8; }
    writeBigInt64LE(value, offset = 0) { this._dv().setBigInt64(offset, BigInt(value), true); return offset + 8; }

    writeFloatBE(value, offset = 0) { this._dv().setFloat32(offset, Number(value), false); return offset + 4; }
    writeFloatLE(value, offset = 0) { this._dv().setFloat32(offset, Number(value), true); return offset + 4; }
    writeDoubleBE(value, offset = 0) { this._dv().setFloat64(offset, Number(value), false); return offset + 8; }
    writeDoubleLE(value, offset = 0) { this._dv().setFloat64(offset, Number(value), true); return offset + 8; }
  }

  // =========================================================================
  // 2. PURE JS CRYPTO (RFC 1321 MD5, FIPS 180-4 SHA-256, HMAC, UUID)
  // =========================================================================
  const MD5_S = [
    7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22,
    5,  9, 14, 20, 5,  9, 14, 20, 5,  9, 14, 20, 5,  9, 14, 20,
    4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23,
    6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21
  ];
  const MD5_K = new Uint32Array(64);
  for (let i = 0; i < 64; i++) {
    MD5_K[i] = Math.floor(Math.abs(Math.sin(i + 1)) * 0x100000000) >>> 0;
  }

  function md5Raw(inputBytes) {
    const len = inputBytes.length;
    const bitLenLo = (len << 3) >>> 0;
    const bitLenHi = (len >>> 29) >>> 0;
    const padLen = ((len + 8) & ~63) + 64;
    const msg = new Uint8Array(padLen);
    msg.set(inputBytes);
    msg[len] = 0x80;
    const dv = new DataView(msg.buffer);
    dv.setUint32(padLen - 8, bitLenLo, true);
    dv.setUint32(padLen - 4, bitLenHi, true);

    let a0 = 0x67452301;
    let b0 = 0xefcdab89;
    let c0 = 0x98badcfe;
    let d0 = 0x10325476;

    const M = new Uint32Array(16);
    for (let off = 0; off < padLen; off += 64) {
      for (let j = 0; j < 16; j++) M[j] = dv.getUint32(off + j * 4, true);
      let A = a0, B = b0, C = c0, D = d0;
      for (let i = 0; i < 64; i++) {
        let F, g;
        if (i < 16) {
          F = (B & C) | (~B & D);
          g = i;
        } else if (i < 32) {
          F = (D & B) | (~D & C);
          g = (5 * i + 1) % 16;
        } else if (i < 48) {
          F = B ^ C ^ D;
          g = (3 * i + 5) % 16;
        } else {
          F = C ^ (B | ~D);
          g = (7 * i) % 16;
        }
        F = (F + A + MD5_K[i] + M[g]) | 0;
        A = D;
        D = C;
        C = B;
        const s = MD5_S[i];
        B = (B + ((F << s) | (F >>> (32 - s)))) | 0;
      }
      a0 = (a0 + A) | 0;
      b0 = (b0 + B) | 0;
      c0 = (c0 + C) | 0;
      d0 = (d0 + D) | 0;
    }

    const out = VirtualBuffer.alloc(16);
    out.writeInt32LE(a0, 0);
    out.writeInt32LE(b0, 4);
    out.writeInt32LE(c0, 8);
    out.writeInt32LE(d0, 12);
    return out;
  }

  const SHA256_K = new Uint32Array([
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
  ]);

  function rotr(x, n) {
    return (x >>> n) | (x << (32 - n));
  }

  function sha256Raw(inputBytes) {
    const len = inputBytes.length;
    const bitLenHi = Math.floor(len / 0x20000000);
    const bitLenLo = (len << 3) >>> 0;
    const padLen = ((len + 8) & ~63) + 64;
    const msg = new Uint8Array(padLen);
    msg.set(inputBytes);
    msg[len] = 0x80;
    const dv = new DataView(msg.buffer);
    dv.setUint32(padLen - 8, bitLenHi, false);
    dv.setUint32(padLen - 4, bitLenLo, false);

    let H0 = 0x6a09e667, H1 = 0xbb67ae85, H2 = 0x3c6ef372, H3 = 0xa54ff53a;
    let H4 = 0x510e527f, H5 = 0x9b05688c, H6 = 0x1f83d9ab, H7 = 0x5be0cd19;

    const W = new Uint32Array(64);
    for (let off = 0; off < padLen; off += 64) {
      for (let t = 0; t < 16; t++) W[t] = dv.getUint32(off + t * 4, false);
      for (let t = 16; t < 64; t++) {
        const s0 = rotr(W[t - 15], 7) ^ rotr(W[t - 15], 18) ^ (W[t - 15] >>> 3);
        const s1 = rotr(W[t - 2], 17) ^ rotr(W[t - 2], 19) ^ (W[t - 2] >>> 10);
        W[t] = (W[t - 16] + s0 + W[t - 7] + s1) >>> 0;
      }

      let a = H0, b = H1, c = H2, d = H3, e = H4, f = H5, g = H6, h = H7;
      for (let t = 0; t < 64; t++) {
        const S1 = rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25);
        const ch = (e & f) ^ (~e & g);
        const temp1 = (h + S1 + ch + SHA256_K[t] + W[t]) >>> 0;
        const S0 = rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22);
        const maj = (a & b) ^ (a & c) ^ (b & c);
        const temp2 = (S0 + maj) >>> 0;

        h = g;
        g = f;
        f = e;
        e = (d + temp1) >>> 0;
        d = c;
        c = b;
        b = a;
        a = (temp1 + temp2) >>> 0;
      }

      H0 = (H0 + a) >>> 0;
      H1 = (H1 + b) >>> 0;
      H2 = (H2 + c) >>> 0;
      H3 = (H3 + d) >>> 0;
      H4 = (H4 + e) >>> 0;
      H5 = (H5 + f) >>> 0;
      H6 = (H6 + g) >>> 0;
      H7 = (H7 + h) >>> 0;
    }

    const out = VirtualBuffer.alloc(32);
    out.writeUInt32BE(H0, 0);
    out.writeUInt32BE(H1, 4);
    out.writeUInt32BE(H2, 8);
    out.writeUInt32BE(H3, 12);
    out.writeUInt32BE(H4, 16);
    out.writeUInt32BE(H5, 20);
    out.writeUInt32BE(H6, 24);
    out.writeUInt32BE(H7, 28);
    return out;
  }

  function hashBytes(alg, bytes) {
    const a = String(alg).toLowerCase().replace('-', '');
    if (a === 'md5') return md5Raw(bytes);
    if (a === 'sha256') return sha256Raw(bytes);
    throw new Error(`Unsupported hash algorithm: ${alg}`);
  }

  class Hash {
    constructor(algorithm) {
      this.algorithm = algorithm;
      this.chunks = [];
      this.digested = false;
    }
    update(data, inputEncoding) {
      if (this.digested) throw new Error('Digest already called');
      const buf = typeof data === 'string'
        ? VirtualBuffer.from(data, inputEncoding || 'utf8')
        : VirtualBuffer.from(data);
      this.chunks.push(buf);
      return this;
    }
    digest(encoding) {
      if (this.digested) throw new Error('Digest already called');
      this.digested = true;
      const total = VirtualBuffer.concat(this.chunks);
      const res = hashBytes(this.algorithm, total);
      if (!encoding || encoding === 'buffer') return res;
      return res.toString(encoding);
    }
  }

  class Hmac {
    constructor(algorithm, key) {
      this.algorithm = algorithm;
      let keyBuf = typeof key === 'string' ? VirtualBuffer.from(key, 'utf8') : VirtualBuffer.from(key);
      const blockSize = 64;
      if (keyBuf.length > blockSize) {
        keyBuf = hashBytes(algorithm, keyBuf);
      }
      this.ipad = VirtualBuffer.alloc(blockSize, 0x36);
      this.opad = VirtualBuffer.alloc(blockSize, 0x5c);
      for (let i = 0; i < keyBuf.length; i++) {
        this.ipad[i] ^= keyBuf[i];
        this.opad[i] ^= keyBuf[i];
      }
      this.inner = new Hash(algorithm);
      this.inner.update(this.ipad);
      this.digested = false;
    }
    update(data, inputEncoding) {
      this.inner.update(data, inputEncoding);
      return this;
    }
    digest(encoding) {
      if (this.digested) throw new Error('Digest already called');
      this.digested = true;
      const innerDigest = this.inner.digest();
      const outer = new Hash(this.algorithm);
      outer.update(this.opad);
      outer.update(innerDigest);
      return outer.digest(encoding);
    }
  }

  const VirtualCrypto = {
    createHash(algorithm) {
      return new Hash(algorithm);
    },
    createHmac(algorithm, key) {
      return new Hmac(algorithm, key);
    },
    timingSafeEqual(a, b) {
      if (!ArrayBuffer.isView(a) || !ArrayBuffer.isView(b)) {
        throw new TypeError('Input must be Buffer or TypedArray');
      }
      if (a.byteLength !== b.byteLength) {
        throw new RangeError('Input buffers must have the same byte length');
      }
      const ua = new Uint8Array(a.buffer, a.byteOffset, a.byteLength);
      const ub = new Uint8Array(b.buffer, b.byteOffset, b.byteLength);
      let diff = 0;
      for (let i = 0; i < ua.length; i++) {
        diff |= ua[i] ^ ub[i];
      }
      return diff === 0;
    },
    randomBytes(size, cb) {
      const buf = VirtualBuffer.alloc(size);
      if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
        crypto.getRandomValues(buf);
      } else {
        for (let i = 0; i < size; i++) buf[i] = Math.floor(Math.random() * 256);
      }
      if (typeof cb === 'function') {
        queueMicrotask(() => cb(null, buf));
      }
      return buf;
    },
    randomUUID() {
      if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
        return crypto.randomUUID();
      }
      const b = VirtualCrypto.randomBytes(16);
      b[6] = (b[6] & 0x0f) | 0x40;
      b[8] = (b[8] & 0x3f) | 0x80;
      const hex = b.toString('hex');
      return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
    }
  };

  // =========================================================================
  // 3. PURE JS ZLIB (IEEE 802.3 CRC-32)
  // =========================================================================
  const CRC32_TABLE = (() => {
    const t = new Uint32Array(256);
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) {
        c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
      }
      t[n] = c >>> 0;
    }
    return t;
  })();

  const VirtualZlib = {
    crc32(data, value = 0) {
      const bytes = typeof data === 'string'
        ? utf8Encode(data)
        : (data instanceof Uint8Array ? data : VirtualBuffer.from(data));
      let crc = (value >>> 0) ^ 0xffffffff;
      for (let i = 0; i < bytes.length; i++) {
        crc = CRC32_TABLE[(crc ^ bytes[i]) & 0xff] ^ (crc >>> 8);
      }
      return (crc ^ 0xffffffff) >>> 0;
    }
  };

  // =========================================================================
  // 4. PATH & OS SHIMS
  // =========================================================================
  const VirtualPath = {
    sep: '/',
    delimiter: ':',
    normalize(p) {
      if (typeof p !== 'string') throw new TypeError('Path must be a string');
      if (p.length === 0) return '.';
      const isAbs = p.startsWith('/');
      const trailingSlash = p.endsWith('/') && p.length > 1;
      const parts = p.split('/');
      const res = [];
      for (let i = 0; i < parts.length; i++) {
        const seg = parts[i];
        if (!seg || seg === '.') continue;
        if (seg === '..') {
          if (res.length > 0 && res[res.length - 1] !== '..') {
            res.pop();
          } else if (!isAbs) {
            res.push('..');
          }
        } else {
          res.push(seg);
        }
      }
      let out = (isAbs ? '/' : '') + res.join('/');
      if (!out) out = isAbs ? '/' : '.';
      if (trailingSlash && out !== '/') out += '/';
      return out;
    },
    join(...segments) {
      if (segments.length === 0) return '.';
      const joined = segments.filter((s) => s !== '').join('/');
      return joined ? VirtualPath.normalize(joined) : '.';
    },
    resolve(...segments) {
      let resolved = '';
      for (let i = segments.length - 1; i >= 0 && !resolved.startsWith('/'); i--) {
        const seg = segments[i];
        if (!seg) continue;
        resolved = resolved ? `${seg}/${resolved}` : seg;
      }
      if (!resolved.startsWith('/')) {
        resolved = `/workspace/${resolved}`;
      }
      const norm = VirtualPath.normalize(resolved);
      return norm.length > 1 && norm.endsWith('/') ? norm.slice(0, -1) : norm;
    },
    dirname(p) {
      if (typeof p !== 'string') throw new TypeError('Path must be a string');
      if (p.length === 0) return '.';
      const clean = p.length > 1 && p.endsWith('/') ? p.slice(0, -1) : p;
      const idx = clean.lastIndexOf('/');
      if (idx === -1) return '.';
      if (idx === 0) return '/';
      return clean.slice(0, idx);
    },
    basename(p, ext) {
      if (typeof p !== 'string') throw new TypeError('Path must be a string');
      const clean = p.length > 1 && p.endsWith('/') ? p.slice(0, -1) : p;
      const idx = clean.lastIndexOf('/');
      let base = idx === -1 ? clean : clean.slice(idx + 1);
      if (ext && base.endsWith(ext)) {
        base = base.slice(0, base.length - ext.length);
      }
      return base;
    },
    extname(p) {
      const base = VirtualPath.basename(p);
      const idx = base.lastIndexOf('.');
      if (idx <= 0) return '';
      return base.slice(idx);
    },
    isAbsolute(p) {
      return typeof p === 'string' && p.startsWith('/');
    }
  };
  VirtualPath.posix = VirtualPath;

  const VirtualOs = {
    tmpdir: () => '/tmp',
    EOL: '\n',
    platform: () => 'linux',
    arch: () => 'x64',
    homedir: () => '/home/user',
    hostname: () => 'code-lab-vm',
    cpus: () => [{ model: 'Virtual Code-Lab CPU', speed: 3200 }]
  };

  // =========================================================================
  // 5. VIRTUAL IN-MEMORY POSIX FILESYSTEM (node:fs)
  // =========================================================================
  function createVirtualFs(initialFiles = {}) {
    const dirs = new Set(['/', '/tmp', '/workspace']);
    const files = new Map();       // normalizedPath -> { data: Uint8Array, mtimeMs, ctimeMs, ino }
    const deletedInspectorCache = new Map(); // normalizedPath -> { data: Uint8Array, mtimeMs, deletedAtMs }
    const fdTable = new Map();     // fd -> { inode, path, flags, pos, isDirectory }
    let nextFd = 10;
    let nextIno = 100;
    let mkdtempCounter = 1;

    function normPath(p) {
      if (typeof p !== 'string' || !p) {
        const err = new TypeError('path must be a non-empty string');
        err.code = 'ERR_INVALID_ARG_TYPE';
        throw err;
      }
      const abs = p.startsWith('/') ? VirtualPath.normalize(p) : VirtualPath.resolve('/workspace', p);
      return abs.length > 1 && abs.endsWith('/') ? abs.slice(0, -1) : abs;
    }

    function fsError(code, syscall, p, msg) {
      const err = new Error(`${code}: ${msg || code}, ${syscall} '${p}'`);
      err.code = code;
      err.syscall = syscall;
      err.path = p;
      return err;
    }

    function ensureParentDirs(absPath) {
      const parts = absPath.split('/').filter(Boolean);
      let cur = '';
      for (let i = 0; i < parts.length - 1; i++) {
        cur += '/' + parts[i];
        dirs.add(cur);
      }
    }

    function makeStats(size, mtimeMs, isDir, ino = 1) {
      const d = new Date(mtimeMs);
      return {
        size,
        ino,
        mode: isDir ? 0o40755 : 0o100644,
        mtimeMs,
        ctimeMs: mtimeMs,
        atimeMs: mtimeMs,
        birthtimeMs: mtimeMs,
        mtime: d,
        ctime: d,
        atime: d,
        birthtime: d,
        isFile: () => !isDir,
        isDirectory: () => isDir,
        isSymbolicLink: () => false,
        isBlockDevice: () => false,
        isCharacterDevice: () => false,
        isFIFO: () => false,
        isSocket: () => false
      };
    }

    // Seed initial project files into /workspace
    for (const [relPath, content] of Object.entries(initialFiles)) {
      const cleanRel = relPath.startsWith('/') ? relPath.slice(1) : relPath;
      const fullPath = normPath(`/workspace/${cleanRel}`);
      ensureParentDirs(fullPath);
      const bytes = typeof content === 'string' ? utf8Encode(content) : new Uint8Array(content);
      files.set(fullPath, {
        data: bytes,
        mtimeMs: Date.now(),
        ctimeMs: Date.now(),
        ino: nextIno++,
        isInitialProjectFile: true
      });
    }

    const fsShim = {
      existsSync(p) {
        try {
          const np = normPath(p);
          return dirs.has(np) || files.has(np);
        } catch (_) {
          return false;
        }
      },

      mkdirSync(p, opts) {
        const np = normPath(p);
        const recursive = typeof opts === 'object' && opts !== null ? Boolean(opts.recursive) : Boolean(opts);
        if (files.has(np)) throw fsError('EEXIST', 'mkdir', p, 'file already exists');
        if (dirs.has(np)) {
          if (recursive) return undefined;
          throw fsError('EEXIST', 'mkdir', p, 'directory already exists');
        }
        const parent = VirtualPath.dirname(np);
        if (!dirs.has(parent)) {
          if (!recursive) throw fsError('ENOENT', 'mkdir', p, 'no such file or directory');
          ensureParentDirs(np + '/placeholder');
        }
        dirs.add(np);
        return np;
      },

      mkdtempSync(prefix) {
        if (typeof prefix !== 'string') throw new TypeError('filename prefix is required');
        const id = String(mkdtempCounter++).padStart(4, '0') + Math.random().toString(36).slice(2, 4);
        const dirPath = normPath(`${prefix}${id}`);
        ensureParentDirs(dirPath + '/placeholder');
        dirs.add(dirPath);
        return dirPath;
      },

      readdirSync(p, opts) {
        const np = normPath(p);
        if (!dirs.has(np)) {
          if (files.has(np)) throw fsError('ENOTDIR', 'scandir', p, 'not a directory');
          throw fsError('ENOENT', 'scandir', p, 'no such file or directory');
        }
        const prefix = np === '/' ? '/' : np + '/';
        const children = new Map(); // name -> isDir
        for (const d of dirs) {
          if (d !== np && d.startsWith(prefix)) {
            const rest = d.slice(prefix.length);
            const first = rest.split('/')[0];
            if (first) children.set(first, true);
          }
        }
        for (const f of files.keys()) {
          if (f.startsWith(prefix)) {
            const rest = f.slice(prefix.length);
            if (!rest.includes('/')) children.set(rest, false);
          }
        }
        const names = Array.from(children.keys()).sort();
        if (opts && typeof opts === 'object' && opts.withFileTypes) {
          return names.map((name) => {
            const isDir = children.get(name);
            return {
              name,
              isFile: () => !isDir,
              isDirectory: () => isDir,
              isSymbolicLink: () => false
            };
          });
        }
        return names;
      },

      statSync(p) {
        const np = normPath(p);
        if (dirs.has(np)) return makeStats(0, Date.now(), true, 1);
        const f = files.get(np);
        if (f) return makeStats(f.data.byteLength, f.mtimeMs, false, f.ino);
        throw fsError('ENOENT', 'stat', p, 'no such file or directory');
      },

      lstatSync(p) {
        return fsShim.statSync(p);
      },

      fstatSync(fd) {
        const entry = fdTable.get(fd);
        if (!entry) throw fsError('EBADF', 'fstat', String(fd), 'bad file descriptor');
        if (entry.isDirectory) return makeStats(0, Date.now(), true, 1);
        return makeStats(entry.inode.data.byteLength, entry.inode.mtimeMs, false, entry.inode.ino);
      },

      openSync(p, flags = 'r') {
        const np = normPath(p);
        const flagStr = String(flags || 'r');
        if (dirs.has(np)) {
          if (flagStr === 'r') {
            const fd = nextFd++;
            fdTable.set(fd, { inode: null, path: np, flags: flagStr, pos: 0, isDirectory: true });
            return fd;
          }
          throw fsError('EISDIR', 'open', p, 'illegal operation on a directory');
        }

        let inode = files.get(np);
        if (flagStr.startsWith('r')) {
          if (!inode) throw fsError('ENOENT', 'open', p, 'no such file or directory');
        } else if (flagStr.startsWith('w')) {
          const parent = VirtualPath.dirname(np);
          if (!dirs.has(parent)) throw fsError('ENOENT', 'open', p, 'no such file or directory');
          if (!inode) {
            inode = { data: new Uint8Array(0), mtimeMs: Date.now(), ctimeMs: Date.now(), ino: nextIno++ };
            files.set(np, inode);
          } else {
            inode.data = new Uint8Array(0);
            inode.mtimeMs = Date.now();
          }
        } else if (flagStr.startsWith('a')) {
          const parent = VirtualPath.dirname(np);
          if (!dirs.has(parent)) throw fsError('ENOENT', 'open', p, 'no such file or directory');
          if (!inode) {
            inode = { data: new Uint8Array(0), mtimeMs: Date.now(), ctimeMs: Date.now(), ino: nextIno++ };
            files.set(np, inode);
          }
        }

        const fd = nextFd++;
        fdTable.set(fd, {
          inode,
          path: np,
          flags: flagStr,
          pos: flagStr.startsWith('a') ? inode.data.byteLength : 0,
          isDirectory: false
        });
        return fd;
      },

      closeSync(fd) {
        if (!fdTable.has(fd)) throw fsError('EBADF', 'close', String(fd), 'bad file descriptor');
        fdTable.delete(fd);
      },

      fsyncSync(fd) {
        const entry = fdTable.get(fd);
        if (!entry) throw fsError('EBADF', 'fsync', String(fd), 'bad file descriptor');
        if (!entry.isDirectory && entry.inode) {
          deletedInspectorCache.set(entry.path, {
            data: entry.inode.data.slice(),
            mtimeMs: entry.inode.mtimeMs,
            deletedAtMs: null
          });
        }
      },

      fdatasyncSync(fd) {
        return fsShim.fsyncSync(fd);
      },

      writeSync(fd, bufOrStr, offsetOrPosition, length, position) {
        const entry = fdTable.get(fd);
        if (!entry || entry.isDirectory) throw fsError('EBADF', 'write', String(fd), 'bad file descriptor');
        let chunk;
        let explicitPos = null;
        if (typeof bufOrStr === 'string') {
          const enc = typeof length === 'string' ? length : 'utf8';
          chunk = VirtualBuffer.from(bufOrStr, enc);
          if (typeof offsetOrPosition === 'number') explicitPos = offsetOrPosition;
        } else {
          const src = bufOrStr instanceof Uint8Array
            ? bufOrStr
            : VirtualBuffer.from(bufOrStr);
          const off = typeof offsetOrPosition === 'number' ? offsetOrPosition : 0;
          const len = typeof length === 'number' ? length : src.byteLength - off;
          if (typeof position === 'number') explicitPos = position;
          chunk = src.subarray(off, off + len);
        }

        const inode = entry.inode;
        const writePos = entry.flags.startsWith('a')
          ? inode.data.byteLength
          : (explicitPos !== null ? explicitPos : entry.pos);

        const needed = writePos + chunk.byteLength;
        if (needed > inode.data.byteLength) {
          const grown = new Uint8Array(needed);
          grown.set(inode.data, 0);
          inode.data = grown;
        }
        inode.data.set(chunk, writePos);
        inode.mtimeMs = Date.now();
        entry.pos = writePos + chunk.byteLength;

        deletedInspectorCache.set(entry.path, {
          data: inode.data.slice(),
          mtimeMs: inode.mtimeMs,
          deletedAtMs: null
        });

        return chunk.byteLength;
      },

      readSync(fd, buffer, offset = 0, length = buffer.byteLength - offset, position = null) {
        const entry = fdTable.get(fd);
        if (!entry || entry.isDirectory) throw fsError('EBADF', 'read', String(fd), 'bad file descriptor');
        const inode = entry.inode;
        const readPos = (position !== null && position !== undefined) ? position : entry.pos;
        if (readPos >= inode.data.byteLength || length <= 0) return 0;
        const avail = Math.min(length, inode.data.byteLength - readPos);
        buffer.set(inode.data.subarray(readPos, readPos + avail), offset);
        if (position === null || position === undefined) {
          entry.pos = readPos + avail;
        }
        return avail;
      },

      readFileSync(p, opts) {
        const np = normPath(p);
        if (dirs.has(np)) throw fsError('EISDIR', 'read', p, 'illegal operation on a directory');
        const inode = files.get(np);
        if (!inode) throw fsError('ENOENT', 'open', p, 'no such file or directory');
        const buf = VirtualBuffer.alloc(inode.data.byteLength);
        buf.set(inode.data);
        const encoding = typeof opts === 'string' ? opts : (opts && opts.encoding);
        return encoding ? buf.toString(encoding) : buf;
      },

      writeFileSync(p, data, opts) {
        const np = normPath(p);
        if (dirs.has(np)) throw fsError('EISDIR', 'open', p, 'illegal operation on a directory');
        const parent = VirtualPath.dirname(np);
        if (!dirs.has(parent)) throw fsError('ENOENT', 'open', p, 'no such file or directory');
        const encoding = typeof opts === 'string' ? opts : (opts && opts.encoding) || 'utf8';
        const bytes = typeof data === 'string'
          ? utf8Encode(data)
          : (data instanceof Uint8Array ? data.slice() : new Uint8Array( VirtualBuffer.from(String(data), encoding) ));
        let inode = files.get(np);
        if (!inode) {
          inode = { data: bytes, mtimeMs: Date.now(), ctimeMs: Date.now(), ino: nextIno++ };
          files.set(np, inode);
        } else {
          inode.data = bytes;
          inode.mtimeMs = Date.now();
        }
        deletedInspectorCache.set(np, { data: bytes.slice(), mtimeMs: inode.mtimeMs, deletedAtMs: null });
      },

      appendFileSync(p, data, opts) {
        const np = normPath(p);
        const encoding = typeof opts === 'string' ? opts : (opts && opts.encoding) || 'utf8';
        const chunk = typeof data === 'string'
          ? utf8Encode(data)
          : (data instanceof Uint8Array ? data : new Uint8Array(VirtualBuffer.from(String(data), encoding)));
        let inode = files.get(np);
        if (!inode) {
          fsShim.writeFileSync(np, chunk);
          return;
        }
        const combined = new Uint8Array(inode.data.byteLength + chunk.byteLength);
        combined.set(inode.data, 0);
        combined.set(chunk, inode.data.byteLength);
        inode.data = combined;
        inode.mtimeMs = Date.now();
        deletedInspectorCache.set(np, { data: combined.slice(), mtimeMs: inode.mtimeMs, deletedAtMs: null });
      },

      truncateSync(p, len = 0) {
        const np = normPath(p);
        const inode = files.get(np);
        if (!inode) throw fsError('ENOENT', 'truncate', p, 'no such file or directory');
        const nextLen = Math.max(0, Number(len) || 0);
        if (nextLen <= inode.data.byteLength) {
          inode.data = inode.data.slice(0, nextLen);
        } else {
          const grown = new Uint8Array(nextLen);
          grown.set(inode.data, 0);
          inode.data = grown;
        }
        inode.mtimeMs = Date.now();
        deletedInspectorCache.set(np, { data: inode.data.slice(), mtimeMs: inode.mtimeMs, deletedAtMs: null });
      },

      renameSync(oldP, newP) {
        const src = normPath(oldP);
        const dst = normPath(newP);
        const inode = files.get(src);
        if (!inode) throw fsError('ENOENT', 'rename', oldP, 'no such file or directory');
        ensureParentDirs(dst);
        files.set(dst, inode);
        files.delete(src);
        for (const fdEntry of fdTable.values()) {
          if (fdEntry.path === src) fdEntry.path = dst;
        }
        deletedInspectorCache.delete(src);
        deletedInspectorCache.set(dst, { data: inode.data.slice(), mtimeMs: inode.mtimeMs, deletedAtMs: null });
      },

      unlinkSync(p) {
        const np = normPath(p);
        const inode = files.get(np);
        if (!inode) throw fsError('ENOENT', 'unlink', p, 'no such file or directory');
        if (inode.data.byteLength > 0) {
          deletedInspectorCache.set(np, { data: inode.data.slice(), mtimeMs: inode.mtimeMs, deletedAtMs: Date.now() });
        }
        files.delete(np);
      },

      rmSync(p, opts = {}) {
        const np = normPath(p);
        const recursive = Boolean(opts && opts.recursive);
        const force = Boolean(opts && opts.force);
        if (files.has(np)) {
          fsShim.unlinkSync(np);
          return;
        }
        if (dirs.has(np)) {
          const prefix = np === '/' ? '/' : np + '/';
          for (const [fPath, inode] of Array.from(files.entries())) {
            if (fPath.startsWith(prefix)) {
              if (!recursive) throw fsError('ENOTEMPTY', 'rm', p, 'directory not empty');
              if (inode.data.byteLength > 0) {
                deletedInspectorCache.set(fPath, { data: inode.data.slice(), mtimeMs: inode.mtimeMs, deletedAtMs: Date.now() });
              }
              files.delete(fPath);
            }
          }
          for (const dPath of Array.from(dirs)) {
            if (dPath === np || dPath.startsWith(prefix)) {
              if (dPath !== '/' && dPath !== '/tmp' && dPath !== '/workspace') {
                dirs.delete(dPath);
              }
            }
          }
          return;
        }
        if (!force) throw fsError('ENOENT', 'rm', p, 'no such file or directory');
      },

      rmdirSync(p, opts = {}) {
        return fsShim.rmSync(p, { ...opts, recursive: Boolean(opts && opts.recursive) });
      },

      accessSync(p) {
        const np = normPath(p);
        if (!dirs.has(np) && !files.has(np)) {
          throw fsError('ENOENT', 'access', p, 'no such file or directory');
        }
      },

      realpathSync(p) {
        const np = normPath(p);
        if (!dirs.has(np) && !files.has(np)) {
          throw fsError('ENOENT', 'realpath', p, 'no such file or directory');
        }
        return np;
      },

      copyFileSync(src, dest, mode = 0) {
        const srcNorm = normPath(src);
        const destNorm = normPath(dest);
        if (dirs.has(srcNorm)) throw fsError('EISDIR', 'copyfile', src, 'illegal operation on a directory');
        const srcInode = files.get(srcNorm);
        if (!srcInode) throw fsError('ENOENT', 'copyfile', src, 'no such file or directory');
        if (dirs.has(destNorm)) throw fsError('EISDIR', 'copyfile', dest, 'illegal operation on a directory');
        if ((mode & 1) && files.has(destNorm)) {
          throw fsError('EEXIST', 'copyfile', dest, 'file already exists');
        }
        fsShim.writeFileSync(destNorm, srcInode.data.slice());
      },

      createReadStream(p, opts = {}) {
        if (typeof opts === 'string') opts = { encoding: opts };
        const np = normPath(p);
        const start = typeof opts.start === 'number' ? opts.start : 0;
        const end = typeof opts.end === 'number' ? opts.end : Infinity;
        const highWaterMark = opts.highWaterMark || 16384;
        const stream = new Readable({ encoding: opts.encoding || null });
        stream.path = np;
        stream.bytesRead = 0;
        queueMicrotask(() => {
          if (stream.destroyed) return;
          if (dirs.has(np)) {
            stream.destroy(fsError('EISDIR', 'read', p, 'illegal operation on a directory'));
            return;
          }
          const inode = files.get(np);
          if (!inode) {
            stream.destroy(fsError('ENOENT', 'open', p, 'no such file or directory'));
            return;
          }
          stream.emit('open', 100);
          stream.emit('ready');
          const upper = Math.min(inode.data.byteLength, Number.isFinite(end) ? end + 1 : inode.data.byteLength);
          const slice = inode.data.subarray(Math.max(0, start), Math.max(0, upper));
          for (let off = 0; off < slice.byteLength; off += highWaterMark) {
            if (stream.destroyed) return;
            const chunk = VirtualBuffer.from(slice.subarray(off, Math.min(slice.byteLength, off + highWaterMark)));
            stream.bytesRead += chunk.byteLength;
            stream.push(chunk);
          }
          if (!stream.destroyed) stream.push(null);
        });
        return stream;
      },

      createWriteStream(p, opts = {}) {
        if (typeof opts === 'string') opts = { encoding: opts };
        const np = normPath(p);
        const flags = (opts && opts.flags) || 'w';
        let fd = null;
        let openErr = null;
        try {
          fd = fsShim.openSync(np, flags);
        } catch (err) {
          openErr = err;
        }
        const stream = new Writable({
          write(chunk, encoding, cb) {
            if (openErr) return cb(openErr);
            try {
              const buf = typeof chunk === 'string'
                ? VirtualBuffer.from(chunk, encoding || (opts && opts.encoding) || 'utf8')
                : VirtualBuffer.from(chunk);
              const written = fsShim.writeSync(fd, buf, 0, buf.byteLength);
              stream.bytesWritten += written;
              cb(null);
            } catch (err) {
              cb(err);
            }
          },
          final(cb) {
            if (fd !== null) {
              try { fsShim.closeSync(fd); } catch (_) {}
              fd = null;
            }
            cb(null);
          }
        });
        stream.path = np;
        stream.bytesWritten = 0;
        queueMicrotask(() => {
          if (openErr) {
            stream.destroy(openErr);
          } else {
            stream.emit('open', fd);
            stream.emit('ready');
          }
        });
        return stream;
      },

      constants: {
        F_OK: 0,
        R_OK: 4,
        W_OK: 2,
        X_OK: 1,
        COPYFILE_EXCL: 1,
        COPYFILE_FICLONE: 2,
        COPYFILE_FICLONE_FORCE: 4
      },

      getSnapshot() {
        const items = [];
        const formatPreview = (bytes) => {
          const slice = bytes.subarray(0, 256);
          let printable = 0;
          for (let i = 0; i < slice.length; i++) {
            const b = slice[i];
            if ((b >= 32 && b <= 126) || b === 9 || b === 10 || b === 13) printable++;
          }
          const isMostlyText = slice.length === 0 || (printable / slice.length) >= 0.75;
          const textPreview = isMostlyText ? utf8Decode(bytes.subarray(0, 512)) : null;
          const hexParts = [];
          const hexLen = Math.min(bytes.length, 64);
          for (let i = 0; i < hexLen; i++) {
            hexParts.push(bytes[i].toString(16).padStart(2, '0'));
          }
          return {
            isBinary: !isMostlyText,
            preview: textPreview,
            hexPreview: hexParts.join(' ') + (bytes.length > 64 ? ' …' : '')
          };
        };

        for (const [fPath, inode] of files.entries()) {
          const { isBinary, preview, hexPreview } = formatPreview(inode.data);
          items.push({
            path: fPath,
            size: inode.data.byteLength,
            mtimeMs: inode.mtimeMs,
            isDirectory: false,
            deleted: false,
            isInitialProjectFile: Boolean(inode.isInitialProjectFile),
            isBinary,
            preview,
            hexPreview
          });
        }

        // Include non-empty runtime artifacts in /tmp that were created during execution and cleaned up on exit
        for (const [fPath, cached] of deletedInspectorCache.entries()) {
          if (!files.has(fPath) && !fPath.endsWith('.tmp') && cached.data.byteLength > 0) {
            const { isBinary, preview, hexPreview } = formatPreview(cached.data);
            items.push({
              path: fPath,
              size: cached.data.byteLength,
              mtimeMs: cached.mtimeMs,
              isDirectory: false,
              deleted: true,
              isInitialProjectFile: false,
              isBinary,
              preview,
              hexPreview
            });
          }
        }

        items.sort((a, b) => a.path.localeCompare(b.path));
        return items;
      }
    };

    fsShim.realpathSync.native = fsShim.realpathSync;

    // Callback-based async wrappers
    const wrapAsyncCb = (syncFn) => (...args) => {
      const cb = typeof args[args.length - 1] === 'function' ? args.pop() : () => {};
      queueMicrotask(() => {
        try {
          const res = syncFn(...args);
          cb(null, res);
        } catch (err) {
          cb(err);
        }
      });
    };

    fsShim.exists = (p, cb) => queueMicrotask(() => (typeof cb === 'function' ? cb(fsShim.existsSync(p)) : undefined));
    fsShim.readFile = wrapAsyncCb(fsShim.readFileSync);
    fsShim.writeFile = wrapAsyncCb(fsShim.writeFileSync);
    fsShim.appendFile = wrapAsyncCb(fsShim.appendFileSync);
    fsShim.mkdir = wrapAsyncCb(fsShim.mkdirSync);
    fsShim.mkdtemp = wrapAsyncCb(fsShim.mkdtempSync);
    fsShim.readdir = wrapAsyncCb(fsShim.readdirSync);
    fsShim.stat = wrapAsyncCb(fsShim.statSync);
    fsShim.lstat = wrapAsyncCb(fsShim.lstatSync);
    fsShim.fstat = wrapAsyncCb(fsShim.fstatSync);
    fsShim.unlink = wrapAsyncCb(fsShim.unlinkSync);
    fsShim.rm = wrapAsyncCb(fsShim.rmSync);
    fsShim.rmdir = wrapAsyncCb(fsShim.rmdirSync);
    fsShim.rename = wrapAsyncCb(fsShim.renameSync);
    fsShim.truncate = wrapAsyncCb(fsShim.truncateSync);
    fsShim.access = wrapAsyncCb(fsShim.accessSync);
    fsShim.copyFile = wrapAsyncCb(fsShim.copyFileSync);
    fsShim.realpath = wrapAsyncCb(fsShim.realpathSync);
    fsShim.open = wrapAsyncCb(fsShim.openSync);
    fsShim.close = wrapAsyncCb(fsShim.closeSync);
    fsShim.fsync = wrapAsyncCb(fsShim.fsyncSync);
    fsShim.fdatasync = wrapAsyncCb(fsShim.fdatasyncSync);
    fsShim.read = (fd, buffer, offset, length, position, cb) => {
      if (typeof position === 'function') { cb = position; position = null; }
      queueMicrotask(() => {
        try {
          const bytesRead = fsShim.readSync(fd, buffer, offset, length, position);
          if (typeof cb === 'function') cb(null, bytesRead, buffer);
        } catch (err) {
          if (typeof cb === 'function') cb(err);
        }
      });
    };
    fsShim.write = (fd, buffer, offset, length, position, cb) => {
      if (typeof offset === 'function') { cb = offset; offset = undefined; }
      else if (typeof length === 'function') { cb = length; length = undefined; }
      else if (typeof position === 'function') { cb = position; position = undefined; }
      queueMicrotask(() => {
        try {
          const bytesWritten = fsShim.writeSync(fd, buffer, offset, length, position);
          if (typeof cb === 'function') cb(null, bytesWritten, buffer);
        } catch (err) {
          if (typeof cb === 'function') cb(err);
        }
      });
    };

    class VirtualFileHandle {
      constructor(fd, path) {
        this.fd = fd;
        this.path = path;
        this._closed = false;
      }
      async read(bufferOrOpts, offset, length, position) {
        let buffer = bufferOrOpts;
        if (bufferOrOpts && typeof bufferOrOpts === 'object' && !ArrayBuffer.isView(bufferOrOpts)) {
          buffer = bufferOrOpts.buffer || VirtualBuffer.alloc(bufferOrOpts.length || 16384);
          offset = bufferOrOpts.offset ?? 0;
          length = bufferOrOpts.length ?? (buffer.byteLength - offset);
          position = bufferOrOpts.position ?? null;
        } else if (!buffer) {
          buffer = VirtualBuffer.alloc(16384);
          offset = 0;
          length = buffer.byteLength;
          position = null;
        }
        if (offset === undefined) offset = 0;
        if (length === undefined) length = buffer.byteLength - offset;
        const bytesRead = fsShim.readSync(this.fd, buffer, offset, length, position);
        return { bytesRead, buffer };
      }
      async write(bufOrStr, offsetOrPos, lengthOrEnc, position) {
        const bytesWritten = fsShim.writeSync(this.fd, bufOrStr, offsetOrPos, lengthOrEnc, position);
        return { bytesWritten, buffer: bufOrStr };
      }
      async readFile(opts) {
        return fsShim.readFileSync(this.path, opts);
      }
      async writeFile(data, opts) {
        return fsShim.writeFileSync(this.path, data, opts);
      }
      async stat() {
        return fsShim.fstatSync(this.fd);
      }
      async truncate(len = 0) {
        return fsShim.truncateSync(this.path, len);
      }
      async sync() {
        return fsShim.fsyncSync(this.fd);
      }
      async datasync() {
        return fsShim.fdatasyncSync(this.fd);
      }
      async close() {
        if (!this._closed) {
          this._closed = true;
          fsShim.closeSync(this.fd);
        }
      }
    }

    const fsPromises = {
      constants: fsShim.constants,
      FileHandle: VirtualFileHandle,
      access: async (p, mode) => fsShim.accessSync(p, mode),
      copyFile: async (src, dest, mode) => fsShim.copyFileSync(src, dest, mode),
      open: async (p, flags = 'r') => {
        const np = normPath(p);
        const fd = fsShim.openSync(np, flags);
        return new VirtualFileHandle(fd, np);
      },
      readFile: async (p, opts) => {
        if (p instanceof VirtualFileHandle) return p.readFile(opts);
        return fsShim.readFileSync(p, opts);
      },
      writeFile: async (p, data, opts) => {
        if (p instanceof VirtualFileHandle) return p.writeFile(data, opts);
        return fsShim.writeFileSync(p, data, opts);
      },
      appendFile: async (p, data, opts) => fsShim.appendFileSync(p, data, opts),
      mkdir: async (p, opts) => fsShim.mkdirSync(p, opts),
      mkdtemp: async (prefix) => fsShim.mkdtempSync(prefix),
      readdir: async (p, opts) => fsShim.readdirSync(p, opts),
      stat: async (p) => fsShim.statSync(p),
      lstat: async (p) => fsShim.lstatSync(p),
      unlink: async (p) => fsShim.unlinkSync(p),
      rm: async (p, opts) => fsShim.rmSync(p, opts),
      rmdir: async (p, opts) => fsShim.rmdirSync(p, opts),
      rename: async (oldP, newP) => fsShim.renameSync(oldP, newP),
      truncate: async (p, len) => fsShim.truncateSync(p, len),
      realpath: async (p) => fsShim.realpathSync(p)
    };

    fsShim.promises = fsPromises;

    return fsShim;
  }

  // =========================================================================
  // 5B. EVENT EMITTER (node:events), UTIL (node:util), URL, QUERYSTRING, STREAM
  // =========================================================================
  class EventEmitter {
    constructor() {
      this._events = new Map();
      this._maxListeners = EventEmitter.defaultMaxListeners;
    }
    _ensureMap() {
      if (!this._events) this._events = new Map();
      return this._events;
    }
    setMaxListeners(n) {
      this._maxListeners = Number(n);
      return this;
    }
    getMaxListeners() {
      return this._maxListeners !== undefined ? this._maxListeners : EventEmitter.defaultMaxListeners;
    }
    on(event, fn) {
      if (typeof fn !== 'function') throw new TypeError('The "listener" argument must be of type Function');
      const map = this._ensureMap();
      if (!map.has(event)) map.set(event, []);
      map.get(event).push({ fn, once: false });
      if (event !== 'newListener' && map.has('newListener')) {
        this.emit('newListener', event, fn);
      }
      return this;
    }
    addListener(event, fn) {
      return this.on(event, fn);
    }
    prependListener(event, fn) {
      if (typeof fn !== 'function') throw new TypeError('The "listener" argument must be of type Function');
      const map = this._ensureMap();
      if (!map.has(event)) map.set(event, []);
      map.get(event).unshift({ fn, once: false });
      return this;
    }
    once(event, fn) {
      if (typeof fn !== 'function') throw new TypeError('The "listener" argument must be of type Function');
      const map = this._ensureMap();
      if (!map.has(event)) map.set(event, []);
      map.get(event).push({ fn, once: true });
      return this;
    }
    prependOnceListener(event, fn) {
      if (typeof fn !== 'function') throw new TypeError('The "listener" argument must be of type Function');
      const map = this._ensureMap();
      if (!map.has(event)) map.set(event, []);
      map.get(event).unshift({ fn, once: true });
      return this;
    }
    off(event, fn) {
      const map = this._ensureMap();
      const list = map.get(event);
      if (!list) return this;
      const idx = list.findIndex((x) => x.fn === fn || x.fn.listener === fn);
      if (idx !== -1) {
        list.splice(idx, 1);
        if (list.length === 0) map.delete(event);
        if (event !== 'removeListener' && map.has('removeListener')) {
          this.emit('removeListener', event, fn);
        }
      }
      return this;
    }
    removeListener(event, fn) {
      return this.off(event, fn);
    }
    removeAllListeners(event) {
      const map = this._ensureMap();
      if (event !== undefined) map.delete(event);
      else map.clear();
      return this;
    }
    listeners(event) {
      const list = this._ensureMap().get(event);
      return list ? list.map((x) => x.fn) : [];
    }
    rawListeners(event) {
      return this.listeners(event);
    }
    listenerCount(event) {
      const list = this._ensureMap().get(event);
      return list ? list.length : 0;
    }
    eventNames() {
      return Array.from(this._ensureMap().keys());
    }
    emit(event, ...args) {
      const map = this._ensureMap();
      const list = map.get(event);
      if (!list || list.length === 0) {
        if (event === 'error') {
          const err = args[0] instanceof Error ? args[0] : new Error(String(args[0] || 'Unhandled error event'));
          throw err;
        }
        return false;
      }
      const copy = list.slice();
      const remaining = list.filter((x) => !x.once);
      if (remaining.length > 0) map.set(event, remaining);
      else map.delete(event);
      for (let i = 0; i < copy.length; i++) {
        copy[i].fn.apply(this, args);
      }
      return true;
    }
  }
  EventEmitter.defaultMaxListeners = 10;
  EventEmitter.EventEmitter = EventEmitter;
  EventEmitter.listenerCount = (emitter, event) => emitter.listenerCount(event);
  EventEmitter.once = (emitter, event) =>
    new Promise((resolve, reject) => {
      const onEvent = (...args) => {
        emitter.off('error', onError);
        resolve(args);
      };
      const onError = (err) => {
        emitter.off(event, onEvent);
        reject(err);
      };
      emitter.once(event, onEvent);
      if (event !== 'error') emitter.once('error', onError);
    });

  const MiniEventEmitter = EventEmitter;

  // --- node:querystring ---
  const VirtualQuerystring = {
    escape(str) {
      return encodeURIComponent(String(str));
    },
    unescape(str) {
      try {
        return decodeURIComponent(String(str).replace(/\+/g, ' '));
      } catch (_) {
        return String(str);
      }
    },
    parse(str, sep = '&', eq = '=') {
      const out = Object.create(null);
      if (typeof str !== 'string' || str.length === 0) return out;
      const clean = str.startsWith('?') ? str.slice(1) : str;
      const parts = clean.split(sep || '&');
      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        if (!part) continue;
        const idx = part.indexOf(eq || '=');
        const rawK = idx === -1 ? part : part.slice(0, idx);
        const rawV = idx === -1 ? '' : part.slice(idx + (eq || '=').length);
        const k = VirtualQuerystring.unescape(rawK);
        const v = VirtualQuerystring.unescape(rawV);
        if (Object.prototype.hasOwnProperty.call(out, k)) {
          if (Array.isArray(out[k])) out[k].push(v);
          else out[k] = [out[k], v];
        } else {
          out[k] = v;
        }
      }
      return out;
    },
    stringify(obj, sep = '&', eq = '=') {
      if (!obj || typeof obj !== 'object') return '';
      const pairs = [];
      for (const [k, v] of Object.entries(obj)) {
        const ek = VirtualQuerystring.escape(k);
        if (Array.isArray(v)) {
          for (let i = 0; i < v.length; i++) {
            pairs.push(`${ek}${eq}${VirtualQuerystring.escape(v[i] ?? '')}`);
          }
        } else if (v !== undefined) {
          pairs.push(`${ek}${eq}${VirtualQuerystring.escape(v ?? '')}`);
        }
      }
      return pairs.join(sep);
    }
  };
  VirtualQuerystring.decode = VirtualQuerystring.parse;
  VirtualQuerystring.encode = VirtualQuerystring.stringify;

  // --- node:url ---
  const VirtualUrl = {
    URL: typeof URL !== 'undefined' ? URL : null,
    URLSearchParams: typeof URLSearchParams !== 'undefined' ? URLSearchParams : null,
    parse(urlStr, parseQueryString = false) {
      urlStr = String(urlStr || '');
      let hash = null;
      const hashIdx = urlStr.indexOf('#');
      if (hashIdx !== -1) {
        hash = urlStr.slice(hashIdx);
        urlStr = urlStr.slice(0, hashIdx);
      }
      let search = null;
      let query = parseQueryString ? Object.create(null) : null;
      const qIdx = urlStr.indexOf('?');
      if (qIdx !== -1) {
        search = urlStr.slice(qIdx);
        const qRaw = search.slice(1);
        query = parseQueryString ? VirtualQuerystring.parse(qRaw) : qRaw;
        urlStr = urlStr.slice(0, qIdx);
      }
      const fullMatch = /^([a-zA-Z][a-zA-Z0-9+.-]*:)?(\/\/)?([^/?#]*)?(\/.*)?$/.exec(urlStr);
      const protocol = fullMatch && fullMatch[1] ? fullMatch[1].toLowerCase() : null;
      const slashes = Boolean(fullMatch && fullMatch[2]);
      let hostPart = fullMatch && fullMatch[2] ? (fullMatch[3] || '') : null;
      let pathname = fullMatch && fullMatch[2] ? (fullMatch[4] || '/') : urlStr || '/';
      let auth = null;
      let host = null;
      let hostname = null;
      let port = null;
      if (hostPart !== null) {
        const atIdx = hostPart.indexOf('@');
        if (atIdx !== -1) {
          auth = hostPart.slice(0, atIdx);
          hostPart = hostPart.slice(atIdx + 1);
        }
        host = hostPart;
        const colonIdx = hostPart.lastIndexOf(':');
        if (colonIdx !== -1 && !hostPart.endsWith(']')) {
          hostname = hostPart.slice(0, colonIdx);
          port = hostPart.slice(colonIdx + 1);
        } else {
          hostname = hostPart;
        }
      }
      const path = pathname + (search || '');
      const href = (protocol || '') + (slashes ? '//' : '') + (auth ? auth + '@' : '') + (host || '') + path + (hash || '');
      return {
        protocol,
        slashes,
        auth,
        host,
        port,
        hostname,
        hash,
        search,
        query,
        pathname,
        path,
        href
      };
    },
    format(urlObj) {
      if (typeof urlObj === 'string') return urlObj;
      if (typeof URL !== 'undefined' && urlObj instanceof URL) return urlObj.toString();
      if (!urlObj || typeof urlObj !== 'object') return '';
      if (urlObj.href) return urlObj.href;
      const protocol = urlObj.protocol ? (urlObj.protocol.endsWith(':') ? urlObj.protocol : urlObj.protocol + ':') : '';
      const slashes = urlObj.slashes || protocol === 'http:' || protocol === 'https:' || protocol === 'file:' ? '//' : '';
      const auth = urlObj.auth ? urlObj.auth + '@' : '';
      const host = urlObj.host || (urlObj.hostname ? urlObj.hostname + (urlObj.port ? ':' + urlObj.port : '') : '');
      const pathname = urlObj.pathname || '/';
      let search = urlObj.search || '';
      if (!search && urlObj.query) {
        const qs = typeof urlObj.query === 'object' ? VirtualQuerystring.stringify(urlObj.query) : String(urlObj.query);
        if (qs) search = '?' + qs;
      }
      const hash = urlObj.hash ? (urlObj.hash.startsWith('#') ? urlObj.hash : '#' + urlObj.hash) : '';
      return `${protocol}${slashes}${auth}${host}${pathname}${search}${hash}`;
    },
    resolve(from, to) {
      const fromStr = String(from || '');
      const toStr = String(to || '');
      if (!toStr) return fromStr;
      if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(toStr)) return toStr;
      if (typeof URL !== 'undefined') {
        try {
          const resolvedUrl = new URL(toStr, new URL(fromStr, 'resolve://'));
          if (resolvedUrl.protocol === 'resolve:') {
            const { pathname, search, hash } = resolvedUrl;
            return pathname + search + hash;
          }
          return resolvedUrl.href;
        } catch (_) {}
      }
      if (toStr.startsWith('/')) {
        const m = /^([a-zA-Z][a-zA-Z0-9+.-]*:\/\/[^/?#]+)/.exec(fromStr);
        return m ? m[1] + toStr : toStr;
      }
      const baseDir = fromStr.endsWith('/') ? fromStr : fromStr.replace(/[^/]*$/, '');
      return baseDir + toStr;
    },
    fileURLToPath(u) {
      const str = typeof u === 'string' ? u : u.href || String(u);
      return str.replace(/^file:\/\//i, '') || '/';
    },
    pathToFileURL(p) {
      const clean = VirtualPath.resolve(String(p));
      return typeof URL !== 'undefined' ? new URL(`file://${clean}`) : { href: `file://${clean}`, pathname: clean };
    }
  };

  // --- node:stream ---
  class Stream extends EventEmitter {
    pipe(dest, options = {}) {
      const onData = (chunk) => {
        if (!dest.destroyed && !dest.writableFinished) dest.write(chunk);
      };
      this.on('data', onData);
      if (options.end !== false) {
        this.once('end', () => {
          if (!dest.destroyed && !dest.writableFinished) dest.end();
        });
      }
      this.once('error', (err) => {
        dest.emit('error', err);
      });
      dest.emit('pipe', this);
      return dest;
    }
  }

  class Readable extends Stream {
    constructor(opts = {}) {
      super();
      this.readable = true;
      this.readableEnded = false;
      this.destroyed = false;
      this._objectMode = Boolean(opts.objectMode);
      this._encoding = opts.encoding || null;
      this._readableBuffer = [];
      this._flowing = false;
      this._reading = false;
      if (typeof opts.read === 'function') this._read = opts.read;
      if (typeof opts.destroy === 'function') this._destroy = opts.destroy;
    }
    _read() {}
    setEncoding(enc) {
      this._encoding = enc;
      return this;
    }
    push(chunk, encoding) {
      if (this.destroyed || this.readableEnded) return false;
      if (chunk === null) {
        this.readableEnded = true;
        this._flushReadable();
        return false;
      }
      let item = chunk;
      if (!this._objectMode) {
        const buf = typeof chunk === 'string'
          ? VirtualBuffer.from(chunk, encoding || this._encoding || 'utf8')
          : (VirtualBuffer.isBuffer(chunk) ? chunk : VirtualBuffer.from(chunk));
        item = this._encoding ? buf.toString(this._encoding) : buf;
      }
      this._readableBuffer.push(item);
      this._flushReadable();
      return true;
    }
    read() {
      if (this._readableBuffer.length === 0 && !this.readableEnded && !this._reading) {
        this._reading = true;
        try { this._read(16384); } finally { this._reading = false; }
      }
      if (this._readableBuffer.length === 0) return null;
      return this._readableBuffer.shift();
    }
    on(event, fn) {
      super.on(event, fn);
      if (event === 'data') {
        this._flowing = true;
        queueMicrotask(() => this._drainReadable());
      } else if (event === 'end' && this.readableEnded && this._readableBuffer.length === 0) {
        queueMicrotask(() => this.emit('end'));
      }
      return this;
    }
    resume() {
      this._flowing = true;
      queueMicrotask(() => this._drainReadable());
      return this;
    }
    pause() {
      this._flowing = false;
      return this;
    }
    unpipe() {
      this.removeAllListeners('data');
      return this;
    }
    _drainReadable() {
      if (this.destroyed) return;
      if (!this.readableEnded && this._readableBuffer.length === 0 && !this._reading) {
        this._reading = true;
        try { this._read(16384); } finally { this._reading = false; }
      }
      this._flushReadable();
    }
    _flushReadable() {
      if (this.destroyed) return;
      if (this._flowing && this.listenerCount('data') > 0) {
        while (this._readableBuffer.length > 0 && this._flowing) {
          const item = this._readableBuffer.shift();
          this.emit('data', item);
        }
      }
      if (this.readableEnded && this._readableBuffer.length === 0 && !this._endEmitted) {
        this._endEmitted = true;
        queueMicrotask(() => {
          if (!this.destroyed) {
            this.emit('end');
            this.emit('close');
          }
        });
      }
    }
    destroy(err) {
      if (this.destroyed) return this;
      this.destroyed = true;
      if (err) queueMicrotask(() => this.emit('error', err));
      queueMicrotask(() => this.emit('close'));
      return this;
    }
    async *[Symbol.asyncIterator]() {
      const queue = [];
      let done = false;
      let error = null;
      let notify = null;
      this.on('data', (chunk) => {
        queue.push(chunk);
        if (notify) { const r = notify; notify = null; r(); }
      });
      this.once('end', () => {
        done = true;
        if (notify) { const r = notify; notify = null; r(); }
      });
      this.once('error', (err) => {
        error = err;
        done = true;
        if (notify) { const r = notify; notify = null; r(); }
      });
      while (!done || queue.length > 0) {
        if (error) throw error;
        if (queue.length > 0) {
          yield queue.shift();
        } else if (!done) {
          await new Promise((r) => { notify = r; });
        }
      }
      if (error) throw error;
    }
    static from(iterable, opts = {}) {
      const r = new Readable({ objectMode: true, ...opts });
      queueMicrotask(async () => {
        try {
          for await (const item of iterable) {
            r.push(item);
          }
          r.push(null);
        } catch (err) {
          r.destroy(err);
        }
      });
      return r;
    }
  }

  class Writable extends Stream {
    constructor(opts = {}) {
      super();
      this.writable = true;
      this.writableFinished = false;
      this.destroyed = false;
      this._objectMode = Boolean(opts.objectMode);
      if (typeof opts.write === 'function') this._write = opts.write;
      if (typeof opts.final === 'function') this._final = opts.final;
    }
    _write(chunk, encoding, cb) {
      if (typeof cb === 'function') cb();
    }
    write(chunk, encoding, cb) {
      if (typeof encoding === 'function') { cb = encoding; encoding = 'utf8'; }
      if (this.destroyed || this.writableFinished) return false;
      const item = (!this._objectMode && typeof chunk === 'string')
        ? VirtualBuffer.from(chunk, encoding || 'utf8')
        : chunk;
      this._write(item, encoding || 'utf8', (err) => {
        if (err) this.emit('error', err);
        if (typeof cb === 'function') cb(err);
      });
      return true;
    }
    cork() {}
    uncork() {}
    end(chunk, encoding, cb) {
      if (typeof chunk === 'function') { cb = chunk; chunk = undefined; encoding = undefined; }
      else if (typeof encoding === 'function') { cb = encoding; encoding = undefined; }
      if (this.destroyed || this.writableFinished) return this;
      if (chunk !== undefined && chunk !== null) {
        this.write(chunk, encoding);
      }
      const finish = () => {
        this.writableFinished = true;
        queueMicrotask(() => {
          this.emit('finish');
          this.emit('close');
          if (typeof cb === 'function') cb();
        });
      };
      if (typeof this._final === 'function') {
        this._final((err) => {
          if (err) this.emit('error', err);
          finish();
        });
      } else {
        finish();
      }
      return this;
    }
    destroy(err) {
      if (this.destroyed) return this;
      this.destroyed = true;
      if (err) queueMicrotask(() => this.emit('error', err));
      queueMicrotask(() => this.emit('close'));
      return this;
    }
  }

  class Duplex extends Readable {
    constructor(opts = {}) {
      super(opts);
      this.writable = true;
      this.writableFinished = false;
      if (typeof opts.write === 'function') this._write = opts.write;
      if (typeof opts.final === 'function') this._final = opts.final;
    }
    _write(chunk, encoding, cb) {
      if (typeof cb === 'function') cb();
    }
    write(chunk, encoding, cb) {
      return Writable.prototype.write.call(this, chunk, encoding, cb);
    }
    end(chunk, encoding, cb) {
      return Writable.prototype.end.call(this, chunk, encoding, cb);
    }
  }

  class Transform extends Duplex {
    constructor(opts = {}) {
      super(opts);
      if (typeof opts.transform === 'function') this._transform = opts.transform;
      if (typeof opts.flush === 'function') this._flush = opts.flush;
    }
    _transform(chunk, encoding, cb) {
      cb(null, chunk);
    }
    _write(chunk, encoding, cb) {
      this._transform(chunk, encoding, (err, out) => {
        if (err) {
          if (typeof cb === 'function') cb(err);
          else this.emit('error', err);
          return;
        }
        if (out !== undefined && out !== null) this.push(out);
        if (typeof cb === 'function') cb();
      });
    }
    end(chunk, encoding, cb) {
      if (typeof chunk === 'function') { cb = chunk; chunk = undefined; encoding = undefined; }
      else if (typeof encoding === 'function') { cb = encoding; encoding = undefined; }
      if (chunk !== undefined && chunk !== null) {
        this.write(chunk, encoding);
      }
      const done = (err, out) => {
        if (err) this.emit('error', err);
        if (out !== undefined && out !== null) this.push(out);
        this.push(null);
        this.writableFinished = true;
        queueMicrotask(() => {
          this.emit('finish');
          if (typeof cb === 'function') cb(err);
        });
      };
      if (typeof this._flush === 'function') {
        this._flush(done);
      } else {
        done();
      }
      return this;
    }
  }

  class PassThrough extends Transform {}

  function finished(stream, optsOrCb, maybeCb) {
    const cb = typeof optsOrCb === 'function' ? optsOrCb : maybeCb;
    let called = false;
    const done = (err) => {
      if (called) return;
      called = true;
      if (typeof cb === 'function') cb(err || null);
    };
    stream.once('end', () => done(null));
    stream.once('finish', () => done(null));
    stream.once('error', (err) => done(err));
    stream.once('close', () => done(null));
    return () => { called = true; };
  }

  function pipeline(...args) {
    const hasCb = typeof args[args.length - 1] === 'function';
    const cb = hasCb ? args.pop() : null;
    const streams = args.flat();
    const run = new Promise((resolve, reject) => {
      if (streams.length < 2) {
        resolve();
        return;
      }
      let settled = false;
      const fail = (err) => {
        if (settled) return;
        settled = true;
        for (const s of streams) {
          if (typeof s.destroy === 'function') s.destroy();
        }
        reject(err);
      };
      for (let i = 0; i < streams.length - 1; i++) {
        streams[i].on('error', fail);
        streams[i].pipe(streams[i + 1]);
      }
      const last = streams[streams.length - 1];
      last.on('error', fail);
      finished(last, (err) => {
        if (settled) return;
        settled = true;
        if (err) reject(err);
        else resolve();
      });
    });
    if (cb) {
      run.then(() => cb(null), (err) => cb(err));
      return streams[streams.length - 1];
    }
    return run;
  }

  const VirtualStreamPromises = {
    pipeline: (...streams) => new Promise((res, rej) => pipeline(...streams, (err) => (err ? rej(err) : res()))),
    finished: (stream, opts) => new Promise((res, rej) => finished(stream, opts, (err) => (err ? rej(err) : res())))
  };

  Stream.Stream = Stream;
  Stream.Readable = Readable;
  Stream.Writable = Writable;
  Stream.Duplex = Duplex;
  Stream.Transform = Transform;
  Stream.PassThrough = PassThrough;
  Stream.pipeline = pipeline;
  Stream.finished = finished;
  Stream.promises = VirtualStreamPromises;
  const VirtualStream = Stream;

  function createVirtualHttp(resourceTracker) {
    const activeServers = new Map(); // port -> VirtualServer
    const httpTrace = [];
    let nextEphemeralPort = 31000;

    function lowercaseHeaders(hdrs = {}) {
      const out = {};
      for (const [k, v] of Object.entries(hdrs)) {
        if (v !== undefined) out[k.toLowerCase()] = String(v);
      }
      return out;
    }

    class IncomingMessage extends MiniEventEmitter {
      constructor({ method = 'GET', url = '/', statusCode = 200, headers = {}, socket = null } = {}) {
        super();
        this.method = method;
        this.url = url;
        this.statusCode = statusCode;
        this.headers = lowercaseHeaders(headers);
        this.socket = socket || { remoteAddress: '127.0.0.1', encrypted: false };
        this.destroyed = false;
        this.complete = false;
        this._BufferedChunks = [];
        this._flowing = false;
        this._ended = false;
      }

      on(event, fn) {
        super.on(event, fn);
        if (event === 'data') {
          this._flowing = true;
          this._flushBuffered();
        } else if (event === 'end' && this._ended && this._BufferedChunks.length === 0) {
          queueMicrotask(() => {
            if (!this.complete) {
              this.complete = true;
              this.emit('end');
            }
          });
        }
        return this;
      }

      resume() {
        this._flowing = true;
        this._flushBuffered();
        return this;
      }

      pause() {
        this._flowing = false;
        return this;
      }

      pipe(dest) {
        this.on('data', (chunk) => {
          if (!dest.destroyed && !dest.writableFinished) dest.write(chunk);
        });
        this.on('end', () => {
          if (!dest.destroyed && !dest.writableFinished) dest.end();
        });
        return dest;
      }

      _pushData(chunk) {
        if (this.destroyed) return;
        const buf = VirtualBuffer.isBuffer(chunk) ? chunk : VirtualBuffer.from(chunk);
        if (this._flowing && this.listenerCount('data') > 0) {
          this.emit('data', buf);
        } else {
          this._BufferedChunks.push(buf);
        }
      }

      _pushEnd() {
        if (this.destroyed || this._ended) return;
        this._ended = true;
        this._flushBuffered();
      }

      _flushBuffered() {
        if (this.destroyed) return;
        if (this._flowing && this.listenerCount('data') > 0) {
          while (this._BufferedChunks.length > 0) {
            const c = this._BufferedChunks.shift();
            this.emit('data', c);
          }
        }
        if (this._ended && (this._flowing || this._BufferedChunks.length === 0)) {
          this._BufferedChunks.length = 0;
          if (!this.complete) {
            this.complete = true;
            this.emit('end');
          }
        }
      }

      destroy(err) {
        if (this.destroyed) return this;
        this.destroyed = true;
        if (err) this.emit('error', err);
        this.emit('close');
        return this;
      }
    }

    class ServerResponse extends MiniEventEmitter {
      constructor(clientReq, traceEntry) {
        super();
        this._clientReq = clientReq;
        this._traceEntry = traceEntry;
        this.statusCode = 200;
        this.statusMessage = 'OK';
        this.headersSent = false;
        this.writableFinished = false;
        this.destroyed = false;
        this._headers = {};
        this._clientRes = null;
      }

      setHeader(name, value) {
        if (this.headersSent) throw new Error('Cannot set headers after they are sent to the client');
        this._headers[String(name).toLowerCase()] = String(value);
        return this;
      }

      getHeader(name) {
        return this._headers[String(name).toLowerCase()];
      }

      removeHeader(name) {
        delete this._headers[String(name).toLowerCase()];
      }

      writeHead(statusCode, statusMessage, headers) {
        if (this.headersSent) return this;
        this.statusCode = Number(statusCode) || 200;
        let hdrs = headers;
        if (typeof statusMessage === 'object' && statusMessage !== null) {
          hdrs = statusMessage;
        } else if (typeof statusMessage === 'string') {
          this.statusMessage = statusMessage;
        }
        if (hdrs) {
          for (const [k, v] of Object.entries(hdrs)) {
            if (v !== undefined) this._headers[k.toLowerCase()] = String(v);
          }
        }
        this.headersSent = true;
        this._clientRes = new IncomingMessage({
          statusCode: this.statusCode,
          headers: { ...this._headers }
        });
        if (!this._clientReq.destroyed) {
          this._clientReq._onResponseHeaders(this._clientRes);
        }
        return this;
      }

      write(chunk, encoding) {
        if (this.destroyed || this.writableFinished) return false;
        if (!this.headersSent) this.writeHead(this.statusCode, this._headers);
        if (chunk !== undefined && chunk !== null && chunk !== '') {
          const buf = typeof chunk === 'string'
            ? VirtualBuffer.from(chunk, encoding || 'utf8')
            : VirtualBuffer.from(chunk);
          if (this._traceEntry) this._traceEntry.responseBytes += buf.length;
          const res = this._clientRes;
          const req = this._clientReq;
          queueMicrotask(() => {
            if (!req.destroyed && res) res._pushData(buf);
          });
        }
        return true;
      }

      end(chunk, encoding, cb) {
        if (typeof chunk === 'function') { cb = chunk; chunk = undefined; }
        else if (typeof encoding === 'function') { cb = encoding; encoding = undefined; }
        if (this.destroyed || this.writableFinished) return this;
        if (!this.headersSent) this.writeHead(this.statusCode, this._headers);
        if (chunk !== undefined && chunk !== null && chunk !== '') {
          this.write(chunk, encoding);
        }
        this.writableFinished = true;
        if (this._traceEntry) {
          this._traceEntry.status = this.statusCode;
          this._traceEntry.durationMs = Math.max(0, performance.now() - this._traceEntry._t0);
          this._traceEntry.responseHeaders = { ...this._headers };
        }
        const res = this._clientRes;
        const req = this._clientReq;
        queueMicrotask(() => {
          req._clearTimeout();
          if (!req.destroyed && res) res._pushEnd();
          req._finishInFlight();
          this.emit('finish');
          this.emit('close');
          if (typeof cb === 'function') cb();
        });
        return this;
      }

      destroy(err) {
        if (this.destroyed) return this;
        this.destroyed = true;
        this._clientReq._finishInFlight();
        if (err) this.emit('error', err);
        this.emit('close');
        return this;
      }
    }

    class ClientRequest extends MiniEventEmitter {
      constructor(options, resCallback) {
        super();
        if (typeof options === 'string' || (typeof URL !== 'undefined' && options instanceof URL)) {
          const u = new URL(String(options));
          options = {
            host: u.hostname,
            port: Number(u.port) || 80,
            path: u.pathname + u.search,
            method: 'GET'
          };
        }
        this.host = options.host || options.hostname || '127.0.0.1';
        this.port = Number(options.port) || 80;
        this.method = String(options.method || 'GET').toUpperCase();
        this.path = options.path || '/';
        this.headers = lowercaseHeaders(options.headers || {});
        if (!this.headers.host) {
          this.headers.host = `${this.host}:${this.port}`;
        }
        this.destroyed = false;
        this._bodyChunks = [];
        this._ended = false;
        this._timeoutTimer = null;
        this._serverRes = null;
        this._inFlightDone = false;

        if (typeof resCallback === 'function') {
          this.once('response', resCallback);
        }

        if (resourceTracker) resourceTracker.inFlightHttp.add(this);
      }

      _finishInFlight() {
        if (!this._inFlightDone) {
          this._inFlightDone = true;
          this._clearTimeout();
          if (resourceTracker) resourceTracker.inFlightHttp.delete(this);
        }
      }

      _clearTimeout() {
        if (this._timeoutTimer !== null) {
          clearTimeout(this._timeoutTimer);
          if (resourceTracker) resourceTracker.activeTimers.delete(this._timeoutTimer);
          this._timeoutTimer = null;
        }
      }

      setTimeout(ms, callback) {
        this._clearTimeout();
        if (typeof callback === 'function') this.once('timeout', callback);
        if (ms > 0 && Number.isFinite(ms)) {
          const timerId = setTimeout(() => {
            if (resourceTracker) resourceTracker.activeTimers.delete(timerId);
            this._timeoutTimer = null;
            if (!this.destroyed && !this._inFlightDone) {
              this.emit('timeout');
            }
          }, ms);
          this._timeoutTimer = timerId;
          if (resourceTracker) resourceTracker.activeTimers.add(timerId);
        }
        return this;
      }

      write(chunk, encoding) {
        if (this.destroyed || this._ended) return false;
        if (chunk !== undefined && chunk !== null && chunk !== '') {
          const buf = typeof chunk === 'string'
            ? VirtualBuffer.from(chunk, encoding || 'utf8')
            : VirtualBuffer.from(chunk);
          this._bodyChunks.push(buf);
        }
        return true;
      }

      end(chunk, encoding, cb) {
        if (typeof chunk === 'function') { cb = chunk; chunk = undefined; }
        else if (typeof encoding === 'function') { cb = encoding; encoding = undefined; }
        if (this._ended || this.destroyed) return this;
        if (chunk !== undefined && chunk !== null && chunk !== '') {
          this.write(chunk, encoding);
        }
        this._ended = true;
        if (typeof cb === 'function') queueMicrotask(cb);

        const traceEntry = {
          id: httpTrace.length + 1,
          method: this.method,
          host: this.host,
          port: this.port,
          url: this.path,
          status: 'PENDING',
          durationMs: 0,
          requestBytes: this._bodyChunks.reduce((s, b) => s + b.length, 0),
          responseBytes: 0,
          requestHeaders: { ...this.headers },
          responseHeaders: {},
          _t0: performance.now()
        };
        httpTrace.push(traceEntry);
        this._traceEntry = traceEntry;

        queueMicrotask(() => {
          if (this.destroyed) {
            this._finishInFlight();
            return;
          }
          const server = activeServers.get(this.port);
          if (!server || !server._listening) {
            const err = new Error(`connect ECONNREFUSED ${this.host}:${this.port}`);
            err.code = 'ECONNREFUSED';
            err.errno = -61;
            err.syscall = 'connect';
            err.address = this.host;
            err.port = this.port;
            traceEntry.status = 'ECONNREFUSED';
            traceEntry.durationMs = Math.max(0, performance.now() - traceEntry._t0);
            this._finishInFlight();
            this.emit('error', err);
            return;
          }

          const serverReq = new IncomingMessage({
            method: this.method,
            url: this.path,
            headers: { ...this.headers },
            socket: { remoteAddress: '127.0.0.1', encrypted: false }
          });
          const serverRes = new ServerResponse(this, traceEntry);
          this._serverRes = serverRes;

          try {
            server.emit('request', serverReq, serverRes);
          } catch (err) {
            this._finishInFlight();
            this.emit('error', err);
            return;
          }

          queueMicrotask(() => {
            if (this.destroyed) return;
            try {
              for (let i = 0; i < this._bodyChunks.length; i++) {
                serverReq._pushData(this._bodyChunks[i]);
              }
              serverReq._pushEnd();
            } catch (err) {
              this._finishInFlight();
              this.emit('error', err);
            }
          });
        });

        return this;
      }

      _onResponseHeaders(clientRes) {
        if (this.destroyed) return;
        this.emit('response', clientRes);
      }

      destroy(err) {
        if (this.destroyed) return this;
        this.destroyed = true;
        if (this._traceEntry && this._traceEntry.status === 'PENDING') {
          this._traceEntry.status = (err && err.code) ? err.code : 'ABORTED';
          this._traceEntry.durationMs = Math.max(0, performance.now() - this._traceEntry._t0);
        }
        this._finishInFlight();
        if (this._serverRes && !this._serverRes.writableFinished) {
          this._serverRes.destroyed = true;
          this._serverRes.emit('close');
        }
        if (err) {
          queueMicrotask(() => this.emit('error', err));
        }
        queueMicrotask(() => this.emit('close'));
        return this;
      }
    }

    class VirtualServer extends MiniEventEmitter {
      constructor(requestListener) {
        super();
        if (typeof requestListener === 'function') {
          this.on('request', requestListener);
        }
        this._port = null;
        this._host = '127.0.0.1';
        this._listening = false;
      }

      listen(port = 0, host = '127.0.0.1', callback) {
        if (typeof port === 'function') {
          callback = port;
          port = 0;
          host = '127.0.0.1';
        } else if (typeof host === 'function') {
          callback = host;
          host = '127.0.0.1';
        }
        this._port = port === 0 ? nextEphemeralPort++ : Number(port);
        this._host = host || '127.0.0.1';
        this._listening = true;
        activeServers.set(this._port, this);
        if (typeof callback === 'function') {
          this.once('listening', callback);
        }
        queueMicrotask(() => {
          this.emit('listening');
        });
        return this;
      }

      address() {
        if (!this._listening) return null;
        return { port: this._port, family: 'IPv4', address: this._host };
      }

      closeAllConnections() {
        // Virtual loopback connections are cleaned up automatically
      }

      close(callback) {
        if (this._port !== null) {
          activeServers.delete(this._port);
        }
        this._listening = false;
        if (typeof callback === 'function') {
          queueMicrotask(() => callback());
        }
        queueMicrotask(() => this.emit('close'));
        return this;
      }
    }

    class Agent {
      constructor(opts = {}) {
        this.options = opts;
        this.keepAlive = Boolean(opts.keepAlive);
        this.maxSockets = opts.maxSockets || Infinity;
      }
      destroy() {}
    }

    return {
      Agent,
      Server: VirtualServer,
      IncomingMessage,
      ServerResponse,
      ClientRequest,
      createServer(requestListener) {
        return new VirtualServer(requestListener);
      },
      request(options, callback) {
        return new ClientRequest(options, callback);
      },
      get(options, callback) {
        const req = new ClientRequest(options, callback);
        req.end();
        return req;
      },
      getTrace() {
        return httpTrace.map(({ _t0, ...rest }) => rest);
      },
      closeAllServers() {
        activeServers.clear();
      }
    };
  }

  // =========================================================================
  // 7. COMPLETE ASSERTION LIBRARY (node:assert & node:assert/strict)
  // =========================================================================
  class AssertionError extends Error {
    constructor({ message, actual, expected, operator }) {
      const msg = message || `Assertion failed: ${formatValue(actual)} ${operator || '!='} ${formatValue(expected)}`;
      super(msg);
      this.name = 'AssertionError';
      this.code = 'ERR_ASSERTION';
      this.actual = actual;
      this.expected = expected;
      this.operator = operator;
    }
  }

  function formatValue(v) {
    if (typeof v === 'string') return JSON.stringify(v);
    if (typeof v === 'bigint') return `${v}n`;
    if (v instanceof RegExp || v instanceof Error) return String(v);
    if (VirtualBuffer.isBuffer(v)) return `<Buffer ${v.toString('hex').slice(0, 32)}>`;
    try {
      return JSON.stringify(v);
    } catch (_) {
      return String(v);
    }
  }

  function isDeepEqual(a, b, strict = true, seen = new Map()) {
    if (strict ? Object.is(a, b) : a == b) return true;
    if (strict && typeof a === 'number' && typeof b === 'number' && Number.isNaN(a) && Number.isNaN(b)) return true;
    if (a === null || b === null || typeof a !== 'object' || typeof b !== 'object') {
      return strict ? Object.is(a, b) : a == b;
    }
    if (a instanceof Date && b instanceof Date) return a.getTime() === b.getTime();
    if (a instanceof RegExp && b instanceof RegExp) return a.source === b.source && a.flags === b.flags;
    if (ArrayBuffer.isView(a) && ArrayBuffer.isView(b)) {
      if (a.byteLength !== b.byteLength) return false;
      const ua = new Uint8Array(a.buffer, a.byteOffset, a.byteLength);
      const ub = new Uint8Array(b.buffer, b.byteOffset, b.byteLength);
      for (let i = 0; i < ua.length; i++) if (ua[i] !== ub[i]) return false;
      return true;
    }
    if (a instanceof Set && b instanceof Set) {
      if (a.size !== b.size) return false;
      for (const v of a) if (!b.has(v)) return false;
      return true;
    }
    if (a instanceof Map && b instanceof Map) {
      if (a.size !== b.size) return false;
      for (const [k, v] of a.entries()) {
        if (!b.has(k) || !isDeepEqual(v, b.get(k), strict, seen)) return false;
      }
      return true;
    }
    if (Array.isArray(a) !== Array.isArray(b)) return false;
    if (seen.get(a) === b) return true;
    seen.set(a, b);
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    if (keysA.length !== keysB.length) return false;
    for (let i = 0; i < keysA.length; i++) {
      const k = keysA[i];
      if (!Object.prototype.hasOwnProperty.call(b, k)) return false;
      if (!isDeepEqual(a[k], b[k], strict, seen)) return false;
    }
    return true;
  }

  function matchesError(err, matcher) {
    if (!matcher) return true;
    if (matcher instanceof RegExp) {
      return matcher.test(err && err.message ? err.message : String(err)) || matcher.test(String(err));
    }
    if (typeof matcher === 'function') {
      if (matcher.prototype && err instanceof matcher) return true;
      if (matcher === Error || (matcher.prototype && matcher.prototype instanceof Error)) {
        return Boolean(err && (err instanceof matcher || err.name === matcher.name));
      }
      try {
        return Boolean(matcher(err));
      } catch (_) {
        return false;
      }
    }
    if (typeof matcher === 'object') {
      for (const [k, v] of Object.entries(matcher)) {
        if (v instanceof RegExp) {
          if (!v.test(String(err[k]))) return false;
        } else if (err[k] !== v) {
          return false;
        }
      }
      return true;
    }
    return true;
  }

  function assert(value, message) {
    if (!value) {
      throw new AssertionError({ message, actual: value, expected: true, operator: '==' });
    }
  }

  assert.AssertionError = AssertionError;
  assert.ok = assert;
  assert.fail = function fail(message) {
    throw new AssertionError({ message: message || 'Failed', actual: false, expected: true, operator: 'fail' });
  };
  assert.equal = function equal(actual, expected, message) {
    if (actual != expected && !(Number.isNaN(actual) && Number.isNaN(expected))) {
      throw new AssertionError({ message, actual, expected, operator: '==' });
    }
  };
  assert.notEqual = function notEqual(actual, expected, message) {
    if (actual == expected) {
      throw new AssertionError({ message, actual, expected, operator: '!=' });
    }
  };
  assert.strictEqual = function strictEqual(actual, expected, message) {
    if (!Object.is(actual, expected)) {
      throw new AssertionError({ message, actual, expected, operator: '===' });
    }
  };
  assert.notStrictEqual = function notStrictEqual(actual, expected, message) {
    if (Object.is(actual, expected)) {
      throw new AssertionError({ message, actual, expected, operator: '!==' });
    }
  };
  assert.deepEqual = function deepEqual(actual, expected, message) {
    if (!isDeepEqual(actual, expected, false)) {
      throw new AssertionError({ message, actual, expected, operator: 'deepEqual' });
    }
  };
  assert.notDeepEqual = function notDeepEqual(actual, expected, message) {
    if (isDeepEqual(actual, expected, false)) {
      throw new AssertionError({ message, actual, expected, operator: 'notDeepEqual' });
    }
  };
  assert.deepStrictEqual = function deepStrictEqual(actual, expected, message) {
    if (!isDeepEqual(actual, expected, true)) {
      throw new AssertionError({ message, actual, expected, operator: 'deepStrictEqual' });
    }
  };
  assert.notDeepStrictEqual = function notDeepStrictEqual(actual, expected, message) {
    if (isDeepEqual(actual, expected, true)) {
      throw new AssertionError({ message, actual, expected, operator: 'notDeepStrictEqual' });
    }
  };
  assert.match = function match(string, regexp, message) {
    if (!(regexp instanceof RegExp) || !regexp.test(String(string))) {
      throw new AssertionError({ message, actual: string, expected: regexp, operator: 'match' });
    }
  };
  assert.doesNotMatch = function doesNotMatch(string, regexp, message) {
    if (regexp instanceof RegExp && regexp.test(String(string))) {
      throw new AssertionError({ message, actual: string, expected: regexp, operator: 'doesNotMatch' });
    }
  };
  assert.throws = function throws(block, errorOrMessage, maybeMessage) {
    let matcher = errorOrMessage;
    let msg = maybeMessage;
    if (typeof errorOrMessage === 'string' && maybeMessage === undefined) {
      matcher = null;
      msg = errorOrMessage;
    }
    let threw = false;
    let thrownErr = null;
    try {
      block();
    } catch (e) {
      threw = true;
      thrownErr = e;
    }
    if (!threw) {
      throw new AssertionError({ message: msg || 'Missing expected exception', actual: undefined, expected: matcher, operator: 'throws' });
    }
    if (matcher && !matchesError(thrownErr, matcher)) {
      throw new AssertionError({
        message: msg || `Unexpected exception: ${thrownErr && thrownErr.message ? thrownErr.message : thrownErr}`,
        actual: thrownErr,
        expected: matcher,
        operator: 'throws'
      });
    }
  };
  assert.doesNotThrow = function doesNotThrow(block, message) {
    try {
      block();
    } catch (e) {
      throw new AssertionError({ message: message || `Got unwanted exception: ${e.message}`, actual: e, expected: undefined, operator: 'doesNotThrow' });
    }
  };
  assert.rejects = async function rejects(asyncFnOrPromise, errorOrMessage, maybeMessage) {
    let matcher = errorOrMessage;
    let msg = maybeMessage;
    if (typeof errorOrMessage === 'string' && maybeMessage === undefined) {
      matcher = null;
      msg = errorOrMessage;
    }
    let threw = false;
    let thrownErr = null;
    try {
      const p = typeof asyncFnOrPromise === 'function' ? asyncFnOrPromise() : asyncFnOrPromise;
      await p;
    } catch (e) {
      threw = true;
      thrownErr = e;
    }
    if (!threw) {
      throw new AssertionError({ message: msg || 'Missing expected rejection', actual: undefined, expected: matcher, operator: 'rejects' });
    }
    if (matcher && !matchesError(thrownErr, matcher)) {
      throw new AssertionError({
        message: msg || `Unexpected rejection: ${thrownErr && thrownErr.message ? thrownErr.message : thrownErr}`,
        actual: thrownErr,
        expected: matcher,
        operator: 'rejects'
      });
    }
  };
  assert.strict = assert;

  // =========================================================================
  // 7b. VIRTUAL `node:util` (`format`, `inspect`, `promisify`, `callbackify`, `inherits`, `types`)
  // =========================================================================
  const kCustomPromisifiedSymbol = Symbol.for('nodejs.util.promisify.custom');

  function utilInspect(val, opts = {}) {
    const maxDepth = opts && typeof opts.depth === 'number' ? opts.depth : 4;
    const seen = new WeakSet();
    function fmt(v, depth) {
      if (v === null) return 'null';
      if (v === undefined) return 'undefined';
      if (typeof v === 'string') return JSON.stringify(v);
      if (typeof v === 'number' || typeof v === 'boolean') return String(v);
      if (typeof v === 'bigint') return `${v}n`;
      if (typeof v === 'symbol') return v.toString();
      if (typeof v === 'function') return `[Function: ${v.name || 'anonymous'}]`;
      if (v instanceof RegExp) return v.toString();
      if (v instanceof Date) return Number.isNaN(v.getTime()) ? 'Invalid Date' : v.toISOString();
      if (v instanceof Error) return v.stack || `${v.name}: ${v.message}`;
      if (VirtualBuffer.isBuffer(v)) {
        const hex = v.toString('hex');
        const pairs = hex.match(/.{1,2}/g) || [];
        return `<Buffer ${pairs.slice(0, 32).join(' ')}${pairs.length > 32 ? ' ... ' : ''}>`;
      }
      if (v instanceof Uint8Array) {
        return `Uint8Array(${v.byteLength}) [ ${Array.from(v.slice(0, 16)).join(', ')}${v.byteLength > 16 ? ', ...' : ''} ]`;
      }
      if (typeof v === 'object') {
        if (seen.has(v)) return '[Circular]';
        if (depth > maxDepth) return Array.isArray(v) ? '[Array]' : '[Object]';
        seen.add(v);
        try {
          if (v instanceof Map) {
            const entries = [];
            for (const [mk, mv] of v.entries()) {
              entries.push(`${fmt(mk, depth + 1)} => ${fmt(mv, depth + 1)}`);
            }
            return `Map(${v.size}) { ${entries.join(', ')} }`;
          }
          if (v instanceof Set) {
            const items = [];
            for (const sv of v.values()) items.push(fmt(sv, depth + 1));
            return `Set(${v.size}) { ${items.join(', ')} }`;
          }
          if (Array.isArray(v)) {
            if (v.length === 0) return '[]';
            return `[ ${v.map((item) => fmt(item, depth + 1)).join(', ')} ]`;
          }
          const keys = Object.keys(v);
          if (keys.length === 0) return '{}';
          const pairs = keys.map((k) => {
            const safeKey = /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(k) ? k : JSON.stringify(k);
            return `${safeKey}: ${fmt(v[k], depth + 1)}`;
          });
          const ctor = v.constructor && v.constructor !== Object ? `${v.constructor.name} ` : '';
          return `${ctor}{ ${pairs.join(', ')} }`;
        } finally {
          seen.delete(v);
        }
      }
      return String(v);
    }
    return fmt(val, 0);
  }

  function utilFormat(...args) {
    if (args.length === 0) return '';
    const first = args[0];
    if (typeof first !== 'string') {
      return args.map((a) => (typeof a === 'object' && a !== null ? utilInspect(a) : String(a))).join(' ');
    }
    let idx = 1;
    let out = '';
    for (let i = 0; i < first.length; i++) {
      if (first[i] === '%' && i + 1 < first.length) {
        const next = first[i + 1];
        if (next === '%') {
          out += '%';
          i++;
          continue;
        }
        if (idx < args.length) {
          const arg = args[idx];
          if (next === 's') { out += String(arg); idx++; i++; continue; }
          if (next === 'd') { out += Number(arg); idx++; i++; continue; }
          if (next === 'i') { out += parseInt(arg, 10); idx++; i++; continue; }
          if (next === 'f') { out += parseFloat(arg); idx++; i++; continue; }
          if (next === 'j') {
            try { out += JSON.stringify(arg); } catch (_) { out += '[Circular]'; }
            idx++; i++; continue;
          }
          if (next === 'o' || next === 'O') {
            out += utilInspect(arg);
            idx++; i++; continue;
          }
        }
      }
      out += first[i];
    }
    while (idx < args.length) {
      const a = args[idx++];
      out += ' ' + (typeof a === 'object' && a !== null ? utilInspect(a) : String(a));
    }
    return out;
  }

  function utilPromisify(original) {
    if (typeof original !== 'function') {
      throw new TypeError('The "original" argument must be of type Function');
    }
    if (original[kCustomPromisifiedSymbol]) {
      const fn = original[kCustomPromisifiedSymbol];
      if (typeof fn !== 'function') {
        throw new TypeError('The "util.promisify.custom" property must be of type Function');
      }
      return Object.defineProperty(fn, kCustomPromisifiedSymbol, {
        value: fn, enumerable: false, writable: false, configurable: true
      });
    }
    function fn(...args) {
      return new Promise((resolve, reject) => {
        try {
          original.call(this, ...args, (err, ...values) => {
            if (err) return reject(err);
            resolve(values.length <= 1 ? values[0] : values);
          });
        } catch (err) {
          reject(err);
        }
      });
    }
    Object.setPrototypeOf(fn, Object.getPrototypeOf(original));
    Object.defineProperty(fn, kCustomPromisifiedSymbol, {
      value: fn, enumerable: false, writable: false, configurable: true
    });
    return fn;
  }
  utilPromisify.custom = kCustomPromisifiedSymbol;

  function utilCallbackify(original) {
    if (typeof original !== 'function') {
      throw new TypeError('The "original" argument must be of type Function');
    }
    return function callbackified(...args) {
      const maybeCb = args.pop();
      if (typeof maybeCb !== 'function') {
        throw new TypeError('The last argument must be of type Function');
      }
      Promise.resolve()
        .then(() => original.apply(this, args))
        .then(
          (ret) => queueMicrotask(() => maybeCb(null, ret)),
          (err) => queueMicrotask(() => {
            const e = err || new Error('Promise was rejected with a falsy value');
            maybeCb(e);
          })
        );
    };
  }

  function utilInherits(ctor, superCtor) {
    if (ctor === undefined || ctor === null) throw new TypeError('The constructor to "inherits" must not be null or undefined');
    if (superCtor === undefined || superCtor === null) throw new TypeError('The super constructor to "inherits" must not be null or undefined');
    ctor.super_ = superCtor;
    Object.setPrototypeOf(ctor.prototype, superCtor.prototype);
  }

  const VirtualUtil = {
    format: utilFormat,
    inspect: utilInspect,
    promisify: utilPromisify,
    callbackify: utilCallbackify,
    inherits: utilInherits,
    isDeepStrictEqual: (a, b) => isDeepEqual(a, b, true),
    deprecate: (fn) => fn,
    TextEncoder: typeof TextEncoder !== 'undefined' ? TextEncoder : undefined,
    TextDecoder: typeof TextDecoder !== 'undefined' ? TextDecoder : undefined,
    types: {
      isPromise: (v) => Boolean(v && typeof v === 'object' && typeof v.then === 'function'),
      isRegExp: (v) => v instanceof RegExp,
      isDate: (v) => v instanceof Date,
      isUint8Array: (v) => v instanceof Uint8Array,
      isArrayBuffer: (v) => v instanceof ArrayBuffer || (typeof SharedArrayBuffer !== 'undefined' && v instanceof SharedArrayBuffer),
      isMap: (v) => v instanceof Map,
      isSet: (v) => v instanceof Set,
      isNativeError: (v) => v instanceof Error,
      isBoxedPrimitive: (v) => v instanceof Number || v instanceof String || v instanceof Boolean
    }
  };

  // --- node:string_decoder ---
  class StringDecoder {
    constructor(encoding = 'utf8') {
      const enc = String(encoding || 'utf8').toLowerCase().replace(/[-_]/g, '');
      this.encoding = enc === 'utf8' || enc === 'utf' ? 'utf8' : (enc === 'ucs2' || enc === 'utf16le' ? 'utf16le' : (enc === 'latin1' || enc === 'binary' ? 'latin1' : enc));
      this._pending = VirtualBuffer.alloc(0);
    }

    write(buf) {
      const chunk = VirtualBuffer.isBuffer(buf) ? buf : VirtualBuffer.from(buf);
      if (chunk.length === 0) return '';
      if (this.encoding !== 'utf8' && this.encoding !== 'utf16le' && this.encoding !== 'base64') {
        return chunk.toString(this.encoding);
      }
      const combined = this._pending.length > 0 ? VirtualBuffer.concat([this._pending, chunk]) : chunk;
      if (this.encoding === 'utf16le') {
        const rem = combined.length % 2;
        const completeLen = combined.length - rem;
        this._pending = rem > 0 ? VirtualBuffer.from(combined.subarray(completeLen)) : VirtualBuffer.alloc(0);
        return completeLen > 0 ? combined.subarray(0, completeLen).toString('utf16le') : '';
      }
      if (this.encoding === 'base64') {
        const rem = combined.length % 3;
        const completeLen = combined.length - rem;
        this._pending = rem > 0 ? VirtualBuffer.from(combined.subarray(completeLen)) : VirtualBuffer.alloc(0);
        return completeLen > 0 ? combined.subarray(0, completeLen).toString('base64') : '';
      }
      // UTF-8 multi-byte boundary detection
      let incomplete = 0;
      const len = combined.length;
      for (let i = 1; i <= 3 && i <= len; i++) {
        const byte = combined[len - i];
        if ((byte & 0xc0) === 0x80) {
          continue; // continuation byte 10xxxxxx
        }
        let expectedLen = 1;
        if ((byte & 0xe0) === 0xc0) expectedLen = 2;
        else if ((byte & 0xf0) === 0xe0) expectedLen = 3;
        else if ((byte & 0xf8) === 0xf0) expectedLen = 4;
        if (i < expectedLen) {
          incomplete = i;
        }
        break;
      }
      const completeLen = len - incomplete;
      this._pending = incomplete > 0 ? VirtualBuffer.from(combined.subarray(completeLen)) : VirtualBuffer.alloc(0);
      return completeLen > 0 ? combined.subarray(0, completeLen).toString('utf8') : '';
    }

    end(buf) {
      let res = '';
      if (buf !== undefined) {
        res += this.write(buf);
      }
      if (this._pending.length > 0) {
        res += this._pending.toString(this.encoding);
        this._pending = VirtualBuffer.alloc(0);
      }
      return res;
    }
  }

  const VirtualStringDecoder = { StringDecoder };

  // --- node:dns ---
  const VirtualDnsPromises = {
    async lookup(hostname, options) {
      const all = options && typeof options === 'object' && options.all;
      const family = (typeof options === 'number' ? options : options?.family) || 4;
      const address = family === 6 ? '::1' : '127.0.0.1';
      if (all) return [{ address, family }];
      return { address, family };
    },
    async resolve(hostname, rrtype = 'A') {
      if (rrtype === 'AAAA') return ['::1'];
      if (rrtype === 'TXT') return [['v=spf1 loopback']];
      if (rrtype === 'MX') return [{ exchange: `mail.${hostname}`, priority: 10 }];
      if (rrtype === 'CNAME') return [`${hostname}.local`];
      if (hostname === 'example.com') return ['93.184.216.34'];
      return ['127.0.0.1'];
    },
    async resolve4(hostname) {
      if (hostname === 'example.com') return ['93.184.216.34'];
      return ['127.0.0.1'];
    },
    async resolve6() { return ['::1']; },
    async reverse() { return ['localhost']; }
  };

  function dnsLookup(hostname, options, callback) {
    const cb = typeof options === 'function' ? options : callback;
    const opts = typeof options === 'function' ? {} : options;
    VirtualDnsPromises.lookup(hostname, opts).then((res) => {
      if (typeof cb !== 'function') return;
      if (Array.isArray(res)) cb(null, res);
      else cb(null, res.address, res.family);
    }, (err) => { if (typeof cb === 'function') cb(err); });
  }
  dnsLookup[utilPromisify.custom] = VirtualDnsPromises.lookup;

  const VirtualDns = {
    ADDRCONFIG: 1024,
    V4MAPPED: 2048,
    lookup: dnsLookup,
    resolve(hostname, rrtype, callback) {
      const cb = typeof rrtype === 'function' ? rrtype : callback;
      const type = typeof rrtype === 'string' ? rrtype : 'A';
      VirtualDnsPromises.resolve(hostname, type).then((r) => cb && cb(null, r), (e) => cb && cb(e));
    },
    resolve4(hostname, options, callback) {
      const cb = typeof options === 'function' ? options : callback;
      VirtualDnsPromises.resolve4(hostname).then((r) => cb && cb(null, r), (e) => cb && cb(e));
    },
    resolve6(hostname, options, callback) {
      const cb = typeof options === 'function' ? options : callback;
      VirtualDnsPromises.resolve6(hostname).then((r) => cb && cb(null, r), (e) => cb && cb(e));
    },
    reverse(ip, callback) {
      VirtualDnsPromises.reverse(ip).then((r) => callback && callback(null, r), (e) => callback && callback(e));
    },
    promises: VirtualDnsPromises
  };

  // --- node:net (In-Memory Loopback TCP Server & Socket) ---
  function createVirtualNet(resourceTracker, sharedTrace = []) {
    const servers = new Map();
    let nextPort = 40000;

    class Socket extends Duplex {
      constructor(options = {}) {
        super(options);
        this.connecting = false;
        this.destroyed = false;
        this.remoteAddress = '127.0.0.1';
        this.remoteFamily = 'IPv4';
        this.remotePort = null;
        this.localAddress = '127.0.0.1';
        this.localPort = null;
        this.bytesRead = 0;
        this.bytesWritten = 0;
        this._peer = null;
        this._encoding = null;
        this._timeoutMs = 0;
        this._timeoutId = null;
        this._endEmitted = false;
      }

      setEncoding(enc) {
        this._encoding = enc;
        return this;
      }

      setNoDelay() { return this; }
      setKeepAlive() { return this; }
      ref() { return this; }
      unref() { return this; }

      setTimeout(ms, cb) {
        if (this._timeoutId) {
          clearTimeout(this._timeoutId);
          this._timeoutId = null;
        }
        this._timeoutMs = ms;
        if (typeof cb === 'function') this.once('timeout', cb);
        if (ms > 0 && !this.destroyed) {
          this._timeoutId = setTimeout(() => {
            this.emit('timeout');
          }, ms);
        }
        return this;
      }

      address() {
        return { port: this.localPort || 0, family: 'IPv4', address: this.localAddress };
      }

      connect(...args) {
        let port;
        let host = '127.0.0.1';
        let connectListener = null;
        if (typeof args[0] === 'object' && args[0] !== null) {
          port = Number(args[0].port);
          if (args[0].host) host = args[0].host;
          if (typeof args[1] === 'function') connectListener = args[1];
        } else {
          port = Number(args[0]);
          if (typeof args[1] === 'string') {
            host = args[1];
            if (typeof args[2] === 'function') connectListener = args[2];
          } else if (typeof args[1] === 'function') {
            connectListener = args[1];
          }
        }
        if (connectListener) this.once('connect', connectListener);

        this.connecting = true;
        this.remotePort = port;
        this.remoteAddress = host;
        this.localPort = nextPort++;

        queueMicrotask(() => {
          if (this.destroyed) return;
          const srv = servers.get(port);
          if (!srv || !srv.listening) {
            this.connecting = false;
            const err = new Error(`connect ECONNREFUSED ${host}:${port}`);
            err.code = 'ECONNREFUSED';
            err.errno = -111;
            err.syscall = 'connect';
            err.address = host;
            err.port = port;
            this.emit('error', err);
            return;
          }

          const serverSocket = new Socket();
          serverSocket.localPort = port;
          serverSocket.remotePort = this.localPort;
          serverSocket._peer = this;
          this._peer = serverSocket;
          this.connecting = false;

          sharedTrace.push({
            protocol: 'TCP',
            event: 'connect',
            localPort: this.localPort,
            remotePort: port,
            host,
            timestamp: Date.now()
          });

          srv._connections.add(serverSocket);
          serverSocket.once('close', () => srv._connections.delete(serverSocket));

          srv.emit('connection', serverSocket);
          this.emit('connect');
          this.emit('ready');
        });
        return this;
      }

      write(chunk, encoding, cb) {
        const callback = typeof encoding === 'function' ? encoding : cb;
        const enc = typeof encoding === 'string' ? encoding : 'utf8';
        if (this.destroyed) {
          const err = new Error('This socket has been ended by the other party');
          err.code = 'EPIPE';
          if (typeof callback === 'function') queueMicrotask(() => callback(err));
          return false;
        }
        const buf = VirtualBuffer.isBuffer(chunk) ? chunk : VirtualBuffer.from(String(chunk ?? ''), enc);
        this.bytesWritten += buf.length;

        const peer = this._peer;
        if (peer && !peer.destroyed) {
          queueMicrotask(() => {
            if (peer.destroyed) return;
            peer.bytesRead += buf.length;
            const out = peer._encoding ? buf.toString(peer._encoding) : buf;
            peer.emit('data', out);
            if (typeof callback === 'function') callback(null);
          });
        } else if (typeof callback === 'function') {
          queueMicrotask(() => callback(null));
        }
        return true;
      }

      end(chunk, encoding, cb) {
        const callback = typeof chunk === 'function' ? chunk : (typeof encoding === 'function' ? encoding : cb);
        const enc = typeof encoding === 'string' ? encoding : 'utf8';
        if (chunk !== undefined && chunk !== null && typeof chunk !== 'function') {
          this.write(chunk, enc);
        }
        queueMicrotask(() => {
          if (this.destroyed) return;
          const peer = this._peer;
          if (peer && !peer.destroyed && !peer._endEmitted) {
            peer._endEmitted = true;
            peer.emit('end');
          }
          this.emit('finish');
          if (typeof callback === 'function') callback();
          this.destroy();
        });
        return this;
      }

      destroy(err) {
        if (this.destroyed) return this;
        this.destroyed = true;
        if (this._timeoutId) {
          clearTimeout(this._timeoutId);
          this._timeoutId = null;
        }
        const peer = this._peer;
        this._peer = null;
        queueMicrotask(() => {
          if (err) this.emit('error', err);
          this.emit('close', Boolean(err));
          if (peer && !peer.destroyed) {
            if (!peer._endEmitted) {
              peer._endEmitted = true;
              peer.emit('end');
            }
            peer.destroy();
          }
        });
        return this;
      }
    }

    class Server extends EventEmitter {
      constructor(options, connectionListener) {
        super();
        const cb = typeof options === 'function' ? options : connectionListener;
        if (typeof cb === 'function') this.on('connection', cb);
        this.listening = false;
        this._port = null;
        this._host = '127.0.0.1';
        this._connections = new Set();
      }

      listen(...args) {
        let port = 0;
        let host = '127.0.0.1';
        let cb = null;
        for (const arg of args) {
          if (typeof arg === 'number') port = arg;
          else if (typeof arg === 'string') host = arg;
          else if (typeof arg === 'function') cb = arg;
          else if (typeof arg === 'object' && arg !== null) {
            if (typeof arg.port === 'number') port = arg.port;
            if (typeof arg.host === 'string') host = arg.host;
          }
        }
        if (cb) this.once('listening', cb);
        if (!port || port === 0) {
          port = nextPort++;
          while (servers.has(port)) port = nextPort++;
        }
        this._port = port;
        this._host = host;
        this.listening = true;
        servers.set(port, this);
        queueMicrotask(() => {
          if (this.listening) this.emit('listening');
        });
        return this;
      }

      address() {
        if (!this.listening) return null;
        return { port: this._port, family: 'IPv4', address: this._host };
      }

      getConnections(cb) {
        if (typeof cb === 'function') queueMicrotask(() => cb(null, this._connections.size));
        return this;
      }

      close(cb) {
        if (typeof cb === 'function') this.once('close', cb);
        if (this._port !== null) servers.delete(this._port);
        this.listening = false;
        for (const sock of this._connections) {
          sock.destroy();
        }
        this._connections.clear();
        queueMicrotask(() => this.emit('close'));
        return this;
      }

      ref() { return this; }
      unref() { return this; }
    }

    function isIPv4(input) {
      const s = String(input || '');
      const parts = s.split('.');
      if (parts.length !== 4) return false;
      return parts.every((p) => /^(?:0|[1-9]\d*)$/.test(p) && Number(p) >= 0 && Number(p) <= 255);
    }

    function isIPv6(input) {
      const s = String(input || '');
      if (!s.includes(':')) return false;
      return /^[0-9a-fA-F:]+$/.test(s);
    }

    function isIP(input) {
      if (isIPv4(input)) return 4;
      if (isIPv6(input)) return 6;
      return 0;
    }

    function createServer(options, connectionListener) {
      return new Server(options, connectionListener);
    }

    function createConnection(...args) {
      const sock = new Socket();
      return sock.connect(...args);
    }

    function closeAllServers() {
      for (const srv of servers.values()) {
        try { srv.close(); } catch (_) {}
      }
      servers.clear();
    }

    return {
      Socket,
      Server,
      Stream: Socket,
      createServer,
      connect: createConnection,
      createConnection,
      isIP,
      isIPv4,
      isIPv6,
      closeAllServers,
      getTrace: () => [...sharedTrace]
    };
  }

  // =========================================================================
  // 8. FAST TYPESCRIPT & ESM-TO-CJS TRANSPILER
  // =========================================================================
  function transpileTS(source, filename = 'module.ts') {
    const isTS = /\.(ts|tsx|mts|cts)$/i.test(filename)
      || /\b(interface\s+[A-Za-z_$]|type\s+[A-Za-z_$][A-Za-z0-9_$]*\s*(?:<[^>]*>)?\s*=|enum\s+[A-Za-z_$]|abstract\s+class\s+|declare\s+(?:const|let|var|function|class|type|interface)\b|public\s+|private\s+|protected\s+|readonly\s+|satisfies\s+[A-Za-z_${]|\bas\s+(?:const|unknown|any|[A-Za-z_${]))/m.test(source);
    const hasESM = /^\s*(import|export)\s+/m.test(source);
    if (!isTS && !hasESM) return source;

    // Step 1: Mask strings, template literals, regex literals, and comments so transforms never corrupt literals
    const placeholders = [];
    const mask = (str) => {
      const id = `\x00__LIT_${placeholders.length}__\x00`;
      placeholders.push(str);
      return id;
    };

    const canPrecedeRegex = (prefix) => {
      const trimmed = prefix.trimEnd();
      if (!trimmed) return true;
      const lastChar = trimmed[trimmed.length - 1];
      if ('(,=:[!&|?{};+-*/%~^<>'.includes(lastChar)) return true;
      return /\b(?:return|throw|case|in|of|typeof|instanceof|void|delete|await|yield)$/.test(trimmed);
    };

    let code = '';
    let i = 0;
    const len = source.length;
    while (i < len) {
      const ch = source[i];
      const next = source[i + 1];
      // Single-line comment
      if (ch === '/' && next === '/') {
        let end = source.indexOf('\n', i + 2);
        if (end === -1) end = len;
        code += mask(source.slice(i, end));
        i = end;
        continue;
      }
      // Multi-line comment
      if (ch === '/' && next === '*') {
        let end = source.indexOf('*/', i + 2);
        if (end === -1) end = len; else end += 2;
        code += mask(source.slice(i, end));
        i = end;
        continue;
      }
      // Regex literal `/.../flags`
      if (ch === '/' && next !== '/' && next !== '*' && next !== '=' && canPrecedeRegex(code)) {
        let j = i + 1;
        let inCharClass = false;
        let validRegex = false;
        while (j < len) {
          const rc = source[j];
          if (rc === '\n' || rc === '\r') break;
          if (rc === '\\') { j += 2; continue; }
          if (rc === '[') { inCharClass = true; j++; continue; }
          if (rc === ']' && inCharClass) { inCharClass = false; j++; continue; }
          if (rc === '/' && !inCharClass) {
            validRegex = true;
            j++;
            while (j < len && /[dgimsuvy]/.test(source[j])) j++;
            break;
          }
          j++;
        }
        if (validRegex) {
          code += mask(source.slice(i, j));
          i = j;
          continue;
        }
      }
      // Single or double quoted string
      if (ch === "'" || ch === '"') {
        let j = i + 1;
        while (j < len) {
          if (source[j] === '\\') { j += 2; continue; }
          if (source[j] === ch || source[j] === '\n') { j++; break; }
          j++;
        }
        code += mask(source.slice(i, j));
        i = j;
        continue;
      }
      // Template literal
      if (ch === '`') {
        let j = i + 1;
        let depth = 0;
        while (j < len) {
          if (source[j] === '\\') { j += 2; continue; }
          if (source[j] === '$' && source[j + 1] === '{') { depth++; j += 2; continue; }
          if (source[j] === '}' && depth > 0) { depth--; j++; continue; }
          if (source[j] === '`' && depth === 0) { j++; break; }
          j++;
        }
        code += mask(source.slice(i, j));
        i = j;
        continue;
      }
      code += ch;
      i++;
    }

    // Helper: split string on top-level delimiter (ignoring nested <>, (), {}, [])
    const splitTopLevel = (str, sep = ',') => {
      const parts = [];
      let cur = '';
      let angle = 0, paren = 0, brace = 0, bracket = 0;
      for (let idx = 0; idx < str.length; idx++) {
        const c = str[idx];
        if (c === '<') angle++;
        else if (c === '>' && angle > 0) angle--;
        else if (c === '(') paren++;
        else if (c === ')' && paren > 0) paren--;
        else if (c === '{') brace++;
        else if (c === '}' && brace > 0) brace--;
        else if (c === '[') bracket++;
        else if (c === ']' && bracket > 0) bracket--;
        if (c === sep && angle === 0 && paren === 0 && brace === 0 && bracket === 0) {
          parts.push(cur);
          cur = '';
        } else {
          cur += c;
        }
      }
      parts.push(cur);
      return parts;
    };

    // Helper: strip `: Type` from a single parameter declaration (keeping default `= ...`)
    const cleanSingleParam = (rawParam) => {
      const leadWS = (rawParam.match(/^\s*/) || [''])[0];
      let trimmed = rawParam.trim();
      if (!trimmed) return rawParam;
      let colonIdx = -1;
      let eqIdx = -1;
      let angle = 0, paren = 0, brace = 0, bracket = 0;
      for (let idx = 0; idx < trimmed.length; idx++) {
        const c = trimmed[idx];
        if (c === '=' && trimmed[idx + 1] === '>') { idx++; continue; }
        if (c === '<') angle++;
        else if (c === '>' && angle > 0) angle--;
        else if (c === '(') paren++;
        else if (c === ')' && paren > 0) paren--;
        else if (c === '{') brace++;
        else if (c === '}' && brace > 0) brace--;
        else if (c === '[') bracket++;
        else if (c === ']' && bracket > 0) bracket--;
        else if (c === ':' && angle === 0 && paren === 0 && brace === 0 && bracket === 0 && colonIdx === -1 && eqIdx === -1) {
          colonIdx = idx;
        } else if (c === '=' && angle === 0 && paren === 0 && brace === 0 && bracket === 0 && eqIdx === -1) {
          eqIdx = idx;
          break;
        }
      }
      if (colonIdx === -1) return rawParam;
      let lhs = trimmed.slice(0, colonIdx).trimEnd();
      if (lhs.endsWith('?')) lhs = lhs.slice(0, -1).trimEnd();
      const defPart = eqIdx !== -1 ? ' = ' + trimmed.slice(eqIdx + 1).trim() : '';
      return leadWS + lhs + defPart;
    };

    if (isTS) {
      // Remove `declare ...` statements
      code = code.replace(/^\s*(?:export\s+)?declare\s+(?:const|let|var|function|class|type|interface)\s+[^;{}\n]+(?:;|\{[^}]*\})?/gm, '');

      // Remove `export interface ... { ... }` and `interface ... { ... }` with balanced braces
      const stripBracedBlock = (input, headerRe) => {
        let result = input;
        let match;
        headerRe.lastIndex = 0;
        while ((match = headerRe.exec(result)) !== null) {
          const start = match.index;
          const braceIdx = start + match[0].length - 1;
          let depth = 1;
          let k = braceIdx + 1;
          while (k < result.length && depth > 0) {
            if (result[k] === '{') depth++;
            else if (result[k] === '}') depth--;
            k++;
          }
          result = result.slice(0, start) + result.slice(k);
          headerRe.lastIndex = start;
        }
        return result;
      };

      code = stripBracedBlock(code, /\b(?:export\s+)?interface\s+[A-Za-z_$][A-Za-z0-9_$]*(?:\s*<[^{]*>)?(?:\s+extends\s+[^{]+)?\s*\{/g);

      // Transform `enum Name { A, B = 1, C = 'c' }` into runtime IIFE (stripping any masked comments inside enum body)
      code = code.replace(/\b(export\s+)?(?:const\s+)?enum\s+([A-Za-z_$][A-Za-z0-9_$]*)\s*\{([^}]*)\}/g, (_, isExp, name, body) => {
        const cleanBody = body.replace(/\x00__LIT_(\d+)__\x00/g, (m, id) => {
          const lit = placeholders[Number(id)] || '';
          return (lit.startsWith('//') || lit.startsWith('/*')) ? '' : m;
        });
        const items = splitTopLevel(cleanBody, ',').map((s) => s.trim()).filter(Boolean);
        let autoVal = 0;
        const assigns = [];
        for (const item of items) {
          const eqIdx = item.indexOf('=');
          if (eqIdx !== -1) {
            const k = item.slice(0, eqIdx).trim();
            const v = item.slice(eqIdx + 1).trim();
            const num = Number(v);
            if (!Number.isNaN(num) && v !== '') {
              assigns.push(`${name}[${name}[${JSON.stringify(k)}] = ${num}] = ${JSON.stringify(k)};`);
              autoVal = num + 1;
            } else {
              assigns.push(`${name}[${JSON.stringify(k)}] = ${v};`);
            }
          } else {
            assigns.push(`${name}[${name}[${JSON.stringify(item)}] = ${autoVal++}] = ${JSON.stringify(item)};`);
          }
        }
        return `${isExp ? 'export ' : ''}const ${name} = {}; (function(${name}){ ${assigns.join(' ')} })(${name});`;
      });

      // Remove `export type { ... } from ...` or `export type { ... }` (single or multi-line)
      code = code.replace(/^\s*export\s+type\s*\{[\s\S]*?\}(?:\s*from\s*[^\n;]+)?;?/gm, '');

      // Remove `type Foo<...> = ...;` (including multi-line object type aliases)
      code = stripBracedBlock(code, /^\s*(?:export\s+)?type\s+[A-Za-z_$][A-Za-z0-9_$]*(?:\s*<[^>]*>)?\s*=\s*\{/gm);
      code = code.replace(/^\s*(?:export\s+)?type\s+[A-Za-z_$][A-Za-z0-9_$]*(?:\s*<[^>]*>)?\s*=\s*[^;]+;?/gm, '');

      // Remove `import type ...` (including multi-line `import type { ... } from ...`)
      code = code.replace(/^\s*import\s+type\s*\{[\s\S]*?\}\s*from\s*[^\n;]+;?/gm, '');
      code = code.replace(/^\s*import\s+type\s+[^;\n]+;?/gm, '');

      // Convert `abstract class` -> `class`
      code = code.replace(/\b(export\s+(?:default\s+)?)?abstract\s+class\b/g, '$1class');

      // Remove abstract methods: `abstract foo(...): ...;`
      code = code.replace(/^[ \t]*(?:(?:public|private|protected)\s+)?abstract\s+[A-Za-z_$][A-Za-z0-9_$]*\s*(?:<[^>]*>)?\s*\([^)]*\)\s*(?::\s*[^;\n]+)?;/gm, '');

      // Remove generic type parameters on classes & functions (supporting nested `<T extends Record<string, any>>`)
      const stripGenericDeclParams = (input) => {
        let out = input;
        const re = /(\b(?:class|function)\s+[A-Za-z_$][A-Za-z0-9_$]*)\s*</g;
        let m;
        while ((m = re.exec(out)) !== null) {
          const angleStart = m.index + m[0].length - 1;
          let depth = 1;
          let k = angleStart + 1;
          while (k < out.length && depth > 0) {
            if (out[k] === '<') depth++;
            else if (out[k] === '>') depth--;
            k++;
          }
          if (depth === 0) {
            out = out.slice(0, angleStart) + out.slice(k);
            re.lastIndex = m.index + m[1].length;
          }
        }
        return out;
      };
      code = stripGenericDeclParams(code);

      // Strip generic type parameters on arrow functions: `= <T extends ...>(...)` or `= async <T>(...)`
      const stripArrowGenerics = (input) => {
        let out = input;
        const re = /(=\s*(?:async\s+)?|[\s(,]async\s+|\(\s*)</g;
        let m;
        while ((m = re.exec(out)) !== null) {
          const angleStart = m.index + m[0].length - 1;
          let depth = 1;
          let k = angleStart + 1;
          while (k < out.length && depth > 0) {
            if (out[k] === '<') depth++;
            else if (out[k] === '>') depth--;
            k++;
          }
          if (depth === 0) {
            const after = out.slice(k).trimStart();
            if (after.startsWith('(')) {
              out = out.slice(0, angleStart) + out.slice(k);
              re.lastIndex = m.index + m[1].length;
            }
          }
        }
        return out;
      };
      code = stripArrowGenerics(code);

      // Remove `implements ...` on classes and generic type args on `extends Foo<T>`
      code = code.replace(/(\bclass\s+[A-Za-z_$][A-Za-z0-9_$]*(?:\s+extends\s+[A-Za-z0-9_$.<>]+)?)\s+implements\s+[^{]+(\{)/g, '$1 $2');
      let prevExt;
      do {
        prevExt = code;
        code = code.replace(/(\bextends\s+[A-Za-z_$][A-Za-z0-9_$.]*)\s*<[^<>]*>/g, '$1');
      } while (code !== prevExt);

      // Handle constructor parameter properties (supporting derived classes with `super(...)` and `override` modifier)
      const transformConstructors = (input) => {
        let result = input;
        const ctorRe = /\bconstructor\s*\(([\s\S]*?)\)\s*\{/g;
        let match;
        while ((match = ctorRe.exec(result)) !== null) {
          const fullMatch = match[0];
          const params = match[1];
          const startIdx = match.index;
          const openBraceIdx = startIdx + fullMatch.length - 1;

          const propInits = [];
          const parts = splitTopLevel(params, ',');
          const cleanParams = parts.map((p) => {
            let trimmed = p.trim();
            if (!trimmed) return '';
            const modMatch = /^(?:(public|private|protected|readonly|override)\s+)+([A-Za-z_$][A-Za-z0-9_$]*)/.exec(trimmed);
            if (modMatch) {
              const propName = modMatch[2];
              propInits.push(`this.${propName} = ${propName};`);
              trimmed = trimmed.replace(/^(?:(?:public|private|protected|readonly|override)\s+)+/, '');
            }
            return cleanSingleParam(trimmed).trim();
          }).filter(Boolean).join(', ');

          // Find end of constructor body to see if `super(...)` is called
          let depth = 1;
          let k = openBraceIdx + 1;
          while (k < result.length && depth > 0) {
            if (result[k] === '{') depth++;
            else if (result[k] === '}') depth--;
            k++;
          }
          const bodySlice = result.slice(openBraceIdx + 1, k - 1);
          const initCode = propInits.join(' ');
          let newBodySlice = bodySlice;

          if (propInits.length > 0) {
            const superMatch = /\bsuper\s*\(/.exec(bodySlice);
            if (superMatch) {
              let pDepth = 1;
              let sIdx = superMatch.index + superMatch[0].length;
              while (sIdx < bodySlice.length && pDepth > 0) {
                if (bodySlice[sIdx] === '(') pDepth++;
                else if (bodySlice[sIdx] === ')') pDepth--;
                sIdx++;
              }
              if (bodySlice[sIdx] === ';') sIdx++;
              newBodySlice = bodySlice.slice(0, sIdx) + '; ' + initCode + bodySlice.slice(sIdx);
            } else {
              newBodySlice = ' ' + initCode + bodySlice;
            }
          }

          const replacement = `constructor(${cleanParams}) {${newBodySlice}}`;
          result = result.slice(0, startIdx) + replacement + result.slice(k);
          ctorRe.lastIndex = startIdx + replacement.length;
        }
        return result;
      };
      code = transformConstructors(code);

      // Remove uninitialized class field declarations like `  private count: number;`
      code = code.replace(/^[ \t]*(?:(?:public|private|protected|readonly|override|abstract)\s+)*[A-Za-z_$][A-Za-z0-9_$]*[?!]?\s*:\s*[^=;\n{}]+;[ \t]*$/gm, '');

      // Strip access modifiers on initialized class fields or methods (including `get`/`set`/`async`/`static`)
      code = code.replace(/^[ \t]*(?:(?:public|private|protected|readonly|override|abstract)\s+)+(?=(?:static\s+|async\s+|get\s+|set\s+)?[A-Za-z_$])/gm, '  ');
      code = code.replace(/^[ \t]*static\s+(?:(?:public|private|protected|readonly|override)\s+)+(?=[A-Za-z_$])/gm, '  static ');

      // Strip type annotations on initialized class fields (including nested `{ a: string; b: number }` inside generics)
      code = code.replace(/^([ \t]*(?:static\s+)?[A-Za-z_$][A-Za-z0-9_$]*)[?!]?\s*:\s*(?:[^=\n<>()]|<[^=\n]*>)+=(?!>)\s*/gm, '$1 = ');

      // Strip non-null assertions `expr!` BEFORE generic call stripping so `fn!<T>()` works cleanly
      let prevCode;
      do {
        prevCode = code;
        code = code.replace(/([A-Za-z0-9_$)\]\x00])!(?!=)/g, '$1');
      } while (code !== prevCode);

      // Strip generic type arguments on `new Foo<Bar<Baz>>(...)` or `fn<Bar>(...)` or `method<{ a: number }>(...)`
      do {
        prevCode = code;
        code = code.replace(/(\b[A-Za-z_$][A-Za-z0-9_$.]*)\s*<[^<>()\n]+>\s*\(/g, (full, ident) => {
          if (['if', 'for', 'while', 'switch', 'return', 'typeof', 'instanceof'].includes(ident)) return full;
          return `${ident}(`;
        });
      } while (code !== prevCode);

      // Strip generic type parameters on class methods: `  async find<T extends U>(...)` -> `  async find(...)`
      do {
        prevCode = code;
        code = code.replace(/^([ \t]*(?:static\s+)?(?:async\s+)?[A-Za-z_$][A-Za-z0-9_$]*)\s*<[^<>()\n]+>\s*\(/gm, '$1(');
      } while (code !== prevCode);

      // Strip return type annotations on functions/methods/arrow functions: `): ReturnType {` or `): ReturnType =>`
      const stripReturnTypes = (input) => {
        let out = '';
        let idx = 0;
        while (idx < input.length) {
          const closeParen = input.indexOf(')', idx);
          if (closeParen === -1) {
            out += input.slice(idx);
            break;
          }
          out += input.slice(idx, closeParen + 1);
          let k = closeParen + 1;
          while (k < input.length && (input[k] === ' ' || input[k] === '\t' || input[k] === '\n' || input[k] === '\r')) k++;
          if (input[k] !== ':') {
            idx = closeParen + 1;
            continue;
          }
          let t = k + 1;
          let angle = 0, paren = 0, brace = 0, bracket = 0;
          let foundBodyStart = -1;
          while (t < input.length) {
            const c = input[t];
            const nxt = input[t + 1];
            if (angle === 0 && paren === 0 && brace === 0 && bracket === 0) {
              if (c === '=' && nxt === '>') {
                foundBodyStart = t;
                break;
              }
              if (c === '{') {
                let bDepth = 1;
                let u = t + 1;
                while (u < input.length && bDepth > 0) {
                  if (input[u] === '{') bDepth++;
                  else if (input[u] === '}') bDepth--;
                  u++;
                }
                const afterBrace = input.slice(u).trimStart();
                if (afterBrace.startsWith('{') || afterBrace.startsWith('=>') || afterBrace.startsWith('|') || afterBrace.startsWith('&') || afterBrace.startsWith('[')) {
                  t = u;
                  continue;
                }
                foundBodyStart = t;
                break;
              }
              if (c === ';' || c === ',') break;
            }
            if (c === '=' && nxt === '>') { t += 2; continue; }
            if (c === '<') angle++;
            else if (c === '>' && angle > 0) angle--;
            else if (c === '(') paren++;
            else if (c === ')' && paren > 0) {
              paren--;
              if (paren === 0 && angle === 0 && brace === 0 && bracket === 0) {
                let pNext = t + 1;
                while (pNext < input.length && (input[pNext] === ' ' || input[pNext] === '\t')) pNext++;
                if (input[pNext] === '=' && input[pNext + 1] === '>') {
                  t = pNext + 2;
                  continue;
                }
              }
            }
            else if (c === '[') bracket++;
            else if (c === ']' && bracket > 0) bracket--;
            else if (c === '{') brace++;
            else if (c === '}') {
              if (brace > 0) brace--;
              else break;
            }
            t++;
          }
          if (foundBodyStart !== -1) {
            const typeSegment = input.slice(k + 1, foundBodyStart).trim();
            if (typeSegment.length > 0 && !/^[0-9]/.test(typeSegment)) {
              out += ' ';
              idx = foundBodyStart;
              continue;
            }
          }
          idx = closeParen + 1;
        }
        return out;
      };
      code = stripReturnTypes(code);

      // Strip parameter type annotations inside `(...)` (supports multi-line parameter lists and default value `()` calls)
      code = code.replace(/\(((?:[^()]|\([^()]*\))*)\)/g, (full, inner) => {
        if (!inner.includes(':')) return full;
        if (inner.includes('?') && !/[A-Za-z0-9_$}\]]\s*\?\s*:/.test(inner)) return full;
        if (/[{}]/.test(inner) && !/\}\s*\??\s*:/.test(inner) && !/:\s*[A-Za-z_$][A-Za-z0-9_$.<>[\]|&\s]*\{/.test(inner)) {
          const partsCheck = splitTopLevel(inner, ',');
          const looksLikeTypedParams = partsCheck.every((p) => {
            const s = p.trim();
            return !s || /^(?:\.\.\.)?[A-Za-z_$][A-Za-z0-9_$]*\s*\??\s*:/.test(s) || /^\{[\s\S]*\}\s*\??\s*:/.test(s);
          });
          if (!looksLikeTypedParams) return full;
        }
        const parts = splitTopLevel(inner, ',');
        const cleaned = parts.map((part) => cleanSingleParam(part));
        return `(${cleaned.join(',')})`;
      });

      // Strip variable type annotations: `const x: Type =`, `let y: Type =`
      code = code.replace(/\b(const|let|var)\s+([A-Za-z_$][A-Za-z0-9_$]*)\s*:\s*[^=;\n]+=(?!>)/g, '$1 $2 =');

      // Strip `as Type` and `satisfies Type` assertions (supporting object types `{ a: number }`, tuples `[number, string]`, generics, unions)
      const stripAsAndSatisfies = (input) => {
        let result = input;
        const kwRe = /(\S)[ \t]+(?:as|satisfies)[ \t]+/g;
        let match;
        while ((match = kwRe.exec(result)) !== null) {
          const prevChar = match[1];
          // Avoid matching `import * as foo` or `export { a as b }`
          const beforeSlice = result.slice(Math.max(0, match.index - 30), match.index + 1);
          if (/\b(?:import|export)\b[^;\n]*$/.test(beforeSlice)) continue;
          if (!/[A-Za-z0-9_$)\]}`"'\x00]/.test(prevChar)) continue;

          const typeStart = match.index + match[0].length;
          let k = typeStart;
          let angle = 0, brace = 0, bracket = 0, paren = 0;
          let consumedAny = false;

          while (k < result.length) {
            const ch = result[k];
            if (ch === '<') { angle++; consumedAny = true; k++; continue; }
            if (ch === '>' && angle > 0) { angle--; k++; continue; }
            if (ch === '{') { brace++; consumedAny = true; k++; continue; }
            if (ch === '}' && brace > 0) { brace--; k++; continue; }
            if (ch === '[') { bracket++; consumedAny = true; k++; continue; }
            if (ch === ']' && bracket > 0) { bracket--; k++; continue; }
            if (ch === '(') {
              if (!consumedAny) { paren++; consumedAny = true; k++; continue; }
              if (angle > 0 || brace > 0 || bracket > 0 || paren > 0) { paren++; k++; continue; }
              break;
            }
            if (ch === ')' && paren > 0) { paren--; k++; continue; }

            if (angle === 0 && brace === 0 && bracket === 0 && paren === 0) {
              if (ch === ';' || ch === ',' || ch === ')' || ch === ']' || ch === '}' || ch === '?' || ch === ':' || ch === '=') {
                break;
              }
              if (ch === '\n' || ch === '\r') {
                const restTrim = result.slice(k).trimStart();
                if (restTrim.startsWith('|') || restTrim.startsWith('&')) {
                  k++;
                  continue;
                }
                break;
              }
              if (ch === ' ' || ch === '\t') {
                const afterWS = result.slice(k).trimStart();
                if (/^(?:as|satisfies)\b/.test(afterWS) || /^[|&]/.test(afterWS) || /^readonly\b/.test(sequenceAt(result, typeStart, k))) {
                  k++;
                  continue;
                }
                if (consumedAny) break;
              }
              if (/[A-Za-z0-9_$.|&\x00]/.test(ch)) {
                consumedAny = true;
                k++;
                continue;
              }
              break;
            }
            k++;
          }

          if (consumedAny && k > typeStart) {
            result = result.slice(0, match.index + 1) + result.slice(k);
            kwRe.lastIndex = match.index;
          }
        }
        return result;
      };
      function sequenceAt(str, start, end) {
        return str.slice(start, end).trim();
      }
      code = stripAsAndSatisfies(code);

      // Second pass for non-null assertions `expr!` after generic call stripping (`fn<T>()!.prop`)
      do {
        prevCode = code;
        code = code.replace(/([A-Za-z0-9_$)\]\x00])!(?!=)/g, '$1');
      } while (code !== prevCode);
    }

    if (hasESM || isTS) {
      // Convert ES module imports (including multi-line `{ ... }`)
      code = code.replace(/^\s*import\s+\*\s+as\s+([A-Za-z_$][A-Za-z0-9_$]*)\s+from\s+([^\n;]+);?/gm, 'const $1 = require($2);');
      code = code.replace(/^\s*import\s+([A-Za-z_$][A-Za-z0-9_$]*)\s*,\s*\{([\s\S]*?)\}\s+from\s+([^\n;]+);?/gm, (_, defId, specifiers, mod) => {
        const cleaned = specifiers
          .split(',')
          .map((s) => s.trim())
          .filter((s) => s && !/^type\s+/.test(s))
          .map((s) => s.replace(/\s+as\s+/g, ': '))
          .join(', ');
        const mTrim = mod.trim();
        return `const ${defId} = (function(m){ return m && m.__esModule ? m.default : m; })(require(${mTrim}));` +
          (cleaned ? ` const { ${cleaned} } = require(${mTrim});` : '');
      });
      code = code.replace(/^\s*import\s+\{([\s\S]*?)\}\s+from\s+([^\n;]+);?/gm, (_, specifiers, mod) => {
        const cleaned = specifiers
          .split(',')
          .map((s) => s.trim())
          .filter((s) => s && !/^type\s+/.test(s))
          .map((s) => s.replace(/\s+as\s+/g, ': '))
          .join(', ');
        return cleaned ? `const { ${cleaned} } = require(${mod.trim()});` : '';
      });
      code = code.replace(/^\s*import\s+([A-Za-z_$][A-Za-z0-9_$]*)\s+from\s+([^\n;]+);?/gm, 'const $1 = (function(m){ return m && m.__esModule ? m.default : m; })(require($2));');
      code = code.replace(/^\s*import\s+(\x00__LIT_\d+__\x00)\s*;?/gm, 'require($1);');

      // Convert ES module exports
      const exportedNames = [];
      let defaultExportName = null;
      let hasEsmExport = false;

      code = code.replace(/^\s*export\s+\*\s+as\s+([A-Za-z_$][A-Za-z0-9_$]*)\s+from\s+([^\n;]+);?/gm, (_, ns, mod) => {
        hasEsmExport = true;
        return `exports.${ns} = require(${mod.trim()});`;
      });
      code = code.replace(/^\s*export\s+\*\s+from\s+([^\n;]+);?/gm, (_, mod) => {
        hasEsmExport = true;
        return `Object.assign(exports, require(${mod.trim()}));`;
      });
      code = code.replace(/^\s*export\s+default\s+(async\s+function|function|class)\s+([A-Za-z_$][A-Za-z0-9_$]*)/gm, (_, kw, name) => {
        hasEsmExport = true;
        defaultExportName = name;
        return `${kw} ${name}`;
      });
      code = code.replace(/^\s*export\s+default\s+/gm, () => {
        hasEsmExport = true;
        return 'exports.default = ';
      });
      code = code.replace(/^\s*export\s+(async\s+function|function|class)\s+([A-Za-z_$][A-Za-z0-9_$]*)/gm, (_, kw, name) => {
        hasEsmExport = true;
        exportedNames.push(name);
        return `${kw} ${name}`;
      });
      code = code.replace(/^\s*export\s+(const|let|var)\s+([A-Za-z_$][A-Za-z0-9_$]*)/gm, (_, kw, name) => {
        hasEsmExport = true;
        exportedNames.push(name);
        return `${kw} ${name}`;
      });
      code = code.replace(/^\s*export\s+\{([^}]+)\}\s+from\s+([^\n;]+);?/gm, (_, list, mod) => {
        hasEsmExport = true;
        const mTrim = mod.trim();
        return list.split(',').map((item) => {
          const cleanItem = item.trim().replace(/^type\s+/, '');
          if (!cleanItem) return '';
          const parts = cleanItem.split(/\s+as\s+/);
          const local = parts[0].trim();
          const exported = (parts[1] || parts[0]).trim();
          return `exports.${exported} = require(${mTrim}).${local};`;
        }).join(' ');
      });
      code = code.replace(/^\s*export\s+\{([^}]+)\}\s*;?/gm, (_, list) => {
        hasEsmExport = true;
        return list.split(',').map((item) => {
          const trimmed = item.trim();
          if (!trimmed || /^type\s+/.test(trimmed)) return '';
          const parts = trimmed.split(/\s+as\s+/);
          if (!parts[0]) return '';
          const local = parts[0].trim();
          const exported = (parts[1] || parts[0]).trim();
          return `exports.${exported} = ${local};`;
        }).join(' ');
      });
      if (defaultExportName) {
        code += `\nexports.default = ${defaultExportName};`;
      }
      if (exportedNames.length > 0) {
        code += '\n' + exportedNames.map((n) => `exports.${n} = ${n};`).join('\n');
      }
      if (hasEsmExport) {
        code += '\nObject.defineProperty(exports, "__esModule", { value: true, enumerable: false, configurable: true });\n' +
          'if (Object.prototype.hasOwnProperty.call(exports, "default") && module.exports === exports) {\n' +
          '  if ((typeof exports.default === "object" && exports.default !== null) || typeof exports.default === "function") {\n' +
          '    module.exports = Object.assign(exports.default, exports);\n' +
          '    Object.defineProperty(module.exports, "__esModule", { value: true, enumerable: false, configurable: true });\n' +
          '  } else if (Object.keys(exports).every((k) => k === "default")) {\n' +
          '    module.exports = exports.default;\n' +
          '  }\n' +
          '}';
      }
    }

    // Restore masked literals
    code = code.replace(/\x00__LIT_(\d+)__\x00/g, (_, idx) => placeholders[Number(idx)]);
    return code;
  }

  // =========================================================================
  // 9. TEST HARNESS INSTRUMENTATION
  // =========================================================================
  function instrumentTestCode(code) {
    let out = code;
    // Pattern 1: `const test = (name, fn) => tests.push({ name, fn });`
    out = out.replace(
      /const\s+test\s*=\s*\(\s*name\s*,\s*fn\s*\)\s*=>\s*tests\.push\(\s*\{\s*name\s*,\s*fn\s*\}\s*\)\s*;/g,
      'const test = (name, fn) => { if (typeof __shouldSkipTest === "function" && __shouldSkipTest(name)) return; fn = typeof __wrapTestFn === "function" ? __wrapTestFn(name, fn) : fn; return tests.push({ name, fn }); };'
    );
    // Pattern 2: `function test(name, fn) {`
    out = out.replace(
      /function\s+test\s*\(\s*name\s*,\s*fn\s*\)\s*\{/g,
      'function test(name, fn) { if (typeof __shouldSkipTest === "function" && __shouldSkipTest(name)) return; fn = typeof __wrapTestFn === "function" ? __wrapTestFn(name, fn) : fn;'
    );
    return out;
  }

  // =========================================================================
  // 10. VIRTUAL RUNTIME EXECUTION ENGINE (`executeInVirtualRuntime`)
  // =========================================================================
  class ProcessExitSignal extends Error {
    constructor(code) {
      super(`process.exit(${code})`);
      this.name = 'ProcessExitSignal';
      this.exitCode = code;
      this._isProcessExit = true;
    }
  }

  const _npmPackageCache = new Map();

  async function preloadNpmPackages(files = {}, existingCache = _npmPackageCache) {
    const specs = new Set();
    const builtinSet = new Set([
      'fs', 'fs/promises', 'path', 'os', 'crypto', 'zlib', 'http', 'https', 'net',
      'dns', 'dns/promises', 'string_decoder', 'child_process', 'process',
      'assert', 'assert/strict', 'events', 'util', 'url', 'querystring',
      'stream', 'stream/promises', 'test', 'perf_hooks', 'timers', 'timers/promises', 'buffer'
    ]);

    function addSpec(raw) {
      if (!raw || typeof raw !== 'string') return;
      const s = raw.trim();
      if (!s || s.startsWith('.') || s.startsWith('/') || s.startsWith('node:')) return;
      const parts = s.split('/');
      const pkgName = s.startsWith('@') ? parts.slice(0, 2).join('/') : parts[0];
      if (builtinSet.has(pkgName) || builtinSet.has(s)) return;
      specs.add(pkgName);
    }

    for (const [filePath, content] of Object.entries(files || {})) {
      if (typeof content !== 'string') continue;
      if (filePath.endsWith('package.json')) {
        try {
          const pkgJson = JSON.parse(content);
          for (const dep of Object.keys(pkgJson.dependencies || {})) addSpec(dep);
        } catch (_) {}
        continue;
      }
      const reqRe = /\brequire\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
      const impRe = /\bfrom\s+['"]([^'"]+)['"]/g;
      let m;
      while ((m = reqRe.exec(content)) !== null) addSpec(m[1]);
      while ((m = impRe.exec(content)) !== null) addSpec(m[1]);
    }

    const loaded = {};
    for (const pkg of specs) {
      const nmKey = `node_modules/${pkg}/index.js`;
      if (files[nmKey] || files[`/workspace/${nmKey}`]) continue;
      if (existingCache && existingCache.has(pkg)) {
        loaded[pkg] = existingCache.get(pkg);
        continue;
      }
      if (typeof fetch === 'function') {
        try {
          const res = await fetch(`https://cdn.jsdelivr.net/npm/${pkg}`);
          if (res && res.ok) {
            const text = await res.text();
            if (existingCache) existingCache.set(pkg, text);
            loaded[pkg] = text;
          }
        } catch (_) {}
      }
    }
    return loaded;
  }

  async function executeInVirtualRuntime(options = {}) {
    const {
      files = {},
      packages = {},
      npmModules = {},
      entry = 'demo.js',
      mode = 'run', // 'run' | 'test' | 'repl'
      replCode = '',
      testFilter = null,
      timeoutMs = 30000,
      maxOutputBytes = 262144, // 256 KB default output cap
      maxConsoleCalls = 5000,
      onStdout = null,
      onStderr = null,
      onTestResult = null
    } = options;

    const startTime = performance.now();
    const stdoutChunks = [];
    const stderrChunks = [];
    const testResults = [];
    let totalOutputBytes = 0;
    let consoleCallsCount = 0;
    let outputTruncated = false;
    let testIndex = 0;
    let exitCode = 0;
    let hasExited = false;

    const resourceTracker = {
      activeTimers: new Set(),
      allTimers: new Set(),
      activeImmediates: new Set(),
      inFlightHttp: new Set(),
      pendingTests: new Set()
    };

    function formatConsoleArg(arg) {
      if (typeof arg === 'string') return arg;
      if (arg instanceof Error) return arg.stack || `${arg.name}: ${arg.message}`;
      if (VirtualBuffer.isBuffer(arg)) return `<Buffer ${arg.toString('hex').slice(0, 64)}>`;
      if (typeof arg === 'object' && arg !== null) {
        try {
          return JSON.stringify(arg);
        } catch (_) {
          return utilInspect(arg);
        }
      }
      return String(arg);
    }

    const TRUNCATION_NOTICE = '\n[Output truncated: exceeded 256 KB limit]\n';

    function triggerTruncation(targetChunks, cb) {
      if (outputTruncated) return;
      outputTruncated = true;
      targetChunks.push(TRUNCATION_NOTICE);
      if (typeof cb === 'function') cb(TRUNCATION_NOTICE);
    }

    function emitStdout(text) {
      if (outputTruncated) return;
      const s = String(text);
      if (totalOutputBytes + s.length > maxOutputBytes) {
        const remaining = Math.max(0, maxOutputBytes - totalOutputBytes);
        if (remaining > 0) {
          const slice = s.slice(0, remaining);
          stdoutChunks.push(slice);
          totalOutputBytes += slice.length;
          if (typeof onStdout === 'function') onStdout(slice);
        }
        triggerTruncation(stdoutChunks, onStdout);
        return;
      }
      totalOutputBytes += s.length;
      stdoutChunks.push(s);
      if (typeof onStdout === 'function') onStdout(s);
    }

    function emitStderr(text) {
      if (outputTruncated) return;
      const s = String(text);
      if (totalOutputBytes + s.length > maxOutputBytes) {
        const remaining = Math.max(0, maxOutputBytes - totalOutputBytes);
        if (remaining > 0) {
          const slice = s.slice(0, remaining);
          stderrChunks.push(slice);
          totalOutputBytes += slice.length;
          if (typeof onStderr === 'function') onStderr(slice);
        }
        triggerTruncation(stderrChunks, onStderr);
        return;
      }
      totalOutputBytes += s.length;
      stderrChunks.push(s);
      if (typeof onStderr === 'function') onStderr(s);
    }

    function serializeError(err) {
      if (!err) return null;
      return {
        name: err.name || 'Error',
        message: err.message || String(err),
        stack: err.stack || String(err),
        actual: err.actual !== undefined ? formatValue(err.actual) : undefined,
        expected: err.expected !== undefined ? formatValue(err.expected) : undefined,
        operator: err.operator
      };
    }

    function shouldSkipTest(name) {
      if (!testFilter) return false;
      if (typeof testFilter === 'string') {
        return !name.toLowerCase().includes(testFilter.toLowerCase());
      }
      if (Array.isArray(testFilter) && testFilter.length > 0) {
        return !testFilter.includes(name);
      }
      return false;
    }

    function wrapTestFn(name, origFn) {
      return function wrappedTestFn(...args) {
        const idx = ++testIndex;
        const t0 = performance.now();
        let res;
        try {
          res = origFn.apply(this, args);
        } catch (err) {
          if (err && err._isProcessExit) throw err;
          const durationMs = Math.max(0, performance.now() - t0);
          const item = { index: idx, name, status: 'fail', passed: false, durationMs, error: serializeError(err) };
          testResults.push(item);
          if (typeof onTestResult === 'function') onTestResult(item);
          throw err;
        }
        if (res && typeof res.then === 'function') {
          const tracked = res.then(
            (val) => {
              resourceTracker.pendingTests.delete(tracked);
              const durationMs = Math.max(0, performance.now() - t0);
              const item = { index: idx, name, status: 'pass', passed: true, durationMs, error: null };
              testResults.push(item);
              if (typeof onTestResult === 'function') onTestResult(item);
              return val;
            },
            (err) => {
              resourceTracker.pendingTests.delete(tracked);
              if (err && err._isProcessExit) throw err;
              const durationMs = Math.max(0, performance.now() - t0);
              const item = { index: idx, name, status: 'fail', passed: false, durationMs, error: serializeError(err) };
              testResults.push(item);
              if (typeof onTestResult === 'function') onTestResult(item);
              throw err;
            }
          );
          tracked.catch(() => {});
          resourceTracker.pendingTests.add(tracked);
          return tracked;
        }
        const durationMs = Math.max(0, performance.now() - t0);
        const item = { index: idx, name, status: 'pass', passed: true, durationMs, error: null };
        testResults.push(item);
        if (typeof onTestResult === 'function') onTestResult(item);
        return res;
      };
    }

    const vfs = createVirtualFs(files);
    const vhttp = createVirtualHttp(resourceTracker);
    const vnet = createVirtualNet(resourceTracker, vhttp.getTrace());

    const injectedPackages = new Map();
    const combinedPackages = Object.assign(
      {},
      Object.fromEntries(_npmPackageCache.entries()),
      npmModules || {},
      packages || {}
    );
    for (const [pkgName, pkgVal] of Object.entries(combinedPackages)) {
      if (typeof pkgVal === 'string') {
        const targetPath = `/workspace/node_modules/${pkgName}/index.js`;
        if (!vfs.existsSync(targetPath)) {
          vfs.mkdirSync(VirtualPath.dirname(targetPath), { recursive: true });
          vfs.writeFileSync(targetPath, pkgVal);
        }
      } else if (pkgVal !== undefined && pkgVal !== null) {
        injectedPackages.set(pkgName, pkgVal);
      }
    }

    // Custom timer wrappers supporting .unref() / .ref() and active handle tracking
    function makeTimerHandle(rawId, isInterval) {
      const handle = {
        _id: rawId,
        _isInterval: isInterval,
        _ref: true,
        unref() {
          this._ref = false;
          resourceTracker.activeTimers.delete(rawId);
          return this;
        },
        ref() {
          this._ref = true;
          resourceTracker.activeTimers.add(rawId);
          return this;
        },
        hasRef() {
          return this._ref;
        },
        [Symbol.toPrimitive]() {
          return rawId;
        }
      };
      return handle;
    }

    function sandboxSetTimeout(fn, delay = 0, ...args) {
      const rawId = setTimeout(() => {
        resourceTracker.activeTimers.delete(rawId);
        resourceTracker.allTimers.delete(rawId);
        if (hasExited) return;
        try {
          fn(...args);
        } catch (err) {
          if (err && err._isProcessExit) {
            exitCode = err.exitCode;
            hasExited = true;
          } else {
            emitStderr((err && err.stack ? err.stack : String(err)) + '\n');
            exitCode = 1;
          }
        }
      }, delay);
      resourceTracker.activeTimers.add(rawId);
      resourceTracker.allTimers.add(rawId);
      return makeTimerHandle(rawId, false);
    }

    function sandboxClearTimeout(handleOrId) {
      if (handleOrId === null || handleOrId === undefined) return;
      const rawId = typeof handleOrId === 'object' && '_id' in handleOrId ? handleOrId._id : handleOrId;
      clearTimeout(rawId);
      resourceTracker.activeTimers.delete(rawId);
      resourceTracker.allTimers.delete(rawId);
    }

    function sandboxSetInterval(fn, delay = 0, ...args) {
      const rawId = setInterval(() => {
        if (hasExited) {
          clearInterval(rawId);
          return;
        }
        try {
          fn(...args);
        } catch (err) {
          if (err && err._isProcessExit) {
            exitCode = err.exitCode;
            hasExited = true;
            clearInterval(rawId);
          } else {
            emitStderr((err && err.stack ? err.stack : String(err)) + '\n');
            exitCode = 1;
          }
        }
      }, delay);
      resourceTracker.activeTimers.add(rawId);
      resourceTracker.allTimers.add(rawId);
      return makeTimerHandle(rawId, true);
    }

    function sandboxClearInterval(handleOrId) {
      if (handleOrId === null || handleOrId === undefined) return;
      const rawId = typeof handleOrId === 'object' && '_id' in handleOrId ? handleOrId._id : handleOrId;
      clearInterval(rawId);
      resourceTracker.activeTimers.delete(rawId);
      resourceTracker.allTimers.delete(rawId);
    }

    function sandboxSetImmediate(fn, ...args) {
      const id = {};
      resourceTracker.activeImmediates.add(id);
      queueMicrotask(() => {
        if (!resourceTracker.activeImmediates.has(id)) return;
        resourceTracker.activeImmediates.delete(id);
        if (hasExited) return;
        try {
          fn(...args);
        } catch (err) {
          if (err && err._isProcessExit) {
            exitCode = err.exitCode;
            hasExited = true;
          } else {
            emitStderr((err && err.stack ? err.stack : String(err)) + '\n');
            exitCode = 1;
          }
        }
      });
      return id;
    }

    function sandboxClearImmediate(id) {
      resourceTracker.activeImmediates.delete(id);
    }

    const consoleTimers = new Map();
    const consoleCounts = new Map();
    let groupDepth = 0;

    function formatConsoleArgs(args) {
      if (args.length === 0) return '';
      if (args.length > 1 && typeof args[0] === 'string' && /%[sdifjoO%]/.test(args[0])) {
        const first = args[0];
        let idx = 1;
        let out = '';
        for (let i = 0; i < first.length; i++) {
          if (first[i] === '%' && i + 1 < first.length) {
            const next = first[i + 1];
            if (next === '%') {
              out += '%';
              i++;
              continue;
            }
            if (idx < args.length) {
              const arg = args[idx];
              if (next === 's') { out += String(arg); idx++; i++; continue; }
              if (next === 'd') { out += Number(arg); idx++; i++; continue; }
              if (next === 'i') { out += parseInt(arg, 10); idx++; i++; continue; }
              if (next === 'f') { out += parseFloat(arg); idx++; i++; continue; }
              if (next === 'j') {
                try { out += JSON.stringify(arg); } catch (_) { out += '[Circular]'; }
                idx++; i++; continue;
              }
              if (next === 'o' || next === 'O') {
                out += utilInspect(arg);
                idx++; i++; continue;
              }
            }
          }
          out += first[i];
        }
        while (idx < args.length) {
          out += ' ' + formatConsoleArg(args[idx++]);
        }
        return out;
      }
      return args.map(formatConsoleArg).join(' ');
    }

    function formatTableCell(val) {
      if (val === undefined) return '';
      if (val === null) return 'null';
      if (typeof val === 'string') return `'${val}'`;
      if (typeof val === 'number' || typeof val === 'boolean' || typeof val === 'bigint') return String(val);
      return utilInspect(val, { depth: 0 });
    }

    function formatConsoleTable(tabularData, properties) {
      if (tabularData === null || typeof tabularData !== 'object') {
        return null;
      }
      const entries = Array.isArray(tabularData)
        ? tabularData.map((v, i) => [String(i), v])
        : Object.entries(tabularData);
      if (entries.length === 0) {
        return '(empty table)';
      }
      const propFilter = Array.isArray(properties) ? new Set(properties.map(String)) : null;
      const cols = [];
      const colSet = new Set();
      let hasPrimitiveRow = false;

      for (const [, row] of entries) {
        if (row !== null && typeof row === 'object' && !VirtualBuffer.isBuffer(row) && !(row instanceof Date) && !(row instanceof RegExp)) {
          for (const k of Object.keys(row)) {
            if (!propFilter || propFilter.has(k)) {
              if (!colSet.has(k)) {
                colSet.add(k);
                cols.push(k);
              }
            }
          }
        } else {
          hasPrimitiveRow = true;
        }
      }

      const headers = ['(index)', ...cols, ...(hasPrimitiveRow ? ['Values'] : [])];
      const matrix = entries.map(([idxKey, row]) => {
        const isRowObj = row !== null && typeof row === 'object' && !VirtualBuffer.isBuffer(row) && !(row instanceof Date) && !(row instanceof RegExp);
        const cells = [String(idxKey)];
        for (const col of cols) {
          cells.push(isRowObj && Object.prototype.hasOwnProperty.call(row, col) ? formatTableCell(row[col]) : '');
        }
        if (hasPrimitiveRow) {
          cells.push(isRowObj ? '' : formatTableCell(row));
        }
        return cells;
      });

      const widths = headers.map((h, colIdx) => {
        let maxW = h.length;
        for (const r of matrix) {
          if (r[colIdx].length > maxW) maxW = r[colIdx].length;
        }
        return maxW;
      });

      const borderTop = '┌─' + widths.map((w) => '─'.repeat(w)).join('─┬─') + '─┐';
      const borderMid = '├─' + widths.map((w) => '─'.repeat(w)).join('─┼─') + '─┤';
      const borderBot = '└─' + widths.map((w) => '─'.repeat(w)).join('─┴─') + '─┘';
      const formatRow = (cells) => '│ ' + cells.map((c, i) => c.padEnd(widths[i], ' ')).join(' │ ') + ' │';

      return [
        borderTop,
        formatRow(headers),
        borderMid,
        ...matrix.map(formatRow),
        borderBot
      ].join('\n');
    }

    function applyGroupIndent(text) {
      if (groupDepth <= 0) return text;
      const pad = '  '.repeat(groupDepth);
      return String(text).split('\n').map((line) => pad + line).join('\n');
    }

    function checkConsoleFlood(isErr = false, targetChunks = null, targetCb = null) {
      if (outputTruncated) return false;
      consoleCallsCount++;
      if (consoleCallsCount > maxConsoleCalls) {
        triggerTruncation(
          targetChunks || (isErr ? stderrChunks : stdoutChunks),
          targetCb !== null ? targetCb : (isErr ? onStderr : onStdout)
        );
        return false;
      }
      return true;
    }

    function createConsole(writeOut, writeErr) {
      const c = {
        log: (...args) => {
          if (checkConsoleFlood(false)) writeOut(applyGroupIndent(formatConsoleArgs(args)) + '\n');
        },
        info: (...args) => {
          if (checkConsoleFlood(false)) writeOut(applyGroupIndent(formatConsoleArgs(args)) + '\n');
        },
        debug: (...args) => {
          if (checkConsoleFlood(false)) writeOut(applyGroupIndent(formatConsoleArgs(args)) + '\n');
        },
        warn: (...args) => {
          if (checkConsoleFlood(true)) writeErr(applyGroupIndent(formatConsoleArgs(args)) + '\n');
        },
        error: (...args) => {
          if (checkConsoleFlood(true)) writeErr(applyGroupIndent(formatConsoleArgs(args)) + '\n');
        },
        dir: (obj, opts) => {
          if (checkConsoleFlood(false)) writeOut(applyGroupIndent(utilInspect(obj, opts)) + '\n');
        },
        table: (tabularData, properties) => {
          const tableStr = formatConsoleTable(tabularData, properties);
          if (tableStr === null) {
            c.log(tabularData);
          } else if (checkConsoleFlood(false)) {
            writeOut(applyGroupIndent(tableStr) + '\n');
          }
        },
        time: (label = 'default') => {
          consoleTimers.set(String(label), performance.now());
        },
        timeLog: (label = 'default', ...data) => {
          const key = String(label);
          if (!consoleTimers.has(key)) {
            if (checkConsoleFlood(true)) writeErr(applyGroupIndent(`Warning: No such label '${key}' for console.timeLog()`) + '\n');
            return;
          }
          const elapsed = (performance.now() - consoleTimers.get(key)).toFixed(2);
          const extra = data.length > 0 ? ' ' + formatConsoleArgs(data) : '';
          if (checkConsoleFlood(false)) writeOut(applyGroupIndent(`${key}: ${elapsed}ms${extra}`) + '\n');
        },
        timeEnd: (label = 'default') => {
          const key = String(label);
          if (!consoleTimers.has(key)) {
            if (checkConsoleFlood(true)) writeErr(applyGroupIndent(`Warning: No such label '${key}' for console.timeEnd()`) + '\n');
            return;
          }
          const elapsed = (performance.now() - consoleTimers.get(key)).toFixed(2);
          consoleTimers.delete(key);
          if (checkConsoleFlood(false)) writeOut(applyGroupIndent(`${key}: ${elapsed}ms`) + '\n');
        },
        count: (label = 'default') => {
          const key = String(label);
          const next = (consoleCounts.get(key) || 0) + 1;
          consoleCounts.set(key, next);
          if (checkConsoleFlood(false)) writeOut(applyGroupIndent(`${key}: ${next}`) + '\n');
        },
        countReset: (label = 'default') => {
          consoleCounts.delete(String(label));
        },
        assert: (condition, ...data) => {
          if (!condition) {
            const msg = data.length > 0 ? 'Assertion failed: ' + formatConsoleArgs(data) : 'Assertion failed';
            if (checkConsoleFlood(true)) writeErr(applyGroupIndent(msg) + '\n');
          }
        },
        group: (...label) => {
          if (label.length > 0) c.log(...label);
          groupDepth = Math.min(groupDepth + 1, 20);
        },
        groupCollapsed: (...label) => {
          if (label.length > 0) c.log(...label);
          groupDepth = Math.min(groupDepth + 1, 20);
        },
        groupEnd: () => {
          groupDepth = Math.max(0, groupDepth - 1);
        },
        trace: (...data) => {
          if (!checkConsoleFlood(true)) return;
          const header = data.length > 0 ? 'Trace: ' + formatConsoleArgs(data) : 'Trace';
          const err = new Error();
          const rawLines = String(err.stack || '').split('\n').slice(2);
          const stackPart = rawLines.length > 0 ? '\n' + rawLines.join('\n') : '';
          writeErr(applyGroupIndent(header + stackPart) + '\n');
        },
        clear: () => {
          if (typeof options.onConsoleClear === 'function') options.onConsoleClear();
        }
      };
      return c;
    }

    const sandboxConsole = createConsole(emitStdout, emitStderr);

    const hrtimeFn = function hrtime(prev) {
      const ns = BigInt(Math.round(performance.now() * 1e6));
      const sec = Number(ns / 1000000000n);
      const nano = Number(ns % 1000000000n);
      if (Array.isArray(prev) && prev.length === 2) {
        let ds = sec - prev[0];
        let dn = nano - prev[1];
        if (dn < 0) { ds -= 1; dn += 1e9; }
        return [ds, dn];
      }
      return [sec, nano];
    };
    hrtimeFn.bigint = () => BigInt(Math.round(performance.now() * 1e6));

    let syncExecDepth = 0;
    let currentCwd = '/workspace';

    const sandboxProcess = Object.assign(new EventEmitter(), {
      env: { NODE_ENV: 'development', PATH: '/usr/local/bin:/usr/bin:/bin', HOME: '/home/coder' },
      argv: ['node', `/workspace/${entry}`],
      argv0: 'node',
      execArgv: [],
      execPath: '/usr/local/bin/node',
      pid: 1000,
      ppid: 1,
      title: 'node',
      version: 'v22.0.0',
      versions: { node: '22.0.0', v8: '12.4', uv: '1.48.0', modules: '127' },
      platform: 'linux',
      arch: 'x64',
      cwd: () => currentCwd,
      chdir: (dir) => {
        const target = VirtualPath.resolve(currentCwd, String(dir));
        if (!vfs.existsSync(target)) {
          const err = new Error(`ENOENT: no such file or directory, chdir '${dir}'`);
          err.code = 'ENOENT';
          throw err;
        }
        if (!vfs.statSync(target).isDirectory()) {
          const err = new Error(`ENOTDIR: not a directory, chdir '${dir}'`);
          err.code = 'ENOTDIR';
          throw err;
        }
        currentCwd = target;
      },
      uptime: () => Math.max(0, (performance.now() - startTime) / 1000),
      memoryUsage: () => ({
        rss: 33554432,
        heapTotal: 16777216,
        heapUsed: 8388608,
        external: 1048576,
        arrayBuffers: 524288
      }),
      cpuUsage: (prev) => {
        const cur = { user: Math.round((performance.now() - startTime) * 1000), system: 200 };
        if (prev && typeof prev.user === 'number') {
          return { user: Math.max(0, cur.user - prev.user), system: Math.max(0, cur.system - (prev.system || 0)) };
        }
        return cur;
      },
      emitWarning: (warning, type, code) => {
        const warnObj = warning instanceof Error ? warning : new Error(String(warning));
        if (typeof type === 'string') warnObj.name = type;
        if (typeof code === 'string') warnObj.code = code;
        sandboxProcess.emit('warning', warnObj);
      },
      hrtime: hrtimeFn,
      stdout: { write: (s) => { emitStdout(String(s)); return true; }, isTTY: false },
      stderr: { write: (s) => { emitStderr(String(s)); return true; }, isTTY: false },
      stdin: new PassThrough(),
      nextTick: (cb, ...args) => queueMicrotask(() => cb(...args)),
      exit: (code = 0) => {
        exitCode = Number(code) || 0;
        if (!hasExited) {
          hasExited = true;
          try { sandboxProcess.emit('exit', exitCode); } catch (_) {}
        }
        if (syncExecDepth > 0) {
          throw new ProcessExitSignal(exitCode);
        }
      }
    });

    // Built-in `node:test` runner (`test`, `describe`, `it`, `before`, `after`, `beforeEach`, `afterEach`, `mock`)
    const suiteStack = [];
    function currentSuite() {
      return suiteStack.length > 0 ? suiteStack[suiteStack.length - 1] : null;
    }

    function createMockFn(impl = () => undefined) {
      const calls = [];
      let currentImpl = impl;
      const onceQueue = [];
      const mockFn = function mocked(...args) {
        const fnToCall = onceQueue.length > 0 ? onceQueue.shift() : currentImpl;
        let result;
        let error;
        try {
          result = fnToCall.apply(this, args);
          calls.push({ arguments: args, result, error: undefined, this: this });
          return result;
        } catch (err) {
          error = err;
          calls.push({ arguments: args, result: undefined, error, this: this });
          throw err;
        }
      };
      mockFn.mock = {
        calls,
        callCount: () => calls.length,
        resetCalls: () => { calls.length = 0; },
        mockImplementation: (newImpl) => { currentImpl = newImpl; },
        mockImplementationOnce: (onceImpl) => { onceQueue.push(onceImpl); },
        restore: () => {}
      };
      return mockFn;
    }

    const mockObject = {
      fn: (impl) => createMockFn(impl),
      method: (obj, methodName, impl) => {
        const orig = obj[methodName];
        const wrapped = createMockFn(impl || (typeof orig === 'function' ? orig.bind(obj) : () => undefined));
        wrapped.mock.restore = () => { obj[methodName] = orig; };
        obj[methodName] = wrapped;
        return wrapped;
      },
      reset: () => {},
      restoreAll: () => {}
    };

    let nodeTestChain = Promise.resolve();

    function enqueueNodeTest(fullName, fn, hooksSnapshot) {
      if (shouldSkipTest(fullName)) return Promise.resolve();
      const task = nodeTestChain.then(async () => {
        if (hasExited) return;
        for (const bf of hooksSnapshot.beforeToRun) {
          await bf();
        }
        hooksSnapshot.beforeToRun.length = 0;
        for (const be of hooksSnapshot.beforeEachList) {
          await be();
        }
        const tCtx = {
          name: fullName,
          mock: mockObject,
          diagnostic: (msg) => sandboxConsole.log(`# ${msg}`),
          test: (subName, subOpts, subFn) => nodeTestFn(`${fullName} > ${subName}`, subOpts, subFn)
        };
        const wrapped = wrapTestFn(fullName, () => fn(tCtx));
        try {
          await wrapped();
          sandboxConsole.log(`✓ ${fullName}`);
        } catch (e) {
          if (e && e._isProcessExit) throw e;
          exitCode = 1;
          sandboxConsole.log(`✗ ${fullName}\n  ${e && e.stack ? e.stack : e}`);
        } finally {
          for (const ae of hooksSnapshot.afterEachList) {
            try { await ae(); } catch (_) {}
          }
          for (const af of hooksSnapshot.afterToRun) {
            try { await af(); } catch (_) {}
          }
          hooksSnapshot.afterToRun.length = 0;
        }
      });
      nodeTestChain = task.catch(() => {});
      resourceTracker.pendingTests.add(task);
      task.finally(() => resourceTracker.pendingTests.delete(task));
      return task;
    }

    function nodeTestFn(name, optsOrFn, maybeFn) {
      const fn = typeof optsOrFn === 'function' ? optsOrFn : maybeFn;
      const opts = typeof optsOrFn === 'object' && optsOrFn !== null ? optsOrFn : {};
      if (opts.skip || typeof fn !== 'function') return Promise.resolve();
      const suite = currentSuite();
      const fullName = suite ? `${suite.prefix} > ${name}` : name;
      const hooksSnapshot = {
        beforeToRun: suite ? suite.pendingBefore : [],
        afterToRun: [],
        beforeEachList: suite ? [...suite.beforeEach] : [],
        afterEachList: suite ? [...suite.afterEach] : []
      };
      return enqueueNodeTest(fullName, fn, hooksSnapshot);
    }

    function nodeDescribeFn(suiteName, optsOrFn, maybeFn) {
      const suiteFn = typeof optsOrFn === 'function' ? optsOrFn : maybeFn;
      const opts = typeof optsOrFn === 'object' && optsOrFn !== null ? optsOrFn : {};
      if (opts.skip || typeof suiteFn !== 'function') return;
      const parent = currentSuite();
      const prefix = parent ? `${parent.prefix} > ${suiteName}` : suiteName;
      const suiteCtx = {
        prefix,
        pendingBefore: [],
        afterCallbacks: [],
        beforeEach: parent ? [...parent.beforeEach] : [],
        afterEach: parent ? [...parent.afterEach] : []
      };
      suiteStack.push(suiteCtx);
      try {
        suiteFn();
      } finally {
        suiteStack.pop();
        if (suiteCtx.afterCallbacks.length > 0) {
          const afters = [...suiteCtx.afterCallbacks];
          const cleanupTask = nodeTestChain.then(async () => {
            for (const af of afters) {
              try { await af(); } catch (_) {}
            }
          });
          nodeTestChain = cleanupTask.catch(() => {});
          resourceTracker.pendingTests.add(cleanupTask);
          cleanupTask.finally(() => resourceTracker.pendingTests.delete(cleanupTask));
        }
      }
    }

    nodeTestFn.test = nodeTestFn;
    nodeTestFn.describe = nodeDescribeFn;
    nodeTestFn.suite = nodeDescribeFn;
    nodeTestFn.it = nodeTestFn;
    nodeTestFn.before = (fn) => { const s = currentSuite(); if (s && typeof fn === 'function') s.pendingBefore.push(fn); };
    nodeTestFn.after = (fn) => { const s = currentSuite(); if (s && typeof fn === 'function') s.afterCallbacks.push(fn); };
    nodeTestFn.beforeEach = (fn) => { const s = currentSuite(); if (s && typeof fn === 'function') s.beforeEach.push(fn); };
    nodeTestFn.afterEach = (fn) => { const s = currentSuite(); if (s && typeof fn === 'function') s.afterEach.push(fn); };
    nodeTestFn.mock = mockObject;

    const VirtualTimers = {
      setTimeout: sandboxSetTimeout,
      clearTimeout: sandboxClearTimeout,
      setInterval: sandboxSetInterval,
      clearInterval: sandboxClearInterval,
      setImmediate: sandboxSetImmediate,
      clearImmediate: sandboxClearImmediate
    };

    const VirtualTimersPromises = {
      setTimeout: (delay = 0, value) => new Promise((resolve) => sandboxSetTimeout(() => resolve(value), delay)),
      setImmediate: (value) => new Promise((resolve) => sandboxSetImmediate(() => resolve(value)))
    };
    VirtualTimers.promises = VirtualTimersPromises;

    const perfEntries = [];
    const perfObservers = new Set();
    function notifyPerfObservers(entry) {
      for (const obs of perfObservers) {
        if (!obs._entryTypes || obs._entryTypes.includes(entry.entryType)) {
          obs._records.push(entry);
          const list = {
            getEntries: () => [entry],
            getEntriesByName: (n, t) => (entry.name === n && (!t || entry.entryType === t) ? [entry] : []),
            getEntriesByType: (t) => (entry.entryType === t ? [entry] : [])
          };
          try { obs._cb(list, obs); } catch (_) {}
        }
      }
    }

    const virtualPerformance = {
      now: () => performance.now() - startTime,
      timeOrigin: performance.timeOrigin || Date.now(),
      mark(name, opts = {}) {
        const entry = {
          name: String(name),
          entryType: 'mark',
          startTime: opts && typeof opts.startTime === 'number' ? opts.startTime : virtualPerformance.now(),
          duration: 0,
          detail: opts && opts.detail !== undefined ? opts.detail : null
        };
        perfEntries.push(entry);
        notifyPerfObservers(entry);
        return entry;
      },
      measure(name, startOrOpts, endMark) {
        let startT = 0;
        let endT = virtualPerformance.now();
        let detail = null;
        if (typeof startOrOpts === 'object' && startOrOpts !== null) {
          detail = startOrOpts.detail !== undefined ? startOrOpts.detail : null;
          if (typeof startOrOpts.start === 'number') startT = startOrOpts.start;
          else if (typeof startOrOpts.start === 'string') {
            const m = [...perfEntries].reverse().find((e) => e.name === startOrOpts.start && e.entryType === 'mark');
            if (m) startT = m.startTime;
          }
          if (typeof startOrOpts.end === 'number') endT = startOrOpts.end;
          else if (typeof startOrOpts.end === 'string') {
            const m = [...perfEntries].reverse().find((e) => e.name === startOrOpts.end && e.entryType === 'mark');
            if (m) endT = m.startTime;
          } else if (typeof startOrOpts.duration === 'number') {
            endT = startT + startOrOpts.duration;
          }
        } else {
          if (typeof startOrOpts === 'string') {
            const m = [...perfEntries].reverse().find((e) => e.name === startOrOpts && e.entryType === 'mark');
            if (m) startT = m.startTime;
          }
          if (typeof endMark === 'string') {
            const m = [...perfEntries].reverse().find((e) => e.name === endMark && e.entryType === 'mark');
            if (m) endT = m.startTime;
          }
        }
        const entry = {
          name: String(name),
          entryType: 'measure',
          startTime: startT,
          duration: Math.max(0, endT - startT),
          detail
        };
        perfEntries.push(entry);
        notifyPerfObservers(entry);
        return entry;
      },
      getEntries: () => [...perfEntries],
      getEntriesByName: (name, type) => perfEntries.filter((e) => e.name === name && (!type || e.entryType === type)),
      getEntriesByType: (type) => perfEntries.filter((e) => e.entryType === type),
      clearMarks(name) {
        for (let i = perfEntries.length - 1; i >= 0; i--) {
          if (perfEntries[i].entryType === 'mark' && (!name || perfEntries[i].name === name)) perfEntries.splice(i, 1);
        }
      },
      clearMeasures(name) {
        for (let i = perfEntries.length - 1; i >= 0; i--) {
          if (perfEntries[i].entryType === 'measure' && (!name || perfEntries[i].name === name)) perfEntries.splice(i, 1);
        }
      },
      timerify(fn) {
        return function timerified(...args) {
          const t0 = virtualPerformance.now();
          try {
            return fn.apply(this, args);
          } finally {
            const t1 = virtualPerformance.now();
            const entry = { name: fn.name || 'anonymous', entryType: 'function', startTime: t0, duration: t1 - t0, detail: args };
            perfEntries.push(entry);
            notifyPerfObservers(entry);
          }
        };
      }
    };

    class VirtualPerformanceObserver {
      constructor(cb) {
        this._cb = cb;
        this._entryTypes = null;
        this._records = [];
      }
      observe(opts = {}) {
        if (Array.isArray(opts.entryTypes)) this._entryTypes = opts.entryTypes;
        else if (opts.type) this._entryTypes = [opts.type];
        perfObservers.add(this);
        if (opts.buffered && this._entryTypes) {
          const buffered = perfEntries.filter((e) => this._entryTypes.includes(e.entryType));
          if (buffered.length > 0) {
            const list = {
              getEntries: () => buffered,
              getEntriesByName: (n, t) => buffered.filter((e) => e.name === n && (!t || e.entryType === t)),
              getEntriesByType: (t) => buffered.filter((e) => e.entryType === t)
            };
            queueMicrotask(() => { try { this._cb(list, this); } catch (_) {} });
          }
        }
      }
      disconnect() {
        perfObservers.delete(this);
      }
      takeRecords() {
        const recs = [...this._records];
        this._records.length = 0;
        return recs;
      }
    }

    const VirtualPerfHooks = {
      performance: virtualPerformance,
      PerformanceObserver: VirtualPerformanceObserver,
      monitorEventLoopDelay: () => ({
        enable() { return true; },
        disable() { return true; },
        reset() {},
        percentile() { return 0; },
        min: 0,
        max: 0,
        mean: 0,
        stddev: 0,
        percentiles: new Map()
      }),
      constants: {
        NODE_PERFORMANCE_GC_MAJOR: 4,
        NODE_PERFORMANCE_GC_MINOR: 1
      }
    };

    // Virtual child_process implementation capable of running `node <script>` or shell commands in VFS
    let nextChildPid = 2000;
    function parseCommandArgs(cmdStr) {
      const tokens = [];
      let cur = '';
      let quote = null;
      for (let i = 0; i < cmdStr.length; i++) {
        const ch = cmdStr[i];
        if (quote) {
          if (ch === quote) quote = null;
          else if (ch === '\\' && quote === '"' && i + 1 < cmdStr.length) cur += cmdStr[++i];
          else cur += ch;
        } else if (ch === '"' || ch === "'") {
          quote = ch;
        } else if (/\s/.test(ch)) {
          if (cur.length > 0) { tokens.push(cur); cur = ''; }
        } else {
          cur += ch;
        }
      }
      if (cur.length > 0) tokens.push(cur);
      return tokens;
    }

    function executeSubCommandSync(command, args = [], opts = {}) {
      const cwd = opts.cwd ? VirtualPath.resolve(currentCwd, opts.cwd) : currentCwd;
      const env = Object.assign({}, sandboxProcess.env, opts.env || {});
      let out = '';
      let err = '';
      let status = 0;

      if (command === 'echo') {
        out = args.join(' ') + '\n';
      } else if (command === 'pwd') {
        out = cwd + '\n';
      } else if (command === 'true') {
        status = 0;
      } else if (command === 'false') {
        status = 1;
      } else if (command === 'env' || command === 'printenv') {
        out = Object.entries(env).map(([k, v]) => `${k}=${v}`).join('\n') + '\n';
      } else if (command === 'ls') {
        const target = args.find((a) => !a.startsWith('-')) || cwd;
        const abs = VirtualPath.resolve(cwd, target);
        try {
          out = vfs.readdirSync(abs).join('\n') + '\n';
        } catch (e) {
          err = e.message + '\n';
          status = 1;
        }
      } else if (command === 'cat') {
        for (const f of args) {
          const abs = VirtualPath.resolve(cwd, f);
          try {
            out += vfs.readFileSync(abs, 'utf8');
          } catch (e) {
            err += e.message + '\n';
            status = 1;
          }
        }
      } else if (command === 'node' || command === '/usr/local/bin/node') {
        let evalCode = null;
        let scriptArgIdx = -1;
        for (let i = 0; i < args.length; i++) {
          if (args[i] === '-e' || args[i] === '--eval') {
            evalCode = args[i + 1] || '';
            break;
          } else if (args[i] === '-p' || args[i] === '--print') {
            evalCode = `console.log(${args[i + 1] || ''});`;
            break;
          } else if (!args[i].startsWith('-')) {
            scriptArgIdx = i;
            break;
          }
        }
        let subTruncated = false;
        const appendSubOut = (text) => {
          if (subTruncated || outputTruncated) return;
          const s = String(text);
          if (out.length + s.length > maxOutputBytes || totalOutputBytes + s.length > maxOutputBytes) {
            const rem = Math.max(0, Math.min(maxOutputBytes - out.length, maxOutputBytes - totalOutputBytes));
            if (rem > 0) {
              const slice = s.slice(0, rem);
              out += slice;
              totalOutputBytes += slice.length;
            }
            out += TRUNCATION_NOTICE;
            subTruncated = true;
            triggerTruncation(stdoutChunks, onStdout);
            return;
          }
          out += s;
          totalOutputBytes += s.length;
        };
        const appendSubErr = (text) => {
          if (subTruncated || outputTruncated) return;
          const s = String(text);
          if (err.length + s.length > maxOutputBytes || totalOutputBytes + s.length > maxOutputBytes) {
            const rem = Math.max(0, Math.min(maxOutputBytes - err.length, maxOutputBytes - totalOutputBytes));
            if (rem > 0) {
              const slice = s.slice(0, rem);
              err += slice;
              totalOutputBytes += slice.length;
            }
            err += TRUNCATION_NOTICE;
            subTruncated = true;
            triggerTruncation(stderrChunks, onStderr);
            return;
          }
          err += s;
          totalOutputBytes += s.length;
        };
        const subConsole = createConsole(appendSubOut, appendSubErr);
        const subProcess = Object.assign(new EventEmitter(), sandboxProcess, {
          env,
          argv: scriptArgIdx >= 0
            ? ['node', VirtualPath.resolve(cwd, args[scriptArgIdx]), ...args.slice(scriptArgIdx + 1)]
            : ['node'],
          cwd: () => cwd,
          stdout: { write: (s) => { appendSubOut(s); return true; }, isTTY: false },
          stderr: { write: (s) => { appendSubErr(s); return true; }, isTTY: false },
          exit: (c = 0) => {
            status = Number(c) || 0;
            throw new ProcessExitSignal(status);
          }
        });
        try {
          let sourceToRun = evalCode;
          let scriptFilename = VirtualPath.join(cwd, '__eval__.js');
          if (sourceToRun === null && scriptArgIdx >= 0) {
            const rawScriptArg = args[scriptArgIdx];
            const directCand = resolveFileOrDirCandidates(VirtualPath.resolve(cwd, rawScriptArg));
            scriptFilename = directCand || resolveModulePath(rawScriptArg, cwd);
            sourceToRun = vfs.readFileSync(scriptFilename, 'utf8');
          }
          if (sourceToRun !== null) {
            const scriptDir = VirtualPath.dirname(scriptFilename);
            const transpiled = transpileTS(sourceToRun, scriptFilename);
            const subMod = { id: scriptFilename, filename: scriptFilename, loaded: false, exports: {} };
            const subRequire = (id) => {
              if (Object.prototype.hasOwnProperty.call(builtinModules, id)) return builtinModules[id];
              if (injectedPackages.has(id)) return injectedPackages.get(id);
              const resolved = resolveModulePath(id, scriptDir);
              return loadModule(resolved, false);
            };
            const fn = new Function(
              'exports', 'require', 'module', '__filename', '__dirname', 'Buffer', 'process', 'console',
              transpiled
            );
            fn(subMod.exports, subRequire, subMod, scriptFilename, scriptDir, VirtualBuffer, subProcess, subConsole);
          }
        } catch (e) {
          if (e && e._isProcessExit) {
            status = e.exitCode;
          } else {
            status = 1;
            err += (e && e.stack ? e.stack : String(e)) + '\n';
          }
        }
      } else {
        err = `${command}: command not found\n`;
        status = 127;
      }

      return { status, stdout: out, stderr: err, pid: nextChildPid++ };
    }

    function runShellStringSync(cmdStr, opts = {}) {
      const tokens = parseCommandArgs(String(cmdStr).trim());
      if (tokens.length === 0) return { status: 0, stdout: '', stderr: '', pid: nextChildPid++ };
      return executeSubCommandSync(tokens[0], tokens.slice(1), opts);
    }

    const vchildProcess = {
      execSync(cmd, opts = {}) {
        const res = runShellStringSync(cmd, opts);
        const enc = typeof opts === 'string' ? opts : opts && opts.encoding;
        const outVal = enc && enc !== 'buffer' ? res.stdout : VirtualBuffer.from(res.stdout);
        const errVal = enc && enc !== 'buffer' ? res.stderr : VirtualBuffer.from(res.stderr);
        if (res.status !== 0) {
          const error = new Error(`Command failed: ${cmd}\n${res.stderr}`);
          error.status = res.status;
          error.stdout = outVal;
          error.stderr = errVal;
          throw error;
        }
        return outVal;
      },
      spawnSync(command, args = [], opts = {}) {
        if (!Array.isArray(args)) { opts = args || {}; args = []; }
        const res = opts.shell ? runShellStringSync([command, ...args].join(' '), opts) : executeSubCommandSync(command, args, opts);
        const enc = opts && opts.encoding;
        const outVal = enc && enc !== 'buffer' ? res.stdout : VirtualBuffer.from(res.stdout);
        const errVal = enc && enc !== 'buffer' ? res.stderr : VirtualBuffer.from(res.stderr);
        return {
          pid: res.pid,
          output: [null, outVal, errVal],
          stdout: outVal,
          stderr: errVal,
          status: res.status,
          signal: null,
          error: null
        };
      },
      exec(cmd, optsOrCb, maybeCb) {
        const cb = typeof optsOrCb === 'function' ? optsOrCb : maybeCb;
        const opts = typeof optsOrCb === 'object' && optsOrCb !== null ? optsOrCb : {};
        const child = Object.assign(new EventEmitter(), {
          pid: nextChildPid++,
          stdout: new PassThrough(),
          stderr: new PassThrough(),
          stdin: new PassThrough(),
          killed: false,
          kill() { this.killed = true; return true; }
        });
        queueMicrotask(() => {
          const res = runShellStringSync(cmd, opts);
          if (res.stdout) child.stdout.write(res.stdout);
          child.stdout.end();
          if (res.stderr) child.stderr.write(res.stderr);
          child.stderr.end();
          child.emit('exit', res.status, null);
          child.emit('close', res.status, null);
          if (typeof cb === 'function') {
            if (res.status !== 0) {
              const error = new Error(`Command failed: ${cmd}\n${res.stderr}`);
              error.code = res.status;
              cb(error, res.stdout, res.stderr);
            } else {
              cb(null, res.stdout, res.stderr);
            }
          }
        });
        return child;
      },
      execFile(file, argsOrOptsOrCb, optsOrCb, maybeCb) {
        let args = [];
        let opts = {};
        let cb = maybeCb;
        if (Array.isArray(argsOrOptsOrCb)) {
          args = argsOrOptsOrCb;
          if (typeof optsOrCb === 'function') cb = optsOrCb;
          else if (optsOrCb) opts = optsOrCb;
        } else if (typeof argsOrOptsOrCb === 'function') {
          cb = argsOrOptsOrCb;
        } else if (argsOrOptsOrCb) {
          opts = argsOrOptsOrCb;
          if (typeof optsOrCb === 'function') cb = optsOrCb;
        }
        return vchildProcess.exec([file, ...args].join(' '), opts, cb);
      },
      spawn(command, args = [], opts = {}) {
        if (!Array.isArray(args)) { opts = args || {}; args = []; }
        const child = Object.assign(new EventEmitter(), {
          pid: nextChildPid++,
          stdout: new PassThrough(),
          stderr: new PassThrough(),
          stdin: new PassThrough(),
          killed: false,
          kill() { this.killed = true; return true; }
        });
        queueMicrotask(() => {
          const res = opts.shell ? runShellStringSync([command, ...args].join(' '), opts) : executeSubCommandSync(command, args, opts);
          if (res.stdout) child.stdout.write(VirtualBuffer.from(res.stdout));
          child.stdout.end();
          if (res.stderr) child.stderr.write(VirtualBuffer.from(res.stderr));
          child.stderr.end();
          child.emit('exit', res.status, null);
          child.emit('close', res.status, null);
        });
        return child;
      }
    };
    vchildProcess.exec[utilPromisify.custom] = (cmd, opts = {}) => new Promise((resolve, reject) => {
      vchildProcess.exec(cmd, opts, (err, stdout, stderr) => {
        if (err) {
          err.stdout = stdout;
          err.stderr = stderr;
          reject(err);
        } else {
          resolve({ stdout, stderr });
        }
      });
    });
    vchildProcess.execFile[utilPromisify.custom] = (file, args = [], opts = {}) => new Promise((resolve, reject) => {
      vchildProcess.execFile(file, args, opts, (err, stdout, stderr) => {
        if (err) {
          err.stdout = stdout;
          err.stderr = stderr;
          reject(err);
        } else {
          resolve({ stdout, stderr });
        }
      });
    });

    // Built-in Node module table
    const builtinModules = {
      fs: vfs,
      'node:fs': vfs,
      'fs/promises': vfs.promises,
      'node:fs/promises': vfs.promises,
      path: VirtualPath,
      'node:path': VirtualPath,
      os: VirtualOs,
      'node:os': VirtualOs,
      crypto: VirtualCrypto,
      'node:crypto': VirtualCrypto,
      zlib: VirtualZlib,
      'node:zlib': VirtualZlib,
      http: vhttp,
      'node:http': vhttp,
      https: vhttp,
      'node:https': vhttp,
      net: vnet,
      'node:net': vnet,
      dns: VirtualDns,
      'node:dns': VirtualDns,
      'dns/promises': VirtualDns.promises,
      'node:dns/promises': VirtualDns.promises,
      string_decoder: VirtualStringDecoder,
      'node:string_decoder': VirtualStringDecoder,
      child_process: vchildProcess,
      'node:child_process': vchildProcess,
      process: sandboxProcess,
      'node:process': sandboxProcess,
      console: sandboxConsole,
      'node:console': sandboxConsole,
      assert: assert,
      'node:assert': assert,
      'assert/strict': assert.strict,
      'node:assert/strict': assert.strict,
      events: EventEmitter,
      'node:events': EventEmitter,
      util: VirtualUtil,
      'node:util': VirtualUtil,
      url: VirtualUrl,
      'node:url': VirtualUrl,
      querystring: VirtualQuerystring,
      'node:querystring': VirtualQuerystring,
      stream: VirtualStream,
      'node:stream': VirtualStream,
      'stream/promises': VirtualStreamPromises,
      'node:stream/promises': VirtualStreamPromises,
      test: nodeTestFn,
      'node:test': nodeTestFn,
      perf_hooks: VirtualPerfHooks,
      'node:perf_hooks': VirtualPerfHooks,
      timers: VirtualTimers,
      'node:timers': VirtualTimers,
      'timers/promises': VirtualTimersPromises,
      'node:timers/promises': VirtualTimersPromises,
      buffer: { Buffer: VirtualBuffer },
      'node:buffer': { Buffer: VirtualBuffer }
    };

    const moduleCache = new Map();
    let mainModule = null;

    function resolveFileOrDirCandidates(base) {
      const fileExts = ['', '.js', '.ts', '.mjs', '.cjs', '.json'];
      for (const ext of fileExts) {
        const p = base + ext;
        if (vfs.existsSync(p) && vfs.statSync(p).isFile()) return p;
      }
      if (vfs.existsSync(base) && vfs.statSync(base).isDirectory()) {
        const pkgJsonPath = VirtualPath.join(base, 'package.json');
        if (vfs.existsSync(pkgJsonPath) && vfs.statSync(pkgJsonPath).isFile()) {
          try {
            const pkg = JSON.parse(vfs.readFileSync(pkgJsonPath, 'utf8'));
            let entryRel = null;
            if (typeof pkg.exports === 'string') {
              entryRel = pkg.exports;
            } else if (pkg.exports && typeof pkg.exports === 'object') {
              const rootExp = pkg.exports['.'] || pkg.exports;
              if (typeof rootExp === 'string') entryRel = rootExp;
              else if (rootExp && typeof rootExp === 'object') {
                entryRel = rootExp.require || rootExp.import || rootExp.default || rootExp.node;
              }
            }
            if (!entryRel) entryRel = pkg.main || pkg.module || (typeof pkg.browser === 'string' ? pkg.browser : null);
            if (entryRel) {
              const resolvedEntry = resolveFileOrDirCandidates(VirtualPath.resolve(base, entryRel));
              if (resolvedEntry) return resolvedEntry;
            }
          } catch (_) {}
        }
        const indexCandidates = ['index.js', 'index.ts', 'index.mjs', 'index.cjs', 'index.json'];
        for (const idx of indexCandidates) {
          const p = VirtualPath.join(base, idx);
          if (vfs.existsSync(p) && vfs.statSync(p).isFile()) return p;
        }
      }
      return null;
    }

    function resolveModulePath(arg1, arg2 = '/workspace') {
      let request = arg1;
      let fromDir = arg2;
      // Support both (request, fromDir) and (fromDir, request) calling conventions
      if (
        typeof arg1 === 'string' &&
        typeof arg2 === 'string' &&
        arg1.startsWith('/workspace') &&
        !arg2.startsWith('/workspace') &&
        vfs.existsSync(arg1) &&
        vfs.statSync(arg1).isDirectory()
      ) {
        fromDir = arg1;
        request = arg2;
      }

      if (request.startsWith('.') || request.startsWith('/')) {
        const base = request.startsWith('/')
          ? VirtualPath.normalize(request)
          : VirtualPath.resolve(fromDir, request);
        const found = resolveFileOrDirCandidates(base);
        if (found) return found;
      } else {
        // Bare module specifier: walk up node_modules directories
        const parts = request.split('/');
        const pkgName = request.startsWith('@') ? parts.slice(0, 2).join('/') : parts[0];
        const subpath = request.startsWith('@') ? parts.slice(2).join('/') : parts.slice(1).join('/');

        let curr = VirtualPath.resolve('/workspace', fromDir || '/workspace');
        const searchDirs = [];
        while (true) {
          searchDirs.push(VirtualPath.join(curr, 'node_modules'));
          const parent = VirtualPath.dirname(curr);
          if (parent === curr) break;
          curr = parent;
        }
        if (!searchDirs.includes('/workspace/node_modules')) {
          searchDirs.push('/workspace/node_modules');
        }

        for (const nmDir of searchDirs) {
          const pkgRoot = VirtualPath.join(nmDir, pkgName);
          if (subpath) {
            // Check package.json subpath exports first
            const pkgJsonPath = VirtualPath.join(pkgRoot, 'package.json');
            if (vfs.existsSync(pkgJsonPath) && vfs.statSync(pkgJsonPath).isFile()) {
              try {
                const pkg = JSON.parse(vfs.readFileSync(pkgJsonPath, 'utf8'));
                const expKey = `./${subpath}`;
                if (pkg.exports && pkg.exports[expKey]) {
                  const subExp = pkg.exports[expKey];
                  const targetRel = typeof subExp === 'string'
                    ? subExp
                    : (subExp.require || subExp.import || subExp.default);
                  if (targetRel) {
                    const found = resolveFileOrDirCandidates(VirtualPath.resolve(pkgRoot, targetRel));
                    if (found) return found;
                  }
                }
              } catch (_) {}
            }
            const foundSub = resolveFileOrDirCandidates(VirtualPath.join(pkgRoot, subpath));
            if (foundSub) return foundSub;
          } else {
            const foundPkg = resolveFileOrDirCandidates(pkgRoot);
            if (foundPkg) return foundPkg;
          }
        }
      }

      const err = new Error(`Cannot find module '${request}' from '${fromDir}'`);
      err.code = 'MODULE_NOT_FOUND';
      throw err;
    }

    function loadModule(absPath, isMain = false) {
      if (moduleCache.has(absPath)) {
        return moduleCache.get(absPath).exports;
      }
      const mod = {
        id: absPath,
        filename: absPath,
        loaded: false,
        exports: {}
      };
      if (isMain) mainModule = mod;
      moduleCache.set(absPath, mod);

      const rawSource = vfs.readFileSync(absPath, 'utf8');
      if (absPath.endsWith('.json')) {
        mod.exports = JSON.parse(rawSource);
        mod.loaded = true;
        return mod.exports;
      }

      const dir = VirtualPath.dirname(absPath);
      const localRequire = function require(id) {
        if (Object.prototype.hasOwnProperty.call(builtinModules, id)) {
          return builtinModules[id];
        }
        if (injectedPackages.has(id)) {
          return injectedPackages.get(id);
        }
        const resolved = resolveModulePath(id, dir);
        return loadModule(resolved, false);
      };
      localRequire.main = mainModule;
      localRequire.resolve = (id) => resolveModulePath(id, dir);
      localRequire.cache = Object.fromEntries(moduleCache.entries());

      let transformed = transpileTS(rawSource, absPath);
      if (mode === 'test' || isMain || absPath.endsWith('test.js') || absPath.endsWith('test.ts')) {
        transformed = instrumentTestCode(transformed);
      }

      // Global fallback `test` / `it` / `describe` for custom user test scripts
      const globalTest = (name, optsOrFn, maybeFn) => nodeTestFn(name, optsOrFn, maybeFn);
      const globalDescribe = (suiteName, optsOrFn, maybeFn) => nodeDescribeFn(suiteName, optsOrFn, maybeFn);

      const sandboxGlobal = {
        Buffer: VirtualBuffer,
        process: sandboxProcess,
        console: sandboxConsole,
        setTimeout: sandboxSetTimeout,
        clearTimeout: sandboxClearTimeout,
        setInterval: sandboxSetInterval,
        clearInterval: sandboxClearInterval,
        setImmediate: sandboxSetImmediate,
        clearImmediate: sandboxClearImmediate,
        queueMicrotask,
        TextEncoder: typeof TextEncoder !== 'undefined' ? TextEncoder : undefined,
        TextDecoder: typeof TextDecoder !== 'undefined' ? TextDecoder : undefined,
        performance: virtualPerformance,
        PerformanceObserver: VirtualPerformanceObserver,
        URL: VirtualUrl.URL,
        URLSearchParams: VirtualUrl.URLSearchParams,
        crypto: VirtualCrypto
      };
      sandboxGlobal.global = sandboxGlobal;
      sandboxGlobal.globalThis = sandboxGlobal;

      const moduleBody = '{\n' + transformed + '\n}\n//# sourceURL=' + absPath;

      const fn = new Function(
        'exports',
        'require',
        'module',
        '__filename',
        '__dirname',
        'Buffer',
        'process',
        'console',
        'setTimeout',
        'clearTimeout',
        'setInterval',
        'clearInterval',
        'setImmediate',
        'clearImmediate',
        'global',
        '__shouldSkipTest',
        '__wrapTestFn',
        'test',
        'describe',
        'it',
        moduleBody
      );

      syncExecDepth++;
      try {
        fn(
          mod.exports,
          localRequire,
          mod,
          absPath,
          dir,
          VirtualBuffer,
          sandboxProcess,
          sandboxConsole,
          sandboxSetTimeout,
          sandboxClearTimeout,
          sandboxSetInterval,
          sandboxClearInterval,
          sandboxSetImmediate,
          sandboxClearImmediate,
          sandboxGlobal,
          shouldSkipTest,
          wrapTestFn,
          globalTest,
          globalDescribe,
          globalTest
        );
      } finally {
        syncExecDepth--;
      }

      mod.loaded = true;
      return mod.exports;
    }

    let replValue = undefined;
    try {
      if (mode === 'repl') {
        const replPath = '/workspace/__repl__.ts';
        vfs.writeFileSync(replPath, replCode || '');
        const dir = '/workspace';
        const localRequire = function require(id) {
          if (Object.prototype.hasOwnProperty.call(builtinModules, id)) return builtinModules[id];
          if (injectedPackages.has(id)) return injectedPackages.get(id);
          const resolved = resolveModulePath(id, dir);
          return loadModule(resolved, false);
        };
        const transpiledRepl = transpileTS(replCode || '', replPath);
        let body = transpiledRepl;
        const lines = body.trim().split('\n');
        const lastLine = lines[lines.length - 1] || '';
        if (lines.length > 0 && !/^\s*(const|let|var|function|class|if|for|while|switch|try|return|throw)\b/.test(lastLine)) {
          lines[lines.length - 1] = `return (${lastLine.replace(/;+\s*$/, '')});`;
          try {
            new Function(lines.join('\n'));
            body = lines.join('\n');
          } catch (_) {
            body = transpiledRepl;
          }
        }
        const replFn = new Function(
          'require',
          'Buffer',
          'process',
          'console',
          'setTimeout',
          'clearTimeout',
          'setInterval',
          'clearInterval',
          'setImmediate',
          'clearImmediate',
          `return (async () => {\n${body}\n})();`
        );
        replValue = await replFn(
          localRequire,
          VirtualBuffer,
          sandboxProcess,
          sandboxConsole,
          sandboxSetTimeout,
          sandboxClearTimeout,
          sandboxSetInterval,
          sandboxClearInterval,
          sandboxSetImmediate,
          sandboxClearImmediate
        );
        if (replValue !== undefined) {
          emitStdout(formatConsoleArg(replValue) + '\n');
        }
      } else {
        let entryAbs = `/workspace/${entry.replace(/^\/+/, '')}`;
        if (!vfs.existsSync(entryAbs)) {
          const alt = `/workspace/src/${entry.replace(/^\/+/, '')}`;
          if (vfs.existsSync(alt)) entryAbs = alt;
        }
        loadModule(entryAbs, true);
      }

      const deadline = performance.now() + timeoutMs;
      let idleTicks = 0;
      while (!hasExited && performance.now() < deadline) {
        await Promise.resolve();
        await Promise.resolve();
        const busy =
          resourceTracker.activeTimers.size > 0 ||
          resourceTracker.activeImmediates.size > 0 ||
          resourceTracker.inFlightHttp.size > 0 ||
          resourceTracker.pendingTests.size > 0;

        if (!busy) {
          idleTicks++;
          if (idleTicks >= 2) break;
        } else {
          idleTicks = 0;
        }
        await new Promise((r) => setTimeout(r, 2));
      }
    } catch (err) {
      if (err && err._isProcessExit) {
        exitCode = err.exitCode;
      } else {
        exitCode = 1;
        emitStderr((err && err.stack ? err.stack : String(err)) + '\n');
      }
    } finally {
      if (!hasExited) {
        hasExited = true;
        try { sandboxProcess.emit('exit', exitCode); } catch (_) {}
      }
      for (const rawId of resourceTracker.allTimers) {
        clearTimeout(rawId);
        clearInterval(rawId);
      }
      resourceTracker.activeTimers.clear();
      resourceTracker.allTimers.clear();
      resourceTracker.activeImmediates.clear();
      resourceTracker.inFlightHttp.clear();
      vhttp.closeAllServers();
      vnet.closeAllServers();
    }

    const failedTests = testResults.filter((t) => !t.passed).length;
    if (failedTests > 0 && exitCode === 0) exitCode = 1;

    return {
      ok: exitCode === 0,
      exitCode,
      durationMs: Math.max(0, performance.now() - startTime),
      stdout: stdoutChunks.join(''),
      stderr: stderrChunks.join(''),
      outputTruncated,
      testResults,
      testSummary: {
        total: testResults.length,
        passed: testResults.length - failedTests,
        failed: failedTests
      },
      fsSnapshot: vfs.getSnapshot(),
      httpTrace: [...vhttp.getTrace(), ...vnet.getTrace()],
      replValue: replValue !== undefined ? formatConsoleArg(replValue) : undefined
    };
  }

  return {
    VirtualBuffer,
    VirtualCrypto,
    VirtualZlib,
    VirtualPath,
    VirtualOs,
    VirtualAssert: assert,
    EventEmitter,
    VirtualUtil,
    VirtualUrl,
    VirtualQuerystring,
    VirtualStream,
    VirtualStreamPromises,
    VirtualStringDecoder,
    VirtualDns,
    createVirtualFs,
    createVirtualHttp,
    createVirtualNet,
    transpileTS,
    preloadNpmPackages,
    executeInVirtualRuntime
  };

}

function __workerMessageLoop(workerScope) {
  const runtime = workerScope.__virtualRuntime;
  workerScope.onmessage = async function (event) {
    const msg = event.data || {};
    const { requestId, type, payload = {} } = msg;
    if (type !== 'execute') return;
    try {
      const result = await runtime.executeInVirtualRuntime({
        ...payload,
        onStdout(text) {
          workerScope.postMessage({ requestId, type: 'stdout', text });
        },
        onStderr(text) {
          workerScope.postMessage({ requestId, type: 'stderr', text });
        },
        onTestResult(testResult) {
          workerScope.postMessage({ requestId, type: 'test-result', testResult });
        }
      });
      workerScope.postMessage({ requestId, type: 'complete', result });
    } catch (err) {
      workerScope.postMessage({
        requestId,
        type: 'error',
        error: { message: err && err.message ? err.message : String(err), stack: err && err.stack }
      });
    }
  };
}

function createWorkerRuntimeSource() {
  return `'use strict';\nself.__virtualRuntime = (${__initVirtualRuntime.toString()})(self);\n(${__workerMessageLoop.toString()})(self);\n`;
}

const _hostRuntime = __initVirtualRuntime(typeof globalThis !== 'undefined' ? globalThis : (typeof window !== 'undefined' ? window : global));
_hostRuntime.createWorkerRuntimeSource = createWorkerRuntimeSource;

let _cachedWorkerUrl = null;
let _warmWorker = null;
let _warmWorkerBusy = false;
const _activeWorkerJobs = new Map();

function _ensureWorkerUrl() {
  if (!_cachedWorkerUrl) {
    const blob = new Blob([createWorkerRuntimeSource()], { type: 'application/javascript' });
    _cachedWorkerUrl = URL.createObjectURL(blob);
  }
  return _cachedWorkerUrl;
}

function _ensureWarmWorker() {
  if (_warmWorker) return _warmWorker;
  _warmWorker = new Worker(_ensureWorkerUrl());
  return _warmWorker;
}

function _destroyWarmWorker() {
  if (_warmWorker) {
    try { _warmWorker.terminate(); } catch (_) {}
    _warmWorker = null;
  }
  _warmWorkerBusy = false;
}

_hostRuntime.cancelWorkerExecution = function cancelWorkerExecution(reason = 'Execution cancelled', instanceId) {
  let cancelledAny = false;
  for (const [jobId, job] of Array.from(_activeWorkerJobs.entries())) {
    if (!instanceId || job.instanceId === instanceId) {
      _activeWorkerJobs.delete(jobId);
      job.cancel(reason);
      cancelledAny = true;
    }
  }
  return cancelledAny;
};

_hostRuntime.executeInWorker = async function executeInWorker(options = {}) {
  if (typeof Worker === 'undefined' || typeof Blob === 'undefined' || typeof URL === 'undefined' || !URL.createObjectURL) {
    return _hostRuntime.executeInVirtualRuntime(options);
  }

  const requestId = 'req_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
  const instanceId = options.instanceId || (options.concurrent ? requestId : 'default');

  // If a previous execution for this same instanceId is still in-flight, cancel only that instance's job
  if (!options.concurrent) {
    _hostRuntime.cancelWorkerExecution('Execution cancelled by new run', instanceId);
  }

  return new Promise((resolve) => {
    let worker;
    let isWarmWorker = false;
    try {
      if (!_warmWorkerBusy) {
        worker = _ensureWarmWorker();
        _warmWorkerBusy = true;
        isWarmWorker = true;
      } else {
        worker = new Worker(_ensureWorkerUrl());
        isWarmWorker = false;
      }
    } catch (_) {
      if (isWarmWorker) _warmWorkerBusy = false;
      resolve(_hostRuntime.executeInVirtualRuntime(options));
      return;
    }

    const timeoutMs = options.timeoutMs || 15000;
    let settled = false;

    function releaseWorker(terminateWorker) {
      _activeWorkerJobs.delete(requestId);
      if (isWarmWorker) {
        if (terminateWorker) {
          _destroyWarmWorker();
        } else {
          _warmWorkerBusy = false;
          if (_warmWorker) {
            _warmWorker.onmessage = null;
            _warmWorker.onerror = null;
          }
        }
      } else {
        try { worker.terminate(); } catch (_) {}
      }
    }

    const timer = setTimeout(() => {
      if (settled) return;
      settled = true;
      releaseWorker(true);
      resolve({
        ok: false,
        timedOut: true,
        exitCode: 124,
        durationMs: timeoutMs,
        stdout: '',
        stderr: `Execution timed out after ${timeoutMs}ms (infinite loop or hung timer terminated).\n`,
        testResults: [],
        fsSnapshot: [],
        httpTrace: [],
        error: { message: `Execution timed out after ${timeoutMs}ms` }
      });
    }, timeoutMs + 500);

    _activeWorkerJobs.set(requestId, {
      requestId,
      instanceId,
      cancel(reason = 'Execution cancelled by new run') {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        releaseWorker(true);
        resolve({
          ok: false,
          cancelled: true,
          exitCode: 130,
          durationMs: 0,
          stdout: '',
          stderr: `${reason}\n`,
          testResults: [],
          fsSnapshot: [],
          httpTrace: [],
          error: { message: reason }
        });
      }
    });

    worker.onmessage = (event) => {
      const msg = event.data || {};
      if (msg.requestId !== requestId) return;
      if (msg.type === 'stdout' && typeof options.onStdout === 'function') {
        options.onStdout(msg.text);
      } else if (msg.type === 'stderr' && typeof options.onStderr === 'function') {
        options.onStderr(msg.text);
      } else if (msg.type === 'test-result' && typeof options.onTestResult === 'function') {
        options.onTestResult(msg.testResult);
      } else if (msg.type === 'complete') {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        // Release `_warmWorker` for instant reuse, or terminate ephemeral concurrent worker
        releaseWorker(false);
        resolve(msg.result);
      } else if (msg.type === 'error') {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        releaseWorker(false);
        resolve({
          ok: false,
          exitCode: 1,
          durationMs: 0,
          stdout: '',
          stderr: (msg.error?.stack || msg.error?.message || 'Worker execution error') + '\n',
          testResults: [],
          fsSnapshot: [],
          httpTrace: [],
          error: { message: msg.error?.message || 'Worker execution error', stack: msg.error?.stack }
        });
      }
    };

    worker.onerror = () => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      releaseWorker(true);
      resolve(_hostRuntime.executeInVirtualRuntime(options));
    };

    worker.postMessage({
      requestId,
      type: 'execute',
      payload: {
        files: options.files,
        entry: options.entry,
        mode: options.mode,
        replCode: options.replCode,
        testFilter: options.testFilter,
        timeoutMs: options.timeoutMs,
        maxOutputBytes: options.maxOutputBytes,
        maxConsoleCalls: options.maxConsoleCalls
      }
    });
  });
};

if (typeof window !== 'undefined') {
  window.VirtualNodeRuntime = _hostRuntime;
  window.CodeLabRuntime = _hostRuntime;
}
if (typeof globalThis !== 'undefined') {
  globalThis.CodeLabRuntime = _hostRuntime;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = _hostRuntime;
}

