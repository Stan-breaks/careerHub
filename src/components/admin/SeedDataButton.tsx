"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SeedDataButton() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{text: string, type: 'success' | 'error'} | null>(null);
  const router = useRouter();

  const handleSeedData = async () => {
    if (!confirm('This will add default assessments, courses, and career paths to your system. Continue?')) {
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/seed', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({
          text: data.message || 'Default data added successfully!',
          type: 'success'
        });
        
        // Refresh the page data to update the stats
        router.refresh();
        
        // Optionally, force a full refresh after a delay to ensure everything is updated
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        setMessage({
          text: data.error || 'Failed to add default data',
          type: 'error'
        });
      }
    } catch (error) {
      setMessage({
        text: 'An unexpected error occurred',
        type: 'error'
      });
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg shadow-md p-6 mb-6 border border-blue-100">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-blue-800 mb-2">Quick Start: Add Default Content</h2>
          <p className="text-gray-700 mb-3">
            Add pre-configured content to jump-start your platform. Default content includes:
          </p>
          <ul className="list-disc pl-5 mb-4 text-gray-700">
            <li>Career Aptitude Assessment</li>
            <li>Tech Industry Personality Assessment</li>
            <li>Web Development, Data Science, and Project Management courses</li>
            <li>Software Developer, Data Scientist, UX/UI Designer career paths</li>
            <li>And more technology-focused career options</li>
          </ul>
        </div>
        <div className="flex-shrink-0">
          <div className="bg-white p-4 rounded-full shadow-md">
            <svg className="w-10 h-10 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
            </svg>
          </div>
        </div>
      </div>
      
      {message && (
        <div className={`p-4 rounded-md mb-4 ${
          message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {message.text}
        </div>
      )}
      
      <button
        onClick={handleSeedData}
        disabled={loading}
        className="w-full mt-2 px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-indigo-300 flex items-center justify-center font-medium transition-colors"
      >
        {loading ? (
          <>
            <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Adding Default Content...
          </>
        ) : (
          <>Add Default Content</>
        )}
      </button>
    </div>
  );
} 