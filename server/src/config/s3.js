const {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

// ---------------------------------------------------------------------------
// S3 Client Initialization
// ---------------------------------------------------------------------------

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'ap-south-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Upload a file buffer to S3.
 *
 * @param {Buffer} fileBuffer - The file content
 * @param {string} key - The S3 object key (path within the bucket)
 * @param {string} contentType - MIME type of the file
 * @returns {Promise<string>} The S3 object key (NOT a public URL — bucket is private)
 */
const uploadToS3 = async (fileBuffer, key, contentType) => {
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    Body: fileBuffer,
    ContentType: contentType,
    // No ACL — bucket is private by default
  });

  await s3Client.send(command);
  return key;
};

/**
 * Generate a pre-signed URL for reading a private S3 object.
 * URL expires after the specified duration.
 *
 * @param {string} key - The S3 object key
 * @param {number} expiresInSeconds - URL validity duration (default: 900 = 15 minutes)
 * @returns {Promise<string>} Pre-signed GET URL
 */
const getPresignedUrl = async (key, expiresInSeconds = 900) => {
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });

  const url = await getSignedUrl(s3Client, command, {
    expiresIn: expiresInSeconds,
  });

  return url;
};

/**
 * Delete an object from S3.
 * Used for rollback when a MongoDB save fails after a successful upload.
 *
 * @param {string} key - The S3 object key to delete
 * @returns {Promise<void>}
 */
const deleteS3Object = async (key) => {
  const command = new DeleteObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });

  await s3Client.send(command);
};

module.exports = {
  s3Client,
  uploadToS3,
  getPresignedUrl,
  deleteS3Object,
};
