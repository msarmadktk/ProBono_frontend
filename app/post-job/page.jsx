"use client";

import { useState, useEffect } from "react";
import { X, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";

export default function PostJobPage() {
  const [title, setTitle] = useState("");
  const [categories, setCategories] = useState([]);
  const [category, setCategory] = useState("");
  const [jobType, setJobType] = useState("Hourly");
  const [budget, setBudget] = useState("200");
  const [experienceLevel, setExperienceLevel] = useState("Expert");
  const [skills, setSkills] = useState([]);
  const [skillInput, setSkillInput] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [clientId, setClientId] = useState(null);
  // New state for manual toast message and type
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("success"); // "success" or "error"
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    // Fetch categories from the backend
    const fetchCategories = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/categories/getAllCategories");
        if (!response.ok) throw new Error("Failed to fetch categories");
        const data = await response.json();
        setCategories(data);
        if (data.length > 0) {
          setCategory(String(data[0].id));
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    // Fetch user ID (client ID)
    const fetchUserId = async () => {
      try {
        const userEmail = localStorage.getItem("userEmail") || "i221213@nu.edu.pk";
        const response = await fetch("http://localhost:5000/api/getUserId", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: userEmail }),
        });
        if (!response.ok) throw new Error("Failed to fetch user ID");
        const data = await response.json();
        setClientId(data.userId);
      } catch (error) {
        console.error("Error fetching user ID:", error);
      }
    };

    fetchCategories();
    fetchUserId();
  }, []);

  const handleSkillInputKeyDown = (e) => {
    if (e.key === "Tab" || e.key === "Enter") {
      e.preventDefault();
      if (skillInput.trim()) {
        setSkills([...skills, skillInput.trim()]);
        setSkillInput("");
      }
    }
  };

  const removeSkill = (indexToRemove) => {
    setSkills(skills.filter((_, index) => index !== indexToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!title || !description || skills.length === 0 || !category || !clientId) {
      setToastType("error");
      setToastMessage("Please fill in all required fields");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
      return;
    }

    setLoading(true);

    const jobData = {
      title,
      description,
      skills_required: skills.join(", "),
      budget: parseFloat(budget),
      clientId,
      category_id: parseInt(category),
      location: "Remote",
      experienceLevel,
      jobType,
    };

    try {
      const response = await fetch("http://localhost:5000/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(jobData),
      });

      const data = await response.json();

      if (response.status === 201) {
        setToastType("success");
        setToastMessage("Job posted successfully! Your job is pending approval.");
        // Reset form fields
        setTitle("");
        setDescription("");
        setSkills([]);
        setBudget("200");
        console.log("Job created:", data);
      } else {
        setToastType("error");
        setToastMessage(data.message || "Failed to post job. Please try again.");
      }
    } catch (error) {
      console.error("Error posting job:", error);
      setToastType("error");
      setToastMessage("An unexpected error occurred. Please try again later.");
    } finally {
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-10 px-4 sm:px-6">
      <h1 className="text-3xl font-bold mb-8 text-black">Post a job</h1>

      <Card className="p-6 sm:p-8 shadow-sm border-gray-200">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-base font-medium text-black">Title</Label>
            <Input
              id="title"
              placeholder="e.g Need a frontend developer"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-gray-50 border-gray-200 h-11 text-base placeholder:text-gray-400"
              required
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category" className="text-base font-medium text-black">Category</Label>
            <Select value={category} onValueChange={setCategory} required>
              <SelectTrigger id="category" className="w-full bg-white border-gray-200 h-11 text-base">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.length > 0 ? (
                  categories.map((cat) => (
                    <SelectItem key={cat.id} value={String(cat.id)}>
                      {cat.name}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="loading" disabled>
                    Loading categories...
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Job Type */}
          <div className="space-y-3">
            <Label className="text-base font-medium text-black">Job Type</Label>
            <RadioGroup
              value={jobType}
              onValueChange={setJobType}
              className="flex gap-8"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Fixed" id="fixed" className="border-gray-400" />
                <Label htmlFor="fixed" className="font-normal text-black">Fixed</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Hourly" id="hourly" className="border-gray-400" />
                <Label htmlFor="hourly" className="font-normal text-black">Hourly</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Estimated Budget */}
          <div className="space-y-2">
            <Label htmlFor="budget" className="text-base font-medium text-black">Estimated Budget</Label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <span className="text-gray-500 text-lg font-medium">$</span>
              </div>
              <Input
                id="budget"
                type="number"
                min="1"
                step="0.01"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="pl-8 h-11 text-base font-medium text-gray-800 bg-white border-gray-200"
                required
              />
            </div>
          </div>

          {/* Experience Level */}
          <div className="space-y-3">
            <Label className="text-base font-medium text-black">Experience Level</Label>
            <RadioGroup
              value={experienceLevel}
              onValueChange={setExperienceLevel}
              className="space-y-3"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Entry" id="entry" className="border-gray-400" />
                <Label htmlFor="entry" className="font-normal text-black">Entry Level</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Intermediate" id="intermediate" className="border-gray-400" />
                <Label htmlFor="intermediate" className="font-normal text-black">Intermediate Level</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Expert" id="expert" className="border-gray-400" />
                <Label htmlFor="expert" className="font-normal text-black">Expert Level</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Skills Required */}
          <div className="space-y-2">
            <Label htmlFor="skills" className="text-base font-medium text-black">Skills Required</Label>
            <div className="border border-gray-200 rounded-md p-3 focus-within:ring-2 focus-within:ring-blue-100 focus-within:border-blue-400 bg-white">
              <div className="flex flex-wrap gap-2 mb-2">
                {skills.map((skill, index) => (
                  <div
                    key={index}
                    className="bg-gray-100 text-black px-3 py-1.5 rounded-md flex items-center text-sm font-medium"
                  >
                    <span>{skill}</span>
                    <button
                      type="button"
                      onClick={() => removeSkill(index)}
                      className="ml-2 text-gray-500 hover:text-black transition-colors"
                      aria-label={`Remove ${skill}`}
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex items-center">
                <Plus size={16} className="text-gray-400 mr-2" />
                <Input
                  id="skills"
                  placeholder="Type a skill and press Tab or Enter"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={handleSkillInputKeyDown}
                  className="border-0 focus-visible:ring-0 p-0 shadow-none text-base placeholder:text-gray-400"
                />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-1">Press Tab or Enter after typing to add a skill</p>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-base font-medium text-black">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-40 bg-gray-50 text-base border-gray-200 resize-y"
              placeholder="Describe the job requirements, responsibilities, and other details..."
              required
            />
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <Button
              type="submit"
              className="bg-gray-200 text-black cursor-pointer hover:bg-black hover:text-white font-bold text-base h-11 px-6 transition-colors duration-200"
              disabled={loading}
            >
              {loading ? "Posting..." : "Post Job"}
            </Button>
          </div>
        </form>
      </Card>

      {/* Manual Tailwind CSS Toast */}
      {showToast && (
        <div
          className={`fixed bottom-5 right-5 px-4 py-2 rounded shadow-lg transition-opacity duration-300 ${
            toastType === "success" ? "bg-green-500 text-white" : "bg-red-500 text-white"
          }`}
        >
          {toastMessage}
        </div>
      )}
    </div>
  );
}
