"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "react-hot-toast";

interface Instructor {
  id: string | null;
  name: string;
  email: string | null;
}

interface Course {
  id: string;
  title: string;
  code: string;
  department: string;
  description: string;
  duration: string;
  instructor: Instructor;
  level: string;
  category: string;
  requirements: string[];
  skillsDeveloped: string[];
  careerPathways: string[];
  price: number;
}

export default function CourseDetail({ params }: { params: { id: string } }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userVerified, setUserVerified] = useState<boolean | null>(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    const checkUserVerification = async () => {
      if (status === 'authenticated' && session) {
        try {
          const res = await fetch('/api/auth/verify-user-status');
          const data = await res.json();
          setUserVerified(data.isVerified);
        } catch (err) {
          console.error('Error checking verification status:', err);
          setUserVerified(false);
        }
      }
    };

    const fetchCourse = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/courses/${params.id}`);
        
        if (!res.ok) {
          throw new Error(`Failed to fetch course: ${res.status}`);
        }
        
        const data = await res.json();
        setCourse(data.course);
        setError(null);
      } catch (err) {
        console.error('Error fetching course:', err);
        setError('Failed to load course details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (status !== 'loading') {
      checkUserVerification();
      fetchCourse();
    }
  }, [status, session, params.id]);

  const handleEnroll = async () => {
    if (!session) {
      router.push('/login');
      return;
    }

    if (!userVerified) {
      toast.error('You need to verify your account before enrolling in courses.');
      return;
    }

    try {
      setEnrolling(true);
      
      const res = await fetch('/api/courses/enroll', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ courseId: params.id }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to enroll in course');
      }
      
      setIsEnrolled(true);
      toast.success('Successfully enrolled in course!');
    } catch (err: any) {
      console.error('Error enrolling in course:', err);
      toast.error(err.message || 'Failed to enroll. Please try again.');
    } finally {
      setEnrolling(false);
    }
  };

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
            You need to be logged in to view course details.
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

  if (error || !course) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-center mb-6">Error</h1>
          <p className="text-red-500 mb-6 text-center">
            {error || 'Course not found'}
          </p>
          <div className="flex justify-center">
            <Link 
              href="/courses" 
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Back to Courses
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 md:p-8">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* Course Header */}
        <div className="bg-blue-600 text-white p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold mb-2">{course.title}</h1>
              <p className="text-blue-100">{course.code} • {course.department}</p>
            </div>
            <div className="mt-4 md:mt-0">
              <span className="bg-white text-blue-600 py-1 px-3 rounded-full font-medium text-sm">
                {course.level}
              </span>
            </div>
          </div>
        </div>
        
        {/* Course Details */}
        <div className="p-6">
          <div className="flex flex-col md:flex-row mb-6">
            <div className="w-full md:w-2/3 md:pr-6">
              <h2 className="text-xl font-semibold mb-3">About this Course</h2>
              <p className="text-gray-700 mb-6">{course.description}</p>
              
              <h2 className="text-xl font-semibold mb-3">What You'll Learn</h2>
              <ul className="list-disc pl-5 mb-6">
                {course.skillsDeveloped.map((skill, index) => (
                  <li key={index} className="text-gray-700 mb-1">{skill}</li>
                ))}
              </ul>
              
              <h2 className="text-xl font-semibold mb-3">Requirements</h2>
              <ul className="list-disc pl-5">
                {course.requirements.map((req, index) => (
                  <li key={index} className="text-gray-700 mb-1">{req}</li>
                ))}
              </ul>
            </div>
            
            <div className="w-full md:w-1/3 mt-6 md:mt-0">
              <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
                <div className="mb-4">
                  <h3 className="font-semibold text-gray-800">Instructor</h3>
                  <p className="text-gray-600">{course.instructor.name}</p>
                </div>
                
                <div className="mb-4">
                  <h3 className="font-semibold text-gray-800">Duration</h3>
                  <p className="text-gray-600">{course.duration}</p>
                </div>
                
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-800">Price</h3>
                  <p className="text-gray-900 font-bold text-xl">
                    {course.price === 0 ? "Free" : `$${course.price}`}
                  </p>
                </div>
                
                <button
                  onClick={handleEnroll}
                  disabled={!userVerified || isEnrolled || enrolling}
                  className={`w-full py-3 px-4 rounded-md text-white font-medium transition-colors ${
                    !userVerified 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : isEnrolled 
                        ? 'bg-green-600' 
                        : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {enrolling ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Enrolling...
                    </span>
                  ) : isEnrolled ? (
                    'Enrolled'
                  ) : !userVerified ? (
                    'Verification Required'
                  ) : (
                    'Enroll Now'
                  )}
                </button>
              </div>
            </div>
          </div>
          
          <div className="mt-8 border-t pt-6">
            <h2 className="text-xl font-semibold mb-3">Career Pathways</h2>
            <div className="flex flex-wrap gap-2">
              {course.careerPathways.map((pathway, index) => (
                <span key={index} className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">
                  {pathway}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-8 text-center">
        <Link 
          href="/courses" 
          className="inline-block text-blue-600 hover:text-blue-800 font-medium"
        >
          ← Back to Courses
        </Link>
      </div>
    </div>
  );
} 