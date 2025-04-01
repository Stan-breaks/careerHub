import mongoose from 'mongoose';

async function testConnection() {
  try {
    await mongoose.connect('mongodb://localhost:27017/careerhub');
    console.log('Successfully connected to MongoDB.');
    
    // Test collections
    const collections = await mongoose.connection.db.collections();
    console.log('\nCollections in database:');
    for (const collection of collections) {
      const count = await collection.countDocuments();
      console.log(`${collection.collectionName}: ${count} documents`);
    }
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
  } finally {
    await mongoose.disconnect();
  }
}

testConnection(); 