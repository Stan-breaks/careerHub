import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import dbConnect from '@/lib/mongodb';
import Course from '@/models/Course';
import mongoose from 'mongoose';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Connect to database
    await dbConnect();
    
    const { id } = params;
    
    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid course ID' },
        { status: 400 }
      );
    }
    
    // Find the course by ID
    const course = await Course.findById(id).lean();
    
    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }
    
    // Check if course is active
    if (!course.isActive) {
      return NextResponse.json(
        { error: 'This course is not currently available' },
        { status: 403 }
      );
    }
    
    // Format the response
    const formattedCourse = {
      id: String(course._id),
      title: course.title,
      code: course.code,
      department: course.department,
      description: course.description,
      duration: course.duration,
      instructor: {
        id: null,
        name: 'Staff',
        email: null
      },
      level: course.level || 'beginner',
      category: course.department,
      requirements: course.requirements || [],
      skillsDeveloped: course.skillsDeveloped || [],
      careerPathways: course.careerPathways || [],
      price: 0, // Free courses for now
      createdAt: course.createdAt
    };

    // Safely set instructor data if available
    try {
      if (course.instructor) {
        // Using any as a temporary type to avoid TypeScript errors
        const inst = course.instructor as any;
        
        if (inst._id) {
          formattedCourse.instructor.id = String(inst._id);
        }
        
        if (inst.name) {
          formattedCourse.instructor.name = String(inst.name);
        }
        
        if (inst.email) {
          formattedCourse.instructor.email = String(inst.email);
        }
      }
    } catch (err) {
      console.error('Error handling instructor data:', err);
      // Keep default instructor values if there's an error
    }

    return NextResponse.json({ course: formattedCourse });
    
  } catch (error) {
    console.error('Error fetching course:', error);
    return NextResponse.json(
      { error: 'Failed to fetch course' },
      { status: 500 }
    );
  }
} 