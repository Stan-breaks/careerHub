import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-gradient-to-b from-blue-50 to-white">
      <div className="text-center max-w-4xl">
        <h1 className="text-4xl md:text-6xl font-bold text-blue-800 mb-6">
          Welcome to CareerHub
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Discover your ideal career path through personalized assessments and guidance
        </p>
        
        <div className="flex flex-col sm:flex-row justify-center gap-4 mb-16">
          <Link 
            href="/login" 
            className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-8 rounded-lg text-lg font-medium transition-colors duration-300"
          >
            Log In
          </Link>
          <Link 
            href="/register" 
            className="bg-white hover:bg-gray-100 text-blue-600 border border-blue-600 py-3 px-8 rounded-lg text-lg font-medium transition-colors duration-300"
          >
            Register
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-800 mb-3">Take Assessments</h2>
            <p className="text-gray-600">
              Discover your strengths, interests, and potential career matches through our comprehensive assessments
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-800 mb-3">Explore Careers</h2>
            <p className="text-gray-600">
              Get detailed insights into various career paths, required skills, and growth opportunities
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-800 mb-3">Personalized Guidance</h2>
            <p className="text-gray-600">
              Receive tailored recommendations and resources to help you achieve your career goals
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
