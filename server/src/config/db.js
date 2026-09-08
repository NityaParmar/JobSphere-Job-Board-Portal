const mongoose = require('mongoose');

/**
 * Connect to MongoDB with retry logic.
 * Retries up to MAX_RETRIES times with exponential backoff before exiting.
 */
const MAX_RETRIES = 5;
const BASE_DELAY_MS = 3000;

const connectDB = async () => {
  let retries = 0;

  while (retries < MAX_RETRIES) {
    try {
      const conn = await mongoose.connect(process.env.MONGO_URI, {
        // Mongoose 8 uses the new driver defaults; these are explicit for clarity
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      });

      console.log(`[MongoDB] Connected: ${conn.connection.host}`);
      return conn;
    } catch (error) {
      retries += 1;
      console.error(
        `[MongoDB] Connection attempt ${retries}/${MAX_RETRIES} failed: ${error.message}`
      );

      if (retries >= MAX_RETRIES) {
        console.error('[MongoDB] Max retries reached. Exiting process.');
        process.exit(1);
      }

      // Exponential backoff: 3s, 6s, 12s, 24s, 48s
      const delay = BASE_DELAY_MS * Math.pow(2, retries - 1);
      console.log(`[MongoDB] Retrying in ${delay / 1000}s...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
};

// Connection event listeners for runtime monitoring
mongoose.connection.on('connected', () => {
  console.log('[MongoDB] Mongoose connection established.');
});

mongoose.connection.on('error', (err) => {
  console.error(`[MongoDB] Mongoose connection error: ${err.message}`);
});

mongoose.connection.on('disconnected', () => {
  console.warn('[MongoDB] Mongoose connection disconnected.');
});

module.exports = connectDB;
