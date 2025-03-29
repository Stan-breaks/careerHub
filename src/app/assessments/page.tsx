"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { useState, useEffect } from "react";

interface Assessment {
  id: string;
  title: string;
  description: string;
  duration: string;
  questions: number;
  category: string;
}

export default function Assessments() {
  const { data: session, status } = useSession();
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [filter, setFilter] = useState("all");
  const [userVerified, setUserVerified] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Check verification status
        if (session?.user?.id) {
          const verificationResponse = await fetch('/api/auth/verify-user-status');
          if (verificationResponse.ok) {
            const verificationData = await verificationResponse.json();
            setUserVerified(verificationData.isVerified);
          }
        }

        // Fetch assessments from the API
        const assessmentsResponse = await fetch('/api/assessments');
        if (assessmentsResponse.ok) {
          const data = await assessmentsResponse.json();
          setAssessments(data.assessments || []);
        } else {
          console.error("Failed to fetch assessments:", assessmentsResponse.statusText);
          setAssessments([]);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setAssessments([]);
      } finally {
        setLoading(false);
      }
    };

    if (session) {
      fetchData();
    } else {
      setLoading(false);
    }
  }, [session]);

  if (status === "loading" || loading) {
    return <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>;
  }

  if (!session) {
    return <div className="flex justify-center items-center h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Please sign in to access assessments</h1>
        <Link href="/login" className="text-blue-600 hover:underline">Go to login</Link>
      </div>
    </div>;
  }

  const filteredAssessments = filter === "all" 
    ? assessments 
    : assessments.filter(a => a.category === filter);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Assessments</h1>
          <p className="mt-2 text-gray-600">
            Take assessments to discover your strengths, skills, and career matches
          </p>
        </div>

        {assessments.length > 0 && (
          <div className="mt-4 md:mt-0">
            <select 
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Types</option>
              <option value="personality">Personality</option>
              <option value="career">Career</option>
              <option value="academic">Academic</option>
            </select>
          </div>
        )}
      </div>

      {userVerified === false && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                Your account is pending verification. You can browse assessments but must be verified to take them.
              </p>
            </div>
          </div>
        </div>
      )}
      
      {assessments.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredAssessments.map((assessment) => (
              <div key={assessment.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-6">
                  <div className="flex justify-between items-start">
                    <h2 className="text-xl font-bold text-gray-800 mb-2">{assessment.title}</h2>
                    <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                      {assessment.category}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 mb-4">{assessment.description}</p>
                  
                  <div className="flex items-center text-sm text-gray-500 mb-4">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {assessment.duration} • {assessment.questions} questions
                  </div>
                  
                  <Link 
                    href={`/assessments/${assessment.id}`}
                    className={`inline-block font-medium py-2 px-4 rounded-md transition-colors duration-300 ${
                      userVerified === false
                        ? "bg-gray-300 cursor-not-allowed text-gray-600" 
                        : "bg-blue-600 hover:bg-blue-700 text-white"
                    }`}
                    onClick={e => userVerified === false && e.preventDefault()}
                  >
                    {userVerified === false ? "Verification Required" : "Start Assessment"}
                  </Link>
                </div>
              </div>
            ))}
          </div>
          
          {filteredAssessments.length === 0 && (
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <p className="text-lg text-gray-600">No assessments found in this category.</p>
            </div>
          )}
        </>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <h2 className="text-xl font-semibold text-gray-700 mb-2">No assessments available yet</h2>
          <p className="text-gray-600 mb-4">Check back soon for new assessments to help guide your career journey.</p>
        </div>
      )}
      
      <div className="mt-8 text-center">
        <Link 
          href="/dashboard" 
          className="inline-block text-blue-600 hover:text-blue-800 font-medium"
        >
          ← Back to Dashboard
        </Link>
      </div>
    </div>
  );
} 