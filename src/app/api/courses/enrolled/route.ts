import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Course from '@/models/Course';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    await dbConnect();
    
    // Get user with enrolled courses
    const user = await User.findOne({ email: session.user.email }).lean();
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    if (!user.enrolledCourses || user.enrolledCourses.length === 0) {
      return NextResponse.json({ courses: [] });
    }
    
    // Get courses
    const courses = await Course.find({
      _id: { $in: user.enrolledCourses },
      isActive: true
    }).lean();
    
    // Format courses for frontend
    const formattedCourses = courses.map(course => {
      return {
        id: course._id.toString(),
        title: course.title,
        code: course.code,
        department: course.department,
        description: course.description,
        duration: course.duration,
        instructor: 'Staff', // Default value
        level: course.level || 'beginner',
        category: course.department,
        price: 0 // Default to free courses
      };
    });
    
    return NextResponse.json({ courses: formattedCourses });
    
  } catch (error) {
    console.error('Error fetching enrolled courses:', error);
    return NextResponse.json({ error: 'Failed to fetch enrolled courses' }, { status: 500 });
  }
} 