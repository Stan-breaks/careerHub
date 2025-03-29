import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { seedDefaultAssessments, seedDefaultCourses, seedDefaultCareerPaths } from '@/utils/seedData';

export async function POST(request: NextRequest) {
  try {
    // Only allow admin users to trigger seeding
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized: Only admin users can seed data' },
        { status: 401 }
      );
    }

    // Seed default assessments, courses, and career paths
    await seedDefaultAssessments(session.user.id as string);
    await seedDefaultCourses(session.user.id as string);
    await seedDefaultCareerPaths();

    return NextResponse.json({ 
      success: true,
      message: 'Default assessments, courses, and career paths seeded successfully' 
    });
  } catch (error) {
    console.error('Error seeding default data:', error);
    return NextResponse.json(
      { error: 'Failed to seed default data' },
      { status: 500 }
    );
  }
} 