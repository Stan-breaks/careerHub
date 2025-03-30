"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { use } from 'react';

interface Option {
  id: string | null;
  text: string;
  value: number;
}

interface Question {
  id: string;
  text: string;
  options: Option[];
}

interface Assessment {
  id: string;
  title: string;
  description: string;
  type: string;
  questions: Question[];
}

interface Answer {
  questionId: string;
  selectedOption: string;
}

interface CourseRecommendation {
  courseId: string;
  title: string;
  code: string;
  description: string;
  duration: string;
  level: string;
  skillsDeveloped: string[];
  careerPathways: string[];
  score: number;
  matchFactors: {
    [key: string]: number;
  };
}

interface Result {
  score: number;
  recommendations: string[];
  recommendedCourses: CourseRecommendation[];
  completedAt: string;
}

export default function AssessmentDetail({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { data: session, status } = useSession();
  const router = useRouter();
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [userVerified, setUserVerified] = useState<boolean | null>(null);

  useEffect(() => {
    const checkVerification = async () => {
      try {
        const response = await fetch('/api/auth/verify-user-status');
        if (response.ok) {
          const data = await response.json();
          setUserVerified(data.isVerified);
        }
      } catch (error) {
        console.error("Error checking verification status:", error);
      }
    };

    const fetchAssessment = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/assessments/${resolvedParams.id}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch assessment: ${response.statusText}`);
        }
        
        const data = await response.json();
        setAssessment(data.assessment);
      } catch (error) {
        console.error("Error fetching assessment:", error);
        setError(error instanceof Error ? error.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    if (session) {
      checkVerification();
      fetchAssessment();
    }
  }, [session, resolvedParams.id]);

  const handleOptionSelect = (optionId: string) => {
    setSelectedOption(optionId);
  };

  const handleNextQuestion = () => {
    if (selectedOption) {
      // Save the answer
      const updatedAnswers = [...answers];
      updatedAnswers[currentQuestion] = {
        questionId: assessment!.questions[currentQuestion].id,
        selectedOption: selectedOption
      };
      setAnswers(updatedAnswers);
      
      // Move to next question or submit if on last question
      if (currentQuestion < assessment!.questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedOption(null);
      } else {
        handleSubmit(updatedAnswers);
      }
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      setSelectedOption(answers[currentQuestion - 1]?.selectedOption || null);
    }
  };

  const handleSubmit = async (finalAnswers: Answer[]) => {
    try {
      setSubmitting(true);
      
      const response = await fetch(`/api/assessments/${resolvedParams.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ answers: finalAnswers })
      });
      
      if (!response.ok) {
        throw new Error('Failed to submit assessment');
      }
      
      const data = await response.json();
      setResult(data.result);
    } catch (error) {
      console.error("Error submitting assessment:", error);
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setSubmitting(false);
    }
  };

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
          <h1 className="text-2xl font-bold mb-4">Please sign in to access assessments</h1>
          <Link href="/login" className="text-blue-600 hover:underline">Go to login</Link>
        </div>
      </div>
    );
  }

  if (userVerified === false) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-md">
          <h1 className="text-2xl font-bold text-yellow-800 mb-4">Account Verification Required</h1>
          <p className="text-yellow-700 mb-4">
            Your account needs to be verified before you can take assessments. 
            This helps ensure that your results are properly tracked and saved to your profile.
          </p>
          <p className="text-yellow-700 mb-6">
            Please wait for an administrator to verify your account. You'll be notified once your account is verified.
          </p>
          <Link 
            href="/assessments" 
            className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700"
          >
            Back to Assessments
          </Link>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto bg-red-50 border-l-4 border-red-400 p-6 rounded-md">
          <h1 className="text-2xl font-bold text-red-800 mb-4">Error</h1>
          <p className="text-red-700 mb-4">{error}</p>
          <Link 
            href="/assessments" 
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Back to Assessments
          </Link>
        </div>
      </div>
    );
  }

  if (!assessment) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto bg-red-50 border-l-4 border-red-400 p-6 rounded-md">
          <h1 className="text-2xl font-bold text-red-800 mb-4">Assessment Not Found</h1>
          <p className="text-red-700 mb-4">
            The assessment you're looking for could not be found. It may have been removed or deactivated.
          </p>
          <Link 
            href="/assessments" 
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Back to Assessments
          </Link>
        </div>
      </div>
    );
  }

  if (result) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-6 bg-blue-50 border-b border-blue-100">
            <h1 className="text-2xl font-bold text-blue-800">Assessment Completed!</h1>
            <p className="text-blue-600 mt-2">
              Thank you for completing the {assessment.title}
            </p>
          </div>

          <div className="p-6">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-3">Your Results</h2>
              
              <div className="bg-gray-50 p-4 rounded-md mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-500">Score</span>
                  <span className="text-lg font-bold text-indigo-600">{result.score}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-indigo-600 h-2.5 rounded-full" 
                    style={{ width: `${Math.min(100, (result.score / 100) * 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-3">Recommendations</h2>
              <ul className="space-y-2">
                {result.recommendations.map((recommendation, index) => (
                  <li 
                    key={index} 
                    className="bg-green-50 p-3 rounded-md text-green-800 border-l-4 border-green-400"
                  >
                    {recommendation}
                  </li>
                ))}
              </ul>
            </div>

            {result.recommendedCourses && result.recommendedCourses.length > 0 && (
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-3">Recommended Courses</h2>
                <div className="grid grid-cols-1 gap-4">
                  {result.recommendedCourses.map((course) => (
                    <div
                      key={course.courseId}
                      className="bg-white rounded-lg border border-gray-200 hover:border-blue-400 transition-colors duration-200 p-4"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {course.title}
                          </h3>
                          <p className="text-sm text-gray-600">
                            Code: {course.code} | Duration: {course.duration}
                          </p>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize bg-blue-100 text-blue-800">
                            {course.level}
                          </span>
                          <span className="text-sm font-medium text-green-600 mt-1">
                            Match Score: {Math.round(course.score)}%
                          </span>
                        </div>
                      </div>
                      
                      <p className="text-gray-700 mb-3">{course.description}</p>
                      
                      {course.skillsDeveloped && course.skillsDeveloped.length > 0 && (
                        <div className="mb-3">
                          <h4 className="text-sm font-semibold text-gray-700 mb-2">
                            Skills You'll Develop:
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {course.skillsDeveloped.map((skill) => (
                              <span
                                key={skill}
                                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {course.matchFactors && Object.keys(course.matchFactors).length > 0 && (
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <h4 className="text-sm font-semibold text-gray-700 mb-2">
                            Match Factors:
                          </h4>
                          <div className="grid grid-cols-2 gap-2">
                            {Object.entries(course.matchFactors).map(([factor, score]) => (
                              <div key={factor} className="flex items-center">
                                <span className="text-xs text-gray-600 capitalize">
                                  {factor.replace(/([A-Z])/g, ' $1').trim()}:
                                </span>
                                <span className="ml-1 text-xs font-medium text-blue-600">
                                  {Math.round(score)}%
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-between items-center pt-4 border-t border-gray-200">
              <Link
                href="/assessments"
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
              >
                Back to Assessments
              </Link>
              <Link
                href="/profile"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                View Your Profile
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="p-6 bg-blue-50 border-b border-blue-100">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">{assessment.title}</h1>
              <p className="text-gray-600 mt-2">{assessment.description}</p>
            </div>
            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
              {assessment.type.charAt(0).toUpperCase() + assessment.type.slice(1)}
            </span>
          </div>
          
          <div className="mt-4 flex items-center">
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-blue-600 h-2.5 rounded-full" 
                style={{ width: `${((currentQuestion + 1) / assessment.questions.length) * 100}%` }}
              ></div>
            </div>
            <span className="ml-2 text-sm text-gray-500">
              {currentQuestion + 1} / {assessment.questions.length}
            </span>
          </div>
        </div>

        <div className="p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-3">
              {assessment.questions[currentQuestion].text}
            </h2>
            
            <div className="space-y-3">
              {assessment.questions[currentQuestion].options.map((option) => (
                <div 
                  key={option.id} 
                  onClick={() => handleOptionSelect(option.id!)}
                  className={`p-4 rounded-md border cursor-pointer transition-colors ${
                    selectedOption === option.id 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                  }`}
                >
                  <div className="flex items-center">
                    <div className={`w-5 h-5 rounded-full border flex-shrink-0 flex items-center justify-center ${
                      selectedOption === option.id
                        ? 'border-blue-500 bg-blue-500'
                        : 'border-gray-400'
                    }`}>
                      {selectedOption === option.id && (
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      )}
                    </div>
                    <span className="ml-3 text-gray-700">{option.text}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-gray-200">
            <button
              onClick={handlePreviousQuestion}
              disabled={currentQuestion === 0}
              className={`px-4 py-2 rounded-md ${
                currentQuestion === 0
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Previous
            </button>
            
            <button
              onClick={handleNextQuestion}
              disabled={!selectedOption || submitting}
              className={`px-4 py-2 rounded-md ${
                !selectedOption || submitting
                  ? 'bg-blue-300 text-white cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {currentQuestion < assessment.questions.length - 1 ? 'Next' : 'Submit'}
              {submitting && (
                <span className="ml-2 inline-block animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 