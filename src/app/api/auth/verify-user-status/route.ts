import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "You must be signed in to check verification status" },
        { status: 401 }
      );
    }

    await dbConnect();
    
    // Find the user and update lastLogin
    const user = await User.findByIdAndUpdate(
      session.user.id,
      { $set: { lastLogin: new Date() } },
      { new: true }
    ).select("-password");
    
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      isVerified: user.isVerified,
      name: user.name,
      role: user.role
    });
  } catch (error) {
    console.error("Error checking verification status:", error);
    return NextResponse.json(
      { error: "Failed to check verification status" },
      { status: 500 }
    );
  }
} 