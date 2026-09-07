/**
 * Controller to handle resume PDF uploads (POST /api/resumes/upload)
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

    const formatSize = (bytes) => {
      if (bytes < 1024) return `${bytes} B`;
      if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
      return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    };

    const resumeMetadata = {
      fileName: originalname,
      mimeType: mimetype,
      fileSizeBytes: size,
      fileSizeFormatted: formatSize(size),
      uploadedBy: req.user.id,
      uploadedAt: new Date().toISOString(),
      bufferSize: buffer.length,
      status: 'uploaded',
    };

    return res.status(201).json({
      success: true,
      message: 'Resume PDF uploaded successfully and held in memory for processing.',
      data: {
        resume: resumeMetadata,
      },
    });
  } catch (error) {
    next(error);
  }
};

export default {
  uploadResume,
};
