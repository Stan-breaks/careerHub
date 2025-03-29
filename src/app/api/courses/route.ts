import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import dbConnect from '@/lib/mongodb';
import Course from '@/models/Course';

export async function GET(request: NextRequest) {
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

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const department = searchParams.get('department');
    const level = searchParams.get('level');
    
    // Build the query
    const query: any = { isActive: true };
    
    if (department) {
      query.department = department;
    }
    
    if (level) {
      query.level = level;
    }
    
    // Get active courses
    const courses = await Course.find(query).lean();
    
    // Format for frontend consumption
    const formattedCourses = courses.map(course => {
      return {
        id: course._id.toString(),
        title: course.title,
        code: course.code,
        department: course.department,
        description: course.description,
        duration: course.duration,
        instructor: 'Staff', // Default since we can't populate
        level: course.level || 'beginner',
        category: course.department,
        requirements: course.requirements || [],
        skillsDeveloped: course.skillsDeveloped || [],
        careerPathways: course.careerPathways || [],
        price: 0, // Free courses for now
        createdAt: course.createdAt
      };
    });

    return NextResponse.json({ courses: formattedCourses });
    
  } catch (error) {
    console.error('Error fetching courses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch courses' },
      { status: 500 }
    );
  }
}
