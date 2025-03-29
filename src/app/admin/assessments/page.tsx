"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useSearchParams, useRouter } from "next/navigation";

type Assessment = {
  _id: string;
  title: string;
  description: string;
  type: 'personality' | 'career' | 'academic';
  questions: string[];
  createdBy: {
    _id: string;
    name: string;
  };
  isActive: boolean;
  createdAt: string;
};

export default function AssessmentsManagement() {
  const { data: session } = useSession();
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const searchParams = useSearchParams();
  const router = useRouter();

  // Fetch assessments with filters
  useEffect(() => {
    const fetchAssessments = async () => {
      try {
        setLoading(true);
        const type = searchParams.get('type') || 'all';
        const status = searchParams.get('status') || 'all';
        
        setTypeFilter(type);
        setStatusFilter(status);

        const queryParams = new URLSearchParams({
          ...(type !== 'all' && { type }),
          ...(status !== 'all' && { isActive: status === 'active' ? 'true' : 'false' })
        });

        const response = await fetch(`/api/admin/assessments?${queryParams}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch assessments');
        }
        
        const data = await response.json();
        setAssessments(data.assessments);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (session?.user?.role === 'admin') {
      fetchAssessments();
    }
  }, [session, searchParams]);

  const handleTypeFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateFilters({ type: e.target.value });
  };

  const handleStatusFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateFilters({ status: e.target.value });
  };

  const updateFilters = (newParams: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    
    // Update or add new parameters
    Object.entries(newParams).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });
    
    router.push(`/admin/assessments?${params.toString()}`);
  };

  const toggleAssessmentStatus = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/assessments/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isActive: !currentStatus })
      });

      if (!response.ok) {
        throw new Error('Failed to update assessment status');
      }

      // Update the local state
      setAssessments((prev) =>
        prev.map((assessment) =>
          assessment._id === id
            ? { ...assessment, isActive: !currentStatus }
            : assessment
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
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
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
        Error: {error}
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Assessments Management</h1>
        <Link
          href="/admin/assessments/new"
          className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md flex items-center"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
          </svg>
          Create Assessment
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg mb-6">
        <div className="p-4 flex flex-col md:flex-row gap-4">
          <div className="w-full md:w-40">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Assessment Type
            </label>
            <select
              className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={typeFilter}
              onChange={handleTypeFilterChange}
            >
              <option value="all">All Types</option>
              <option value="personality">Personality</option>
              <option value="career">Career</option>
              <option value="academic">Academic</option>
            </select>
          </div>

          <div className="w-full md:w-40">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={statusFilter}
              onChange={handleStatusFilterChange}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Assessments Grid */}
      {assessments.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {assessments.map((assessment) => (
            <div
              key={assessment._id}
              className="bg-white rounded-lg shadow overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="p-5">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      {assessment.title}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {new Date(assessment.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                      assessment.isActive
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {assessment.isActive ? "Active" : "Inactive"}
                  </span>
                </div>

                <div className="mt-3">
                  <span
                    className={`inline-block px-2 py-1 text-xs font-medium rounded-full 
                    ${
                      assessment.type === "personality"
                        ? "bg-purple-100 text-purple-800"
                        : assessment.type === "career"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {assessment.type.charAt(0).toUpperCase() + assessment.type.slice(1)}
                  </span>
                </div>

                <p className="mt-3 text-sm text-gray-600 line-clamp-2">
                  {assessment.description}
                </p>

                <div className="mt-4 flex flex-wrap items-center text-sm text-gray-600">
                  <div className="flex items-center mr-4">
                    <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    {assessment.questions.length} Questions
                  </div>
                  <div className="flex items-center">
                    <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                    </svg>
                    {assessment.createdBy?.name || 'Admin'}
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 px-5 py-3 border-t border-gray-200 flex justify-between">
                <div className="flex space-x-2">
                  <Link
                    href={`/admin/assessments/${assessment._id}`}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    View Details
                  </Link>
                  <span className="text-gray-300">|</span>
                  <Link
                    href={`/admin/assessments/${assessment._id}/edit`}
                    className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                  >
                    Edit
                  </Link>
                </div>
                <button
                  onClick={() => toggleAssessmentStatus(assessment._id, assessment.isActive)}
                  className={`text-sm font-medium ${
                    assessment.isActive
                      ? "text-red-600 hover:text-red-800"
                      : "text-green-600 hover:text-green-800"
                  }`}
                >
                  {assessment.isActive ? "Deactivate" : "Activate"}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg p-6 text-center">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            ></path>
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No assessments found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by creating a new assessment.
          </p>
          <div className="mt-6">
            <Link
              href="/admin/assessments/new"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg
                className="-ml-1 mr-2 h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 4v16m8-8H4"
                ></path>
              </svg>
              Create Assessment
            </Link>
          </div>
        </div>
      )}
    </div>
  );
} 