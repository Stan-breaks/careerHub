import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import dbConnect from '@/lib/mongodb';
import Assessment from '@/models/Assessment';
import mongoose from 'mongoose';
import { Result } from '@/models/Assessment';

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
    
    // Get the ID directly from params without destructuring first
    const id = params.id;
    
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

// Save assessment results
export async function POST(
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
    
    // Get the ID directly from params without destructuring first
    const id = params.id;
    const body = await request.json();
    
    // Validate required fields
    if (!body.answers || !Array.isArray(body.answers) || body.answers.length === 0) {
      return NextResponse.json(
        { error: 'Assessment answers are required' },
        { status: 400 }
      );
    }
    
    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid assessment ID' },
        { status: 400 }
      );
    }
    
    // Find the assessment
    const assessment = await Assessment.findById(id).populate('questions');
    
    if (!assessment) {
      return NextResponse.json(
        { error: 'Assessment not found' },
        { status: 404 }
      );
    }
    
    // Validate answers format
    const answers = body.answers as Array<{questionId: string, selectedOption: string}>;
    for (const answer of answers) {
      if (!answer.questionId || !answer.selectedOption) {
        return NextResponse.json(
          { error: 'Each answer must include questionId and selectedOption' },
          { status: 400 }
        );
      }
    }
    
    // Calculate score based on selected options
    const totalScore = calculateScore(assessment, answers);
    
    // Generate recommendations based on score and assessment type
    const recommendations = generateRecommendations(assessment.type, totalScore);
    
    // Save the result to the database
    const result = new Result({
      user: new mongoose.Types.ObjectId(session.user.id),
      assessment: new mongoose.Types.ObjectId(id),
      answers: answers.map(answer => ({
        question: new mongoose.Types.ObjectId(answer.questionId),
        selectedOption: parseInt(answer.selectedOption) || 0 // Ensure it's a valid number
      })),
      score: totalScore,
      recommendations: recommendations,
      completedAt: new Date()
    });

    await result.save();
    
    return NextResponse.json({
      success: true,
      result: {
        score: totalScore,
        recommendations: recommendations,
        completedAt: new Date()
      }
    });
    
  } catch (error) {
    console.error('Error saving assessment result:', error);
    return NextResponse.json(
      { error: 'Failed to save assessment result' },
      { status: 500 }
    );
  }
}

// Helper function to calculate score
function calculateScore(assessment: any, answers: Array<{questionId: string, selectedOption: string}>): number {
  let totalScore = 0;
  
  for (const answer of answers) {
    const question = assessment.questions.find((q: any) => 
      q._id.toString() === answer.questionId
    );
    
    if (question) {
      // Find option by ID (which is sent as a string from frontend)
      const option = question.options.find((o: any) => 
        o._id.toString() === answer.selectedOption
      );
      
      if (option && typeof option.value === 'number') {
        totalScore += option.value;
      }
    }
  }
  
  return totalScore;
}

// Helper function to generate recommendations
function generateRecommendations(assessmentType: string, score: number): string[] {
  const recommendations: string[] = [];
  
  if (assessmentType === 'personality') {
    if (score >= 80) {
      recommendations.push('You show strong leadership qualities.');
      recommendations.push('Consider roles that involve managing teams or projects.');
      recommendations.push('Your analytical thinking is highly developed.');
    } else if (score >= 60) {
      recommendations.push('You have good communication and collaborative skills.');
      recommendations.push('Roles that involve teamwork would be a good fit.');
      recommendations.push('Consider positions that leverage your interpersonal abilities.');
    } else if (score >= 40) {
      recommendations.push('You have a detail-oriented, methodical approach.');
      recommendations.push('Consider specialist or technical roles that require precision.');
      recommendations.push('Roles that involve planning and organization would fit well.');
    } else {
      recommendations.push('You have creative, out-of-the-box thinking capabilities.');
      recommendations.push('Consider roles that value innovative approaches.');
      recommendations.push('Environments that are less structured might suit you better.');
    }
  } else if (assessmentType === 'career') {
    if (score >= 80) {
      recommendations.push('You have strong aptitude for technical and analytical roles.');
      recommendations.push('Consider careers in software development, data analysis, or engineering.');
      recommendations.push('Your logical thinking skills are highly developed.');
    } else if (score >= 60) {
      recommendations.push('You show strengths in organization and planning.');
      recommendations.push('Consider careers in project management, operations, or administration.');
      recommendations.push('Roles requiring systematic approaches would be a good fit.');
    } else if (score >= 40) {
      recommendations.push('You have skills well-suited for creative or communication-focused roles.');
      recommendations.push('Consider careers in marketing, design, or content creation.');
      recommendations.push('Positions that value innovative thinking would be appropriate.');
    } else {
      recommendations.push('You have qualities suited for people-oriented roles.');
      recommendations.push('Consider careers in HR, customer service, or education.');
      recommendations.push('Positions focused on interpersonal interactions would be a good fit.');
    }
  } else { // academic
    if (score >= 80) {
      recommendations.push('You show strong academic potential in theoretical subjects.');
      recommendations.push('Consider pursuing advanced degrees in your field of interest.');
      recommendations.push('Research-oriented programs would be well-suited to your abilities.');
    } else if (score >= 60) {
      recommendations.push('You have a good balance of academic and practical skills.');
      recommendations.push('Consider programs that combine theory with hands-on learning.');
      recommendations.push('Professional degree programs might be a good fit.');
    } else if (score >= 40) {
      recommendations.push('You have strengths in applied and practical learning.');
      recommendations.push('Consider programs with strong internship or co-op components.');
      recommendations.push('Vocational or technical programs might align well with your approach.');
    } else {
      recommendations.push('You have a unique learning style that may benefit from alternative approaches.');
      recommendations.push('Consider self-directed learning or specialized programs.');
      recommendations.push('Programs with flexible structures might work best for you.');
    }
  }
  
  return recommendations;
} 