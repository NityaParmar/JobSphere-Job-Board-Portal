require('dotenv').config();
const mongoose = require('mongoose');

async function run() {
  if (!process.env.MONGO_URI) {
    console.error('MONGO_URI is missing');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  const result = await mongoose.connection.collection('applications').updateMany(
    { resumeUrl: { $exists: false }, resumeS3Key: { $exists: true } },
    [{ $set: { resumeUrl: '$resumeS3Key' } }]
  );

  console.log(`Updated ${result.modifiedCount} legacy application record(s).`);
  await mongoose.disconnect();
  console.log('Migration complete.');
}

run().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
