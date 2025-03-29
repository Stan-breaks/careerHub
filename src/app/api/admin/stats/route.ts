import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Assessment from '@/models/Assessment';
import Course from '@/models/Course';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id || session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    await dbConnect();
    
    // Get user statistics
    const totalUsers = await User.countDocuments();
    const unverifiedUsers = await User.countDocuments({ isVerified: false });
    const activeUsers = await User.countDocuments({ isActive: true });
    
    // Count users who logged in within the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentLogins = await User.countDocuments({ 
      lastLogin: { $gte: sevenDaysAgo } 
    });

    // Get assessment and course counts from the database
    const totalAssessments = await Assessment.countDocuments();
    const totalCourses = await Course.countDocuments();

    return NextResponse.json({ 
      totalUsers,
      unverifiedUsers,
      activeUsers,
      recentLogins,
      totalAssessments,
      totalCourses
    });
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    return NextResponse.json(
      { error: "Failed to load admin statistics" },
      { status: 500 }
    );
  }
} 