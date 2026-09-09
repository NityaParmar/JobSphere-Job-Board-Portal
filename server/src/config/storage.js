const { createClient } = require('@supabase/supabase-js');

// ---------------------------------------------------------------------------
// Supabase Client Initialization
// ---------------------------------------------------------------------------

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_SECRET_KEY ||
  process.env.SUPABASE_KEY;

let supabaseInstance = null;

if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
  supabaseInstance = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });
} else {
  console.warn(
    '[Storage] Warning: Missing Supabase environment variables (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY). File storage features will remain inactive until configured.'
  );
}

/**
 * Returns active Supabase client or initializes dynamically if env vars were added
 */
const getClient = () => {
  if (supabaseInstance) return supabaseInstance;

  const url = process.env.SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SECRET_KEY ||
    process.env.SUPABASE_KEY;

  if (url && key) {
    supabaseInstance = createClient(url, key, {
      auth: { persistSession: false },
    });
    return supabaseInstance;
  }

  throw new Error(
    'Supabase Storage is not configured. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in environment variables.'
  );
};

const BUCKET_NAME = process.env.SUPABASE_BUCKET_NAME || 'resumes';

// ---------------------------------------------------------------------------
// Storage Operation Helpers
// ---------------------------------------------------------------------------

/**
 * Upload a file buffer to Supabase Storage.
 *
 * @param {Buffer} fileBuffer - The file content
 * @param {string} filePath - The storage path within the bucket
 * @param {string} contentType - MIME type of the file
 * @returns {Promise<string>} The stored file path (private bucket)
 */
const uploadToStorage = async (fileBuffer, filePath, contentType) => {
  const client = getClient();
  const { data, error } = await client.storage
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
  const client = getClient();
  const { data, error } = await client.storage
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
  const client = getClient();
  const { error } = await client.storage
    .from(BUCKET_NAME)
    .remove([filePath]);

  if (error) {
    throw new Error(`Supabase Storage delete failed: ${error.message}`);
  }
};

module.exports = {
  get supabase() {
    return getClient();
  },
  uploadToStorage,
  getSignedUrl,
  deleteStorageObject,
};
