import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { dbConnect } from '@/lib/mongodb';
import User from '@/models/User';
import mongoose from 'mongoose';

// Verify a user by ID
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated and is admin
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Connect to database
    await dbConnect();
    
    // Parse request body
    const body = await request.json();
    const { userId } = body;
    
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json(
        { error: 'Invalid user ID' },
        { status: 400 }
      );
    }

    // Find the user by ID
    const user = await User.findById(userId);
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Update verification status
    user.isVerified = true;

    // Save the user with updated verification status
    const savedUser = await user.save();
    
    // Verify the change was actually saved
    if (!savedUser.isVerified) {
      throw new Error('Failed to update verification status');
    }

    console.log(`User ${userId} verified successfully. Verification status: ${savedUser.isVerified}`);
    
    return NextResponse.json({
      success: true,
      message: 'User verified successfully',
      user: {
        _id: savedUser._id,
        name: savedUser.name,
        email: savedUser.email,
        role: savedUser.role,
        isActive: savedUser.isActive,
        isVerified: savedUser.isVerified
      }
    });
    
  } catch (error) {
    console.error('Error verifying user:', error);
    return NextResponse.json(
      { error: 'Failed to verify user' },
      { status: 500 }
    );
  }
} 