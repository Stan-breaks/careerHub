import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import dbConnect from "@/lib/mongodb";
import CareerPath from "@/models/CareerPath";
import User from "@/models/User";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    
    // Check if user is verified
    const user = await User.findById(session.user.id);
    if (!user?.isVerified && user?.role !== "admin") {
      return NextResponse.json(
        { error: "Your account must be verified to access this resource" },
        { status: 403 }
      );
    }

    // Get career paths
    const careerPaths = await CareerPath.find({ isActive: true })
      .populate('recommendedAssessments', 'title description')
      .lean();
    
    // Format career paths for frontend
    const formattedPaths = careerPaths.map(path => ({
      id: path._id.toString(),
      title: path.title,
      description: path.description,
      requiredSkills: path.requiredSkills,
      recommendedAssessments: path.recommendedAssessments.map((assessment: any) => ({
        id: assessment._id.toString(),
        title: assessment.title,
        description: assessment.description
      })),
      averageSalary: path.averageSalary,
      growthPotential: path.growthPotential,
      educationRequirements: path.educationRequirements
    }));
    
    return NextResponse.json({ careerPaths: formattedPaths });
  } catch (error) {
    console.error("Error fetching career paths:", error);
    return NextResponse.json(
      { error: "Failed to fetch career paths" },
      { status: 500 }
    );
  }
} 