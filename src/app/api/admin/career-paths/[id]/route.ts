import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import dbConnect from "@/lib/mongodb";
import CareerPath from "@/models/CareerPath";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Fetch career path
    const careerPath = await CareerPath.findById(params.id);

    if (!careerPath) {
      return NextResponse.json(
        { error: "Career path not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ careerPath });
  } catch (error) {
    console.error("Error fetching career path:", error);
    return NextResponse.json(
      { error: "Failed to fetch career path" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Update career path
    const careerPath = await CareerPath.findByIdAndUpdate(
      params.id,
      { $set: body },
      { new: true }
    );

    if (!careerPath) {
      return NextResponse.json(
        { error: "Career path not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Career path updated successfully",
      careerPath
    });
  } catch (error) {
    console.error("Error updating career path:", error);
    return NextResponse.json(
      { error: "Failed to update career path" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Delete career path
    const careerPath = await CareerPath.findByIdAndDelete(params.id);

    if (!careerPath) {
      return NextResponse.json(
        { error: "Career path not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Career path deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting career path:", error);
    return NextResponse.json(
      { error: "Failed to delete career path" },
      { status: 500 }
    );
  }
} 