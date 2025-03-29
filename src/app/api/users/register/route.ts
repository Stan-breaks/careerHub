import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongoose";
import User from "@/models/User";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, password, studentId, yearOfStudy, department, role } = body;

    // Validate required fields
    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, message: "Please provide name, email, and password" },
        { status: 400 }
      );
    }

    await dbConnect();

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { success: false, message: "Email already in use" },
        { status: 400 }
      );
    }

    // Create a new user
    const user = await User.create({
      name,
      email,
      password,
      studentId,
      yearOfStudy,
      department,
      role: role || "student", // Allow specifying role, default to student
      isVerified: role === "admin", // Auto-verify admin users
      isActive: true
    });

    // Remove password from response
    const userWithoutPassword = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
    };

    return NextResponse.json(
      {
        success: true,
        message: role === "admin" 
          ? "Admin account created successfully!" 
          : "Registration successful! Your account will be verified by an administrator.",
        user: userWithoutPassword,
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Registration failed" },
      { status: 500 }
    );
  }
} 