"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

export default function Dashboard() {
  const { data: session, status } = useSession();
  const [userVerified, setUserVerified] = useState<boolean | null>(null);
  const [enrolledCoursesCount, setEnrolledCoursesCount] = useState(0);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch verification status
        if (session?.user?.id) {
          const verificationResponse = await fetch('/api/auth/verify-user-status');
          if (verificationResponse.ok) {
            const verificationData = await verificationResponse.json();
            setUserVerified(verificationData.isVerified);
          }

          // Fetch enrolled courses count
          const coursesResponse = await fetch('/api/courses/enrolled');
          if (coursesResponse.ok) {
            const coursesData = await coursesResponse.json();
            setEnrolledCoursesCount(coursesData.courses.length);
          }
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    };

    if (session) {
      fetchDashboardData();
    }
  }, [session]);

  if (status === "loading") {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>;
  }

  if (!session) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">You need to sign in to access the dashboard</h1>
        <Link href="/login" className="text-blue-600 hover:text-blue-800 underline">Go to login</Link>
      </div>
    </div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Welcome, {session.user.name}!</h1>
      
      {/* Show verification status for students */}
      {session.user.role === "student" && userVerified === false && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                Your account is pending verification by an administrator. Some features may be limited until verification is complete.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Show verification success for newly verified students */}
      {session.user.role === "student" && userVerified === true && (
        <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-700">
                Your account has been verified! You now have full access to all platform features.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Admin quick action to verify users */}
      {session.user.role === "admin" && (
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-700">
                As an administrator, you can verify new student accounts.{" "}
                <Link href="/admin/users?verification=unverified&role=student" className="font-medium underline">
                  Check pending verifications
                </Link>
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Dashboard cards */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">My Profile</h2>
            <p className="text-gray-600 mb-4">View and update your personal information</p>
            <Link 
              href="/profile" 
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-300"
            >
              View Profile
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">My Assessments</h2>
            <p className="text-gray-600 mb-4">Take assessments to discover your career path</p>
            <Link 
              href="/assessments" 
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-300"
            >
              View Assessments
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Career Paths</h2>
            <p className="text-gray-600 mb-4">Explore potential career paths based on your skills and assessment results</p>
            <Link 
              href="/career-paths" 
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-300"
            >
              Explore Careers
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Courses</h2>
            <p className="text-gray-600 mb-4">Browse and enroll in courses to build your skills and advance your career</p>
            <Link 
              href="/courses" 
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-300"
            >
              View Courses
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Feedback</h2>
            <p className="text-gray-600 mb-4">Share your thoughts or report issues to help us improve</p>
            <Link 
              href="/feedback" 
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-300"
            >
              Submit Feedback
            </Link>
          </div>
        </div>

        {session.user.role === "admin" && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Admin Panel</h2>
              <p className="text-gray-600 mb-4">Manage users, assessments, and platform settings</p>
              <Link 
                href="/admin" 
                className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-300"
              >
                Go to Admin Panel
              </Link>
            </div>
          </div>
        )}

        {/* Course Enrollment Card */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Enrolled Courses</h2>
            <div className="flex items-center space-x-4 mb-6">
              <div className="p-3 rounded-full bg-indigo-100">
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-500">My Courses</p>
                <p className="text-2xl font-bold text-gray-800">{enrolledCoursesCount}</p>
              </div>
            </div>
            <div className="mb-4">
              <p className="text-gray-600 mb-2">
                {enrolledCoursesCount > 0 
                  ? 'Continue learning with your enrolled courses.' 
                  : 'Start learning with our courses and enhance your career prospects.'}
              </p>
            </div>
            <Link
              href={enrolledCoursesCount > 0 ? "/dashboard/my-courses" : "/courses"}
              className="block w-full text-center bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-300"
            >
              {enrolledCoursesCount > 0 ? "View My Courses" : "Browse Courses"}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 