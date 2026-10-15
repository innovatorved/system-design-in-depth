/**
 * ============================================================
 * @innovatorved/code-lab v1.2.0 — Standalone Browser Code IDE & Virtual Runtime
 * ============================================================
 * Features:
 *   - Sandboxed Web Worker Execution Engine with Multi-Instance Isolation & Watchdog Timer
 *   - TypeScript/ESM Compiler & CommonJS/NPM Module Bundler
 *   - 24 Virtual Node.js Built-in Modules (fs, net, http, stream, crypto, events, test, console, etc.)
 *   - VS Code Workbench: Hierarchical File Tree, Decoupled Tabs, Command Palette (Cmd+Shift+P), Quick Open (Cmd+P), Breadcrumbs, Context Menus & Solution Diff Viewer
 *   - Third-Party Imperative SDK (getFiles, setFiles, getFile, setFile, on, off, use, exportWorkspace)
 * ============================================================
 */
(function (root) {
  'use strict';

  // --- Module 1: Runtime Engine ---
  (function () {
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


  })();

  const CodeLabRuntime = root.CodeLabRuntime;

  // --- Module 2: IDE Workbench & Web Component ---
  (function () {
/* ═══════════════════════════════════════════════════════════════════════════
   @innovatorved/code-lab — Interactive Monaco IDE Workbench & Guided Lab UI
   Supports <code-lab> Custom Element + window.CodeLab.mount() API
   ═══════════════════════════════════════════════════════════════════════════ */

(function (root) {
  'use strict';

  const MONACO_BASE = 'https://cdn.jsdelivr.net/npm/monaco-editor@0.52.2/min/vs';
  const STORAGE_PREFIX = 'sd-codelab-v1:';

  // Ambient TypeScript declarations for Node.js built-ins inside Monaco
  const NODE_AMBIENT_DTS = `
declare var require: (id: string) => any;
declare var module: { exports: any };
declare var exports: any;
declare var __dirname: string;
declare var __filename: string;
declare var process: {
  env: Record<string, string | undefined>;
  argv: string[];
  version: string;
  versions: Record<string, string>;
  platform: string;
  arch: string;
  pid: number;
  cwd(): string;
  hrtime: { (time?: [number, number]): [number, number]; bigint(): bigint };
  nextTick(cb: (...args: any[]) => void, ...args: any[]): void;
  stdout: { write(chunk: any): boolean };
  stderr: { write(chunk: any): boolean };
};
declare class Buffer extends Uint8Array {
  static from(data: any, encoding?: string): Buffer;
  static alloc(size: number, fill?: any, encoding?: string): Buffer;
  static allocUnsafe(size: number): Buffer;
  static concat(list: Uint8Array[], totalLength?: number): Buffer;
  static isBuffer(obj: any): obj is Buffer;
  static byteLength(str: string | Uint8Array, encoding?: string): number;
  static compare(a: Uint8Array, b: Uint8Array): number;
  toString(encoding?: string, start?: number, end?: number): string;
  write(str: string, offset?: number, length?: number, encoding?: string): number;
  slice(start?: number, end?: number): Buffer;
  subarray(start?: number, end?: number): Buffer;
  equals(other: Uint8Array): boolean;
  copy(target: Uint8Array, targetStart?: number, sourceStart?: number, sourceEnd?: number): number;
  readUInt8(offset?: number): number;
  readUInt16BE(offset?: number): number;
  readUInt16LE(offset?: number): number;
  readUInt32BE(offset?: number): number;
  readUInt32LE(offset?: number): number;
  readInt32BE(offset?: number): number;
  readInt32LE(offset?: number): number;
  readBigUInt64BE(offset?: number): bigint;
  readBigInt64BE(offset?: number): bigint;
  writeUInt8(value: number, offset?: number): number;
  writeUInt16BE(value: number, offset?: number): number;
  writeUInt16LE(value: number, offset?: number): number;
  writeUInt32BE(value: number, offset?: number): number;
  writeUInt32LE(value: number, offset?: number): number;
  writeInt32BE(value: number, offset?: number): number;
  writeInt32LE(value: number, offset?: number): number;
  writeBigUInt64BE(value: bigint, offset?: number): number;
  writeBigInt64BE(value: bigint, offset?: number): number;
}
declare module 'node:test' {
  export function describe(name: string, fn: () => any): void;
  export function it(name: string, fn: () => any): void;
  export function test(name: string, fn: () => any): void;
  export function before(fn: () => any): void;
  export function after(fn: () => any): void;
  export function beforeEach(fn: () => any): void;
  export function afterEach(fn: () => any): void;
}
declare module 'test' { export * from 'node:test'; }
declare module 'node:assert' {
  function assert(value: any, message?: string | Error): void;
  namespace assert {
    function ok(value: any, message?: string | Error): void;
    function equal(actual: any, expected: any, message?: string | Error): void;
    function strictEqual(actual: any, expected: any, message?: string | Error): void;
    function notEqual(actual: any, expected: any, message?: string | Error): void;
    function notStrictEqual(actual: any, expected: any, message?: string | Error): void;
    function deepEqual(actual: any, expected: any, message?: string | Error): void;
    function deepStrictEqual(actual: any, expected: any, message?: string | Error): void;
    function throws(block: () => any, error?: any, message?: string): void;
    function doesNotThrow(block: () => any, error?: any, message?: string): void;
    function rejects(block: (() => Promise<any>) | Promise<any>, error?: any, message?: string): Promise<void>;
    function doesNotReject(block: (() => Promise<any>) | Promise<any>, error?: any, message?: string): Promise<void>;
    function match(string: string, regexp: RegExp, message?: string): void;
    function doesNotMatch(string: string, regexp: RegExp, message?: string): void;
    function fail(message?: string | Error): never;
  }
  export = assert;
}
declare module 'assert' { import assert = require('node:assert'); export = assert; }
declare module 'node:assert/strict' { import assert = require('node:assert'); export = assert; }
declare module 'assert/strict' { import assert = require('node:assert'); export = assert; }
declare module 'node:events' {
  export class EventEmitter {
    on(event: string | symbol, listener: (...args: any[]) => void): this;
    once(event: string | symbol, listener: (...args: any[]) => void): this;
    off(event: string | symbol, listener: (...args: any[]) => void): this;
    removeListener(event: string | symbol, listener: (...args: any[]) => void): this;
    removeAllListeners(event?: string | symbol): this;
    emit(event: string | symbol, ...args: any[]): boolean;
    listenerCount(event: string | symbol): number;
    listeners(event: string | symbol): Function[];
  }
  export default EventEmitter;
}
declare module 'events' { export * from 'node:events'; }
declare module 'node:crypto' {
  export function createHash(algorithm: 'md5' | 'sha1' | 'sha256' | 'sha512' | string): {
    update(data: string | Uint8Array): any;
    digest(encoding?: 'hex' | 'base64' | 'base64url'): any;
  };
  export function createHmac(algorithm: string, key: string | Uint8Array): {
    update(data: string | Uint8Array): any;
    digest(encoding?: 'hex' | 'base64' | 'base64url'): any;
  };
  export function timingSafeEqual(a: Uint8Array, b: Uint8Array): boolean;
  export function randomUUID(): string;
  export function randomBytes(size: number): Buffer;
  export function randomInt(min: number, max?: number): number;
  export function pbkdf2Sync(password: any, salt: any, iterations: number, keylen: number, digest: string): Buffer;
  export function scryptSync(password: any, salt: any, keylen: number, options?: any): Buffer;
  export function createCipheriv(algorithm: string, key: any, iv: any): any;
  export function createDecipheriv(algorithm: string, key: any, iv: any): any;
}
declare module 'crypto' { export * from 'node:crypto'; }
declare module 'node:fs' {
  export function openSync(path: string, flags?: string): number;
  export function closeSync(fd: number): void;
  export function writeSync(fd: number, buffer: Uint8Array | string, offset?: number, length?: number, position?: number | null): number;
  export function readSync(fd: number, buffer: Uint8Array, offset: number, length: number, position: number | null): number;
  export function fsyncSync(fd: number): void;
  export function fstatSync(fd: number): { size: number; isDirectory(): boolean; isFile(): boolean };
  export function statSync(path: string): { size: number; isDirectory(): boolean; isFile(): boolean };
  export function existsSync(path: string): boolean;
  export function mkdirSync(path: string, options?: any): void;
  export function mkdtempSync(prefix: string): string;
  export function readdirSync(path: string): string[];
  export function readFileSync(path: string, options?: any): any;
  export function writeFileSync(path: string, data: any, options?: any): void;
  export function appendFileSync(path: string, data: any, options?: any): void;
  export function copyFileSync(src: string, dest: string): void;
  export function truncateSync(path: string, len?: number): void;
  export function renameSync(oldPath: string, newPath: string): void;
  export function unlinkSync(path: string): void;
  export function rmSync(path: string, options?: any): void;
  export const promises: typeof import('node:fs/promises');
}
declare module 'fs' { export * from 'node:fs'; }
declare module 'node:fs/promises' {
  export function readFile(path: string, options?: any): Promise<any>;
  export function writeFile(path: string, data: any, options?: any): Promise<void>;
  export function appendFile(path: string, data: any, options?: any): Promise<void>;
  export function mkdir(path: string, options?: any): Promise<void>;
  export function readdir(path: string): Promise<string[]>;
  export function stat(path: string): Promise<{ size: number; isDirectory(): boolean; isFile(): boolean }>;
  export function unlink(path: string): Promise<void>;
  export function rm(path: string, options?: any): Promise<void>;
  export function rename(oldPath: string, newPath: string): Promise<void>;
}
declare module 'fs/promises' { export * from 'node:fs/promises'; }
declare module 'node:path' {
  export function join(...paths: string[]): string;
  export function resolve(...paths: string[]): string;
  export function normalize(p: string): string;
  export function relative(from: string, to: string): string;
  export function isAbsolute(p: string): boolean;
  export function dirname(p: string): string;
  export function basename(p: string, ext?: string): string;
  export function extname(p: string): string;
  export function parse(p: string): { root: string; dir: string; base: string; ext: string; name: string };
  export function format(pObj: any): string;
  export const sep: string;
  export const delimiter: string;
}
declare module 'path' { export * from 'node:path'; }
declare module 'node:os' {
  export function tmpdir(): string;
  export function homedir(): string;
  export function hostname(): string;
  export function platform(): string;
  export function arch(): string;
  export function cpus(): any[];
  export const EOL: string;
}
declare module 'os' { export * from 'node:os'; }
declare module 'node:zlib' {
  export function crc32(data: string | Uint8Array, value?: number): number;
  export function gzipSync(buf: string | Uint8Array): Buffer;
  export function gunzipSync(buf: Uint8Array): Buffer;
  export function deflateSync(buf: string | Uint8Array): Buffer;
  export function inflateSync(buf: Uint8Array): Buffer;
}
declare module 'zlib' { export * from 'node:zlib'; }
declare module 'node:http' {
  export class Agent { constructor(opts?: any); destroy(): void; }
  export function createServer(handler: (req: any, res: any) => void): any;
  export function request(options: any, callback?: (res: any) => void): any;
  export function get(options: any, callback?: (res: any) => void): any;
}
declare module 'http' { export * from 'node:http'; }
declare module 'node:https' { export * from 'node:http'; }
declare module 'https' { export * from 'node:http'; }
declare module 'node:net' {
  export class Socket { constructor(opts?: any); connect(...args: any[]): this; write(data: any): boolean; end(data?: any): this; destroy(): this; on(ev: string, cb: (...args: any[]) => void): this; }
  export class Server { listen(...args: any[]): this; close(cb?: () => void): this; on(ev: string, cb: (...args: any[]) => void): this; address(): any; }
  export function createServer(fn?: (socket: Socket) => void): Server;
  export function createConnection(...args: any[]): Socket;
}
declare module 'net' { export * from 'node:net'; }
declare module 'node:stream' {
  import { EventEmitter } from 'node:events';
  export class Stream extends EventEmitter { pipe<T>(dest: T): T; }
  export class Readable extends Stream { constructor(opts?: any); push(chunk: any): boolean; read(size?: number): any; }
  export class Writable extends Stream { constructor(opts?: any); write(chunk: any, cb?: any): boolean; end(chunk?: any, cb?: any): this; }
  export class Duplex extends Readable { write(chunk: any, cb?: any): boolean; end(chunk?: any, cb?: any): this; }
  export class Transform extends Duplex {}
  export class PassThrough extends Transform {}
  export function pipeline(...streams: any[]): any;
}
declare module 'stream' { export * from 'node:stream'; }
declare module 'node:util' {
  export function format(fmt: any, ...args: any[]): string;
  export function inspect(obj: any, opts?: any): string;
  export function promisify(fn: Function): (...args: any[]) => Promise<any>;
  export function callbackify(fn: Function): (...args: any[]) => void;
  export function inherits(ctor: any, superCtor: any): void;
  export const types: Record<string, (val: any) => boolean>;
  export class TextEncoder { encode(input?: string): Uint8Array; }
  export class TextDecoder { decode(input?: Uint8Array): string; }
}
declare module 'util' { export * from 'node:util'; }
declare module 'node:url' {
  export { URL, URLSearchParams };
  export function parse(urlStr: string, parseQueryString?: boolean): any;
  export function format(urlObj: any): string;
}
declare module 'url' { export * from 'node:url'; }
declare module 'node:querystring' {
  export function parse(str: string): Record<string, any>;
  export function stringify(obj: Record<string, any>): string;
}
declare module 'querystring' { export * from 'node:querystring'; }
declare module 'node:perf_hooks' {
  export const performance: { now(): number; timeOrigin: number; mark(name: string): void; measure(name: string, start?: string, end?: string): void };
}
declare module 'perf_hooks' { export * from 'node:perf_hooks'; }
declare module 'node:timers' {
  export { setTimeout, clearTimeout, setInterval, clearInterval, setImmediate, clearImmediate };
}
declare module 'timers' { export * from 'node:timers'; }
declare module 'node:timers/promises' {
  export function setTimeout<T = void>(delay?: number, value?: T): Promise<T>;
  export function setImmediate<T = void>(value?: T): Promise<T>;
}
declare module 'timers/promises' { export * from 'node:timers/promises'; }
declare module 'node:string_decoder' {
  export class StringDecoder { constructor(encoding?: string); write(buf: Uint8Array): string; end(buf?: Uint8Array): string; }
}
declare module 'string_decoder' { export * from 'node:string_decoder'; }
declare module 'node:dns' {
  export function lookup(hostname: string, cb: (err: any, address: string, family: number) => void): void;
  export function resolve(hostname: string, cb: (err: any, records: string[]) => void): void;
}
declare module 'dns' { export * from 'node:dns'; }
declare module 'node:child_process' {
  export function execSync(cmd: string, opts?: any): Buffer | string;
  export function spawn(cmd: string, args?: string[], opts?: any): any;
}
declare module 'child_process' { export * from 'node:child_process'; }
declare module 'node:buffer' { export { Buffer }; }
declare module 'buffer' { export { Buffer }; }
`;

  function escapeHtml(str) {
    if (str == null) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function formatErrorText(err) {
    if (!err) return '';
    if (typeof err === 'string') return err;
    if (typeof err === 'object') {
      const msg = err.message || err.name || '';
      const stack = err.stack || '';
      if (stack && (!msg || stack.includes(msg))) return String(stack);
      if (msg && stack) return `${msg}\n${stack}`;
      if (msg) return String(msg);
      try { return JSON.stringify(err, null, 2); } catch (_) { return String(err); }
    }
    return String(err);
  }

  function formatTestErrorHtml(err) {
    if (!err) return '';
    if (typeof err === 'string') {
      return `<div class="codelab-test-row__err">${escapeHtml(err)}</div>`;
    }
    const headline = err.message || err.name || 'Assertion failed';
    const hasDiff = err.expected !== undefined || err.actual !== undefined;
    const formatVal = v => {
      if (typeof v === 'string') return JSON.stringify(v);
      try { return JSON.stringify(v, null, 2); } catch (_) { return String(v); }
    };
    const diffHtml = hasDiff ? `
      <div class="codelab-test-diff">
        ${err.expected !== undefined ? `<div class="codelab-test-diff__line codelab-test-diff__expected"><span class="codelab-test-diff__label">Expected ${err.operator ? `(${escapeHtml(err.operator)})` : ''}:</span> <code>${escapeHtml(formatVal(err.expected))}</code></div>` : ''}
        ${err.actual !== undefined ? `<div class="codelab-test-diff__line codelab-test-diff__actual"><span class="codelab-test-diff__label">Actual:</span> <code>${escapeHtml(formatVal(err.actual))}</code></div>` : ''}
      </div>
    ` : '';
    const stackLines = String(err.stack || '')
      .split('\n')
      .filter(l => l.trim() && !l.includes(headline))
      .slice(0, 4)
      .join('\n');
    return `
      <div class="codelab-test-row__err">
        <div class="codelab-test-row__err-msg">${escapeHtml(headline)}</div>
        ${diffHtml}
        ${stackLines ? `<div class="codelab-test-row__err-stack">${escapeHtml(stackLines)}</div>` : ''}
      </div>
    `;
  }

  function renderSimpleMarkdown(md) {
    if (!md) return '';
    if (root.Renderer && typeof root.Renderer.convertMarkdownToHTML === 'function') {
      return root.Renderer.convertMarkdownToHTML(md);
    }
    const blocks = [];
    let html = String(md).replace(/```(\w+)?\n([\s\S]*?)```/g, (_, lang, code) => {
      const idx = blocks.length;
      blocks.push(`<pre><code class="lang-${lang || 'text'}">${escapeHtml(code.trim())}</code></pre>`);
      return `\x00BLOCK_${idx}\x00`;
    });
    html = html
      .replace(/^#### (.+)$/gm, '<h4>$1</h4>')
      .replace(/^### (.+)$/gm, '<h3>$1</h3>')
      .replace(/^## (.+)$/gm, '<h2>$1</h2>')
      .replace(/^# (.+)$/gm, '<h2>$1</h2>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/`([^`]+)`/g, '<code>$1</code>');
    const paras = html.split(/\n{2,}/).map(p => {
      const trimmed = p.trim();
      if (!trimmed) return '';
      if (/^<(h[2-4]|pre|ul|ol)/.test(trimmed) || /^\x00BLOCK_\d+\x00$/.test(trimmed)) return trimmed;
      if (/^[-*] /m.test(trimmed)) {
        const items = trimmed.split(/\n/).map(l => `<li>${l.replace(/^[-*]\s+/, '')}</li>`).join('');
        return `<ul>${items}</ul>`;
      }
      if (/^\d+\. /m.test(trimmed)) {
        const items = trimmed.split(/\n/).map(l => `<li>${l.replace(/^\d+\.\s+/, '')}</li>`).join('');
        return `<ol>${items}</ol>`;
      }
      return `<p>${trimmed.replace(/\n/g, '<br>')}</p>`;
    }).join('\n');
    return paras.replace(/\x00BLOCK_(\d+)\x00/g, (_, i) => blocks[Number(i)]);
  }

  // ── Singleton Monaco Loader ──────────────────────────────────────────────
  let monacoPromise = null;
  function loadMonaco(customBaseUrl) {
    const baseUrl = (customBaseUrl || MONACO_BASE).replace(/\/+$/, '');
    if (root.monaco && root.monaco.editor) return Promise.resolve(root.monaco);
    if (monacoPromise) return monacoPromise;

    monacoPromise = new Promise((resolve, reject) => {
      // Configure cross-origin Worker proxy via Blob URL
      root.MonacoEnvironment = {
        getWorkerUrl: function () {
          const blobCode = `
            self.MonacoEnvironment = { baseUrl: '${baseUrl}/' };
            importScripts('${baseUrl}/base/worker/workerMain.js');
          `;
          return URL.createObjectURL(new Blob([blobCode], { type: 'application/javascript' }));
        }
      };

      const configureMonaco = () => {
        const m = root.monaco;
        if (!m || !m.editor) {
          reject(new Error('Monaco failed to initialize'));
          return;
        }
        // Define custom themes synced with Ved Gupta Monochrome Neutral Design System (Geist)
        m.editor.defineTheme('codelab-dark', {
          base: 'vs-dark',
          inherit: true,
          rules: [
            { token: 'comment', foreground: '666666', fontStyle: 'italic' },
            { token: 'keyword', foreground: 'ff7b72' },
            { token: 'string', foreground: 'a5d6ff' },
            { token: 'number', foreground: '79c0ff' },
            { token: 'type', foreground: 'ffa657' }
          ],
          colors: {
            'editor.background': '#000000',
            'editor.foreground': '#f2f2f2',
            'editorGutter.background': '#000000',
            'editorLineNumber.foreground': '#525252',
            'editorLineNumber.activeForeground': '#ffffff',
            'editor.lineHighlightBackground': '#0a0a0a',
            'editor.lineHighlightBorder': '#171717',
            'editor.selectionBackground': '#262626',
            'editor.inactiveSelectionBackground': '#171717',
            'editorCursor.foreground': '#ffffff',
            'editorIndentGuide.background1': '#171717',
            'editorIndentGuide.activeBackground1': '#262626',
            'editorWidget.background': '#0a0a0a',
            'editorWidget.border': '#262626',
            'editorHoverWidget.background': '#0a0a0a',
            'editorHoverWidget.border': '#262626',
            'scrollbarSlider.background': '#26262680',
            'scrollbarSlider.hoverBackground': '#404040aa'
          }
        });

        m.editor.defineTheme('codelab-light', {
          base: 'vs',
          inherit: true,
          rules: [
            { token: 'comment', foreground: '666666', fontStyle: 'italic' }
          ],
          colors: {
            'editor.background': '#ffffff',
            'editor.foreground': '#0a0a0a',
            'editorGutter.background': '#ffffff',
            'editorLineNumber.foreground': '#8f8f8f',
            'editorLineNumber.activeForeground': '#0a0a0a',
            'editor.lineHighlightBackground': '#fafafa',
            'editor.lineHighlightBorder': '#f5f5f5',
            'editor.selectionBackground': '#e5e5e5',
            'editor.inactiveSelectionBackground': '#f5f5f5',
            'editorCursor.foreground': '#000000',
            'editorIndentGuide.background1': '#f0f0f0',
            'editorIndentGuide.activeBackground1': '#d4d4d4',
            'editorWidget.background': '#fafafa',
            'editorWidget.border': '#e5e5e5',
            'editorHoverWidget.background': '#fafafa',
            'editorHoverWidget.border': '#e5e5e5'
          }
        });

        // Configure TS/JS defaults & ambient Node types
        if (m.languages && m.languages.typescript) {
          const tsDefaults = m.languages.typescript.typescriptDefaults;
          const jsDefaults = m.languages.typescript.javascriptDefaults;
          const compilerOpts = {
            target: m.languages.typescript.ScriptTarget.ES2020,
            module: m.languages.typescript.ModuleKind.CommonJS,
            moduleResolution: m.languages.typescript.ModuleResolutionKind.NodeJs,
            allowNonTsExtensions: true,
            allowJs: true,
            checkJs: false,
            strict: false,
            noEmit: true,
            esModuleInterop: true
          };
          tsDefaults.setCompilerOptions(compilerOpts);
          jsDefaults.setCompilerOptions(compilerOpts);
          tsDefaults.setDiagnosticsOptions({ noSemanticValidation: false, noSyntaxValidation: false });
          jsDefaults.setDiagnosticsOptions({ noSemanticValidation: true, noSyntaxValidation: false });
          tsDefaults.addExtraLib(NODE_AMBIENT_DTS, 'file:///node-ambient.d.ts');
          jsDefaults.addExtraLib(NODE_AMBIENT_DTS, 'file:///node-ambient.d.ts');
        }

        resolve(m);
      };

      if (root.require && typeof root.require.config === 'function') {
        root.require.config({ paths: { vs: baseUrl } });
        root.require(['vs/editor/editor.main'], configureMonaco, reject);
        return;
      }

      const loaderScript = document.createElement('script');
      loaderScript.src = `${baseUrl}/loader.js`;
      loaderScript.async = true;
      loaderScript.onload = () => {
        if (root.require && typeof root.require.config === 'function') {
          root.require.config({ paths: { vs: baseUrl } });
          root.require(['vs/editor/editor.main'], configureMonaco, reject);
        } else {
          reject(new Error('AMD loader unavailable'));
        }
      };
      loaderScript.onerror = () => {
        monacoPromise = null;
        reject(new Error('Failed to load Monaco from CDN'));
      };
      document.head.appendChild(loaderScript);
    });

    return monacoPromise;
  }

  // Helper to convert JS file set to TS file set if explicit TS files aren't provided
  function mapFilesToLanguage(filesObj, lang, explicitTsFiles) {
    if (lang === 'ts' && explicitTsFiles && Object.keys(explicitTsFiles).length > 0) {
      return { ...explicitTsFiles };
    }
    const out = {};
    for (const [name, content] of Object.entries(filesObj || {})) {
      if (lang === 'ts' && name.endsWith('.js')) {
        const tsName = name.replace(/\.js$/, '.ts');
        // Update local require('.xyz.js') references so they resolve cleanly
        const tsContent = String(content).replace(/require\((['"])(\.[^'"]+?)\.js\1\)/g, 'require($1$2.ts$1)');
        out[tsName] = tsContent;
      } else {
        out[name] = content;
      }
    }
    return out;
  }

  const DEFAULT_STANDALONE_FILES = {
    'index.js': `'use strict';\n\nfunction solve(input) {\n  return input;\n}\n\nmodule.exports = { solve };\n`,
    'demo.js': `'use strict';\nconst { solve } = require('./index.js');\n\nconsole.log('Demo output:', solve({ status: 'ok', timestamp: Date.now() }));\n`,
    'test.js': `'use strict';\nconst { describe, it } = require('node:test');\nconst assert = require('node:assert/strict');\nconst { solve } = require('./index.js');\n\ndescribe('Standalone Sandbox', () => {\n  it('returns the input payload', () => {\n    assert.deepEqual(solve({ a: 1 }), { a: 1 });\n  });\n});\n`
  };

  const CL_ICONS = {
    arrowLeft: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>',
    target: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>',
    code: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>',
    play: '<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><polygon points="6 4 20 12 6 20 6 4"/></svg>',
    stop: '<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><rect x="5" y="5" width="14" height="14" rx="2"/></svg>',
    check: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',
    lightbulb: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></svg>',
    list: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>',
    book: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>',
    file: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>',
    terminal: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>',
    database: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>',
    globe: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>',
    package: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m16.5 9.4-9-5.19"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.29 7 12 12 20.71 7"/><line x1="12" y1="22" x2="12" y2="12"/></svg>',
    chevronsUpDown: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m7 15 5 5 5-5"/><path d="m7 9 5-5 5 5"/></svg>',
    chevronDown: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>',
    chevronRight: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>',
    folder: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>',
    plus: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>',
    edit: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>',
    trash: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>',
    box: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.29 7 12 12 20.71 7"/><line x1="12" y1="22" x2="12" y2="12"/></svg>',
    search: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>',
    diff: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="3" x2="12" y2="21"/><path d="M8 8H4v8h4"/><path d="M16 8h4v8h-4"/></svg>',
    command: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 3a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3H6a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3V6a3 3 0 0 0-3-3 3 3 0 0 0-3 3 3 3 0 0 0 3 3h12a3 3 0 0 0 3-3 3 3 0 0 0-3-3z"/></svg>',
    download: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>'
  };

  let _workbenchInstanceCounter = 0;
  const _fallbackStorage = new Map();

  function safeStorageGet(key) {
    try {
      if (typeof localStorage !== 'undefined' && localStorage !== null) {
        return localStorage.getItem(key);
      }
    } catch (_) {}
    return _fallbackStorage.has(key) ? _fallbackStorage.get(key) : null;
  }

  function safeStorageSet(key, value) {
    const str = String(value);
    try {
      if (typeof localStorage !== 'undefined' && localStorage !== null) {
        localStorage.setItem(key, str);
        return;
      }
    } catch (_) {}
    _fallbackStorage.set(key, str);
  }

  // ── CodeLabWorkbench Instance Class ──────────────────────────────────────
  class CodeLabWorkbench {
    constructor(container, options = {}) {
      this.container = typeof container === 'string' ? document.querySelector(container) : container;
      if (!this.container) {
        throw new Error('CodeLabWorkbench requires a valid DOM container element.');
      }
      this.options = options || {};
      this.instanceId = options.instanceId || (`cl-${++_workbenchInstanceCounter}`);
      this.labId = options.id || options.labId || options.buildId || 'custom-lab';
      this.title = options.title || this.labId;
      this.summary = options.summary || '';
      this.monacoUrl = options.monacoUrl || MONACO_BASE;
      this.themeOption = options.theme || 'auto'; // 'dark' | 'light' | 'auto'
      this.explicitEntry = options.entry || null;
      this.explicitTestEntry = options.testEntry || null;
      this.backLabel = options.backLabel || 'Back to Build Guide';
      this._eventListeners = new Map();

      // Callbacks
      this.onStepComplete = typeof options.onStepComplete === 'function' ? options.onStepComplete : null;
      this.onLabComplete = typeof options.onLabComplete === 'function' ? options.onLabComplete : null;
      this.onRun = typeof options.onRun === 'function' ? options.onRun : null;
      this.onTestResult = typeof options.onTestResult === 'function' ? options.onTestResult : null;
      this.onCodeChange = typeof options.onCodeChange === 'function' ? options.onCodeChange : null;
      this.onClose = typeof options.onClose === 'function' ? options.onClose : null;

      // Pull reference files from options or optional host adapters (window.IMPLEMENTATIONS_DATA / window.GUIDED_LABS_DATA)
      const implData = root.IMPLEMENTATIONS_DATA?.[this.labId];
      const guidedData = root.GUIDED_LABS_DATA?.[this.labId];

      const rawRefFiles = options.solutionFiles || options.files || implData?.files || {};
      this.referenceFiles = Object.keys(rawRefFiles).length > 0 ? { ...rawRefFiles } : { ...DEFAULT_STANDALONE_FILES };

      this.guidedConfig = {
        ...(guidedData || {}),
        ...(options.guided || {}),
        ...(options.starterFiles ? { starterFiles: options.starterFiles } : {}),
        ...(options.tsStarterFiles ? { tsStarterFiles: options.tsStarterFiles } : {}),
        ...(options.tsSolutionFiles ? { tsSolutionFiles: options.tsSolutionFiles } : {})
      };
      this.steps = options.steps || this.guidedConfig?.steps || [];

      // Load saved user state from localStorage (with in-memory fallback)
      this.savedState = this._loadState();

      this.mode = options.mode || this.savedState.mode || (this.steps.length > 0 ? 'guided' : 'sandbox');
      this.lang = options.language || options.lang || this.savedState.lang || 'js';
      this.activeStepIndex = typeof options.stepIndex === 'number' ? options.stepIndex : (this.savedState.activeStepIndex || 0);
      if (this.activeStepIndex >= this.steps.length || this.activeStepIndex < 0) this.activeStepIndex = 0;

      this.completedSteps = new Set(this.savedState.completedSteps || []);
      this.folders = new Set(this.savedState?.folders || []);
      this.collapsedFolders = new Set(this.savedState?.collapsedFolders || []);
      this.creatingItem = null; // { type: 'file' | 'folder', parentFolder: string } | null
      this.renamingItem = null;
      this._draggedFile = null;
      this.guideTab = 'steps'; // 'steps' | 'readme'
      this.drawerTab = 'tests'; // 'tests' | 'terminal' | 'inspector'
      this.isFullscreen = false;
      this.isRunning = false;
      this.isCreatingFile = false;
      this.contextMenuOpen = false;
      this._contextMenuItems = [];
      this.paletteOpen = false;
      this.paletteMode = 'commands';
      this.paletteSelectedIndex = 0;
      this._paletteFilteredItems = [];
      this._diffState = null;
      this._stepDecorations = [];
      this.cursorPos = { lineNumber: 1, column: 1 };
      this.lastRunDurationMs = null;
      this.runtimeStatusState = 'idle';
      this.runtimeStatusText = 'Node.js v22 Worker · Idle';

      // Initialize working files for current mode & language
      this.files = this._computeInitialFiles();

      // Auto-populate folders from nested files
      Object.keys(this.files).forEach(f => {
        const parts = f.split('/');
        for (let i = 1; i < parts.length; i++) {
          this.folders.add(parts.slice(0, i).join('/'));
        }
      });

      // Decouple openTabs from files
      if (Array.isArray(this.savedState?.openTabs)) {
        this.openTabs = this.savedState.openTabs.filter(f => this.files[f] !== undefined);
      } else {
        this.openTabs = this._orderedFileNames();
      }

      if (this.openTabs.length > 0) {
        if (this.savedState?.activeFile && this.openTabs.includes(this.savedState.activeFile)) {
          this.activeFile = this.savedState.activeFile;
        } else {
          const defaultPick = this._pickDefaultFile();
          this.activeFile = (defaultPick && this.openTabs.includes(defaultPick)) ? defaultPick : this.openTabs[0];
        }
      } else {
        this.activeFile = null;
      }

      // Execution state
      this.lastTestResults = [];
      this.terminalLogs = [
        { type: 'system', text: `[CodeLab] Virtual Node.js Runtime ready (${this.title}).` },
        { type: 'system', text: `Type "help", "node demo.js", "node test.js", "ls", or any JS/TS expression below.` }
      ];
      this.lastFsSnapshot = [];
      this.lastHttpTrace = [];

      // Editor instances
      this.monaco = null;
      this.editor = null;
      this.models = new Map();

      this._renderShell();
      this._bindEvents();
      this._initEditor();

      if (Array.isArray(options.plugins)) {
        for (const plugin of options.plugins) {
          this.use(plugin);
        }
      }
    }

    _emitEvent(name, detail) {
      const shortName = String(name).replace(/^codelab:/, '');
      const fullName = shortName === name ? `codelab:${name}` : name;
      if (this._eventListeners) {
        for (const key of new Set([name, shortName, fullName])) {
          const handlers = this._eventListeners.get(key);
          if (handlers) {
            for (const fn of Array.from(handlers)) {
              try { fn(detail); } catch (_) {}
            }
          }
        }
      }
      if (!this.container || typeof CustomEvent === 'undefined') return;
      try {
        this.container.dispatchEvent(new CustomEvent(fullName, { detail, bubbles: true, composed: true }));
        if (shortName !== fullName) {
          this.container.dispatchEvent(new CustomEvent(shortName, { detail, bubbles: true, composed: true }));
        }
      } catch (_) {}
    }

    _resolvedTheme() {
      if (this.themeOption === 'light' || this.themeOption === 'dark') {
        return this.themeOption;
      }
      if (typeof document !== 'undefined') {
        const docTheme = document.documentElement.getAttribute('data-theme');
        if (docTheme === 'light') return 'light';
      }
      return 'dark';
    }

    _storageKey() {
      return `${STORAGE_PREFIX}${this.labId}`;
    }

    _loadState() {
      if (this.options && this.options.persistState === false) {
        return {};
      }
      try {
        const raw = safeStorageGet(this._storageKey()) || safeStorageGet('sd_codelab_' + this.labId);
        return raw ? JSON.parse(raw) : {};
      } catch {
        return {};
      }
    }

    _saveState() {
      try {
        const key = `${this.mode}:${this.lang}`;
        const customFiles = (this.savedState && this.savedState.customFiles) || {};
        customFiles[key] = { ...this.files };
        const completedArr = Array.from(this.completedSteps);
        const state = {
          mode: this.mode,
          lang: this.lang,
          activeStepIndex: this.activeStepIndex,
          completedSteps: completedArr,
          customFiles,
          openTabs: Array.isArray(this.openTabs) ? [...this.openTabs] : undefined,
          activeFile: this.activeFile,
          folders: Array.from(this.folders || []),
          collapsedFolders: Array.from(this.collapsedFolders || [])
        };
        this.savedState = state;
        if (this.options && this.options.persistState === false) {
          return;
        }
        const serialized = JSON.stringify(state);
        safeStorageSet(this._storageKey(), serialized);
        // Sync with host app sidebar & build overview progress trackers
        safeStorageSet('codelab_progress_' + this.labId, JSON.stringify(completedArr));
        safeStorageSet('sd_codelab_' + this.labId, serialized);
      } catch {}
    }

    _detectPackages() {
      const builtins = new Set([
        'assert', 'assert/strict', 'buffer', 'child_process', 'crypto', 'dns',
        'events', 'fs', 'fs/promises', 'http', 'https', 'net', 'os', 'path',
        'perf_hooks', 'process', 'querystring', 'stream', 'string_decoder',
        'test', 'timers', 'timers/promises', 'url', 'util', 'zlib'
      ]);
      const npmSet = new Set();
      const builtinSet = new Set();
      let pkgJsonDeps = {};

      if (this.files['package.json']) {
        try {
          const parsed = JSON.parse(this.files['package.json']);
          pkgJsonDeps = { ...(parsed.dependencies || {}), ...(parsed.devDependencies || {}) };
          for (const [dep, ver] of Object.entries(pkgJsonDeps)) {
            npmSet.add(ver && ver !== '*' && ver !== 'latest' ? `${dep}@${String(ver).replace(/^[\^~]/, '')}` : dep);
          }
        } catch (_) {}
      }

      const reqRe = /\brequire\s*\(\s*(['"])([^'"]+)\1\s*\)/g;
      const impRe = /\b(?:import|export)\s+(?:[\s\S]*?\s+from\s+)?(['"])([^'"]+)\1/g;

      for (const [fname, content] of Object.entries(this.files || {})) {
        if (!/\.(js|ts|mjs|cjs)$/i.test(fname)) continue;
        const src = String(content || '');
        for (const regex of [reqRe, impRe]) {
          regex.lastIndex = 0;
          let m;
          while ((m = regex.exec(src)) !== null) {
            const spec = m[2].trim();
            if (!spec || spec.startsWith('.') || spec.startsWith('/')) continue;
            if (spec.startsWith('node:')) {
              builtinSet.add(spec);
            } else {
              const bare = spec.split('/').slice(0, spec.startsWith('@') ? 2 : 1).join('/');
              if (builtins.has(spec) || builtins.has(bare)) {
                builtinSet.add(`node:${spec}`);
              } else {
                npmSet.add(spec);
              }
            }
          }
        }
      }
      return {
        npmPackages: Array.from(npmSet),
        builtinModules: Array.from(builtinSet).sort(),
        pkgJsonDeps
      };
    }

    _setRuntimeStatus(state, text) {
      this.runtimeStatusState = state || 'idle';
      this.runtimeStatusText = text || 'Node.js v22 Worker · Idle';
      this._updateStatusBar();
    }

    _updateStatusBar() {
      const dotEl = this.container.querySelector('#cl-status-dot');
      const textEl = this.container.querySelector('#cl-status-text');
      const fileEl = this.container.querySelector('#cl-status-file');
      const durEl = this.container.querySelector('#cl-status-duration');
      const curEl = this.container.querySelector('#cl-status-cursor');
      const langEl = this.container.querySelector('#cl-status-lang');

      if (dotEl) {
        dotEl.className = 'codelab-statusbar__dot' +
          (this.runtimeStatusState === 'running' || this.runtimeStatusState === 'fetching' ? ' is-running' :
           this.runtimeStatusState === 'error' ? ' is-error' : '');
      }
      if (textEl) textEl.textContent = this.runtimeStatusText;
      if (fileEl) fileEl.textContent = this.activeFile || 'workspace';
      if (durEl) {
        if (typeof this.lastRunDurationMs === 'number' && !Number.isNaN(this.lastRunDurationMs)) {
          durEl.style.display = 'inline-flex';
          durEl.textContent = `⚡ ${this.lastRunDurationMs.toFixed(1)}ms`;
        } else {
          durEl.style.display = 'none';
        }
      }
      if (curEl && this.cursorPos) {
        curEl.textContent = `Ln ${this.cursorPos.lineNumber || 1}, Col ${this.cursorPos.column || 1}`;
      }
      if (langEl) {
        langEl.textContent = this.lang === 'ts' ? 'TypeScript 5.x' : 'JavaScript (CJS/ESM)';
      }
    }

    _getBaseFilesForModeAndLang(mode, lang) {
      const baseJsSolution = { ...this.referenceFiles };
      const baseJsStarter = {
        ...this.referenceFiles,
        ...(this.guidedConfig?.starterFiles || {})
      };
      if (mode === 'guided' && this.guidedConfig?.starterFiles) {
        return mapFilesToLanguage(baseJsStarter, lang, this.guidedConfig?.tsStarterFiles);
      }
      return mapFilesToLanguage(baseJsSolution, lang, this.guidedConfig?.tsSolutionFiles);
    }

    _isUserCreatedFile(filename) {
      const base = this._getBaseFilesForModeAndLang(this.mode, this.lang);
      return !Object.prototype.hasOwnProperty.call(base, filename);
    }

    _computeInitialFiles() {
      const key = `${this.mode}:${this.lang}`;
      const saved = this.savedState.customFiles?.[key];
      const base = this._getBaseFilesForModeAndLang(this.mode, this.lang);
      if (saved && Object.keys(saved).length > 0) {
        return { ...base, ...saved };
      }
      return base;
    }

    _pickDefaultFile() {
      const names = Object.keys(this.files);
      const ext = this.lang === 'ts' ? '.ts' : '.js';
      if (this.guidedConfig?.mainFile) {
        const mainCandidate = this.lang === 'ts'
          ? this.guidedConfig.mainFile.replace(/\.js$/, '.ts')
          : this.guidedConfig.mainFile;
        if (this.files[mainCandidate]) return mainCandidate;
      }
      const implFile = names.find(f =>
        f.endsWith(ext) &&
        !/(^|\/)(demo|test)\.(js|ts)$/i.test(f)
      );
      return implFile || names.find(f => !f.endsWith('.md')) || names[0] || '';
    }

    _findEntryFile(kind) {
      const names = Object.keys(this.files);
      if (kind === 'test' && this.explicitTestEntry) {
        const candidate = this.lang === 'ts' ? this.explicitTestEntry.replace(/\.js$/, '.ts') : this.explicitTestEntry;
        if (this.files[candidate]) return candidate;
        if (this.files[this.explicitTestEntry]) return this.explicitTestEntry;
      }
      if (kind === 'demo' && this.explicitEntry) {
        const candidate = this.lang === 'ts' ? this.explicitEntry.replace(/\.js$/, '.ts') : this.explicitEntry;
        if (this.files[candidate]) return candidate;
        if (this.files[this.explicitEntry]) return this.explicitEntry;
      }
      const pattern = kind === 'test' ? /(^|\/)test\.(js|ts)$/i : /(^|\/)demo\.(js|ts)$/i;
      const found = names.find(f => pattern.test(f));
      if (found) return found;
      if (kind === 'demo') {
        return names.find(f => /\.(js|ts)$/i.test(f) && !/(^|\/)test\.(js|ts)$/i.test(f)) || null;
      }
      return null;
    }

    _orderedFileNames() {
      const rank = f => (/readme/i.test(f) ? 3 : /package\.json$/i.test(f) ? 2.5 : /(^|\/)demo\./i.test(f) ? 1 : /(^|\/)test\./i.test(f) ? 2 : 0);
      return Object.keys(this.files).sort((a, b) => rank(a) - rank(b));
    }

    _updateRunStateUI() {
      const stopBtn = this.container.querySelector('#cl-stop-btn');
      if (stopBtn) {
        stopBtn.style.display = this.isRunning ? 'inline-flex' : 'none';
      }
      this.container.querySelectorAll('[data-cl-action="run-demo"], [data-cl-action="run-tests"], [data-cl-action="verify-step"]').forEach(btn => {
        btn.disabled = this.isRunning;
      });
    }

    // ── Render Workbench DOM ───────────────────────────────────────────────
    _renderShell() {
      if (this.themeOption !== 'auto') {
        this.container.setAttribute('data-theme', this.themeOption);
        this.container.classList.add(`codelab-workbench--${this.themeOption}`);
      }
      const themeAttr = this.themeOption !== 'auto' ? `data-theme="${escapeHtml(this.themeOption)}"` : '';
      const brandLabel = (this.title && this.title !== this.labId) ? this.title : 'CodeLab';
      this.container.innerHTML = `
        <div class="codelab codelab-workbench ${this.mode === 'sandbox' && !this.steps.length ? 'guide-collapsed' : ''}" id="codelab-${escapeHtml(this.labId)}" ${themeAttr}>
          <!-- Top Bar -->
          <div class="codelab-topbar codelab-toolbar">
            <div class="codelab-topbar__left">
              ${this.onClose ? `
                <button type="button" class="codelab-btn codelab-btn--back" data-cl-action="close-lab" title="${escapeHtml(this.backLabel)}">
                  ${CL_ICONS.arrowLeft}
                  <span>${escapeHtml(this.backLabel)}</span>
                </button>
              ` : ''}
              <span class="codelab-brand ${this.onClose ? 'codelab-brand--with-back' : ''}" title="${escapeHtml(brandLabel)}">
                <span class="codelab-brand__dot"></span>
                <span>${escapeHtml(brandLabel)}</span>
              </span>
              <span class="codelab-toolbar__sep" aria-hidden="true"></span>
              <div class="codelab-mode-switch" role="tablist" aria-label="Lab Mode">
                <button type="button" role="tab" aria-selected="${this.mode === 'guided'}" class="codelab-mode-btn ${this.mode === 'guided' ? 'active' : ''}" data-cl-mode="guided">
                  ${CL_ICONS.target}
                  <span>Guided Challenge</span>
                </button>
                <button type="button" role="tab" aria-selected="${this.mode === 'sandbox'}" class="codelab-mode-btn ${this.mode === 'sandbox' ? 'active' : ''}" data-cl-mode="sandbox">
                  ${CL_ICONS.code}
                  <span>Reference Sandbox</span>
                </button>
              </div>
              <div class="codelab-lang-switch" role="group" aria-label="Language Selector">
                <button type="button" class="codelab-lang-btn ${this.lang === 'js' ? 'active' : ''}" data-cl-lang="js" data-lang="js" aria-pressed="${this.lang === 'js'}">JS</button>
                <button type="button" class="codelab-lang-btn ${this.lang === 'ts' ? 'active' : ''}" data-cl-lang="ts" data-lang="ts" aria-pressed="${this.lang === 'ts'}">TS</button>
              </div>
            </div>

            <div class="codelab-topbar__right">
              <button type="button" class="codelab-btn codelab-btn--stop" id="cl-stop-btn" data-cl-action="stop-run" title="Stop Running Execution" style="display:none">
                ${CL_ICONS.stop}
                <span>Stop</span>
              </button>
              <button type="button" class="codelab-btn codelab-btn--run" data-cl-action="run-demo" title="Run demo.js (⌘+Shift+Enter)">
                ${CL_ICONS.play}
                <span>Run Demo</span>
                <span class="codelab-btn__kbd">⇧⌘↵</span>
              </button>
              <button type="button" class="codelab-btn codelab-btn--test" id="cl-primary-exec-btn" data-cl-action="${this.mode === 'guided' ? 'verify-step' : 'run-tests'}" title="${this.mode === 'guided' ? 'Verify Current Step (⌘+Enter)' : 'Run Test Suite (⌘+Enter)'}">
                ${CL_ICONS.check}
                <span>${this.mode === 'guided' ? 'Verify Step' : 'Run Tests'}</span>
                <span class="codelab-btn__kbd">⌘↵</span>
              </button>
              <span class="codelab-toolbar__sep" aria-hidden="true"></span>
              <button type="button" class="codelab-btn codelab-btn--icon" data-cl-action="toggle-guide" title="Toggle Guide Panel" aria-label="Toggle Guide Panel">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18"/></svg>
              </button>
              <button type="button" class="codelab-btn codelab-btn--icon" data-cl-action="toggle-drawer" title="Toggle Terminal Drawer" aria-label="Toggle Terminal Drawer">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 15h18"/></svg>
              </button>
              <button type="button" class="codelab-btn codelab-btn--icon" data-cl-action="toggle-fullscreen" title="Toggle Fullscreen IDE (Esc to exit)" aria-label="Toggle Fullscreen IDE">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>
              </button>
            </div>
          </div>

          <!-- Split Body -->
          <div class="codelab-body">
            <!-- Left Pane: Guided Instructions / README -->
            <aside class="codelab-guide codelab-pane-left" aria-label="Guided Lab Instructions">
              <div class="codelab-guide__tabs" role="tablist" aria-label="Guide View">
                <button type="button" role="tab" aria-selected="${this.guideTab === 'steps'}" class="codelab-guide__tab ${this.guideTab === 'steps' ? 'active' : ''}" data-cl-guidetab="steps">
                  ${CL_ICONS.list}
                  <span>Guided Steps (${this.steps.length})</span>
                </button>
                <button type="button" role="tab" aria-selected="${this.guideTab === 'readme'}" class="codelab-guide__tab ${this.guideTab === 'readme' ? 'active' : ''}" data-cl-guidetab="readme">
                  ${CL_ICONS.book}
                  <span>Architecture Brief</span>
                </button>
              </div>
              <div class="codelab-guide__stepper" id="cl-step-pills"></div>
              <div class="codelab-guide__content" id="cl-guide-content"></div>
              <div class="codelab-guide__footer" id="cl-guide-footer"></div>
            </aside>

            <!-- Interactive Vertical Splitter -->
            <div class="codelab-splitter-v" id="cl-splitter-v" role="separator" aria-orientation="vertical" title="Drag to resize guide panel (double-click to reset)"></div>

            <!-- Right Pane: File Explorer + Editor + Bottom Drawer -->
            <div class="codelab-main">
              <div class="codelab-workspace">
                <!-- File Explorer -->
                <div class="codelab-explorer" aria-label="Workspace Files">
                  <div class="codelab-explorer__header">
                    <span>Workspace</span>
                    <div class="codelab-explorer__actions">
                      <button type="button" class="codelab-explorer__btn" data-cl-action="new-file-root" title="New File" aria-label="New File">${CL_ICONS.plus}</button>
                      <button type="button" class="codelab-explorer__btn" data-cl-action="new-folder-root" title="New Folder" aria-label="New Folder">${CL_ICONS.folder}</button>
                    </div>
                    <span id="cl-explorer-lang">${this.lang.toUpperCase()}</span>
                  </div>
                  <div class="codelab-explorer__list" id="cl-explorer-list"></div>
                </div>

                <!-- Editor Column -->
                <div class="codelab-editor-col">
                  <div class="codelab-tabs codelab-file-tabs" id="cl-file-tabs" role="tablist" aria-label="Open Files"></div>
                  <div class="codelab-breadcrumbs" id="cl-breadcrumbs" aria-label="Editor Breadcrumbs"></div>
                  <div class="codelab-editor-wrap">
                    <div class="codelab-monaco-host" id="cl-monaco-host"></div>
                    <div class="codelab-fallback-wrap" id="cl-fallback-wrap" style="display:none">
                      <div class="codelab-fallback-gutter" id="cl-fallback-gutter" aria-hidden="true">1</div>
                      <textarea class="codelab-fallback-editor" id="cl-fallback-editor" spellcheck="false" aria-label="Code Editor"></textarea>
                    </div>
                    <div class="codelab-md-preview prose" id="cl-md-preview" style="display:none"></div>
                    <div class="codelab-empty-editor" id="cl-empty-editor" style="display:none"></div>
                  </div>
                </div>
              </div>

              <!-- Interactive Horizontal Splitter -->
              <div class="codelab-splitter-h" id="cl-splitter-h" role="separator" aria-orientation="horizontal" title="Drag to resize console drawer (double-click to reset)"></div>

              <!-- Bottom Drawer -->
              <div class="codelab-drawer codelab-bottom" id="cl-drawer">
                <div class="codelab-drawer__bar">
                  <div class="codelab-drawer__tabs" role="tablist" aria-label="Execution Output Panels">
                    <button type="button" role="tab" aria-selected="${this.drawerTab === 'tests'}" class="codelab-drawer__tab ${this.drawerTab === 'tests' ? 'active' : ''}" data-cl-drawertab="tests">
                      ${CL_ICONS.check}
                      <span>Test Suite</span>
                      <span class="codelab-drawer__pill" id="cl-test-pill">Ready</span>
                    </button>
                    <button type="button" role="tab" aria-selected="${this.drawerTab === 'terminal'}" class="codelab-drawer__tab ${this.drawerTab === 'terminal' ? 'active' : ''}" data-cl-drawertab="terminal">
                      ${CL_ICONS.terminal}
                      <span>Terminal &amp; REPL</span>
                    </button>
                    <button type="button" role="tab" aria-selected="${this.drawerTab === 'inspector'}" class="codelab-drawer__tab ${this.drawerTab === 'inspector' ? 'active' : ''}" data-cl-drawertab="inspector">
                      ${CL_ICONS.database}
                      <span>Virtual Disk &amp; HTTP</span>
                      <span class="codelab-drawer__pill" id="cl-vfs-pill">0 files</span>
                    </button>
                  </div>
                  <div style="display:flex;align-items:center;gap:6px;">
                    <button type="button" class="codelab-btn codelab-btn--icon" data-cl-action="clear-terminal" title="Clear Output" style="padding:2px 6px;font-size:11px;">Clear</button>
                    <button type="button" class="codelab-btn codelab-btn--icon" data-cl-action="toggle-drawer" title="Minimize/Expand Drawer" aria-label="Minimize or Expand Drawer" style="padding:2px 6px;font-size:11px;">${CL_ICONS.chevronsUpDown}</button>
                  </div>
                </div>
                <div class="codelab-drawer__body" id="cl-drawer-body"></div>
              </div>
            </div>
          </div>

          <!-- Status Bar Footer -->
          <footer class="codelab-statusbar" id="cl-statusbar" role="status" aria-live="polite">
            <div class="codelab-statusbar__left">
              <span class="codelab-statusbar__item" id="cl-status-runtime">
                <span class="codelab-statusbar__dot" id="cl-status-dot"></span>
                <span id="cl-status-text">Node.js v22 Worker · Idle</span>
              </span>
              <span class="codelab-statusbar__sep">·</span>
              <span class="codelab-statusbar__item" id="cl-status-file">${escapeHtml(this.activeFile || 'workspace')}</span>
            </div>
            <div class="codelab-statusbar__right">
              <span class="codelab-statusbar__item" id="cl-status-duration" style="display:none"></span>
              <span class="codelab-statusbar__item" id="cl-status-cursor">Ln 1, Col 1</span>
              <span class="codelab-statusbar__sep">·</span>
              <span class="codelab-statusbar__item">UTF-8</span>
              <span class="codelab-statusbar__sep">·</span>
              <span class="codelab-statusbar__item" id="cl-status-lang">${this.lang === 'ts' ? 'TypeScript 5.x' : 'JavaScript (CJS/ESM)'}</span>
            </div>
          </footer>

          <!-- Solution, Diff, Command Palette & Packages Modal Container -->
          <div id="cl-modal-slot"></div>
          <div id="cl-context-menu-slot"></div>
        </div>
      `;

      this._renderStepPills();
      this._renderGuidePane();
      this._renderFileLists();
      this._renderBreadcrumbs();
      this._renderDrawerBody();
      this._updateStatusBar();
      this._updateRunStateUI();
    }

    _detectActiveSymbol(filePath) {
      if (!filePath || !this.files || typeof this.files[filePath] !== 'string') return '';
      if (this.mode === 'guided' && this.steps && this.steps.length > 0) {
        const step = this.steps[this.activeStepIndex];
        if (step) {
          const rawTarget = step.targetFile || '';
          const stepTarget = this.lang === 'ts' && rawTarget ? rawTarget.replace(/\.js$/, '.ts') : rawTarget;
          if ((!stepTarget || stepTarget === filePath) && (step.targetSymbol || step.symbol)) {
            return String(step.targetSymbol || step.symbol);
          }
        }
      }
      const code = this.files[filePath];
      const classMatch = code.match(/\bclass\s+([A-Za-z_$][A-Za-z0-9_$]*)/);
      if (classMatch) return classMatch[1];
      const fnMatch = code.match(/\b(?:async\s+)?function\s+([A-Za-z_$][A-Za-z0-9_$]*)/);
      if (fnMatch) return fnMatch[1];
      return '';
    }

    _renderBreadcrumbs() {
      const host = this.container.querySelector('#cl-breadcrumbs');
      if (!host) return;

      let pathHtml = `<button type="button" class="codelab-breadcrumb__item codelab-breadcrumb__root" data-action="command-palette-files" data-cl-action="command-palette-files" title="Quick Open File (⌘P)">workspace</button>`;

      if (this.activeFile) {
        const segments = this.activeFile.split('/');
        for (let i = 0; i < segments.length - 1; i++) {
          const folderPath = segments.slice(0, i + 1).join('/');
          pathHtml += `<span class="codelab-breadcrumb__sep" aria-hidden="true">›</span>`;
          pathHtml += `<button type="button" class="codelab-breadcrumb__item codelab-breadcrumb__folder" data-cl-breadcrumb-folder="${escapeHtml(folderPath)}" data-folder="${escapeHtml(folderPath)}">${escapeHtml(segments[i])}</button>`;
        }
        const fileName = segments[segments.length - 1];
        pathHtml += `<span class="codelab-breadcrumb__sep" aria-hidden="true">›</span>`;
        pathHtml += `<button type="button" class="codelab-breadcrumb__item codelab-breadcrumb__file active" data-cl-breadcrumb-file="${escapeHtml(this.activeFile)}" data-file="${escapeHtml(this.activeFile)}">${escapeHtml(fileName)}</button>`;

        const symbol = this._detectActiveSymbol(this.activeFile);
        if (symbol) {
          pathHtml += `<span class="codelab-breadcrumb__sep" aria-hidden="true">›</span>`;
          pathHtml += `<span class="codelab-breadcrumb__symbol" data-cl-breadcrumb-symbol="${escapeHtml(symbol)}">ƒ ${escapeHtml(symbol)}</span>`;
        }
      }

      host.innerHTML = `
        <div class="codelab-breadcrumbs__path">${pathHtml}</div>
        <div class="codelab-breadcrumbs__actions">
          <button type="button" class="codelab-breadcrumb__btn" data-action="compare-diff" data-cl-action="compare-diff" title="Compare Active File with Solution">
            ${CL_ICONS.diff}
            <span>Compare Diff</span>
          </button>
          <button type="button" class="codelab-breadcrumb__btn" data-action="command-palette" data-cl-action="command-palette" title="Open Command Palette (⌘⇧P)">
            ${CL_ICONS.command}
            <span>Command Palette</span>
            <kbd class="codelab-breadcrumb__kbd">⌘⇧P</kbd>
          </button>
          <button type="button" class="codelab-breadcrumb__btn" data-action="export-workspace" data-cl-action="export-workspace" title="Export Workspace Snapshot">
            ${CL_ICONS.download}
            <span>Export</span>
          </button>
        </div>
      `;
    }

    _renderStepPills() {
      const host = this.container.querySelector('#cl-step-pills');
      if (!host) return;
      if (!this.steps.length || this.guideTab === 'readme' || this.mode === 'sandbox') {
        host.innerHTML = '';
        host.style.display = 'none';
        return;
      }
      host.style.display = '';

      const existingPills = host.querySelectorAll('.codelab-step-pill');
      if (existingPills.length === this.steps.length) {
        existingPills.forEach((pill, idx) => {
          const step = this.steps[idx];
          const passed = step && this.completedSteps.has(step.id);
          const active = idx === this.activeStepIndex;
          pill.classList.toggle('active', active);
          pill.classList.toggle('passed', !!passed);
          pill.setAttribute('aria-selected', String(active));
          const numSpan = pill.querySelector('.codelab-step-pill__num');
          if (numSpan) numSpan.textContent = passed ? '✓' : String(idx + 1);
        });
        return;
      }

      host.innerHTML = `<div class="codelab-step-pills" role="tablist" aria-label="Guided Steps">
        ${this.steps.map((step, idx) => {
          const passed = this.completedSteps.has(step.id);
          const active = idx === this.activeStepIndex;
          return `<button type="button" role="tab" aria-selected="${active}" class="codelab-step-pill ${active ? 'active' : ''} ${passed ? 'passed' : ''}" data-cl-step="${idx}">
            <span class="codelab-step-pill__num">${passed ? '✓' : idx + 1}</span>
            <span class="codelab-step-pill__label">Step ${idx + 1}</span>
          </button>`;
        }).join('')}
      </div>`;
    }

    _renderGuidePane() {
      const contentEl = this.container.querySelector('#cl-guide-content');
      const footerEl = this.container.querySelector('#cl-guide-footer');
      if (!contentEl || !footerEl) return;

      // Update tab active states
      this.container.querySelectorAll('[data-cl-guidetab]').forEach(btn => {
        const isActive = btn.dataset.clGuidetab === this.guideTab;
        btn.classList.toggle('active', isActive);
        btn.setAttribute('aria-selected', String(isActive));
      });

      this._renderStepPills();

      if (this.guideTab === 'readme' || !this.steps.length) {
        const readmeContent = this.files['README.md'] || this.referenceFiles['README.md'] || this.summary || 'No architecture brief available.';
        contentEl.innerHTML = `<div class="codelab-guide-prose">${renderSimpleMarkdown(readmeContent)}</div>`;
        footerEl.innerHTML = `
          <div class="codelab-guide__footer-row codelab-guide__footer-row--secondary">
            <button type="button" class="codelab-btn codelab-btn--subtle" data-cl-action="run-tests" title="Run full test suite (⌘+Enter)">
              ${CL_ICONS.check}
              <span>All Tests</span>
            </button>
            <button type="button" class="codelab-btn codelab-btn--subtle" data-cl-action="show-diff" title="Compare with Reference Solution">
              ${CL_ICONS.lightbulb}
              <span>Solution</span>
            </button>
            <button type="button" class="codelab-btn codelab-btn--subtle" data-cl-action="reset-lab" title="Reset Lab Code to Starter State">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
              <span>Reset</span>
            </button>
          </div>
          ${this.steps.length ? `
            <div class="codelab-guide__footer-row">
              <button type="button" class="codelab-btn" data-cl-guidetab="steps" style="width:100%;">Back to Steps →</button>
            </div>
          ` : `
            <div class="codelab-guide__footer-row">
              <span style="font-size:11.5px;color:var(--cl-fg-muted);">100% In-Browser Web Worker Sandbox</span>
            </div>
          `}
        `;
        return;
      }

      const step = this.steps[this.activeStepIndex] || this.steps[0];
      const isStepPassed = this.completedSteps.has(step.id);
      const targetFile = this.lang === 'ts' && step.targetFile ? step.targetFile.replace(/\.js$/, '.ts') : (step.targetFile || this._pickDefaultFile());
      const progressPct = Math.round((this.completedSteps.size / Math.max(1, this.steps.length)) * 100);

      // Match step test results
      const stepResultsMap = new Map(this.lastTestResults.map(r => [r.name, r]));

      contentEl.innerHTML = `
        <div class="codelab-step-header">
          <div class="codelab-step-progress-bar" title="${this.completedSteps.size} of ${this.steps.length} steps completed">
            <div class="codelab-step-progress-bar__fill" style="width:${progressPct}%"></div>
          </div>
          <div class="codelab-step-eyebrow">
            <span>Step ${this.activeStepIndex + 1} of ${this.steps.length}</span>
            <span class="codelab-step-status ${isStepPassed ? 'passed' : ''}">${isStepPassed ? '✓ Completed' : 'In Progress'}</span>
          </div>
          <div class="codelab-step-title">${escapeHtml(step.title)}</div>
          ${targetFile ? `
            <button type="button" class="codelab-step-target" data-cl-jump-file="${escapeHtml(targetFile)}" data-cl-jump-symbol="${escapeHtml(step.targetSymbol || '')}">
              ${CL_ICONS.file}
              <span>${escapeHtml(targetFile)}</span>
              ${step.targetSymbol ? `<span style="opacity:0.75">→ ${escapeHtml(step.targetSymbol)}</span>` : ''}
            </button>
          ` : ''}
        </div>

        ${step.concept ? `
          <div class="codelab-step-concept">
            <div class="codelab-step-concept__label">Architecture Concept</div>
            <div>${escapeHtml(step.concept)}</div>
          </div>
        ` : ''}

        <div class="codelab-guide-prose">
          ${renderSimpleMarkdown(step.instructions)}
        </div>

        ${Array.isArray(step.testNames) && step.testNames.length ? `
          <div class="codelab-step-checks">
            <div class="codelab-step-checks__title">Step Verification Tests (${step.testNames.length})</div>
            ${step.testNames.map(tName => {
              const res = stepResultsMap.get(tName);
              const statusClass = res ? (res.status === 'pass' ? 'pass' : 'fail') : '';
              const icon = res ? (res.status === 'pass' ? '✓' : '✖') : '○';
              return `
                <div class="codelab-check-item ${statusClass}">
                  <span class="codelab-check-icon">${icon}</span>
                  <span>${escapeHtml(tName)}</span>
                </div>
              `;
            }).join('')}
          </div>
        ` : ''}

        ${step.hint ? `
          <div class="codelab-hint-box" id="cl-hint-box">
            <button type="button" class="codelab-hint-toggle" data-cl-action="toggle-hint">
              <span style="display:inline-flex;align-items:center;gap:6px;">${CL_ICONS.lightbulb}<span>Need a hint for Step ${this.activeStepIndex + 1}?</span></span>
              <span>Show ▾</span>
            </button>
            <div class="codelab-hint-body codelab-guide-prose">
              ${renderSimpleMarkdown(step.hint)}
            </div>
          </div>
        ` : ''}
      `;

      const hasPrev = this.activeStepIndex > 0;
      const hasNext = this.activeStepIndex < this.steps.length - 1;
      footerEl.innerHTML = `
        <div class="codelab-guide__footer-row">
          <button type="button" class="codelab-btn" data-cl-step="${this.activeStepIndex - 1}" ${!hasPrev ? 'disabled' : ''}>← Prev</button>
          <button type="button" class="codelab-btn codelab-btn--test" data-cl-action="verify-step">
            ${CL_ICONS.check}
            <span>Verify Step ${this.activeStepIndex + 1}</span>
          </button>
          <button type="button" class="codelab-btn" data-cl-step="${this.activeStepIndex + 1}" ${!hasNext ? 'disabled' : ''}>Next →</button>
        </div>
        <div class="codelab-guide__footer-row codelab-guide__footer-row--secondary">
          <button type="button" class="codelab-btn codelab-btn--subtle" data-cl-action="run-tests" title="Run full test suite across all steps (⌘+Enter)">
            ${CL_ICONS.check}
            <span>All Tests</span>
          </button>
          <button type="button" class="codelab-btn codelab-btn--subtle" data-cl-action="show-diff" title="Compare with Reference Solution">
            ${CL_ICONS.lightbulb}
            <span>Solution</span>
          </button>
          <button type="button" class="codelab-btn codelab-btn--subtle" data-cl-action="reset-lab" title="Reset Lab Code to Starter State">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
            <span>Reset</span>
          </button>
        </div>
      `;
    }

    _buildFileTree() {
      const rootNode = {
        name: '',
        fullPath: '',
        folders: new Map(),
        files: new Map()
      };

      const getOrCreateDirNode = (dirPath) => {
        if (!dirPath) return rootNode;
        const segments = dirPath.split('/');
        let current = rootNode;
        let runningPath = '';
        for (const seg of segments) {
          runningPath = runningPath ? `${runningPath}/${seg}` : seg;
          if (!current.folders.has(seg)) {
            current.folders.set(seg, {
              name: seg,
              fullPath: runningPath,
              folders: new Map(),
              files: new Map()
            });
          }
          current = current.folders.get(seg);
        }
        return current;
      };

      if (this.folders) {
        for (const folder of this.folders) {
          if (folder) getOrCreateDirNode(folder);
        }
      }

      for (const filePath of this._orderedFileNames()) {
        const lastSlash = filePath.lastIndexOf('/');
        if (lastSlash === -1) {
          rootNode.files.set(filePath, filePath);
        } else {
          const dirPath = filePath.slice(0, lastSlash);
          const baseName = filePath.slice(lastSlash + 1);
          const dirNode = getOrCreateDirNode(dirPath);
          dirNode.files.set(baseName, filePath);
        }
      }

      return rootNode;
    }

    _renderFileLists() {
      const explorerEl = this.container.querySelector('#cl-explorer-list');
      const tabsEl = this.container.querySelector('#cl-file-tabs');
      const explorerLangEl = this.container.querySelector('#cl-explorer-lang');
      if (explorerLangEl) explorerLangEl.textContent = this.lang.toUpperCase();
      if (!explorerEl || !tabsEl) return;

      const treeRoot = this._buildFileTree();
      let treeHtml = '';

      const renderNode = (node, depth) => {
        const sortedFolders = Array.from(node.folders.values()).sort((a, b) => a.name.localeCompare(b.name));
        for (const fNode of sortedFolders) {
          const isCollapsed = this.collapsedFolders.has(fNode.fullPath);
          const indent = depth * 14 + 10;
          treeHtml += `
            <div class="codelab-folder-item ${isCollapsed ? 'collapsed' : 'expanded'}" data-cl-folder="${escapeHtml(fNode.fullPath)}" data-folder="${escapeHtml(fNode.fullPath)}" data-cl-drop-folder="${escapeHtml(fNode.fullPath)}" data-depth="${depth}" style="padding-left: ${indent}px;">
              <button type="button" class="codelab-chevron" data-cl-action="toggle-folder" data-cl-folder="${escapeHtml(fNode.fullPath)}" title="${isCollapsed ? 'Expand folder' : 'Collapse folder'}" aria-label="${isCollapsed ? 'Expand folder' : 'Collapse folder'}">
                ${isCollapsed ? CL_ICONS.chevronRight : CL_ICONS.chevronDown}
              </button>
              <span class="codelab-folder-icon">${CL_ICONS.folder}</span>
              <span class="codelab-folder-name" title="${escapeHtml(fNode.name)}">${escapeHtml(fNode.name)}</span>
              <div class="codelab-node-actions">
                <button type="button" class="codelab-node-action" data-cl-action="new-file-folder" data-cl-folder="${escapeHtml(fNode.fullPath)}" title="New File in ${escapeHtml(fNode.name)}">${CL_ICONS.plus}</button>
                <button type="button" class="codelab-node-action" data-cl-action="new-folder-folder" data-cl-folder="${escapeHtml(fNode.fullPath)}" title="New Folder in ${escapeHtml(fNode.name)}">${CL_ICONS.folder}</button>
                <button type="button" class="codelab-node-action" data-cl-action="delete-folder" data-cl-folder="${escapeHtml(fNode.fullPath)}" title="Delete Folder">${CL_ICONS.trash}</button>
              </div>
            </div>
          `;

          if (this.creatingItem && this.creatingItem.parentFolder === fNode.fullPath && !isCollapsed) {
            const createIndent = (depth + 1) * 14 + 10;
            treeHtml += `
              <div class="codelab-tree-create-row" style="padding-left: ${createIndent}px;">
                <span class="codelab-tree-create-icon">${this.creatingItem.type === 'folder' ? CL_ICONS.folder : CL_ICONS.file}</span>
                <input type="text" id="cl-tree-create-input" class="codelab-tree-input" placeholder="${this.creatingItem.type === 'folder' ? 'folder-name' : 'filename.' + this.lang}" autocomplete="off" spellcheck="false" />
              </div>
            `;
          }

          if (!isCollapsed) {
            renderNode(fNode, depth + 1);
          }
        }

        const sortedFiles = Array.from(node.files.entries()).sort((a, b) => a[0].localeCompare(b[0]));
        for (const [baseName, fullPath] of sortedFiles) {
          const isActive = fullPath === this.activeFile;
          const badge = fullPath.endsWith('.md') ? 'DOC' : fullPath.endsWith('.json') ? 'PKG' : /(^|\/)test\./i.test(fullPath) ? 'TEST' : /(^|\/)demo\./i.test(fullPath) ? 'DEMO' : 'SRC';
          const ext = fullPath.endsWith('.ts') ? 'ts' : fullPath.endsWith('.js') ? 'js' : fullPath.endsWith('.json') ? 'json' : fullPath.endsWith('.md') ? 'md' : 'txt';
          const fileIcon = ext === 'json' ? CL_ICONS.database : ext === 'md' ? CL_ICONS.book : CL_ICONS.file;
          const indent = depth * 14 + 10;
          treeHtml += `
            <button type="button" class="codelab-file-item ${isActive ? 'active' : ''}" draggable="true" data-cl-file="${escapeHtml(fullPath)}" data-file="${escapeHtml(fullPath)}" data-depth="${depth}" style="padding-left: ${indent}px;">
              <span class="codelab-file-icon">${fileIcon}</span>
              <span class="codelab-file-name" title="${escapeHtml(baseName)}">${escapeHtml(baseName)}</span>
              <span class="codelab-file-badge">${badge}</span>
            </button>
          `;
        }
      };

      if (this.creatingItem && this.creatingItem.parentFolder === '') {
        treeHtml += `
          <div class="codelab-tree-create-row" style="padding-left: 10px;">
            <span class="codelab-tree-create-icon">${this.creatingItem.type === 'folder' ? CL_ICONS.folder : CL_ICONS.file}</span>
            <input type="text" id="cl-tree-create-input" class="codelab-tree-input" placeholder="${this.creatingItem.type === 'folder' ? 'folder-name' : 'filename.' + this.lang}" autocomplete="off" spellcheck="false" />
          </div>
        `;
      }

      renderNode(treeRoot, 0);
      explorerEl.innerHTML = treeHtml;

      // Attach file drag events
      explorerEl.querySelectorAll('.codelab-file-item').forEach(el => {
        el.addEventListener('dragstart', ev => {
          this._draggedFile = el.dataset.clFile;
          if (ev.dataTransfer) {
            ev.dataTransfer.setData('text/plain', el.dataset.clFile || '');
            ev.dataTransfer.effectAllowed = 'move';
          }
        });
        el.addEventListener('dragend', () => {
          this._draggedFile = null;
        });
      });

      // Attach folder drop events
      explorerEl.querySelectorAll('.codelab-folder-item').forEach(el => {
        el.addEventListener('dragover', ev => {
          ev.preventDefault();
          if (ev.dataTransfer) ev.dataTransfer.dropEffect = 'move';
          el.classList.add('drag-over');
        });
        el.addEventListener('dragleave', () => {
          el.classList.remove('drag-over');
        });
        el.addEventListener('drop', ev => {
          ev.preventDefault();
          ev.stopPropagation();
          el.classList.remove('drag-over');
          const fileToMove = this._draggedFile || (ev.dataTransfer && ev.dataTransfer.getData('text/plain'));
          const folder = el.dataset.clFolder;
          if (fileToMove && folder !== undefined) {
            this.moveFile(fileToMove, folder);
          }
        });
      });

      // Explorer container drop target (for moving to workspace root)
      explorerEl.addEventListener('dragover', ev => {
        ev.preventDefault();
      });
      explorerEl.addEventListener('drop', ev => {
        if (ev.target.closest && ev.target.closest('.codelab-folder-item')) return;
        ev.preventDefault();
        const fileToMove = this._draggedFile || (ev.dataTransfer && ev.dataTransfer.getData('text/plain'));
        if (fileToMove) {
          this.moveFile(fileToMove, '');
        }
      });

      // Tree inline creation input listeners
      const treeInput = explorerEl.querySelector('#cl-tree-create-input');
      if (treeInput) {
        treeInput.focus();
        treeInput.addEventListener('keydown', e => {
          if (e.key === 'Escape') {
            e.stopPropagation();
            this.creatingItem = null;
            this._renderFileLists();
          } else if (e.key === 'Enter') {
            e.preventDefault();
            const val = (treeInput.value || '').trim();
            const item = this.creatingItem;
            this.creatingItem = null;
            if (val && item) {
              const full = item.parentFolder ? `${item.parentFolder}/${val}` : val;
              if (item.type === 'folder') {
                this.createFolder(full);
              } else {
                this.createFile(full);
              }
            } else {
              this._renderFileLists();
            }
          }
        });
        treeInput.addEventListener('blur', () => {
          if (this.creatingItem) {
            this.creatingItem = null;
            this._renderFileLists();
          }
        });
      }

      // Tabs rendering
      const openTabs = Array.isArray(this.openTabs) ? this.openTabs : [];
      const tabsHtml = openTabs.map(f => {
        const isActive = f === this.activeFile;
        const ext = f.endsWith('.ts') ? 'ts' : f.endsWith('.js') ? 'js' : f.endsWith('.json') ? 'json' : f.endsWith('.md') ? 'md' : 'txt';
        return `
          <button type="button" role="tab" aria-selected="${isActive}" class="codelab-tab ${isActive ? 'active' : ''}" data-cl-file="${escapeHtml(f)}" data-tab-file="${escapeHtml(f)}">
            <span class="codelab-tab__ext codelab-tab__ext--${ext}">${ext.toUpperCase()}</span>
            <span>${escapeHtml(f)}</span>
            <span class="codelab-tab__close" data-action="close-tab" data-cl-file="${escapeHtml(f)}" title="Close ${escapeHtml(f)}" role="button" aria-label="Close ${escapeHtml(f)}">×</span>
          </button>
        `;
      }).join('');

      const newFileControl = this.isCreatingFile
        ? `<form class="codelab-new-file-form" id="cl-new-file-form">
             <input type="text" class="codelab-new-file-input" id="cl-new-file-input" placeholder="helper.${this.lang}" autocomplete="off" spellcheck="false" aria-label="New file name" />
           </form>`
        : `<button type="button" class="codelab-tab-add" data-cl-action="new-file" title="Create New File in Workspace" aria-label="Create New File">+</button>`;

      const { npmPackages, builtinModules } = this._detectPackages();
      const pkgBadge = npmPackages.length > 0 ? `${npmPackages.length} npm` : `${builtinModules.length} std`;
      const pkgBtnHtml = `
        <button type="button" class="codelab-pkg-btn" data-cl-action="open-packages" title="Manage NPM Packages &amp; Node.js Built-ins">
          ${CL_ICONS.package}
          <span>Packages</span>
          <span class="codelab-drawer__pill" style="padding:0 5px;font-size:10px;">${pkgBadge}</span>
        </button>
      `;

      tabsEl.innerHTML = tabsHtml + newFileControl + pkgBtnHtml;

      if (this.isCreatingFile) {
        const input = tabsEl.querySelector('#cl-new-file-input');
        const form = tabsEl.querySelector('#cl-new-file-form');
        if (input) {
          input.focus();
          input.addEventListener('keydown', ev => {
            if (ev.key === 'Escape') {
              ev.stopPropagation();
              this.isCreatingFile = false;
              this._renderFileLists();
            }
          });
          input.addEventListener('blur', () => {
            if (this.isCreatingFile) {
              this.isCreatingFile = false;
              this._renderFileLists();
            }
          });
        }
        if (form) {
          form.addEventListener('submit', ev => {
            ev.preventDefault();
            const rawName = (input?.value || '').trim();
            this.isCreatingFile = false;
            if (rawName) {
              this.createFile(rawName);
            } else {
              this._renderFileLists();
            }
          });
        }
      }
    }

    _renderTabs() {
      this._renderFileLists();
    }

    createFolder(folderPath) {
      let clean = String(folderPath).trim().replace(/^\/+|\/+$/g, '');
      if (!clean) return;
      const parts = clean.split('/');
      let cur = '';
      for (const p of parts) {
        cur = cur ? `${cur}/${p}` : p;
        this.folders.add(cur);
      }
      this._saveState();
      this._renderFileLists();
    }

    toggleFolder(folderPath) {
      const clean = String(folderPath).trim().replace(/^\/+|\/+$/g, '');
      if (!clean) return;
      if (this.collapsedFolders.has(clean)) {
        this.collapsedFolders.delete(clean);
      } else {
        this.collapsedFolders.add(clean);
      }
      this._saveState();
      this._renderFileLists();
    }

    moveFile(srcPath, dest) {
      if (!srcPath || this.files[srcPath] === undefined) return;
      const baseName = srcPath.split('/').pop();
      const cleanDest = String(dest || '').trim().replace(/^\/+|\/+$/g, '');
      const isDestFolder = cleanDest === '' || this.folders.has(cleanDest) || (!cleanDest.split('/').pop().includes('.') && this.files[cleanDest] === undefined);
      const targetPath = isDestFolder
        ? (cleanDest ? `${cleanDest}/${baseName}` : baseName)
        : cleanDest;

      if (targetPath === srcPath) return;
      if (this.files[targetPath] !== undefined) return;

      const parts = targetPath.split('/');
      let cur = '';
      for (let i = 0; i < parts.length - 1; i++) {
        cur = cur ? `${cur}/${parts[i]}` : parts[i];
        this.folders.add(cur);
        this.collapsedFolders.delete(cur);
      }

      const content = this.files[srcPath];
      delete this.files[srcPath];
      this.files[targetPath] = content;

      const oldModel = this.models.get(srcPath);
      if (oldModel) {
        oldModel.dispose();
        this.models.delete(srcPath);
      }
      this._getOrCreateModel(targetPath);

      if (Array.isArray(this.openTabs)) {
        const idx = this.openTabs.indexOf(srcPath);
        if (idx !== -1) {
          this.openTabs.splice(idx, 1, targetPath);
        }
      }

      if (this.activeFile === srcPath) {
        this.activeFile = targetPath;
      }

      this._saveState();
      this._syncActiveFileToView();
    }

    renameFile(oldPath, newPath) {
      this.moveFile(oldPath, newPath);
    }

    renameFolder(oldFolder, newFolder) {
      const oldPrefix = String(oldFolder).trim().replace(/^\/+|\/+$/g, '');
      const newPrefix = String(newFolder).trim().replace(/^\/+|\/+$/g, '');
      if (!oldPrefix || !newPrefix || oldPrefix === newPrefix) return;

      const updatedFolders = new Set();
      for (const f of this.folders) {
        if (f === oldPrefix) {
          updatedFolders.add(newPrefix);
        } else if (f.startsWith(oldPrefix + '/')) {
          updatedFolders.add(newPrefix + f.slice(oldPrefix.length));
        } else {
          updatedFolders.add(f);
        }
      }
      const parts = newPrefix.split('/');
      let cur = '';
      for (const p of parts) {
        cur = cur ? `${cur}/${p}` : p;
        updatedFolders.add(cur);
      }
      this.folders = updatedFolders;

      const updatedCollapsed = new Set();
      for (const cf of this.collapsedFolders) {
        if (cf === oldPrefix) {
          updatedCollapsed.add(newPrefix);
        } else if (cf.startsWith(oldPrefix + '/')) {
          updatedCollapsed.add(newPrefix + cf.slice(oldPrefix.length));
        } else {
          updatedCollapsed.add(cf);
        }
      }
      this.collapsedFolders = updatedCollapsed;

      const fileRenames = [];
      for (const filePath of Object.keys(this.files)) {
        if (filePath.startsWith(oldPrefix + '/')) {
          const newFilePath = newPrefix + filePath.slice(oldPrefix.length);
          fileRenames.push({ oldPath: filePath, newPath: newFilePath, content: this.files[filePath] });
        }
      }

      for (const { oldPath, newPath, content } of fileRenames) {
        delete this.files[oldPath];
        this.files[newPath] = content;

        const oldModel = this.models.get(oldPath);
        if (oldModel) {
          oldModel.dispose();
          this.models.delete(oldPath);
        }
        this._getOrCreateModel(newPath);

        if (Array.isArray(this.openTabs)) {
          const idx = this.openTabs.indexOf(oldPath);
          if (idx !== -1) {
            this.openTabs.splice(idx, 1, newPath);
          }
        }

        if (this.activeFile === oldPath) {
          this.activeFile = newPath;
        }
      }

      this._saveState();
      this._syncActiveFileToView();
    }

    deleteFolder(folderPath) {
      const clean = String(folderPath).trim().replace(/^\/+|\/+$/g, '');
      if (!clean) return;

      for (const f of Array.from(this.folders)) {
        if (f === clean || f.startsWith(clean + '/')) {
          this.folders.delete(f);
        }
      }

      for (const cf of Array.from(this.collapsedFolders)) {
        if (cf === clean || cf.startsWith(clean + '/')) {
          this.collapsedFolders.delete(cf);
        }
      }

      const matchingFiles = Object.keys(this.files).filter(f => f.startsWith(clean + '/'));
      for (const f of matchingFiles) {
        delete this.files[f];
        const model = this.models.get(f);
        if (model) {
          model.dispose();
          this.models.delete(f);
        }
        if (Array.isArray(this.openTabs)) {
          const idx = this.openTabs.indexOf(f);
          if (idx !== -1) {
            this.openTabs.splice(idx, 1);
          }
        }
      }

      if (this.activeFile && this.activeFile.startsWith(clean + '/')) {
        this.activeFile = this.openTabs && this.openTabs.length > 0 ? this.openTabs[0] : null;
      }

      this._saveState();
      this._syncActiveFileToView();
    }

    createFile(rawName, initialContent = null) {
      let clean = String(rawName).trim().replace(/^\/+/, '');
      if (!clean) return;
      if (!/\.(js|ts|json|md|txt)$/i.test(clean) && !clean.includes('.')) {
        clean += `.${this.lang}`;
      }
      if (this.files[clean] !== undefined) {
        this.openFile(clean);
        return;
      }
      const parts = clean.split('/');
      let cur = '';
      for (let i = 0; i < parts.length - 1; i++) {
        cur = cur ? `${cur}/${parts[i]}` : parts[i];
        this.folders.add(cur);
      }
      if (typeof initialContent === 'string') {
        this.files[clean] = initialContent;
      } else {
        this.files[clean] = clean.endsWith('.json')
          ? '{\n  "name": "' + this.labId + '",\n  "dependencies": {}\n}\n'
          : `'use strict';\n\n// ${clean}\n`;
      }
      this._saveState();
      this._getOrCreateModel(clean);
      this._emitEvent('codelab:file-create', { labId: this.labId, filename: clean, content: this.files[clean] });
      this.openFile(clean);
    }

    duplicateFile(filename) {
      if (!filename || this.files[filename] === undefined) return null;
      const dotIdx = filename.lastIndexOf('.');
      const base = dotIdx > 0 ? filename.slice(0, dotIdx) : filename;
      const ext = dotIdx > 0 ? filename.slice(dotIdx) : '';
      let candidate = `${base}.copy${ext}`;
      let counter = 2;
      while (this.files[candidate] !== undefined) {
        candidate = `${base}.copy${counter}${ext}`;
        counter++;
      }
      this.createFile(candidate, this.files[filename]);
      return candidate;
    }

    closeTab(filename) {
      if (!Array.isArray(this.openTabs) || !this.openTabs.includes(filename)) {
        return;
      }
      const idx = this.openTabs.indexOf(filename);
      this.openTabs.splice(idx, 1);

      if (this.activeFile === filename) {
        if (this.openTabs.length > 0) {
          const nextIdx = Math.min(idx, this.openTabs.length - 1);
          this.activeFile = this.openTabs[nextIdx];
        } else {
          this.activeFile = null;
        }
      }

      this._saveState();
      this._syncActiveFileToView();
    }

    closeOtherTabs(keepFilename) {
      if (!Array.isArray(this.openTabs)) return;
      if (keepFilename && this.files[keepFilename] !== undefined) {
        this.openTabs = [keepFilename];
        this.activeFile = keepFilename;
      }
      this._saveState();
      this._syncActiveFileToView();
    }

    closeAllTabs() {
      this.openTabs = [];
      this.activeFile = null;
      this._saveState();
      this._syncActiveFileToView();
    }

    deleteFile(filename) {
      if (!filename || this.files[filename] === undefined) return;
      delete this.files[filename];
      const model = this.models.get(filename);
      if (model) {
        model.dispose();
        this.models.delete(filename);
      }
      let tabIdx = -1;
      if (Array.isArray(this.openTabs)) {
        tabIdx = this.openTabs.indexOf(filename);
        if (tabIdx !== -1) {
          this.openTabs.splice(tabIdx, 1);
        }
      }
      this._saveState();
      if (this.activeFile === filename) {
        if (this.openTabs && this.openTabs.length > 0) {
          this.activeFile = this.openTabs[Math.max(0, Math.min(tabIdx, this.openTabs.length - 1))];
        } else {
          this.activeFile = null;
        }
      }
      this._emitEvent('codelab:file-delete', { labId: this.labId, filename });
      this._syncActiveFileToView();
    }

    toggleGuide() {
      const shell = this.container.querySelector('.codelab');
      const guide = this.container.querySelector('.codelab-guide');
      if (shell) shell.classList.toggle('guide-collapsed');
      if (guide) guide.classList.toggle('collapsed');
      if (this.editor) setTimeout(() => this.editor.layout(), 50);
    }

    _renderDrawerBody() {
      const bodyEl = this.container.querySelector('#cl-drawer-body');
      const testPill = this.container.querySelector('#cl-test-pill');
      const vfsPill = this.container.querySelector('#cl-vfs-pill');
      if (!bodyEl) return;

      // Update drawer tab active state
      this.container.querySelectorAll('[data-cl-drawertab]').forEach(btn => {
        const isActive = btn.dataset.clDrawertab === this.drawerTab;
        btn.classList.toggle('active', isActive);
        btn.setAttribute('aria-selected', String(isActive));
      });

      // Update pills
      if (testPill) {
        if (!this.lastTestResults.length) {
          testPill.textContent = 'Ready';
          testPill.className = 'codelab-drawer__pill';
        } else {
          const passed = this.lastTestResults.filter(t => t.status === 'pass').length;
          const total = this.lastTestResults.length;
          testPill.textContent = `${passed}/${total} Passed`;
          testPill.className = `codelab-drawer__pill ${passed === total ? 'pass' : 'fail'}`;
        }
      }
      if (vfsPill) {
        const diskCount = this.lastFsSnapshot.length;
        const httpCount = this.lastHttpTrace.length;
        vfsPill.textContent = httpCount > 0 ? `${diskCount} files · ${httpCount} reqs` : `${diskCount} files`;
      }

      if (this.drawerTab === 'tests') {
        if (!this.lastTestResults.length) {
          bodyEl.innerHTML = `
            <div style="color:var(--cl-fg-muted);padding:12px 4px;">
              Click <strong>Run Tests</strong> (<kbd>⌘+Enter</kbd>) or <strong>Verify Step</strong> to execute the unit test suite in the Virtual Node Worker.
            </div>
          `;
          return;
        }
        const passed = this.lastTestResults.filter(t => t.status === 'pass').length;
        const total = this.lastTestResults.length;
        const totalMs = this.lastTestResults.reduce((acc, r) => acc + (r.durationMs || 0), 0).toFixed(1);

        bodyEl.innerHTML = `
          <div class="codelab-test-summary ${passed === total ? 'all-pass' : 'has-fail'}">
            <div>
              <strong>${passed === total ? `All ${total} Tests Passing` : `${passed} of ${total} Tests Passing`}</strong>
              ${this.steps.length ? `<span style="margin-left:8px;font-size:12px;opacity:0.8;">(${this.completedSteps.size}/${this.steps.length} Guided Steps Complete)</span>` : ''}
            </div>
            <span style="font-family:var(--cl-font-mono);font-size:12px;">${totalMs} ms</span>
          </div>
          <div class="codelab-test-list">
            ${this.lastTestResults.map(t => `
              <div class="codelab-test-row ${t.status}">
                <div class="codelab-test-row__head">
                  <div class="codelab-test-row__name">
                    <span style="color:${t.status === 'pass' ? 'var(--cl-green)' : 'var(--cl-red)'};font-weight:700;">
                      ${t.status === 'pass' ? '✓ PASS' : '✖ FAIL'}
                    </span>
                    <span>${escapeHtml(t.name)}</span>
                  </div>
                  <span class="codelab-test-row__time">${(t.durationMs || 0).toFixed(2)} ms</span>
                </div>
                ${t.error ? formatTestErrorHtml(t.error) : ''}
              </div>
            `).join('')}
          </div>
        `;
        return;
      }

      if (this.drawerTab === 'terminal') {
        bodyEl.innerHTML = `
          <div class="codelab-terminal">
            <div class="codelab-terminal__log" id="cl-terminal-log">
              ${this.terminalLogs.map(item => `
                <div class="codelab-log-line ${escapeHtml(item.type || '')}">${escapeHtml(item.text)}</div>
              `).join('')}
            </div>
            <form class="codelab-repl" id="cl-repl-form">
              <span class="codelab-repl__prompt">codelab$</span>
              <input type="text" class="codelab-repl__input" id="cl-repl-input" placeholder="node demo.js | node test.js | ls | cat <file> | or any JS/TS expression…" autocomplete="off" spellcheck="false" aria-label="REPL command input">
            </form>
          </div>
        `;
        bodyEl.scrollTop = bodyEl.scrollHeight;
        const replForm = bodyEl.querySelector('#cl-repl-form');
        if (replForm) {
          replForm.addEventListener('submit', e => {
            e.preventDefault();
            const input = bodyEl.querySelector('#cl-repl-input');
            if (!input || !input.value.trim()) return;
            const cmd = input.value.trim();
            input.value = '';
            this._handleReplCommand(cmd);
          });
        }
        return;
      }

      if (this.drawerTab === 'inspector') {
        const tmpFiles = this.lastFsSnapshot.filter(f => !f.isDirectory);
        bodyEl.innerHTML = `
          <div class="codelab-inspector-grid">
            <div class="codelab-inspector-card">
              <div class="codelab-inspector-card__title">
                <span style="display:inline-flex;align-items:center;gap:6px;">${CL_ICONS.database}<span>Virtual POSIX File System (${tmpFiles.length} files)</span></span>
                <span>In-Memory VFS</span>
              </div>
              ${tmpFiles.length === 0 ? `<div style="color:var(--cl-fg-muted);font-size:12px;">Run Demo or Tests to inspect virtual files (e.g. /tmp WAL segments &amp; SSTables).</div>` : ''}
              ${tmpFiles.map(f => `
                <div class="codelab-vfs-item">
                  <div class="codelab-vfs-item__head">
                    <span>${escapeHtml(f.path)}</span>
                    <span>${f.size} bytes</span>
                  </div>
                  ${f.hexPreview ? `<div class="codelab-vfs-item__hex">HEX: ${escapeHtml(f.hexPreview)}</div>` : ''}
                  ${f.preview ? `<div class="codelab-vfs-item__hex">TXT: ${escapeHtml(f.preview.slice(0, 120).replace(/\n/g, '↵'))}</div>` : ''}
                </div>
              `).join('')}
            </div>

            <div class="codelab-inspector-card">
              <div class="codelab-inspector-card__title">
                <span style="display:inline-flex;align-items:center;gap:6px;">${CL_ICONS.globe}<span>Virtual Loopback HTTP Trace (${this.lastHttpTrace.length} requests)</span></span>
                <span>127.0.0.1</span>
              </div>
              ${this.lastHttpTrace.length === 0 ? `<div style="color:var(--cl-fg-muted);font-size:12px;">Virtual HTTP loopback requests (e.g., Layer-7 Load Balancer traffic &amp; active health probes) appear here.</div>` : ''}
              ${this.lastHttpTrace.map(req => `
                <div class="codelab-vfs-item">
                  <div class="codelab-vfs-item__head">
                    <span>${escapeHtml(req.method || 'GET')} 127.0.0.1:${escapeHtml(req.port)}${escapeHtml(req.url || '/')}</span>
                    <span style="color:${req.status >= 200 && req.status < 400 ? 'var(--cl-green)' : 'var(--cl-red)'}">
                      HTTP ${escapeHtml(req.status || 'ERR')} · ${(req.durationMs || 0).toFixed(1)}ms
                    </span>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        `;
      }
    }

    _updateFallbackGutter() {
      const fallbackEl = this.container.querySelector('#cl-fallback-editor');
      const gutterEl = this.container.querySelector('#cl-fallback-gutter');
      if (!fallbackEl || !gutterEl) return;
      const lineCount = Math.max(1, (fallbackEl.value || '').split('\n').length);
      const nums = [];
      for (let i = 1; i <= lineCount; i++) nums.push(i);
      gutterEl.textContent = nums.join('\n');
      gutterEl.scrollTop = fallbackEl.scrollTop;
    }

    // ── Initialize Monaco Editor (with Resilient Line-Numbered Fallback) ────
    _initEditor() {
      const fallbackWrap = this.container.querySelector('#cl-fallback-wrap');
      const fallbackEl = this.container.querySelector('#cl-fallback-editor');
      const monacoHost = this.container.querySelector('#cl-monaco-host');

      if (fallbackEl) {
        fallbackEl.value = (this.activeFile && this.files[this.activeFile]) ? this.files[this.activeFile] : '';
        this._updateFallbackGutter();

        fallbackEl.addEventListener('scroll', () => {
          const gutterEl = this.container.querySelector('#cl-fallback-gutter');
          if (gutterEl) gutterEl.scrollTop = fallbackEl.scrollTop;
        });

        fallbackEl.addEventListener('input', () => {
          if (!this.editor && this.activeFile && !this.activeFile.endsWith('.md')) {
            this.files[this.activeFile] = fallbackEl.value;
            this._updateFallbackGutter();
            this._saveState();
            this._notifyCodeChange(this.activeFile, fallbackEl.value);
          }
        });

        fallbackEl.addEventListener('keydown', e => {
          if (e.key === 'Tab') {
            e.preventDefault();
            const start = fallbackEl.selectionStart;
            const end = fallbackEl.selectionEnd;
            fallbackEl.value = fallbackEl.value.substring(0, start) + '  ' + fallbackEl.value.substring(end);
            fallbackEl.selectionStart = fallbackEl.selectionEnd = start + 2;
            if (this.activeFile) {
              this.files[this.activeFile] = fallbackEl.value;
              this._updateFallbackGutter();
              this._saveState();
              this._notifyCodeChange(this.activeFile, fallbackEl.value);
            }
          } else if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'Enter') {
            e.preventDefault();
            this.runDemo();
          } else if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
            e.preventDefault();
            if (this.mode === 'guided') {
              this.verifyCurrentStep();
            } else {
              this.runTests();
            }
          }
        });
      }

      this._syncActiveFileToView();

      loadMonaco(this.monacoUrl).then(m => {
        this.monaco = m;
        if (!monacoHost) return;
        const isDark = this._resolvedTheme() !== 'light';

        // Create models for all code files
        this._syncAllModels();

        const currentModel = this.activeFile ? this._getOrCreateModel(this.activeFile) : null;
        this.editor = m.editor.create(monacoHost, {
          model: currentModel,
          theme: isDark ? 'codelab-dark' : 'codelab-light',
          fontFamily: '"Geist Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, monospace',
          fontSize: 13,
          lineHeight: 20,
          tabSize: 2,
          insertSpaces: true,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          automaticLayout: true,
          padding: { top: 12, bottom: 12 },
          smoothScrolling: true,
          cursorBlinking: 'smooth',
          renderLineHighlight: 'all',
          bracketPairColorization: { enabled: true }
        });

        // Keyboard shortcuts inside Monaco
        this.editor.addCommand(m.KeyMod.CtrlCmd | m.KeyCode.Enter, () => {
          if (this.mode === 'guided') {
            this.verifyCurrentStep();
          } else {
            this.runTests();
          }
        });
        this.editor.addCommand(m.KeyMod.CtrlCmd | m.KeyMod.Shift | m.KeyCode.Enter, () => {
          this.runDemo();
        });
        if (m.KeyCode.KeyP) {
          this.editor.addCommand(m.KeyMod.CtrlCmd | m.KeyMod.Shift | m.KeyCode.KeyP, () => {
            this.openCommandPalette('commands');
          });
          this.editor.addCommand(m.KeyMod.CtrlCmd | m.KeyCode.KeyP, () => {
            this.openCommandPalette('files');
          });
        }
        if (m.KeyCode.F1) {
          this.editor.addCommand(m.KeyCode.F1, () => {
            this.openCommandPalette('commands');
          });
        }

        this.editor.onDidChangeCursorPosition(e => {
          if (e && e.position) {
            this.cursorPos = { ln: e.position.lineNumber, col: e.position.column };
            this._updateStatusBar();
            this._renderBreadcrumbs();
          }
        });

        if (fallbackWrap) fallbackWrap.style.display = 'none';
        this._syncActiveFileToView();

        // Watch theme changes on <html>
        if (typeof MutationObserver !== 'undefined') {
          this._themeObserver = new MutationObserver(() => {
            const dark = this._resolvedTheme() !== 'light';
            m.editor.setTheme(dark ? 'codelab-dark' : 'codelab-light');
          });
          this._themeObserver.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['data-theme']
          });
        }
      }).catch(() => {
        // Fallback editor remains visible if offline / CDN blocked
        if (fallbackWrap && this.activeFile && !this.activeFile.endsWith('.md')) {
          fallbackWrap.style.display = 'flex';
          this._updateFallbackGutter();
        }
      });
    }

    _notifyCodeChange(filename, code) {
      if (this.onCodeChange) {
        try { this.onCodeChange(filename, code); } catch (_) {}
      }
      this._emitEvent('codelab:change', { labId: this.labId, filename, code });
      this._updateStatusBar();
      this._renderBreadcrumbs();
    }

    _getOrCreateModel(filename) {
      if (!filename || !this.monaco) return null;
      const uri = this.monaco.Uri.parse(`file:///${this.labId}/${filename}`);
      let model = this.monaco.editor.getModel(uri);
      const lang = filename.endsWith('.ts') ? 'typescript' : filename.endsWith('.json') ? 'json' : filename.endsWith('.md') ? 'markdown' : 'javascript';
      if (!model) {
        model = this.monaco.editor.createModel(this.files[filename] || '', lang, uri);
        model.onDidChangeContent(() => {
          const val = model.getValue();
          this.files[filename] = val;
          this._saveState();
          this._notifyCodeChange(filename, val);
        });
      } else if (model.getValue() !== (this.files[filename] || '')) {
        model.setValue(this.files[filename] || '');
      }
      this.models.set(filename, model);
      return model;
    }

    _syncAllModels() {
      if (!this.monaco) return;
      for (const filename of Object.keys(this.files)) {
        this._getOrCreateModel(filename);
      }
    }

    _syncActiveFileToView() {
      const monacoHost = this.container.querySelector('#cl-monaco-host');
      const fallbackWrap = this.container.querySelector('#cl-fallback-wrap');
      const fallbackEl = this.container.querySelector('#cl-fallback-editor');
      const mdPreview = this.container.querySelector('#cl-md-preview');
      const emptyEl = this.container.querySelector('#cl-empty-editor');

      if (!this.activeFile || !this.openTabs || this.openTabs.length === 0) {
        if (monacoHost) monacoHost.style.display = 'none';
        if (fallbackWrap) fallbackWrap.style.display = 'none';
        if (mdPreview) mdPreview.style.display = 'none';
        if (this.editor) {
          try { this.editor.setModel(null); } catch (_) {}
        }
        if (emptyEl) {
          emptyEl.style.display = 'flex';
          this._renderEmptyEditorContent(emptyEl);
        }
        this._renderFileLists();
        this._renderBreadcrumbs();
        this._updateStatusBar();
        return;
      }

      if (emptyEl) {
        emptyEl.style.display = 'none';
      }

      const isMd = this.activeFile.endsWith('.md');
      if (isMd) {
        if (monacoHost) monacoHost.style.display = 'none';
        if (fallbackWrap) fallbackWrap.style.display = 'none';
        if (mdPreview) {
          mdPreview.style.display = 'block';
          mdPreview.innerHTML = renderSimpleMarkdown(this.files[this.activeFile] || '');
        }
      } else {
        if (mdPreview) mdPreview.style.display = 'none';
        if (this.editor && this.monaco) {
          if (monacoHost) monacoHost.style.display = 'block';
          if (fallbackWrap) fallbackWrap.style.display = 'none';
          const model = this._getOrCreateModel(this.activeFile);
          if (model && this.editor.getModel() !== model) {
            this.editor.setModel(model);
          }
          const pos = this.editor.getPosition();
          if (pos) {
            this.cursorPos = { ln: pos.lineNumber, col: pos.column };
          }
          this.editor.layout();
        } else if (fallbackWrap && fallbackEl) {
          fallbackWrap.style.display = 'flex';
          fallbackEl.value = this.files[this.activeFile] || '';
          this._updateFallbackGutter();
        }
      }
      this._renderFileLists();
      this._renderBreadcrumbs();
      this._updateStatusBar();
    }

    _renderEmptyEditorContent(emptyEl) {
      if (!emptyEl) return;
      const fileBtns = this._orderedFileNames().map(f => {
        const ext = f.endsWith('.ts') ? 'ts' : f.endsWith('.js') ? 'js' : f.endsWith('.json') ? 'json' : f.endsWith('.md') ? 'md' : 'txt';
        return `
          <button type="button" class="codelab-empty-file-btn" data-cl-file="${escapeHtml(f)}" title="Open ${escapeHtml(f)}">
            <span class="codelab-tab__ext codelab-tab__ext--${ext}">${ext.toUpperCase()}</span>
            <span>${escapeHtml(f)}</span>
          </button>
        `;
      }).join('');

      emptyEl.innerHTML = `
        <div class="codelab-empty-editor__inner">
          <div class="codelab-empty-editor__icon" aria-hidden="true">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
              <polyline points="14 2 14 8 20 8"/>
            </svg>
          </div>
          <h2 class="codelab-empty-editor__title">No Open Editors</h2>
          <p class="codelab-empty-editor__subtitle">Select a file from the explorer on the left or click a workspace file below to open.</p>
          <div class="codelab-empty-editor__files" role="group" aria-label="Workspace Files">
            ${fileBtns}
          </div>
          <div class="codelab-empty-editor__actions">
            <button type="button" class="codelab-btn codelab-btn--run" data-cl-action="run-demo" title="Run demo.js (⇧⌘↵)">
              ${CL_ICONS.play}
              <span>Run Demo</span>
              <span class="codelab-btn__kbd">⇧⌘↵</span>
            </button>
            <button type="button" class="codelab-btn codelab-btn--test" data-cl-action="run-tests" title="Run Test Suite (⌘↵)">
              ${CL_ICONS.check}
              <span>Run Tests</span>
              <span class="codelab-btn__kbd">⌘↵</span>
            </button>
          </div>
        </div>
      `;
    }

    // ── Event Delegation & Interactive Splitters ───────────────────────────
    _bindEvents() {
      this._bindSplitters();

      this._escHandler = e => {
        if (e.key === 'Escape') {
          const ctxSlot = this.container.querySelector('#cl-context-menu-slot');
          if (ctxSlot && ctxSlot.innerHTML.trim() !== '') {
            this.closeContextMenu();
            return;
          }
          if (this.creatingItem) {
            this.creatingItem = null;
            this._renderFileLists();
            return;
          }
          if (this.renamingItem) {
            this.renamingItem = null;
            this._renderFileLists();
            return;
          }
          if (this.isCreatingFile) {
            this.isCreatingFile = false;
            this._renderFileLists();
            return;
          }
          const modalSlot = this.container.querySelector('#cl-modal-slot');
          if (modalSlot && modalSlot.innerHTML.trim() !== '') {
            this.closeModal();
            return;
          }
          if (this.isFullscreen) {
            this.toggleFullscreen();
          }
        }
      };
      if (typeof document !== 'undefined') {
        document.addEventListener('keydown', this._escHandler);
      }

      this.container.addEventListener('keydown', e => {
        const keyLower = (e.key || '').toLowerCase();
        if (e.key === 'F1' || ((e.metaKey || e.ctrlKey) && e.shiftKey && keyLower === 'p')) {
          e.preventDefault();
          this.openCommandPalette('commands');
          return;
        }
        if ((e.metaKey || e.ctrlKey) && !e.shiftKey && keyLower === 'p') {
          e.preventDefault();
          this.openCommandPalette('files');
          return;
        }
        if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
          e.preventDefault();
          if (e.shiftKey) {
            this.runDemo();
          } else if (this.mode === 'guided') {
            this.verifyCurrentStep();
          } else {
            this.runTests();
          }
        }
      });

      this.container.addEventListener('contextmenu', e => {
        const tabEl = e.target.closest('.codelab-tab');
        if (tabEl && (tabEl.dataset.clFile || tabEl.dataset.tabFile)) {
          e.preventDefault();
          const fname = tabEl.dataset.clFile || tabEl.dataset.tabFile;
          const x = e.clientX || 120;
          const y = e.clientY || 80;
          this.openContextMenu(x, y, [
            { label: 'Close', shortcut: '⌘W', action: 'close-tab', target: fname },
            { label: 'Close Others', action: 'close-other-tabs', target: fname },
            { label: 'Close All', action: 'close-all-tabs', target: fname },
            { divider: true },
            { label: 'Compare with Solution', action: 'compare-solution', target: fname },
            { label: 'Compare with Starter', action: 'compare-starter', target: fname }
          ]);
          return;
        }

        const fileEl = e.target.closest('.codelab-file-item');
        if (fileEl && (fileEl.dataset.clFile || fileEl.dataset.file)) {
          e.preventDefault();
          const fname = fileEl.dataset.clFile || fileEl.dataset.file;
          const x = e.clientX || 120;
          const y = e.clientY || 120;
          this.openContextMenu(x, y, [
            { label: 'Open File', action: 'open-file', target: fname },
            { label: 'Rename...', shortcut: 'F2', action: 'rename-file', target: fname },
            { label: 'Duplicate File', action: 'duplicate-file', target: fname },
            { divider: true },
            { label: 'Compare with Solution', action: 'compare-solution', target: fname },
            { label: 'Compare with Starter', action: 'compare-starter', target: fname },
            { divider: true },
            { label: 'Download File', action: 'download-file', target: fname },
            { label: 'Delete File', action: 'delete-file', target: fname, danger: true }
          ]);
          return;
        }

        const folderEl = e.target.closest('.codelab-folder-item');
        if (folderEl && (folderEl.dataset.clFolder || folderEl.dataset.folder)) {
          e.preventDefault();
          const folder = folderEl.dataset.clFolder || folderEl.dataset.folder;
          const x = e.clientX || 120;
          const y = e.clientY || 120;
          this.openContextMenu(x, y, [
            { label: 'New File in Folder...', action: 'new-file-in-folder', target: folder },
            { label: 'New Subfolder...', action: 'new-subfolder', target: folder },
            { divider: true },
            { label: 'Rename Folder...', action: 'rename-folder-ctx', target: folder },
            { label: 'Delete Folder', action: 'delete-folder-ctx', target: folder, danger: true }
          ]);
        }
      });

      const handleTabMiddleClick = e => {
        if (e.button === 1) {
          const tabEl = e.target.closest('.codelab-tab');
          if (tabEl && tabEl.dataset.clFile) {
            e.preventDefault();
            e.stopPropagation();
            this.closeTab(tabEl.dataset.clFile);
          }
        }
      };
      this.container.addEventListener('auxclick', handleTabMiddleClick);
      this.container.addEventListener('mousedown', handleTabMiddleClick);

      this.container.addEventListener('click', e => {
        const ctxBtn = e.target.closest('[data-ctx-action]');
        if (ctxBtn) {
          e.stopPropagation();
          const act = ctxBtn.dataset.ctxAction;
          const target = ctxBtn.dataset.ctxTarget || '';
          this.closeContextMenu();
          if (act === 'open-file' && target) this.openFile(target);
          else if (act === 'rename-file' && target) this.startInlineRename('file', target);
          else if (act === 'duplicate-file' && target) this.duplicateFile(target);
          else if (act === 'compare-solution' && target) {
            this.openFile(target);
            this.showDiffModal(target, 'solution');
          } else if (act === 'compare-starter' && target) {
            this.openFile(target);
            this.showDiffModal(target, 'starter');
          } else if (act === 'download-file' && target) this.downloadFile(target);
          else if (act === 'delete-file' && target) this.deleteFile(target);
          else if (act === 'new-file-in-folder') this.startInlineCreate('file', target);
          else if (act === 'new-subfolder') this.startInlineCreate('folder', target);
          else if (act === 'rename-folder-ctx' && target) this.startInlineRename('folder', target);
          else if (act === 'delete-folder-ctx' && target) this.deleteFolder(target);
          else if (act === 'close-tab' && target) this.closeTab(target);
          else if (act === 'close-other-tabs' && target) this.closeOtherTabs(target);
          else if (act === 'close-all-tabs') this.closeAllTabs();
          return;
        }

        // Dismiss context menu on outside click
        const ctxSlot = this.container.querySelector('#cl-context-menu-slot');
        if (ctxSlot && ctxSlot.innerHTML.trim() !== '' && !e.target.closest('.codelab-context-menu')) {
          this.closeContextMenu();
        }

        const paletteItem = e.target.closest('[data-palette-idx]');
        if (paletteItem) {
          e.stopPropagation();
          const idx = Number(paletteItem.dataset.paletteIdx);
          this._executePaletteSelection(idx);
          return;
        }

        if (e.target.classList && e.target.classList.contains('codelab-palette-backdrop')) {
          this.closeModal();
          return;
        }

        const bcFolder = e.target.closest('[data-cl-breadcrumb-folder]');
        if (bcFolder) {
          const folder = bcFolder.dataset.clBreadcrumbFolder;
          if (folder) {
            this.collapsedFolders.delete(folder);
            this._renderFileLists();
          }
          return;
        }

        const bcFile = e.target.closest('[data-cl-breadcrumb-file]');
        if (bcFile) {
          const fname = bcFile.dataset.clBreadcrumbFile;
          if (fname) this.openFile(fname);
          return;
        }

        const closeBtn = e.target.closest('[data-action="close-tab"], .codelab-tab__close');
        if (closeBtn) {
          e.stopPropagation();
          const tabEl = closeBtn.closest('.codelab-tab') || closeBtn;
          const fname = closeBtn.dataset.clFile || tabEl.dataset.clFile;
          if (fname) this.closeTab(fname);
          return;
        }

        const deleteBtn = e.target.closest('[data-cl-delete-file]');
        if (deleteBtn) {
          e.stopPropagation();
          this.deleteFile(deleteBtn.dataset.clDeleteFile);
          return;
        }

        const modeBtn = e.target.closest('[data-cl-mode]');
        if (modeBtn) {
          this.setMode(modeBtn.dataset.clMode);
          return;
        }

        const langBtn = e.target.closest('[data-cl-lang]');
        if (langBtn) {
          this.setLanguage(langBtn.dataset.clLang);
          return;
        }

        const fileBtn = e.target.closest('[data-cl-file]');
        if (fileBtn) {
          this.openFile(fileBtn.dataset.clFile);
          return;
        }

        const jumpBtn = e.target.closest('[data-cl-jump-file]');
        if (jumpBtn) {
          this.openFile(jumpBtn.dataset.clJumpFile, jumpBtn.dataset.clJumpSymbol);
          return;
        }

        const stepBtn = e.target.closest('[data-cl-step]');
        if (stepBtn && !stepBtn.disabled) {
          const idx = Number(stepBtn.dataset.clStep);
          if (!Number.isNaN(idx) && idx >= 0 && idx < this.steps.length) {
            this.selectStep(idx, true);
          }
          return;
        }

        const guideTabBtn = e.target.closest('[data-cl-guidetab]');
        if (guideTabBtn) {
          this.guideTab = guideTabBtn.dataset.clGuidetab;
          this._renderGuidePane();
          return;
        }

        const drawerTabBtn = e.target.closest('[data-cl-drawertab]');
        if (drawerTabBtn) {
          this.drawerTab = drawerTabBtn.dataset.clDrawertab;
          const drawer = this.container.querySelector('#cl-drawer');
          if (drawer) drawer.classList.remove('is-minimized');
          this._renderDrawerBody();
          return;
        }

        const actionBtn = e.target.closest('[data-cl-action], [data-action]');
        if (actionBtn) {
          const action = actionBtn.dataset.clAction || actionBtn.dataset.action;
          if (action === 'run-demo') this.runDemo();
          else if (action === 'run-tests') this.runTests();
          else if (action === 'stop-run') this.stopExecution();
          else if (action === 'verify-step') this.verifyCurrentStep();
          else if (action === 'show-diff') this.showSolutionModal();
          else if (action === 'compare-diff') {
            const target = actionBtn.dataset.diffTarget || 'solution';
            const file = actionBtn.dataset.diffFile || this.activeFile || this._pickDefaultFile();
            this.showDiffModal(file, target);
          } else if (action === 'diff-mode') {
            this.diffViewMode = actionBtn.dataset.diffMode === 'split' ? 'split' : 'unified';
            const target = actionBtn.dataset.diffTarget || this._lastDiffTarget || 'solution';
            const file = actionBtn.dataset.diffFile || this._lastDiffFile || this.activeFile || this._pickDefaultFile();
            this.showDiffModal(file, target);
          } else if (action === 'apply-diff-solution') {
            this.applyReferenceSolution();
          } else if (action === 'command-palette') {
            this.openCommandPalette('commands');
          } else if (action === 'command-palette-files') {
            this.openCommandPalette('files');
          } else if (action === 'export-workspace') {
            this.exportWorkspace({ download: true });
          } else if (action === 'open-packages') this.showPackagesModal();
          else if (action === 'add-package') {
            const input = this.container.querySelector('#cl-pkg-input');
            if (input && input.value.trim()) {
              this.addNpmPackage(input.value.trim());
            }
          } else if (action === 'open-package-json') {
            this.closeModal();
            if (!this.files['package.json']) {
              this.files['package.json'] = JSON.stringify({ name: this.labId, version: '1.0.0', dependencies: {} }, null, 2) + '\n';
              this._saveState();
              this._syncAllModels();
            }
            this.openFile('package.json');
          } else if (action === 'close-modal') this.closeModal();
          else if (action === 'apply-solution') this.applyReferenceSolution();
          else if (action === 'reset-lab') this.resetLab();
          else if (action === 'toggle-fullscreen') this.toggleFullscreen();
          else if (action === 'close-lab') {
            if (typeof this.onClose === 'function') this.onClose();
          } else if (action === 'new-file') {
            this.isCreatingFile = true;
            this._renderFileLists();
          } else if (action === 'new-file-root') {
            this.creatingItem = { type: 'file', parentFolder: '' };
            this._renderFileLists();
          } else if (action === 'new-folder-root') {
            this.creatingItem = { type: 'folder', parentFolder: '' };
            this._renderFileLists();
          } else if (action === 'new-file-folder') {
            const folder = actionBtn.dataset.clFolder || '';
            this.collapsedFolders.delete(folder);
            this.creatingItem = { type: 'file', parentFolder: folder };
            this._renderFileLists();
          } else if (action === 'new-folder-folder') {
            const folder = actionBtn.dataset.clFolder || '';
            this.collapsedFolders.delete(folder);
            this.creatingItem = { type: 'folder', parentFolder: folder };
            this._renderFileLists();
          } else if (action === 'delete-folder') {
            const folder = actionBtn.dataset.clFolder;
            if (folder) this.deleteFolder(folder);
          } else if (action === 'rename-folder') {
            const folder = actionBtn.dataset.clFolder;
            if (folder) {
              const newName = typeof window !== 'undefined' && window.prompt ? window.prompt('New folder name:', folder) : null;
              if (newName && newName.trim() && newName.trim() !== folder) {
                this.renameFolder(folder, newName.trim());
              }
            }
          } else if (action === 'toggle-folder') {
            const folder = actionBtn.dataset.clFolder || (actionBtn.closest('[data-cl-folder]')?.dataset.clFolder);
            if (folder) this.toggleFolder(folder);
          } else if (action === 'toggle-guide') {
            this.toggleGuide();
          } else if (action === 'toggle-drawer') {
            const drawer = this.container.querySelector('#cl-drawer');
            if (drawer) drawer.classList.toggle('is-minimized');
            if (this.editor) setTimeout(() => this.editor.layout(), 50);
          } else if (action === 'clear-terminal') {
            this.terminalLogs = [];
            this.lastTestResults = [];
            this._renderDrawerBody();
          } else if (action === 'toggle-hint') {
            const box = this.container.querySelector('#cl-hint-box');
            if (box) box.classList.toggle('open');
          }
          return;
        }

        const folderItem = e.target.closest('.codelab-folder-item');
        if (folderItem && !e.target.closest('.codelab-node-action, [data-cl-action]')) {
          const folder = folderItem.dataset.clFolder;
          if (folder) this.toggleFolder(folder);
          return;
        }
      });
    }

    // ── Right-Click Context Menu ────────────────────────────────────────────
    openContextMenu(x, y, items = []) {
      const slot = this.container.querySelector('#cl-context-menu-slot');
      if (!slot) return;
      const safeX = Math.max(8, Number(x) || 80);
      const safeY = Math.max(8, Number(y) || 80);
      this._contextMenuItems = items;

      const itemsHtml = items.map(item => {
        if (item.divider) {
          return '<div class="codelab-context-menu__divider" role="separator"></div>';
        }
        return `
          <button type="button" class="codelab-context-menu__item ${item.danger ? 'is-danger' : ''}" role="menuitem" data-ctx-action="${escapeHtml(item.action || '')}" data-ctx-target="${escapeHtml(item.target || '')}">
            <span class="codelab-context-menu__label">${escapeHtml(item.label || '')}</span>
            ${item.shortcut ? `<span class="codelab-context-menu__kbd">${escapeHtml(item.shortcut)}</span>` : ''}
          </button>
        `;
      }).join('');

      slot.innerHTML = `
        <div class="codelab-context-menu" role="menu" aria-label="Context Menu" style="left:${safeX}px;top:${safeY}px;">
          ${itemsHtml}
        </div>
      `;
    }

    closeContextMenu() {
      const slot = this.container.querySelector('#cl-context-menu-slot');
      if (slot) slot.innerHTML = '';
      this._contextMenuItems = null;
    }

    // ── VS Code Command Palette & Quick Open ────────────────────────────────
    _getPaletteCommands() {
      return [
        { id: 'run-demo', label: 'CodeLab: Run Demo Script', shortcut: '⇧⌘↵', action: () => this.runDemo() },
        { id: 'run-tests', label: 'CodeLab: Run Unit Tests', shortcut: '⌘↵', action: () => this.runTests() },
        { id: 'verify-step', label: 'CodeLab: Verify Current Guided Step', shortcut: '⌘↵', action: () => this.verifyCurrentStep() },
        { id: 'compare-solution', label: 'CodeLab: Compare Active File with Reference Solution (Diff)', action: () => this.showDiffModal(this.activeFile || this._pickDefaultFile(), 'solution') },
        { id: 'compare-starter', label: 'CodeLab: Compare Active File with Starter Template (Diff)', action: () => this.showDiffModal(this.activeFile || this._pickDefaultFile(), 'starter') },
        { id: 'apply-solution', label: 'CodeLab: Apply Reference Solution to Active File', action: () => this.applyReferenceSolution() },
        { id: 'new-file', label: 'File: New File...', action: () => this.startInlineCreate('file', '') },
        { id: 'new-folder', label: 'File: New Folder...', action: () => this.startInlineCreate('folder', '') },
        { id: 'rename-active', label: 'File: Rename Active File...', shortcut: 'F2', action: () => { if (this.activeFile) this.startInlineRename('file', this.activeFile); } },
        { id: 'delete-active', label: 'File: Delete Active File', action: () => { if (this.activeFile) this.deleteFile(this.activeFile); } },
        { id: 'export-workspace', label: 'Workspace: Export Workspace as JSON', action: () => this.exportWorkspace({ download: true }) },
        { id: 'reset-workspace', label: 'Workspace: Reset Workspace to Clean State', action: () => this.resetLab() },
        { id: 'switch-lang', label: 'Language: Switch JavaScript / TypeScript', action: () => this.setLanguage(this.lang === 'js' ? 'ts' : 'js') },
        { id: 'switch-mode', label: 'Mode: Switch Guided / Sandbox Mode', action: () => this.setMode(this.mode === 'guided' ? 'sandbox' : 'guided') },
        { id: 'toggle-guide', label: 'View: Toggle Guide Sidebar', action: () => this.toggleGuide() },
        { id: 'toggle-drawer', label: 'View: Toggle Bottom Drawer (Tests / Terminal / VFS)', action: () => {
          const drawer = this.container.querySelector('#cl-drawer');
          if (drawer) drawer.classList.toggle('is-minimized');
          if (this.editor) setTimeout(() => this.editor.layout(), 50);
        } },
        { id: 'toggle-fullscreen', label: 'View: Toggle Fullscreen Workbench', action: () => this.toggleFullscreen() },
        { id: 'open-packages', label: 'Packages: Manage NPM Dependencies & Runtime', action: () => this.showPackagesModal() }
      ];
    }

    openCommandPalette(mode = 'commands') {
      const slot = this.container.querySelector('#cl-modal-slot');
      if (!slot) return;
      this.paletteMode = mode === 'files' ? 'files' : 'commands';
      this.paletteSelectedIndex = 0;
      const initialVal = this.paletteMode === 'commands' ? '> ' : '';

      slot.innerHTML = `
        <div class="codelab-palette-backdrop">
          <div class="codelab-palette" role="dialog" aria-modal="true" aria-label="Command Palette">
            <div class="codelab-palette__header">
              <span class="codelab-palette__icon">${CL_ICONS.search}</span>
              <input id="cl-palette-input" class="codelab-palette__input" type="text" value="${escapeHtml(initialVal)}" placeholder="${this.paletteMode === 'commands' ? 'Type a command or remove > to search files…' : 'Search files by name (type > for commands)…'}" autocomplete="off" spellcheck="false" aria-label="Command Palette Input" />
              <span class="codelab-palette__hint">ESC to close</span>
            </div>
            <div id="cl-palette-list" class="codelab-palette__list" role="listbox"></div>
          </div>
        </div>
      `;

      this._renderPaletteList(initialVal);

      const input = slot.querySelector('#cl-palette-input');
      if (input) {
        input.focus();
        try {
          input.setSelectionRange(initialVal.length, initialVal.length);
        } catch (_) {}

        input.addEventListener('input', () => {
          this.paletteSelectedIndex = 0;
          this._renderPaletteList(input.value);
        });

        input.addEventListener('keydown', e => {
          const items = this._currentPaletteItems || [];
          if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (items.length > 0) {
              this.paletteSelectedIndex = (this.paletteSelectedIndex + 1) % items.length;
              this._renderPaletteList(input.value);
            }
          } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (items.length > 0) {
              this.paletteSelectedIndex = (this.paletteSelectedIndex - 1 + items.length) % items.length;
              this._renderPaletteList(input.value);
            }
          } else if (e.key === 'Enter') {
            e.preventDefault();
            this._executePaletteSelection(this.paletteSelectedIndex);
          } else if (e.key === 'Escape') {
            e.preventDefault();
            this.closeModal();
          }
        });
      }
    }

    _renderPaletteList(rawValue = '') {
      const listEl = this.container.querySelector('#cl-palette-list');
      if (!listEl) return;
      const trimmed = String(rawValue || '').trim();
      const isCommandQuery = trimmed.startsWith('>') || (this.paletteMode === 'commands' && rawValue.startsWith('>'));
      const query = (trimmed.startsWith('>') ? trimmed.slice(1) : trimmed).trim().toLowerCase();

      let items = [];
      if (isCommandQuery) {
        const cmds = this._getPaletteCommands();
        items = cmds
          .filter(c => !query || c.label.toLowerCase().includes(query) || c.id.toLowerCase().includes(query))
          .map(c => ({
            type: 'command',
            id: c.id,
            label: c.label,
            shortcut: c.shortcut || '',
            action: c.action
          }));
      } else {
        const files = this._orderedFileNames();
        items = files
          .filter(f => !query || f.toLowerCase().includes(query))
          .map(f => ({
            type: 'file',
            id: f,
            label: f,
            shortcut: f === this.activeFile ? 'Active' : '',
            action: () => this.openFile(f)
          }));
      }

      this._currentPaletteItems = items;
      if (this.paletteSelectedIndex >= items.length) {
        this.paletteSelectedIndex = 0;
      }

      if (items.length === 0) {
        listEl.innerHTML = `<div class="codelab-palette__empty">No matching ${isCommandQuery ? 'commands' : 'files'} found</div>`;
        return;
      }

      listEl.innerHTML = items.map((item, idx) => `
        <button type="button" class="codelab-palette__item ${idx === this.paletteSelectedIndex ? 'is-selected' : ''}" role="option" aria-selected="${idx === this.paletteSelectedIndex}" data-palette-idx="${idx}" data-palette-id="${escapeHtml(item.id)}">
          <span class="codelab-palette__item-label">${escapeHtml(item.label)}</span>
          ${item.shortcut ? `<span class="codelab-palette__item-kbd">${escapeHtml(item.shortcut)}</span>` : ''}
        </button>
      `).join('');
    }

    _executePaletteSelection(index) {
      const items = this._currentPaletteItems || [];
      const item = items[index];
      if (!item) return;
      this.closeModal();
      if (typeof item.action === 'function') {
        item.action();
      }
    }

    // ── Inline & Side-by-Side Diff Viewer ───────────────────────────────────
    _computeLineDiff(oldText, newText) {
      const oldLines = String(oldText || '').split('\n');
      const newLines = String(newText || '').split('\n');
      const m = oldLines.length;
      const n = newLines.length;

      // LCS dynamic programming matrix
      const dp = Array.from({ length: m + 1 }, () => new Int32Array(n + 1));
      for (let i = m - 1; i >= 0; i--) {
        for (let j = n - 1; j >= 0; j--) {
          if (oldLines[i] === newLines[j]) {
            dp[i][j] = 1 + dp[i + 1][j + 1];
          } else {
            dp[i][j] = Math.max(dp[i + 1][j], dp[i][j + 1]);
          }
        }
      }

      const hunks = [];
      let i = 0;
      let j = 0;
      let oldLineNum = 1;
      let newLineNum = 1;
      let added = 0;
      let removed = 0;

      while (i < m && j < n) {
        if (oldLines[i] === newLines[j]) {
          hunks.push({ type: 'same', text: oldLines[i], oldLine: oldLineNum++, newLine: newLineNum++ });
          i++;
          j++;
        } else if (dp[i + 1][j] >= dp[i][j + 1]) {
          hunks.push({ type: 'del', text: oldLines[i], oldLine: oldLineNum++, newLine: null });
          removed++;
          i++;
        } else {
          hunks.push({ type: 'add', text: newLines[j], oldLine: null, newLine: newLineNum++ });
          added++;
          j++;
        }
      }
      while (i < m) {
        hunks.push({ type: 'del', text: oldLines[i++], oldLine: oldLineNum++, newLine: null });
        removed++;
      }
      while (j < n) {
        hunks.push({ type: 'add', text: newLines[j++], oldLine: null, newLine: newLineNum++ });
        added++;
      }

      return { hunks, added, removed };
    }

    showDiffModal(targetFile = null, compareTarget = 'solution') {
      const slot = this.container.querySelector('#cl-modal-slot');
      if (!slot) return;

      const file = targetFile || this.activeFile || this._pickDefaultFile();
      const isStarter = compareTarget === 'starter';
      const baseFiles = this._getBaseFilesForModeAndLang(isStarter ? 'guided' : 'sandbox', this.lang);
      const refCode = baseFiles[file] !== undefined ? baseFiles[file] : '';
      const currentCode = this.files[file] !== undefined ? this.files[file] : '';

      // When comparing with starter: old = starter, new = current editor code
      // When comparing with solution: old = current editor code, new = reference solution
      const leftText = isStarter ? refCode : currentCode;
      const rightText = isStarter ? currentCode : refCode;
      const leftLabel = isStarter ? `Starter (${file})` : `Current Editor (${file})`;
      const rightLabel = isStarter ? `Current Editor (${file})` : `Reference Solution (${file})`;

      const diff = this._computeLineDiff(leftText, rightText);
      const viewMode = this.diffViewMode === 'split' ? 'split' : 'unified';
      this._lastDiffFile = file;
      this._lastDiffTarget = compareTarget;

      let diffBodyHtml = '';
      if (viewMode === 'unified') {
        diffBodyHtml = `
          <div class="codelab-diff-unified">
            ${diff.hunks.map(h => {
              const cls = h.type === 'add' ? 'codelab-diff-line--add' : h.type === 'del' ? 'codelab-diff-line--del' : 'codelab-diff-line--same';
              const prefix = h.type === 'add' ? '+' : h.type === 'del' ? '-' : ' ';
              return `
                <div class="codelab-diff-line ${cls}">
                  <span class="codelab-diff-gutter">${h.oldLine || ''}</span>
                  <span class="codelab-diff-gutter">${h.newLine || ''}</span>
                  <span class="codelab-diff-prefix">${prefix}</span>
                  <span class="codelab-diff-code">${escapeHtml(h.text)}</span>
                </div>
              `;
            }).join('')}
          </div>
        `;
      } else {
        const leftRows = diff.hunks.filter(h => h.type !== 'add');
        const rightRows = diff.hunks.filter(h => h.type !== 'del');
        diffBodyHtml = `
          <div class="codelab-diff-split">
            <div class="codelab-diff-pane">
              <div class="codelab-diff-pane__title">${escapeHtml(leftLabel)}</div>
              ${leftRows.map(h => `
                <div class="codelab-diff-line ${h.type === 'del' ? 'codelab-diff-line--del' : 'codelab-diff-line--same'}">
                  <span class="codelab-diff-gutter">${h.oldLine || ''}</span>
                  <span class="codelab-diff-prefix">${h.type === 'del' ? '-' : ' '}</span>
                  <span class="codelab-diff-code">${escapeHtml(h.text)}</span>
                </div>
              `).join('')}
            </div>
            <div class="codelab-diff-pane">
              <div class="codelab-diff-pane__title">${escapeHtml(rightLabel)}</div>
              ${rightRows.map(h => `
                <div class="codelab-diff-line ${h.type === 'add' ? 'codelab-diff-line--add' : 'codelab-diff-line--same'}">
                  <span class="codelab-diff-gutter">${h.newLine || ''}</span>
                  <span class="codelab-diff-prefix">${h.type === 'add' ? '+' : ' '}</span>
                  <span class="codelab-diff-code">${escapeHtml(h.text)}</span>
                </div>
              `).join('')}
            </div>
          </div>
        `;
      }

      slot.innerHTML = `
        <div class="codelab-modal-backdrop">
          <div class="codelab-modal codelab-diff-modal" role="dialog" aria-modal="true" aria-label="Diff Viewer — ${escapeHtml(file)}">
            <div class="codelab-modal__header">
              <div style="display:flex;align-items:center;gap:10px;">
                <span style="display:inline-flex;align-items:center;gap:6px;">${CL_ICONS.diff}<span>Diff — ${escapeHtml(file)} (${isStarter ? 'vs Starter' : 'vs Solution'})</span></span>
                <span class="codelab-diff-stats">
                  <span class="codelab-diff-stat--add">+${diff.added}</span>
                  <span class="codelab-diff-stat--del">-${diff.removed}</span>
                </span>
              </div>
              <div style="display:flex;align-items:center;gap:6px;">
                <div class="codelab-seg" role="group" aria-label="Diff View Mode">
                  <button type="button" class="codelab-seg__btn ${viewMode === 'unified' ? 'active' : ''}" data-cl-action="diff-mode" data-diff-mode="unified" data-diff-file="${escapeHtml(file)}" data-diff-target="${escapeHtml(compareTarget)}">Unified</button>
                  <button type="button" class="codelab-seg__btn ${viewMode === 'split' ? 'active' : ''}" data-cl-action="diff-mode" data-diff-mode="split" data-diff-file="${escapeHtml(file)}" data-diff-target="${escapeHtml(compareTarget)}">Split</button>
                </div>
                <button type="button" class="codelab-btn codelab-btn--test" data-cl-action="apply-diff-solution">Apply Reference Solution</button>
                <button type="button" class="codelab-btn" data-cl-action="close-modal">Close (Esc)</button>
              </div>
            </div>
            <div class="codelab-modal__body codelab-diff-body">
              ${diffBodyHtml}
            </div>
          </div>
        </div>
      `;
    }

    _bindSplitters() {
      const shell = this.container.querySelector('.codelab');
      const vSplitter = this.container.querySelector('#cl-splitter-v');
      const hSplitter = this.container.querySelector('#cl-splitter-h');
      if (!shell) return;

      if (vSplitter) {
        vSplitter.addEventListener('dblclick', () => {
          shell.style.setProperty('--cl-guide-width', '360px');
          if (this.editor) this.editor.layout();
        });

        vSplitter.addEventListener('pointerdown', e => {
          e.preventDefault();
          vSplitter.classList.add('is-dragging');
          shell.classList.add('is-resizing');
          vSplitter.setPointerCapture(e.pointerId);

          const onMove = ev => {
            const rect = shell.getBoundingClientRect();
            const minW = 240;
            const maxW = Math.max(minW, Math.floor(rect.width * 0.55));
            const nextW = Math.min(maxW, Math.max(minW, Math.round(ev.clientX - rect.left)));
            shell.style.setProperty('--cl-guide-width', `${nextW}px`);
            if (this.editor) this.editor.layout();
          };

          const onUp = ev => {
            vSplitter.classList.remove('is-dragging');
            shell.classList.remove('is-resizing');
            try { vSplitter.releasePointerCapture(ev.pointerId); } catch (_) {}
            vSplitter.removeEventListener('pointermove', onMove);
            vSplitter.removeEventListener('pointerup', onUp);
          };

          vSplitter.addEventListener('pointermove', onMove);
          vSplitter.addEventListener('pointerup', onUp);
        });
      }

      if (hSplitter) {
        hSplitter.addEventListener('dblclick', () => {
          const drawer = this.container.querySelector('#cl-drawer');
          if (drawer) drawer.classList.remove('is-minimized');
          shell.style.setProperty('--cl-drawer-height', '235px');
          if (this.editor) this.editor.layout();
        });

        hSplitter.addEventListener('pointerdown', e => {
          e.preventDefault();
          const mainEl = this.container.querySelector('.codelab-main');
          const drawer = this.container.querySelector('#cl-drawer');
          if (!mainEl) return;
          if (drawer) drawer.classList.remove('is-minimized');

          hSplitter.classList.add('is-dragging');
          shell.classList.add('is-resizing-row');
          hSplitter.setPointerCapture(e.pointerId);

          const onMove = ev => {
            const rect = mainEl.getBoundingClientRect();
            const minH = 110;
            const maxH = Math.max(minH, Math.floor(rect.height * 0.7));
            const nextH = Math.min(maxH, Math.max(minH, Math.round(rect.bottom - ev.clientY)));
            shell.style.setProperty('--cl-drawer-height', `${nextH}px`);
            if (this.editor) this.editor.layout();
          };

          const onUp = ev => {
            hSplitter.classList.remove('is-dragging');
            shell.classList.remove('is-resizing-row');
            try { hSplitter.releasePointerCapture(ev.pointerId); } catch (_) {}
            hSplitter.removeEventListener('pointermove', onMove);
            hSplitter.removeEventListener('pointerup', onUp);
          };

          hSplitter.addEventListener('pointermove', onMove);
          hSplitter.addEventListener('pointerup', onUp);
        });
      }
    }

    selectStep(idx, shouldJump = true) {
      if (idx < 0 || idx >= this.steps.length) return;
      this.activeStepIndex = idx;
      this.guideTab = 'steps';
      this._saveState();
      this._renderStepPills();
      this._renderGuidePane();

      if (shouldJump) {
        const step = this.steps[idx];
        if (step) {
          const rawTarget = step.targetFile || this._pickDefaultFile();
          const targetFile = this.lang === 'ts' && rawTarget ? rawTarget.replace(/\.js$/, '.ts') : rawTarget;
          this.openFile(targetFile, step.targetSymbol || `TODO (Step ${idx + 1})`);
        }
      }
      this._renderBreadcrumbs();
    }

    openFile(filename, symbolToFind = '') {
      if (!this.files || this.files[filename] === undefined) return;
      if (!Array.isArray(this.openTabs)) this.openTabs = [];
      if (!this.openTabs.includes(filename)) {
        this.openTabs.push(filename);
      }
      this.activeFile = filename;
      this._saveState();
      this._syncActiveFileToView();
      this._emitEvent('codelab:file-open', { labId: this.labId, filename });

      if (symbolToFind && this.editor && this.monaco) {
        const model = this.editor.getModel();
        if (model) {
          const candidates = [
            `TODO (Step ${this.activeStepIndex + 1})`,
            symbolToFind
          ];
          const firstPart = symbolToFind.split('/')[0].trim();
          if (firstPart && firstPart !== symbolToFind) candidates.push(firstPart);
          if (firstPart.includes('.')) candidates.push(firstPart.split('.').pop().trim());
          for (const cand of candidates) {
            if (!cand) continue;
            const matches = model.findMatches(cand, false, false, false, null, true);
            if (matches && matches.length > 0) {
              const range = matches[0].range;
              this.editor.revealLineInCenter(range.startLineNumber);
              this.editor.setPosition({ lineNumber: range.startLineNumber, column: range.startColumn });
              this._stepDecorations = this.editor.deltaDecorations(this._stepDecorations || [], [
                {
                  range: new this.monaco.Range(range.startLineNumber, 1, range.startLineNumber, 1),
                  options: { isWholeLine: true, className: 'codelab-target-line-highlight' }
                }
              ]);
              this.editor.focus();
              break;
            }
          }
        }
      }
    }

    setMode(newMode) {
      if (newMode !== 'guided' && newMode !== 'sandbox') return;
      if (this.mode === newMode) return;
      this.mode = newMode;
      this.files = this._computeInitialFiles();
      this.openTabs = this._orderedFileNames();
      this.activeFile = this._pickDefaultFile();
      this._saveState();

      this.container.querySelectorAll('[data-cl-mode]').forEach(btn => {
        const isActive = btn.dataset.clMode === this.mode;
        btn.classList.toggle('active', isActive);
        btn.setAttribute('aria-selected', String(isActive));
      });

      const primaryBtn = this.container.querySelector('#cl-primary-exec-btn');
      if (primaryBtn) {
        if (this.mode === 'guided') {
          primaryBtn.setAttribute('data-cl-action', 'verify-step');
          primaryBtn.setAttribute('title', 'Verify Current Step (⌘+Enter)');
          primaryBtn.innerHTML = `${CL_ICONS.check}<span>Verify Step</span><span class="codelab-btn__kbd">⌘↵</span>`;
        } else {
          primaryBtn.setAttribute('data-cl-action', 'run-tests');
          primaryBtn.setAttribute('title', 'Run Test Suite (⌘+Enter)');
          primaryBtn.innerHTML = `${CL_ICONS.check}<span>Run Tests</span><span class="codelab-btn__kbd">⌘↵</span>`;
        }
      }

      this._syncAllModels();
      this._syncActiveFileToView();
      this._renderGuidePane();
    }

    setLanguage(newLang) {
      if (newLang !== 'js' && newLang !== 'ts') return;
      if (this.lang === newLang) return;
      this.lang = newLang;
      this.files = this._computeInitialFiles();
      this.openTabs = this._orderedFileNames();
      this.activeFile = this._pickDefaultFile();
      this._saveState();

      this.container.querySelectorAll('[data-cl-lang]').forEach(btn => {
        const isActive = btn.dataset.clLang === this.lang;
        btn.classList.toggle('active', isActive);
        btn.setAttribute('aria-pressed', String(isActive));
      });

      this._syncAllModels();
      this._syncActiveFileToView();
      this._renderGuidePane();
    }

    configure({ mode, lang, stepIndex } = {}) {
      if (mode === 'guided' || mode === 'sandbox') {
        this.setMode(mode);
      }
      if (lang === 'js' || lang === 'ts') {
        this.setLanguage(lang);
      }
      if (typeof stepIndex === 'number' && !Number.isNaN(stepIndex)) {
        this.selectStep(stepIndex, true);
      }
      if (this.editor) {
        setTimeout(() => this.editor.layout(), 60);
      }
    }

    toggleFullscreen() {
      const shell = this.container.querySelector('.codelab');
      if (!shell) return;
      this.isFullscreen = !this.isFullscreen;
      shell.classList.toggle('is-fullscreen', this.isFullscreen);
      if (this.editor) setTimeout(() => this.editor.layout(), 50);
    }

    stopExecution() {
      if (typeof root.CodeLabRuntime?.cancelWorkerExecution === 'function') {
        root.CodeLabRuntime.cancelWorkerExecution('Execution stopped by user', this.instanceId);
      }
      this.isRunning = false;
      this._setRuntimeStatus('idle', 'Ready · Node v22 VFS');
      this._updateRunStateUI();
    }

    resetLab() {
      this.completedSteps = new Set();
      this.folders = new Set();
      this.collapsedFolders = new Set();
      this.files = this._getBaseFilesForModeAndLang(this.mode, this.lang);
      for (const filePath of Object.keys(this.files)) {
        const parts = filePath.split('/');
        for (let i = 1; i < parts.length; i++) {
          this.folders.add(parts.slice(0, i).join('/'));
        }
      }
      this.openTabs = this._orderedFileNames();
      this.activeFile = this._pickDefaultFile();
      const key = `${this.mode}:${this.lang}`;
      if (this.savedState.customFiles) {
        delete this.savedState.customFiles[key];
      }
      this._saveState();
      this._syncAllModels();
      this._syncActiveFileToView();
      this._renderStepPills();
      this.terminalLogs.push({ type: 'system', text: `↺ Reset workspace files to clean ${this.mode} (${this.lang.toUpperCase()}) state.` });
      this._renderDrawerBody();
    }

    showPackagesModal() {
      const slot = this.container.querySelector('#cl-modal-slot');
      if (!slot) return;
      const rawDetected = this._detectPackages();
      const rawPkgs = Array.isArray(rawDetected)
        ? rawDetected
        : (rawDetected && Array.isArray(rawDetected.npmPackages) ? rawDetected.npmPackages : []);
      const pkgs = rawPkgs.map(p => {
        if (typeof p === 'string') {
          const atIdx = p.lastIndexOf('@');
          if (atIdx > 0) {
            return { name: p.slice(0, atIdx), version: p.slice(atIdx + 1) || 'latest' };
          }
          return { name: p, version: (rawDetected && rawDetected.pkgJsonDeps && rawDetected.pkgJsonDeps[p]) || 'latest' };
        }
        return p;
      });
      const builtins = [
        'node:fs', 'node:path', 'node:crypto', 'node:events', 'node:http',
        'node:net', 'node:stream', 'node:buffer', 'node:util', 'node:test', 'node:assert'
      ];

      slot.innerHTML = `
        <div class="codelab-modal-backdrop">
          <div class="codelab-modal" role="dialog" aria-modal="true" aria-label="Packages & Node Runtime">
            <div class="codelab-modal__header">
              <span style="display:inline-flex;align-items:center;gap:6px;">${CL_ICONS.box}<span>Packages &amp; Virtual Node Runtime</span></span>
              <div style="display:flex;gap:8px;">
                <button type="button" class="codelab-btn" data-cl-action="open-package-json">Edit package.json</button>
                <button type="button" class="codelab-btn" data-cl-action="close-modal">Close (Esc)</button>
              </div>
            </div>
            <div class="codelab-modal__body" style="font-family:var(--cl-font-sans);">
              <div style="display:flex;gap:8px;margin-bottom:16px;">
                <input id="cl-pkg-input" type="text" placeholder="Add npm package (e.g. zod, lru-cache, nanoid@5.0.0)..." style="flex:1;height:32px;padding:0 10px;background:var(--cl-bg);border:1px solid var(--cl-border-strong);border-radius:var(--cl-radius-sm);color:var(--cl-fg);font-family:var(--cl-font-mono);font-size:12px;outline:none;" />
                <button type="button" class="codelab-btn codelab-btn--primary" data-cl-action="add-package">+ Add Dependency</button>
              </div>
              <div style="margin-bottom:16px;">
                <div style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;color:var(--cl-fg-muted);margin-bottom:8px;">
                  External NPM Packages (${pkgs.length})
                </div>
                ${pkgs.length === 0 ? `
                  <div style="padding:12px;border:1px solid var(--cl-border);border-radius:var(--cl-radius-sm);background:var(--cl-bg);color:var(--cl-fg-muted);font-size:12.5px;">
                    No external npm packages imported yet. Any <code>import ... from 'pkg'</code> or <code>require('pkg')</code> in your code is automatically resolved via <strong>esm.sh</strong> when you run or test.
                  </div>
                ` : `
                  <div style="display:flex;flex-direction:column;gap:6px;">
                    ${pkgs.map(p => `
                      <div style="display:flex;align-items:center;justify-content:space-between;padding:8px 12px;border:1px solid var(--cl-border);border-radius:var(--cl-radius-sm);background:var(--cl-bg);font-family:var(--cl-font-mono);font-size:12px;">
                        <span style="color:var(--cl-fg);font-weight:600;">${escapeHtml(p.name)}</span>
                        <span style="color:var(--cl-accent);">${escapeHtml(p.version)} · esm.sh</span>
                      </div>
                    `).join('')}
                  </div>
                `}
              </div>
              <div>
                <div style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;color:var(--cl-fg-muted);margin-bottom:8px;">
                  Built-in Virtual Node.js Modules (Zero-Latency In-Memory VFS)
                </div>
                <div style="display:flex;flex-wrap:wrap;gap:6px;">
                  ${builtins.map(b => `
                    <span style="padding:3px 8px;border:1px solid var(--cl-border);border-radius:4px;background:var(--cl-bg);font-family:var(--cl-font-mono);font-size:11px;color:var(--cl-fg-muted);">${b}</span>
                  `).join('')}
                </div>
              </div>
            </div>
          </div>
        </div>
      `;

      const input = slot.querySelector('#cl-pkg-input');
      if (input) {
        input.focus();
        input.addEventListener('keydown', e => {
          if (e.key === 'Enter' && input.value.trim()) {
            e.preventDefault();
            this.addNpmPackage(input.value.trim());
          }
        });
      }
    }

    addNpmPackage(rawSpec) {
      const spec = rawSpec.trim();
      if (!spec) return;
      let name = spec;
      let version = 'latest';
      const atIdx = spec.lastIndexOf('@');
      if (atIdx > 0) {
        name = spec.slice(0, atIdx);
        version = spec.slice(atIdx + 1) || 'latest';
      }
      let pkgJson = { name: this.labId, version: '1.0.0', dependencies: {} };
      if (this.files['package.json']) {
        try {
          pkgJson = JSON.parse(this.files['package.json']);
        } catch (_) {}
      }
      if (!pkgJson.dependencies || typeof pkgJson.dependencies !== 'object') {
        pkgJson.dependencies = {};
      }
      pkgJson.dependencies[name] = version;
      this.files['package.json'] = JSON.stringify(pkgJson, null, 2) + '\n';
      this._saveState();
      this._syncAllModels();
      this._renderFileLists();
      this._updateStatusBar();
      this.showPackagesModal();
    }

    showSolutionModal() {
      const slot = this.container.querySelector('#cl-modal-slot');
      if (!slot) return;
      const refFiles = this._getBaseFilesForModeAndLang('sandbox', this.lang);
      const targetFile = refFiles[this.activeFile] ? this.activeFile : this._pickDefaultFile();
      const refCode = refFiles[targetFile] || '// Reference solution not found';

      slot.innerHTML = `
        <div class="codelab-modal-backdrop">
          <div class="codelab-modal" role="dialog" aria-modal="true" aria-label="Reference Solution">
            <div class="codelab-modal__header">
              <span style="display:inline-flex;align-items:center;gap:6px;">${CL_ICONS.lightbulb}<span>Reference Solution — ${escapeHtml(targetFile)}</span></span>
              <div style="display:flex;gap:8px;">
                <button type="button" class="codelab-btn" data-cl-action="compare-diff" data-diff-target="solution" data-diff-file="${escapeHtml(targetFile)}">
                  ${CL_ICONS.diff}<span>Compare Diff</span>
                </button>
                <button type="button" class="codelab-btn codelab-btn--test" data-cl-action="apply-solution">
                  Apply Solution to Editor
                </button>
                <button type="button" class="codelab-btn" data-cl-action="close-modal">Close (Esc)</button>
              </div>
            </div>
            <div class="codelab-modal__body">
              <pre style="margin:0;white-space:pre-wrap;color:var(--cl-fg);">${escapeHtml(refCode)}</pre>
            </div>
          </div>
        </div>
      `;
    }

    closeModal() {
      const slot = this.container.querySelector('#cl-modal-slot');
      if (slot) slot.innerHTML = '';
    }

    applyReferenceSolution() {
      const refFiles = this._getBaseFilesForModeAndLang('sandbox', this.lang);
      const targetFile = refFiles[this.activeFile] ? this.activeFile : this._pickDefaultFile();
      if (refFiles[targetFile]) {
        this.files[targetFile] = refFiles[targetFile];
        this._saveState();
        this._syncAllModels();
        this._syncActiveFileToView();
      }
      this.closeModal();
      this.runTests();
    }

    // ── Execution Engine (Web Worker + Virtual Node Runtime) ───────────────
    async _executeRuntime(execOptions) {
      const t0 = typeof performance !== 'undefined' ? performance.now() : Date.now();
      const payload = { ...execOptions, instanceId: this.instanceId };
      try {
        if (typeof root.CodeLabRuntime?.preloadNpmPackages === 'function' && payload && payload.files) {
          const rawDetected = this._detectPackages();
          const detectedList = Array.isArray(rawDetected)
            ? rawDetected
            : (rawDetected && Array.isArray(rawDetected.npmPackages) ? rawDetected.npmPackages : []);
          if (detectedList.length > 0) {
            this._setRuntimeStatus('fetching', `Fetching ${detectedList.map(d => typeof d === 'string' ? d : d.name).join(', ')}...`);
          }
          await root.CodeLabRuntime.preloadNpmPackages(payload.files, pkgName => {
            this._setRuntimeStatus('fetching', `Fetching ${pkgName} from esm.sh...`);
          });
        }
        this._setRuntimeStatus('running', `Running ${payload.entry || payload.mode || 'script'}...`);
        let res;
        if (typeof root.CodeLabRuntime?.executeInWorker === 'function') {
          res = await root.CodeLabRuntime.executeInWorker(payload);
        } else if (typeof root.CodeLabRuntime?.executeInVirtualRuntime === 'function') {
          res = await root.CodeLabRuntime.executeInVirtualRuntime(payload);
        } else {
          throw new Error('CodeLabRuntime is not loaded.');
        }
        const elapsed = Math.round((typeof performance !== 'undefined' ? performance.now() : Date.now()) - t0);
        this.lastRunDurationMs = res && typeof res.durationMs === 'number' ? res.durationMs : elapsed;
        this._setRuntimeStatus('idle', 'Ready · Node v22 VFS');
        return res;
      } catch (err) {
        this._setRuntimeStatus('error', 'Execution error');
        throw err;
      }
    }

    async runDemo() {
      if (this.isRunning) return;
      const entry = this._findEntryFile('demo');
      if (!entry) {
        this.terminalLogs.push({ type: 'stderr', text: 'No demo.js / demo.ts file found in this workspace.' });
        this.drawerTab = 'terminal';
        this._renderDrawerBody();
        return;
      }

      this.isRunning = true;
      this._updateRunStateUI();
      this.drawerTab = 'terminal';
      this.terminalLogs.push({ type: 'system', text: `\n$ node ${entry}` });
      this._renderDrawerBody();

      try {
        const res = await this._executeRuntime({
          files: { ...this.files },
          entry,
          mode: 'run'
        });

        if (res.stdout) {
          this.terminalLogs.push({ type: 'stdout', text: res.stdout.replace(/\n$/, '') });
        }
        if (res.stderr) {
          this.terminalLogs.push({ type: 'stderr', text: res.stderr.replace(/\n$/, '') });
        }
        if (res.error) {
          this.terminalLogs.push({ type: 'stderr', text: formatErrorText(res.error) });
        }
        this.lastFsSnapshot = res.fsSnapshot || [];
        this.lastHttpTrace = res.httpTrace || [];

        if (this.onRun) {
          try { this.onRun(res); } catch (_) {}
        }
        this._emitEvent('codelab:run', { labId: this.labId, mode: 'run', entry, result: res });
      } catch (err) {
        this.terminalLogs.push({ type: 'stderr', text: `Execution error: ${formatErrorText(err)}` });
      } finally {
        this.isRunning = false;
        this._updateRunStateUI();
      }

      this._renderDrawerBody();
    }

    async runTests(filterTestNames = null) {
      if (this.isRunning) return;
      const entry = this._findEntryFile('test');
      if (!entry) {
        this.terminalLogs.push({ type: 'stderr', text: 'No test.js / test.ts file found in this workspace.' });
        this.drawerTab = 'terminal';
        this._renderDrawerBody();
        return;
      }

      this.isRunning = true;
      this._updateRunStateUI();
      this.drawerTab = 'tests';
      this.terminalLogs.push({ type: 'system', text: `\n$ node ${entry}` });

      try {
        const res = await this._executeRuntime({
          files: { ...this.files },
          entry,
          mode: 'test',
          testFilter: filterTestNames
        });

        this.lastTestResults = res.testResults || [];
        this.lastFsSnapshot = res.fsSnapshot || [];
        this.lastHttpTrace = res.httpTrace || [];

        if (res.stdout) {
          this.terminalLogs.push({ type: 'stdout', text: res.stdout.replace(/\n$/, '') });
        }
        if (res.stderr) {
          this.terminalLogs.push({ type: 'stderr', text: res.stderr.replace(/\n$/, '') });
        }
        if (res.error) {
          this.terminalLogs.push({ type: 'stderr', text: formatErrorText(res.error) });
        }

        if (this.onTestResult) {
          try { this.onTestResult(res); } catch (_) {}
        }
        if (this.onRun) {
          try { this.onRun(res); } catch (_) {}
        }
        this._emitEvent('codelab:run', { labId: this.labId, mode: 'test', entry, result: res });

        // Check guided step completion
        const resultMap = new Map(this.lastTestResults.map(r => [r.name, r.status === 'pass']));
        let newlyCompleted = false;
        this.steps.forEach((step, sIdx) => {
          if (Array.isArray(step.testNames) && step.testNames.length > 0) {
            const allStepPass = step.testNames.every(tName => resultMap.get(tName) === true);
            if (allStepPass && !this.completedSteps.has(step.id)) {
              this.completedSteps.add(step.id);
              newlyCompleted = true;
              if (this.onStepComplete) {
                try { this.onStepComplete(step, sIdx); } catch (_) {}
              }
              this._emitEvent('codelab:step-complete', {
                labId: this.labId,
                step,
                stepIndex: sIdx,
                completedSteps: Array.from(this.completedSteps)
              });
            }
          }
        });
        if (newlyCompleted) {
          this._saveState();
          if (this.steps.length > 0 && this.completedSteps.size >= this.steps.length) {
            if (this.onLabComplete) {
              try { this.onLabComplete(this.labId); } catch (_) {}
            }
            this._emitEvent('codelab:lab-complete', {
              labId: this.labId,
              completedSteps: Array.from(this.completedSteps)
            });
          }
        }
      } catch (err) {
        this.terminalLogs.push({ type: 'stderr', text: `Test runner error: ${formatErrorText(err)}` });
      } finally {
        this.isRunning = false;
        this._updateRunStateUI();
      }

      this._renderStepPills();
      this._renderGuidePane();
      this._renderDrawerBody();
    }

    async verifyCurrentStep() {
      await this.runTests();
      const step = this.steps[this.activeStepIndex];
      if (step && this.completedSteps.has(step.id) && this.activeStepIndex < this.steps.length - 1) {
        // Advance to next step and jump to its target symbol/TODO
        this.selectStep(this.activeStepIndex + 1, true);
      }
    }

    async _handleReplCommand(cmd) {
      this.terminalLogs.push({ type: 'system', text: `codelab$ ${cmd}` });

      if (cmd === 'clear') {
        this.terminalLogs = [];
        this._renderDrawerBody();
        return;
      }
      if (cmd === 'help') {
        this.terminalLogs.push({
          type: 'stdout',
          text: [
            'Available commands:',
            '  node demo.js | run     Run the demo workload script',
            '  node test.js | test    Run the full unit test suite',
            '  ls                     List files in workspace & /tmp virtual disk',
            '  cat <filename>         Display contents of a workspace file',
            '  clear                  Clear terminal output',
            '  <JS/TS expression>     Evaluate live code with require() access to workspace files'
          ].join('\n')
        });
        this._renderDrawerBody();
        return;
      }
      if (cmd === 'ls') {
        const wsFiles = Object.keys(this.files);
        const vfsFiles = this.lastFsSnapshot.map(f => f.path);
        const all = Array.from(new Set([...wsFiles, ...vfsFiles]));
        this.terminalLogs.push({ type: 'stdout', text: all.join('  ') });
        this._renderDrawerBody();
        return;
      }
      if (cmd.startsWith('cat ')) {
        const target = cmd.slice(4).trim();
        if (this.files[target] != null) {
          this.terminalLogs.push({ type: 'stdout', text: this.files[target] });
        } else {
          const snap = this.lastFsSnapshot.find(f => f.path === target || f.path.endsWith('/' + target));
          if (snap) {
            this.terminalLogs.push({ type: 'stdout', text: snap.preview || snap.hexPreview || `(${snap.size} bytes)` });
          } else {
            this.terminalLogs.push({ type: 'stderr', text: `cat: ${target}: No such file in virtual filesystem` });
          }
        }
        this._renderDrawerBody();
        return;
      }
      if (cmd === 'run' || /^node\s+\S*demo\.(js|ts)$/.test(cmd)) {
        await this.runDemo();
        return;
      }
      if (cmd === 'test' || /^node\s+\S*test\.(js|ts)$/.test(cmd)) {
        await this.runTests();
        return;
      }

      // Evaluate arbitrary JS/TS expression in the Virtual Runtime
      try {
        const res = await this._executeRuntime({
          files: { ...this.files },
          mode: 'repl',
          replCode: cmd
        });
        if (res.stdout) this.terminalLogs.push({ type: 'stdout', text: res.stdout.replace(/\n$/, '') });
        if (res.stderr) this.terminalLogs.push({ type: 'stderr', text: res.stderr.replace(/\n$/, '') });
        if (res.replValue !== undefined) {
          this.terminalLogs.push({ type: 'success', text: `→ ${res.replValue}` });
        }
        if (res.error) {
          this.terminalLogs.push({ type: 'stderr', text: formatErrorText(res.error) });
        }
      } catch (err) {
        this.terminalLogs.push({ type: 'stderr', text: formatErrorText(err) });
      }
      this._renderDrawerBody();
    }

    // ── Workspace Export / Import & Imperative Third-Party SDK APIs ────────
    downloadFile(filename) {
      if (!filename || this.files[filename] === undefined) return false;
      const content = this.files[filename];
      try {
        if (typeof Blob !== 'undefined' && typeof URL !== 'undefined' && typeof URL.createObjectURL === 'function' && typeof document !== 'undefined') {
          const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = filename.split('/').pop() || filename;
          a.click();
          setTimeout(() => URL.revokeObjectURL(url), 500);
        }
      } catch (_) {}
      return content;
    }

    exportWorkspace(options = {}) {
      const snapshot = {
        labId: this.labId,
        title: this.title,
        mode: this.mode,
        language: this.lang,
        activeFile: this.activeFile,
        openTabs: Array.isArray(this.openTabs) ? [...this.openTabs] : [],
        folders: Array.from(this.folders),
        files: { ...this.files },
        completedSteps: Array.from(this.completedSteps),
        exportedAt: new Date().toISOString()
      };
      if (options && options.download) {
        try {
          if (typeof Blob !== 'undefined' && typeof URL !== 'undefined' && typeof URL.createObjectURL === 'function' && typeof document !== 'undefined') {
            const blob = new Blob([JSON.stringify(snapshot, null, 2)], { type: 'application/json;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${this.labId || 'workspace'}.codelab.json`;
            a.click();
            setTimeout(() => URL.revokeObjectURL(url), 500);
          }
        } catch (_) {}
      }
      return snapshot;
    }

    importWorkspace(snapshotOrJson) {
      const data = typeof snapshotOrJson === 'string' ? JSON.parse(snapshotOrJson) : snapshotOrJson;
      if (!data || typeof data !== 'object') return false;
      if (data.mode === 'guided' || data.mode === 'sandbox') {
        this.mode = data.mode;
      }
      if (data.language === 'js' || data.language === 'ts') {
        this.lang = data.language;
      }
      if (data.files && typeof data.files === 'object') {
        this.setFiles(data.files);
      }
      if (Array.isArray(data.folders)) {
        for (const f of data.folders) {
          if (f) this.folders.add(f);
        }
      }
      if (Array.isArray(data.openTabs)) {
        this.openTabs = data.openTabs.filter(f => this.files[f] !== undefined);
      }
      if (data.activeFile && this.files[data.activeFile] !== undefined) {
        this.activeFile = data.activeFile;
      }
      this._saveState();
      this._syncAllModels();
      this._syncActiveFileToView();
      return true;
    }

    getFiles() {
      return { ...this.files };
    }

    setFiles(filesMap) {
      if (!filesMap || typeof filesMap !== 'object') return;
      for (const model of this.models.values()) {
        try { model.dispose(); } catch (_) {}
      }
      this.models.clear();
      this.files = {};
      this.folders = new Set();
      for (const [rawPath, content] of Object.entries(filesMap)) {
        const clean = String(rawPath).trim().replace(/^\/+/, '');
        if (!clean) continue;
        this.files[clean] = String(content ?? '');
        const parts = clean.split('/');
        for (let i = 1; i < parts.length; i++) {
          this.folders.add(parts.slice(0, i).join('/'));
        }
      }
      this.openTabs = this._orderedFileNames();
      if (!this.activeFile || this.files[this.activeFile] === undefined) {
        this.activeFile = this._pickDefaultFile();
      }
      this._saveState();
      this._syncAllModels();
      this._syncActiveFileToView();
    }

    getFile(path) {
      const clean = String(path || '').trim().replace(/^\/+/, '');
      return this.files[clean];
    }

    setFile(path, content) {
      const clean = String(path || '').trim().replace(/^\/+/, '');
      if (!clean) return;
      const isNew = this.files[clean] === undefined;
      const parts = clean.split('/');
      for (let i = 1; i < parts.length; i++) {
        this.folders.add(parts.slice(0, i).join('/'));
      }
      this.files[clean] = String(content ?? '');
      this._saveState();
      this._getOrCreateModel(clean);
      if (isNew) {
        this._emitEvent('codelab:file-create', { labId: this.labId, filename: clean, content: this.files[clean] });
      }
      this._notifyCodeChange(clean, this.files[clean]);
      this._syncActiveFileToView();
    }

    getOpenTabs() {
      return Array.isArray(this.openTabs) ? [...this.openTabs] : [];
    }

    reset() {
      return this.resetLab();
    }

    on(eventName, handler) {
      if (!eventName || typeof handler !== 'function') return () => {};
      const key = String(eventName).trim();
      if (!this._eventListeners.has(key)) {
        this._eventListeners.set(key, new Set());
      }
      this._eventListeners.get(key).add(handler);
      return () => this.off(key, handler);
    }

    off(eventName, handler) {
      if (!eventName) return;
      const key = String(eventName).trim();
      const set = this._eventListeners.get(key);
      if (set) {
        if (handler) set.delete(handler);
        else set.clear();
      }
    }

    use(plugin, pluginOptions = {}) {
      if (!plugin) return this;
      if (typeof plugin === 'function') {
        plugin(this, pluginOptions);
      } else if (typeof plugin === 'object' && typeof plugin.install === 'function') {
        plugin.install(this, pluginOptions);
      }
      return this;
    }

    destroy() {
      if (this._escHandler && typeof document !== 'undefined') {
        document.removeEventListener('keydown', this._escHandler);
      }
      if (this._themeObserver) {
        this._themeObserver.disconnect();
      }
      if (this.editor) {
        this.editor.dispose();
        this.editor = null;
      }
      for (const model of this.models.values()) {
        model.dispose();
      }
      this.models.clear();
      if (this._eventListeners) {
        this._eventListeners.clear();
      }
    }
  }

  // ── Register <code-lab> Custom Element ───────────────────────────────────
  let CodeLabElementClass = null;
  if (typeof HTMLElement !== 'undefined') {
    CodeLabElementClass = class CodeLabElement extends HTMLElement {
      connectedCallback() {
        if (this._instance) return;

        // Parse optional declarative <script type="application/json"> child config
        let inlineConfig = {};
        const jsonScript = this.querySelector('script[type="application/json"]');
        if (jsonScript && jsonScript.textContent) {
          try {
            inlineConfig = JSON.parse(jsonScript.textContent);
          } catch (_) {}
        }

        // Parse optional files JSON attribute
        let attrFiles = null;
        const filesAttr = this.getAttribute('files');
        if (filesAttr) {
          try {
            attrFiles = JSON.parse(filesAttr);
          } catch (_) {}
        }

        const labId = this.getAttribute('lab-id') || this.getAttribute('build-id') || this.dataset.labId || this.dataset.buildId || inlineConfig.id || inlineConfig.labId || 'custom-lab';

        this._instance = new CodeLabWorkbench(this, {
          ...inlineConfig,
          labId,
          title: this.getAttribute('title') || inlineConfig.title || undefined,
          mode: this.getAttribute('mode') || inlineConfig.mode || undefined,
          language: this.getAttribute('language') || this.getAttribute('lang') || inlineConfig.language || undefined,
          theme: this.getAttribute('theme') || inlineConfig.theme || undefined,
          entry: this.getAttribute('entry') || inlineConfig.entry || undefined,
          testEntry: this.getAttribute('test-entry') || inlineConfig.testEntry || undefined,
          ...(attrFiles ? { files: attrFiles } : {})
        });
      }

      getFiles() { return this._instance ? this._instance.getFiles() : {}; }
      setFiles(filesMap) { if (this._instance) this._instance.setFiles(filesMap); }
      getFile(path) { return this._instance ? this._instance.getFile(path) : undefined; }
      setFile(path, content) { if (this._instance) this._instance.setFile(path, content); }
      createFile(path, content) { if (this._instance) this._instance.createFile(path, content); }
      deleteFile(path) { if (this._instance) this._instance.deleteFile(path); }
      renameFile(oldPath, newPath) { if (this._instance) this._instance.renameFile(oldPath, newPath); }
      createFolder(path) { if (this._instance) this._instance.createFolder(path); }
      deleteFolder(path) { if (this._instance) this._instance.deleteFolder(path); }
      renameFolder(oldPath, newPath) { if (this._instance) this._instance.renameFolder(oldPath, newPath); }
      openFile(path, sym) { if (this._instance) this._instance.openFile(path, sym); }
      closeTab(path) { if (this._instance) this._instance.closeTab(path); }
      getOpenTabs() { return this._instance ? this._instance.getOpenTabs() : []; }
      runDemo() { return this._instance ? this._instance.runDemo() : Promise.resolve(); }
      runTests(filter) { return this._instance ? this._instance.runTests(filter) : Promise.resolve(); }
      stopExecution() { if (this._instance) this._instance.stopExecution(); }
      reset() { if (this._instance) this._instance.reset(); }
      exportWorkspace(opts) { return this._instance ? this._instance.exportWorkspace(opts) : null; }
      importWorkspace(snap) { return this._instance ? this._instance.importWorkspace(snap) : false; }
      on(ev, fn) { return this._instance ? this._instance.on(ev, fn) : () => {}; }
      off(ev, fn) { if (this._instance) this._instance.off(ev, fn); }
      use(plugin, opts) { if (this._instance) this._instance.use(plugin, opts); return this; }

      disconnectedCallback() {
        if (this._instance) {
          this._instance.destroy();
          this._instance = null;
        }
      }
    };

    if (typeof customElements !== 'undefined' && !customElements.get('code-lab')) {
      customElements.define('code-lab', CodeLabElementClass);
    }
  }

  // ── Public SDK API ───────────────────────────────────────────────────────
  function mountCodeLab(container, options = {}) {
    const el = typeof container === 'string' ? document.querySelector(container) : container;
    if (!el) return null;
    if (el._codeLabInstance) {
      el._codeLabInstance.destroy();
    }
    const instance = new CodeLabWorkbench(el, options);
    el._codeLabInstance = instance;
    return instance;
  }

  const CodeLabSDK = {
    Workbench: CodeLabWorkbench,
    CodeLabWorkbench,
    CodeLabElement: CodeLabElementClass,
    Runtime: root.CodeLabRuntime,
    mount: mountCodeLab,
    create: mountCodeLab,
    unmount(container) {
      const el = typeof container === 'string' ? document.querySelector(container) : container;
      if (el && el._codeLabInstance) {
        el._codeLabInstance.destroy();
        el._codeLabInstance = null;
      }
    }
  };

  root.CodeLab = CodeLabSDK;
  root.CodeLabWorkbench = CodeLabWorkbench;
  if (CodeLabElementClass) {
    root.CodeLabElement = CodeLabElementClass;
  }
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = CodeLabSDK;
  }
})(typeof window !== 'undefined' ? window : globalThis);

  })();

  const CodeLab = root.CodeLab;
  const CodeLabWorkbench = root.CodeLabWorkbench;
  const CodeLabElement = root.CodeLabElement;

  // Support CommonJS / Node.js / Bundlers
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = Object.assign({}, CodeLab, {
      CodeLab: CodeLab,
      CodeLabWorkbench: CodeLabWorkbench,
      CodeLabElement: CodeLabElement,
      CodeLabRuntime: CodeLabRuntime,
      executeInVirtualRuntime: CodeLabRuntime.executeInVirtualRuntime,
      executeInWorker: CodeLabRuntime.executeInWorker,
      cancelWorkerExecution: CodeLabRuntime.cancelWorkerExecution,
      preloadNpmPackages: CodeLabRuntime.preloadNpmPackages,
      transpileTS: CodeLabRuntime.transpileTS,
      createVirtualFs: CodeLabRuntime.createVirtualFs,
      createVirtualHttp: CodeLabRuntime.createVirtualHttp,
      createVirtualNet: CodeLabRuntime.createVirtualNet,
      default: CodeLab
    });
  }
})(typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : this);
