import { extractTextFromPdf } from '../services/pdfExtractor.js';

/**
 * Formats a byte count into a human-readable string.
 * @param {number} bytes
 * @returns {string}
 */
const formatSize = (bytes) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

/**
 * POST /api/resumes/upload
 * Accepts a validated PDF buffer (passed through uploadSingleResume middleware),
 * extracts plain text, and returns metadata + extracted content.
 */
export const uploadResume = async (req, res, next) => {
  try {
    // 1. Verify that a file was parsed by Multer
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Please provide a resume PDF file in the "resume" field.',
          code: 'FILE_MISSING',
        },
      });
    }

    const { originalname, mimetype, size, buffer } = req.file;

    // 2. Extract text from the PDF buffer
    let extraction;
    try {
      extraction = await extractTextFromPdf(buffer);
    } catch (parseError) {
      return res.status(422).json({
        success: false,
        error: {
          message: 'Failed to extract text from the uploaded PDF. The file may be corrupt, password-protected, or image-only.',
          code: 'PDF_PARSE_ERROR',
        },
      });
    }

    // 3. Build and return the combined metadata + extraction result
    const resumeData = {
      // File metadata
      fileName: originalname,
      mimeType: mimetype,
      fileSizeBytes: size,
      fileSizeFormatted: formatSize(size),
      uploadedBy: req.user.id,
      uploadedAt: new Date().toISOString(),
      status: 'extracted',

      // Extraction results
      extraction: {
        text: extraction.text,
        wordCount: extraction.wordCount,
        charCount: extraction.charCount,
        pageCount: extraction.pageCount,
        pdfVersion: extraction.pdfVersion,
      },
    };

    return res.status(201).json({
      success: true,
      message: 'Resume PDF uploaded and text extracted successfully.',
      data: {
        resume: resumeData,
      },
    });
  } catch (error) {
    next(error);
  }
};

export default {
  uploadResume,
};
