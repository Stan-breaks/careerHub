"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

type Assessment = {
  _id: string;
  title: string;
  description: string;
  type: "personality" | "career" | "academic";
  questions: any[];
  createdBy: {
    name: string;
    email: string;
  };
  isActive: boolean;
  createdAt: string;
};

export default function Assessments() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState(searchParams.get("type") || "all");

  useEffect(() => {
    const fetchAssessments = async () => {
      try {
        setLoading(true);
        
        const url = filter === "all" 
          ? "/api/assessments"
          : `/api/assessments?type=${filter}&active=true`;
        
        const res = await fetch(url);
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || "Failed to fetch assessments");
        }

        setAssessments(data.assessments);
        setLoading(false);
      } catch (error: any) {
        setError(error.message);
        setLoading(false);
      }
    };

    if (session) {
      fetchAssessments();
    }
  }, [session, filter]);

  const handleFilterChange = (value: string) => {
    setFilter(value);
    // Update URL query parameter without page refresh
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all") {
      params.delete("type");
    } else {
      params.set("type", value);
    }
    router.push(`/dashboard/assessments?${params.toString()}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-md">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error loading assessments</h3>
            <div className="mt-2 text-sm text-red-700">{error}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="pb-5 border-b border-gray-200 sm:flex sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Assessments</h1>
      </div>

      <div className="mt-6">
        <p className="text-sm text-gray-500 mb-4">
          Take assessments to discover your personality traits, career interests, and academic preferences.
          These assessments will help generate personalized recommendations for courses and career paths.
        </p>

        {/* Filter */}
        <div className="mb-6">
          <label htmlFor="filter" className="block text-sm font-medium text-gray-700 mb-1">
            Filter by type:
          </label>
          <select
            id="filter"
            value={filter}
            onChange={(e) => handleFilterChange(e.target.value)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
          >
            <option value="all">All types</option>
            <option value="personality">Personality</option>
            <option value="career">Career</option>
            <option value="academic">Academic</option>
          </select>
        </div>

        {assessments.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <svg className="mx-auto h-12 w-12 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No assessments found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {filter === "all" 
                ? "No assessments are currently available." 
                : `No ${filter} assessments are currently available.`}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {assessments.map((assessment) => (
              <div key={assessment._id} className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center">
                    <div className={`flex-shrink-0 rounded-md p-3 ${
                      assessment.type === "personality" ? "bg-purple-500" :
                      assessment.type === "career" ? "bg-blue-500" : "bg-green-500"
                    }`}>
                      <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        {assessment.type === "personality" ? (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        ) : assessment.type === "career" ? (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        ) : (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        )}
                      </svg>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 uppercase">
                          {assessment.type}
                        </dt>
                        <dd>
                          <h3 className="text-lg font-medium text-gray-900">{assessment.title}</h3>
                        </dd>
                      </dl>
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-sm text-gray-500">
                      {assessment.description}
                    </p>
                  </div>
                  <div className="mt-4 text-sm text-gray-500">
                    <span>{assessment.questions.length} questions</span>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-4 sm:px-6">
                  <div className="text-sm">
                    <Link
                      href={`/dashboard/assessments/${assessment._id}`}
                      className="font-medium text-blue-600 hover:text-blue-500"
                    >
                      Take this assessment<span aria-hidden="true"> &rarr;</span>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 