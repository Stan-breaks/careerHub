require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../src/models/User');

async function createAdminUser() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Create admin user
    const adminUser = new User({
      name: 'Admin User',
      email: 'admin@careerhub.com',
      password: 'admin123', // This will be hashed by the User model
      role: 'admin',
      isActive: true,
      isVerified: true
    });

    await adminUser.save();
    console.log('Admin user created successfully');
    console.log('Email:', adminUser.email);
    console.log('Password: admin123');

    // Close connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  } catch (error) {
    console.error('Error creating admin user:', error);
  }
}

createAdminUser(); 