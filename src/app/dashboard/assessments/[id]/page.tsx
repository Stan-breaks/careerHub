"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Question = {
  _id: string;
  text: string;
  options: {
    text: string;
    value: number;
  }[];
  category: string;
};

type Assessment = {
  _id: string;
  title: string;
  description: string;
  type: string;
  questions: Question[];
  isActive: boolean;
};

export default function AssessmentPage({ params }: { params: { id: string } }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{ questionId: string; selectedOption: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [resultId, setResultId] = useState<string | null>(null);

  useEffect(() => {
    const fetchAssessment = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/assessments/${params.id}`);
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || "Failed to fetch assessment");
        }

        setAssessment(data.assessment);
        setLoading(false);
      } catch (error: any) {
        setError(error.message);
        setLoading(false);
      }
    };

    if (session) {
      fetchAssessment();
    }
  }, [session, params.id]);

  const handleOptionSelect = (questionId: string, optionIndex: number) => {
    setAnswers((prev) => {
      const newAnswers = [...prev];
      const existingAnswerIndex = newAnswers.findIndex(
        (a) => a.questionId === questionId
      );

      if (existingAnswerIndex !== -1) {
        newAnswers[existingAnswerIndex].selectedOption = optionIndex;
      } else {
        newAnswers.push({ questionId, selectedOption: optionIndex });
      }

      return newAnswers;
    });
  };

  const handleNext = () => {
    if (!assessment) return;
    
    if (currentQuestionIndex < assessment.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      handleSubmit();
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmit = async () => {
    if (!assessment) return;

    try {
      setSubmitting(true);
      setError("");

      const res = await fetch("/api/assessments/results", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          assessmentId: assessment._id,
          answers,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to submit assessment");
      }

      setSuccess(true);
      setResultId(data.result.id);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setSubmitting(false);
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
      <div className="bg-red-50 p-4 rounded-md">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error</h3>
            <div className="mt-2 text-sm text-red-700">{error}</div>
            <div className="mt-4">
              <Link 
                href="/dashboard/assessments" 
                className="text-sm font-medium text-red-800 hover:text-red-700"
              >
                Back to assessments
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!assessment) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <svg className="mx-auto h-12 w-12 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">Assessment not found</h3>
        <p className="mt-1 text-sm text-gray-500">
          The assessment you're looking for doesn't exist or has been removed.
        </p>
        <div className="mt-6">
          <Link 
            href="/dashboard/assessments" 
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Back to assessments
          </Link>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex flex-col items-center">
            <div className="flex-shrink-0 bg-green-100 rounded-full p-3">
              <svg className="h-8 w-8 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900">Assessment completed!</h3>
            <p className="mt-2 text-sm text-center text-gray-500">
              Thank you for completing the {assessment.title} assessment. 
              Your responses have been recorded and personalized recommendations are ready.
            </p>
          </div>
        </div>
        <div className="bg-gray-50 px-4 py-4 sm:px-6 flex justify-center">
          <Link
            href={resultId ? `/dashboard/assessments/results/${resultId}` : "/dashboard/assessments"}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            View Results
          </Link>
        </div>
      </div>
    );
  }

  const currentQuestion = assessment.questions[currentQuestionIndex];
  const isOptionSelected = answers.some(a => a.questionId === currentQuestion._id);
  const progress = Math.round((currentQuestionIndex / assessment.questions.length) * 100);

  return (
    <div>
      <div className="pb-5 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900">{assessment.title}</h1>
        <p className="mt-1 text-sm text-gray-500">{assessment.description}</p>
      </div>

      <div className="mt-6">
        {/* Progress */}
        <div className="mb-6">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700">
              Question {currentQuestionIndex + 1} of {assessment.questions.length}
            </span>
            <span className="text-sm font-medium text-gray-700">
              {progress}% Complete
            </span>
          </div>
          <div className="mt-2 w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-blue-600 h-2.5 rounded-full"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Question */}
        <div className="bg-white overflow-hidden shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              {currentQuestion.text}
            </h2>
            <div className="space-y-3">
              {currentQuestion.options.map((option, index) => {
                const isSelected = answers.some(
                  (a) => a.questionId === currentQuestion._id && a.selectedOption === index
                );

                return (
                  <div key={index} className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id={`option-${index}`}
                        name={`question-${currentQuestion._id}`}
                        type="radio"
                        checked={isSelected}
                        onChange={() => handleOptionSelect(currentQuestion._id, index)}
                        className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label
                        htmlFor={`option-${index}`}
                        className={`font-medium ${
                          isSelected ? "text-blue-700" : "text-gray-700"
                        }`}
                      >
                        {option.text}
                      </label>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-4 sm:px-6 flex justify-between">
            <button
              type="button"
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
              className={`inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                currentQuestionIndex === 0 ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              Previous
            </button>
            <button
              type="button"
              onClick={handleNext}
              disabled={!isOptionSelected || submitting}
              className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                !isOptionSelected || submitting
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
            >
              {currentQuestionIndex === assessment.questions.length - 1
                ? submitting
                  ? "Submitting..."
                  : "Submit"
                : "Next"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 