import config from '../config/environment.js';

/**
 * PDF magic bytes — every valid PDF starts with "%PDF-"
 */
const PDF_MAGIC_BYTES = Buffer.from('%PDF-');

/**
 * Validate that a file buffer is a genuine PDF with adequate size.
 *
 * Checks performed (in order):
 *   1. Minimum file size — rejects empty or trivially small buffers.
 *   2. Magic-byte header — the first 5 bytes must be "%PDF-".
 *
 * @param {Buffer} buffer – The in-memory file buffer from Multer.
 * @returns {{ valid: true } | { valid: false, code: string, message: string }}
 */
export const validatePdfBuffer = (buffer) => {
  // --- 1. Minimum size check ---
  const minBytes = config.minFileSizeBytes;
  if (!buffer || buffer.length < minBytes) {
    return {
      valid: false,
      code: 'FILE_TOO_SMALL',
      message: `File is too small (${buffer ? buffer.length : 0} bytes). Minimum accepted size is ${minBytes} bytes.`,
    };
  }

  // --- 2. Magic-byte header check ---
  const header = buffer.subarray(0, PDF_MAGIC_BYTES.length);
  if (!header.equals(PDF_MAGIC_BYTES)) {
    return {
      valid: false,
      code: 'INVALID_MAGIC_BYTES',
      message:
        'File does not appear to be a valid PDF. The file header does not match the PDF specification (%PDF-).',
    };
  }

  return { valid: true };
};

export default { validatePdfBuffer };
