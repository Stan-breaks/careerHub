import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import dbConnect from "@/lib/mongodb";
import CareerPath from "@/models/CareerPath";
import User from "@/models/User";
import mongoose from "mongoose";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    await dbConnect();
    
    // Get the ID directly from params without destructuring first
    const id = params.id;
    
    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid career path ID' },
        { status: 400 }
      );
    }
    
    // Find the career path by ID and populate recommendedAssessments
    const careerPath = await CareerPath.findById(id)
      .populate('recommendedAssessments', 'title description type')
      .lean();
    
    if (!careerPath) {
      return NextResponse.json(
        { error: 'Career path not found' },
        { status: 404 }
      );
    }
    
    // Check if career path is active
    if (!careerPath.isActive) {
      return NextResponse.json(
        { error: 'This career path is not currently available' },
        { status: 403 }
      );
    }
    
    // Format the response
    const formattedPath = {
      id: careerPath._id.toString(),
      title: careerPath.title,
      description: careerPath.description,
      requiredSkills: careerPath.requiredSkills,
      recommendedAssessments: careerPath.recommendedAssessments.map((assessment: any) => ({
        id: assessment._id.toString(),
        title: assessment.title,
        description: assessment.description,
        type: assessment.type
      })),
      averageSalary: careerPath.averageSalary,
      growthPotential: careerPath.growthPotential,
      educationRequirements: careerPath.educationRequirements
    };

    return NextResponse.json({ careerPath: formattedPath });
    
  } catch (error) {
    console.error('Error fetching career path:', error);
    return NextResponse.json(
      { error: 'Failed to fetch career path' },
      { status: 500 }
    );
  }
} 