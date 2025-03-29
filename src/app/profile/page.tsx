"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

interface UserData {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  isVerified: boolean;
  profileImage?: string;
  createdAt: string;
  lastLogin?: string;
}

interface AssessmentResult {
  id: string;
  assessmentId: string;
  assessmentTitle: string;
  assessmentType: string;
  score: number;
  recommendations: string[];
  completedAt: string;
}

export default function Profile() {
  const { data: session, status } = useSession();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [assessmentResults, setAssessmentResults] = useState<AssessmentResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'profile' | 'assessments'>('profile');

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch("/api/users/me");
        if (response.ok) {
          const data = await response.json();
          setUserData(data.user);
          setAssessmentResults(data.assessmentResults || []);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };

    if (session) {
      fetchUserData();
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
        <h1 className="text-2xl font-bold mb-4">Please sign in to view your profile</h1>
        <Link href="/login" className="text-blue-600 hover:underline">Go to login</Link>
      </div>
    </div>;
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
        <div className="bg-blue-600 p-6">
          <div className="flex items-center">
            <div className="h-20 w-20 rounded-full bg-white flex items-center justify-center text-blue-600 text-3xl font-bold">
              {session.user.name?.[0]?.toUpperCase()}
            </div>
            <div className="ml-6">
              <h1 className="text-2xl font-bold text-white">{session.user.name}</h1>
              <p className="text-blue-100">{session.user.email}</p>
            </div>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex">
            <button 
              onClick={() => setActiveTab('profile')}
              className={`py-4 px-6 font-medium text-sm focus:outline-none ${
                activeTab === 'profile' 
                  ? 'border-b-2 border-blue-500 text-blue-600' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Profile Information
            </button>
            <button 
              onClick={() => setActiveTab('assessments')}
              className={`py-4 px-6 font-medium text-sm focus:outline-none ${
                activeTab === 'assessments' 
                  ? 'border-b-2 border-blue-500 text-blue-600' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Assessment Results
              {assessmentResults.length > 0 && (
                <span className="ml-2 bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                  {assessmentResults.length}
                </span>
              )}
            </button>
          </nav>
        </div>
        
        <div className="p-6">
          {activeTab === 'profile' && (
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Personal Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-sm text-gray-500">Name</p>
                  <p className="font-medium">{userData?.name}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{userData?.email}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Role</p>
                  <p className="font-medium">{userData?.role}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Verification Status</p>
                  <p className={`font-medium ${userData?.isVerified ? 'text-green-600' : 'text-yellow-600'}`}>
                    {userData?.isVerified ? "Verified" : "Pending Verification"}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Account Created</p>
                  <p className="font-medium">{userData?.createdAt ? formatDate(userData.createdAt) : 'N/A'}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Last Login</p>
                  <p className="font-medium">{userData?.lastLogin ? formatDate(userData.lastLogin) : 'N/A'}</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'assessments' && (
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Assessment History</h2>
              
              {assessmentResults.length > 0 ? (
                <div className="space-y-6">
                  {assessmentResults.map((result) => (
                    <div key={result.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-medium text-gray-800">{result.assessmentTitle}</h3>
                          <p className="text-sm text-gray-500">
                            Completed on {new Date(result.completedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded capitalize">
                          {result.assessmentType}
                        </span>
                      </div>
                      
                      <div className="mb-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-gray-700">Score</span>
                          <span className="text-sm font-bold text-blue-600">{result.score}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div 
                            className="bg-blue-600 h-2.5 rounded-full" 
                            style={{ width: `${Math.min(100, (result.score / 100) * 100)}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      {result.recommendations && result.recommendations.length > 0 && (
                        <div>
                          <h4 className="text-sm font-semibold text-gray-700 mb-2">Recommendations</h4>
                          <ul className="text-sm text-gray-600 space-y-1 pl-5 list-disc">
                            {result.recommendations.map((recommendation, index) => (
                              <li key={index}>{recommendation}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {/* View Assessment Link */}
                      <div className="mt-3 pt-2 border-t border-gray-200">
                        <Link 
                          href={`/assessments/${result.assessmentId}`}
                          className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                        >
                          Take this assessment again
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
                  <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h3 className="text-lg font-medium text-gray-900 mb-1">No Assessment Results Yet</h3>
                  <p className="text-gray-500 mb-4">You haven't completed any assessments yet.</p>
                  <Link 
                    href="/assessments" 
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Browse available assessments
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
          <Link 
            href="/dashboard" 
            className="inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
} 