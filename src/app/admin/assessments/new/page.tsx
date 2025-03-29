"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Option {
  text: string;
  value: number;
}

interface Question {
  text: string;
  options: Option[];
}

export default function NewAssessment() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("personality");
  const [questions, setQuestions] = useState<Question[]>([
    { text: "", options: [{ text: "", value: 0 }, { text: "", value: 0 }] }
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAddQuestion = () => {
    setQuestions([
      ...questions,
      { text: "", options: [{ text: "", value: 0 }, { text: "", value: 0 }] }
    ]);
  };

  const handleRemoveQuestion = (index: number) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((_, i) => i !== index));
    }
  };

  const handleQuestionChange = (index: number, text: string) => {
    const newQuestions = [...questions];
    newQuestions[index].text = text;
    setQuestions(newQuestions);
  };

  const handleAddOption = (questionIndex: number) => {
    const newQuestions = [...questions];
    newQuestions[questionIndex].options.push({ text: "", value: 0 });
    setQuestions(newQuestions);
  };

  const handleRemoveOption = (questionIndex: number, optionIndex: number) => {
    if (questions[questionIndex].options.length > 2) {
      const newQuestions = [...questions];
      newQuestions[questionIndex].options = newQuestions[questionIndex].options.filter(
        (_, i) => i !== optionIndex
      );
      setQuestions(newQuestions);
    }
  };

  const handleOptionChange = (questionIndex: number, optionIndex: number, text: string, value: number) => {
    const newQuestions = [...questions];
    newQuestions[questionIndex].options[optionIndex].text = text;
    newQuestions[questionIndex].options[optionIndex].value = value;
    setQuestions(newQuestions);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validate form
    if (!title.trim() || !description.trim()) {
      setError("Title and description are required");
      setLoading(false);
      return;
    }

    for (const question of questions) {
      if (!question.text.trim()) {
        setError("All questions must have text");
        setLoading(false);
        return;
      }

      for (const option of question.options) {
        if (!option.text.trim()) {
          setError("All options must have text");
          setLoading(false);
          return;
        }
      }
    }

    try {
      const response = await fetch("/api/admin/assessments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          description,
          type,
          questions: questions.map(q => ({
            text: q.text,
            options: q.options.map(o => ({
              text: o.text,
              value: o.value
            })),
          })),
        }),
      });

      if (response.ok) {
        router.push("/admin/assessments");
        router.refresh();
      } else {
        const data = await response.json();
        setError(data.error || "Failed to create assessment");
      }
    } catch (err) {
      setError("An unexpected error occurred");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Create New Assessment</h1>
        <Link
          href="/admin/assessments"
          className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
        >
          Cancel
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 text-red-500 p-4 rounded-md mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
        <div className="mb-4">
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Title
          </label>
          <input
            type="text"
            id="title"
            className="w-full p-2 border border-gray-300 rounded-md"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div className="mb-4">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            id="description"
            className="w-full p-2 border border-gray-300 rounded-md"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>

        <div className="mb-6">
          <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
            Assessment Type
          </label>
          <select
            id="type"
            className="w-full p-2 border border-gray-300 rounded-md"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option value="personality">Personality</option>
            <option value="career">Career</option>
            <option value="academic">Academic</option>
          </select>
        </div>

        <h2 className="text-xl font-semibold mb-4">Questions</h2>

        {questions.map((question, qIndex) => (
          <div key={qIndex} className="mb-6 p-4 border border-gray-200 rounded-md">
            <div className="flex justify-between mb-2">
              <h3 className="font-medium">Question {qIndex + 1}</h3>
              <button
                type="button"
                onClick={() => handleRemoveQuestion(qIndex)}
                className="text-red-500 hover:text-red-700"
                disabled={questions.length === 1}
              >
                Remove
              </button>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Question Text
              </label>
              <input
                type="text"
                className="w-full p-2 border border-gray-300 rounded-md"
                value={question.text}
                onChange={(e) => handleQuestionChange(qIndex, e.target.value)}
                required
              />
            </div>

            <div className="mb-2">
              <h4 className="font-medium mb-2">Options</h4>
              {question.options.map((option, oIndex) => (
                <div key={oIndex} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    className="flex-1 p-2 border border-gray-300 rounded-md"
                    placeholder="Option text"
                    value={option.text}
                    onChange={(e) => 
                      handleOptionChange(qIndex, oIndex, e.target.value, option.value)
                    }
                    required
                  />
                  <input
                    type="number"
                    className="w-20 p-2 border border-gray-300 rounded-md"
                    placeholder="Value"
                    min="0"
                    max="10"
                    value={option.value}
                    onChange={(e) => 
                      handleOptionChange(qIndex, oIndex, option.text, Number(e.target.value))
                    }
                    required
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveOption(qIndex, oIndex)}
                    className="px-2 text-red-500 hover:text-red-700"
                    disabled={question.options.length <= 2}
                  >
                    ✕
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => handleAddOption(qIndex)}
                className="text-blue-500 hover:text-blue-700 text-sm"
              >
                + Add Option
              </button>
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={handleAddQuestion}
          className="mb-6 px-4 py-2 bg-blue-50 text-blue-500 rounded-md hover:bg-blue-100"
        >
          + Add Question
        </button>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300"
          >
            {loading ? "Creating..." : "Create Assessment"}
          </button>
        </div>
      </form>
    </div>
  );
} 