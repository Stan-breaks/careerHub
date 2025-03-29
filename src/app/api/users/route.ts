import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import dbConnect from "@/lib/mongoose";
import User from "@/models/User";

export async function GET(req: NextRequest) {
  try {
    // Check if user is authenticated and is an admin
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      );
    }
    
    if (session.user.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Not authorized" },
        { status: 403 }
      );
    }

    await dbConnect();

    // Get query parameters for filtering
    const { searchParams } = new URL(req.url);
    const verified = searchParams.get("verified");
    const role = searchParams.get("role");
    
    // Build query
    let query: any = {};
    
    if (verified === "true") {
      query.isVerified = true;
    } else if (verified === "false") {
      query.isVerified = false;
    }
    
    if (role === "student" || role === "admin") {
      query.role = role;
    }

    // Get users based on query
    const users = await User.find(query).select("-password");

    return NextResponse.json({
      success: true,
      count: users.length,
      users: users.map(user => ({
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        studentId: user.studentId,
        yearOfStudy: user.yearOfStudy,
        department: user.department,
        createdAt: user.createdAt,
      })),
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Error retrieving users" },
      { status: 500 }
    );
  }
} 