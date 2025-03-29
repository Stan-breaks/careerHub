"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { useState, useEffect } from "react";

interface Assessment {
  id: string;
  title: string;
  description: string;
}

interface AverageSalary {
  entry: number;
  mid: number;
  senior: number;
}

interface CareerPath {
  id: string;
  title: string;
  description: string;
  requiredSkills: string[];
  recommendedAssessments: Assessment[];
  averageSalary: AverageSalary;
  growthPotential: number;
  educationRequirements: string[];
}

export default function CareerPaths() {
  const { data: session, status } = useSession();
  const [careerPaths, setCareerPaths] = useState<CareerPath[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCareerPaths = async () => {
      try {
        const response = await fetch('/api/career-paths');
        if (response.ok) {
          const data = await response.json();
          setCareerPaths(data.careerPaths || []);
        } else {
          console.error("Failed to fetch career paths:", response.statusText);
          setCareerPaths([]);
        }
      } catch (error) {
        console.error("Error fetching career paths:", error);
        setCareerPaths([]);
      } finally {
        setLoading(false);
      }
    };

    if (session) {
      fetchCareerPaths();
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
        <h1 className="text-2xl font-bold mb-4">Please sign in to explore career paths</h1>
        <Link href="/login" className="text-blue-600 hover:underline">Go to login</Link>
      </div>
    </div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-3">Explore Career Paths</h1>
      
      <p className="text-lg text-gray-700 mb-8">
        Discover career paths that match your skills and interests. Take assessments to find your best fit.
      </p>
      
      {careerPaths.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {careerPaths.map((career) => (
            <div key={career.id} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">{career.title}</h2>
                <p className="text-gray-600 mb-4">{career.description}</p>
                
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">Key Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {career.requiredSkills.map((skill, index) => (
                      <span key={index} className="bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">Average Salary</h3>
                    <div className="space-y-1 text-gray-600">
                      <p><span className="font-medium">Entry Level:</span> ${career.averageSalary.entry.toLocaleString()}</p>
                      <p><span className="font-medium">Mid-Career:</span> ${career.averageSalary.mid.toLocaleString()}</p>
                      <p><span className="font-medium">Senior Level:</span> ${career.averageSalary.senior.toLocaleString()}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">Growth Potential</h3>
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <svg 
                          key={i} 
                          className={`w-5 h-5 ${i < career.growthPotential ? 'text-yellow-400' : 'text-gray-300'}`} 
                          fill="currentColor" 
                          viewBox="0 0 20 20"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                      <span className="ml-2 text-gray-600">{career.growthPotential}/5</span>
                    </div>
                    
                    <h3 className="text-lg font-semibold text-gray-700 mt-4 mb-2">Education</h3>
                    <ul className="list-disc pl-5 space-y-1 text-gray-600">
                      {career.educationRequirements.map((req, index) => (
                        <li key={index}>{req}</li>
                      ))}
                    </ul>
                  </div>
                </div>
                
                {career.recommendedAssessments.length > 0 && (
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">Recommended Assessments</h3>
                    <ul className="list-disc pl-5 space-y-1 text-gray-600">
                      {career.recommendedAssessments.map((assessment) => (
                        <li key={assessment.id}>
                          <Link 
                            href={`/assessments/${assessment.id}`} 
                            className="text-blue-600 hover:underline"
                          >
                            {assessment.title}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                <div className="mt-4 pt-4 border-t border-gray-200 text-center">
                  <Link 
                    href="/assessments"
                    className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-300"
                  >
                    Take an Assessment
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <h2 className="text-xl font-semibold text-gray-700 mb-2">No career paths available yet</h2>
          <p className="text-gray-600 mb-4">Career paths will be added based on industry demand and platform growth.</p>
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