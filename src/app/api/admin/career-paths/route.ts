import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import dbConnect from "@/lib/mongodb";
import CareerPath from "@/models/CareerPath";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated and is admin
    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Connect to database
    await dbConnect();

    // Get query parameters
    const searchParams = req.nextUrl.searchParams;
    const search = searchParams.get("search");
    const status = searchParams.get("status");

    // Build query
    const query: any = {};
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { requiredSkills: { $regex: search, $options: "i" } }
      ];
    }

    if (status === "active") {
      query.isActive = true;
    } else if (status === "inactive") {
      query.isActive = false;
    }

    // Fetch career paths
    const careerPaths = await CareerPath.find(query)
      .sort({ createdAt: -1 })
      .select("title description requiredSkills growthPotential isActive createdAt");

    return NextResponse.json({ careerPaths });
  } catch (error) {
    console.error("Error fetching career paths:", error);
    return NextResponse.json(
      { error: "Failed to fetch career paths" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated and is admin
    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Connect to database
    await dbConnect();

    // Get request body
    const body = await req.json();
    const {
      title,
      description,
      requiredSkills,
      recommendedAssessments,
      averageSalary,
      growthPotential,
      educationRequirements
    } = body;

    // Validate required fields
    if (!title || !description || !requiredSkills || !growthPotential || !educationRequirements) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create new career path
    const careerPath = await CareerPath.create({
      title,
      description,
      requiredSkills,
      recommendedAssessments,
      averageSalary,
      growthPotential,
      educationRequirements,
      isActive: true
    });

    return NextResponse.json(
      { message: "Career path created successfully", careerPath },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating career path:", error);
    return NextResponse.json(
      { error: "Failed to create career path" },
      { status: 500 }
    );
  }
} 