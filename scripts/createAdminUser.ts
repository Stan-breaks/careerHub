require('dotenv').config();
import mongoose from 'mongoose';
import User, { IUser } from '../src/models/User';

async function createAdminUser() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/careerhub';
    console.log('Connecting to MongoDB at:', mongoUri);
    
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB successfully');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@careerhub.com' });
    if (existingAdmin) {
      console.log('Admin user already exists with email:', existingAdmin.email);
      await mongoose.connection.close();
      return;
    }

    // Create admin user
    const adminUser = new User({
      name: 'Admin User',
      email: 'admin@careerhub.com',
      password: 'admin123',
      role: 'admin',
      isVerified: true,
      skills: ['management', 'leadership', 'administration'],
      experienceLevel: 'advanced',
      assessmentsTaken: [],
      enrolledCourses: []
    });

    await adminUser.save();
    console.log('\nAdmin user created successfully!');
    console.log('----------------------------------------');
    console.log('Email:', adminUser.email);
    console.log('Password: admin123');
    console.log('Role:', adminUser.role);
    console.log('----------------------------------------');
    console.log('\nYou can now log in with these credentials.');

    // Close connection
    await mongoose.connection.close();
    console.log('\nMongoDB connection closed');
  } catch (error) {
    console.error('Error creating admin user:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

// Run the function
createAdminUser(); 