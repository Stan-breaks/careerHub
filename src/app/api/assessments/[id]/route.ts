import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import dbConnect from '@/lib/mongodb';
import Assessment from '@/models/Assessment';
import mongoose from 'mongoose';
import Result from '@/models/Result';
import { recommendCourses } from '@/utils/courseRecommendation';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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
    
    // Get the ID from params - await it properly
    const { id } = await params;
    
    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid assessment ID' },
        { status: 400 }
      );
    }
    
    // Find the assessment by ID and populate questions
    const assessment = await Assessment.findById(id)
      .populate('questions')
      .lean();
    
    if (!assessment) {
      return NextResponse.json(
        { error: 'Assessment not found' },
        { status: 404 }
      );
    }
    
    // Check if assessment is active
    if (!assessment.isActive) {
      return NextResponse.json(
        { error: 'This assessment is not currently available' },
        { status: 403 }
      );
    }
    
    // Format the response
    const formattedAssessment = {
      id: assessment._id.toString(),
      title: assessment.title,
      description: assessment.description,
      type: assessment.type,
      questions: assessment.questions.map((q: any) => ({
        id: q._id.toString(),
        text: q.text,
        options: q.options.map((o: any) => ({
          id: o._id ? o._id.toString() : null,
          text: o.text,
          value: o.value
        }))
      }))
    };

    return NextResponse.json({ assessment: formattedAssessment });
    
  } catch (error) {
    console.error('Error fetching assessment:', error);
    return NextResponse.json(
      { error: 'Failed to fetch assessment' },
      { status: 500 }
    );
  }
}

interface AnswerInput {
  questionId: string;
  selectedOption: string;
}

// Save assessment results
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await dbConnect();
    
    const { id } = await params;
    const body = await request.json();
    
    console.log('Request body:', JSON.stringify(body, null, 2));
    
    if (!body.answers || !Array.isArray(body.answers) || body.answers.length === 0) {
      return NextResponse.json(
        { error: 'Assessment answers are required' },
        { status: 400 }
      );
    }
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid assessment ID' },
        { status: 400 }
      );
    }

    const assessment = await Assessment.findById(id).populate('questions');
    
    if (!assessment) {
      return NextResponse.json(
        { error: 'Assessment not found' },
        { status: 404 }
      );
    }

    const score = calculateScore(assessment, body.answers);
    const recommendations = generateRecommendations(assessment.type, score);

    // Get course recommendations first
    const recommendedCourses = await recommendCourses(
      new mongoose.Types.ObjectId(session.user.id),
      new mongoose.Types.ObjectId(id),
      [{
        category: assessment.type,
        score: score
      }]
    );

    // Get career pathways based on the assessment type and score
    const careerPathways = determineCareerPathways([{
      category: assessment.type,
      score: score
    }]);

    // Create new result document with recommendations
    const result = new Result({
      userId: new mongoose.Types.ObjectId(session.user.id),
      assessmentId: new mongoose.Types.ObjectId(id),
      answers: body.answers.map((answer: AnswerInput) => ({
        questionId: new mongoose.Types.ObjectId(answer.questionId),
        selectedOption: parseInt(answer.selectedOption, 10) || 0
      })),
      score,
      recommendations,
      recommendedCourses: recommendedCourses.map(course => course._id),
      careerPathways,
      completedAt: new Date()
    });

    // Save the result
    await result.save();

    // Redirect to the completion page with the result ID
    return NextResponse.json({ 
      success: true,
      result: {
        id: result._id,
        score,
        recommendations,
        recommendedCourses: recommendedCourses.map(course => ({
          courseId: course._id,
          title: course.title,
          code: course.code,
          description: course.description,
          duration: course.duration,
          level: course.level,
          skillsDeveloped: course.skillsDeveloped || [],
          careerPathways: course.careerPathways || [],
          score: course.relevanceScore,
          matchFactors: {
            careerPathwayMatch: course.relevanceScore * 0.5,
            levelMatch: course.relevanceScore * 0.3,
            skillsMatch: course.relevanceScore * 0.2
          }
        })),
        careerPathways,
        completedAt: result.completedAt
      }
    });

  } catch (error) {
    console.error('Error saving assessment results:', error);
    return NextResponse.json(
      { error: 'Failed to save assessment results' },
      { status: 500 }
    );
  }
}

// Helper function to calculate score
function calculateScore(assessment: any, answers: Array<{questionId: string, selectedOption: string}>): number {
  let totalScore = 0;
  
  answers.forEach(answer => {
    const question = assessment.questions.find((q: any) => q._id.toString() === answer.questionId);
    if (question) {
      const selectedOption = question.options.find((o: any) => o._id.toString() === answer.selectedOption);
      if (selectedOption) {
        totalScore += selectedOption.value;
      }
    }
  });
  
  return totalScore;
}

// Helper function to generate recommendations
function generateRecommendations(assessmentType: string, score: number): string[] {
  const recommendations: string[] = [];
  
  switch (assessmentType.toLowerCase()) {
    case 'personality':
      if (score < 50) {
        recommendations.push(
          'Consider exploring roles that allow for independent work',
          'Look into technical or analytical career paths'
        );
      } else {
        recommendations.push(
          'Consider roles that involve team collaboration',
          'Look into people-oriented career paths'
        );
      }
      break;
      
    case 'aptitude':
      if (score < 50) {
        recommendations.push(
          'Focus on building foundational skills',
          'Consider additional training or education'
        );
      } else {
        recommendations.push(
          'You show strong aptitude - consider advanced roles',
          'Look into leadership or specialized positions'
        );
      }
      break;
      
    case 'interest':
      if (score < 50) {
        recommendations.push(
          'Explore different career fields to find your passion',
          'Consider career counseling'
        );
      } else {
        recommendations.push(
          'Your interests align well with your chosen field',
          'Consider specializing further in your area of interest'
        );
      }
      break;
      
    default:
      recommendations.push(
        'Consider discussing results with a career counselor',
        'Explore various career paths to find the best fit'
      );
  }
  
  return recommendations;
}

// Helper function to determine career pathways
function determineCareerPathways(assessments: Array<{category: string, score: number}>): string[] {
  const pathways: string[] = [];
  
  assessments.forEach(assessment => {
    if (assessment.category.toLowerCase() === 'personality') {
      if (assessment.score < 50) {
        pathways.push('Independent Work');
        pathways.push('Technical or Analytical');
      } else {
        pathways.push('Team Collaboration');
        pathways.push('People-Oriented');
      }
    } else if (assessment.category.toLowerCase() === 'aptitude') {
      if (assessment.score < 50) {
        pathways.push('Foundational Skills');
        pathways.push('Additional Training or Education');
      } else {
        pathways.push('Advanced Roles');
        pathways.push('Leadership or Specialized Positions');
      }
    } else if (assessment.category.toLowerCase() === 'interest') {
      if (assessment.score < 50) {
        pathways.push('Exploring Different Fields');
        pathways.push('Career Counseling');
      } else {
        pathways.push('Interest Alignment');
        pathways.push('Specializing Further');
      }
    }
  });
  
  return pathways;
}
