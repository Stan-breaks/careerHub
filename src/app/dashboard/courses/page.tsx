"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

type Course = {
  _id: string;
  title: string;
  code: string;
  department: string;
  description: string;
  duration: number;
  careerPathways: string[];
  requirements: string[];
  skillsDeveloped: string[];
  isActive: boolean;
};

export default function Courses() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState(searchParams.get("department") || "all");
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [departments, setDepartments] = useState<string[]>([]);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        
        let url = "/api/courses?active=true";
        if (departmentFilter !== "all") {
          url += `&department=${encodeURIComponent(departmentFilter)}`;
        }
        
        const res = await fetch(url);
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || "Failed to fetch courses");
        }

        setCourses(data.courses);
        
        // Extract unique departments for filter dropdown
        const uniqueDepartments = Array.from(
          new Set(data.courses.map((course: Course) => course.department))
        );
        setDepartments(uniqueDepartments as string[]);
        
        setLoading(false);
      } catch (error: any) {
        setError(error.message);
        setLoading(false);
      }
    };

    if (session) {
      fetchCourses();
    }
  }, [session, departmentFilter]);

  const handleDepartmentFilterChange = (value: string) => {
    setDepartmentFilter(value);
    // Update URL query parameter without page refresh
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all") {
      params.delete("department");
    } else {
      params.set("department", value);
    }
    router.push(`/dashboard/courses?${params.toString()}`);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const handleSearchSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (searchQuery) {
      params.set("search", searchQuery);
    } else {
      params.delete("search");
    }
    router.push(`/dashboard/courses?${params.toString()}`);
  };

  // Filter courses based on search query
  const filteredCourses = courses.filter((course) => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      course.title.toLowerCase().includes(query) ||
      course.code.toLowerCase().includes(query) ||
      course.description.toLowerCase().includes(query) ||
      course.careerPathways.some(path => path.toLowerCase().includes(query))
    );
  });

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
            <h3 className="text-sm font-medium text-red-800">Error loading courses</h3>
            <div className="mt-2 text-sm text-red-700">{error}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="pb-5 border-b border-gray-200 sm:flex sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Courses</h1>
      </div>

      <div className="mt-6">
        <p className="text-sm text-gray-500 mb-6">
          Explore university courses and academic programs that match your interests and career goals.
        </p>

        {/* Search and Filter */}
        <div className="mb-8 space-y-4 sm:flex sm:items-center sm:space-y-0 sm:space-x-4">
          <form onSubmit={handleSearchSubmit} className="sm:flex-1">
            <div className="relative rounded-md shadow-sm">
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Search courses by title, code or description"
                className="block w-full pr-10 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm border-gray-300 rounded-md"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <button type="submit">
                  <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </form>
          <div>
            <select
              id="department-filter"
              value={departmentFilter}
              onChange={(e) => handleDepartmentFilterChange(e.target.value)}
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            >
              <option value="all">All Departments</option>
              {departments.map((department) => (
                <option key={department} value={department}>
                  {department}
                </option>
              ))}
            </select>
          </div>
        </div>

        {filteredCourses.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <svg className="mx-auto h-12 w-12 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No courses found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchQuery
                ? `No courses match your search for "${searchQuery}"`
                : departmentFilter !== "all"
                ? `No courses found in the ${departmentFilter} department`
                : "No courses are currently available."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {filteredCourses.map((course) => (
              <div key={course._id} className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mb-2">
                        {course.code}
                      </span>
                      <h3 className="text-lg leading-6 font-medium text-gray-900">
                        {course.title}
                      </h3>
                      <p className="mt-1 max-w-2xl text-sm text-gray-500">
                        {course.department} • {course.duration} {course.duration > 1 ? "years" : "year"}
                      </p>
                    </div>
                    <Link
                      href={`/dashboard/courses/${course._id}`}
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      View Details
                    </Link>
                  </div>
                  <div className="mt-4">
                    <p className="text-sm text-gray-500">{course.description}</p>
                  </div>
                  {course.careerPathways.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-700">Career Pathways:</h4>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {course.careerPathways.map((pathway, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
                          >
                            {pathway}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 