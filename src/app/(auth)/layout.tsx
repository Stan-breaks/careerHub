import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Authentication - CareerHub",
  description: "Login or register to access CareerHub",
};

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex flex-col items-center justify-center">
        <header className="w-full py-6 bg-white shadow-sm mb-8">
          <div className="container mx-auto px-4">
            <h1 className="text-2xl font-bold text-center text-blue-600">
              CareerHub
            </h1>
            <p className="text-center text-gray-600 mt-1">
              Your path to the right career
            </p>
          </div>
        </header>
        <main className="w-full flex-grow">{children}</main>
      </div>
    </div>
  );
} 