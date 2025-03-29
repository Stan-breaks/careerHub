"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogoutButton } from "./LogoutButton";

export default function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  // Don't show navbar in admin or auth pages
  if (pathname?.startsWith("/admin") || pathname?.startsWith("/(auth)")) {
    return null;
  }

  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <span className="text-blue-600 font-bold text-xl">CareerHub</span>
            </Link>
            
            {/* Desktop menu */}
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link 
                href="/"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  pathname === "/" 
                    ? "border-blue-500 text-gray-900" 
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                }`}
              >
                Home
              </Link>
              
              {session && (
                <>
                  <Link 
                    href="/dashboard"
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      pathname === "/dashboard" 
                        ? "border-blue-500 text-gray-900" 
                        : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                    }`}
                  >
                    Dashboard
                  </Link>
                  
                  <Link 
                    href="/assessments"
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      pathname?.startsWith("/assessments") 
                        ? "border-blue-500 text-gray-900" 
                        : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                    }`}
                  >
                    Assessments
                  </Link>
                  
                  <Link 
                    href="/career-paths"
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      pathname?.startsWith("/career-paths") 
                        ? "border-blue-500 text-gray-900" 
                        : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                    }`}
                  >
                    Career Paths
                  </Link>
                  
                  <Link 
                    href="/courses"
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      pathname?.startsWith("/courses") 
                        ? "border-blue-500 text-gray-900" 
                        : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                    }`}
                  >
                    Courses
                  </Link>
                  
                  <Link 
                    href="/feedback"
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      pathname?.startsWith("/feedback") 
                        ? "border-blue-500 text-gray-900" 
                        : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                    }`}
                  >
                    Feedback
                  </Link>
                </>
              )}
            </div>
          </div>
          
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {session ? (
              <div className="flex items-center space-x-4">
                {session.user.role === "admin" && (
                  <Link
                    href="/admin"
                    className="text-gray-500 hover:text-gray-700"
                  >
                    Admin
                  </Link>
                )}
                
                <Link 
                  href="/profile" 
                  className="text-gray-500 hover:text-gray-700"
                >
                  Profile
                </Link>
                
                <LogoutButton className="text-gray-500 hover:text-gray-700" />
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link 
                  href="/login" 
                  className="text-gray-500 hover:text-gray-700"
                >
                  Log In
                </Link>
                
                <Link 
                  href="/register" 
                  className="bg-blue-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
          
          {/* Mobile menu button */}
          <div className="flex items-center sm:hidden">
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              aria-expanded="false"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <span className="sr-only">Open main menu</span>
              <svg
                className={`${isMenuOpen ? 'hidden' : 'block'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <svg
                className={`${isMenuOpen ? 'block' : 'hidden'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      <div className={`${isMenuOpen ? 'block' : 'hidden'} sm:hidden`}>
        <div className="pt-2 pb-3 space-y-1">
          <Link 
            href="/"
            className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
              pathname === "/" 
                ? "border-blue-500 text-blue-700 bg-blue-50" 
                : "border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700"
            }`}
          >
            Home
          </Link>
          
          {session && (
            <>
              <Link 
                href="/dashboard"
                className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                  pathname === "/dashboard" 
                    ? "border-blue-500 text-blue-700 bg-blue-50" 
                    : "border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700"
                }`}
              >
                Dashboard
              </Link>
              
              <Link 
                href="/assessments"
                className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                  pathname?.startsWith("/assessments") 
                    ? "border-blue-500 text-blue-700 bg-blue-50" 
                    : "border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700"
                }`}
              >
                Assessments
              </Link>
              
              <Link 
                href="/career-paths"
                className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                  pathname?.startsWith("/career-paths") 
                    ? "border-blue-500 text-blue-700 bg-blue-50" 
                    : "border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700"
                }`}
              >
                Career Paths
              </Link>
              
              <Link 
                href="/courses"
                className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                  pathname?.startsWith("/courses") 
                    ? "border-blue-500 text-blue-700 bg-blue-50" 
                    : "border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700"
                }`}
              >
                Courses
              </Link>
              
              <Link 
                href="/feedback"
                className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                  pathname?.startsWith("/feedback") 
                    ? "border-blue-500 text-blue-700 bg-blue-50" 
                    : "border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700"
                }`}
              >
                Feedback
              </Link>
            </>
          )}
        </div>
        
        <div className="pt-4 pb-3 border-t border-gray-200">
          {session ? (
            <div>
              <div className="flex items-center px-4 py-2">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
                    {session.user.name?.[0]?.toUpperCase() || "U"}
                  </div>
                </div>
                <div className="ml-3">
                  <div className="text-base font-medium text-gray-800">{session.user.name}</div>
                  <div className="text-sm font-medium text-gray-500">{session.user.email}</div>
                </div>
              </div>
              <div className="mt-3 space-y-1">
                {session.user.role === "admin" && (
                  <Link
                    href="/admin"
                    className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                  >
                    Admin Dashboard
                  </Link>
                )}
                
                <Link
                  href="/profile"
                  className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                >
                  Your Profile
                </Link>
                
                <LogoutButton className="block w-full text-left px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100" />
              </div>
            </div>
          ) : (
            <div className="px-4 py-2 space-y-1">
              <Link
                href="/login"
                className="block text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100 px-4 py-2"
              >
                Log In
              </Link>
              
              <Link
                href="/register"
                className="block text-base font-medium text-white bg-blue-600 px-4 py-2 rounded-md hover:bg-blue-700 mt-2"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
} 