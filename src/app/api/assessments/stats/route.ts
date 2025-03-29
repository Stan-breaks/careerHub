import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import dbConnect from "@/lib/mongodb";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "You must be signed in to view assessment stats" },
        { status: 401 }
      );
    }

    await dbConnect();
    
    // In a real application, we would query the database for assessment statistics
    // For now, return empty data that will be populated when assessments are implemented
    
    return NextResponse.json({ 
      completed: 0, 
      available: 0,
      recentAssessment: null
    });
  } catch (error) {
    console.error("Error fetching assessment stats:", error);
    return NextResponse.json(
      { error: "Failed to load assessment statistics" },
      { status: 500 }
    );
  }
} 