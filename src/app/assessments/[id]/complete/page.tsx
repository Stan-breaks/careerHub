import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import AssessmentResults from '@/components/AssessmentResults';

interface PageProps {
  params: {
    id: string;
  };
  searchParams: {
    resultId?: string;
  };
}

async function getAssessmentResult(assessmentId: string, resultId: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || '';
    const response = await fetch(
      `${baseUrl}/api/assessments/${assessmentId}/recommend?resultId=${resultId}`,
      { cache: 'no-store' }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch assessment result');
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error fetching assessment result:', error);
    return null;
  }
}

async function AssessmentResultContent({ assessmentId, resultId }: { assessmentId: string; resultId: string }) {
  const result = await getAssessmentResult(assessmentId, resultId);

  if (!result) {
    return notFound();
  }
  return (
    <AssessmentResults
      categoryScores={result.categoryScores}
      recommendedCourses={result.recommendedCourses}
      careerPathways={result.careerPathways}
    />
  );
}

export default function AssessmentCompletePage({ params, searchParams }: PageProps) {
  const { id: assessmentId } = params;
  const { resultId } = searchParams;

  if (!resultId) {
    return notFound();
  }
  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Assessment Complete!
          </h1>
          <p className="mt-2 text-lg text-gray-600">
            Based on your responses, we've prepared personalized recommendations for you.
          </p>
        </div>

        <Suspense
          fallback={
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          }
        >
          <AssessmentResultContent assessmentId={assessmentId} resultId={resultId} />
        </Suspense>
      </div>
    </main>
  );
}
