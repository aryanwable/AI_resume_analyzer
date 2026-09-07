import multer from 'multer';
import config from '../config/environment.js';
import { validatePdfBuffer } from '../utils/pdfValidator.js';

// Memory storage keeps file buffer in RAM for in-memory PDF text extraction
const storage = multer.memoryStorage();

const maxSizeBytes = config.maxFileSizeMb * 1024 * 1024;

/**
 * Filter to strictly accept only PDF file uploads
 */
const fileFilter = (req, file, cb) => {
  const isPdfMime = file.mimetype === 'application/pdf';
  const isPdfExtension = file.originalname.toLowerCase().endsWith('.pdf');

  if (isPdfMime || isPdfExtension) {
    cb(null, true);
  } else {
    const error = new Error('Invalid file type. Only PDF documents (.pdf) are allowed.');
    error.code = 'INVALID_FILE_TYPE';
    error.statusCode = 400;
    cb(error, false);
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: maxSizeBytes,
    files: 1, // Single file per upload
  },
  fileFilter,
});

/**
 * Middleware wrapper for single resume file upload with error handling.
 *
 * Pipeline:
 *   1. Multer parses the multipart stream (enforces MIME filter & size limit).
 *   2. Post-parse validation checks the buffer's magic bytes and minimum size.
 *   3. On success, control passes to the next middleware / controller.
 */
export const uploadSingleResume = (req, res, next) => {
  const uploadHandler = upload.single('resume');

  uploadHandler(req, res, (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          error: {
            message: `File size exceeds the ${config.maxFileSizeMb}MB limit.`,
            code: 'FILE_TOO_LARGE',
          },
        });
      }

      if (err.code === 'INVALID_FILE_TYPE') {
        return res.status(400).json({
          success: false,
          error: {
            message: err.message || 'Only PDF documents (.pdf) are allowed.',
            code: 'INVALID_FILE_TYPE',
          },
        });
      }

      return res.status(400).json({
        success: false,
        error: {
          message: err.message || 'File upload error',
          code: 'UPLOAD_ERROR',
        },
      });
    }

    // --- Post-Multer buffer validation (magic bytes + min size) ---
    if (req.file && req.file.buffer) {
      const validation = validatePdfBuffer(req.file.buffer);
      if (!validation.valid) {
        return res.status(400).json({
          success: false,
          error: {
            message: validation.message,
            code: validation.code,
          },
        });
      }
    }

    next();
  });
};

export default {
  uploadSingleResume,
};

