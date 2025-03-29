import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { dbConnect } from "@/lib/mongodb";
import Feedback from "@/models/Feedback";
import mongoose from "mongoose";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated and is an admin
    if (!session) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }
    
    if (session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Not authorized" },
        { status: 403 }
      );
    }
    
    const { id } = params;
    const data = await req.json();
    
    // Validate the status
    if (!data.status) {
      return NextResponse.json(
        { error: "Status is required" },
        { status: 400 }
      );
    }
    
    // Check if status is valid
    const validStatuses = ["pending", "inProgress", "resolved", "dismissed"];
    if (!validStatuses.includes(data.status)) {
      return NextResponse.json(
        { error: "Invalid status" },
        { status: 400 }
      );
    }
    
    await dbConnect();
    
    // Find and update the feedback
    const feedback = await Feedback.findById(id);
    
    if (!feedback) {
      return NextResponse.json(
        { error: "Feedback not found" },
        { status: 404 }
      );
    }
    
    // Update the feedback status
    feedback.status = data.status;
    
    // Add reviewed information
    feedback.reviewed = true;
    feedback.reviewedBy = new mongoose.Types.ObjectId(session.user.id);
    
    await feedback.save();
    
    return NextResponse.json(
      { message: "Feedback updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating feedback:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}