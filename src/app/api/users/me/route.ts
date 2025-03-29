import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Result from '@/models/Result';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    await dbConnect();

    // Find the user and update lastLogin
    const user = await User.findById(session.user.id)
      .select('-password')
      .lean();

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Find the user's assessment results
    const assessmentResults = await Result.find({ user: session.user.id })
      .populate('assessment', 'title type')
      .sort({ completedAt: -1 })
      .lean();

    // Format the results
    const formattedResults = assessmentResults.map(result => ({
      id: result._id.toString(),
      assessmentId: result.assessment?._id?.toString() || '',
      assessmentTitle: result.assessment?.title || 'Untitled Assessment',
      assessmentType: result.assessment?.type || 'unknown',
      score: result.score,
      recommendations: result.recommendations,
      completedAt: result.completedAt
    }));

    return NextResponse.json({
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        isVerified: user.isVerified,
        profileImage: user.profileImage,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin
      },
      assessmentResults: formattedResults
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user profile' },
      { status: 500 }
    );
  }
} 