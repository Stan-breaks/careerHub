'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';

interface Course {
  id: string;
  title: string;
  code: string;
  department: string;
  description: string;
  duration: string;
  instructor: string;
  level: string;
  price: number;
}

export default function MyCourses() {
  const { data: session, status } = useSession();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [userVerified, setUserVerified] = useState<boolean | null>(null);

  useEffect(() => {
    const checkUserVerification = async () => {
      try {
        const res = await fetch('/api/auth/verify-user-status');
        const data = await res.json();
        setUserVerified(data.isVerified);
      } catch (err) {
        console.error('Error checking verification status:', err);
        setUserVerified(false);
      }
    };

    const fetchEnrolledCourses = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/courses/enrolled');
        
        if (!res.ok) {
          throw new Error(`Failed to fetch enrolled courses: ${res.status}`);
        }
        
        const data = await res.json();
        setCourses(data.courses);
      } catch (err) {
        console.error('Error fetching enrolled courses:', err);
        toast.error('Failed to load your courses');
        setCourses([]);
      } finally {
        setLoading(false);
      }
    };

    if (status === 'authenticated' && session) {
      checkUserVerification();
      fetchEnrolledCourses();
    }
  }, [status, session]);

  if (status === 'loading' || loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div className="max-w-4xl mx-auto p-4 sm:p-6 md:p-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-center mb-6">Please Login</h1>
          <p className="text-gray-600 mb-6 text-center">
            You need to be logged in to view your courses.
          </p>
          <div className="flex justify-center">
            <Link 
              href="/login" 
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Go to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (userVerified === false) {
    return (
      <div className="max-w-4xl mx-auto p-4 sm:p-6 md:p-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-center mb-6">Account Verification Required</h1>
          <p className="text-gray-600 mb-6 text-center">
            Your account needs to be verified before you can access your courses.
          </p>
          <div className="flex justify-center">
            <Link 
              href="/dashboard" 
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 md:p-8">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">My Courses</h1>
        <p className="text-gray-600">Manage and continue your enrolled courses</p>
      </div>

      {courses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <div key={course.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <h2 className="text-xl font-bold text-gray-800 mb-2">{course.title}</h2>
                  <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                    {course.department}
                  </span>
                </div>
                
                <p className="text-gray-600 mb-4 line-clamp-2">{course.description}</p>
                
                <div className="flex items-center text-sm text-gray-500 mb-2">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {course.duration}
                </div>
                
                <div className="flex items-center text-sm text-gray-500 mb-4">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Instructor: {course.instructor}
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-xs font-medium px-2.5 py-0.5 rounded bg-green-100 text-green-800">
                    Enrolled
                  </span>
                  <Link 
                    href={`/courses/${course.id}`}
                    className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-300"
                  >
                    Continue Learning
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <div className="flex flex-col items-center justify-center py-8">
            <svg className="w-16 h-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <h2 className="text-xl font-bold text-gray-800 mb-2">No Enrolled Courses</h2>
            <p className="text-gray-600 mb-6">You haven't enrolled in any courses yet.</p>
            <Link 
              href="/courses" 
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Browse Available Courses
            </Link>
          </div>
        </div>
      )}
    </div>
  );
} 