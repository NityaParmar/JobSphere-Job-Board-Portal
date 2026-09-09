const { createClient } = require('@supabase/supabase-js');

// ---------------------------------------------------------------------------
// Supabase Client Initialization
// ---------------------------------------------------------------------------

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error(
    '[Boot] Missing required Supabase environment variables: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY'
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const BUCKET_NAME = 'resumes';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Upload a file buffer to Supabase Storage.
 *
 * @param {Buffer} fileBuffer - The file content
 * @param {string} filePath - The storage path within the bucket
 * @param {string} contentType - MIME type of the file
 * @returns {Promise<string>} The stored file path (NOT a public URL — bucket is private)
 */
const uploadToStorage = async (fileBuffer, filePath, contentType) => {
  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(filePath, fileBuffer, {
      contentType,
      upsert: false,
    });

  if (error) {
    throw new Error(`Supabase Storage upload failed: ${error.message}`);
  }

  return data.path;
};

/**
 * Generate a time-limited signed URL for reading a private storage object.
 * URL expires after the specified duration.
 *
 * @param {string} filePath - The storage file path
 * @param {number} expiresInSeconds - URL validity duration (default: 900 = 15 minutes)
 * @returns {Promise<string>} Signed GET URL
 */
const getSignedUrl = async (filePath, expiresInSeconds = 900) => {
  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .createSignedUrl(filePath, expiresInSeconds);

  if (error) {
    throw new Error(`Supabase signed URL generation failed: ${error.message}`);
  }

  return data.signedUrl;
};

/**
 * Delete an object from Supabase Storage.
 * Used for rollback when a MongoDB save fails after a successful upload.
 *
 * @param {string} filePath - The storage file path to delete
 * @returns {Promise<void>}
 */
const deleteStorageObject = async (filePath) => {
  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .remove([filePath]);

  if (error) {
    throw new Error(`Supabase Storage delete failed: ${error.message}`);
  }
};

module.exports = {
  supabase,
  uploadToStorage,
  getSignedUrl,
  deleteStorageObject,
};
