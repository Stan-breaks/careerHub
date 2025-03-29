import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import dbConnect from '@/lib/mongodb';
import Assessment from '@/models/Assessment';
import Question from '@/models/Question';
import mongoose from 'mongoose';

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
    const type = searchParams.get('type');
    const isActive = searchParams.get('isActive');
    
    // Build query
    const query: any = {};
    
    if (type && type !== 'all') {
      query.type = type;
    }
    
    if (isActive) {
      query.isActive = isActive === 'true';
    }
    
    // Execute query
    const assessments = await Assessment.find(query)
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ assessments });
    
  } catch (error) {
    console.error('Error fetching assessments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch assessments' },
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
    if (!body.title || !body.description || !body.type) {
      return NextResponse.json(
        { error: 'Title, description, and type are required' },
        { status: 400 }
      );
    }

    const userId = new mongoose.Types.ObjectId(session.user.id);
    
    // Check if we're creating an assessment with inline questions
    if (body.questions && Array.isArray(body.questions) && body.questions.length > 0 && 
        typeof body.questions[0] === 'object' && body.questions[0].text) {
      
      // Create questions first
      const questionDocs = body.questions.map((q: { text: string, options?: Array<{ text: string, value: number }> }) => ({
        text: q.text,
        type: 'multiple-choice' as const, // Default type for now
        options: q.options || [],
        createdBy: userId
      }));
      
      // Insert all questions
      const savedQuestions = await Question.insertMany(questionDocs);
      
      // Create assessment with question IDs
      const newAssessment = new Assessment({
        title: body.title,
        description: body.description,
        type: body.type,
        questions: savedQuestions.map(q => q._id),
        createdBy: userId,
        isActive: body.isActive !== undefined ? body.isActive : true
      });
      
      await newAssessment.save();
      
      return NextResponse.json({
        message: 'Assessment created successfully',
        assessment: {
          _id: newAssessment._id,
          title: newAssessment.title,
          description: newAssessment.description,
          type: newAssessment.type,
          questionsCount: savedQuestions.length,
          createdBy: session.user.id,
          isActive: newAssessment.isActive,
          createdAt: newAssessment.createdAt
        }
      }, { status: 201 });
    } 
    // Regular assessment creation with question IDs
    else {
      // Create new assessment
      const newAssessment = new Assessment({
        title: body.title,
        description: body.description,
        type: body.type,
        questions: body.questions || [],
        createdBy: userId,
        isActive: body.isActive !== undefined ? body.isActive : true
      });
      
      await newAssessment.save();
      
      return NextResponse.json({
        message: 'Assessment created successfully',
        assessment: {
          _id: newAssessment._id,
          title: newAssessment.title,
          description: newAssessment.description,
          type: newAssessment.type,
          questions: newAssessment.questions,
          createdBy: session.user.id,
          isActive: newAssessment.isActive,
          createdAt: newAssessment.createdAt
        }
      }, { status: 201 });
    }
    
  } catch (error) {
    console.error('Error creating assessment:', error);
    return NextResponse.json(
      { error: 'Failed to create assessment' },
      { status: 500 }
    );
  }
} 