/**
 * ============================================================
 * @innovatorved/code-lab v1.3.0 — Standalone Browser Code IDE & Virtual Runtime
 * ============================================================
 * Features:
 *   - Sandboxed Web Worker Execution Engine with Multi-Instance Isolation & Watchdog Timer
 *   - First-Class Node.js and Bun Runtimes (Bun.serve, bun:test, bun:sqlite, Bun.*)
 *   - Full POSIX Shell AST & 40+ UNIX Coreutils (pipes, redirects, globs, env vars)
 *   - Interactive PTY Terminal Emulator with inline prompt, Tab completion & ANSI colors
 *   - Persistent HTTP/TCP Servers, CLI curl & Live Port/HTTP Preview
 *   - VS Code Workbench: Hierarchical File Tree, Decoupled Tabs, Command Palette (Cmd+Shift+P), Quick Open (Cmd+P), Breadcrumbs, Context Menus & Solution Diff Viewer
 *   - Third-Party Imperative SDK (getFiles, setFiles, getFile, setFile, on, off, use, exportWorkspace)
 * ============================================================
 */
(function (root) {
  'use strict';

  // --- Module 1: Runtime Engine ---
  (function () {
'use strict';
if (typeof globalThis !== 'undefined' && typeof globalThis.Bun === 'undefined') {
  globalThis.Bun = { version: '1.1.20' };
}
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

    function makeStats(size, mtimeMs, isDir, ino = 1, mode = null) {
      const d = new Date(mtimeMs);
      const defaultMode = isDir ? 0o40755 : 0o100644;
      return {
        size,
        ino,
        mode: mode !== null && mode !== undefined ? mode : defaultMode,
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
      const fullPath = (relPath.startsWith('/workspace/') || relPath === '/workspace')
        ? normPath(relPath)
        : normPath(`/workspace/${cleanRel}`);
      ensureParentDirs(fullPath);
      const bytes = typeof content === 'string' ? utf8Encode(content) : new Uint8Array(content);
      files.set(fullPath, {
        data: bytes,
        mtimeMs: Date.now(),
        ctimeMs: Date.now(),
        ino: nextIno++,
        mode: 0o100644,
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
        if (dirs.has(np)) return makeStats(0, Date.now(), true, 1, 0o40755);
        const f = files.get(np);
        if (f) return makeStats(f.data.byteLength, f.mtimeMs, false, f.ino, f.mode !== undefined ? f.mode : 0o100644);
        throw fsError('ENOENT', 'stat', p, 'no such file or directory');
      },

      lstatSync(p) {
        return fsShim.statSync(p);
      },

      fstatSync(fd) {
        const entry = fdTable.get(fd);
        if (!entry) throw fsError('EBADF', 'fstat', String(fd), 'bad file descriptor');
        if (entry.isDirectory) return makeStats(0, Date.now(), true, 1, 0o40755);
        return makeStats(entry.inode.data.byteLength, entry.inode.mtimeMs, false, entry.inode.ino, entry.inode.mode !== undefined ? entry.inode.mode : 0o100644);
      },

      openSync(p, flags = 'r', mode = 0o666) {
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
            inode = { data: new Uint8Array(0), mtimeMs: Date.now(), ctimeMs: Date.now(), ino: nextIno++, mode: 0o100000 | (Number(mode) & 0o777) };
            files.set(np, inode);
          } else {
            inode.data = new Uint8Array(0);
            inode.mtimeMs = Date.now();
          }
        } else if (flagStr.startsWith('a')) {
          const parent = VirtualPath.dirname(np);
          if (!dirs.has(parent)) throw fsError('ENOENT', 'open', p, 'no such file or directory');
          if (!inode) {
            inode = { data: new Uint8Array(0), mtimeMs: Date.now(), ctimeMs: Date.now(), ino: nextIno++, mode: 0o100000 | (Number(mode) & 0o777) };
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
          const modeVal = (opts && typeof opts === 'object' && opts.mode !== undefined) ? Number(opts.mode) : 0o100644;
          inode = { data: bytes, mtimeMs: Date.now(), ctimeMs: Date.now(), ino: nextIno++, mode: modeVal };
          files.set(np, inode);
        } else {
          inode.data = bytes;
          inode.mtimeMs = Date.now();
        }
        deletedInspectorCache.set(np, { data: bytes.slice(), mtimeMs: inode.mtimeMs, deletedAtMs: null });
      },

      chmodSync(p, mode) {
        const np = normPath(p);
        const parsedMode = typeof mode === 'string' ? parseInt(mode, 8) : Number(mode);
        if (dirs.has(np)) return;
        const f = files.get(np);
        if (!f) throw fsError('ENOENT', 'chmod', p, 'no such file or directory');
        const currentType = (f.mode !== undefined ? f.mode : 0o100644) & ~0o777;
        f.mode = currentType | (parsedMode & 0o777);
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
        if (dirs.has(src)) {
          if (src === dst) return;
          if (dst.startsWith(src + '/')) {
            throw fsError('EINVAL', 'rename', oldP, 'cannot move an ancestor to child');
          }
          if (files.has(dst)) {
            throw fsError('ENOTDIR', 'rename', newP, 'not a directory');
          }
          if (dirs.has(dst)) {
            const hasChildren = Array.from(dirs).some(d => d !== dst && d.startsWith(dst + '/')) ||
              Array.from(files.keys()).some(f => f.startsWith(dst + '/'));
            if (hasChildren) {
              throw fsError('ENOTEMPTY', 'rename', newP, 'directory not empty');
            }
            dirs.delete(dst);
          }
          ensureParentDirs(dst);
          dirs.delete(src);
          dirs.add(dst);

          const srcPrefix = src + '/';
          const dstPrefix = dst + '/';
          const dirsToRename = [];
          for (const d of dirs) {
            if (d.startsWith(srcPrefix)) dirsToRename.push(d);
          }
          for (const d of dirsToRename) {
            dirs.delete(d);
            dirs.add(dstPrefix + d.slice(srcPrefix.length));
          }

          const filesToRename = [];
          for (const [p, fileNode] of files.entries()) {
            if (p.startsWith(srcPrefix)) filesToRename.push([p, fileNode]);
          }
          for (const [p, fileNode] of filesToRename) {
            files.delete(p);
            const newPath = dstPrefix + p.slice(srcPrefix.length);
            files.set(newPath, fileNode);
            for (const fdEntry of fdTable.values()) {
              if (fdEntry.path === p) fdEntry.path = newPath;
            }
          }
          return;
        }

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
    fsShim.chmod = wrapAsyncCb(fsShim.chmodSync);
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
      chmod: async (p, mode) => fsShim.chmodSync(p, mode),
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

  function createVirtualPortTable() {
    const table = new Map();
    return {
      registerServer(port, info = {}) {
        const p = Number(port);
        if (table.has(p)) {
          throw new Error(`Port ${p} is already in use`);
        }
        const entry = Object.assign({ port: p, registeredAt: Date.now() }, info);
        table.set(p, entry);
        return entry;
      },
      unregisterServer(port) {
        return table.delete(Number(port));
      },
      killProcess(pid) {
        const pStr = String(pid);
        let found = false;
        for (const [port, entry] of table.entries()) {
          if (entry.pid !== undefined && String(entry.pid) === pStr) {
            if (entry.server && typeof entry.server.close === 'function') {
              try { entry.server.close(); } catch (_) {}
            }
            if (typeof entry.stop === 'function') {
              try { entry.stop(); } catch (_) {}
            }
            table.delete(port);
            found = true;
          }
        }
        return found;
      },
      unregisterByPid(pid) {
        return this.killProcess(pid);
      },
      getServer(port) {
        return table.get(Number(port)) || null;
      },
      listServers() {
        return Array.from(table.values());
      },
      async dispatchRequest(url, init = {}) {
        const parsed = new URL(url);
        const port = Number(parsed.port || (parsed.protocol === 'https:' ? 443 : 80));
        const entry = table.get(port);
        if (!entry) {
          const err = new Error(`connect ECONNREFUSED 127.0.0.1:${port}`);
          err.code = 'ECONNREFUSED';
          throw err;
        }
        if (entry.fetch) {
          return entry.fetch(new Request(url, init));
        }
        if (entry.server && typeof entry.server.dispatchRequest === 'function') {
          return entry.server.dispatchRequest(url, init);
        }
        return new Response('OK', { status: 200 });
      }
    };
  }

  const _defaultPortTable = createVirtualPortTable();

  function createVirtualHttp(resourceTracker, activePortTable = null) {
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
        if (activePortTable) {
          activePortTable.registerServer(this._port, {
            server: this,
            name: 'http-server',
            port: this._port,
            pid: (resourceTracker && resourceTracker.pid) || 1
          });
        }
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
          if (activePortTable) {
            activePortTable.unregisterServer(this._port);
          }
        }
        this._listening = false;
        if (typeof callback === 'function') {
          queueMicrotask(() => callback());
        }
        queueMicrotask(() => this.emit('close'));
        return this;
      }

      async dispatchRequest(url, init = {}) {
        return new Promise((resolve, reject) => {
          try {
            const parsed = new URL(url);
            let rawHeaders = init.headers || {};
            let hdrs = {};
            if (rawHeaders instanceof Headers || (rawHeaders && typeof rawHeaders.entries === 'function')) {
              for (const [k, v] of rawHeaders.entries()) {
                hdrs[k.toLowerCase()] = String(v);
              }
            } else if (typeof rawHeaders === 'object' && rawHeaders !== null) {
              for (const [k, v] of Object.entries(rawHeaders)) {
                if (v !== undefined) hdrs[k.toLowerCase()] = String(v);
              }
            }
            if (!hdrs.host) {
              hdrs.host = `${parsed.hostname || '127.0.0.1'}:${parsed.port || this._port}`;
            }

            const serverReq = new IncomingMessage({
              method: (init.method || 'GET').toUpperCase(),
              url: parsed.pathname + parsed.search,
              headers: hdrs,
              socket: { remoteAddress: '127.0.0.1', encrypted: false }
            });

            const mockClientReq = new MiniEventEmitter();
            mockClientReq.destroyed = false;
            mockClientReq._clearTimeout = () => {};
            mockClientReq._finishInFlight = () => {};
            mockClientReq._onResponseHeaders = () => {};

            const serverRes = new ServerResponse(mockClientReq, null);
            const chunks = [];

            const origWrite = serverRes.write.bind(serverRes);
            const origEnd = serverRes.end.bind(serverRes);

            serverRes.write = function(chunk, encoding) {
              if (chunk !== undefined && chunk !== null && chunk !== '') {
                const buf = typeof chunk === 'string'
                  ? VirtualBuffer.from(chunk, encoding || 'utf8')
                  : VirtualBuffer.from(chunk);
                chunks.push(buf);
              }
              return origWrite(chunk, encoding);
            };

            serverRes.end = function(chunk, encoding, cb) {
              if (typeof chunk === 'function') { cb = chunk; chunk = undefined; }
              else if (typeof encoding === 'function') { cb = encoding; encoding = undefined; }
              if (chunk !== undefined && chunk !== null && chunk !== '') {
                const buf = typeof chunk === 'string'
                  ? VirtualBuffer.from(chunk, encoding || 'utf8')
                  : VirtualBuffer.from(chunk);
                chunks.push(buf);
              }
              const resObj = origEnd(chunk, encoding, cb);
              queueMicrotask(() => {
                const totalBuf = VirtualBuffer.concat(chunks);
                const outHeaders = new Headers();
                for (const [k, v] of Object.entries(serverRes._headers)) {
                  outHeaders.set(k, v);
                }
                const response = new Response(totalBuf, {
                  status: serverRes.statusCode || 200,
                  statusText: serverRes.statusMessage || 'OK',
                  headers: outHeaders
                });
                resolve(response);
              });
              return resObj;
            };

            this.emit('request', serverReq, serverRes);

            queueMicrotask(async () => {
              try {
                if (init.body) {
                  let b = init.body;
                  if (typeof b.text === 'function') b = await b.text();
                  const buf = typeof b === 'string' ? VirtualBuffer.from(b, 'utf8') : VirtualBuffer.from(b);
                  serverReq._pushData(buf);
                }
                serverReq._pushEnd();
              } catch (err) {
                reject(err);
              }
            });
          } catch (err) {
            reject(err);
          }
        });
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
      activeServers,
      hasActiveServers() {
        return activeServers.size > 0;
      },
      closeAllServers() {
        for (const s of Array.from(activeServers.values())) {
          try { s.close(); } catch (_) {}
        }
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
      code = code.replace(/^([ \t]*(?:static\s+)?[A-Za-z_$][A-Za-z0-9_$]*)[?!]?\s*:\s*(?:[^=\n<>()!]|<[^=\n]*>)+(?<![=!<>])=(?![=>])\s*/gm, '$1 = ');

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
      code = code.replace(/\b(const|let|var)\s+([A-Za-z_$][A-Za-z0-9_$]*)\s*:\s*[^=;\n]+(?<![=!<>])=(?![=>])/g, '$1 $2 =');

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
      'stream', 'stream/promises', 'test', 'perf_hooks', 'timers', 'timers/promises', 'buffer',
      'bun', 'bun:test', 'bun:sqlite'
    ]);

    function addSpec(raw) {
      if (!raw || typeof raw !== 'string') return;
      const s = raw.trim();
      if (!s || s.startsWith('.') || s.startsWith('/') || s.startsWith('node:') || s.startsWith('bun:')) return;
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
      onTestResult = null,
      vfs: optVfs = null,
      activePortTable: optPortTable = null,
      portTable = null,
      pid = 1000,
      argv = null,
      isBackground = false
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
      pendingTests: new Set(),
      pid
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

    const activePortTable = optPortTable || portTable || _defaultPortTable;
    resourceTracker.pid = pid;

    const vfs = optVfs || createVirtualFs(files);
    if (optVfs && files && typeof files === 'object') {
      for (const [fPath, content] of Object.entries(files)) {
        const abs = fPath.startsWith('/') ? fPath : '/workspace/' + fPath;
        try {
          const dir = VirtualPath.dirname(abs);
          if (!vfs.existsSync(dir)) vfs.mkdirSync(dir, { recursive: true });
          vfs.writeFileSync(abs, content);
        } catch (_) {}
      }
    }
    const vhttp = createVirtualHttp(resourceTracker, activePortTable);
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
      argv: argv || ['node', entry.startsWith('/') ? entry : `/workspace/${entry}`],
      argv0: 'node',
      execArgv: [],
      execPath: '/usr/local/bin/node',
      pid: pid,
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

    class SqliteDatabase {
      constructor(filename = ':memory:') {
        this.filename = filename;
        this.tables = new Map();
      }

      run(sql, params = []) {
        const stmt = sql.trim();
        if (/^CREATE\s+TABLE/i.test(stmt)) {
          const match = stmt.match(/^CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?([a-zA-Z0-9_]+)\s*\((.*)\)/is);
          if (match) {
            const tableName = match[1];
            const colDefs = match[2].split(',').map(c => c.trim());
            const cols = [];
            for (const c of colDefs) {
              const parts = c.split(/\s+/);
              const colName = parts[0];
              const isPk = /PRIMARY\s+KEY/i.test(c);
              const isAuto = /AUTOINCREMENT/i.test(c) || (/INTEGER/i.test(parts[1]) && isPk);
              cols.push({ name: colName, type: parts[1] || 'TEXT', isPk, isAuto });
            }
            if (!this.tables.has(tableName)) {
              this.tables.set(tableName, { columns: cols, rows: [], autoInc: 0 });
            }
          }
          return { changes: 0, lastInsertRowid: 0 };
        }

        if (/^INSERT\s+INTO/i.test(stmt)) {
          const match = stmt.match(/^INSERT\s+INTO\s+([a-zA-Z0-9_]+)(?:\s*\(([^)]+)\))?\s*VALUES\s*\((.*)\)/is);
          if (match) {
            const tableName = match[1];
            const table = this.tables.get(tableName);
            if (!table) throw new Error(`no such table: ${tableName}`);
            const colNames = match[2] ? match[2].split(',').map(s => s.trim()) : table.columns.filter(c => !c.isPk).map(c => c.name);
            const valExprs = match[3].split(',').map(s => s.trim());
            const pList = Array.isArray(params) ? [...params] : [params];
            const row = {};

            table.autoInc++;
            const pkCol = table.columns.find(c => c.isPk);
            if (pkCol) {
              row[pkCol.name] = table.autoInc;
            }

            for (let i = 0; i < colNames.length; i++) {
              const cName = colNames[i];
              const expr = valExprs[i] !== undefined ? valExprs[i] : '?';
              if (expr === '?') {
                row[cName] = pList.shift();
              } else if (/^['"].*['"]$/.test(expr)) {
                row[cName] = expr.slice(1, -1);
              } else if (!isNaN(Number(expr))) {
                row[cName] = Number(expr);
              } else {
                row[cName] = expr;
              }
            }
            table.rows.push(row);
            return { changes: 1, lastInsertRowid: table.autoInc };
          }
        }
        return { changes: 0, lastInsertRowid: 0 };
      }

      exec(sql) {
        const statements = sql.split(';').map(s => s.trim()).filter(Boolean);
        for (const s of statements) {
          this.run(s);
        }
      }

      query(sql) {
        const db = this;
        return {
          all(...args) {
            let params = args;
            if (args.length === 1 && Array.isArray(args[0])) params = args[0];
            return db._executeSelect(sql, params);
          },
          get(...args) {
            const rows = this.all(...args);
            return rows[0] || null;
          },
          values(...args) {
            const rows = this.all(...args);
            return rows.map(r => Object.values(r));
          },
          run(...args) {
            return db.run(sql, args);
          }
        };
      }

      prepare(sql) {
        return this.query(sql);
      }

      _executeSelect(sql, params = []) {
        const s = sql.trim().replace(/;$/, '');
        const match = s.match(/^SELECT\s+(.*?)\s+FROM\s+([a-zA-Z0-9_]+)(?:\s+WHERE\s+(.*?))?(?:\s+GROUP\s+BY\s+(.*?))?(?:\s+ORDER\s+BY\s+(.*?))?$/is);
        if (!match) return [];
        const selectColsRaw = match[1].trim();
        const tableName = match[2].trim();
        const whereClause = match[3] ? match[3].trim() : null;
        const groupByClause = match[4] ? match[4].trim() : null;
        const orderByClause = match[5] ? match[5].trim() : null;

        const table = this.tables.get(tableName);
        if (!table) return [];

        let pList = Array.isArray(params) ? [...params] : [params];
        let filteredRows = table.rows.filter(row => {
          if (!whereClause) return true;
          const eqMatch = whereClause.match(/^([a-zA-Z0-9_]+)\s*=\s*(.*)$/);
          if (eqMatch) {
            const col = eqMatch[1].trim();
            let expected = eqMatch[2].trim();
            if (expected === '?') {
              expected = pList.shift();
            } else if (/^['"].*['"]$/.test(expected)) {
              expected = expected.slice(1, -1);
            } else if (!isNaN(Number(expected))) {
              expected = Number(expected);
            }
            return String(row[col]) === String(expected);
          }
          return true;
        });

        const colSpecs = [];
        if (selectColsRaw !== '*') {
          const parts = selectColsRaw.split(',').map(p => p.trim());
          for (const p of parts) {
            const asMatch = p.match(/^(.*?)\s+(?:as\s+)?([a-zA-Z0-9_]+)$/i);
            if (asMatch) {
              colSpecs.push({ expr: asMatch[1].trim(), alias: asMatch[2].trim() });
            } else {
              colSpecs.push({ expr: p, alias: p });
            }
          }
        }

        let outputRows = [];
        if (groupByClause) {
          const groupCol = groupByClause.trim();
          const groups = new Map();
          for (const row of filteredRows) {
            const key = row[groupCol];
            if (!groups.has(key)) groups.set(key, []);
            groups.get(key).push(row);
          }

          for (const [key, rows] of groups.entries()) {
            const outRow = {};
            for (const col of colSpecs) {
              const expr = col.expr;
              const alias = col.alias;
              const aggMatch = expr.match(/^(AVG|SUM|COUNT|MIN|MAX)\(([a-zA-Z0-9_*]+)\)$/i);
              if (aggMatch) {
                const fn = aggMatch[1].toUpperCase();
                const aggCol = aggMatch[2];
                if (fn === 'COUNT') {
                  outRow[alias] = rows.length;
                } else if (fn === 'AVG') {
                  const sum = rows.reduce((acc, r) => acc + (Number(r[aggCol]) || 0), 0);
                  outRow[alias] = rows.length > 0 ? sum / rows.length : 0;
                } else if (fn === 'SUM') {
                  outRow[alias] = rows.reduce((acc, r) => acc + (Number(r[aggCol]) || 0), 0);
                } else if (fn === 'MIN') {
                  outRow[alias] = Math.min(...rows.map(r => Number(r[aggCol]) || 0));
                } else if (fn === 'MAX') {
                  outRow[alias] = Math.max(...rows.map(r => Number(r[aggCol]) || 0));
                }
              } else if (expr === groupCol) {
                outRow[alias] = key;
              } else {
                outRow[alias] = rows[0] ? rows[0][expr] : null;
              }
            }
            outputRows.push(outRow);
          }
        } else {
          for (const row of filteredRows) {
            if (selectColsRaw === '*') {
              outputRows.push(Object.assign({}, row));
            } else {
              const outRow = {};
              for (const col of colSpecs) {
                outRow[col.alias] = row[col.expr];
              }
              outputRows.push(outRow);
            }
          }
        }

        if (orderByClause) {
          const parts = orderByClause.trim().split(/\s+/);
          const orderCol = parts[0];
          const desc = parts[1] && parts[1].toUpperCase() === 'DESC';
          outputRows.sort((a, b) => {
            const valA = a[orderCol];
            const valB = b[orderCol];
            if (valA === valB) return 0;
            if (valA === undefined) return 1;
            if (valB === undefined) return -1;
            const res = valA > valB ? 1 : -1;
            return desc ? -res : res;
          });
        }

        return outputRows;
      }
    }

    function crc32Hash(str) {
      const s = String(str);
      let crc = 0 ^ (-1);
      for (let i = 0; i < s.length; i++) {
        crc = (crc >>> 8) ^ ((crc ^ s.charCodeAt(i)) & 0xFF);
      }
      return (crc ^ (-1)) >>> 0;
    }

    const bunHashFn = function hash(val) {
      return crc32Hash(val);
    };
    bunHashFn.crc32 = (val) => crc32Hash(val);
    bunHashFn.cityHash64 = (val) => {
      const h1 = crc32Hash(val);
      const h2 = crc32Hash(val + ':seed64');
      return (BigInt(h1) << 32n) | BigInt(h2);
    };

    function deepEquals(a, b) {
      if (a === b) return true;
      if (a === null || b === null || typeof a !== 'object' || typeof b !== 'object') {
        return false;
      }
      if (a instanceof Date && b instanceof Date) {
        return a.getTime() === b.getTime();
      }
      if (a instanceof RegExp && b instanceof RegExp) {
        return a.toString() === b.toString();
      }
      if (Array.isArray(a) !== Array.isArray(b)) return false;
      const keysA = Object.keys(a);
      const keysB = Object.keys(b);
      if (keysA.length !== keysB.length) return false;
      for (const k of keysA) {
        if (!Object.prototype.hasOwnProperty.call(b, k)) return false;
        if (!deepEquals(a[k], b[k])) return false;
      }
      return true;
    }

    const BunObj = {
      version: '1.1.0',
      serve(opts = {}) {
        const port = Number(opts.port || 3000);
        const hostname = opts.hostname || '127.0.0.1';
        const serverObj = {
          port,
          hostname,
          development: false,
          stop() {
            activePortTable.unregisterServer(port);
          }
        };
        activePortTable.registerServer(port, {
          server: serverObj,
          name: opts.name || 'bun-server',
          port,
          pid: resourceTracker.pid || 1,
          fetch: opts.fetch ? opts.fetch.bind(serverObj) : undefined,
          stop: () => serverObj.stop()
        });
        return serverObj;
      },
      file(p) {
        const resolved = VirtualPath.resolve(sandboxProcess.cwd(), String(p));
        return {
          name: VirtualPath.basename(resolved),
          get size() {
            try {
              return vfs.statSync(resolved).size;
            } catch (_) {
              return 0;
            }
          },
          async exists() {
            return vfs.existsSync(resolved);
          },
          async text() {
            return vfs.readFileSync(resolved, 'utf8');
          },
          async json() {
            return JSON.parse(vfs.readFileSync(resolved, 'utf8'));
          },
          async arrayBuffer() {
            const buf = vfs.readFileSync(resolved);
            return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
          }
        };
      },
      async write(dest, data) {
        const resolved = VirtualPath.resolve(sandboxProcess.cwd(), String(dest));
        const dir = VirtualPath.dirname(resolved);
        if (!vfs.existsSync(dir)) vfs.mkdirSync(dir, { recursive: true });
        let buf;
        if (typeof data === 'string') {
          buf = VirtualBuffer.from(data, 'utf8');
        } else if (data && data.arrayBuffer && typeof data.arrayBuffer === 'function') {
          const ab = await data.arrayBuffer();
          buf = VirtualBuffer.from(ab);
        } else if (data instanceof Uint8Array || VirtualBuffer.isBuffer(data)) {
          buf = VirtualBuffer.from(data);
        } else {
          buf = VirtualBuffer.from(String(data), 'utf8');
        }
        vfs.writeFileSync(resolved, buf);
        return buf.length;
      },
      sleep(ms) {
        return new Promise(resolve => sandboxSetTimeout(resolve, Number(ms) || 0));
      },
      hash: bunHashFn,
      deepEquals,
      inspect(val) {
        return VirtualUtil.inspect(val);
      },
      nanoseconds() {
        return Math.round(performance.now() * 1e6);
      }
    };

    const bunTestModule = (() => {
      function makeExpect(actual, isNot = false) {
        const pass = (condition, msg) => {
          const ok = isNot ? !condition : condition;
          if (!ok) {
            throw new Error(msg || `expect assertion failed: actual=${actual}`);
          }
        };

        const matchers = {
          toBe(expected) {
            pass(Object.is(actual, expected), `Expected ${actual} to be ${expected}`);
          },
          toEqual(expected) {
            pass(deepEquals(actual, expected), `Expected ${JSON.stringify(actual)} to equal ${JSON.stringify(expected)}`);
          },
          toContain(item) {
            let contains = false;
            if (actual && typeof actual.includes === 'function') {
              contains = actual.includes(item);
            } else if (actual && typeof actual.has === 'function') {
              contains = actual.has(item);
            }
            pass(contains, `Expected collection to contain ${item}`);
          },
          toThrow(expected) {
            let threw = false;
            let thrownErr = null;
            try {
              if (typeof actual === 'function') actual();
            } catch (err) {
              threw = true;
              thrownErr = err;
            }
            if (!threw) {
              pass(false, `Expected function to throw`);
              return;
            }
            if (expected) {
              const msg = thrownErr && thrownErr.message ? thrownErr.message : String(thrownErr);
              if (typeof expected === 'string') {
                pass(msg.includes(expected), `Expected error message "${msg}" to contain "${expected}"`);
              } else if (expected instanceof RegExp) {
                pass(expected.test(msg), `Expected error message "${msg}" to match ${expected}`);
              }
            } else {
              pass(true);
            }
          },
          toBeTruthy() {
            pass(Boolean(actual) === true, `Expected ${actual} to be truthy`);
          },
          toBeFalsy() {
            pass(Boolean(actual) === false, `Expected ${actual} to be falsy`);
          },
          toBeGreaterThan(n) {
            pass(actual > n, `Expected ${actual} to be greater than ${n}`);
          },
          toBeLessThan(n) {
            pass(actual < n, `Expected ${actual} to be less than ${n}`);
          },
          toHaveBeenCalled() {
            const calls = (actual && actual.mock && actual.mock.calls) || [];
            pass(calls.length > 0, `Expected mock function to have been called`);
          },
          toHaveBeenCalledTimes(n) {
            const calls = (actual && actual.mock && actual.mock.calls) || [];
            pass(calls.length === n, `Expected mock function to have been called ${n} times, was called ${calls.length}`);
          },
          toHaveBeenCalledWith(...args) {
            const calls = (actual && actual.mock && actual.mock.calls) || [];
            const found = calls.some(callArgs => deepEquals(callArgs, args));
            pass(found, `Expected mock to have been called with ${JSON.stringify(args)}`);
          }
        };

        if (!isNot) {
          matchers.not = makeExpect(actual, true);
        }
        return matchers;
      }

      function mockFn(impl) {
        const calls = [];
        const results = [];
        const fn = function(...args) {
          calls.push(args);
          let res;
          try {
            if (typeof impl === 'function') {
              res = impl.apply(this, args);
            }
            results.push({ type: 'return', value: res });
            return res;
          } catch (err) {
            results.push({ type: 'throw', value: err });
            throw err;
          }
        };
        fn.mock = {
          calls,
          results
        };
        return fn;
      }

      return {
        describe: (suiteName, fn) => nodeDescribeFn(suiteName, fn),
        test: (testName, fn) => nodeTestFn(testName, fn),
        it: (testName, fn) => nodeTestFn(testName, fn),
        expect: (actual) => makeExpect(actual),
        mock: (impl) => mockFn(impl),
        beforeAll: () => {},
        afterAll: () => {},
        beforeEach: () => {},
        afterEach: () => {}
      };
    })();

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
      'node:buffer': { Buffer: VirtualBuffer },
      bun: BunObj,
      'node:bun': BunObj,
      'bun:test': bunTestModule,
      'bun:sqlite': { Database: SqliteDatabase }
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

    // Global fallback `test` / `it` / `describe` for custom user test scripts
    const globalTest = (name, optsOrFn, maybeFn) => nodeTestFn(name, optsOrFn, maybeFn);
    const globalDescribe = (suiteName, optsOrFn, maybeFn) => nodeDescribeFn(suiteName, optsOrFn, maybeFn);

    const virtualFetch = async (urlOrReq, init = {}) => {
      let urlStr;
      let finalInit = init || {};
      if (typeof urlOrReq === 'string') {
        urlStr = urlOrReq;
      } else if (urlOrReq && urlOrReq.url) {
        urlStr = urlOrReq.url;
        finalInit = Object.assign({
          method: urlOrReq.method,
          headers: urlOrReq.headers,
          body: urlOrReq.body
        }, init);
      } else {
        urlStr = String(urlOrReq);
      }

      try {
        const parsed = new URL(urlStr);
        const isLocal = parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1' || parsed.hostname === '0.0.0.0';
        if (isLocal && activePortTable) {
          return await activePortTable.dispatchRequest(urlStr, finalInit);
        }
      } catch (_) {}

      if (typeof globalThis.fetch === 'function') {
        return await globalThis.fetch(urlOrReq, init);
      }
      throw new Error(`fetch failed for ${urlStr}`);
    };

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
      crypto: VirtualCrypto,
      fetch: virtualFetch,
      Request,
      Response,
      Headers,
      Bun: BunObj
    };
    sandboxGlobal.global = sandboxGlobal;
    sandboxGlobal.globalThis = sandboxGlobal;

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

      const moduleBody = '{\n' + transformed + '\n}\n//# sourceURL=' + absPath + '\n';

      const fn = compileFunction(
        [
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
          'Bun',
          'fetch',
          'Request',
          'Response',
          'Headers'
        ],
        moduleBody
      );

      syncExecDepth++;
      let execResult;
      try {
        execResult = fn(
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
          globalTest,
          BunObj,
          sandboxGlobal.fetch,
          Request,
          Response,
          Headers
        );
      } finally {
        syncExecDepth--;
      }

      if (execResult && typeof execResult.then === 'function') {
        resourceTracker.pendingTests.add(execResult);
        return execResult.then(() => {
          resourceTracker.pendingTests.delete(execResult);
          mod.loaded = true;
          return mod.exports;
        }).catch((err) => {
          resourceTracker.pendingTests.delete(execResult);
          throw err;
        });
      }

      mod.loaded = true;
      return mod.exports;
    }

    const AsyncFunction = Object.getPrototypeOf(async function() {}).constructor;
    let __fnSeq = 0;
    function compileFunction(argNames, body) {
      try {
        return new Function(...argNames, body);
      } catch (err) {
        if (err instanceof SyntaxError && /await/.test(err.message)) {
          try {
            return new AsyncFunction(...argNames, body);
          } catch (_) {}
        }
        if (
          err &&
          err.name === 'EvalError' &&
          typeof importScripts === 'function' &&
          typeof Blob !== 'undefined' &&
          typeof URL !== 'undefined' &&
          typeof URL.createObjectURL === 'function'
        ) {
          const globalObj = typeof self !== 'undefined' ? self : globalThis;
          const fnKey = '__cl_fn_' + (++__fnSeq) + '_' + Math.random().toString(36).slice(2);
          const scriptSrc = `self[${JSON.stringify(fnKey)}] = function(${argNames.join(', ')}) {\n${body}\n};`;
          const blob = new Blob([scriptSrc], { type: 'application/javascript' });
          const blobUrl = URL.createObjectURL(blob);
          try {
            importScripts(blobUrl);
            const compiled = globalObj[fnKey];
            delete globalObj[fnKey];
            if (typeof compiled === 'function') return compiled;
          } finally {
            URL.revokeObjectURL(blobUrl);
          }
        }
        throw err;
      }
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
        let body = transpiledRepl.trim();
        const semiIdx = body.lastIndexOf(';');
        let prefix = '';
        let candidate = body;
        if (semiIdx !== -1 && semiIdx < body.length - 1) {
          prefix = body.slice(0, semiIdx + 1) + '\n';
          candidate = body.slice(semiIdx + 1).trim();
        } else {
          const lines = body.split('\n');
          prefix = lines.slice(0, -1).join('\n') + '\n';
          candidate = (lines[lines.length - 1] || '').trim();
        }
        if (candidate && !/^\s*(const|let|var|function|class|if|for|while|switch|try|return|throw)\b/.test(candidate)) {
          const testBody = prefix + `return (${candidate.replace(/;+\s*$/, '')});`;
          try {
            compileFunction([], testBody);
            body = testBody;
          } catch (_) {
            body = transpiledRepl;
          }
        }
        const replFn = compileFunction(
          [
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
            'Bun',
            'fetch'
          ],
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
          sandboxClearImmediate,
          BunObj,
          sandboxGlobal.fetch
        );
        if (replValue !== undefined && options.printReplResult !== false) {
          emitStdout(formatConsoleArg(replValue) + '\n');
        }
      } else {
        let entryAbs = vfs.existsSync(entry) ? entry : `/workspace/${entry.replace(/^\/+/, '')}`;
        if (!vfs.existsSync(entryAbs)) {
          const alt = `/workspace/src/${entry.replace(/^\/+/, '')}`;
          if (vfs.existsSync(alt)) entryAbs = alt;
        }
        const res = loadModule(entryAbs, true);
        if (res && typeof res.then === 'function') {
          await res;
        }
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
          resourceTracker.pendingTests.size > 0 ||
          (isBackground && vhttp.hasActiveServers());

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
      if (!isBackground) {
        vhttp.closeAllServers();
        vnet.closeAllServers();
      }
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
    createVirtualPortTable,
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

  // --- Module 2: POSIX Shell & Coreutils ---
  (function () {
/**
 * @innovatorved/code-lab - POSIX Shell Engine & UNIX Coreutils
 *
 * Full-fidelity, CSP-safe POSIX shell AST interpreter and 35+ standard UNIX
 * coreutils operating directly on the in-memory virtual filesystem (VFS).
 *
 * Capabilities:
 * - Deterministic lexer and AST parser (zero dynamic eval, zero new Function)
 * - Pipelines (cmd1 | cmd2 | cmd3) with streaming stdin/stdout chaining
 * - Output redirection (>, >>, 1>, 2>, 2>&1, 1>&2, &>)
 * - Input redirection (<, 0<)
 * - Logical operators (&&, ||, ;)
 * - Background job execution (cmd &) with job table & PID tracking
 * - Variable expansion ($VAR, ${VAR}, ${VAR:-def}, $?, $PWD, $HOME, $USER)
 * - Command substitution ($(cmd), `cmd`)
 * - Glob expansion (*.js, src/**\/*.ts, [0-9]*.txt) against VFS
 * - 40+ UNIX coreutils (ls, cd, pwd, cat, head, tail, grep, find, wc, sort, uniq,
 *   sed, awk, cut, tr, diff, tree, cp, mv, rm, mkdir, touch, chmod, stat, echo,
 *   printf, env, export, unset, which, whoami, uname, date, sleep, true, false,
 *   clear, history, ps, jobs, kill, git, help, dirname, basename, seq, tee)
 * - Bidirectional VFS mutation bridge (touch, mkdir, rm, mv, cp, echo >, sed -i)
 *
 * (C) 2026 InnovatorVed / CodeLab. MIT License.
 */

(function (root, factory) {
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = factory();
  } else if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else {
    const exports = factory();
    root.CodeLabShell = exports;
    root.createPosixShell = exports.createPosixShell;
    root.PosixShell = exports.PosixShell;
    root.parseShellCommand = exports.parseShellCommand;
    root.tokenizeShell = exports.tokenizeShell;
    root.COREUTILS = exports.COREUTILS;
    root.createVirtualPortTable = exports.createVirtualPortTable;
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  let runtimeModule = null;
  try {
    if (typeof require !== 'undefined') {
      runtimeModule = require('./runtime.js');
    }
  } catch (_) {}

  const executeInVirtualRuntime = (runtimeModule && runtimeModule.executeInVirtualRuntime) || null;
  const createVirtualPortTable = (runtimeModule && runtimeModule.createVirtualPortTable) || null;

  // =========================================================================
  // 1. POSIX PATH UTILITIES (Virtual Filesystem Path Normalizer)
  // =========================================================================
  const PosixPath = {
    normalize(p) {
      if (typeof p !== 'string' || !p) return '/';
      const isAbs = p.startsWith('/');
      const parts = p.split('/').filter(Boolean);
      const stack = [];
      for (const part of parts) {
        if (part === '.') continue;
        if (part === '..') {
          if (stack.length > 0) stack.pop();
        } else {
          stack.push(part);
        }
      }
      const res = (isAbs ? '/' : '') + stack.join('/');
      return res || (isAbs ? '/' : '.');
    },

    resolve(cwd, ...paths) {
      let resolved = cwd.startsWith('/') ? cwd : '/' + cwd;
      for (const p of paths) {
        if (!p) continue;
        if (p.startsWith('/')) {
          resolved = p;
        } else if (p === '~' || p.startsWith('~/')) {
          resolved = '/home/user' + p.slice(1);
        } else {
          resolved = resolved.endsWith('/') ? resolved + p : resolved + '/' + p;
        }
      }
      return PosixPath.normalize(resolved);
    },

    dirname(p) {
      const norm = PosixPath.normalize(p);
      if (norm === '/' || norm === '.') return norm;
      const idx = norm.lastIndexOf('/');
      if (idx === -1) return '.';
      if (idx === 0) return '/';
      return norm.slice(0, idx);
    },

    basename(p, ext) {
      const norm = PosixPath.normalize(p);
      if (norm === '/') return '/';
      const idx = norm.lastIndexOf('/');
      let base = idx === -1 ? norm : norm.slice(idx + 1);
      if (ext && base.endsWith(ext) && base !== ext) {
        base = base.slice(0, -ext.length);
      }
      return base;
    },

    join(...parts) {
      return PosixPath.normalize(parts.filter(Boolean).join('/'));
    }
  };

  // =========================================================================
  // 2. GLOB PATTERN MATCHING & VFS DIRECTORY EXPANSION
  // =========================================================================
  function globToRegExp(glob, isPath = true) {
    let regStr = '^';
    let i = 0;
    while (i < glob.length) {
      const c = glob[i];
      if (c === '*' && glob[i + 1] === '*' && (glob[i + 2] === '/' || i + 2 === glob.length)) {
        regStr += '(?:.+/)?';
        i += glob[i + 2] === '/' ? 3 : 2;
      } else if (c === '*' && glob[i + 1] === '*') {
        regStr += '.*';
        i += 2;
      } else if (c === '*') {
        regStr += isPath ? '[^/]*' : '.*';
        i++;
      } else if (c === '?') {
        regStr += isPath ? '[^/]' : '.';
        i++;
      } else if (c === '[') {
        const close = glob.indexOf(']', i + 1);
        if (close !== -1) {
          regStr += glob.slice(i, close + 1);
          i = close + 1;
        } else {
          regStr += '\\[';
          i++;
        }
      } else if (['.', '$', '^', '+', '(', ')', '{', '}', '|', '\\'].includes(c)) {
        regStr += '\\' + c;
        i++;
      } else {
        regStr += c;
        i++;
      }
    }
    regStr += '$';
    return new RegExp(regStr);
  }

  function expandGlob(pattern, cwd, vfs) {
    if (!vfs) return [pattern];
    // Check if pattern contains wildcard characters outside quotes
    if (!/[*?\[]/.test(pattern)) {
      return [pattern];
    }

    const isAbs = pattern.startsWith('/');
    const searchRoot = isAbs ? '/' : cwd;
    const allPaths = [];

    // Helper to traverse VFS tree recursively
    function traverse(currentDir, relPrefix) {
      let entries = [];
      try {
        if (typeof vfs.readdirSync === 'function') {
          entries = vfs.readdirSync(currentDir);
        }
      } catch (_) {
        return;
      }

      for (const entry of entries) {
        const full = currentDir === '/' ? '/' + entry : currentDir + '/' + entry;
        const rel = relPrefix ? relPrefix + '/' + entry : entry;
        allPaths.push({ full, rel });

        let isDir = false;
        try {
          if (typeof vfs.statSync === 'function') {
            isDir = vfs.statSync(full).isDirectory();
          }
        } catch (_) {}

        if (isDir) {
          traverse(full, rel);
        }
      }
    }

    traverse(searchRoot, '');

    const targetGlob = isAbs ? pattern : (pattern.startsWith('./') ? pattern.slice(2) : pattern);
    const regex = globToRegExp(targetGlob, true);

    const matches = [];
    for (const item of allPaths) {
      const candidate = isAbs ? item.full : item.rel;
      if (regex.test(candidate)) {
        // POSIX dotfile protection: * wildcard must NOT match dotfiles starting with .
        // unless pattern component explicitly starts with .
        const candParts = candidate.split('/').filter(Boolean);
        const patParts = targetGlob.split('/').filter(Boolean);
        let dotMismatch = false;
        for (let idx = 0; idx < candParts.length; idx++) {
          const cp = candParts[idx];
          const pp = patParts[idx] !== undefined ? patParts[idx] : patParts[patParts.length - 1];
          if (cp && cp.startsWith('.') && pp && !pp.startsWith('.')) {
            dotMismatch = true;
            break;
          }
        }
        if (!dotMismatch) {
          matches.push(isAbs ? item.full : (pattern.startsWith('./') ? './' + item.rel : item.rel));
        }
      }
    }

    matches.sort();
    return matches.length > 0 ? matches : [pattern];
  }

  // =========================================================================
  // 3. POSIX SHELL LEXER & TOKENIZER
  // =========================================================================
  /**
   * Tokenizes a POSIX shell command string into structured tokens:
   * Words with segment types (literal, single-quoted, double-quoted, var, subshell)
   * Operators: &&, ||, |, ;, &, >, >>, <, 2>, 2>>, 2>&1, 1>&2, &>
   */
  function tokenizeShell(commandLine) {
    if (typeof commandLine !== 'string') return [];
    const tokens = [];
    const len = commandLine.length;
    let i = 0;

    while (i < len) {
      const ch = commandLine[i];

      // Newline: treated as command separator (equivalent to semicolon)
      if (ch === '\n') {
        i++;
        if (tokens.length > 0) {
          const lastType = tokens[tokens.length - 1].type;
          if (lastType !== 'SEMICOLON' && lastType !== 'AND' && lastType !== 'OR' && lastType !== 'PIPE') {
            tokens.push({ type: 'SEMICOLON', raw: ';' });
          }
        }
        continue;
      }

      // Whitespace (excluding newline)
      if (/[ \t\r\f\v]/.test(ch)) {
        i++;
        continue;
      }

      // Comments: # until end of line
      if (ch === '#') {
        while (i < len && commandLine[i] !== '\n') i++;
        continue;
      }

      // Logical AND '&&'
      if (ch === '&' && commandLine[i + 1] === '&') {
        tokens.push({ type: 'AND', raw: '&&' });
        i += 2;
        continue;
      }

      // Logical OR '||'
      if (ch === '|' && commandLine[i + 1] === '|') {
        tokens.push({ type: 'OR', raw: '||' });
        i += 2;
        continue;
      }

      // Pipeline '|'
      if (ch === '|') {
        tokens.push({ type: 'PIPE', raw: '|' });
        i++;
        continue;
      }

      // Semicolon ';'
      if (ch === ';') {
        tokens.push({ type: 'SEMICOLON', raw: ';' });
        i++;
        continue;
      }

      // Both stdout & stderr redirect '&>'
      if (ch === '&' && commandLine[i + 1] === '>') {
        tokens.push({ type: 'REDIRECT', op: '&>', sourceFd: 'all' });
        i += 2;
        continue;
      }

      // Background job '&'
      if (ch === '&') {
        tokens.push({ type: 'BACKGROUND', raw: '&' });
        i++;
        continue;
      }

      // Redirection: 2>&1 or 1>&2 or 2>> or 2> or 1>> or 1> or 0<
      if ((ch === '1' || ch === '2' || ch === '0') && (commandLine[i + 1] === '>' || commandLine[i + 1] === '<')) {
        const fd = parseInt(ch, 10);
        const opChar = commandLine[i + 1];

        if (opChar === '>' && commandLine[i + 2] === '&' && (commandLine[i + 3] === '1' || commandLine[i + 3] === '2')) {
          const targetFd = parseInt(commandLine[i + 3], 10);
          tokens.push({ type: 'REDIRECT_FD', sourceFd: fd, targetFd, raw: `${fd}>&${targetFd}` });
          i += 4;
          continue;
        }

        if (opChar === '>' && commandLine[i + 2] === '>') {
          tokens.push({ type: 'REDIRECT', op: '>>', sourceFd: fd, raw: `${fd}>>` });
          i += 3;
          continue;
        }

        tokens.push({ type: 'REDIRECT', op: opChar, sourceFd: fd, raw: `${fd}${opChar}` });
        i += 2;
        continue;
      }

      // Redirection: >> or >&1 or >&2 or > or <
      if (ch === '>') {
        if (commandLine[i + 1] === '&' && (commandLine[i + 2] === '1' || commandLine[i + 2] === '2')) {
          const targetFd = parseInt(commandLine[i + 2], 10);
          tokens.push({ type: 'REDIRECT_FD', sourceFd: 1, targetFd, raw: `>&${targetFd}` });
          i += 3;
          continue;
        }
        if (commandLine[i + 1] === '>') {
          tokens.push({ type: 'REDIRECT', op: '>>', sourceFd: 1, raw: '>>' });
          i += 2;
          continue;
        }
        tokens.push({ type: 'REDIRECT', op: '>', sourceFd: 1, raw: '>' });
        i++;
        continue;
      }

      if (ch === '<') {
        tokens.push({ type: 'REDIRECT', op: '<', sourceFd: 0, raw: '<' });
        i++;
        continue;
      }

      // Otherwise, parse a WORD token (may contain quotes, variables, escapes, subshells)
      const segments = [];
      let rawWord = '';
      let hasWildcard = false;

      while (i < len) {
        const c = commandLine[i];
        if (/\s/.test(c) || c === '|' || c === '&' || c === ';' || c === '<' || c === '>') {
          // Lookahead: digit immediately preceding > or < is a redirect, not part of word
          break;
        }

        // Single quotes '...'
        if (c === "'") {
          i++;
          let literal = '';
          while (i < len && commandLine[i] !== "'") {
            literal += commandLine[i];
            i++;
          }
          if (i < len && commandLine[i] === "'") i++; // skip closing quote
          segments.push({ type: 'single_quoted', value: literal });
          rawWord += `'${literal}'`;
          continue;
        }

        // Double quotes "..."
        if (c === '"') {
          i++;
          const dqParts = [];
          let currentLit = '';
          while (i < len && commandLine[i] !== '"') {
            const dc = commandLine[i];
            if (dc === '\\' && i + 1 < len) {
              const nextC = commandLine[i + 1];
              if (nextC === '"' || nextC === '\\' || nextC === '$' || nextC === '`') {
                currentLit += nextC;
                i += 2;
                continue;
              }
              if (nextC === 'n') { currentLit += '\n'; i += 2; continue; }
              if (nextC === 't') { currentLit += '\t'; i += 2; continue; }
              currentLit += '\\' + nextC;
              i += 2;
              continue;
            }

            // Command substitution inside double quotes: $(...) or `...`
            if (dc === '$' && commandLine[i + 1] === '(') {
              if (currentLit) { dqParts.push({ type: 'literal', value: currentLit }); currentLit = ''; }
              i += 2;
              let depth = 1;
              let subCmd = '';
              while (i < len && depth > 0) {
                if (commandLine[i] === '(') depth++;
                else if (commandLine[i] === ')') depth--;
                if (depth > 0) subCmd += commandLine[i];
                i++;
              }
              dqParts.push({ type: 'subshell', command: subCmd });
              continue;
            }

            // Variable inside double quotes: ${VAR} or $VAR
            if (dc === '$') {
              if (currentLit) { dqParts.push({ type: 'literal', value: currentLit }); currentLit = ''; }
              i++;
              if (commandLine[i] === '{') {
                i++;
                let varName = '';
                while (i < len && commandLine[i] !== '}') {
                  varName += commandLine[i];
                  i++;
                }
                if (i < len && commandLine[i] === '}') i++;
                dqParts.push({ type: 'variable', name: varName });
              } else if (/[a-zA-Z0-9_?!$#@]/.test(commandLine[i])) {
                let varName = '';
                while (i < len && /[a-zA-Z0-9_]/.test(commandLine[i])) {
                  varName += commandLine[i];
                  i++;
                }
                if (!varName && /[?!$#@]/.test(commandLine[i])) {
                  varName = commandLine[i];
                  i++;
                }
                dqParts.push({ type: 'variable', name: varName });
              } else {
                currentLit += '$';
              }
              continue;
            }

            currentLit += dc;
            i++;
          }
          if (i < len && commandLine[i] === '"') i++;
          if (currentLit) dqParts.push({ type: 'literal', value: currentLit });
          segments.push({ type: 'double_quoted', parts: dqParts });
          rawWord += `"${currentLit}"`;
          continue;
        }

        // Backslash outside quotes
        if (c === '\\' && i + 1 < len) {
          segments.push({ type: 'literal', value: commandLine[i + 1] });
          rawWord += commandLine[i + 1];
          i += 2;
          continue;
        }

        // Command substitution $(...) outside quotes
        if (c === '$' && commandLine[i + 1] === '(') {
          i += 2;
          let depth = 1;
          let subCmd = '';
          while (i < len && depth > 0) {
            if (commandLine[i] === '(') depth++;
            else if (commandLine[i] === ')') depth--;
            if (depth > 0) subCmd += commandLine[i];
            i++;
          }
          segments.push({ type: 'subshell', command: subCmd });
          rawWord += `$(${subCmd})`;
          continue;
        }

        // Backtick command substitution `...`
        if (c === '`') {
          i++;
          let subCmd = '';
          while (i < len && commandLine[i] !== '`') {
            subCmd += commandLine[i];
            i++;
          }
          if (i < len && commandLine[i] === '`') i++;
          segments.push({ type: 'subshell', command: subCmd });
          rawWord += `\`${subCmd}\``;
          continue;
        }

        // Variable ${VAR} or $VAR outside quotes
        if (c === '$') {
          i++;
          if (commandLine[i] === '{') {
            i++;
            let varName = '';
            while (i < len && commandLine[i] !== '}') {
              varName += commandLine[i];
              i++;
            }
            if (i < len && commandLine[i] === '}') i++;
            segments.push({ type: 'variable', name: varName });
            rawWord += `\${${varName}}`;
          } else if (/[a-zA-Z0-9_?!$#@]/.test(commandLine[i])) {
            let varName = '';
            if (/[?!$#@]/.test(commandLine[i])) {
              varName = commandLine[i];
              i++;
            } else {
              while (i < len && /[a-zA-Z0-9_]/.test(commandLine[i])) {
                varName += commandLine[i];
                i++;
              }
            }
            segments.push({ type: 'variable', name: varName });
            rawWord += `$${varName}`;
          } else {
            segments.push({ type: 'literal', value: '$' });
            rawWord += '$';
          }
          continue;
        }

        // Wildcard detection
        if (c === '*' || c === '?' || c === '[') {
          hasWildcard = true;
        }

        // Normal character outside quotes
        segments.push({ type: 'literal', value: c });
        rawWord += c;
        i++;
      }

      tokens.push({
        type: 'WORD',
        segments,
        raw: rawWord,
        hasWildcard
      });
    }

    return tokens;
  }

  // =========================================================================
  // 4. POSIX SHELL AST PARSER
  // =========================================================================
  /**
   * Parses token stream into an executable AST:
   * Sequence -> Logical (&&, ||) -> Pipeline (|) -> SimpleCommand (args, redirects, env)
   */
  function parseShellCommand(input) {
    const tokens = typeof input === 'string' ? tokenizeShell(input) : input;
    let pos = 0;

    function peek() {
      return tokens[pos] || null;
    }

    function next() {
      return tokens[pos++] || null;
    }

    // Sequence: cmd1 ; cmd2 & cmd3
    function parseSequence() {
      const items = [];
      while (pos < tokens.length) {
        if (peek() && peek().type === 'SEMICOLON') {
          next();
          continue;
        }

        const logicalNode = parseLogical();
        if (!logicalNode) break;

        let background = false;
        if (peek() && peek().type === 'BACKGROUND') {
          next();
          background = true;
        } else if (peek() && peek().type === 'SEMICOLON') {
          next();
        }

        items.push({ node: logicalNode, background });
      }

      return {
        type: 'Sequence',
        items
      };
    }

    // Logical: pipeline1 && pipeline2 || pipeline3
    function parseLogical() {
      let left = parsePipeline();
      if (!left) return null;

      while (peek() && (peek().type === 'AND' || peek().type === 'OR')) {
        const opToken = next();
        const right = parsePipeline();
        if (!right) break;
        left = {
          type: 'Logical',
          op: opToken.type === 'AND' ? '&&' : '||',
          left,
          right
        };
      }

      return left;
    }

    // Pipeline: cmd1 | cmd2 | cmd3
    function parsePipeline() {
      const commands = [];
      const first = parseCommand();
      if (!first) return null;
      commands.push(first);

      while (peek() && peek().type === 'PIPE') {
        next(); // consume '|'
        const nextCmd = parseCommand();
        if (nextCmd) commands.push(nextCmd);
      }

      if (commands.length === 1) return commands[0];
      return {
        type: 'Pipeline',
        commands
      };
    }

    // Simple Command: leading ENV=val, name, args, redirections
    function parseCommand() {
      const envVars = [];
      const words = [];
      const redirects = [];

      while (pos < tokens.length) {
        const token = peek();
        if (!token) break;

        if (token.type === 'PIPE' || token.type === 'AND' || token.type === 'OR' ||
            token.type === 'SEMICOLON' || token.type === 'BACKGROUND') {
          break;
        }

        // Redirection with file target: >, >>, <, 2>, 2>>
        if (token.type === 'REDIRECT') {
          next();
          const targetToken = peek();
          let target = null;
          if (targetToken && targetToken.type === 'WORD') {
            target = next();
          }
          redirects.push({
            type: token.op,
            sourceFd: token.sourceFd,
            target
          });
          continue;
        }

        // Redirection FD duplicate: 2>&1, 1>&2
        if (token.type === 'REDIRECT_FD') {
          next();
          redirects.push({
            type: '>&',
            sourceFd: token.sourceFd,
            targetFd: token.targetFd
          });
          continue;
        }

        // Word token
        if (token.type === 'WORD') {
          // If no command name yet, check if this is an environment assignment: KEY=value
          if (words.length === 0 && token.raw.includes('=')) {
            const eqIdx = token.raw.indexOf('=');
            const key = token.raw.slice(0, eqIdx);
            if (/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(key)) {
              envVars.push({ key, rawVal: token.raw.slice(eqIdx + 1), token });
              next();
              continue;
            }
          }

          words.push(next());
          continue;
        }

        // Unrecognized token, advance
        next();
      }

      if (words.length === 0 && envVars.length === 0 && redirects.length === 0) {
        return null;
      }

      return {
        type: 'Command',
        name: words[0] || null,
        args: words.slice(1),
        envVars,
        redirects
      };
    }

    return parseSequence();
  }

  // =========================================================================
  // 5. IN-MEMORY VFS FALLBACK SHIM (For Standalone Zero-Config Usability)
  // =========================================================================
  function createFallbackVfs() {
    const files = new Map();
    const dirs = new Set(['/', '/tmp', '/workspace', '/home', '/home/user']);

    function norm(p) {
      return PosixPath.normalize(p.startsWith('/') ? p : '/workspace/' + p);
    }

    const emitter = {
      _listeners: new Map(),
      on(evt, fn) {
        if (!this._listeners.has(evt)) this._listeners.set(evt, []);
        this._listeners.get(evt).push(fn);
      },
      emit(evt, ...args) {
        const fns = this._listeners.get(evt) || [];
        for (const fn of fns) fn(...args);
      }
    };

    return {
      ...emitter,
      existsSync(p) {
        const np = norm(p);
        return dirs.has(np) || files.has(np);
      },
      statSync(p) {
        const np = norm(p);
        if (dirs.has(np)) {
          return { size: 0, mtimeMs: Date.now(), isDirectory: () => true, isFile: () => false, mode: 0o40755 };
        }
        const f = files.get(np);
        if (f) {
          return { size: f.data.length, mtimeMs: f.mtimeMs, isDirectory: () => false, isFile: () => true, mode: f.mode !== undefined ? f.mode : 0o100644 };
        }
        const err = new Error(`ENOENT: no such file or directory, stat '${p}'`);
        err.code = 'ENOENT';
        throw err;
      },
      chmodSync(p, mode) {
        const np = norm(p);
        if (dirs.has(np)) return;
        const f = files.get(np);
        if (!f) {
          const err = new Error(`ENOENT: no such file or directory, chmod '${p}'`);
          err.code = 'ENOENT';
          throw err;
        }
        const parsedMode = typeof mode === 'string' ? parseInt(mode, 8) : Number(mode);
        const currentType = (f.mode !== undefined ? f.mode : 0o100644) & ~0o777;
        f.mode = currentType | (parsedMode & 0o777);
      },
      readdirSync(p) {
        const np = norm(p);
        if (!dirs.has(np)) {
          const err = new Error(`ENOTDIR: not a directory, scandir '${p}'`);
          err.code = 'ENOTDIR';
          throw err;
        }
        const prefix = np === '/' ? '/' : np + '/';
        const children = new Set();
        for (const d of dirs) {
          if (d !== np && d.startsWith(prefix)) {
            const rest = d.slice(prefix.length).split('/')[0];
            if (rest) children.add(rest);
          }
        }
        for (const f of files.keys()) {
          if (f.startsWith(prefix)) {
            const rest = f.slice(prefix.length);
            if (!rest.includes('/')) children.add(rest);
          }
        }
        return Array.from(children).sort();
      },
      readFileSync(p, enc = 'utf8') {
        const np = norm(p);
        const f = files.get(np);
        if (!f) {
          const err = new Error(`ENOENT: no such file or directory, open '${p}'`);
          err.code = 'ENOENT';
          throw err;
        }
        return typeof enc === 'string' ? f.data : f.data;
      },
      writeFileSync(p, data) {
        const np = norm(p);
        const parent = PosixPath.dirname(np);
        if (!dirs.has(parent)) {
          const parts = parent.split('/').filter(Boolean);
          let cur = '';
          for (const pt of parts) { cur += '/' + pt; dirs.add(cur); }
        }
        const str = typeof data === 'string' ? data : (data.toString ? data.toString('utf8') : String(data));
        const prevMode = files.has(np) ? files.get(np).mode : 0o100644;
        files.set(np, { data: str, mtimeMs: Date.now(), mode: prevMode });
      },
      appendFileSync(p, data) {
        const np = norm(p);
        const prev = files.has(np) ? files.get(np).data : '';
        const str = typeof data === 'string' ? data : (data.toString ? data.toString('utf8') : String(data));
        this.writeFileSync(np, prev + str);
      },
      mkdirSync(p, opts = {}) {
        const np = norm(p);
        const recursive = Boolean(opts && opts.recursive);
        if (files.has(np)) throw new Error(`EEXIST: file already exists, mkdir '${p}'`);
        if (dirs.has(np)) return;
        const parent = PosixPath.dirname(np);
        if (!dirs.has(parent)) {
          if (!recursive) throw new Error(`ENOENT: no such file or directory, mkdir '${p}'`);
          const parts = np.split('/').filter(Boolean);
          let cur = '';
          for (const pt of parts) { cur += '/' + pt; dirs.add(cur); }
          return;
        }
        dirs.add(np);
      },
      rmdirSync(p, opts) {
        this.rmSync(p, { ...opts, recursive: true });
      },
      unlinkSync(p) {
        const np = norm(p);
        if (!files.has(np)) throw new Error(`ENOENT: no such file or directory, unlink '${p}'`);
        files.delete(np);
      },
      rmSync(p, opts = {}) {
        const np = norm(p);
        const recursive = Boolean(opts && opts.recursive);
        const force = Boolean(opts && opts.force);
        if (files.has(np)) { files.delete(np); return; }
        if (dirs.has(np)) {
          const prefix = np === '/' ? '/' : np + '/';
          for (const f of Array.from(files.keys())) {
            if (f.startsWith(prefix)) files.delete(f);
          }
          for (const d of Array.from(dirs)) {
            if (d.startsWith(prefix) && d !== '/' && d !== '/workspace' && d !== '/tmp') dirs.delete(d);
          }
          if (np !== '/' && np !== '/workspace' && np !== '/tmp') dirs.delete(np);
          return;
        }
        if (!force) throw new Error(`ENOENT: no such file or directory, rm '${p}'`);
      },
      renameSync(oldP, newP) {
        const src = norm(oldP);
        const dst = norm(newP);
        if (files.has(src)) {
          files.set(dst, files.get(src));
          files.delete(src);
        } else if (dirs.has(src)) {
          dirs.add(dst);
          dirs.delete(src);
        } else {
          throw new Error(`ENOENT: no such file or directory, rename '${oldP}' -> '${newP}'`);
        }
      },
      copyFileSync(src, dst) {
        const s = norm(src);
        const d = norm(dst);
        if (!files.has(s)) throw new Error(`ENOENT: no such file or directory, copy '${src}'`);
        files.set(d, { data: files.get(s).data, mtimeMs: Date.now() });
      }
    };
  }

  // =========================================================================
  // 6. DIFF & LCS UTILITIES (For `diff -u` and `git diff`)
  // =========================================================================
  function computeUnifiedDiff(file1Name, file2Name, text1, text2) {
    const lines1 = text1.length > 0 ? text1.split('\n') : [];
    const lines2 = text2.length > 0 ? text2.split('\n') : [];

    // LCS table
    const m = lines1.length;
    const n = lines2.length;
    const dp = Array.from({ length: m + 1 }, () => new Int32Array(n + 1));

    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        if (lines1[i - 1] === lines2[j - 1]) {
          dp[i][j] = dp[i - 1][j - 1] + 1;
        } else {
          dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
        }
      }
    }

    // Backtrack to build diff ops
    const edits = [];
    let i = m, j = n;
    while (i > 0 || j > 0) {
      if (i > 0 && j > 0 && lines1[i - 1] === lines2[j - 1]) {
        edits.push({ type: 'common', line: lines1[i - 1] });
        i--;
        j--;
      } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
        edits.push({ type: 'added', line: lines2[j - 1] });
        j--;
      } else if (i > 0 && (j === 0 || dp[i][j - 1] < dp[i - 1][j])) {
        edits.push({ type: 'removed', line: lines1[i - 1] });
        i--;
      }
    }
    edits.reverse();

    if (!edits.some(e => e.type !== 'common')) {
      return ''; // identical
    }

    let diffOutput = `--- ${file1Name}\n+++ ${file2Name}\n@@ -1,${m} +1,${n} @@\n`;
    for (const e of edits) {
      if (e.type === 'common') diffOutput += ` ${e.line}\n`;
      else if (e.type === 'added') diffOutput += `+${e.line}\n`;
      else if (e.type === 'removed') diffOutput += `-${e.line}\n`;
    }
    return diffOutput;
  }

  // =========================================================================
  // Package Management Helpers (npm / bun virtual modules & scripts)
  // =========================================================================
  function findPackageJsonPath(vfs, cwd) {
    const cwdPkg = PosixPath.join(cwd || '/workspace', 'package.json');
    if (vfs.existsSync(cwdPkg)) return cwdPkg;
    const wsPkg = '/workspace/package.json';
    if (vfs.existsSync(wsPkg)) return wsPkg;
    return cwdPkg;
  }

  function readPackageJson(vfs, cwd) {
    const p = findPackageJsonPath(vfs, cwd);
    if (vfs.existsSync(p)) {
      try {
        const parsed = JSON.parse(vfs.readFileSync(p, 'utf8'));
        return { path: p, data: parsed };
      } catch (_) {}
    }
    return { path: p, data: { name: 'app', dependencies: {}, devDependencies: {}, scripts: {} } };
  }

  function writePackageJson(vfs, pkgPath, data, emitMutation) {
    const dir = PosixPath.dirname(pkgPath);
    if (!vfs.existsSync(dir)) {
      vfs.mkdirSync(dir, { recursive: true });
    }
    const jsonStr = JSON.stringify(data, null, 2) + '\n';
    vfs.writeFileSync(pkgPath, jsonStr);
    if (typeof emitMutation === 'function') emitMutation('change', pkgPath);
  }

  function ensureDirSync(vfs, dir, emitMutation) {
    if (!vfs.existsSync(dir)) {
      vfs.mkdirSync(dir, { recursive: true });
      if (typeof emitMutation === 'function') emitMutation('create', dir);
    }
  }

  function removeDirRecursive(vfs, dirPath, emitMutation) {
    if (!vfs.existsSync(dirPath)) return;
    try {
      if (typeof vfs.rmSync === 'function') {
        vfs.rmSync(dirPath, { recursive: true, force: true });
      } else {
        const entries = vfs.readdirSync(dirPath);
        for (const entry of entries) {
          const full = PosixPath.join(dirPath, entry);
          const st = vfs.statSync(full);
          if (st.isDirectory()) {
            removeDirRecursive(vfs, full, emitMutation);
          } else {
            vfs.unlinkSync(full);
          }
        }
        vfs.rmdirSync(dirPath);
      }
      if (typeof emitMutation === 'function') emitMutation('delete', dirPath);
    } catch (_) {}
  }

  function installPackage(pkgSpec, ctx) {
    const parts = pkgSpec.split('@').filter(Boolean);
    const pkgName = pkgSpec.startsWith('@') ? '@' + parts[0] : parts[0];
    const pkgVersion = (pkgSpec.startsWith('@') ? parts[1] : parts[1]) || '^1.0.0';

    const { path: pkgPath, data: pkgData } = readPackageJson(ctx.vfs, ctx.cwd);
    if (!pkgData.dependencies) pkgData.dependencies = {};
    pkgData.dependencies[pkgName] = pkgVersion;
    writePackageJson(ctx.vfs, pkgPath, pkgData, ctx.emitMutation);

    const targetDirs = ['/workspace/node_modules/' + pkgName];
    const cwdTarget = PosixPath.join(ctx.cwd || '/workspace', 'node_modules', pkgName);
    if (!targetDirs.includes(cwdTarget)) targetDirs.push(cwdTarget);

    for (const modDir of targetDirs) {
      ensureDirSync(ctx.vfs, modDir, ctx.emitMutation);
      const modPkgPath = PosixPath.join(modDir, 'package.json');
      const modIndexPath = PosixPath.join(modDir, 'index.js');
      ctx.vfs.writeFileSync(modPkgPath, JSON.stringify({ name: pkgName, version: pkgVersion.replace(/^[\^~]/, ''), main: './index.js' }, null, 2) + '\n');
      if (typeof ctx.emitMutation === 'function') ctx.emitMutation('create', modPkgPath);

      let code = 'module.exports = {};\n';
      if (pkgName === 'is-even') {
        code = 'module.exports = function isEven(n) { return (Number(n) % 2) === 0; };\n';
      } else if (pkgName === 'tiny-invariant') {
        code = 'module.exports = function invariant(condition, message) { if (!condition) throw new Error(message || "Invariant failed"); };\n';
      } else if (pkgName === 'lodash') {
        code = 'module.exports = { isArray: Array.isArray, isObject: function(v) { return v !== null && typeof v === "object"; } };\n';
      }
      ctx.vfs.writeFileSync(modIndexPath, code);
      if (typeof ctx.emitMutation === 'function') ctx.emitMutation('create', modIndexPath);
    }
  }

  function uninstallPackage(pkgName, ctx) {
    const { path: pkgPath, data: pkgData } = readPackageJson(ctx.vfs, ctx.cwd);
    let changed = false;
    if (pkgData.dependencies && pkgName in pkgData.dependencies) {
      delete pkgData.dependencies[pkgName];
      changed = true;
    }
    if (pkgData.devDependencies && pkgName in pkgData.devDependencies) {
      delete pkgData.devDependencies[pkgName];
      changed = true;
    }
    if (changed) {
      writePackageJson(ctx.vfs, pkgPath, pkgData, ctx.emitMutation);
    }

    const targetDirs = ['/workspace/node_modules/' + pkgName];
    const cwdTarget = PosixPath.join(ctx.cwd || '/workspace', 'node_modules', pkgName);
    if (!targetDirs.includes(cwdTarget)) targetDirs.push(cwdTarget);

    for (const modDir of targetDirs) {
      removeDirRecursive(ctx.vfs, modDir, ctx.emitMutation);
    }
  }

  function listDependencies(ctx) {
    const { path: pkgPath, data: pkgData } = readPackageJson(ctx.vfs, ctx.cwd);
    const deps = Object.assign({}, pkgData.dependencies || {});
    let out = `${pkgData.name || 'project'}@${pkgData.version || '1.0.0'} ${ctx.cwd || '/workspace'}\n`;
    const keys = Object.keys(deps);
    if (keys.length === 0) {
      out += '└── (empty)\n';
    } else {
      for (let i = 0; i < keys.length; i++) {
        const k = keys[i];
        const v = String(deps[k]).replace(/^[\^~]/, '');
        const prefix = (i === keys.length - 1) ? '└── ' : '├── ';
        out += `${prefix}${k}@${v}\n`;
      }
    }
    return out;
  }

  async function runPackageScript(scriptName, scriptArgs, ctx) {
    const { data: pkgData } = readPackageJson(ctx.vfs, ctx.cwd);
    if (!pkgData.scripts || !pkgData.scripts[scriptName]) {
      return { code: 1, stdout: '', stderr: `npm ERR! Missing script: "${scriptName}"\n` };
    }
    let cmd = pkgData.scripts[scriptName];
    if (scriptArgs && scriptArgs.length > 0) {
      cmd += ' ' + scriptArgs.join(' ');
    }
    return await ctx.shell.execute(cmd, { cwd: ctx.cwd, env: ctx.env });
  }

  // =========================================================================
  // 7. 40+ UNIX COREUTILS LIBRARY (POSIX Virtual Filesystem Implementations)
  // =========================================================================
  const COREUTILS = {
    // -----------------------------------------------------------------------
    // Navigation & Inspection: pwd, cd, ls, stat
    // -----------------------------------------------------------------------
    async pwd(args, ctx) {
      const dir = ctx.shell ? ctx.shell.cwd : ctx.cwd;
      return { code: 0, stdout: dir + '\n', stderr: '' };
    },

    async cd(args, ctx) {
      let target = args[0];
      if (!target || target === '~') {
        target = ctx.env.HOME || '/workspace';
      } else if (target === '-') {
        target = ctx.env.OLDPWD || ctx.cwd;
      }

      const resolved = ctx.resolvePath(target);
      if (!ctx.vfs.existsSync(resolved)) {
        return { code: 1, stdout: '', stderr: `cd: ${target}: No such file or directory\n` };
      }

      let isDir = false;
      try {
        isDir = ctx.vfs.statSync(resolved).isDirectory();
      } catch (_) {}

      if (!isDir) {
        return { code: 1, stdout: '', stderr: `cd: ${target}: Not a directory\n` };
      }

      const oldPwd = ctx.cwd;
      ctx.cwd = resolved;
      ctx.env.OLDPWD = oldPwd;
      ctx.env.PWD = resolved;
      if (ctx.shell) {
        ctx.shell.cwd = resolved;
        ctx.shell.env.OLDPWD = oldPwd;
        ctx.shell.env.PWD = resolved;
      }
      return { code: 0, stdout: '', stderr: '' };
    },

    async ls(args, ctx) {
      let showAll = false;
      let longFormat = false;
      let humanReadable = false;
      let reverse = false;
      let sortByTime = false;
      let onePerLine = false;
      let recursive = false;
      let dirOnly = false;
      const paths = [];

      for (const arg of args) {
        if (arg.startsWith('-') && arg.length > 1) {
          for (let j = 1; j < arg.length; j++) {
            const flag = arg[j];
            if (flag === 'a' || flag === 'A') showAll = true;
            else if (flag === 'l') longFormat = true;
            else if (flag === 'h') humanReadable = true;
            else if (flag === 'r') reverse = true;
            else if (flag === 't') sortByTime = true;
            else if (flag === '1') onePerLine = true;
            else if (flag === 'R') recursive = true;
            else if (flag === 'd') dirOnly = true;
          }
        } else {
          paths.push(arg);
        }
      }

      if (paths.length === 0) paths.push('.');

      function formatSize(bytes) {
        if (!humanReadable) return String(bytes).padStart(6, ' ');
        if (bytes < 1024) return `${bytes}B`.padStart(5, ' ');
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}K`.padStart(5, ' ');
        return `${(bytes / (1024 * 1024)).toFixed(1)}M`.padStart(5, ' ');
      }

      function formatDate(ms) {
        const d = new Date(ms || Date.now());
        const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        const m = months[d.getMonth()];
        const day = String(d.getDate()).padStart(2, ' ');
        const hr = String(d.getHours()).padStart(2, '0');
        const min = String(d.getMinutes()).padStart(2, '0');
        return `${m} ${day} ${hr}:${min}`;
      }

      let stdout = '';
      let stderr = '';
      let exitCode = 0;

      for (let pIdx = 0; pIdx < paths.length; pIdx++) {
        const rawP = paths[pIdx];
        const absP = ctx.resolvePath(rawP);

        if (!ctx.vfs.existsSync(absP)) {
          stderr += `ls: cannot access '${rawP}': No such file or directory\n`;
          exitCode = 2;
          continue;
        }

        let stat;
        try { stat = ctx.vfs.statSync(absP); } catch (e) {
          stderr += `ls: cannot access '${rawP}': ${e.message}\n`;
          exitCode = 2;
          continue;
        }

        if (paths.length > 1 && stat.isDirectory() && !dirOnly) {
          stdout += (pIdx > 0 ? '\n' : '') + `${rawP}:\n`;
        }

        if (stat.isFile() || dirOnly) {
          if (longFormat) {
            stdout += `-rw-r--r-- 1 ${ctx.env.USER || 'codelab'} ${ctx.env.USER || 'codelab'} ${formatSize(stat.size)} ${formatDate(stat.mtimeMs)} ${rawP}\n`;
          } else {
            stdout += `${rawP}\n`;
          }
          continue;
        }

        // Directory listing
        let entries = [];
        try {
          entries = ctx.vfs.readdirSync(absP);
        } catch (err) {
          stderr += `ls: cannot open directory '${rawP}': ${err.message}\n`;
          exitCode = 2;
          continue;
        }

        if (showAll) {
          entries = ['.', '..', ...entries];
        } else {
          entries = entries.filter(e => !e.startsWith('.'));
        }

        const items = entries.map(name => {
          const itemPath = absP === '/' ? '/' + name : absP + '/' + name;
          let isDirectory = false;
          let size = 0;
          let mtimeMs = Date.now();
          try {
            const st = ctx.vfs.statSync(itemPath);
            isDirectory = st.isDirectory();
            size = st.size;
            mtimeMs = st.mtimeMs || Date.now();
          } catch (_) {}
          return { name, isDirectory, size, mtimeMs };
        });

        if (sortByTime) {
          items.sort((a, b) => b.mtimeMs - a.mtimeMs);
        } else {
          items.sort((a, b) => a.name.localeCompare(b.name));
        }

        if (reverse) items.reverse();

        if (longFormat) {
          let totalBlocks = 0;
          for (const it of items) totalBlocks += Math.ceil(it.size / 512);
          stdout += `total ${totalBlocks}\n`;
          for (const it of items) {
            const mode = it.isDirectory ? 'drwxr-xr-x' : '-rw-r--r--';
            stdout += `${mode} 1 ${ctx.env.USER || 'codelab'} ${ctx.env.USER || 'codelab'} ${formatSize(it.size)} ${formatDate(it.mtimeMs)} ${it.name}\n`;
          }
        } else if (onePerLine) {
          for (const it of items) stdout += `${it.name}\n`;
        } else {
          stdout += items.map(it => it.name).join('  ') + (items.length > 0 ? '\n' : '');
        }
      }

      return { code: exitCode, stdout, stderr };
    },

    async stat(args, ctx) {
      if (args.length === 0) {
        return { code: 1, stdout: '', stderr: 'stat: missing operand\n' };
      }
      let stdout = '';
      let stderr = '';
      let code = 0;

      for (const arg of args) {
        const abs = ctx.resolvePath(arg);
        if (!ctx.vfs.existsSync(abs)) {
          stderr += `stat: cannot stat '${arg}': No such file or directory\n`;
          code = 1;
          continue;
        }
        const st = ctx.vfs.statSync(abs);
        const isDir = st.isDirectory();
        const d = new Date(st.mtimeMs || Date.now());
        stdout += `  File: ${arg}\n`;
        stdout += `  Size: ${st.size}\tBlocks: ${Math.ceil(st.size / 512)}\tIO Block: 4096\t${isDir ? 'directory' : 'regular file'}\n`;
        stdout += `Device: 1h/1d\tInode: 100\tLinks: 1\n`;
        stdout += `Access: (${isDir ? '0755/drwxr-xr-x' : '0644/-rw-r--r--'})\tUid: (1000/${ctx.env.USER || 'codelab'})\tGid: (1000/${ctx.env.USER || 'codelab'})\n`;
        stdout += `Access: ${d.toISOString()}\n`;
        stdout += `Modify: ${d.toISOString()}\n`;
        stdout += `Change: ${d.toISOString()}\n`;
        stdout += ` Birth: ${d.toISOString()}\n`;
      }
      return { code, stdout, stderr };
    },

    // -----------------------------------------------------------------------
    // Content Display: cat, head, tail, echo, printf
    // -----------------------------------------------------------------------
    async cat(args, ctx) {
      let numberLines = false;
      let numberNonBlank = false;
      let squeezeBlank = false;
      const files = [];

      for (const arg of args) {
        if (arg === '-n') numberLines = true;
        else if (arg === '-b') numberNonBlank = true;
        else if (arg === '-s') squeezeBlank = true;
        else files.push(arg);
      }

      let rawContent = '';
      let code = 0;
      let stderr = '';

      if (files.length === 0 || (files.length === 1 && files[0] === '-')) {
        rawContent = ctx.stdin || '';
      } else {
        for (const file of files) {
          if (file === '-') {
            rawContent += ctx.stdin || '';
            continue;
          }
          const abs = ctx.resolvePath(file);
          if (!ctx.vfs.existsSync(abs)) {
            stderr += `cat: ${file}: No such file or directory\n`;
            code = 1;
            continue;
          }
          try {
            rawContent += ctx.vfs.readFileSync(abs, 'utf8');
          } catch (err) {
            stderr += `cat: ${file}: ${err.message}\n`;
            code = 1;
          }
        }
      }

      if (!numberLines && !numberNonBlank && !squeezeBlank) {
        return { code, stdout: rawContent, stderr };
      }

      const lines = rawContent.split('\n');
      let outLines = [];
      let lineNum = 1;
      let prevWasBlank = false;

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const isBlank = line.trim() === '';
        if (squeezeBlank && isBlank && prevWasBlank) continue;
        prevWasBlank = isBlank;

        if (numberNonBlank) {
          if (!isBlank) {
            outLines.push(`${String(lineNum++).padStart(6, ' ')}\t${line}`);
          } else {
            outLines.push(line);
          }
        } else if (numberLines) {
          outLines.push(`${String(lineNum++).padStart(6, ' ')}\t${line}`);
        } else {
          outLines.push(line);
        }
      }

      return { code, stdout: outLines.join('\n'), stderr };
    },

    async head(args, ctx) {
      let numLines = 10;
      const files = [];

      for (let i = 0; i < args.length; i++) {
        const a = args[i];
        if (a === '-n' && i + 1 < args.length) {
          const parsed = parseInt(args[++i], 10);
          numLines = isNaN(parsed) ? 10 : parsed;
        } else if (/^-\d+$/.test(a)) {
          const parsed = parseInt(a.slice(1), 10);
          numLines = isNaN(parsed) ? 10 : parsed;
        } else {
          files.push(a);
        }
      }

      function processText(text) {
        if (numLines <= 0) return '';
        const lines = text.split('\n');
        return lines.slice(0, numLines).join('\n') + (lines.length > 0 ? '\n' : '');
      }

      if (files.length === 0) {
        return { code: 0, stdout: processText(ctx.stdin || ''), stderr: '' };
      }

      let stdout = '';
      let stderr = '';
      let code = 0;

      for (const f of files) {
        const abs = ctx.resolvePath(f);
        if (!ctx.vfs.existsSync(abs)) {
          stderr += `head: cannot open '${f}' for reading: No such file or directory\n`;
          code = 1;
          continue;
        }
        if (ctx.vfs.statSync && ctx.vfs.statSync(abs).isDirectory()) {
          stderr += `head: error reading '${f}': Is a directory\n`;
          code = 1;
          continue;
        }
        try {
          const text = ctx.vfs.readFileSync(abs, 'utf8');
          stdout += processText(text);
        } catch (err) {
          stderr += `head: ${err.message}\n`;
          code = 1;
        }
      }

      return { code, stdout, stderr };
    },

    async tail(args, ctx) {
      let numLines = 10;
      const files = [];

      for (let i = 0; i < args.length; i++) {
        const a = args[i];
        if (a === '-n' && i + 1 < args.length) {
          const parsed = parseInt(args[++i], 10);
          numLines = isNaN(parsed) ? 10 : parsed;
        } else if (/^-\d+$/.test(a)) {
          const parsed = parseInt(a.slice(1), 10);
          numLines = isNaN(parsed) ? 10 : parsed;
        } else {
          files.push(a);
        }
      }

      function processText(text) {
        if (numLines <= 0) return '';
        const lines = text.endsWith('\n') ? text.slice(0, -1).split('\n') : text.split('\n');
        const slice = lines.slice(Math.max(0, lines.length - numLines));
        return slice.join('\n') + '\n';
      }

      if (files.length === 0) {
        return { code: 0, stdout: processText(ctx.stdin || ''), stderr: '' };
      }

      let stdout = '';
      let stderr = '';
      let code = 0;

      for (const f of files) {
        const abs = ctx.resolvePath(f);
        if (!ctx.vfs.existsSync(abs)) {
          stderr += `tail: cannot open '${f}' for reading: No such file or directory\n`;
          code = 1;
          continue;
        }
        if (ctx.vfs.statSync && ctx.vfs.statSync(abs).isDirectory()) {
          stderr += `tail: error reading '${f}': Is a directory\n`;
          code = 1;
          continue;
        }
        try {
          const text = ctx.vfs.readFileSync(abs, 'utf8');
          stdout += processText(text);
        } catch (err) {
          stderr += `tail: ${err.message}\n`;
          code = 1;
        }
      }

      return { code, stdout, stderr };
    },

    async echo(args, ctx) {
      let omitNewline = false;
      let interpretEscapes = false;
      let startIdx = 0;

      while (startIdx < args.length && args[startIdx].startsWith('-')) {
        const flag = args[startIdx];
        if (flag === '-n') omitNewline = true;
        else if (flag === '-e') interpretEscapes = true;
        else if (flag === '-ne' || flag === '-en') { omitNewline = true; interpretEscapes = true; }
        else break;
        startIdx++;
      }

      let out = args.slice(startIdx).join(' ');
      if (interpretEscapes) {
        out = out
          .replace(/\\n/g, '\n')
          .replace(/\\t/g, '\t')
          .replace(/\\r/g, '\r')
          .replace(/\\b/g, '\b')
          .replace(/\\f/g, '\f')
          .replace(/\\\\/g, '\\');
      }

      return { code: 0, stdout: out + (omitNewline ? '' : '\n'), stderr: '' };
    },

    async printf(args, ctx) {
      if (args.length === 0) return { code: 0, stdout: '', stderr: '' };
      let fmt = args[0]
        .replace(/\\n/g, '\n')
        .replace(/\\t/g, '\t')
        .replace(/\\r/g, '\r')
        .replace(/\\\\/g, '\\');

      let argIdx = 1;
      const formatted = fmt.replace(/%([-+0 #]*)(\d+)?(?:\.(\d+))?([sdifxX%])/g, (match, flags, width, prec, type) => {
        if (type === '%') return '%';
        const val = args[argIdx++];
        if (val === undefined) return '';
        let s = '';
        if (type === 's') {
          s = String(val);
          if (prec !== undefined && prec !== '') s = s.slice(0, parseInt(prec, 10));
        } else if (type === 'd' || type === 'i') {
          s = String(parseInt(val, 10) || 0);
        } else if (type === 'f') {
          const num = parseFloat(val) || 0;
          s = prec !== undefined && prec !== '' ? num.toFixed(parseInt(prec, 10)) : String(num);
        } else if (type === 'x') {
          s = (Number(val) || 0).toString(16);
        } else if (type === 'X') {
          s = (Number(val) || 0).toString(16).toUpperCase();
        } else {
          return match;
        }

        if (width) {
          const w = parseInt(width, 10);
          if (flags && flags.includes('0') && (type === 'd' || type === 'i')) {
            const isNeg = s.startsWith('-');
            if (isNeg) s = s.slice(1);
            s = s.padStart(w - (isNeg ? 1 : 0), '0');
            if (isNeg) s = '-' + s;
          } else if (flags && flags.includes('-')) {
            s = s.padEnd(w, ' ');
          } else {
            s = s.padStart(w, ' ');
          }
        }
        return s;
      });

      return { code: 0, stdout: formatted, stderr: '' };
    },

    // -----------------------------------------------------------------------
    // Search & Matching: grep, find
    // -----------------------------------------------------------------------
    async grep(args, ctx) {
      let ignoreCase = false;
      let invertMatch = false;
      let lineNumbers = false;
      let countOnly = false;
      let filesOnly = false;
      let recursive = false;
      let extendedRegex = false;
      let pattern = null;
      const fileArgs = [];

      for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        if (arg.startsWith('-') && arg.length > 1) {
          for (let j = 1; j < arg.length; j++) {
            const flag = arg[j];
            if (flag === 'i') ignoreCase = true;
            else if (flag === 'v') invertMatch = true;
            else if (flag === 'n') lineNumbers = true;
            else if (flag === 'c') countOnly = true;
            else if (flag === 'l') filesOnly = true;
            else if (flag === 'r' || flag === 'R') recursive = true;
            else if (flag === 'E') extendedRegex = true;
          }
        } else if (pattern === null) {
          pattern = arg;
        } else {
          fileArgs.push(arg);
        }
      }

      if (!pattern) {
        return { code: 2, stdout: '', stderr: 'grep: missing pattern\n' };
      }

      let regex;
      try {
        regex = new RegExp(pattern, ignoreCase ? 'i' : '');
      } catch (e) {
        return { code: 2, stdout: '', stderr: `grep: invalid pattern: ${e.message}\n` };
      }

      // Collect target files
      const targets = [];
      if (recursive) {
        const roots = fileArgs.length > 0 ? fileArgs : ['.'];
        for (const root of roots) {
          const absRoot = ctx.resolvePath(root);
          function walk(dir) {
            try {
              const entries = ctx.vfs.readdirSync(dir);
              for (const e of entries) {
                const full = dir === '/' ? '/' + e : dir + '/' + e;
                const st = ctx.vfs.statSync(full);
                if (st.isDirectory()) walk(full);
                else targets.push(full);
              }
            } catch (_) {}
          }
          if (ctx.vfs.existsSync(absRoot)) {
            const st = ctx.vfs.statSync(absRoot);
            if (st.isDirectory()) walk(absRoot);
            else targets.push(absRoot);
          }
        }
      } else {
        for (const f of fileArgs) {
          targets.push(ctx.resolvePath(f));
        }
      }

      let stdout = '';
      let stderr = '';
      let totalMatches = 0;
      let hasFileError = false;

      function checkText(text, label) {
        const lines = text.split('\n');
        if (lines.length > 0 && lines[lines.length - 1] === '') lines.pop();
        let fileMatchCount = 0;
        let fileOutput = '';

        for (let lIdx = 0; lIdx < lines.length; lIdx++) {
          const line = lines[lIdx];
          const matched = regex.test(line);
          const shouldInclude = invertMatch ? !matched : matched;

          if (shouldInclude) {
            fileMatchCount++;
            totalMatches++;
            if (filesOnly) {
              stdout += `${label}\n`;
              return;
            }
            if (!countOnly) {
              const prefix = label ? `${label}:` : '';
              const numPrefix = lineNumbers ? `${lIdx + 1}:` : '';
              fileOutput += `${prefix}${numPrefix}${line}\n`;
            }
          }
        }

        if (countOnly) {
          const prefix = label ? `${label}:` : '';
          stdout += `${prefix}${fileMatchCount}\n`;
        } else {
          stdout += fileOutput;
        }
      }

      if (targets.length === 0) {
        checkText(ctx.stdin || '', '');
      } else {
        const multiple = targets.length > 1;
        for (const t of targets) {
          if (!ctx.vfs.existsSync(t)) {
            stderr += `grep: ${t}: No such file or directory\n`;
            hasFileError = true;
            continue;
          }
          try {
            const content = ctx.vfs.readFileSync(t, 'utf8');
            const displayLabel = multiple ? PosixPath.normalize(t.replace('/workspace/', '')) : '';
            checkText(content, displayLabel);
          } catch (e) {
            stderr += `grep: ${t}: ${e.message}\n`;
            hasFileError = true;
          }
        }
      }

      let exitCode = 1;
      if (totalMatches > 0) exitCode = 0;
      else if (hasFileError) exitCode = 2;

      return { code: exitCode, stdout, stderr };
    },

    async find(args, ctx) {
      let root = '.';
      let namePattern = null;
      let typeFilter = null; // 'f' or 'd'
      let maxDepth = Infinity;

      let i = 0;
      if (args[0] && !args[0].startsWith('-')) {
        root = args[0];
        i = 1;
      }

      while (i < args.length) {
        const opt = args[i];
        if (opt === '-name' && i + 1 < args.length) {
          namePattern = args[++i];
        } else if (opt === '-type' && i + 1 < args.length) {
          typeFilter = args[++i];
        } else if (opt === '-maxdepth' && i + 1 < args.length) {
          maxDepth = parseInt(args[++i], 10) || Infinity;
        }
        i++;
      }

      const nameRegex = namePattern ? globToRegExp(namePattern, false) : null;
      const absRoot = ctx.resolvePath(root);
      const results = [];

      function walk(dirPath, depth) {
        if (depth > maxDepth) return;
        let entries = [];
        try {
          entries = ctx.vfs.readdirSync(dirPath);
        } catch (_) {
          return;
        }

        for (const entry of entries) {
          const full = dirPath === '/' ? '/' + entry : dirPath + '/' + entry;
          let isDir = false;
          try {
            isDir = ctx.vfs.statSync(full).isDirectory();
          } catch (_) {}

          const relPath = root === '.'
            ? './' + full.replace(absRoot.endsWith('/') ? absRoot : absRoot + '/', '')
            : full;

          let matches = true;
          if (typeFilter === 'f' && isDir) matches = false;
          if (typeFilter === 'd' && !isDir) matches = false;
          if (nameRegex && !nameRegex.test(entry)) matches = false;

          if (matches) results.push(relPath);
          if (isDir) walk(full, depth + 1);
        }
      }

      // Root itself check
      if (ctx.vfs.existsSync(absRoot)) {
        let isDir = false;
        try { isDir = ctx.vfs.statSync(absRoot).isDirectory(); } catch (_) {}
        if (!typeFilter || (typeFilter === 'd' && isDir) || (typeFilter === 'f' && !isDir)) {
          if (!nameRegex || nameRegex.test(PosixPath.basename(root))) {
            results.push(root);
          }
        }
        if (isDir) walk(absRoot, 1);
      } else {
        return { code: 1, stdout: '', stderr: `find: '${root}': No such file or directory\n` };
      }

      results.sort();
      return { code: 0, stdout: results.join('\n') + (results.length > 0 ? '\n' : ''), stderr: '' };
    },

    // -----------------------------------------------------------------------
    // Text Manipulation: wc, sort, uniq, sed, awk, cut, tr, diff
    // -----------------------------------------------------------------------
    async wc(args, ctx) {
      let countLines = false;
      let countWords = false;
      let countBytes = false;
      const files = [];

      for (const arg of args) {
        if (arg === '-l') countLines = true;
        else if (arg === '-w') countWords = true;
        else if (arg === '-c' || arg === '-m') countBytes = true;
        else files.push(arg);
      }

      if (!countLines && !countWords && !countBytes) {
        countLines = true;
        countWords = true;
        countBytes = true;
      }

      function countText(text) {
        const lines = text.length === 0 ? 0 : (text.match(/\n/g) || []).length;
        const words = (text.trim().match(/\S+/g) || []).length;
        const bytes = Buffer.byteLength(text, 'utf8');
        return { lines, words, bytes };
      }

      function formatCounts(c, label) {
        let parts = [];
        if (countLines) parts.push(String(c.lines).padStart(4, ' '));
        if (countWords) parts.push(String(c.words).padStart(4, ' '));
        if (countBytes) parts.push(String(c.bytes).padStart(4, ' '));
        if (label) parts.push(label);
        return parts.join(' ') + '\n';
      }

      if (files.length === 0) {
        const c = countText(ctx.stdin || '');
        return { code: 0, stdout: formatCounts(c, ''), stderr: '' };
      }

      let stdout = '';
      let stderr = '';
      let code = 0;
      let total = { lines: 0, words: 0, bytes: 0 };

      for (const f of files) {
        const abs = ctx.resolvePath(f);
        if (!ctx.vfs.existsSync(abs)) {
          stderr += `wc: ${f}: No such file or directory\n`;
          code = 1;
          continue;
        }
        try {
          const st = ctx.vfs.statSync(abs);
          if (st.isDirectory()) {
            stderr += `wc: ${f}: Is a directory\n`;
            code = 1;
            continue;
          }
          const content = ctx.vfs.readFileSync(abs, 'utf8');
          const c = countText(content);
          total.lines += c.lines;
          total.words += c.words;
          total.bytes += c.bytes;
          stdout += formatCounts(c, f);
        } catch (e) {
          stderr += `wc: ${f}: ${e.message}\n`;
          code = 1;
        }
      }

      if (files.length > 1) {
        stdout += formatCounts(total, 'total');
      }

      return { code, stdout, stderr };
    },

    async sort(args, ctx) {
      let reverse = false;
      let numeric = false;
      let unique = false;
      let ignoreCase = false;
      let keyCol = null;
      let delim = null;
      const files = [];

      for (let i = 0; i < args.length; i++) {
        const a = args[i];
        if (a === '-k' && i + 1 < args.length) {
          keyCol = parseInt(args[++i], 10) - 1;
        } else if (a === '-t' && i + 1 < args.length) {
          delim = args[++i];
        } else if (a.startsWith('-') && a.length > 1 && !a.startsWith('--')) {
          for (let j = 1; j < a.length; j++) {
            const ch = a[j];
            if (ch === 'r') reverse = true;
            else if (ch === 'n') numeric = true;
            else if (ch === 'u') unique = true;
            else if (ch === 'f') ignoreCase = true;
            else {
              files.push(a);
              break;
            }
          }
        } else {
          files.push(a);
        }
      }

      let text = '';
      if (files.length === 0) {
        text = ctx.stdin || '';
      } else {
        for (const f of files) {
          const abs = ctx.resolvePath(f);
          if (!ctx.vfs.existsSync(abs)) {
            return { code: 1, stdout: '', stderr: `sort: cannot read '${f}': No such file or directory\n` };
          }
          try {
            const st = ctx.vfs.statSync(abs);
            if (st.isDirectory()) {
              return { code: 1, stdout: '', stderr: `sort: read failed: ${f}: Is a directory\n` };
            }
            text += ctx.vfs.readFileSync(abs, 'utf8');
          } catch (err) {
            return { code: 1, stdout: '', stderr: `sort: cannot read '${f}': ${err.message}\n` };
          }
        }
      }

      let lines = text.split('\n');
      if (lines.length > 0 && lines[lines.length - 1] === '') lines.pop();

      lines.sort((a, b) => {
        let valA = a;
        let valB = b;
        if (keyCol !== null) {
          const partsA = delim ? a.split(delim) : a.trim().split(/\s+/);
          const partsB = delim ? b.split(delim) : b.trim().split(/\s+/);
          valA = partsA[keyCol] || '';
          valB = partsB[keyCol] || '';
        }
        if (numeric) {
          const numA = parseFloat(valA) || 0;
          const numB = parseFloat(valB) || 0;
          return numA - numB;
        }
        if (ignoreCase) {
          return valA.toLowerCase().localeCompare(valB.toLowerCase());
        }
        return valA.localeCompare(valB);
      });

      if (reverse) lines.reverse();
      if (unique) {
        lines = Array.from(new Set(lines));
      }

      return { code: 0, stdout: lines.join('\n') + (lines.length > 0 ? '\n' : ''), stderr: '' };
    },

    async uniq(args, ctx) {
      let count = false;
      let duplicatesOnly = false;
      let uniqueOnly = false;
      let ignoreCase = false;
      const files = [];

      for (const a of args) {
        if (a.startsWith('-') && a.length > 1 && !a.startsWith('--')) {
          for (let j = 1; j < a.length; j++) {
            const ch = a[j];
            if (ch === 'c') count = true;
            else if (ch === 'd') duplicatesOnly = true;
            else if (ch === 'u') uniqueOnly = true;
            else if (ch === 'i') ignoreCase = true;
            else {
              files.push(a);
              break;
            }
          }
        } else {
          files.push(a);
        }
      }

      let text = ctx.stdin || '';
      if (files.length > 0) {
        const abs = ctx.resolvePath(files[0]);
        if (!ctx.vfs.existsSync(abs)) {
          return { code: 1, stdout: '', stderr: `uniq: ${files[0]}: No such file or directory\n` };
        }
        try {
          const st = ctx.vfs.statSync(abs);
          if (st.isDirectory()) {
            return { code: 1, stdout: '', stderr: `uniq: error reading '${files[0]}': Is a directory\n` };
          }
          text = ctx.vfs.readFileSync(abs, 'utf8');
        } catch (err) {
          return { code: 1, stdout: '', stderr: `uniq: error reading '${files[0]}': ${err.message}\n` };
        }
      }

      const lines = text.split('\n');
      if (lines.length > 0 && lines[lines.length - 1] === '') lines.pop();

      const grouped = [];
      let currentLine = null;
      let currentCount = 0;

      for (const l of lines) {
        const cmp = ignoreCase ? l.toLowerCase() : l;
        const curCmp = ignoreCase && currentLine !== null ? currentLine.toLowerCase() : currentLine;
        if (cmp === curCmp) {
          currentCount++;
        } else {
          if (currentLine !== null) grouped.push({ line: currentLine, count: currentCount });
          currentLine = l;
          currentCount = 1;
        }
      }
      if (currentLine !== null) grouped.push({ line: currentLine, count: currentCount });

      let stdout = '';
      for (const g of grouped) {
        if (duplicatesOnly && g.count === 1) continue;
        if (uniqueOnly && g.count > 1) continue;
        if (count) {
          stdout += `${String(g.count).padStart(4, ' ')} ${g.line}\n`;
        } else {
          stdout += `${g.line}\n`;
        }
      }

      return { code: 0, stdout, stderr: '' };
    },

    async sed(args, ctx) {
      let inPlace = false;
      let script = null;
      const files = [];

      for (let i = 0; i < args.length; i++) {
        const a = args[i];
        if (a === '-i') {
          inPlace = true;
        } else if (a === '-e' && i + 1 < args.length) {
          script = args[++i];
        } else if (!script) {
          script = a;
        } else {
          files.push(a);
        }
      }

      if (!script) {
        return { code: 1, stdout: '', stderr: 'sed: missing expression\n' };
      }

      function splitWithEscape(str, d) {
        const parts = [];
        let cur = '';
        let esc = false;
        for (let idx = 0; idx < str.length; idx++) {
          const ch = str[idx];
          if (esc) {
            if (ch === d) {
              cur += d;
            } else {
              cur += '\\' + ch;
            }
            esc = false;
          } else if (ch === '\\') {
            esc = true;
          } else if (ch === d) {
            parts.push(cur);
            cur = '';
          } else {
            cur += ch;
          }
        }
        parts.push(cur);
        return parts;
      }

      function applyScript(content) {
        // Substitute command: s/find/replace/flags (supports custom delimiters like s|foo|bar|g)
        if (script.startsWith('s')) {
          const delim = script[1];
          const parts = splitWithEscape(script.slice(2), delim);
          if (parts.length >= 2) {
            const find = parts[0];
            const repl = parts[1];
            const flags = parts[2] || '';
            const regex = new RegExp(find, flags.includes('g') ? 'g' : '');
            return content.split('\n').map(line => line.replace(regex, repl)).join('\n');
          }
        }
        // Delete command: /pattern/d or 1d
        if (script.endsWith('d')) {
          const addr = script.slice(0, -1);
          if (/^\d+$/.test(addr)) {
            const targetLine = parseInt(addr, 10);
            return content.split('\n').filter((_, idx) => idx + 1 !== targetLine).join('\n');
          }
          if (addr.startsWith('/') && addr.endsWith('/')) {
            const pattern = addr.slice(1, -1);
            const regex = new RegExp(pattern);
            return content.split('\n').filter(line => !regex.test(line)).join('\n');
          }
        }
        return content;
      }

      if (files.length === 0) {
        try {
          return { code: 0, stdout: applyScript(ctx.stdin || ''), stderr: '' };
        } catch (err) {
          return { code: 1, stdout: '', stderr: `sed: ${err.message}\n` };
        }
      }

      let stdout = '';
      let stderr = '';
      let code = 0;

      for (const f of files) {
        const abs = ctx.resolvePath(f);
        if (!ctx.vfs.existsSync(abs)) {
          stderr += `sed: can't read ${f}: No such file or directory\n`;
          code = 1;
          continue;
        }
        try {
          const st = ctx.vfs.statSync(abs);
          if (st.isDirectory()) {
            stderr += `sed: couldn't edit ${f}: is a directory\n`;
            code = 1;
            continue;
          }
          const text = ctx.vfs.readFileSync(abs, 'utf8');
          const modified = applyScript(text);
          if (inPlace) {
            ctx.vfs.writeFileSync(abs, modified);
            ctx.emitMutation('change', abs);
          } else {
            stdout += modified;
          }
        } catch (err) {
          stderr += `sed: ${err.message}\n`;
          code = 1;
        }
      }

      return { code, stdout, stderr };
    },

    async awk(args, ctx) {
      let delim = null;
      let script = null;
      const files = [];

      for (let i = 0; i < args.length; i++) {
        const a = args[i];
        if (a === '-F' && i + 1 < args.length) {
          delim = args[++i];
        } else if (a.startsWith('-F') && a.length > 2) {
          delim = a.slice(2);
        } else if (!script) {
          script = a;
        } else {
          files.push(a);
        }
      }

      if (!script) return { code: 1, stdout: '', stderr: 'awk: missing script\n' };

      let text = ctx.stdin || '';
      if (files.length > 0) {
        text = '';
        for (const f of files) {
          const abs = ctx.resolvePath(f);
          if (!ctx.vfs.existsSync(abs)) {
            return { code: 1, stdout: '', stderr: `awk: cannot open ${f} (No such file or directory)\n` };
          }
          try {
            const st = ctx.vfs.statSync(abs);
            if (st.isDirectory()) {
              return { code: 1, stdout: '', stderr: `awk: ${f}: Is a directory\n` };
            }
            text += ctx.vfs.readFileSync(abs, 'utf8');
          } catch (err) {
            return { code: 1, stdout: '', stderr: `awk: ${f}: ${err.message}\n` };
          }
        }
      }

      const lines = text.split('\n');
      if (lines.length > 0 && lines[lines.length - 1] === '') lines.pop();

      let stdout = '';
      for (let lIdx = 0; lIdx < lines.length; lIdx++) {
        const line = lines[lIdx];
        const cols = delim ? (delim.length === 1 ? line.split(delim) : line.split(new RegExp(delim))) : line.trim().split(/\s+/);
        const NR = lIdx + 1;
        const NF = cols.length;

        // Basic {print $1, $2, ...} parser
        const printMatch = script.match(/print\s+(.+)}/);
        if (printMatch) {
          const exprs = printMatch[1].split(',').map(s => s.trim());
          const vals = exprs.map(e => {
            if (e === '$0') return line;
            if (e === '$NF') return cols[cols.length - 1] || '';
            if (e.startsWith('$')) {
              const colIdx = parseInt(e.slice(1), 10) - 1;
              return cols[colIdx] || '';
            }
            if (e === 'NR') return String(NR);
            if (e === 'NF') return String(NF);
            if (e.startsWith('"') && e.endsWith('"')) return e.slice(1, -1);
            return e;
          });
          stdout += vals.join(' ') + '\n';
        } else {
          stdout += line + '\n';
        }
      }

      return { code: 0, stdout, stderr: '' };
    },

    async cut(args, ctx) {
      let delim = '\t';
      let fields = null;
      let chars = null;
      const files = [];

      for (let i = 0; i < args.length; i++) {
        const a = args[i];
        if (a === '-d' && i + 1 < args.length) {
          delim = args[++i];
        } else if (a.startsWith('-d')) {
          delim = a.slice(2);
        } else if (a === '-f' && i + 1 < args.length) {
          fields = args[++i];
        } else if (a.startsWith('-f')) {
          fields = a.slice(2);
        } else if (a === '-c' && i + 1 < args.length) {
          chars = args[++i];
        } else if (a.startsWith('-c')) {
          chars = a.slice(2);
        } else {
          files.push(a);
        }
      }

      const selectedCols = [];
      if (fields) {
        for (const part of fields.split(',')) {
          if (part.includes('-')) {
            const [start, end] = part.split('-').map(Number);
            for (let c = start; c <= end; c++) selectedCols.push(c - 1);
          } else {
            selectedCols.push(parseInt(part, 10) - 1);
          }
        }
      }

      let text = ctx.stdin || '';
      if (files.length > 0) {
        text = '';
        for (const f of files) {
          const abs = ctx.resolvePath(f);
          if (!ctx.vfs.existsSync(abs)) {
            return { code: 1, stdout: '', stderr: `cut: ${f}: No such file or directory\n` };
          }
          try {
            const st = ctx.vfs.statSync(abs);
            if (st.isDirectory()) {
              return { code: 1, stdout: '', stderr: `cut: ${f}: Is a directory\n` };
            }
            text += ctx.vfs.readFileSync(abs, 'utf8');
          } catch (e) {
            return { code: 1, stdout: '', stderr: `cut: ${f}: ${e.message}\n` };
          }
        }
      }

      const lines = text.split('\n');
      if (lines.length > 0 && lines[lines.length - 1] === '') lines.pop();

      if (chars) {
        const ranges = chars.split(',').map(part => {
          if (part.includes('-')) {
            const [start, end] = part.split('-').map(Number);
            return { start: start - 1, end: end };
          }
          const idx = parseInt(part, 10) - 1;
          return { start: idx, end: idx + 1 };
        });
        const out = lines.map(line => {
          let res = '';
          for (const r of ranges) {
            res += line.slice(r.start, r.end);
          }
          return res;
        });
        return { code: 0, stdout: out.join('\n') + (out.length > 0 ? '\n' : ''), stderr: '' };
      }

      const out = lines.map(line => {
        const parts = line.split(delim);
        if (selectedCols.length === 0) return line;
        return selectedCols.map(c => parts[c] || '').join(delim);
      });

      return { code: 0, stdout: out.join('\n') + (out.length > 0 ? '\n' : ''), stderr: '' };
    },

    async tr(args, ctx) {
      let deleteMode = false;
      let squeezeMode = false;
      let set1 = '';
      let set2 = '';

      for (const a of args) {
        if (a === '-d') deleteMode = true;
        else if (a === '-s') squeezeMode = true;
        else if (!set1) set1 = a;
        else if (!set2) set2 = a;
      }

      function expandSet(s) {
        if (s === '[:lower:]' || s === 'a-z') return 'abcdefghijklmnopqrstuvwxyz';
        if (s === '[:upper:]' || s === 'A-Z') return 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        if (s === '[:digit:]' || s === '0-9') return '0123456789';
        return s;
      }

      const fromChars = expandSet(set1);
      const toChars = expandSet(set2);
      const text = ctx.stdin || '';
      let out = '';

      for (let i = 0; i < text.length; i++) {
        const c = text[i];
        const idx = fromChars.indexOf(c);
        if (idx !== -1) {
          if (deleteMode) continue;
          out += toChars[idx] || toChars[toChars.length - 1] || c;
        } else {
          out += c;
        }
      }

      return { code: 0, stdout: out, stderr: '' };
    },

    async diff(args, ctx) {
      let unified = false;
      const files = [];

      for (const a of args) {
        if (a === '-u') unified = true;
        else files.push(a);
      }

      if (files.length < 2) {
        return { code: 2, stdout: '', stderr: 'diff: missing operand\n' };
      }

      const abs1 = ctx.resolvePath(files[0]);
      const abs2 = ctx.resolvePath(files[1]);

      if (!ctx.vfs.existsSync(abs1)) return { code: 2, stdout: '', stderr: `diff: ${files[0]}: No such file or directory\n` };
      if (!ctx.vfs.existsSync(abs2)) return { code: 2, stdout: '', stderr: `diff: ${files[1]}: No such file or directory\n` };

      const st1 = ctx.vfs.statSync(abs1);
      if (st1.isDirectory()) return { code: 2, stdout: '', stderr: `diff: ${files[0]}: Is a directory\n` };
      const st2 = ctx.vfs.statSync(abs2);
      if (st2.isDirectory()) return { code: 2, stdout: '', stderr: `diff: ${files[1]}: Is a directory\n` };

      const text1 = ctx.vfs.readFileSync(abs1, 'utf8');
      const text2 = ctx.vfs.readFileSync(abs2, 'utf8');

      if (text1 === text2) {
        return { code: 0, stdout: '', stderr: '' };
      }

      const diffResult = computeUnifiedDiff(files[0], files[1], text1, text2);
      return { code: 1, stdout: diffResult, stderr: '' };
    },

    // -----------------------------------------------------------------------
    // File & Directory Operations: cp, mv, rm, mkdir, touch, chmod, tree
    // -----------------------------------------------------------------------
    async mkdir(args, ctx) {
      let recursive = false;
      const dirs = [];

      for (const a of args) {
        if (a === '-p') recursive = true;
        else dirs.push(a);
      }

      if (dirs.length === 0) {
        return { code: 1, stdout: '', stderr: 'mkdir: missing operand\n' };
      }

      let code = 0;
      let stderr = '';

      for (const d of dirs) {
        const abs = ctx.resolvePath(d);
        try {
          if (recursive) {
            const parts = abs.split('/').filter(Boolean);
            let cur = '';
            for (const part of parts) {
              cur += '/' + part;
              if (!ctx.vfs.existsSync(cur)) {
                ctx.vfs.mkdirSync(cur, { recursive: true });
                ctx.emitMutation('create', cur);
              }
            }
          } else {
            ctx.vfs.mkdirSync(abs, { recursive });
            ctx.emitMutation('create', abs);
          }
        } catch (err) {
          stderr += `mkdir: cannot create directory '${d}': ${err.message}\n`;
          code = 1;
        }
      }

      return { code, stdout: '', stderr };
    },

    async touch(args, ctx) {
      if (args.length === 0) {
        return { code: 1, stdout: '', stderr: 'touch: missing file operand\n' };
      }

      let code = 0;
      let stderr = '';

      for (const f of args) {
        if (f.startsWith('-')) continue;
        const abs = ctx.resolvePath(f);
        try {
          if (!ctx.vfs.existsSync(abs)) {
            ctx.vfs.writeFileSync(abs, '');
            ctx.emitMutation('create', abs);
          } else {
            // update timestamp if exists
            const prev = ctx.vfs.readFileSync(abs, 'utf8');
            ctx.vfs.writeFileSync(abs, prev);
            ctx.emitMutation('change', abs);
          }
        } catch (err) {
          stderr += `touch: cannot touch '${f}': ${err.message}\n`;
          code = 1;
        }
      }

      return { code, stdout: '', stderr };
    },

    async rm(args, ctx) {
      let recursive = false;
      let force = false;
      const targets = [];

      for (const a of args) {
        if (a === '-r' || a === '-R' || a === '-rf' || a === '-fr') recursive = true;
        if (a === '-f' || a === '-rf' || a === '-fr') force = true;
        if (!a.startsWith('-')) targets.push(a);
      }

      if (targets.length === 0) {
        if (force) return { code: 0, stdout: '', stderr: '' };
        return { code: 1, stdout: '', stderr: 'rm: missing operand\n' };
      }

      let code = 0;
      let stderr = '';

      for (const t of targets) {
        const abs = ctx.resolvePath(t);
        if (!ctx.vfs.existsSync(abs)) {
          if (!force) {
            stderr += `rm: cannot remove '${t}': No such file or directory\n`;
            code = 1;
          }
          continue;
        }

        const st = ctx.vfs.statSync(abs);
        if (st.isDirectory() && !recursive) {
          stderr += `rm: cannot remove '${t}': Is a directory\n`;
          code = 1;
          continue;
        }

        try {
          if (typeof ctx.vfs.rmSync === 'function') {
            ctx.vfs.rmSync(abs, { recursive, force });
          } else {
            if (st.isDirectory()) ctx.vfs.rmdirSync(abs, { recursive });
            else ctx.vfs.unlinkSync(abs);
          }
          ctx.emitMutation('delete', abs);
        } catch (err) {
          if (!force) {
            stderr += `rm: cannot remove '${t}': ${err.message}\n`;
            code = 1;
          }
        }
      }

      return { code, stdout: '', stderr };
    },

    async cp(args, ctx) {
      let recursive = false;
      const paths = [];

      for (const a of args) {
        if (a === '-r' || a === '-R') recursive = true;
        else if (!a.startsWith('-')) paths.push(a);
      }

      if (paths.length < 2) {
        return { code: 1, stdout: '', stderr: 'cp: missing destination file operand\n' };
      }

      const dest = ctx.resolvePath(paths[paths.length - 1]);
      const sources = paths.slice(0, -1);

      function copyRecursive(srcAbs, destAbs) {
        const st = ctx.vfs.statSync(srcAbs);
        if (st.isDirectory()) {
          ctx.vfs.mkdirSync(destAbs, { recursive: true });
          const entries = ctx.vfs.readdirSync(srcAbs);
          for (const e of entries) {
            copyRecursive(srcAbs + '/' + e, destAbs + '/' + e);
          }
        } else {
          if (typeof ctx.vfs.copyFileSync === 'function') {
            ctx.vfs.copyFileSync(srcAbs, destAbs);
          } else {
            const data = ctx.vfs.readFileSync(srcAbs);
            ctx.vfs.writeFileSync(destAbs, data);
          }
          ctx.emitMutation('create', destAbs);
        }
      }

      for (const src of sources) {
        const srcAbs = ctx.resolvePath(src);
        if (!ctx.vfs.existsSync(srcAbs)) {
          return { code: 1, stdout: '', stderr: `cp: cannot stat '${src}': No such file or directory\n` };
        }
        const st = ctx.vfs.statSync(srcAbs);
        if (st.isDirectory() && !recursive) {
          return { code: 1, stdout: '', stderr: `cp: -r not specified; omitting directory '${src}'\n` };
        }
        try {
          let targetDest = dest;
          if (ctx.vfs.existsSync(dest) && ctx.vfs.statSync(dest).isDirectory()) {
            targetDest = dest === '/' ? '/' + PosixPath.basename(srcAbs) : dest + '/' + PosixPath.basename(srcAbs);
          }
          copyRecursive(srcAbs, targetDest);
        } catch (e) {
          return { code: 1, stdout: '', stderr: `cp: ${e.message}\n` };
        }
      }

      return { code: 0, stdout: '', stderr: '' };
    },

    async mv(args, ctx) {
      const paths = args.filter(a => !a.startsWith('-'));
      if (paths.length < 2) {
        return { code: 1, stdout: '', stderr: 'mv: missing destination file operand\n' };
      }

      const src = ctx.resolvePath(paths[0]);
      let dest = ctx.resolvePath(paths[1]);

      if (!ctx.vfs.existsSync(src)) {
        return { code: 1, stdout: '', stderr: `mv: cannot stat '${paths[0]}': No such file or directory\n` };
      }

      try {
        if (ctx.vfs.existsSync(dest) && ctx.vfs.statSync(dest).isDirectory()) {
          dest = dest === '/' ? '/' + PosixPath.basename(src) : dest + '/' + PosixPath.basename(src);
        }
        if (typeof ctx.vfs.renameSync === 'function') {
          ctx.vfs.renameSync(src, dest);
        } else {
          const data = ctx.vfs.readFileSync(src);
          ctx.vfs.writeFileSync(dest, data);
          ctx.vfs.unlinkSync(src);
        }
        ctx.emitMutation('rename', dest);
      } catch (err) {
        return { code: 1, stdout: '', stderr: `mv: ${err.message}\n` };
      }

      return { code: 0, stdout: '', stderr: '' };
    },

    async chmod(args, ctx) {
      if (args.length < 2) {
        return { code: 1, stdout: '', stderr: 'chmod: missing operand\n' };
      }
      const modeStr = args[0];
      for (let i = 1; i < args.length; i++) {
        const target = args[i];
        const abs = ctx.resolvePath(target);
        if (!ctx.vfs.existsSync(abs)) {
          return { code: 1, stdout: '', stderr: `chmod: cannot access '${target}': No such file or directory\n` };
        }
        if (typeof ctx.vfs.chmodSync === 'function') {
          try {
            ctx.vfs.chmodSync(abs, modeStr);
          } catch (err) {
            return { code: 1, stdout: '', stderr: `chmod: ${err.message}\n` };
          }
        }
      }
      return { code: 0, stdout: '', stderr: '' };
    },

    async tree(args, ctx) {
      let showAll = false;
      let maxLevel = Infinity;
      let root = '.';

      for (let i = 0; i < args.length; i++) {
        const a = args[i];
        if (a === '-a') showAll = true;
        else if (a === '-L' && i + 1 < args.length) maxLevel = parseInt(args[++i], 10) || Infinity;
        else if (!a.startsWith('-')) root = a;
      }

      const absRoot = ctx.resolvePath(root);
      if (!ctx.vfs.existsSync(absRoot)) {
        return { code: 1, stdout: '', stderr: `tree: '${root}': No such file or directory\n` };
      }

      let stdout = `${root}\n`;
      let dirCount = 0;
      let fileCount = 0;

      function renderTree(dirPath, prefix, level) {
        if (level > maxLevel) return;
        let entries = [];
        try { entries = ctx.vfs.readdirSync(dirPath); } catch (_) { return; }
        if (!showAll) entries = entries.filter(e => !e.startsWith('.'));
        entries.sort();

        for (let i = 0; i < entries.length; i++) {
          const entry = entries[i];
          const isLast = i === entries.length - 1;
          const full = dirPath === '/' ? '/' + entry : dirPath + '/' + entry;
          let isDir = false;
          try { isDir = ctx.vfs.statSync(full).isDirectory(); } catch (_) {}

          stdout += `${prefix}${isLast ? '└── ' : '├── '}${entry}\n`;

          if (isDir) {
            dirCount++;
            renderTree(full, prefix + (isLast ? '    ' : '│   '), level + 1);
          } else {
            fileCount++;
          }
        }
      }

      renderTree(absRoot, '', 1);
      stdout += `\n${dirCount} directories, ${fileCount} files\n`;
      return { code: 0, stdout, stderr: '' };
    },

    // -----------------------------------------------------------------------
    // System, Environment & Process Control: env, export, unset, which,
    // whoami, uname, date, sleep, true, false, clear, history, ps, jobs, kill
    // -----------------------------------------------------------------------
    async env(args, ctx) {
      const keys = Object.keys(ctx.env).sort();
      let stdout = '';
      for (const k of keys) {
        if (k !== '?' && !k.startsWith('__')) {
          stdout += `${k}=${ctx.env[k]}\n`;
        }
      }
      return { code: 0, stdout, stderr: '' };
    },

    async export(args, ctx) {
      const targetEnv = ctx.shell ? ctx.shell.env : ctx.env;
      if (args.length === 0) {
        const keys = Object.keys(targetEnv).sort();
        let stdout = '';
        for (const k of keys) {
          stdout += `declare -x ${k}="${targetEnv[k]}"\n`;
        }
        return { code: 0, stdout, stderr: '' };
      }

      for (const arg of args) {
        const eqIdx = arg.indexOf('=');
        if (eqIdx !== -1) {
          const key = arg.slice(0, eqIdx);
          const val = arg.slice(eqIdx + 1);
          ctx.env[key] = val;
          if (ctx.shell) ctx.shell.env[key] = val;
        } else {
          const existing = ctx.shell && ctx.shell.env[arg] !== undefined ? ctx.shell.env[arg] : (ctx.env[arg] || '');
          ctx.env[arg] = existing;
          if (ctx.shell) ctx.shell.env[arg] = existing;
        }
      }

      return { code: 0, stdout: '', stderr: '' };
    },

    async unset(args, ctx) {
      for (const arg of args) {
        delete ctx.env[arg];
        if (ctx.shell) delete ctx.shell.env[arg];
      }
      return { code: 0, stdout: '', stderr: '' };
    },

    async which(args, ctx) {
      if (args.length === 0) return { code: 1, stdout: '', stderr: '' };
      let stdout = '';
      let code = 0;

      for (const cmd of args) {
        if (COREUTILS[cmd]) {
          stdout += `/usr/bin/${cmd}\n`;
        } else {
          code = 1;
        }
      }

      return { code, stdout, stderr: '' };
    },

    async whoami(args, ctx) {
      return { code: 0, stdout: `${ctx.env.USER || 'codelab'}\n`, stderr: '' };
    },

    async uname(args, ctx) {
      const a = args.includes('-a');
      if (a) {
        return { code: 0, stdout: 'Linux code-lab 6.5.0-codelab #1 SMP PREEMPT x86_64 GNU/Linux\n', stderr: '' };
      }
      return { code: 0, stdout: 'Linux\n', stderr: '' };
    },

    async date(args, ctx) {
      const now = new Date();
      if (args.length > 0 && args[0].startsWith('+')) {
        const fmt = args[0].slice(1);
        const pad = (n) => String(n).padStart(2, '0');
        const formatted = fmt
          .replace(/%Y/g, now.getFullYear())
          .replace(/%m/g, pad(now.getMonth() + 1))
          .replace(/%d/g, pad(now.getDate()))
          .replace(/%H/g, pad(now.getHours()))
          .replace(/%M/g, pad(now.getMinutes()))
          .replace(/%S/g, pad(now.getSeconds()))
          .replace(/%s/g, Math.floor(now.getTime() / 1000));
        return { code: 0, stdout: formatted + '\n', stderr: '' };
      }
      return { code: 0, stdout: now.toUTCString() + '\n', stderr: '' };
    },

    async sleep(args, ctx) {
      const sec = parseFloat(args[0]) || 0;
      await new Promise(r => setTimeout(r, Math.max(0, sec * 1000)));
      return { code: 0, stdout: '', stderr: '' };
    },

    async true() {
      return { code: 0, stdout: '', stderr: '' };
    },

    async false() {
      return { code: 1, stdout: '', stderr: '' };
    },

    async clear() {
      return { code: 0, stdout: '\x1b[2J\x1b[H', stderr: '' };
    },

    async history(args, ctx) {
      if (args[0] === '-c') {
        ctx.shell.history.length = 0;
        return { code: 0, stdout: '', stderr: '' };
      }
      let stdout = '';
      for (let i = 0; i < ctx.shell.history.length; i++) {
        stdout += `${String(i + 1).padStart(5, ' ')}  ${ctx.shell.history[i]}\n`;
      }
      return { code: 0, stdout, stderr: '' };
    },

    async ps(args, ctx) {
      let stdout = '  PID TTY          TIME CMD\n';
      stdout += '    1 ?        00:00:00 sh\n';
      for (const [jobId, job] of ctx.shell.jobs.entries()) {
        if (job.status === 'Running') {
          stdout += `${String(job.pid).padStart(5, ' ')} ?        00:00:00 ${job.command}\n`;
        }
      }
      return { code: 0, stdout, stderr: '' };
    },

    async jobs(args, ctx) {
      let stdout = '';
      for (const [id, job] of ctx.shell.jobs.entries()) {
        stdout += `[${id}]+  ${job.status}                       ${job.command} &\n`;
      }
      return { code: 0, stdout, stderr: '' };
    },

    async kill(args, ctx) {
      if (args.length === 0) return { code: 1, stdout: '', stderr: 'kill: usage: kill [-s sigspec | -n signum | -sigspec] pid | jobspec ...\n' };
      const target = args[args.length - 1];
      const pid = parseInt(target.replace('%', ''), 10);
      if (isNaN(pid)) {
        return { code: 1, stdout: '', stderr: `kill: ${target}: arguments must be process or job IDs\n` };
      }

      let killedJob = false;
      for (const [id, job] of ctx.shell.jobs.entries()) {
        if (job.pid === pid || id === pid) {
          job.status = 'Terminated';
          if (typeof job.abort === 'function') job.abort();
          killedJob = true;
          break;
        }
      }

      let killedPort = false;
      if (ctx.shell.portTable) {
        if (typeof ctx.shell.portTable.killProcess === 'function') {
          killedPort = ctx.shell.portTable.killProcess(pid) || killedPort;
        }
        if (typeof ctx.shell.portTable.unregisterByPid === 'function') {
          killedPort = ctx.shell.portTable.unregisterByPid(pid) || killedPort;
        }
        if (typeof ctx.shell.portTable.listServers === 'function' && typeof ctx.shell.portTable.unregisterServer === 'function') {
          for (const s of ctx.shell.portTable.listServers()) {
            if (s.pid !== undefined && String(s.pid) === String(pid)) {
              if (s.server && typeof s.server.close === 'function') {
                try { s.server.close(); } catch (_) {}
              }
              if (typeof s.stop === 'function') {
                try { s.stop(); } catch (_) {}
              }
              ctx.shell.portTable.unregisterServer(s.port);
              killedPort = true;
            }
          }
        }
      }

      if (killedJob || killedPort) {
        return { code: 0, stdout: '', stderr: '' };
      }

      return { code: 1, stdout: '', stderr: `kill: (${target}) - No such process\n` };
    },

    // -----------------------------------------------------------------------
    // Additional Utilities: dirname, basename, seq, tee
    // -----------------------------------------------------------------------
    async dirname(args) {
      const p = args[0] || '.';
      return { code: 0, stdout: PosixPath.dirname(p) + '\n', stderr: '' };
    },

    async basename(args) {
      const p = args[0] || '';
      const ext = args[1] || '';
      return { code: 0, stdout: PosixPath.basename(p, ext) + '\n', stderr: '' };
    },

    async seq(args) {
      let first = 1;
      let step = 1;
      let last = 1;

      if (args.length === 1) {
        last = parseFloat(args[0]) || 1;
      } else if (args.length === 2) {
        first = parseFloat(args[0]) || 1;
        last = parseFloat(args[1]) || 1;
      } else if (args.length >= 3) {
        first = parseFloat(args[0]) || 1;
        step = parseFloat(args[1]) || 1;
        last = parseFloat(args[2]) || 1;
      }

      let stdout = '';
      for (let cur = first; step > 0 ? cur <= last : cur >= last; cur += step) {
        stdout += `${cur}\n`;
      }
      return { code: 0, stdout, stderr: '' };
    },

    async tee(args, ctx) {
      let append = false;
      const files = [];

      for (const a of args) {
        if (a === '-a') append = true;
        else if (!a.startsWith('-')) files.push(a);
      }

      const input = ctx.stdin || '';
      for (const f of files) {
        const abs = ctx.resolvePath(f);
        if (ctx.vfs.existsSync(abs)) {
          const st = ctx.vfs.statSync(abs);
          if (st.isDirectory()) {
            return { code: 1, stdout: '', stderr: `tee: ${f}: Is a directory\n` };
          }
        }
        if (append) {
          ctx.vfs.appendFileSync(abs, input);
          ctx.emitMutation('change', abs);
        } else {
          ctx.vfs.writeFileSync(abs, input);
          ctx.emitMutation('create', abs);
        }
      }

      return { code: 0, stdout: input, stderr: '' };
    },

    // -----------------------------------------------------------------------
    // Mock VCS Engine: git
    // -----------------------------------------------------------------------
    async git(args, ctx) {
      const subcmd = args[0] || 'status';
      const gitState = ctx.shell.gitState;

      if (subcmd === 'status') {
        let stdout = `On branch ${gitState.branch}\n`;
        if (gitState.staged.size === 0) {
          stdout += 'nothing to commit, working tree clean\n';
        } else {
          stdout += 'Changes to be committed:\n';
          for (const s of gitState.staged) {
            stdout += `\tmodified:   ${s}\n`;
          }
        }
        return { code: 0, stdout, stderr: '' };
      }

      if (subcmd === 'branch') {
        let stdout = '';
        for (const b of gitState.branches) {
          stdout += (b === gitState.branch ? `* ${b}\n` : `  ${b}\n`);
        }
        return { code: 0, stdout, stderr: '' };
      }

      if (subcmd === 'log') {
        let stdout = '';
        for (const c of gitState.commits) {
          stdout += `commit ${c.hash}\n`;
          stdout += `Author: ${c.author}\n`;
          stdout += `Date:   ${c.date}\n\n`;
          stdout += `    ${c.message}\n\n`;
        }
        return { code: 0, stdout, stderr: '' };
      }

      if (subcmd === 'add') {
        const files = args.slice(1);
        for (const f of files) gitState.staged.add(f);
        return { code: 0, stdout: '', stderr: '' };
      }

      if (subcmd === 'commit') {
        let msg = 'Commit changes';
        const mIdx = args.indexOf('-m');
        if (mIdx !== -1 && mIdx + 1 < args.length) msg = args[mIdx + 1];
        const hash = Math.random().toString(16).slice(2, 9);
        gitState.commits.unshift({
          hash,
          author: `${ctx.env.USER || 'codelab'} <dev@codelab.internal>`,
          date: new Date().toUTCString(),
          message: msg
        });
        const count = gitState.staged.size || 1;
        gitState.staged.clear();
        return { code: 0, stdout: `[${gitState.branch} ${hash}] ${msg}\n ${count} file changed\n`, stderr: '' };
      }

      if (subcmd === 'diff') {
        return { code: 0, stdout: '', stderr: '' };
      }

      return { code: 0, stdout: `git: '${subcmd}' executed\n`, stderr: '' };
    },

    // -----------------------------------------------------------------------
    // Interactive Help: help
    // -----------------------------------------------------------------------
    async help(args, ctx) {
      let stdout = 'CodeLab POSIX Shell & UNIX Coreutils (Pure-JS Engine)\n\n';
      stdout += 'Filesystem:\n';
      stdout += '  ls [-l -a -la -lh]     List directory contents\n';
      stdout += '  cd [dir]               Change current directory\n';
      stdout += '  pwd                    Print working directory\n';
      stdout += '  mkdir [-p] [dir...]    Create directories\n';
      stdout += '  touch [file...]        Update timestamp or create empty file\n';
      stdout += '  rm [-r -f] [path...]   Remove files or directories\n';
      stdout += '  cp [-r] [src] [dst]    Copy files or directories\n';
      stdout += '  mv [src] [dst]         Move / rename files\n';
      stdout += '  stat [file...]         Display file status\n';
      stdout += '  tree [-a -L n] [dir]   Visual directory hierarchy\n\n';
      stdout += 'Text & Search:\n';
      stdout += '  cat [-n] [file...]     Concatenate and print files\n';
      stdout += '  head [-n n] [file...]  Output first lines\n';
      stdout += '  tail [-n n] [file...]  Output last lines\n';
      stdout += '  grep [-n -i -r -v -E]  Search lines matching regex\n';
      stdout += '  find [path] [-name pat] Search files in directory tree\n';
      stdout += '  wc [-l -w -c]          Count lines, words, bytes\n';
      stdout += '  sort [-r -n -u]        Sort lines\n';
      stdout += '  uniq [-c -d -u]        Filter repeated lines\n';
      stdout += '  sed [-i] s/pat/rep/g   Stream editor\n';
      stdout += '  awk [-F sep] "{print}" Pattern scanning language\n';
      stdout += '  cut [-d sep -f list]   Cut out selected fields\n';
      stdout += '  tr [-d] set1 set2      Translate or delete characters\n';
      stdout += '  diff [-u] f1 f2        Compare files line by line\n\n';
      stdout += 'System & Shell:\n';
      stdout += '  echo [-n -e] [args...] Print arguments\n';
      stdout += '  printf format [args..] Formatted output\n';
      stdout += '  env, export, unset     Environment variable manipulation\n';
      stdout += '  which, whoami, uname   System identification\n';
      stdout += '  date, sleep, clear     Date, delay, terminal screen control\n';
      stdout += '  history, ps, jobs, kill Process and job management\n';
      stdout += '  git [status diff log]  Built-in version control\n';
      stdout += '  node, bun, npm, npx, bunx CLI runtime and package shims\n';
      stdout += '  ports, curl            Port table inspection & HTTP requests\n';
      return { code: 0, stdout, stderr: '' };
    },

    // -----------------------------------------------------------------------
    // Language Runtimes & Package Managers: node, bun, npm, npx, bunx
    // -----------------------------------------------------------------------
    async node(args, ctx) {
      if (!executeInVirtualRuntime) {
        return { code: 1, stdout: '', stderr: 'node: Virtual runtime engine is not available\n' };
      }
      if (args.length === 0) {
        return { code: 0, stdout: 'Welcome to Node.js v20.10.0.\nType ".help" for more information.\n', stderr: '' };
      }

      if (args[0] === '-e' || args[0] === '--eval') {
        const code = args[1] || '';
        const res = await executeInVirtualRuntime({
          mode: 'repl',
          replCode: code,
          printReplResult: false,
          vfs: ctx.vfs,
          activePortTable: ctx.shell.portTable,
          pid: ctx.pid,
          isBackground: ctx.isBackground
        });
        return { code: res.ok ? 0 : (res.exitCode || 1), stdout: res.stdout, stderr: res.stderr };
      }

      if (args[0] === '-p' || args[0] === '--print') {
        const code = args[1] || '';
        const res = await executeInVirtualRuntime({
          mode: 'repl',
          replCode: code,
          printReplResult: true,
          vfs: ctx.vfs,
          activePortTable: ctx.shell.portTable,
          pid: ctx.pid,
          isBackground: ctx.isBackground
        });
        return { code: res.ok ? 0 : (res.exitCode || 1), stdout: res.stdout, stderr: res.stderr };
      }

      if (args[0] === '--test') {
        const testFile = args[1] ? ctx.resolvePath(args[1]) : null;
        let filesToRun = [];
        if (testFile) {
          filesToRun.push(testFile);
        } else {
          const findTests = (dir) => {
            if (!ctx.vfs.existsSync(dir)) return;
            for (const item of ctx.vfs.readdirSync(dir)) {
              const full = PosixPath.join(dir, item);
              const st = ctx.vfs.statSync(full);
              if (st.isDirectory() && item !== 'node_modules') {
                findTests(full);
              } else if (item.endsWith('.test.js') || item.endsWith('.test.ts') || item === 'test.js') {
                filesToRun.push(full);
              }
            }
          };
          findTests(ctx.cwd);
        }

        let combinedOut = '';
        let combinedErr = '';
        let allOk = true;
        for (const f of filesToRun) {
          const res = await executeInVirtualRuntime({
            mode: 'test',
            entry: f,
            vfs: ctx.vfs,
            activePortTable: ctx.shell.portTable,
            pid: ctx.pid,
            isBackground: ctx.isBackground
          });
          combinedOut += res.stdout;
          combinedErr += res.stderr;
          if (!res.ok) allOk = false;
        }
        return { code: allOk ? 0 : 1, stdout: combinedOut, stderr: combinedErr };
      }

      const scriptFile = ctx.resolvePath(args[0]);
      if (!ctx.vfs.existsSync(scriptFile)) {
        return { code: 1, stdout: '', stderr: `node: cannot find module '${args[0]}'\n` };
      }

      const scriptArgs = args.slice(1);
      const res = await executeInVirtualRuntime({
        mode: 'run',
        entry: scriptFile,
        argv: ['node', scriptFile, ...scriptArgs],
        vfs: ctx.vfs,
        activePortTable: ctx.shell.portTable,
        pid: ctx.pid,
        isBackground: ctx.isBackground
      });
      return { code: res.ok ? 0 : (res.exitCode || 1), stdout: res.stdout, stderr: res.stderr };
    },

    async bun(args, ctx) {
      if (args.length === 0) {
        return { code: 0, stdout: 'Bun v1.1.0\n', stderr: '' };
      }

      const sub = args[0];

      if (sub === 'init') {
        const pkgPath = PosixPath.join(ctx.cwd, 'package.json');
        const dirName = PosixPath.basename(ctx.cwd) || 'app';
        if (!ctx.vfs.existsSync(pkgPath)) {
          ctx.vfs.writeFileSync(pkgPath, JSON.stringify({
            name: dirName,
            module: 'index.ts',
            type: 'module',
            devDependencies: {
              '@types/bun': 'latest'
            },
            peerDependencies: {
              typescript: '^5.0.0'
            }
          }, null, 2) + '\n');
          if (typeof ctx.emitMutation === 'function') ctx.emitMutation('create', pkgPath);
        }
        const indexTsPath = PosixPath.join(ctx.cwd, 'index.ts');
        if (!ctx.vfs.existsSync(indexTsPath)) {
          ctx.vfs.writeFileSync(indexTsPath, 'console.log("Hello via Bun!");\n');
          if (typeof ctx.emitMutation === 'function') ctx.emitMutation('create', indexTsPath);
        }
        const tsconfigPath = PosixPath.join(ctx.cwd, 'tsconfig.json');
        if (!ctx.vfs.existsSync(tsconfigPath)) {
          ctx.vfs.writeFileSync(tsconfigPath, JSON.stringify({
            compilerOptions: {
              lib: ['ESNext'],
              module: 'esnext',
              target: 'esnext',
              moduleResolution: 'bundler',
              moduleDetection: 'force',
              allowImportingTsExtensions: true,
              noEmit: true,
              composite: true,
              strict: true,
              downlevelIteration: true,
              skipLibCheck: true,
              jsx: 'react-jsx',
              allowSyntheticDefaultImports: true,
              forceConsistentCasingInFileNames: true,
              allowJs: true,
              types: ['bun-types']
            }
          }, null, 2) + '\n');
          if (typeof ctx.emitMutation === 'function') ctx.emitMutation('create', tsconfigPath);
        }
        return { code: 0, stdout: 'Done! A package.json file was created in ' + ctx.cwd + '\n', stderr: '' };
      }

      if (sub === 'add') {
        const pkgs = args.slice(1).filter(a => !a.startsWith('-'));
        for (const p of pkgs) {
          installPackage(p, ctx);
        }
        return { code: 0, stdout: `saved ${pkgs.length} package(s)\n`, stderr: '' };
      }

      if (sub === 'remove' || sub === 'rm') {
        const pkgs = args.slice(1).filter(a => !a.startsWith('-'));
        for (const p of pkgs) {
          uninstallPackage(p, ctx);
        }
        return { code: 0, stdout: `removed ${pkgs.length} package(s)\n`, stderr: '' };
      }

      if (sub === 'pm') {
        if (args[1] === 'ls') {
          return { code: 0, stdout: listDependencies(ctx), stderr: '' };
        }
        return { code: 0, stdout: '', stderr: '' };
      }

      if (sub === '-e') {
        const code = args[1] || '';
        const res = await executeInVirtualRuntime({
          mode: 'repl',
          replCode: code,
          printReplResult: false,
          vfs: ctx.vfs,
          activePortTable: ctx.shell.portTable,
          pid: ctx.pid,
          isBackground: ctx.isBackground
        });
        return { code: res.ok ? 0 : (res.exitCode || 1), stdout: res.stdout, stderr: res.stderr };
      }

      if (sub === 'test') {
        const testTarget = args[1] ? ctx.resolvePath(args[1]) : null;
        let filesToRun = [];
        if (testTarget) {
          filesToRun.push(testTarget);
        } else {
          const findTests = (dir) => {
            if (!ctx.vfs.existsSync(dir)) return;
            for (const item of ctx.vfs.readdirSync(dir)) {
              const full = PosixPath.join(dir, item);
              const st = ctx.vfs.statSync(full);
              if (st.isDirectory() && item !== 'node_modules') {
                findTests(full);
              } else if (item.endsWith('.test.js') || item.endsWith('.test.ts')) {
                filesToRun.push(full);
              }
            }
          };
          findTests(ctx.cwd);
        }

        let combinedOut = '';
        let combinedErr = '';
        let allOk = true;
        for (const f of filesToRun) {
          const res = await executeInVirtualRuntime({
            mode: 'test',
            entry: f,
            vfs: ctx.vfs,
            activePortTable: ctx.shell.portTable,
            pid: ctx.pid,
            isBackground: ctx.isBackground
          });
          combinedOut += res.stdout;
          combinedErr += res.stderr;
          if (!res.ok) allOk = false;
        }
        return { code: allOk ? 0 : 1, stdout: combinedOut, stderr: combinedErr };
      }

      if (sub === 'run') {
        const target = args[1];
        if (!target) {
          return { code: 0, stdout: listDependencies(ctx), stderr: '' };
        }
        const resolved = ctx.resolvePath(target);
        if (ctx.vfs.existsSync(resolved)) {
          const scriptArgs = args.slice(2);
          const res = await executeInVirtualRuntime({
            mode: 'run',
            entry: resolved,
            argv: ['bun', resolved, ...scriptArgs],
            vfs: ctx.vfs,
            activePortTable: ctx.shell.portTable,
            pid: ctx.pid,
            isBackground: ctx.isBackground
          });
          return { code: res.ok ? 0 : (res.exitCode || 1), stdout: res.stdout, stderr: res.stderr };
        }
        const { data: pkgData } = readPackageJson(ctx.vfs, ctx.cwd);
        if (pkgData.scripts && pkgData.scripts[target]) {
          return await runPackageScript(target, args.slice(2), ctx);
        }
        return { code: 1, stdout: '', stderr: `error: Script or file not found "${target}"\n` };
      }

      const resolved = ctx.resolvePath(sub);
      if (ctx.vfs.existsSync(resolved)) {
        const scriptArgs = args.slice(1);
        const res = await executeInVirtualRuntime({
          mode: 'run',
          entry: resolved,
          argv: ['bun', resolved, ...scriptArgs],
          vfs: ctx.vfs,
          activePortTable: ctx.shell.portTable,
          pid: ctx.pid,
          isBackground: ctx.isBackground
        });
        return { code: res.ok ? 0 : (res.exitCode || 1), stdout: res.stdout, stderr: res.stderr };
      }

      const { data: pkgData } = readPackageJson(ctx.vfs, ctx.cwd);
      if (pkgData.scripts && pkgData.scripts[sub]) {
        return await runPackageScript(sub, args.slice(1), ctx);
      }

      return { code: 1, stdout: '', stderr: `bun: file or command not found: ${sub}\n` };
    },

    async npm(args, ctx) {
      if (args.length === 0) {
        return { code: 0, stdout: 'npm v10.2.0\n', stderr: '' };
      }
      const sub = args[0];

      if (sub === 'init') {
        const pkgPath = PosixPath.join(ctx.cwd, 'package.json');
        if (!ctx.vfs.existsSync(pkgPath)) {
          ctx.vfs.writeFileSync(pkgPath, JSON.stringify({
            name: PosixPath.basename(ctx.cwd) || 'app',
            version: '1.0.0',
            description: '',
            main: 'index.js',
            scripts: {
              test: 'echo "Error: no test specified" && exit 1'
            },
            keywords: [],
            author: '',
            license: 'ISC'
          }, null, 2) + '\n');
          if (typeof ctx.emitMutation === 'function') ctx.emitMutation('create', pkgPath);
        }
        return { code: 0, stdout: 'Wrote to ' + pkgPath + '\n', stderr: '' };
      }

      if (sub === 'i' || sub === 'install' || sub === 'add') {
        const pkgs = args.slice(1).filter(a => !a.startsWith('-'));
        if (pkgs.length === 0) {
          const { data: pkgData } = readPackageJson(ctx.vfs, ctx.cwd);
          for (const p of Object.keys(pkgData.dependencies || {})) {
            installPackage(p, ctx);
          }
          return { code: 0, stdout: 'up to date\n', stderr: '' };
        }
        for (const p of pkgs) {
          installPackage(p, ctx);
        }
        return { code: 0, stdout: `added ${pkgs.length} package(s) in 0.1s\n`, stderr: '' };
      }

      if (sub === 'uninstall' || sub === 'remove' || sub === 'rm') {
        const pkgs = args.slice(1).filter(a => !a.startsWith('-'));
        for (const p of pkgs) {
          uninstallPackage(p, ctx);
        }
        return { code: 0, stdout: `removed ${pkgs.length} package(s) in 0.1s\n`, stderr: '' };
      }

      if (sub === 'list' || sub === 'ls') {
        return { code: 0, stdout: listDependencies(ctx), stderr: '' };
      }

      if (sub === 'run' || sub === 'run-script') {
        const scriptName = args[1];
        if (!scriptName) {
          return { code: 1, stdout: '', stderr: 'npm ERR! missing script name\n' };
        }
        return await runPackageScript(scriptName, args.slice(2), ctx);
      }

      if (sub === 'test') {
        return await runPackageScript('test', args.slice(1), ctx);
      }

      const { data: pkgData } = readPackageJson(ctx.vfs, ctx.cwd);
      if (pkgData.scripts && pkgData.scripts[sub]) {
        return await runPackageScript(sub, args.slice(1), ctx);
      }

      return { code: 1, stdout: '', stderr: `npm ERR! Unknown command: "${sub}"\n` };
    },

    async npx(args, ctx) {
      if (args.length === 0) {
        return { code: 1, stdout: '', stderr: 'npx: missing command\n' };
      }
      const cmd = args[0];
      const cmdArgs = args.slice(1);
      const binPath = PosixPath.join('/workspace/node_modules/.bin', cmd);
      if (ctx.vfs.existsSync(binPath)) {
        return await ctx.commands.node([binPath, ...cmdArgs], ctx);
      }
      return await ctx.shell.execute(cmd + (cmdArgs.length ? ' ' + cmdArgs.join(' ') : ''));
    },

    async bunx(args, ctx) {
      return await this.npx(args, ctx);
    },

    // -----------------------------------------------------------------------
    // Port Table & HTTP Inspection: ports, curl
    // -----------------------------------------------------------------------
    async ports(args, ctx) {
      const portTable = ctx.shell && ctx.shell.portTable;
      if (!portTable || typeof portTable.listServers !== 'function') {
        return { code: 0, stdout: 'PORT     PID     NAME\n', stderr: '' };
      }
      const servers = portTable.listServers();
      let out = 'PORT     PID     NAME\n';
      for (const s of servers) {
        const portStr = String(s.port || '').padEnd(8, ' ');
        const pidStr = String(s.pid !== undefined ? s.pid : '-').padEnd(8, ' ');
        const nameStr = s.name || s.type || 'server';
        out += `${portStr} ${pidStr} ${nameStr}\n`;
      }
      return { code: 0, stdout: out, stderr: '' };
    },

    async curl(args, ctx) {
      let method = null;
      const headers = {};
      let data = null;
      let includeHeaders = false;
      let url = null;

      for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        if (arg === '-X' || arg === '--request') {
          method = args[++i];
        } else if (arg === '-H' || arg === '--header') {
          const h = args[++i] || '';
          const colon = h.indexOf(':');
          if (colon !== -1) {
            headers[h.slice(0, colon).trim().toLowerCase()] = h.slice(colon + 1).trim();
          }
        } else if (arg === '-d' || arg === '--data' || arg === '--data-raw') {
          data = args[++i];
          if (!method) method = 'POST';
        } else if (arg === '-i' || arg === '--include' || arg === '-v' || arg === '--verbose') {
          includeHeaders = true;
        } else if (arg === '-s' || arg === '--silent') {
          // silent
        } else if (!arg.startsWith('-')) {
          url = arg;
        }
      }

      if (!url) {
        return { code: 1, stdout: '', stderr: 'curl: no URL specified!\n' };
      }
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'http://' + url;
      }
      if (!method) method = 'GET';

      const portTable = (ctx.shell && ctx.shell.portTable) || null;
      let resp = null;
      let lastErr = null;

      for (let attempt = 0; attempt < 25; attempt++) {
        try {
          if (portTable) {
            resp = await portTable.dispatchRequest(url, {
              method,
              headers,
              body: data
            });
            lastErr = null;
            break;
          } else {
            resp = await fetch(url, {
              method,
              headers,
              body: data
            });
            lastErr = null;
            break;
          }
        } catch (err) {
          lastErr = err;
          await new Promise(r => setTimeout(r, 15));
        }
      }

      if (!resp) {
        return { code: 7, stdout: '', stderr: `curl: (7) Failed to connect to host: ${lastErr ? lastErr.message : 'Connection refused'}\n` };
      }

      const bodyText = typeof resp.text === 'function' ? await resp.text() : String(resp.body || '');
      let output = '';

      if (includeHeaders) {
        output += `HTTP/1.1 ${resp.status || 200} ${resp.statusText || 'OK'}\r\n`;
        if (resp.headers) {
          if (typeof resp.headers.forEach === 'function') {
            resp.headers.forEach((val, key) => {
              output += `${key}: ${val}\r\n`;
            });
          } else if (typeof resp.headers.entries === 'function') {
            for (const [k, v] of resp.headers.entries()) {
              output += `${k}: ${v}\r\n`;
            }
          } else {
            for (const [k, v] of Object.entries(resp.headers)) {
              output += `${k}: ${v}\r\n`;
            }
          }
        }
        output += '\r\n';
      }

      output += bodyText;
      return { code: 0, stdout: output, stderr: '' };
    }
  };

  // =========================================================================
  // 8. POSIX SHELL EXECUTION ENGINE
  // =========================================================================
  class PosixShell {
    constructor(options = {}) {
      this.options = options;
      this.portTable = options.portTable || (typeof createVirtualPortTable === 'function' ? createVirtualPortTable() : null);
      this.vfs = options.vfs || createFallbackVfs();
      this.env = Object.assign({
        PATH: '/usr/local/bin:/usr/bin:/bin',
        PWD: '/workspace',
        HOME: '/home/user',
        USER: 'codelab',
        SHELL: '/bin/sh',
        TERM: 'xterm-256color',
        '?': '0'
      }, options.env || {});
      this.cwd = this.env.PWD || '/workspace';
      this.history = [];
      this.jobs = new Map();
      this.nextJobId = 1;
      this.nextPid = 100;
      this.commands = Object.assign({}, COREUTILS, options.commands || {});

      this.gitState = {
        branch: 'main',
        branches: ['main'],
        staged: new Set(),
        commits: [
          {
            hash: 'a1b2c3d',
            author: 'CodeLab Developer <dev@codelab.internal>',
            date: new Date().toUTCString(),
            message: 'Initial project commit'
          }
        ]
      };
    }

    resolvePath(p) {
      if (!p) return this.cwd;
      return PosixPath.resolve(this.cwd, p);
    }

    _emitVfsMutation(type, absPath) {
      if (!this.vfs) return;
      const evt = { type, path: absPath, timestamp: Date.now() };
      if (typeof this.vfs.emit === 'function') {
        this.vfs.emit('mutation', evt);
        this.vfs.emit('change', evt);
      } else if (typeof this.vfs._emit === 'function') {
        this.vfs._emit('mutation', evt);
        this.vfs._emit('change', evt);
      }
      if (typeof this.options.onFsChange === 'function') {
        this.options.onFsChange(evt);
      }
    }

    // Evaluate Word token to string (with variable expansion & command substitution)
    async evaluateWord(wordToken, env) {
      if (!wordToken) return '';
      if (typeof wordToken === 'string') return wordToken;

      let result = '';
      for (const seg of wordToken.segments) {
        if (seg.type === 'literal' || seg.type === 'single_quoted') {
          result += seg.value;
        } else if (seg.type === 'variable') {
          result += this._expandVariable(seg.name, env);
        } else if (seg.type === 'subshell') {
          result += await this._executeSubshell(seg.command, env);
        } else if (seg.type === 'double_quoted') {
          for (const part of seg.parts) {
            if (part.type === 'literal') result += part.value;
            else if (part.type === 'variable') result += this._expandVariable(part.name, env);
            else if (part.type === 'subshell') result += await this._executeSubshell(part.command, env);
          }
        }
      }
      return result;
    }

    // Evaluate Word token to argument list (includes glob expansion against VFS)
    async evaluateWordToArgs(wordToken, env) {
      const raw = await this.evaluateWord(wordToken, env);
      if (wordToken.hasWildcard) {
        return expandGlob(raw, this.cwd, this.vfs);
      }
      return [raw];
    }

    _expandVariable(name, env) {
      if (name === '?') return env['?'] !== undefined ? String(env['?']) : '0';
      if (name === '$') return '1';
      if (name === 'PWD') return this.cwd;
      if (name === 'OLDPWD') return env.OLDPWD || this.cwd;

      // Handle parameter expansion defaults: ${VAR:-default} or ${VAR:=default}
      if (name.includes(':-')) {
        const [k, def] = name.split(':-');
        return env[k] || def || '';
      }
      if (name.includes('=')) {
        const [k, def] = name.split('=');
        if (!env[k]) env[k] = def;
        return env[k];
      }

      return env[name] !== undefined ? String(env[name]) : '';
    }

    async _executeSubshell(commandStr, env) {
      const subShell = new PosixShell({
        ...this.options,
        vfs: this.vfs,
        portTable: this.portTable,
        env: { ...env, PWD: this.cwd }
      });
      subShell.cwd = this.cwd;
      const res = await subShell.execute(commandStr);
      // POSIX removes trailing newlines from command substitution
      return res.stdout.replace(/\r?\n+$/, '');
    }

    // Main execute entrypoint
    async execute(commandLine, execOptions = {}) {
      const trimmed = (commandLine || '').trim();
      if (!trimmed || trimmed.startsWith('#')) {
        return { code: 0, stdout: '', stderr: '' };
      }

      this.history.push(trimmed);

      const cwd = execOptions.cwd ? this.resolvePath(execOptions.cwd) : this.cwd;
      this.cwd = cwd;
      this.env.PWD = cwd;

      let currentEnv = Object.assign({}, this.env, execOptions.env || {});
      const ast = parseShellCommand(trimmed);
      let combinedStdout = '';
      let combinedStderr = '';
      let lastCode = 0;

      for (const item of ast.items) {
        if (item.background) {
          const pid = this.nextPid++;
          const jobId = this.nextJobId++;
          const job = {
            id: jobId,
            pid,
            command: trimmed,
            status: 'Running',
            startTime: Date.now()
          };
          this.jobs.set(jobId, job);
          if (typeof this.options.onJobStart === 'function') this.options.onJobStart(job);

          // Run in background promise
          this._executeAstNode(item.node, { ...execOptions, env: Object.assign({}, this.env, currentEnv), cwd: this.cwd, pid, isBackground: true })
            .then(res => {
              if (job.status !== 'Terminated') {
                job.status = 'Done';
                job.exitCode = res.code;
                if (typeof this.options.onJobEnd === 'function') this.options.onJobEnd(job);
              }
            })
            .catch(err => {
              if (job.status !== 'Terminated') {
                job.status = 'Failed';
                job.error = err;
                if (typeof this.options.onJobEnd === 'function') this.options.onJobEnd(job);
              }
            });

          const bgMsg = `[${jobId}] ${pid}\n`;
          combinedStdout += bgMsg;
          lastCode = 0;
          if (execOptions.onStdout) execOptions.onStdout(bgMsg);
        } else {
          const runContext = { ...execOptions, env: Object.assign({}, this.env, currentEnv), cwd: this.cwd };
          const res = await this._executeAstNode(item.node, runContext);
          combinedStdout += res.stdout || '';
          combinedStderr += res.stderr || '';
          lastCode = res.code !== undefined ? res.code : 0;
          this.env['?'] = String(lastCode);
          Object.assign(currentEnv, this.env);
        }
      }

      return { code: lastCode, stdout: combinedStdout, stderr: combinedStderr };
    }

    async _executeAstNode(node, context) {
      if (!node) return { code: 0, stdout: '', stderr: '' };

      if (node.type === 'Logical') {
        const leftRes = await this._executeAstNode(node.left, context);
        if (node.op === '&&') {
          if (leftRes.code === 0) {
            const nextContext = {
              ...context,
              cwd: this.cwd,
              env: Object.assign({}, this.env)
            };
            const rightRes = await this._executeAstNode(node.right, nextContext);
            return {
              code: rightRes.code,
              stdout: leftRes.stdout + rightRes.stdout,
              stderr: leftRes.stderr + rightRes.stderr
            };
          }
          return leftRes;
        } else if (node.op === '||') {
          if (leftRes.code !== 0) {
            const nextContext = {
              ...context,
              cwd: this.cwd,
              env: Object.assign({}, this.env)
            };
            const rightRes = await this._executeAstNode(node.right, nextContext);
            return {
              code: rightRes.code,
              stdout: leftRes.stdout + rightRes.stdout,
              stderr: leftRes.stderr + rightRes.stderr
            };
          }
          return leftRes;
        }
      }

      if (node.type === 'Pipeline') {
        return this._executePipeline(node, context);
      }

      if (node.type === 'Command') {
        return this._executeSimpleCommand(node, context);
      }

      return { code: 0, stdout: '', stderr: '' };
    }

    async _executePipeline(pipelineNode, context) {
      const commands = pipelineNode.commands;
      let currentStdin = context.stdin || '';
      let combinedStderr = '';
      let lastResult = { code: 0, stdout: '', stderr: '' };

      for (let i = 0; i < commands.length; i++) {
        const cmd = commands[i];
        const isLast = (i === commands.length - 1);

        const cmdContext = {
          ...context,
          stdin: currentStdin,
          // Only forward to external onStdout if it's the last command and not redirected
          onStdout: isLast ? context.onStdout : null,
          onStderr: context.onStderr
        };

        const res = await this._executeSimpleCommand(cmd, cmdContext);
        currentStdin = res.stdout;
        combinedStderr += res.stderr;
        lastResult = res;
      }

      return {
        code: lastResult.code,
        stdout: lastResult.stdout,
        stderr: combinedStderr
      };
    }

    async _executeSimpleCommand(cmdNode, context) {
      // 1. Process local environment assignments
      const cmdEnv = Object.assign({}, this.env, context.env);
      for (const envAssign of cmdNode.envVars) {
        const val = await this.evaluateWord(envAssign.token, cmdEnv);
        const eqIdx = val.indexOf('=');
        if (eqIdx !== -1) {
          const k = val.slice(0, eqIdx);
          const v = val.slice(eqIdx + 1);
          cmdEnv[k] = v;
          if (!cmdNode.name) {
            this.env[k] = v; // persistent if assignment-only
            context.env[k] = v;
          }
        }
      }

      if (!cmdNode.name) {
        Object.assign(context.env, this.env);
        return { code: 0, stdout: '', stderr: '' };
      }

      // 2. Evaluate command name and arguments
      const cmdName = await this.evaluateWord(cmdNode.name, cmdEnv);
      const args = [];
      for (const argToken of cmdNode.args) {
        const expanded = await this.evaluateWordToArgs(argToken, cmdEnv);
        args.push(...expanded);
      }

      // 3. Process input redirection (<, 0<)
      let effectiveStdin = context.stdin || '';
      for (const red of cmdNode.redirects) {
        if (red.type === '<') {
          const target = await this.evaluateWord(red.target, cmdEnv);
          const absTarget = this.resolvePath(target);
          if (!this.vfs.existsSync(absTarget)) {
            return { code: 1, stdout: '', stderr: `shell: ${target}: No such file or directory\n` };
          }
          try {
            effectiveStdin = this.vfs.readFileSync(absTarget, 'utf8');
          } catch (err) {
            return { code: 1, stdout: '', stderr: `shell: ${target}: ${err.message}\n` };
          }
        }
      }

      // 4. Validate output redirections and setup file descriptors
      let fd1 = { type: 'stdout' };
      let fd2 = { type: 'stderr' };

      for (const red of cmdNode.redirects) {
        if (red.type === '<') continue;
        if (red.type === '>' || red.type === '>>' || red.type === '&>') {
          const target = await this.evaluateWord(red.target, cmdEnv);
          const abs = this.resolvePath(target);
          const parentDir = PosixPath.dirname(abs);
          if (!this.vfs.existsSync(parentDir)) {
            return { code: 1, stdout: '', stderr: `shell: ${target}: No such file or directory\n` };
          }
          const parentSt = this.vfs.statSync(parentDir);
          if (!parentSt.isDirectory()) {
            return { code: 1, stdout: '', stderr: `shell: ${target}: Not a directory\n` };
          }
          if (this.vfs.existsSync(abs) && this.vfs.statSync(abs).isDirectory()) {
            return { code: 1, stdout: '', stderr: `shell: ${target}: Is a directory\n` };
          }

          if (red.type === '>') {
            this.vfs.writeFileSync(abs, '');
            this._emitVfsMutation('create', abs);
            const dest = { type: 'file', path: abs, append: true };
            if (red.sourceFd === 2) {
              fd2 = dest;
            } else {
              fd1 = dest;
            }
          } else if (red.type === '>>') {
            if (!this.vfs.existsSync(abs)) {
              this.vfs.writeFileSync(abs, '');
              this._emitVfsMutation('create', abs);
            }
            const dest = { type: 'file', path: abs, append: true };
            if (red.sourceFd === 2) {
              fd2 = dest;
            } else {
              fd1 = dest;
            }
          } else if (red.type === '&>') {
            this.vfs.writeFileSync(abs, '');
            this._emitVfsMutation('create', abs);
            const dest = { type: 'file', path: abs, append: true };
            fd1 = dest;
            fd2 = dest;
          }
        } else if (red.type === '>&') {
          if (red.sourceFd === 2 && red.targetFd === 1) {
            fd2 = { ...fd1 };
          } else if (red.sourceFd === 1 && red.targetFd === 2) {
            fd1 = { ...fd2 };
          }
        }
      }

      // 5. Command execution dispatch
      const cmdCtx = {
        vfs: this.vfs,
        shell: this,
        portTable: this.portTable,
        cwd: this.cwd,
        env: cmdEnv,
        stdin: effectiveStdin,
        pid: context.pid || 1000,
        isBackground: Boolean(context.isBackground),
        resolvePath: (p) => this.resolvePath(p),
        emitMutation: (type, p) => this._emitVfsMutation(type, p)
      };

      let res;
      if (this.commands[cmdName]) {
        res = await this.commands[cmdName](args, cmdCtx);
        if (cmdName === 'export' || cmdName === 'unset' || cmdName === 'cd') {
          for (const k of Object.keys(context.env)) {
            if (!(k in this.env)) delete context.env[k];
          }
          Object.assign(context.env, this.env);
          context.cwd = this.cwd;
        }
      } else if (typeof this.options.onProcessSpawn === 'function') {
        const spawned = await this.options.onProcessSpawn(cmdName, args, {
          cwd: this.cwd,
          env: cmdEnv,
          stdin: effectiveStdin
        });
        if (spawned !== undefined && spawned !== null) {
          res = spawned;
        } else {
          res = { code: 127, stdout: '', stderr: `shell: ${cmdName}: command not found\n` };
        }
      } else {
        res = { code: 127, stdout: '', stderr: `shell: ${cmdName}: command not found\n` };
      }

      // 6. Route output according to file descriptors
      let stdoutOut = '';
      let stderrOut = '';

      const routeOutput = (fd, text) => {
        if (!text) return;
        if (fd.type === 'stdout') {
          stdoutOut += text;
        } else if (fd.type === 'stderr') {
          stderrOut += text;
        } else if (fd.type === 'file') {
          this.vfs.appendFileSync(fd.path, text);
          this._emitVfsMutation('change', fd.path);
        }
      };

      routeOutput(fd1, res.stdout || '');
      routeOutput(fd2, res.stderr || '');

      if (context.onStdout && stdoutOut) context.onStdout(stdoutOut);
      if (context.onStderr && stderrOut) context.onStderr(stderrOut);

      return {
        code: res.code !== undefined ? res.code : 0,
        stdout: stdoutOut,
        stderr: stderrOut
      };
    }
  }

  function createPosixShell(options = {}) {
    return new PosixShell(options);
  }

  // Return public API
  return {
    createPosixShell,
    parseShellCommand,
    tokenizeShell,
    PosixShell,
    COREUTILS,
    PosixPath,
    expandGlob,
    createVirtualPortTable
  };
});

  })();

  const CodeLabShell = root.CodeLabShell;

  // --- Module 3: PTY Terminal Engine ---
  (function () {
/**
 * @innovatorved/code-lab - Pure-JS PTY Terminal Emulator Component
 *
 * High-fidelity, self-contained terminal emulator engine providing:
 * - Inline prompt with cwd awareness (codelab:${cwd}$ )
 * - Interactive REPL sub-mode (> ) with .exit and Ctrl+D/Ctrl+C
 * - Character-by-character editing with cursor navigation:
 *   ArrowLeft, ArrowRight, Home, End, Ctrl+A, Ctrl+E, Ctrl+U, Ctrl+K, Backspace, Delete
 * - Tab auto-completion for built-in commands and VFS filesystem paths
 * - History navigation (ArrowUp, ArrowDown)
 * - ANSI 16/256 SGR escape sequence translation to styled Geist HTML spans
 * - Headless DOM safety (defensive guards for Node.js test environments)
 *
 * (C) 2026 InnovatorVed / CodeLab. MIT License.
 */

(function (root, factory) {
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = factory();
  } else if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else {
    const exports = factory();
    root.CodeLabTerminal = exports;
    root.PTYTerminalEngine = exports.PTYTerminalEngine;
    root.createTerminal = exports.createTerminal;
    root.ansiToHtml = exports.ansiToHtml;
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const ANSI_CODE_MAP = {
    1: 'cl-ansi-bold',
    2: 'cl-ansi-dim',
    3: 'cl-ansi-italic',
    4: 'cl-ansi-underline',
    30: 'cl-ansi-black',
    31: 'cl-ansi-red',
    32: 'cl-ansi-green',
    33: 'cl-ansi-yellow',
    34: 'cl-ansi-blue',
    35: 'cl-ansi-magenta',
    36: 'cl-ansi-cyan',
    37: 'cl-ansi-white',
    90: 'cl-ansi-gray',
    91: 'cl-ansi-bright-red',
    92: 'cl-ansi-bright-green',
    93: 'cl-ansi-bright-yellow',
    94: 'cl-ansi-bright-blue',
    95: 'cl-ansi-bright-magenta',
    96: 'cl-ansi-bright-cyan',
    97: 'cl-ansi-bright-white',
    40: 'cl-ansi-bg-black',
    41: 'cl-ansi-bg-red',
    42: 'cl-ansi-bg-green',
    43: 'cl-ansi-bg-yellow',
    44: 'cl-ansi-bg-blue',
    45: 'cl-ansi-bg-magenta',
    46: 'cl-ansi-bg-cyan',
    47: 'cl-ansi-bg-white'
  };

  function escapeHtml(str) {
    if (str == null) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function ansiToHtml(str) {
    if (!str) return '';
    const s = String(str);
    if (!s.includes('\x1b[')) {
      return escapeHtml(s);
    }

    // Strip non-color cursor control sequences
    const cleaned = s.replace(/\x1b\[[0-9;]*[A-LN-Za-z]/g, '');

    const tokenRegex = /\x1b\[([0-9;]*)m/g;
    let result = '';
    let lastIdx = 0;
    let openSpans = 0;
    let match;

    while ((match = tokenRegex.exec(cleaned)) !== null) {
      const rawText = cleaned.slice(lastIdx, match.index);
      if (rawText) result += escapeHtml(rawText);
      lastIdx = tokenRegex.lastIndex;

      const codes = match[1] ? match[1].split(';').map(Number) : [0];
      for (const code of codes) {
        if (code === 0) {
          while (openSpans > 0) {
            result += '</span>';
            openSpans--;
          }
        } else {
          const cls = ANSI_CODE_MAP[code];
          if (cls) {
            result += `<span class="${cls}">`;
            openSpans++;
          }
        }
      }
    }

    const remaining = cleaned.slice(lastIdx);
    if (remaining) result += escapeHtml(remaining);
    while (openSpans > 0) {
      result += '</span>';
      openSpans--;
    }
    return result;
  }

  class PTYTerminalEngine {
    constructor(container, options = {}) {
      this.container = container || null;
      this.options = options;
      this.logs = Array.isArray(options.logs) ? options.logs : [];
      this.cwd = options.cwd || '/workspace';
      this.replMode = Boolean(options.replMode);
      this.promptOverride = options.prompt || null;
      this.history = Array.isArray(options.history) ? options.history : [];
      this.historyIdx = -1;
      this.savedBuffer = '';
      this.buffer = '';
      this.cursor = 0;
      this.onCommand = typeof options.onCommand === 'function' ? options.onCommand : null;
      this.getCompletions = typeof options.getCompletions === 'function' ? options.getCompletions : null;
      this.onKey = typeof options.onKey === 'function' ? options.onKey : null;

      this._mounted = false;
      this._listeners = [];

      if (this.container) {
        this.mount(this.container);
      }
    }

    getPrompt() {
      if (this.promptOverride) return this.promptOverride;
      if (this.replMode) return '> ';
      const cwd = this.cwd || '/workspace';
      return `codelab:${cwd}$ `;
    }

    setPrompt(p) {
      this.promptOverride = p;
      this.updateActiveLine();
    }

    setCwd(cwd) {
      this.cwd = cwd;
      this.updateActiveLine();
    }

    setReplMode(enabled) {
      this.replMode = Boolean(enabled);
      this.updateActiveLine();
    }

    write(data, type = 'stdout') {
      const text = String(data);
      this.logs.push({ text, type });
      this.render();
    }

    writeln(data, type = 'stdout') {
      this.write(String(data) + '\n', type);
    }

    clear() {
      this.logs.length = 0;
      this.render();
    }

    getHistory() {
      return [...this.history];
    }

    focus() {
      if (!this.container) return;
      const input = this.container.querySelector('#cl-repl-input');
      if (input && typeof input.focus === 'function') {
        try { input.focus(); } catch (_) {}
      }
    }

    mount(container) {
      this.container = container;
      this._mounted = true;
      this.render();
      this._bindEvents();
    }

    destroy() {
      for (const { target, type, handler } of this._listeners) {
        if (target && typeof target.removeEventListener === 'function') {
          try { target.removeEventListener(type, handler); } catch (_) {}
        }
      }
      this._listeners = [];
      this._mounted = false;
    }

    _addListener(target, type, handler) {
      if (target && typeof target.addEventListener === 'function') {
        target.addEventListener(type, handler);
        this._listeners.push({ target, type, handler });
      }
    }

    _bindEvents() {
      if (!this.container) return;
      const termSurface = this.container.querySelector('#cl-terminal-surface') || this.container;
      const input = this.container.querySelector('#cl-repl-input');
      const form = this.container.querySelector('#cl-repl-form');

      if (termSurface) {
        this._addListener(termSurface, 'click', (e) => {
          if (e && e.target === input) return;
          const hasSelection = typeof window !== 'undefined' && window.getSelection && String(window.getSelection());
          if (!hasSelection) this.focus();
        });
      }

      if (input) {
        this._addListener(input, 'keydown', (e) => this.handleKeyDown(e));
        this._addListener(input, 'input', () => {
          if (input.value !== this.buffer) {
            this.buffer = input.value;
            this.cursor = this.buffer.length;
            this.updateActiveLine();
          }
        });
      }

      if (form) {
        this._addListener(form, 'submit', (e) => {
          if (e && typeof e.preventDefault === 'function') e.preventDefault();
          this.submitLine();
        });
      }
    }

    handleKeyDown(e) {
      if (!e) return;
      if (this.onKey) {
        try {
          const res = this.onKey(e);
          if (res === false) return;
        } catch (_) {}
      }

      const key = e.key;
      const isCtrl = e.ctrlKey || e.metaKey;

      if (key === 'ArrowLeft') {
        if (e.preventDefault) e.preventDefault();
        if (this.cursor > 0) {
          this.cursor--;
          this.updateActiveLine();
        }
        return;
      }

      if (key === 'ArrowRight') {
        if (e.preventDefault) e.preventDefault();
        if (this.cursor < this.buffer.length) {
          this.cursor++;
          this.updateActiveLine();
        }
        return;
      }

      if (key === 'Home' || (isCtrl && (key === 'a' || key === 'A'))) {
        if (e.preventDefault) e.preventDefault();
        this.cursor = 0;
        this.updateActiveLine();
        return;
      }

      if (key === 'End' || (isCtrl && (key === 'e' || key === 'E'))) {
        if (e.preventDefault) e.preventDefault();
        this.cursor = this.buffer.length;
        this.updateActiveLine();
        return;
      }

      if (isCtrl && (key === 'u' || key === 'U')) {
        if (e.preventDefault) e.preventDefault();
        this.buffer = this.buffer.slice(this.cursor);
        this.cursor = 0;
        this.updateActiveLine();
        return;
      }

      if (isCtrl && (key === 'k' || key === 'K')) {
        if (e.preventDefault) e.preventDefault();
        this.buffer = this.buffer.slice(0, this.cursor);
        this.updateActiveLine();
        return;
      }

      if (key === 'Backspace') {
        if (e.preventDefault) e.preventDefault();
        if (this.cursor > 0) {
          this.buffer = this.buffer.slice(0, this.cursor - 1) + this.buffer.slice(this.cursor);
          this.cursor--;
          this.updateActiveLine();
        }
        return;
      }

      if (key === 'Delete') {
        if (e.preventDefault) e.preventDefault();
        if (this.cursor < this.buffer.length) {
          this.buffer = this.buffer.slice(0, this.cursor) + this.buffer.slice(this.cursor + 1);
          this.updateActiveLine();
        }
        return;
      }

      if (isCtrl && (key === 'l' || key === 'L')) {
        if (e.preventDefault) e.preventDefault();
        this.clear();
        return;
      }

      if (isCtrl && (key === 'c' || key === 'C')) {
        if (e.preventDefault) e.preventDefault();
        this.logs.push({ type: 'system', text: `${this.getPrompt()}${this.buffer}^C` });
        this.buffer = '';
        this.cursor = 0;
        this.historyIdx = -1;
        if (this.replMode) {
          this.replMode = false;
        }
        this.render();
        return;
      }

      if (isCtrl && (key === 'd' || key === 'D')) {
        if (this.buffer === '') {
          if (e.preventDefault) e.preventDefault();
          if (this.replMode) {
            this.logs.push({ type: 'system', text: `${this.getPrompt()}.exit` });
            this.replMode = false;
            this.render();
            return;
          }
        }
      }

      if (key === 'ArrowUp') {
        if (e.preventDefault) e.preventDefault();
        if (!this.history.length) return;
        if (this.historyIdx === -1) {
          this.savedBuffer = this.buffer;
          this.historyIdx = this.history.length - 1;
        } else if (this.historyIdx > 0) {
          this.historyIdx--;
        }
        this.buffer = this.history[this.historyIdx] || '';
        this.cursor = this.buffer.length;
        this.updateActiveLine();
        return;
      }

      if (key === 'ArrowDown') {
        if (e.preventDefault) e.preventDefault();
        if (this.historyIdx !== -1) {
          if (this.historyIdx < this.history.length - 1) {
            this.historyIdx++;
            this.buffer = this.history[this.historyIdx] || '';
          } else {
            this.historyIdx = -1;
            this.buffer = this.savedBuffer || '';
          }
          this.cursor = this.buffer.length;
          this.updateActiveLine();
        }
        return;
      }

      if (key === 'Tab') {
        if (e.preventDefault) e.preventDefault();
        this.autoComplete();
        return;
      }

      if (key === 'Enter') {
        if (e.preventDefault) e.preventDefault();
        this.submitLine();
        return;
      }

      // Printable character
      if (key && key.length === 1 && !isCtrl && !e.altKey) {
        this.buffer = this.buffer.slice(0, this.cursor) + key + this.buffer.slice(this.cursor);
        this.cursor++;
        this.updateActiveLine();
      }
    }

    autoComplete() {
      if (!this.getCompletions) return;
      const res = this.getCompletions(this.buffer, this.cursor);
      if (!res || !Array.isArray(res.matches) || res.matches.length === 0) return;

      const matches = res.matches;
      if (matches.length === 1) {
        const match = matches[0];
        const isDir = match.endsWith('/');
        const appendChar = isDir ? '' : ' ';
        const before = this.buffer.slice(0, res.tokenStart);
        const after = this.buffer.slice(this.cursor);
        this.buffer = before + match + appendChar + after;
        this.cursor = before.length + match.length + appendChar.length;
        this.updateActiveLine();
      } else {
        // Find longest common prefix
        let lcp = matches[0];
        for (let i = 1; i < matches.length; i++) {
          let j = 0;
          while (j < lcp.length && j < matches[i].length && lcp[j] === matches[i][j]) {
            j++;
          }
          lcp = lcp.slice(0, j);
        }

        if (lcp.length > res.token.length) {
          const before = this.buffer.slice(0, res.tokenStart);
          const after = this.buffer.slice(this.cursor);
          this.buffer = before + lcp + after;
          this.cursor = before.length + lcp.length;
        }

        // Print candidate matches
        this.logs.push({ type: 'system', text: `${this.getPrompt()}${this.buffer}` });
        this.logs.push({ type: 'stdout', text: matches.join('  ') });
        this.render();
      }
    }

    submitLine() {
      const line = this.buffer;
      this.buffer = '';
      this.cursor = 0;
      this.historyIdx = -1;

      if (line.trim()) {
        if (this.history[this.history.length - 1] !== line.trim()) {
          this.history.push(line.trim());
        }
      }

      if (this.onCommand) {
        this.onCommand(line);
      }
    }

    updateActiveLine() {
      if (!this.container) return;
      const input = this.container.querySelector('#cl-repl-input');
      if (input && input.value !== this.buffer) {
        input.value = this.buffer;
      }
      const lineEl = this.container.querySelector('#cl-pty-active-line');
      if (!lineEl) return;

      const prompt = this.getPrompt();
      const before = this.buffer.slice(0, this.cursor);
      const cursorChar = this.cursor < this.buffer.length ? this.buffer[this.cursor] : ' ';
      const after = this.cursor < this.buffer.length ? this.buffer.slice(this.cursor + 1) : '';

      lineEl.innerHTML = `<span class="codelab-pty__prompt">${escapeHtml(prompt)}</span><span class="codelab-pty__before">${escapeHtml(before)}</span><span class="codelab-pty__cursor blink">${escapeHtml(cursorChar)}</span><span class="codelab-pty__after">${escapeHtml(after)}</span>`;
    }

    render() {
      if (!this.container) return;
      const logsHtml = this.logs
        .map(item => `<div class="codelab-log-line ${escapeHtml(item.type || '')}">${ansiToHtml(item.text)}</div>`)
        .join('');

      const prompt = this.getPrompt();
      const before = this.buffer.slice(0, this.cursor);
      const cursorChar = this.cursor < this.buffer.length ? this.buffer[this.cursor] : ' ';
      const after = this.cursor < this.buffer.length ? this.buffer.slice(this.cursor + 1) : '';

      this.container.innerHTML = `
        <div class="codelab-terminal" id="cl-terminal-surface" tabindex="0">
          <div class="codelab-terminal__log" id="cl-terminal-log">${logsHtml}</div>
          <div class="codelab-pty__active-line" id="cl-pty-active-line">
            <span class="codelab-pty__prompt">${escapeHtml(prompt)}</span><span class="codelab-pty__before">${escapeHtml(before)}</span><span class="codelab-pty__cursor blink">${escapeHtml(cursorChar)}</span><span class="codelab-pty__after">${escapeHtml(after)}</span>
          </div>
          <form class="codelab-repl" id="cl-repl-form" style="position:absolute;opacity:0;pointer-events:none;height:0;overflow:hidden;">
            <input type="text" class="codelab-repl__input" id="cl-repl-input" autocomplete="off" spellcheck="false" aria-label="Terminal command input" value="${escapeHtml(this.buffer)}">
          </form>
        </div>
      `;

      if (typeof this.container.scrollTop === 'number' && typeof this.container.scrollHeight === 'number') {
        this.container.scrollTop = this.container.scrollHeight;
      }

      this._bindEvents();
    }
  }

  function createTerminal(container, options = {}) {
    return new PTYTerminalEngine(container, options);
  }

  return {
    PTYTerminalEngine,
    createTerminal,
    ansiToHtml,
    escapeHtml,
    ANSI_CODE_MAP
  };
});

  })();

  const CodeLabTerminal = root.CodeLabTerminal;

  // --- Module 4: IDE Workbench & Web Component ---
  (function () {
/* ═══════════════════════════════════════════════════════════════════════════
   @innovatorved/code-lab — Interactive Monaco IDE Workbench & Guided Lab UI
   Supports <code-lab> Custom Element + window.CodeLab.mount() API
   ═══════════════════════════════════════════════════════════════════════════ */

(function (root) {
  'use strict';

  let terminalModule = null;
  let shellModule = null;
  let runtimeModule = null;
  if (typeof require === 'function') {
    try { terminalModule = require('./terminal.js'); } catch (_) {}
    try { shellModule = require('./shell.js'); } catch (_) {}
    try { runtimeModule = require('./runtime.js'); } catch (_) {}
  }
  const CodeLabTerminal = (root && root.CodeLabTerminal) || terminalModule || {};
  const CodeLabShell = (root && root.CodeLabShell) || shellModule || {};
  const createPTYTerminalEngine = CodeLabTerminal.PTYTerminalEngine || (root && root.PTYTerminalEngine);
  const ansiToHtml = CodeLabTerminal.ansiToHtml || (root && root.ansiToHtml);
  const createPosixShell = CodeLabShell.createPosixShell || (root && root.createPosixShell);
  const createVirtualPortTable = (root && root.createVirtualPortTable) ||
    (root && root.CodeLabRuntime && root.CodeLabRuntime.createVirtualPortTable) ||
    (shellModule && shellModule.createVirtualPortTable) ||
    (runtimeModule && runtimeModule.createVirtualPortTable) || null;

  function findCommonPrefix(arr) {
    if (!arr || arr.length === 0) return '';
    let prefix = arr[0];
    for (let i = 1; i < arr.length; i++) {
      while (!arr[i].startsWith(prefix)) {
        prefix = prefix.slice(0, -1);
        if (!prefix) return '';
      }
    }
    return prefix;
  }

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
declare const Bun: {
  version: string;
  revision: string;
  env: Record<string, string | undefined>;
  serve(options: { port?: number; hostname?: string; fetch(req: Request, server?: any): Response | Promise<Response>; error?(err: Error): Response | Promise<Response> }): { port: number; hostname: string; url: string; stop(closeActiveConnections?: boolean): void };
  file(path: string, options?: { type?: string }): { size: number; type: string; text(): Promise<string>; json(): Promise<any>; arrayBuffer(): Promise<ArrayBuffer>; bytes(): Promise<Uint8Array>; exists(): Promise<boolean> };
  write(dest: string | any, input: string | Uint8Array | ArrayBuffer | Response | any): Promise<number>;
  sleep(ms: number): Promise<void>;
  sleepSync(ms: number): void;
  hash(input: string | Uint8Array, seed?: number): number;
  deepEquals(a: any, b: any, strict?: boolean): boolean;
  inspect(val: any): string;
  nanoseconds(): number;
  which(bin: string): string | null;
  escapeHTML(str: string): string;
  stringWidth(str: string): number;
};
declare module 'bun' {
  export const version: string;
  export const env: Record<string, string | undefined>;
  export const serve: typeof Bun.serve;
  export const file: typeof Bun.file;
  export const write: typeof Bun.write;
  export const sleep: typeof Bun.sleep;
  export const sleepSync: typeof Bun.sleepSync;
  export const hash: typeof Bun.hash;
  export const deepEquals: typeof Bun.deepEquals;
  export const inspect: typeof Bun.inspect;
  export const nanoseconds: typeof Bun.nanoseconds;
  export const which: typeof Bun.which;
  export const escapeHTML: typeof Bun.escapeHTML;
  export const stringWidth: typeof Bun.stringWidth;
  export default Bun;
}
declare module 'bun:test' {
  export function test(name: string, fn: () => any, timeout?: number): Promise<void>;
  export function it(name: string, fn: () => any, timeout?: number): Promise<void>;
  export function describe(name: string, fn: () => void): void;
  export function beforeAll(fn: () => any): void;
  export function afterAll(fn: () => any): void;
  export function beforeEach(fn: () => any): void;
  export function afterEach(fn: () => any): void;
  export function expect(actual: any): any;
  export const mock: any;
  export const jest: any;
}
declare module 'bun:sqlite' {
  export class Database {
    constructor(filename?: string, options?: any);
    exec(sql: string): this;
    run(sql: string, ...params: any[]): { changes: number; lastInsertRowid: number };
    query(sql: string): { all(...params: any[]): any[]; get(...params: any[]): any; values(...params: any[]): any[][]; run(...params: any[]): { changes: number; lastInsertRowid: number } };
    prepare(sql: string): { all(...params: any[]): any[]; get(...params: any[]): any; values(...params: any[]): any[][]; run(...params: any[]): { changes: number; lastInsertRowid: number }; finalize(): void };
    transaction<T extends (...args: any[]) => any>(fn: T): T;
    close(): void;
  }
  export default Database;
}
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
    download: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>',
    refresh: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 4v6h-6"/><path d="M1 20v-6h6"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>',
    send: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>',
    activity: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>',
    radio: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="2"/><path d="M16.24 7.76a6 6 0 0 1 0 8.49m-8.48-.01a6 6 0 0 1 0-8.49m11.31-2.82a10 10 0 0 1 0 14.14m-14.14 0a10 10 0 0 1 0-14.14"/></svg>'
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

      // Execution & shell state
      this.cwd = '/workspace';
      this.replHistory = [];
      this.replHistoryIdx = -1;
      this.lastTestResults = [];
      this.terminalLogs = [
        { type: 'system', text: `[CodeLab] Virtual Node.js v22 Runtime ready (${this.title}).` },
        { type: 'system', text: `Type "help", "ls", "pwd", "cat <file>", "node demo.js", "node test.js", or any JS/TS expression.` }
      ];
      this.lastFsSnapshot = [];
      this.lastHttpTrace = [];

      // Milestone 4: Ports, HTTP Client, Network Trace, PTY state
      this.portTable = options.portTable || (typeof createVirtualPortTable === 'function' ? createVirtualPortTable() : null);
      this.inRepl = false;
      this._ptyInputBeforeCursor = '';
      this._ptyInputAfterCursor = '';

      this.httpClientState = {
        method: 'GET',
        url: 'http://localhost:3000/',
        headers: 'Content-Type: application/json',
        body: '',
        activeResponseTab: 'preview',
        lastResponse: null,
        loading: false
      };

      this.networkFilter = {
        search: '',
        method: 'ALL',
        status: 'ALL',
        selectedTraceId: null
      };

      this.ptyEngine = null;
      if (typeof createPTYTerminalEngine === 'function') {
        try {
          this.ptyEngine = new createPTYTerminalEngine({
            cwd: this.cwd,
            onCommand: (cmd) => this._handleReplCommand(cmd)
          });
        } catch (_) {}
      }

      this.shell = null;
      this._initShell();

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

    _initShell() {
      if (typeof createPosixShell === 'function') {
        try {
          this.shell = createPosixShell({
            cwd: this.cwd,
            files: this.files,
            portTable: this.portTable,
            env: {
              TERM: 'xterm-256color',
              COLORTERM: 'truecolor',
              USER: 'codelab',
              HOME: '/home/codelab',
              NODE_ENV: 'development',
              PATH: '/usr/local/bin:/usr/bin:/bin:/workspace/node_modules/.bin'
            }
          });
        } catch (_) {}
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
        'test', 'timers', 'timers/promises', 'url', 'util', 'zlib',
        'bun', 'bun:test', 'bun:sqlite'
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
            if (spec.startsWith('node:') || spec.startsWith('bun:')) {
              builtinSet.add(spec);
            } else if (spec === 'bun') {
              builtinSet.add('bun');
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
              <button type="button" class="codelab-btn codelab-btn--icon" id="cl-toggle-guide-btn" data-cl-action="toggle-guide" title="Toggle Guide Panel" aria-label="Toggle Guide Panel">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18"/></svg>
              </button>
              <button type="button" class="codelab-btn codelab-btn--icon" id="cl-toggle-drawer-btn" data-cl-action="toggle-drawer" title="Toggle Terminal Drawer" aria-label="Toggle Terminal Drawer">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 15h18"/></svg>
              </button>
              <button type="button" class="codelab-btn codelab-btn--icon" id="cl-fullscreen-btn" data-cl-action="toggle-fullscreen" title="Toggle Fullscreen IDE (Esc to exit)" aria-label="Toggle Fullscreen IDE">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>
              </button>
              ${this.onClose ? `
                <button type="button" class="codelab-btn codelab-btn--icon codelab-btn--close-ide" id="cl-close-ide-btn" data-cl-action="close-lab" title="${escapeHtml(this.backLabel || 'Close IDE')}" aria-label="Close IDE">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              ` : ''}
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
                    <button type="button" role="tab" aria-selected="${this.drawerTab === 'ports'}" class="codelab-drawer__tab ${this.drawerTab === 'ports' ? 'active' : ''}" data-cl-drawertab="ports">
                      ${CL_ICONS.radio}
                      <span>Ports</span>
                      <span class="codelab-drawer__pill" id="cl-ports-pill">${this.portTable && typeof this.portTable.listServers === 'function' ? this.portTable.listServers().length : 0} open</span>
                    </button>
                    <button type="button" role="tab" aria-selected="${this.drawerTab === 'network'}" class="codelab-drawer__tab ${this.drawerTab === 'network' ? 'active' : ''}" data-cl-drawertab="network">
                      ${CL_ICONS.activity}
                      <span>Network</span>
                      <span class="codelab-drawer__pill" id="cl-network-pill">${(this.lastHttpTrace || []).length} reqs</span>
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
      if (!explorerEl._dragBound) {
        explorerEl._dragBound = true;
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
      }

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
          <div role="tab" tabindex="0" aria-selected="${isActive}" class="codelab-tab ${isActive ? 'active' : ''}" data-cl-file="${escapeHtml(f)}" data-tab-file="${escapeHtml(f)}">
            <span class="codelab-tab__ext codelab-tab__ext--${ext}">${ext.toUpperCase()}</span>
            <span class="codelab-tab__label">${escapeHtml(f)}</span>
            <button type="button" class="codelab-tab__close" data-action="close-tab" data-cl-file="${escapeHtml(f)}" title="Close ${escapeHtml(f)}" aria-label="Close ${escapeHtml(f)}">×</button>
          </div>
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
      const portsPill = this.container.querySelector('#cl-ports-pill');
      const networkPill = this.container.querySelector('#cl-network-pill');
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
      if (portsPill) {
        const portCount = (this.portTable && typeof this.portTable.listServers === 'function')
          ? this.portTable.listServers().length
          : 0;
        portsPill.textContent = `${portCount} open`;
      }
      if (networkPill) {
        const netCount = (this.lastHttpTrace || []).length;
        networkPill.textContent = `${netCount} reqs`;
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
        const logsHtml = this.terminalLogs
          .map(item => {
            const html = ansiToHtml ? ansiToHtml(item.text || '') : escapeHtml(item.text || '');
            return `<div class="codelab-log-line ${escapeHtml(item.type || '')}">${html}</div>`;
          })
          .join('');
        const cwdShort = (this.cwd || '/workspace').replace(/^\/workspace\/?/, '') || '~';
        const promptLabel = this.inRepl ? '> ' : (cwdShort === '~' ? 'codelab$' : `codelab:${cwdShort}$`);
        bodyEl.innerHTML = `<div class="codelab-terminal" id="cl-terminal-surface" tabindex="0"><div class="codelab-terminal__log" id="cl-terminal-log">${logsHtml}</div><div class="codelab-pty__active-line" id="cl-pty-active-line"><span class="codelab-pty__prompt">${escapeHtml(promptLabel)} </span><span class="codelab-pty__before">${escapeHtml(this._ptyInputBeforeCursor || '')}</span><span class="codelab-pty__cursor blink">&#x2588;</span><span class="codelab-pty__after">${escapeHtml(this._ptyInputAfterCursor || '')}</span></div><form class="codelab-repl" id="cl-repl-form" style="position:absolute;width:1px;height:1px;overflow:hidden;opacity:0;"><span class="codelab-repl__prompt">${escapeHtml(promptLabel)}</span><input type="text" class="codelab-repl__input" id="cl-repl-input" placeholder="ls, pwd, cat file.js, node demo.js, node test.js, or JS/TS expression…" autocomplete="off" spellcheck="false" aria-label="REPL command input"></form></div>`;
        bodyEl.scrollTop = bodyEl.scrollHeight;
        const termSurface = bodyEl.querySelector('#cl-terminal-surface');
        const input = bodyEl.querySelector('#cl-repl-input');
        if (termSurface && input) {
          termSurface.addEventListener('click', e => {
            if (e.target === input) return;
            const sel = typeof window !== 'undefined' && window.getSelection ? String(window.getSelection()) : '';
            if (!sel && typeof input.focus === 'function') input.focus();
          });
        }
        if (input) {
          input.value = (this._ptyInputBeforeCursor || '') + (this._ptyInputAfterCursor || '');
          input.addEventListener('input', () => {
            const val = input.value || '';
            const pos = (input.selectionStart !== undefined && input.selectionStart !== null) ? input.selectionStart : val.length;
            this._ptyInputBeforeCursor = val.slice(0, pos);
            this._ptyInputAfterCursor = val.slice(pos);
            this._updatePtyActiveLine();
          });
          input.addEventListener('keydown', e => {
            if (e.key === 'Tab') {
              e.preventDefault();
              this._handlePtyTabCompletion(input);
            } else if (e.key === 'ArrowUp') {
              e.preventDefault();
              if (!this.replHistory.length) return;
              if (this.replHistoryIdx < 0) this.replHistoryIdx = this.replHistory.length - 1;
              else if (this.replHistoryIdx > 0) this.replHistoryIdx--;
              const histVal = this.replHistory[this.replHistoryIdx] || '';
              input.value = histVal;
              this._ptyInputBeforeCursor = histVal;
              this._ptyInputAfterCursor = '';
              this._updatePtyActiveLine();
            } else if (e.key === 'ArrowDown') {
              e.preventDefault();
              if (!this.replHistory.length || this.replHistoryIdx < 0) return;
              if (this.replHistoryIdx < this.replHistory.length - 1) {
                this.replHistoryIdx++;
                const histVal = this.replHistory[this.replHistoryIdx] || '';
                input.value = histVal;
                this._ptyInputBeforeCursor = histVal;
                this._ptyInputAfterCursor = '';
                this._updatePtyActiveLine();
              } else {
                this.replHistoryIdx = -1;
                input.value = '';
                this._ptyInputBeforeCursor = '';
                this._ptyInputAfterCursor = '';
                this._updatePtyActiveLine();
              }
            } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'c') {
              e.preventDefault();
              if (this.inRepl) {
                this.inRepl = false;
                this.terminalLogs.push({ type: 'stdout', text: '^C\nExiting REPL...' });
              } else {
                this.terminalLogs.push({ type: 'stdout', text: `${promptLabel} ^C` });
              }
              input.value = '';
              this._ptyInputBeforeCursor = '';
              this._ptyInputAfterCursor = '';
              this._renderDrawerBody();
              const nextInput = this.container.querySelector('#cl-repl-input');
              if (nextInput && typeof nextInput.focus === 'function') nextInput.focus();
            } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'd') {
              e.preventDefault();
              if (this.inRepl) {
                this.inRepl = false;
                this.terminalLogs.push({ type: 'stdout', text: 'Exiting REPL...' });
                this._renderDrawerBody();
                const nextInput = this.container.querySelector('#cl-repl-input');
                if (nextInput && typeof nextInput.focus === 'function') nextInput.focus();
              }
            } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'l') {
              e.preventDefault();
              this.terminalLogs = [];
              this._renderDrawerBody();
              const nextInput = this.container.querySelector('#cl-repl-input');
              if (nextInput && typeof nextInput.focus === 'function') nextInput.focus();
            } else if (e.ctrlKey && e.key.toLowerCase() === 'u') {
              e.preventDefault();
              this._ptyInputBeforeCursor = '';
              input.value = this._ptyInputAfterCursor || '';
              this._updatePtyActiveLine();
            } else if (e.ctrlKey && e.key.toLowerCase() === 'k') {
              e.preventDefault();
              this._ptyInputAfterCursor = '';
              input.value = this._ptyInputBeforeCursor || '';
              this._updatePtyActiveLine();
            } else if (e.ctrlKey && e.key.toLowerCase() === 'a') {
              e.preventDefault();
              this._ptyInputAfterCursor = (this._ptyInputBeforeCursor || '') + (this._ptyInputAfterCursor || '');
              this._ptyInputBeforeCursor = '';
              if (input && typeof input.setSelectionRange === 'function') input.setSelectionRange(0, 0);
              this._updatePtyActiveLine();
            } else if (e.ctrlKey && e.key.toLowerCase() === 'e') {
              e.preventDefault();
              this._ptyInputBeforeCursor = (this._ptyInputBeforeCursor || '') + (this._ptyInputAfterCursor || '');
              this._ptyInputAfterCursor = '';
              const len = this._ptyInputBeforeCursor.length;
              if (input && typeof input.setSelectionRange === 'function') input.setSelectionRange(len, len);
              this._updatePtyActiveLine();
            }
          });
        }
        const replForm = bodyEl.querySelector('#cl-repl-form');
        if (replForm) {
          replForm.addEventListener('submit', e => {
            e.preventDefault();
            const rawCmd = (input && input.value !== undefined ? input.value : '') ||
              ((this._ptyInputBeforeCursor || '') + (this._ptyInputAfterCursor || ''));
            const cmd = rawCmd.trim();
            if (!cmd) return;
            if (input) input.value = '';
            this._ptyInputBeforeCursor = '';
            this._ptyInputAfterCursor = '';
            this._updatePtyActiveLine();
            this._handleReplCommand(cmd).then(() => {
              const nextInput = this.container.querySelector('#cl-repl-input');
              if (nextInput && typeof nextInput.focus === 'function') nextInput.focus();
            });
          });
        }
        return;
      }

      if (this.drawerTab === 'ports') {
        this._renderPortsPanel(bodyEl);
        return;
      }

      if (this.drawerTab === 'network') {
        this._renderNetworkPanel(bodyEl);
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

    _updatePtyActiveLine() {
      if (!this.container) return;
      const beforeEl = this.container.querySelector('.codelab-pty__before');
      const afterEl = this.container.querySelector('.codelab-pty__after');
      const promptEl = this.container.querySelector('.codelab-pty__prompt');
      const cwdShort = (this.cwd || '/workspace').replace(/^\/workspace\/?/, '') || '~';
      const promptLabel = this.inRepl ? '> ' : (cwdShort === '~' ? 'codelab$' : `codelab:${cwdShort}$`);

      if (promptEl) promptEl.textContent = promptLabel + ' ';
      if (beforeEl) beforeEl.textContent = this._ptyInputBeforeCursor || '';
      if (afterEl) afterEl.textContent = this._ptyInputAfterCursor || '';
    }

    _handlePtyTabCompletion(input) {
      const currentInput = (input && input.value !== undefined) ? input.value : ((this._ptyInputBeforeCursor || '') + (this._ptyInputAfterCursor || ''));
      const candidates = this._getCompletionCandidates(currentInput);
      if (!candidates || candidates.length === 0) return;

      const lastSpaceIdx = currentInput.lastIndexOf(' ');
      const prefix = lastSpaceIdx === -1 ? '' : currentInput.slice(0, lastSpaceIdx + 1);
      const token = lastSpaceIdx === -1 ? currentInput : currentInput.slice(lastSpaceIdx + 1);

      if (candidates.length === 1) {
        const completed = prefix + candidates[0] + (candidates[0].endsWith('/') ? '' : ' ');
        if (input) input.value = completed;
        this._ptyInputBeforeCursor = completed;
        this._ptyInputAfterCursor = '';
        this._updatePtyActiveLine();
      } else {
        const common = findCommonPrefix(candidates);
        if (common && common.length > token.length) {
          const completed = prefix + common;
          if (input) input.value = completed;
          this._ptyInputBeforeCursor = completed;
          this._ptyInputAfterCursor = '';
          this._updatePtyActiveLine();
        } else {
          const cwdShort = (this.cwd || '/workspace').replace(/^\/workspace\/?/, '') || '~';
          const promptLabel = this.inRepl ? '> ' : (cwdShort === '~' ? 'codelab$' : `codelab:${cwdShort}$`);
          this.terminalLogs.push({ type: 'system', text: `${promptLabel} ${currentInput}` });
          this.terminalLogs.push({ type: 'stdout', text: candidates.join('  ') });
          this._renderDrawerBody();
          const nextInput = this.container.querySelector('#cl-repl-input');
          if (nextInput) {
            nextInput.value = currentInput;
            this._ptyInputBeforeCursor = currentInput;
            this._ptyInputAfterCursor = '';
            this._updatePtyActiveLine();
            if (typeof nextInput.focus === 'function') nextInput.focus();
          }
        }
      }
    }

    _getCompletionCandidates(currentInput) {
      const line = currentInput || '';
      const lastSpaceIdx = line.lastIndexOf(' ');
      const token = lastSpaceIdx === -1 ? line : line.slice(lastSpaceIdx + 1);
      const isFirstToken = lastSpaceIdx === -1;

      if (isFirstToken) {
        const commands = [
          'cat', 'cd', 'clear', 'cp', 'curl', 'echo', 'env', 'export', 'find',
          'grep', 'head', 'help', 'history', 'jobs', 'kill', 'ls', 'mkdir', 'mv',
          'node', 'npm', 'npx', 'ps', 'pwd', 'rm', 'sed', 'sort', 'tail', 'touch',
          'uniq', 'unset', 'wc', 'which', 'bun'
        ];
        return commands.filter(c => c.startsWith(token));
      } else {
        const vfsPaths = [];
        const cwd = this.cwd || '/workspace';
        const normCwd = cwd.endsWith('/') ? cwd : cwd + '/';

        for (const p of Object.keys(this.files || {})) {
          const fullPath = p.startsWith('/') ? p : normCwd + p;
          if (token.startsWith('/')) {
            vfsPaths.push(fullPath);
          } else if (fullPath.startsWith(normCwd)) {
            vfsPaths.push(fullPath.slice(normCwd.length));
          } else {
            vfsPaths.push(p);
          }
        }
        for (const folder of (this.folders || [])) {
          const fullFolder = folder.startsWith('/') ? folder : normCwd + folder;
          if (token.startsWith('/')) {
            vfsPaths.push(fullFolder + '/');
          } else if (fullFolder.startsWith(normCwd)) {
            vfsPaths.push(fullFolder.slice(normCwd.length) + '/');
          } else {
            vfsPaths.push(folder + '/');
          }
        }
        const unique = Array.from(new Set(vfsPaths));
        return unique.filter(p => p.startsWith(token));
      }
    }

    _renderPortsPanel(bodyEl) {
      if (!bodyEl) return;
      const servers = (this.portTable && typeof this.portTable.listServers === 'function')
        ? this.portTable.listServers()
        : [];
      const httpState = this.httpClientState;
      const lastRes = httpState.lastResponse;

      let serversHtml = '';
      if (servers.length === 0) {
        serversHtml = `
          <div class="codelab-ports-empty">
            <p style="margin:0 0 6px 0;font-weight:500;">No active port listeners</p>
            <span style="font-size:12px;color:var(--cl-fg-muted);">
              Run an HTTP or WebSocket server in the terminal (e.g. <code>node server.js &amp;</code> or <code>bun run server.ts &amp;</code>) to bind a virtual port.
            </span>
          </div>
        `;
      } else {
        serversHtml = `
          <div class="codelab-ports-table-wrapper">
            <table class="codelab-ports-table">
              <thead>
                <tr>
                  <th>Port</th>
                  <th>Host / URL</th>
                  <th>Protocol</th>
                  <th>Process / Service</th>
                  <th>Status</th>
                  <th style="text-align:right;">Actions</th>
                </tr>
              </thead>
              <tbody>
                ${servers.map(s => `
                  <tr>
                    <td><span class="codelab-port-tag">${s.port}</span></td>
                    <td><a href="http://127.0.0.1:${s.port}/" target="_blank" class="codelab-port-link">http://127.0.0.1:${s.port}/</a></td>
                    <td><span class="codelab-badge">${escapeHtml(s.protocol || 'HTTP/1.1')}</span></td>
                    <td><code>${escapeHtml(s.service || (s.pid ? `PID ${s.pid}` : 'node'))}</code></td>
                    <td><span class="codelab-port-status codelab-port-status--listening"><span class="codelab-port-status-dot"></span>LISTENING</span></td>
                    <td style="text-align:right;white-space:nowrap;">
                      <button type="button" class="codelab-btn codelab-btn--sm" data-cl-action="open-port-client" data-port="${s.port}">Open in Client</button>
                      <button type="button" class="codelab-btn codelab-btn--sm codelab-btn--danger" data-cl-action="stop-port" data-port="${s.port}">Stop</button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        `;
      }

      const methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'];
      const methodOptions = methods.map(m => `<option value="${m}" ${httpState.method === m ? 'selected' : ''}>${m}</option>`).join('');

      let responseBodyView = '';
      if (httpState.loading) {
        responseBodyView = `<div class="codelab-response-placeholder">Sending virtual loopback request...</div>`;
      } else if (!lastRes) {
        responseBodyView = `<div class="codelab-response-placeholder">No response received yet. Send a request above to inspect loopback traffic.</div>`;
      } else if (httpState.activeResponseTab === 'preview') {
        const isHtml = lastRes.headers && Object.entries(lastRes.headers).some(([k, v]) => k.toLowerCase() === 'content-type' && String(v).includes('text/html'));
        if (isHtml || lastRes.body.includes('<html') || lastRes.body.includes('<!DOCTYPE') || lastRes.body.includes('<div') || lastRes.body.includes('<body')) {
          responseBodyView = `<iframe class="codelab-response-iframe" sandbox="allow-same-origin" srcdoc="${escapeHtml(lastRes.body)}"></iframe>`;
        } else {
          responseBodyView = `<pre class="codelab-response-raw"><code>${escapeHtml(lastRes.formattedBody || lastRes.body)}</code></pre>`;
        }
      } else if (httpState.activeResponseTab === 'raw') {
        responseBodyView = `<pre class="codelab-response-raw"><code>${escapeHtml(lastRes.formattedBody || lastRes.body)}</code></pre>`;
      } else if (httpState.activeResponseTab === 'headers') {
        const headerRows = Object.entries(lastRes.headers || {})
          .map(([k, v]) => `<tr><td class="codelab-header-key">${escapeHtml(k)}:</td><td class="codelab-header-val">${escapeHtml(String(v))}</td></tr>`)
          .join('');
        responseBodyView = `
          <table class="codelab-headers-table">
            <tbody>
              ${headerRows || '<tr><td colspan="2" style="color:var(--cl-fg-muted);">No headers present</td></tr>'}
            </tbody>
          </table>
        `;
      }

      let responseHeaderMeta = '';
      if (lastRes) {
        const statusClass = lastRes.status < 300 ? 'status-2xx' : (lastRes.status < 400 ? 'status-3xx' : (lastRes.status < 500 ? 'status-4xx' : 'status-5xx'));
        responseHeaderMeta = `
          <div class="codelab-response-meta">
            <span class="codelab-status-badge ${statusClass}">HTTP ${lastRes.status} ${escapeHtml(lastRes.statusText || '')}</span>
            <span class="codelab-meta-item">${(lastRes.durationMs || 0).toFixed(1)} ms</span>
            <span class="codelab-meta-item">${lastRes.size} bytes</span>
          </div>
        `;
      }

      bodyEl.innerHTML = `
        <div class="codelab-ports-panel">
          <div class="codelab-panel-section">
            <div class="codelab-section-title">
              <span>${CL_ICONS.radio || ''} Active Port Listeners</span>
              <span class="codelab-badge">${servers.length} listening</span>
            </div>
            ${serversHtml}
          </div>

          <div class="codelab-panel-section">
            <div class="codelab-section-title">
              <span>${CL_ICONS.send || ''} Mini HTTP Client</span>
              <span style="font-size:11px;color:var(--cl-fg-muted);">Virtual Loopback (127.0.0.1)</span>
            </div>
            <div class="codelab-http-client">
              <div class="codelab-http-url-bar">
                <select class="codelab-select" id="cl-http-method" aria-label="HTTP Method">${methodOptions}</select>
                <input type="text" class="codelab-input" id="cl-http-url" value="${escapeHtml(httpState.url)}" placeholder="http://localhost:3000/" aria-label="Request URL">
                <button type="button" class="codelab-btn codelab-btn--primary" id="cl-http-send-btn" data-cl-action="http-send">${CL_ICONS.send || ''} <span>Send</span></button>
              </div>
              <div class="codelab-http-editors">
                <div class="codelab-http-editor-group">
                  <label for="cl-http-headers" class="codelab-label">Headers (Key: Value):</label>
                  <textarea class="codelab-textarea" id="cl-http-headers" rows="2" placeholder="Content-Type: application/json">${escapeHtml(httpState.headers)}</textarea>
                </div>
                <div class="codelab-http-editor-group">
                  <label for="cl-http-body" class="codelab-label">Request Body:</label>
                  <textarea class="codelab-textarea" id="cl-http-body" rows="2" placeholder='{"key":"value"}'>${escapeHtml(httpState.body)}</textarea>
                </div>
              </div>
            </div>
          </div>

          <div class="codelab-panel-section" style="flex:1;display:flex;flex-direction:column;min-height:200px;">
            <div class="codelab-section-title" style="justify-content:space-between;">
              <div style="display:flex;align-items:center;gap:12px;">
                <span>Response Viewer</span>
                <div class="codelab-subtabs" role="tablist">
                  <button type="button" role="tab" class="codelab-subtab ${httpState.activeResponseTab === 'preview' ? 'active' : ''}" data-cl-action="http-tab" data-tab="preview">Preview</button>
                  <button type="button" role="tab" class="codelab-subtab ${httpState.activeResponseTab === 'raw' ? 'active' : ''}" data-cl-action="http-tab" data-tab="raw">Raw / JSON</button>
                  <button type="button" role="tab" class="codelab-subtab ${httpState.activeResponseTab === 'headers' ? 'active' : ''}" data-cl-action="http-tab" data-tab="headers">Headers</button>
                </div>
              </div>
              ${responseHeaderMeta}
            </div>
            <div class="codelab-response-body-wrapper">
              ${responseBodyView}
            </div>
          </div>
        </div>
      `;

      this._bindPortsEvents(bodyEl);
    }

    _bindPortsEvents(bodyEl) {
      if (!bodyEl) return;
      const methodSelect = bodyEl.querySelector('#cl-http-method');
      if (methodSelect) {
        methodSelect.addEventListener('change', e => {
          this.httpClientState.method = e.target.value;
        });
      }
      const urlInput = bodyEl.querySelector('#cl-http-url');
      if (urlInput) {
        urlInput.addEventListener('input', e => {
          this.httpClientState.url = e.target.value;
        });
      }
      const headersArea = bodyEl.querySelector('#cl-http-headers');
      if (headersArea) {
        headersArea.addEventListener('input', e => {
          this.httpClientState.headers = e.target.value;
        });
      }
      const bodyArea = bodyEl.querySelector('#cl-http-body');
      if (bodyArea) {
        bodyArea.addEventListener('input', e => {
          this.httpClientState.body = e.target.value;
        });
      }
    }

    _renderNetworkPanel(bodyEl) {
      if (!bodyEl) return;
      const traces = Array.isArray(this.lastHttpTrace) ? this.lastHttpTrace : [];
      const filter = this.networkFilter;

      const filtered = traces.filter(t => {
        if (filter.method && filter.method !== 'ALL' && (t.method || 'GET').toUpperCase() !== filter.method) return false;
        if (filter.status && filter.status !== 'ALL') {
          const s = Number(t.status || 0);
          if (filter.status === '2xx' && (s < 200 || s >= 300)) return false;
          if (filter.status === '3xx' && (s < 300 || s >= 400)) return false;
          if (filter.status === '4xx' && (s < 400 || s >= 500)) return false;
          if (filter.status === '5xx' && (s < 500 || s >= 600)) return false;
        }
        if (filter.search) {
          const query = filter.search.toLowerCase();
          const urlMatch = String(t.url || '').toLowerCase().includes(query);
          const methodMatch = String(t.method || '').toLowerCase().includes(query);
          const portMatch = String(t.port || '').includes(query);
          if (!urlMatch && !methodMatch && !portMatch) return false;
        }
        return true;
      });

      const selectedTrace = traces.find(t => String(t.id) === String(filter.selectedTraceId)) || null;

      let rowsHtml = '';
      if (filtered.length === 0) {
        rowsHtml = `
          <tr>
            <td colspan="7" style="text-align:center;padding:32px;color:var(--cl-fg-muted);">
              ${traces.length === 0 ? 'No network requests recorded yet. Run a demo, tests, or send an HTTP request to inspect traffic.' : 'No network requests match the active filters.'}
            </td>
          </tr>
        `;
      } else {
        const maxDuration = Math.max(1, ...filtered.map(t => t.durationMs || 1));
        rowsHtml = filtered.map(t => {
          const status = Number(t.status || 200);
          const statusClass = status < 300 ? 'status-2xx' : (status < 400 ? 'status-3xx' : (status < 500 ? 'status-4xx' : 'status-5xx'));
          const widthPct = Math.min(100, Math.max(8, Math.round(((t.durationMs || 1) / maxDuration) * 100)));
          const isSelected = selectedTrace && String(selectedTrace.id) === String(t.id);
          return `
            <tr class="codelab-net-row ${isSelected ? 'selected' : ''}" data-cl-action="select-net-trace" data-trace-id="${escapeHtml(t.id || '')}">
              <td><span class="codelab-status-badge ${statusClass}">${status}</span></td>
              <td><span class="codelab-method-badge codelab-method-${(t.method || 'GET').toLowerCase()}">${escapeHtml(t.method || 'GET')}</span></td>
              <td class="codelab-net-path" title="${escapeHtml(t.url || '/')}">${escapeHtml(t.url || '/')}</td>
              <td><code>${t.port || 3000}</code></td>
              <td style="white-space:nowrap;font-family:var(--cl-font-mono);font-size:11.5px;">${(t.durationMs || 0).toFixed(1)} ms</td>
              <td style="white-space:nowrap;font-family:var(--cl-font-mono);font-size:11.5px;">${t.size != null ? t.size : 0} B</td>
              <td class="codelab-waterfall-cell">
                <div class="codelab-waterfall-track">
                  <div class="codelab-waterfall-bar" style="width:${widthPct}%;"></div>
                </div>
              </td>
            </tr>
          `;
        }).join('');
      }

      let detailHtml = '';
      if (selectedTrace) {
        const reqHeaders = typeof selectedTrace.requestHeaders === 'string'
          ? selectedTrace.requestHeaders
          : JSON.stringify(selectedTrace.requestHeaders || {}, null, 2);
        const resHeaders = typeof selectedTrace.responseHeaders === 'string'
          ? selectedTrace.responseHeaders
          : JSON.stringify(selectedTrace.responseHeaders || {}, null, 2);
        detailHtml = `
          <div class="codelab-net-detail">
            <div class="codelab-net-detail__head">
              <span style="font-weight:600;display:flex;align-items:center;gap:8px;">
                <span class="codelab-method-badge codelab-method-${(selectedTrace.method || 'GET').toLowerCase()}">${escapeHtml(selectedTrace.method || 'GET')}</span>
                <span>${escapeHtml(selectedTrace.url || '/')}</span>
              </span>
              <button type="button" class="codelab-btn codelab-btn--sm" data-cl-action="close-net-detail">Close</button>
            </div>
            <div class="codelab-net-detail__body">
              <div class="codelab-net-detail__section">
                <div class="codelab-detail-label">General</div>
                <div class="codelab-detail-kv"><strong>URL:</strong> 127.0.0.1:${selectedTrace.port}${escapeHtml(selectedTrace.url || '/')}</div>
                <div class="codelab-detail-kv"><strong>Status:</strong> ${selectedTrace.status} ${escapeHtml(selectedTrace.statusText || '')}</div>
                <div class="codelab-detail-kv"><strong>Duration:</strong> ${(selectedTrace.durationMs || 0).toFixed(2)} ms</div>
                <div class="codelab-detail-kv"><strong>Size:</strong> ${selectedTrace.size || 0} bytes</div>
              </div>
              <div class="codelab-net-detail__section">
                <div class="codelab-detail-label">Request Headers</div>
                <pre class="codelab-detail-pre"><code>${escapeHtml(reqHeaders || '(empty)')}</code></pre>
              </div>
              ${selectedTrace.requestBody ? `
                <div class="codelab-net-detail__section">
                  <div class="codelab-detail-label">Request Body</div>
                  <pre class="codelab-detail-pre"><code>${escapeHtml(selectedTrace.requestBody)}</code></pre>
                </div>
              ` : ''}
              <div class="codelab-net-detail__section">
                <div class="codelab-detail-label">Response Headers</div>
                <pre class="codelab-detail-pre"><code>${escapeHtml(resHeaders || '(empty)')}</code></pre>
              </div>
              <div class="codelab-net-detail__section">
                <div class="codelab-detail-label">Response Body</div>
                <pre class="codelab-detail-pre"><code>${escapeHtml(selectedTrace.formattedBody || selectedTrace.responseBody || '(empty)')}</code></pre>
              </div>
            </div>
          </div>
        `;
      }

      bodyEl.innerHTML = `
        <div class="codelab-network-panel ${selectedTrace ? 'has-detail' : ''}">
          <div class="codelab-net-toolbar">
            <input type="text" class="codelab-input" id="cl-net-search" placeholder="Filter URL or method..." value="${escapeHtml(filter.search)}" aria-label="Filter network traces">
            <select class="codelab-select" id="cl-net-method" aria-label="Filter by method">
              <option value="ALL" ${filter.method === 'ALL' ? 'selected' : ''}>All Methods</option>
              <option value="GET" ${filter.method === 'GET' ? 'selected' : ''}>GET</option>
              <option value="POST" ${filter.method === 'POST' ? 'selected' : ''}>POST</option>
              <option value="PUT" ${filter.method === 'PUT' ? 'selected' : ''}>PUT</option>
              <option value="DELETE" ${filter.method === 'DELETE' ? 'selected' : ''}>DELETE</option>
              <option value="PATCH" ${filter.method === 'PATCH' ? 'selected' : ''}>PATCH</option>
            </select>
            <select class="codelab-select" id="cl-net-status" aria-label="Filter by status">
              <option value="ALL" ${filter.status === 'ALL' ? 'selected' : ''}>All Status</option>
              <option value="2xx" ${filter.status === '2xx' ? 'selected' : ''}>2xx Success</option>
              <option value="3xx" ${filter.status === '3xx' ? 'selected' : ''}>3xx Redirect</option>
              <option value="4xx" ${filter.status === '4xx' ? 'selected' : ''}>4xx Client Error</option>
              <option value="5xx" ${filter.status === '5xx' ? 'selected' : ''}>5xx Server Error</option>
            </select>
            <button type="button" class="codelab-btn" data-cl-action="clear-net-traces">Clear</button>
            <span style="margin-left:auto;font-size:11.5px;color:var(--cl-fg-muted);">${filtered.length} of ${traces.length} requests</span>
          </div>
          <div class="codelab-net-main">
            <div class="codelab-net-table-container">
              <table class="codelab-net-table">
                <thead>
                  <tr>
                    <th style="width:55px;">Status</th>
                    <th style="width:65px;">Method</th>
                    <th>Path</th>
                    <th style="width:60px;">Port</th>
                    <th style="width:75px;">Time</th>
                    <th style="width:70px;">Size</th>
                    <th style="width:140px;">Waterfall</th>
                  </tr>
                </thead>
                <tbody>
                  ${rowsHtml}
                </tbody>
              </table>
            </div>
            ${detailHtml}
          </div>
        </div>
      `;

      this._bindNetworkEvents(bodyEl);
    }

    _bindNetworkEvents(bodyEl) {
      if (!bodyEl) return;
      const searchInput = bodyEl.querySelector('#cl-net-search');
      if (searchInput) {
        searchInput.addEventListener('input', e => {
          this.networkFilter.search = e.target.value;
          this._renderDrawerBody();
        });
      }
      const methodSelect = bodyEl.querySelector('#cl-net-method');
      if (methodSelect) {
        methodSelect.addEventListener('change', e => {
          this.networkFilter.method = e.target.value;
          this._renderDrawerBody();
        });
      }
      const statusSelect = bodyEl.querySelector('#cl-net-status');
      if (statusSelect) {
        statusSelect.addEventListener('change', e => {
          this.networkFilter.status = e.target.value;
          this._renderDrawerBody();
        });
      }
    }

    async dispatchHttpClientRequest() {
      const method = this.httpClientState.method || 'GET';
      let url = this.httpClientState.url || 'http://localhost:3000/';
      const headersRaw = this.httpClientState.headers || '';
      const body = this.httpClientState.body || '';

      this.httpClientState.loading = true;
      this._renderDrawerBody();

      const t0 = typeof performance !== 'undefined' ? performance.now() : Date.now();
      let status = 0;
      let statusText = '';
      let responseHeaders = {};
      let responseBody = '';
      let parsedPort = 3000;
      let reqPath = '/';

      try {
        if (!/^https?:\/\//i.test(url)) {
          url = `http://127.0.0.1:3000${url.startsWith('/') ? '' : '/'}${url}`;
        }
        const parsedUrl = new URL(url);
        parsedPort = Number(parsedUrl.port || (parsedUrl.protocol === 'https:' ? 443 : 80));
        reqPath = parsedUrl.pathname + (parsedUrl.search || '');

        const reqHeaders = {};
        for (const line of headersRaw.split('\n')) {
          const idx = line.indexOf(':');
          if (idx > 0) {
            const k = line.slice(0, idx).trim();
            const v = line.slice(idx + 1).trim();
            if (k) reqHeaders[k] = v;
          }
        }

        const init = {
          method,
          headers: reqHeaders
        };
        if (['POST', 'PUT', 'PATCH'].includes(method) && body) {
          init.body = body;
        }

        let response = null;
        if (this.portTable && typeof this.portTable.dispatchRequest === 'function') {
          response = await this.portTable.dispatchRequest(url, init);
        } else {
          const err = new Error(`connect ECONNREFUSED 127.0.0.1:${parsedPort}`);
          err.code = 'ECONNREFUSED';
          throw err;
        }

        status = response.status;
        statusText = response.statusText || (status >= 200 && status < 300 ? 'OK' : 'Error');
        if (response.headers && typeof response.headers.forEach === 'function') {
          response.headers.forEach((v, k) => { responseHeaders[k] = v; });
        } else if (response.headers) {
          responseHeaders = { ...response.headers };
        }
        responseBody = await response.text();
      } catch (err) {
        status = 502;
        statusText = 'Bad Gateway / Connection Refused';
        responseBody = String(err.message || err);
        responseHeaders = { 'content-type': 'text/plain' };
      }

      const durationMs = Math.max(0.1, (typeof performance !== 'undefined' ? performance.now() : Date.now()) - t0);
      const size = responseBody.length;

      let formattedBody = responseBody;
      try {
        const parsed = JSON.parse(responseBody);
        formattedBody = JSON.stringify(parsed, null, 2);
      } catch (_) {}

      const traceId = 'trace_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6);
      const traceItem = {
        id: traceId,
        timestamp: new Date().toLocaleTimeString(),
        method,
        url: reqPath,
        fullUrl: url,
        port: parsedPort,
        status,
        statusText,
        durationMs,
        size,
        requestHeaders: headersRaw,
        requestBody: body,
        responseHeaders,
        responseBody,
        formattedBody
      };

      if (!Array.isArray(this.lastHttpTrace)) {
        this.lastHttpTrace = [];
      }
      this.lastHttpTrace.push(traceItem);

      this.httpClientState.lastResponse = {
        status,
        statusText,
        durationMs,
        size,
        headers: responseHeaders,
        body: responseBody,
        formattedBody
      };
      this.httpClientState.loading = false;
      this._renderDrawerBody();
    }

    _syncVfsSnapshot(fsSnapshot) {
      let changed = false;

      // 1. Sync from this.shell.vfs if available
      if (this.shell && this.shell.vfs && this.shell.vfs.files instanceof Map) {
        const shellWorkspaceFiles = new Map();
        for (const [p, fileObj] of this.shell.vfs.files.entries()) {
          if (p.startsWith('/workspace/')) {
            const rel = p.slice('/workspace/'.length);
            if (rel) {
              const content = typeof fileObj.data === 'string'
                ? fileObj.data
                : (fileObj.data ? (fileObj.data.toString ? fileObj.data.toString('utf8') : String(fileObj.data)) : '');
              shellWorkspaceFiles.set(rel, content);
            }
          }
        }

        // Additions & modifications
        for (const [rel, content] of shellWorkspaceFiles.entries()) {
          if (this.files[rel] === undefined || this.files[rel] !== content) {
            this.files[rel] = content;
            changed = true;
            const parts = rel.split('/');
            let cur = '';
            for (let i = 0; i < parts.length - 1; i++) {
              cur = cur ? `${cur}/${parts[i]}` : parts[i];
              this.folders.add(cur);
            }
            const model = this.models.get(rel);
            if (model && typeof model.getValue === 'function') {
              if (model.getValue() !== content) {
                model.setValue(content);
              }
            } else {
              this._getOrCreateModel(rel);
            }
          }
        }

        // Deletions
        for (const rel of Object.keys(this.files)) {
          if (!shellWorkspaceFiles.has(rel)) {
            delete this.files[rel];
            changed = true;
            const model = this.models.get(rel);
            if (model) {
              model.dispose();
              this.models.delete(rel);
            }
            if (Array.isArray(this.openTabs)) {
              const tabIdx = this.openTabs.indexOf(rel);
              if (tabIdx !== -1) {
                this.openTabs.splice(tabIdx, 1);
                if (this.activeFile === rel) {
                  this.activeFile = this.openTabs[Math.max(0, tabIdx - 1)] || null;
                }
              }
            }
          }
        }
      }

      // 2. Also sync from snapshot array if provided
      if (Array.isArray(fsSnapshot) && fsSnapshot.length > 0) {
        for (const item of fsSnapshot) {
          if (!item || !item.path) continue;
          if (item.path.startsWith('/workspace/')) {
            const rel = item.path.slice('/workspace/'.length);
            if (!rel) continue;
            if (item.isDirectory) {
              this.folders.add(rel);
            } else if (item.content !== undefined || item.preview !== undefined) {
              const content = item.content !== undefined ? item.content : (item.preview || '');
              if (this.files[rel] !== content) {
                this.files[rel] = content;
                changed = true;
                const model = this.models.get(rel);
                if (model && typeof model.getValue === 'function') {
                  if (model.getValue() !== content) model.setValue(content);
                } else {
                  this._getOrCreateModel(rel);
                }
              }
            }
          }
        }
      }

      if (changed) {
        this._saveState();
        this._renderFileLists();
        this._renderTabs();
        this._syncActiveFileToView();
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
      const detail = { labId: this.labId, filename, path: filename, code, content: code };
      this._emitEvent('codelab:change', detail);
      this._emitEvent('codelab:code-change', detail);
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

        if (e.target.classList && (e.target.classList.contains('codelab-palette-backdrop') || e.target.classList.contains('codelab-modal-backdrop'))) {
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
            if (typeof document !== 'undefined' && document.fullscreenElement && document.exitFullscreen) {
              document.exitFullscreen().catch(() => {});
            }
            if (typeof this.onClose === 'function') this.onClose();
            else if (this.isFullscreen) this.toggleFullscreen();
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

    configure({ mode, lang, stepIndex, onClose } = {}) {
      if (typeof onClose === 'function') {
        this.onClose = onClose;
        const rightBar = this.container.querySelector('.codelab-topbar__right');
        if (rightBar && !rightBar.querySelector('#cl-close-ide-btn')) {
          const btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'codelab-btn codelab-btn--icon codelab-btn--close-ide';
          btn.id = 'cl-close-ide-btn';
          btn.setAttribute('data-cl-action', 'close-lab');
          btn.title = this.backLabel || 'Close IDE';
          btn.setAttribute('aria-label', 'Close IDE');
          btn.innerHTML = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';
          rightBar.appendChild(btn);
        }
      }
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
      const fsBtn = this.container.querySelector('#cl-fullscreen-btn');
      if (fsBtn) {
        fsBtn.classList.toggle('active', this.isFullscreen);
        fsBtn.title = this.isFullscreen ? 'Exit Fullscreen (Esc)' : 'Toggle Fullscreen';
      }
      if (typeof document !== 'undefined') {
        const target = this.container.closest('.build-lab-overlay') || shell;
        if (this.isFullscreen && !document.fullscreenElement && target && typeof target.requestFullscreen === 'function') {
          target.requestFullscreen().catch(() => {});
        } else if (!this.isFullscreen && document.fullscreenElement && typeof document.exitFullscreen === 'function') {
          document.exitFullscreen().catch(() => {});
        }
      }
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
              const stepDetail = {
                labId: this.labId,
                step,
                stepId: step.id,
                stepIndex: sIdx,
                index: sIdx,
                completedSteps: Array.from(this.completedSteps)
              };
              this._emitEvent('codelab:step-complete', stepDetail);
              this._emitEvent('codelab:step:pass', stepDetail);
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

    _resolveShellPath(rawPath) {
      if (!rawPath || rawPath === '.') return this.cwd || '/workspace';
      if (rawPath === '~') return '/workspace';
      let p = rawPath.startsWith('/') ? rawPath : `${this.cwd || '/workspace'}/${rawPath}`;
      const parts = p.split('/');
      const stack = [];
      for (const part of parts) {
        if (!part || part === '.') continue;
        if (part === '..') stack.pop();
        else stack.push(part);
      }
      return '/' + stack.join('/');
    }

    _toWorkspaceRelPath(absOrRel) {
      const abs = this._resolveShellPath(absOrRel);
      if (abs === '/workspace') return '';
      if (abs.startsWith('/workspace/')) return abs.slice('/workspace/'.length);
      return abs.replace(/^\/+/, '');
    }

    async _handleReplCommand(cmd) {
      const trimmed = (cmd || '').trim();
      if (!trimmed) return;
      if (this.replHistory[this.replHistory.length - 1] !== trimmed) {
        this.replHistory.push(trimmed);
      }
      this.replHistoryIdx = -1;
      this.terminalLogs.push({ type: 'system', text: `codelab$ ${trimmed}` });

      const parts = trimmed.split(/\s+/);
      const bin = parts[0];
      const args = parts.slice(1);

      if (bin === 'clear' || bin === 'cls') {
        this.terminalLogs = [];
        this._renderDrawerBody();
        return;
      }
      if (bin === 'help') {
        this.terminalLogs.push({
          type: 'stdout',
          text: [
            'Built-in shell & Node commands:',
            '  pwd, ls [-la], cd <dir>      Navigate workspace directory (/workspace)',
            '  cat, head, tail, wc <file>   Inspect file contents & line counts',
            '  touch, mkdir, rm, cp, mv     Create, copy, rename, or remove workspace files',
            '  node <file.js|ts>            Execute any script in the Virtual Node runtime',
            '  npm test | test | run        Run unit test suite or demo workload',
            '  clear (Ctrl+L)               Clear terminal output',
            '  <JS/TS expression>           Evaluate live JS/TS with require() & Node globals'
          ].join('\n')
        });
        this._renderDrawerBody();
        return;
      }
      if (bin === 'pwd') {
        this.terminalLogs.push({ type: 'stdout', text: this.cwd || '/workspace' });
        this._renderDrawerBody();
        return;
      }
      if (bin === 'whoami') {
        this.terminalLogs.push({ type: 'stdout', text: 'codelab' });
        this._renderDrawerBody();
        return;
      }
      if (bin === 'hostname') {
        this.terminalLogs.push({ type: 'stdout', text: 'codelab-vfs' });
        this._renderDrawerBody();
        return;
      }
      if (bin === 'uname') {
        this.terminalLogs.push({ type: 'stdout', text: args.includes('-a') ? 'Linux codelab-vfs 6.6.0-virtual #1 SMP WebWorker x86_64 GNU/Linux' : 'Linux' });
        this._renderDrawerBody();
        return;
      }
      if (bin === 'date') {
        this.terminalLogs.push({ type: 'stdout', text: new Date().toUTCString() });
        this._renderDrawerBody();
        return;
      }
      if (bin === 'env' || bin === 'printenv') {
        this.terminalLogs.push({
          type: 'stdout',
          text: `NODE_ENV=development\nPWD=${this.cwd || '/workspace'}\nHOME=/workspace\nUSER=codelab\nPATH=/usr/local/bin:/usr/bin:/bin`
        });
        this._renderDrawerBody();
        return;
      }
      if (bin === 'which') {
        const target = args[0] || '';
        const known = ['node', 'npm', 'ls', 'cat', 'pwd', 'cd', 'mkdir', 'touch', 'rm', 'cp', 'mv', 'echo', 'clear'];
        this.terminalLogs.push({
          type: known.includes(target) ? 'stdout' : 'stderr',
          text: known.includes(target) ? `/usr/local/bin/${target}` : `${target} not found`
        });
        this._renderDrawerBody();
        return;
      }
      if (bin === 'echo') {
        const raw = trimmed.slice(4).trim().replace(/^(['"])(.*)\1$/, '$2');
        this.terminalLogs.push({ type: 'stdout', text: raw });
        this._renderDrawerBody();
        return;
      }
      if (bin === 'cd') {
        const target = args[0] || '/workspace';
        const resolved = this._resolveShellPath(target);
        if (resolved === '/workspace' || resolved === '/tmp') {
          this.cwd = resolved;
        } else if (resolved.startsWith('/workspace/')) {
          const rel = resolved.slice('/workspace/'.length);
          const existsDir = this.folders.has(rel) || Object.keys(this.files).some(f => f.startsWith(rel + '/'));
          if (existsDir) {
            this.cwd = resolved;
          } else {
            this.terminalLogs.push({ type: 'stderr', text: `cd: no such file or directory: ${target}` });
          }
        } else {
          this.terminalLogs.push({ type: 'stderr', text: `cd: no such file or directory: ${target}` });
        }
        this._renderDrawerBody();
        return;
      }
      if (bin === 'ls' || bin === 'll' || bin === 'la') {
        const flags = args.filter(a => a.startsWith('-')).join('');
        const isLong = bin === 'll' || flags.includes('l');
        const pathArg = args.find(a => !a.startsWith('-')) || '.';
        const resolved = this._resolveShellPath(pathArg);
        const prefix = resolved === '/workspace' ? '' : (resolved.startsWith('/workspace/') ? resolved.slice('/workspace/'.length) + '/' : null);
        const entries = new Map();
        if (prefix !== null) {
          for (const folder of this.folders) {
            if (prefix === '' && !folder.includes('/')) entries.set(folder + '/', { isDir: true, size: 0 });
            else if (prefix && folder.startsWith(prefix)) {
              const rest = folder.slice(prefix.length);
              if (rest && !rest.includes('/')) entries.set(rest + '/', { isDir: true, size: 0 });
            }
          }
          for (const [k, content] of Object.entries(this.files)) {
            if (prefix === '' || k.startsWith(prefix)) {
              const rest = prefix === '' ? k : k.slice(prefix.length);
              if (!rest) continue;
              if (rest.includes('/')) {
                const topDir = rest.split('/')[0] + '/';
                if (!entries.has(topDir)) entries.set(topDir, { isDir: true, size: 0 });
              } else {
                entries.set(rest, { isDir: false, size: (content || '').length });
              }
            }
          }
        } else if (resolved === '/tmp' || resolved.startsWith('/tmp/')) {
          for (const snap of this.lastFsSnapshot) {
            if (snap.path.startsWith('/tmp/')) {
              entries.set(snap.path.slice('/tmp/'.length), { isDir: !!snap.isDirectory, size: snap.size || 0 });
            }
          }
        }
        const names = Array.from(entries.keys()).sort();
        if (names.length === 0) {
          this.terminalLogs.push({ type: 'stdout', text: '(empty)' });
        } else if (isLong) {
          const lines = names.map(n => {
            const info = entries.get(n);
            const perm = info.isDir ? 'drwxr-xr-x' : '-rw-r--r--';
            return `${perm}  1 codelab  staff  ${String(info.size).padStart(6, ' ')}  ${n}`;
          });
          this.terminalLogs.push({ type: 'stdout', text: lines.join('\n') });
        } else {
          this.terminalLogs.push({ type: 'stdout', text: names.join('  ') });
        }
        this._renderDrawerBody();
        return;
      }
      if (bin === 'cat' || bin === 'head' || bin === 'tail' || bin === 'wc') {
        const fileArgs = args.filter(a => !a.startsWith('-'));
        const target = fileArgs[0];
        if (!target) {
          this.terminalLogs.push({ type: 'stderr', text: `${bin}: missing file operand` });
          this._renderDrawerBody();
          return;
        }
        const rel = this._toWorkspaceRelPath(target);
        let text = this.files[rel] != null ? this.files[rel] : this.files[target];
        if (text == null) {
          const snap = this.lastFsSnapshot.find(f => f.path === target || f.path.endsWith('/' + target));
          if (snap) text = snap.preview || snap.hexPreview || `(${snap.size} bytes)`;
        }
        if (text == null) {
          this.terminalLogs.push({ type: 'stderr', text: `${bin}: ${target}: No such file or directory` });
        } else if (bin === 'wc') {
          const lines = text.split('\n').length;
          const words = text.trim() ? text.trim().split(/\s+/).length : 0;
          const bytes = text.length;
          this.terminalLogs.push({ type: 'stdout', text: `  ${lines}  ${words}  ${bytes} ${target}` });
        } else if (bin === 'head') {
          this.terminalLogs.push({ type: 'stdout', text: text.split('\n').slice(0, 10).join('\n') });
        } else if (bin === 'tail') {
          this.terminalLogs.push({ type: 'stdout', text: text.split('\n').slice(-10).join('\n') });
        } else {
          this.terminalLogs.push({ type: 'stdout', text });
        }
        this._renderDrawerBody();
        return;
      }
      if (bin === 'touch') {
        const target = args[0];
        if (target) {
          const rel = this._toWorkspaceRelPath(target);
          if (this.files[rel] === undefined) this.createFile(rel);
        }
        this._renderDrawerBody();
        return;
      }
      if (bin === 'mkdir') {
        const target = args.find(a => !a.startsWith('-'));
        if (target) {
          const rel = this._toWorkspaceRelPath(target);
          if (rel) this.createFolder(rel);
        }
        this._renderDrawerBody();
        return;
      }
      if (bin === 'rm') {
        const targets = args.filter(a => !a.startsWith('-'));
        for (const t of targets) {
          const rel = this._toWorkspaceRelPath(t);
          if (this.files[rel] !== undefined) {
            this.deleteFile(rel);
          } else if (this.folders.has(rel)) {
            this.deleteFolder(rel);
          } else {
            this.terminalLogs.push({ type: 'stderr', text: `rm: ${t}: No such file or directory` });
          }
        }
        this._renderDrawerBody();
        return;
      }
      if (bin === 'cp' && args.length >= 2) {
        const src = this._toWorkspaceRelPath(args[0]);
        const dst = this._toWorkspaceRelPath(args[1]);
        if (this.files[src] !== undefined) {
          this.setFile(dst, this.files[src], { open: false });
        } else {
          this.terminalLogs.push({ type: 'stderr', text: `cp: ${args[0]}: No such file` });
        }
        this._renderDrawerBody();
        return;
      }
      if (bin === 'mv' && args.length >= 2) {
        const src = this._toWorkspaceRelPath(args[0]);
        const dst = this._toWorkspaceRelPath(args[1]);
        if (!this.renameFile(src, dst)) {
          this.terminalLogs.push({ type: 'stderr', text: `mv: cannot move '${args[0]}' to '${args[1]}'` });
        }
        this._renderDrawerBody();
        return;
      }
      if (trimmed === 'run' || trimmed === 'npm start' || trimmed === 'npm run demo' || /^node\s+\S*demo\.(js|ts)$/.test(trimmed)) {
        await this.runDemo();
        return;
      }
      if (trimmed === 'test' || trimmed === 'npm test' || trimmed === 'npm t' || /^node\s+\S*test\.(js|ts)$/.test(trimmed)) {
        await this.runTests();
        return;
      }
      if (bin === 'node') {
        if (args[0] === '-v' || args[0] === '--version') {
          this.terminalLogs.push({ type: 'stdout', text: 'v22.0.0' });
          this._renderDrawerBody();
          return;
        }
        if (args[0] === '-e' || args[0] === '--eval') {
          const evalCode = trimmed.replace(/^node\s+(-e|--eval)\s+/, '').replace(/^(['"])([\s\S]*)\1$/, '$2');
          return this._handleReplCommand(evalCode);
        }
        if (args[0]) {
          const rel = this._toWorkspaceRelPath(args[0]);
          const entryFile = this.files[rel] !== undefined ? rel : (this.files[args[0]] !== undefined ? args[0] : null);
          if (!entryFile) {
            this.terminalLogs.push({ type: 'stderr', text: `node: Cannot find module '/workspace/${rel || args[0]}'` });
            this._renderDrawerBody();
            return;
          }
          const res = await this._executeRuntime({
            files: { ...this.files },
            entry: entryFile,
            mode: 'run'
          });
          if (res.stdout) this.terminalLogs.push({ type: 'stdout', text: res.stdout.replace(/\n$/, '') });
          if (res.stderr) this.terminalLogs.push({ type: 'stderr', text: res.stderr.replace(/\n$/, '') });
          if (res.error) this.terminalLogs.push({ type: 'stderr', text: formatErrorText(res.error) });
          this.lastFsSnapshot = res.fsSnapshot || [];
          this.lastHttpTrace = res.httpTrace || [];
          this._renderDrawerBody();
          return;
        }
      }

      // Evaluate arbitrary JS/TS expression in the Virtual Runtime
      try {
        const res = await this._executeRuntime({
          files: { ...this.files },
          mode: 'repl',
          replCode: trimmed
        });
        const cleanStdout = res.stdout ? res.stdout.replace(/\n$/, '') : '';
        if (cleanStdout) {
          this.terminalLogs.push({ type: 'stdout', text: cleanStdout });
        }
        if (res.stderr) {
          this.terminalLogs.push({ type: 'stderr', text: res.stderr.replace(/\n$/, '') });
        }
        if (res.replValue !== undefined && cleanStdout !== String(res.replValue)) {
          this.terminalLogs.push({ type: 'success', text: `→ ${res.replValue}` });
        }
        if (res.error) {
          const errStr = formatErrorText(res.error);
          if (/^[a-zA-Z0-9_-]+$/.test(trimmed) && errStr.includes(`ReferenceError: ${trimmed} is not defined`)) {
            this.terminalLogs.push({ type: 'stderr', text: `codelab: ${trimmed}: command not found (type "help" for commands or enter a JS/TS expression)` });
          } else {
            this.terminalLogs.push({ type: 'stderr', text: errStr });
          }
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
      CodeLabShell: CodeLabShell,
      CodeLabTerminal: CodeLabTerminal,
      createPosixShell: CodeLabShell ? CodeLabShell.createPosixShell : null,
      createTerminal: CodeLabTerminal ? CodeLabTerminal.createTerminal : null,
      PTYTerminalEngine: CodeLabTerminal ? CodeLabTerminal.PTYTerminalEngine : null,
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
