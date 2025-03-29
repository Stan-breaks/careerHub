import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import dbConnect from "@/lib/mongodb";
import Assessment, { IAssessment } from "@/models/Assessment";
import Question from "@/models/Question";

// GET all assessments
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await dbConnect();

    // Get active assessments
    const assessments = await Assessment.find({ isActive: true })
      .select('title description type questions createdAt')
      .populate('questions', 'text')
      .lean();
    
    // Format for frontend consumption
    const formattedAssessments = assessments.map((assessment: any) => ({
      id: assessment._id.toString(),
      title: assessment.title,
      description: assessment.description,
      category: assessment.type,
      questions: assessment.questions.length,
      duration: getDurationEstimate(assessment.questions.length),
      createdAt: assessment.createdAt
    }));

    return NextResponse.json({ assessments: formattedAssessments });
  } catch (error: any) {
    console.error('Error fetching assessments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch assessments' },
      { status: 500 }
    );
  }
}

// Helper function to estimate assessment duration
function getDurationEstimate(questionCount: number): string {
  const avgTimePerQuestion = 1; // in minutes
  const totalTime = questionCount * avgTimePerQuestion;
  
  if (totalTime < 60) {
    return `${totalTime} minutes`;
  } else {
    const hours = Math.floor(totalTime / 60);
    const minutes = totalTime % 60;
    return minutes > 0 ? `${hours} hr ${minutes} min` : `${hours} hr`;
  }
}

// POST to create a new assessment
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      );
    }
    
    // Only admin can create assessments
    if (session.user?.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Not authorized" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { title, description, type, questions } = body;

    // Validate required fields
    if (!title || !description || !type) {
      return NextResponse.json(
        { success: false, message: "Please provide title, description, and type" },
        { status: 400 }
      );
    }

    // Validate assessment type
    if (!["personality", "career", "academic"].includes(type)) {
      return NextResponse.json(
        { success: false, message: "Assessment type must be personality, career, or academic" },
        { status: 400 }
      );
    }

    await dbConnect();

    // Create questions first if they're provided
    let questionIds = [];
    
    if (questions && Array.isArray(questions) && questions.length > 0) {
      for (const q of questions) {
        if (!q.text || !q.options || !Array.isArray(q.options) || q.options.length < 2) {
          return NextResponse.json(
            { success: false, message: "Each question must have text and at least 2 options" },
            { status: 400 }
          );
        }

        // Create the question
        const newQuestion = await Question.create({
          text: q.text,
          options: q.options,
          category: type,
        });

        questionIds.push(newQuestion._id);
      }
    }

    // Create the assessment
    const assessment = await Assessment.create({
      title,
      description,
      type,
      questions: questionIds,
      createdBy: session.user.id,
      isActive: true,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Assessment created successfully",
        assessment,
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Error creating assessment" },
      { status: 500 }
    );
  }
} 