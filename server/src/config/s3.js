const fs = require('fs');
const path = require('path');
const {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

// Directory for local file storage fallback (used when AWS keys are absent)
const LOCAL_UPLOADS_DIR = path.join(__dirname, '../../uploads');

const isAwsConfigured = () => {
  return (
    process.env.AWS_ACCESS_KEY_ID &&
    process.env.AWS_SECRET_ACCESS_KEY &&
    process.env.AWS_S3_BUCKET_NAME
  );
};

// S3 Client (only used if AWS credentials are provided in .env)
const s3Client = isAwsConfigured()
  ? new S3Client({
      region: process.env.AWS_REGION || 'ap-south-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    })
  : null;

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Upload a file buffer.
 * If AWS credentials exist, uploads to private S3 bucket.
 * Otherwise, saves locally to server/uploads/ with zero external dependencies/costs.
 */
const uploadToS3 = async (fileBuffer, key, contentType) => {
  if (isAwsConfigured()) {
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: fileBuffer,
      ContentType: contentType,
    });
    await s3Client.send(command);
    return key;
  }

  // Local fallback: save to disk
  const targetPath = path.join(LOCAL_UPLOADS_DIR, key);
  const targetDir = path.dirname(targetPath);
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }
  fs.writeFileSync(targetPath, fileBuffer);
  return key;
};

/**
 * Generate a secure view URL for a resume.
 * If AWS credentials exist, returns 15-min presigned S3 URL.
 * Otherwise, returns the local API streaming endpoint URL.
 */
const getPresignedUrl = async (key, expiresInSeconds = 900) => {
  if (isAwsConfigured()) {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });
    return await getSignedUrl(s3Client, command, {
      expiresIn: expiresInSeconds,
    });
  }

  // Local fallback: returns local streaming URL
  return `/api/applications/download-resume/${encodeURIComponent(key)}`;
};

/**
 * Delete an object.
 * Used for rollback when a MongoDB save fails after upload.
 */
const deleteS3Object = async (key) => {
  if (isAwsConfigured()) {
    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });
    await s3Client.send(command);
    return;
  }

  // Local fallback: remove file if exists
  const targetPath = path.join(LOCAL_UPLOADS_DIR, key);
  if (fs.existsSync(targetPath)) {
    fs.unlinkSync(targetPath);
  }
};

module.exports = {
  s3Client,
  uploadToS3,
  getPresignedUrl,
  deleteS3Object,
  isAwsConfigured,
  LOCAL_UPLOADS_DIR,
};
