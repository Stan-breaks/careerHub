import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import dbConnect from '@/lib/mongodb';
import Course from '@/models/Course';

export async function GET(request: NextRequest) {
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
    
    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const department = searchParams.get('department');
    const isActive = searchParams.get('isActive');
    const search = searchParams.get('search');
    
    // Build query
    const query: any = {};
    
    if (department && department !== 'all') {
      query.department = department;
    }
    
    if (isActive) {
      query.isActive = isActive === 'true';
    }
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Execute query
    const courses = await Course.find(query)
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ courses });
    
  } catch (error) {
    console.error('Error fetching courses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch courses' },
      { status: 500 }
    );
  }
}

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
    
    // Validate required fields
    if (!body.title || !body.code || !body.department || !body.description || !body.duration) {
      return NextResponse.json(
        { error: 'Title, code, department, description, and duration are required' },
        { status: 400 }
      );
    }
    
    // Check if course code already exists
    const existingCourse = await Course.findOne({ code: body.code });
    if (existingCourse) {
      return NextResponse.json(
        { error: 'Course with this code already exists' },
        { status: 409 }
      );
    }
    
    // Create new course
    const newCourse = new Course({
      title: body.title,
      code: body.code,
      department: body.department,
      description: body.description,
      duration: body.duration,
      careerPathways: body.careerPathways || [],
      requirements: body.requirements || [],
      skillsDeveloped: body.skillsDeveloped || [],
      createdBy: session.user.id,
      isActive: body.isActive !== undefined ? body.isActive : true
    });
    
    await newCourse.save();
    
    return NextResponse.json({
      message: 'Course created successfully',
      course: {
        _id: newCourse._id,
        title: newCourse.title,
        code: newCourse.code,
        department: newCourse.department,
        description: newCourse.description,
        duration: newCourse.duration,
        careerPathways: newCourse.careerPathways,
        requirements: newCourse.requirements,
        skillsDeveloped: newCourse.skillsDeveloped,
        createdBy: session.user.id,
        isActive: newCourse.isActive,
        createdAt: newCourse.createdAt
      }
    }, { status: 201 });
    
  } catch (error) {
    console.error('Error creating course:', error);
    return NextResponse.json(
      { error: 'Failed to create course' },
      { status: 500 }
    );
  }
} 