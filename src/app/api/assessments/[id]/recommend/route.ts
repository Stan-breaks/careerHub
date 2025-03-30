import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import mongoose from 'mongoose';
import { recommendCourses } from '@/utils/courseRecommendation';
import Result from '@/models/Result';
import Course from '@/models/Course';
import Assessment from '@/models/Assessment';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const assessmentId = new mongoose.Types.ObjectId(id);
    const userId = new mongoose.Types.ObjectId(session.user.id);

    // Get the result with recommended courses
    const result = await Result.findOne({ userId, assessmentId })
      .populate({
        path: 'recommendedCourses',
        model: Course,
        select: 'title code description duration level careerPathways skillsDeveloped'
      });

    if (!result) {
      return NextResponse.json(
        { error: 'Assessment result not found' },
        { status: 404 }
      );
    }

    // Get the assessment to determine its type
    const assessment = await Assessment.findById(assessmentId);
    if (!assessment) {
      return NextResponse.json(
        { error: 'Assessment not found' },
        { status: 404 }
      );
    }

    // Calculate category scores based on assessment type
    const categoryScores = [{
      category: assessment.type,
      score: result.score
    }];

    return NextResponse.json({
      success: true,
      data: {
        categoryScores,
        recommendedCourses: result.recommendedCourses || [],
        careerPathways: result.careerPathways || []
      }
    });

  } catch (error) {
    console.error('Error getting course recommendations:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
