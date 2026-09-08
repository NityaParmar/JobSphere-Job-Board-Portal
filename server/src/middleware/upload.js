const multer = require('multer');
const ApiError = require('../utils/ApiError');

/**
 * Multer configuration for resume uploads.
 *
 * - Uses memoryStorage: file is held in a Buffer (req.file.buffer), NEVER saved to disk.
 * - Strictly validates file types: ONLY .pdf files are accepted.
 * - Enforces a 5MB file size limit.
 */

// File filter: accept only PDF files
const fileFilter = (_req, file, cb) => {
  // Check both MIME type and extension for defense in depth
  const isPdfMime = file.mimetype === 'application/pdf';
  const isPdfExt = file.originalname.toLowerCase().endsWith('.pdf');

  if (isPdfMime && isPdfExt) {
    cb(null, true);
  } else {
    cb(
      ApiError.badRequest(
        'Invalid file type. Only PDF files (.pdf) are accepted for resume uploads.'
      ),
      false
    );
  }
};

const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB
    files: 1,                   // Only 1 file per request
  },
});

module.exports = upload;
