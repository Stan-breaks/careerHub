"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useSearchParams, useRouter } from "next/navigation";

interface Course {
  _id: string;
  title: string;
  description: string;
  duration: string;
  category: string;
  instructor: string;
  level: string;
  price: number;
  isActive: boolean;
  createdAt: string;
}

export default function AdminCourses() {
  const { data: session, status } = useSession();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [departments, setDepartments] = useState<string[]>([]);
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch("/api/admin/courses");
        
        if (response.ok) {
          const data = await response.json();
          setCourses(data.courses || []);
        } else {
          console.error("Failed to fetch courses");
        }
      } catch (error) {
        console.error("Error fetching courses:", error);
      } finally {
        setLoading(false);
      }
    };

    if (session?.user?.role === "admin") {
      fetchCourses();
    } else {
      setLoading(false);
    }
  }, [session]);

  const handleStatusChange = async (id: string, newStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/courses/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isActive: newStatus }),
      });

      if (response.ok) {
        // Update courses list
        setCourses(
          courses.map((course) =>
            course._id === id
              ? { ...course, isActive: newStatus }
              : course
          )
        );
      } else {
        console.error("Failed to update course status");
      }
    } catch (error) {
      console.error("Error updating course status:", error);
    }
  };

  const handleDeleteCourse = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this course?")) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/courses/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        // Remove course from list
        setCourses(courses.filter((course) => course._id !== id));
      } else {
        console.error("Failed to delete course");
      }
    } catch (error) {
      console.error("Error deleting course:", error);
    }
  };

  // Apply filters
  const filteredCourses = courses.filter((course) => {
    const matchesSearch = filter
      ? course.title.toLowerCase().includes(filter.toLowerCase()) ||
        course.description.toLowerCase().includes(filter.toLowerCase()) ||
        course.instructor.toLowerCase().includes(filter.toLowerCase())
      : true;

    const matchesCategory =
      categoryFilter === "all" ? true : course.category === categoryFilter;

    const matchesStatus =
      statusFilter === "all"
        ? true
        : statusFilter === "active"
        ? course.isActive
        : !course.isActive;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  if (status === "loading" || loading) {
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
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            Admin access required
          </h1>
          <p className="mb-4">You don't have permission to view this page.</p>
          <Link
            href="/dashboard"
            className="text-blue-600 hover:text-blue-800 underline"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h1 className="text-2xl font-bold mb-4 md:mb-0">Manage Courses</h1>
        <Link
          href="/admin/courses/new"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md inline-block"
        >
          + New Course
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <input
              type="text"
              id="search"
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="Search courses..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              id="category"
              className="w-full p-2 border border-gray-300 rounded-md"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="all">All Categories</option>
              <option value="programming">Programming</option>
              <option value="business">Business</option>
              <option value="design">Design</option>
              <option value="marketing">Marketing</option>
              <option value="science">Science</option>
            </select>
          </div>

          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              id="status"
              className="w-full p-2 border border-gray-300 rounded-md"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {filteredCourses.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <p className="text-gray-500">No courses found matching your criteria.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Instructor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCourses.map((course) => (
                <tr key={course._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {course.title}
                    </div>
                    <div className="text-sm text-gray-500 truncate max-w-xs">
                      {course.description}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      {course.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {course.instructor}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${course.price}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() =>
                        handleStatusChange(course._id, !course.isActive)
                      }
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        course.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {course.isActive ? "Active" : "Inactive"}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link
                      href={`/admin/courses/${course._id}/edit`}
                      className="text-indigo-600 hover:text-indigo-900 mr-4"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDeleteCourse(course._id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
} 