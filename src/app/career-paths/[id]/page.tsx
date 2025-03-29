"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

interface Assessment {
  id: string;
  title: string;
  description: string;
  type: string;
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

export default function CareerPathDetail() {
  const { data: session, status } = useSession();
  const params = useParams();
  const router = useRouter();
  const [careerPath, setCareerPath] = useState<CareerPath | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCareerPath = async () => {
      if (!params.id) return;
      
      try {
        setLoading(true);
        const response = await fetch(`/api/career-paths/${params.id}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            setError('Career path not found');
          } else {
            setError('Failed to load career path details');
          }
          setCareerPath(null);
          return;
        }
        
        const data = await response.json();
        setCareerPath(data.careerPath);
        setError(null);
      } catch (err) {
        console.error('Error fetching career path:', err);
        setError('An error occurred while loading the career path');
        setCareerPath(null);
      } finally {
        setLoading(false);
      }
    };

    if (session) {
      fetchCareerPath();
    } else {
      setLoading(false);
    }
  }, [session, params.id]);

  if (status === "loading" || loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please sign in to access career paths</h1>
          <Link href="/login" className="text-blue-600 hover:underline">Go to login</Link>
        </div>
      </div>
    );
  }

  if (error || !careerPath) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-2">{error || 'Career path not found'}</h2>
          <p className="text-gray-600 mb-4">We couldn't find the information you were looking for.</p>
          <Link 
            href="/career-paths" 
            className="inline-block text-blue-600 hover:text-blue-800 font-medium"
          >
            ← Back to Career Paths
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">{careerPath.title}</h1>
        <p className="text-lg text-gray-600">{careerPath.description}</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Required Skills</h2>
            <div className="flex flex-wrap gap-2 mb-6">
              {careerPath.requiredSkills.map((skill, index) => (
                <span key={index} className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
                  {skill}
                </span>
              ))}
            </div>
            
            <h2 className="text-xl font-bold text-gray-800 mb-4">Education Requirements</h2>
            <ul className="list-disc pl-5 space-y-2 text-gray-700 mb-6">
              {careerPath.educationRequirements.map((req, index) => (
                <li key={index}>{req}</li>
              ))}
            </ul>
            
            {careerPath.recommendedAssessments.length > 0 && (
              <>
                <h2 className="text-xl font-bold text-gray-800 mb-4">Recommended Assessments</h2>
                <div className="space-y-4">
                  {careerPath.recommendedAssessments.map((assessment) => (
                    <div key={assessment.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <h3 className="font-bold text-gray-800">{assessment.title}</h3>
                      <p className="text-gray-600 text-sm mb-2">{assessment.type.charAt(0).toUpperCase() + assessment.type.slice(1)} Assessment</p>
                      <p className="text-gray-700 mb-3">{assessment.description}</p>
                      <Link 
                        href={`/assessments/${assessment.id}`}
                        className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                      >
                        Take Assessment →
                      </Link>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
        
        <div>
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Salary Information</h2>
            <div className="space-y-4">
              <div className="border-b pb-3">
                <h3 className="font-medium text-gray-700">Entry Level</h3>
                <p className="text-2xl font-bold text-green-600">${careerPath.averageSalary.entry.toLocaleString()}</p>
              </div>
              <div className="border-b pb-3">
                <h3 className="font-medium text-gray-700">Mid-Career</h3>
                <p className="text-2xl font-bold text-green-600">${careerPath.averageSalary.mid.toLocaleString()}</p>
              </div>
              <div>
                <h3 className="font-medium text-gray-700">Senior Level</h3>
                <p className="text-2xl font-bold text-green-600">${careerPath.averageSalary.senior.toLocaleString()}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Growth Potential</h2>
            <div className="flex items-center mb-2">
              {[...Array(5)].map((_, i) => (
                <svg 
                  key={i} 
                  className={`w-7 h-7 ${i < careerPath.growthPotential ? 'text-yellow-400' : 'text-gray-300'}`} 
                  fill="currentColor" 
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
              <span className="ml-2 text-lg font-bold">{careerPath.growthPotential}/5</span>
            </div>
            <p className="text-gray-600">
              {careerPath.growthPotential >= 4 
                ? "This career path has excellent growth opportunities with high demand projected for the future."
                : careerPath.growthPotential >= 3
                  ? "This career path has good growth opportunities with steady demand projected."
                  : "This career path has moderate growth opportunities."}
            </p>
          </div>
          
          <div className="bg-blue-50 rounded-lg shadow-md p-6 border border-blue-100">
            <h2 className="text-xl font-bold text-blue-800 mb-4">Next Steps</h2>
            <p className="text-blue-700 mb-4">
              Take an assessment to see if this career path matches your skills and interests.
            </p>
            <Link 
              href="/assessments" 
              className="block w-full bg-blue-600 hover:bg-blue-700 text-white text-center font-medium py-2 px-4 rounded-md transition-colors duration-300"
            >
              Explore Assessments
            </Link>
          </div>
        </div>
      </div>
      
      <div className="mt-8 text-center">
        <Link 
          href="/career-paths" 
          className="inline-block text-blue-600 hover:text-blue-800 font-medium"
        >
          ← Back to Career Paths
        </Link>
      </div>
    </div>
  );
} 