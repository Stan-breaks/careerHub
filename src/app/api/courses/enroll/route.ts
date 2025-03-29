import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Course from '@/models/Course';
import mongoose from 'mongoose';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    await dbConnect();
    
    const body = await req.json();
    const { courseId } = body;
    
    if (!courseId || !mongoose.Types.ObjectId.isValid(courseId)) {
      return NextResponse.json({ error: 'Invalid course ID' }, { status: 400 });
    }
    
    // Get user and course
    const user = await User.findOne({ email: session.user.email });
    const course = await Course.findById(courseId);
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }
    
    if (!course.isActive) {
      return NextResponse.json({ error: 'Course is not currently available' }, { status: 400 });
    }
    
    // Check if already enrolled
    if (user.enrolledCourses && user.enrolledCourses.some(id => id.toString() === courseId)) {
      return NextResponse.json({ error: 'Already enrolled in this course' }, { status: 400 });
    }
    
    // Add course to user's enrolled courses
    if (!user.enrolledCourses) {
      user.enrolledCourses = [];
    }
    
    user.enrolledCourses.push(new mongoose.Types.ObjectId(courseId));
    await user.save();
    
    return NextResponse.json({ 
      success: true, 
      message: 'Successfully enrolled in course' 
    });
    
  } catch (error) {
    console.error('Error enrolling in course:', error);
    return NextResponse.json({ error: 'Failed to enroll in course' }, { status: 500 });
  }
} 