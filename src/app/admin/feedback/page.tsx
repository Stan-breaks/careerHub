"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

interface Feedback {
  _id: string;
  type: string;
  content: string;
  status: string;
  user: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
}

export default function AdminFeedback() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const typeFilter = searchParams?.get("type") || "all";
  const statusFilter = searchParams?.get("status") || "all";

  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        setLoading(true);
        
        // Build query parameters
        const params = new URLSearchParams();
        if (typeFilter !== "all") params.append("type", typeFilter);
        if (statusFilter !== "all") params.append("status", statusFilter);
        
        const response = await fetch(`/api/feedback?${params.toString()}`);
        
        if (!response.ok) {
          throw new Error("Failed to fetch feedback");
        }
        
        const data = await response.json();
        setFeedback(data);
      } catch (err) {
        console.error("Error fetching feedback:", err);
        setError("Failed to load feedback. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    if (session?.user?.role === "admin") {
      fetchFeedback();
    }
  }, [session, typeFilter, statusFilter]);

  const updateFeedbackStatus = async (id: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/feedback/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error("Failed to update feedback status");
      }

      // Update the local state
      setFeedback(prevFeedback => 
        prevFeedback.map(item => 
          item._id === id ? { ...item, status: newStatus } : item
        )
      );
    } catch (err) {
      console.error("Error updating feedback status:", err);
      setError("Failed to update feedback status. Please try again.");
    }
  };

  const handleFilterChange = (type: string, value: string) => {
    const params = new URLSearchParams(searchParams?.toString());
    params.set(type, value);
    router.push(`/admin/feedback?${params.toString()}`);
  };

  if (status === "loading") {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!session || session.user.role !== "admin") {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="mb-4">You do not have permission to view this page.</p>
          <button
            onClick={() => router.push("/dashboard")}
            className="text-blue-600 hover:underline"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Feedback Management</h1>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex flex-col md:flex-row md:space-x-4 space-y-4 md:space-y-0 mb-6">
          <div>
            <label htmlFor="typeFilter" className="block text-sm font-medium text-gray-700 mb-1">
              Type
            </label>
            <select
              id="typeFilter"
              className="w-full p-2 border border-gray-300 rounded-md"
              value={typeFilter}
              onChange={(e) => handleFilterChange("type", e.target.value)}
            >
              <option value="all">All Types</option>
              <option value="general">General Feedback</option>
              <option value="bug">Bug Report</option>
              <option value="feature">Feature Request</option>
              <option value="content">Content-related</option>
            </select>
          </div>

          <div>
            <label htmlFor="statusFilter" className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              id="statusFilter"
              className="w-full p-2 border border-gray-300 rounded-md"
              value={statusFilter}
              onChange={(e) => handleFilterChange("status", e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="inProgress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="dismissed">Dismissed</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : feedback.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No feedback found matching the selected filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Content
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {feedback.map((item) => (
                  <tr key={item._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{item.user.name}</div>
                      <div className="text-sm text-gray-500">{item.user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${item.type === 'bug' ? 'bg-red-100 text-red-800' : 
                          item.type === 'feature' ? 'bg-green-100 text-green-800' : 
                          item.type === 'content' ? 'bg-purple-100 text-purple-800' : 
                          'bg-blue-100 text-blue-800'}`}
                      >
                        {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-md overflow-hidden text-ellipsis">
                        {item.content}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${item.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                          item.status === 'inProgress' ? 'bg-blue-100 text-blue-800' : 
                          item.status === 'resolved' ? 'bg-green-100 text-green-800' : 
                          'bg-gray-100 text-gray-800'}`}
                      >
                        {item.status === 'inProgress' ? 'In Progress' : 
                         item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <select
                        className="border border-gray-300 rounded-md p-1 text-xs"
                        value={item.status}
                        onChange={(e) => updateFeedbackStatus(item._id, e.target.value)}
                      >
                        <option value="pending">Pending</option>
                        <option value="inProgress">In Progress</option>
                        <option value="resolved">Resolved</option>
                        <option value="dismissed">Dismissed</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
} 