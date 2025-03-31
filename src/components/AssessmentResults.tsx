import React from 'react';
import { ICourse } from '@/models/Course';

interface CategoryScore {
  category: string;
  score: number;
}

interface AssessmentResultsProps {
  categoryScores: CategoryScore[];
  recommendedCourses: ICourse[];
  careerPathways: string[];
}

export default function AssessmentResults({
  categoryScores,
  recommendedCourses,
  careerPathways,
}: AssessmentResultsProps) {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Category Scores */}
      <section className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-semibold mb-4">Your Assessment Results</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categoryScores.map((score) => (
            <div
              key={score.category}
              className="bg-gray-50 rounded-lg p-4 border border-gray-200"
            >
              <h3 className="font-medium text-gray-800 capitalize">
                {score.category}
              </h3>
              <div className="mt-2 relative pt-1">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-blue-600 bg-blue-200">
                      {Math.round(score.score)}%
                    </span>
                  </div>
                </div>
                <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200">
                  <div
                    style={{ width: `${score.score}%` }}
                    className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Career Pathways */}
      <section className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-semibold mb-4">Recommended Career Pathways</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {careerPathways.map((pathway) => (
            <div
              key={pathway}
              className="bg-green-50 rounded-lg p-4 border border-green-200"
            >
              <div className="flex items-center space-x-2">
                <svg
                  className="w-5 h-5 text-green-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="text-green-800 font-medium">{pathway}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Recommended Courses */}
      <section className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-semibold mb-4">Recommended Courses</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {recommendedCourses.map((course) => (
            <div
              key={course._id}
              className="bg-white rounded-lg border border-gray-200 hover:border-blue-400 transition-colors duration-200"
            >
              <div className="p-5">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-1">
                      {course.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">
                      Code: {course.code} | Duration: {course.duration}
                    </p>
                  </div>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize bg-blue-100 text-blue-800">
                    {course.level}
                  </span>
                </div>
                <p className="text-gray-700 mt-2">{course.description}</p>
                
                {/* Skills */}
                <div className="mt-4">
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

                {/* Career Pathways */}
                <div className="mt-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">
                    Career Pathways:
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {course.careerPathways.map((pathway) => (
                      <span
                        key={pathway}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
                      >
                        {pathway}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
