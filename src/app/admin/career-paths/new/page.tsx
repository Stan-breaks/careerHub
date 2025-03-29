"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function NewCareerPath() {
  const router = useRouter();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    requiredSkills: "",
    recommendedAssessments: "",
    averageSalary: {
      entry: "",
      mid: "",
      senior: ""
    },
    growthPotential: "3",
    educationRequirements: ""
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    if (name.startsWith("averageSalary.")) {
      const field = name.split(".")[1];
      setFormData(prev => ({
        ...prev,
        averageSalary: {
          ...prev.averageSalary,
          [field]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Convert comma-separated strings to arrays
      const requiredSkills = formData.requiredSkills
        .split(",")
        .map(skill => skill.trim())
        .filter(skill => skill);

      const recommendedAssessments = formData.recommendedAssessments
        .split(",")
        .map(id => id.trim())
        .filter(id => id);

      const educationRequirements = formData.educationRequirements
        .split(",")
        .map(req => req.trim())
        .filter(req => req);

      const response = await fetch("/api/admin/career-paths", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          requiredSkills,
          recommendedAssessments,
          educationRequirements,
          averageSalary: {
            entry: Number(formData.averageSalary.entry),
            mid: Number(formData.averageSalary.mid),
            senior: Number(formData.averageSalary.senior)
          },
          growthPotential: Number(formData.growthPotential)
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create career path");
      }

      router.push("/admin/career-paths");
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (session?.user?.role !== "admin") {
    router.push("/dashboard");
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="pb-5 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900">Add New Career Path</h1>
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
            value={formData.title}
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
            value={formData.description}
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
            value={formData.requiredSkills}
            onChange={handleChange}
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
            value={formData.recommendedAssessments}
            onChange={handleChange}
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
              value={formData.averageSalary.entry}
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
              value={formData.averageSalary.mid}
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
              value={formData.averageSalary.senior}
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
            value={formData.growthPotential}
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
            value={formData.educationRequirements}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
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
            disabled={loading}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Creating..." : "Create Career Path"}
          </button>
        </div>
      </form>
    </div>
  );
} 