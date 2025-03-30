import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import dbConnect from "@/lib/mongodb";
import Assessment, { IQuestion } from "@/models/Assessment";
import Result from "@/models/Result";
import User from "@/models/User";
import Course from "@/models/Course";
import { RecommendationEngine } from "@/utils/recommendationEngine";
import { Types } from "mongoose";
import mongoose from "mongoose";

interface AssessmentAnswer {
  questionId: string;
  selectedOption: number;
}

// POST to submit assessment results
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { assessmentId, answers }: { assessmentId: string; answers: AssessmentAnswer[] } = body;

    // Validate required fields
    if (!assessmentId || !answers || !Array.isArray(answers) || answers.length === 0) {
      return NextResponse.json(
        { success: false, message: "Please provide assessmentId and answers" },
        { status: 400 }
      );
    }

    await dbConnect();

    // Check if assessment exists
    const assessment = await Assessment.findById(assessmentId).populate<{ questions: IQuestion[] }>("questions");
    
    if (!assessment) {
      return NextResponse.json(
        { success: false, message: "Assessment not found" },
        { status: 404 }
      );
    }

    // Validate answers format
    for (const answer of answers) {
      if (!answer.questionId || answer.selectedOption === undefined) {
        return NextResponse.json(
          { success: false, message: "Each answer must have questionId and selectedOption" },
          { status: 400 }
        );
      }
    }

    // Calculate score and generate recommendations
    let totalScore = 0;
    const recommendations: string[] = [];

    // Process answers and calculate score
    for (const answer of answers) {
      const question = assessment.questions.find(
        (q) => q._id && q._id.toString() === answer.questionId
      );
      
      if (question?.options?.[answer.selectedOption]) {
        totalScore += question.options[answer.selectedOption].value;
      }
    }

    // Get user's assessment history
    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    const userResults = await Result.find({ userId: session.user.id })
      .populate('assessmentId')
      .lean();

    // Get all active courses
    const courses = await Course.find({ isActive: true }).lean();

    // Generate personalized course recommendations
    const courseRecommendations = RecommendationEngine.generateRecommendations(
      courses,
      user,
      userResults
    );

    // Generate personalized recommendation text
    courseRecommendations.forEach(rec => {
      recommendations.push(...RecommendationEngine.generateRecommendationText(rec));
    });

    // Create result record
    const result = new Result({
      userId: new mongoose.Types.ObjectId(session.user.id),
      assessmentId: new mongoose.Types.ObjectId(assessmentId),
      answers: answers.map((answer: AssessmentAnswer) => ({
        questionId: new mongoose.Types.ObjectId(answer.questionId),
        selectedOption: parseInt(answer.selectedOption.toString(), 10) || 0
      })),
      score: totalScore,
      recommendations,
      recommendedCourses: courseRecommendations.map(rec => rec.course._id),
      careerPathways: assessment.type === 'career' ? 
        courseRecommendations.map(rec => rec.course.careerPathways[0]) : 
        [],
      completedAt: new Date(),
    });

    // Update user's assessments taken
    await User.findByIdAndUpdate(
      session.user.id,
      { $addToSet: { assessmentsTaken: assessmentId } }
    );

    return NextResponse.json({
      success: true,
      message: "Assessment completed successfully",
      result: {
        id: result._id,
        score: result.score,
        recommendations: result.recommendations,
        completedAt: result.completedAt,
        courseRecommendations: courseRecommendations.map(rec => ({
          courseId: rec.course._id,
          title: rec.course.title,
          score: rec.score,
          matchFactors: rec.matchFactors
        }))
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Error submitting assessment results" },
      { status: 500 }
    );
  }
}