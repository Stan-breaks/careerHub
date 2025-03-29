import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import dbConnect from "@/lib/mongodb";
import Assessment, { Result } from "@/models/Assessment";
import User from "@/models/User";
import Course from "@/models/Course";

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
    const { assessmentId, answers } = body;

    // Validate required fields
    if (!assessmentId || !answers || !Array.isArray(answers) || answers.length === 0) {
      return NextResponse.json(
        { success: false, message: "Please provide assessmentId and answers" },
        { status: 400 }
      );
    }

    await dbConnect();

    // Check if assessment exists
    const assessment = await Assessment.findById(assessmentId).populate("questions");
    
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
        (q: any) => q._id.toString() === answer.questionId
      );
      
      if (question && question.options[answer.selectedOption]) {
        totalScore += question.options[answer.selectedOption].value;
      }
    }

    // Generate recommendations based on assessment type and score
    if (assessment.type === "personality") {
      if (totalScore >= 0 && totalScore <= 10) {
        recommendations.push("You might enjoy courses that involve independent work.");
        recommendations.push("Consider careers that allow for autonomy and creativity.");
      } else if (totalScore > 10 && totalScore <= 20) {
        recommendations.push("You might thrive in collaborative environments.");
        recommendations.push("Consider careers that involve teamwork and communication.");
      } else {
        recommendations.push("You show leadership potential.");
        recommendations.push("Consider careers that allow you to guide and mentor others.");
      }
    } else if (assessment.type === "career") {
      // Fetch courses that match the career interests
      const courses = await Course.find({ isActive: true });
      
      // Simple matching algorithm based on score ranges
      // In a real app, this would be more sophisticated
      let matchingCourses;
      
      if (totalScore >= 0 && totalScore <= 10) {
        matchingCourses = courses.filter((c: any) => 
          c.careerPathways.some((p: string) => 
            ["research", "analysis", "technology"].includes(p.toLowerCase())
          )
        );
      } else if (totalScore > 10 && totalScore <= 20) {
        matchingCourses = courses.filter((c: any) => 
          c.careerPathways.some((p: string) => 
            ["business", "management", "communication"].includes(p.toLowerCase())
          )
        );
      } else {
        matchingCourses = courses.filter((c: any) => 
          c.careerPathways.some((p: string) => 
            ["creative", "design", "arts"].includes(p.toLowerCase())
          )
        );
      }
      
      // Add course recommendations
      matchingCourses.slice(0, 3).forEach((course: any) => {
        recommendations.push(`Consider the ${course.title} program which aligns with your interests.`);
      });
      
    } else if (assessment.type === "academic") {
      if (totalScore >= 0 && totalScore <= 10) {
        recommendations.push("You might benefit from courses with practical, hands-on learning.");
        recommendations.push("Consider programs that offer internships and field experience.");
      } else if (totalScore > 10 && totalScore <= 20) {
        recommendations.push("You might excel in research-oriented academic programs.");
        recommendations.push("Consider programs that emphasize theoretical knowledge and analysis.");
      } else {
        recommendations.push("You might enjoy interdisciplinary programs.");
        recommendations.push("Consider programs that combine multiple fields of study.");
      }
    }

    // Create result record
    const result = await Result.create({
      user: session.user.id,
      assessment: assessmentId,
      answers: answers.map(a => ({
        question: a.questionId,
        selectedOption: a.selectedOption,
      })),
      score: totalScore,
      recommendations,
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
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Error submitting assessment results" },
      { status: 500 }
    );
  }
} 