/**
 * Postings List Compression Primitives
 * 
 * Inverted indexes contain billions of document IDs. Storing raw 32-bit integers
 * is prohibitive. Search engines use a two-phase compression pipeline:
 * 
 * 1. Delta (Gap) Encoding: Since document IDs in a postings list are strictly sorted
 *    ([1000, 1004, 1008, 1020]), storing differences ([1000, 4, 4, 12]) reduces magnitudes.
 * 2. Variable Byte (VByte) Encoding: Encodes small integers into fewer bytes.
 *    Values < 128 consume 1 byte instead of 4 bytes (75% immediate space reduction).
 */

/**
 * Compute delta gaps between consecutive sorted numbers.
 * Example: [100, 105, 112] -> [100, 5, 7]
 */
function deltaEncode(sortedArray) {
  if (!sortedArray || sortedArray.length === 0) return [];
  const deltas = [sortedArray[0]];
  for (let i = 1; i < sortedArray.length; i++) {
    deltas.push(sortedArray[i] - sortedArray[i - 1]);
  }
  return deltas;
}

/**
 * Reconstruct original sorted numbers from delta gaps.
 * Example: [100, 5, 7] -> [100, 105, 112]
 */
function deltaDecode(deltas) {
  if (!deltas || deltas.length === 0) return [];
  const result = [deltas[0]];
  for (let i = 1; i < deltas.length; i++) {
    result.push(result[i - 1] + deltas[i]);
  }
  return result;
}

/**
 * Variable-Byte (VByte) Encode an array of non-negative integers.
 * Uses 7 payload bits per byte; bit 8 (MSB) is 1 for the termination byte of the number.
 */
function vbyteEncode(numbers) {
  const bytes = [];

  for (let num of numbers) {
    if (num < 0) throw new Error('VByte encoding only supports non-negative integers');
    const numBytes = [];

    // Extract 7-bit chunks from lowest to highest
    numBytes.push((num & 0x7F) | 0x80); // Mark lowest byte with MSB = 1 (terminal byte)
    num = Math.floor(num / 128);

    while (num > 0) {
      numBytes.push(num & 0x7F); // MSB = 0 indicates continuation
      num = Math.floor(num / 128);
    }

    // Push bytes in big-endian order
    for (let i = numBytes.length - 1; i >= 0; i--) {
      bytes.push(numBytes[i]);
    }
  }

  return Buffer.from(bytes);
}

/**
 * Variable-Byte (VByte) Decode a Buffer or Uint8Array back to integers.
 */
function vbyteDecode(buffer) {
  const numbers = [];
  let currentNum = 0;

  for (let i = 0; i < buffer.length; i++) {
    const b = buffer[i];
    if ((b & 0x80) === 0) {
      // Continuation byte
      currentNum = currentNum * 128 + b;
    } else {
      // Terminal byte (MSB is set)
      currentNum = currentNum * 128 + (b & 0x7F);
      numbers.push(currentNum);
      currentNum = 0;
    }
  }

  return numbers;
}

/**
 * Compare raw 32-bit integer storage vs Delta + VByte compressed representation
 */
function benchmarkCompression(sortedDocIds) {
  const rawBytes = sortedDocIds.length * 4; // 32-bit uints = 4 bytes each
  const deltas = deltaEncode(sortedDocIds);
  const compressedBuffer = vbyteEncode(deltas);
  const compressedBytes = compressedBuffer.length;
  const ratio = ((1 - (compressedBytes / rawBytes)) * 100).toFixed(1);

  return {
    docCount: sortedDocIds.length,
    rawBytes,
    compressedBytes,
    savingsPercent: `${ratio}%`,
    compressedBuffer
  };
}

module.exports = {
  deltaEncode,
  deltaDecode,
  vbyteEncode,
  vbyteDecode,
  benchmarkCompression
};
