import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import dbConnect from "@/lib/mongodb";
import Feedback from "@/models/Feedback";

// POST to submit feedback
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "You must be signed in to submit feedback" },
        { status: 401 }
      );
    }

    await dbConnect();
    
    const { type, content } = await req.json();
    
    // Validate required fields
    if (!type || !content) {
      return NextResponse.json(
        { error: "Feedback type and content are required" },
        { status: 400 }
      );
    }
    
    // Create feedback entry with required fields
    const feedback = await Feedback.create({
      userId: session.user.id, // Field name in the model is userId, not user
      type,
      title: content.substring(0, 100), // Use first 100 chars of content as title
      description: content, // Use content as description
      status: "pending"
    });
    
    return NextResponse.json(
      { message: "Feedback submitted successfully", feedback },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error submitting feedback:", error);
    return NextResponse.json(
      { error: "Failed to submit feedback" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "You must be signed in to view feedback" },
        { status: 401 }
      );
    }
    
    // Only admin can view all feedback
    if (session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Not authorized to view all feedback" },
        { status: 403 }
      );
    }

    await dbConnect();
    
    // Get query parameters
    const searchParams = req.nextUrl.searchParams;
    const type = searchParams.get("type");
    const status = searchParams.get("status");
    
    // Build query
    const query: any = {};
    
    if (type) {
      query.type = type;
    }
    
    if (status) {
      query.status = status;
    }
    
    // Fetch feedback
    const feedback = await Feedback.find(query)
      .populate("userId", "name email")
      .sort({ createdAt: -1 });
    
    return NextResponse.json({ feedback });
  } catch (error) {
    console.error("Error fetching feedback:", error);
    return NextResponse.json(
      { error: "Failed to fetch feedback" },
      { status: 500 }
    );
  }
} 