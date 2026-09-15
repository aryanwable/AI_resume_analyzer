import { PDFParse } from 'pdf-parse';

/**
 * Extracts plain text and basic metadata from an in-memory PDF buffer.
 *
 * Uses pdf-parse v2 (PDFParse class API):
 *   - Pass the buffer as { data: Uint8Array } in the constructor options.
 *   - Call getText() which returns a TextResult with `.text` and `.total` (pages).
 *   - Call getInfo() for PDF metadata (version, author, etc.).
 *   - Always destroy() the parser to release pdfjs memory.
 *
 * @param {Buffer} buffer - The PDF file buffer (from Multer memoryStorage).
 * @returns {Promise<{
 *   text: string,
 *   wordCount: number,
 *   charCount: number,
 *   pageCount: number,
 *   pdfVersion: string,
 *   info: object
 * }>}
 */
export const extractTextFromPdf = async (buffer) => {
  // pdf-parse v2 requires Uint8Array (not Buffer) passed as the `data` option
  const uint8 = new Uint8Array(buffer);
  const parser = new PDFParse({ data: uint8 });

  try {
    // Extract page text
    const textResult = await parser.getText();

    // Extract document metadata (info, outline, etc.)
    // Re-create parser since the underlying doc is shared per instance
    const infoParser = new PDFParse({ data: uint8 });
    let infoResult = {};
    try {
      infoResult = await infoParser.getInfo();
    } catch {
      // Non-fatal — metadata extraction failures should not block text extraction
    } finally {
      await infoParser.destroy();
    }

    const rawText = textResult.text || '';

    // Normalise whitespace for cleaner downstream processing
    const text = rawText
      .replace(/\r\n/g, '\n')      // normalise line endings
      .replace(/[ \t]+/g, ' ')     // collapse horizontal whitespace
      .replace(/\n{3,}/g, '\n\n')  // collapse 3+ blank lines to two
      .trim();

    // Word count: split on whitespace, filter empty tokens
    const wordCount = text.split(/\s+/).filter(Boolean).length;
    const charCount = text.length;

    return {
      text,
      wordCount,
      charCount,
      pageCount: textResult.total ?? 0,
      pdfVersion: infoResult?.info?.PDFFormatVersion ?? 'unknown',
      info: infoResult?.info ?? {},
    };
  } finally {
    await parser.destroy();
  }
};

export default { extractTextFromPdf };
