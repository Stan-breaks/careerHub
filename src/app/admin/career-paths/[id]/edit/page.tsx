"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

interface CareerPath {
  _id: string;
  title: string;
  description: string;
  requiredSkills: string[];
  recommendedAssessments: string[];
  averageSalary: {
    entry: number;
    mid: number;
    senior: number;
  };
  growthPotential: number;
  educationRequirements: string[];
  isActive: boolean;
}

export default function EditCareerPath({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [careerPath, setCareerPath] = useState<CareerPath | null>(null);

  useEffect(() => {
    const fetchCareerPath = async () => {
      try {
        const res = await fetch(`/api/admin/career-paths/${params.id}`);
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Failed to fetch career path");
        }

        setCareerPath(data.careerPath);
        setLoading(false);
      } catch (error: any) {
        setError(error.message);
        setLoading(false);
      }
    };

    if (session?.user?.role === "admin") {
      fetchCareerPath();
    }
  }, [session, params.id]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    if (!careerPath) return;

    const { name, value } = e.target;

    if (name.startsWith("averageSalary.")) {
      const field = name.split(".")[1];
      setCareerPath(prev => ({
        ...prev!,
        averageSalary: {
          ...prev!.averageSalary,
          [field]: Number(value)
        }
      }));
    } else {
      setCareerPath(prev => ({
        ...prev!,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!careerPath) return;

    setSaving(true);
    setError("");

    try {
      const response = await fetch(`/api/admin/career-paths/${params.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(careerPath),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update career path");
      }

      router.push("/admin/career-paths");
    } catch (error: any) {
      setError(error.message);
    } finally {
      setSaving(false);
    }
  };

  if (session?.user?.role !== "admin") {
    router.push("/dashboard");
    return null;
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
        Error: {error}
      </div>
    );
  }

  if (!careerPath) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded relative">
        Career path not found
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="pb-5 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900">Edit Career Path</h1>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
            Title
          </label>
          <input
            type="text"
            name="title"
            id="title"
            required
            value={careerPath.title}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            name="description"
            id="description"
            rows={4}
            required
            value={careerPath.description}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="requiredSkills" className="block text-sm font-medium text-gray-700">
            Required Skills (comma-separated)
          </label>
          <input
            type="text"
            name="requiredSkills"
            id="requiredSkills"
            required
            value={careerPath.requiredSkills.join(", ")}
            onChange={(e) => {
              const skills = e.target.value.split(",").map(skill => skill.trim()).filter(skill => skill);
              setCareerPath(prev => ({ ...prev!, requiredSkills: skills }));
            }}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="recommendedAssessments" className="block text-sm font-medium text-gray-700">
            Recommended Assessment IDs (comma-separated)
          </label>
          <input
            type="text"
            name="recommendedAssessments"
            id="recommendedAssessments"
            value={careerPath.recommendedAssessments.join(", ")}
            onChange={(e) => {
              const assessments = e.target.value.split(",").map(id => id.trim()).filter(id => id);
              setCareerPath(prev => ({ ...prev!, recommendedAssessments: assessments }));
            }}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <div>
            <label htmlFor="averageSalary.entry" className="block text-sm font-medium text-gray-700">
              Entry Level Salary
            </label>
            <input
              type="number"
              name="averageSalary.entry"
              id="averageSalary.entry"
              required
              value={careerPath.averageSalary.entry}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="averageSalary.mid" className="block text-sm font-medium text-gray-700">
              Mid Level Salary
            </label>
            <input
              type="number"
              name="averageSalary.mid"
              id="averageSalary.mid"
              required
              value={careerPath.averageSalary.mid}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="averageSalary.senior" className="block text-sm font-medium text-gray-700">
              Senior Level Salary
            </label>
            <input
              type="number"
              name="averageSalary.senior"
              id="averageSalary.senior"
              required
              value={careerPath.averageSalary.senior}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
        </div>

        <div>
          <label htmlFor="growthPotential" className="block text-sm font-medium text-gray-700">
            Growth Potential (1-5)
          </label>
          <select
            name="growthPotential"
            id="growthPotential"
            required
            value={careerPath.growthPotential}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            <option value="1">1 - Low</option>
            <option value="2">2 - Below Average</option>
            <option value="3">3 - Average</option>
            <option value="4">4 - Above Average</option>
            <option value="5">5 - High</option>
          </select>
        </div>

        <div>
          <label htmlFor="educationRequirements" className="block text-sm font-medium text-gray-700">
            Education Requirements (comma-separated)
          </label>
          <input
            type="text"
            name="educationRequirements"
            id="educationRequirements"
            required
            value={careerPath.educationRequirements.join(", ")}
            onChange={(e) => {
              const requirements = e.target.value.split(",").map(req => req.trim()).filter(req => req);
              setCareerPath(prev => ({ ...prev!, educationRequirements: requirements }));
            }}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={careerPath.isActive}
              onChange={(e) => setCareerPath(prev => ({ ...prev!, isActive: e.target.checked }))}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <span className="ml-2 block text-sm text-gray-900">Active</span>
          </label>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => router.push("/admin/career-paths")}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
} 