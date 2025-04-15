"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function JobsListingPage() {
  // Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [locationSearch, setLocationSearch] = useState("");
  const [experienceLevel, setExperienceLevel] = useState([]);
  const [jobType, setJobType] = useState("hourly");
  const [proposalRange, setProposalRange] = useState([]);
  
  // Categories state
  const [allCategories, setAllCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");

  // Jobs data and error state
  const [jobs, setJobs] = useState([]);
  const [fetchError, setFetchError] = useState("");

  // Fetch categories from backend API on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/categories/getAllCategories");
        if (!response.ok) throw new Error("Failed to fetch categories");
        const data = await response.json();
        setAllCategories(data);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();
  }, []);

  // Update filter state functions
  const handleExperienceLevelChange = (level) => {
    setExperienceLevel((prev) =>
      prev.includes(level)
        ? prev.filter((item) => item !== level)
        : [...prev, level]
    );
  };

  const handleProposalRangeChange = (range) => {
    setProposalRange((prev) =>
      prev.includes(range)
        ? prev.filter((item) => item !== range)
        : [...prev, range]
    );
  };

  // Build query parameters based on filter state
  const buildQueryParams = () => {
    const params = {};

    if (locationSearch) {
      params.location = locationSearch;
    }
    if (selectedCategory) {
      params.category_id = selectedCategory;
    }
    if (experienceLevel.length > 0) {
      params.experienceLevel = experienceLevel
        .map((level) => {
          if (level === "entry") return "Entry Level";
          if (level === "intermediate") return "Intermediate";
          if (level === "expert") return "Expert";
          return level;
        })
        .join(",");
    }
    if (jobType) {
      params.jobType = jobType === "hourly" ? "Hourly" : "Fixed";
    }
    if (proposalRange.length > 0) {
      params.proposals = proposalRange
        .map((range) => {
          if (range === "less-than-5") return "less_than_5";
          if (range === "5-to-10") return "5_to_10";
          if (range === "10-to-20") return "20_to_50";
          if (range === "20-plus") return "50_plus";
          return range;
        })
        .join(",");
    }
    // Optionally include searchQuery for title/description matching if your API supports it.
    if (searchQuery) {
      params.search = searchQuery;
    }

    return new URLSearchParams(params).toString();
  };

  // Fetch jobs whenever filters change
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setFetchError("");
        const queryParams = buildQueryParams();
        const response = await fetch(`http://localhost:5000/api/jobs?${queryParams}`);
        if (!response.ok) {
          // Optionally, parse error response here if available.
          setFetchError("Failed to fetch jobs");
          return;
        }
        const data = await response.json();
        setJobs(data);
      } catch (error) {
        console.error("Error fetching jobs:", error);
        setFetchError("Failed to fetch jobs");
      }
    };

    fetchJobs();
  }, [searchQuery, locationSearch, experienceLevel, jobType, proposalRange, selectedCategory]);

  const renderStarRating = (rating) => {
    const stars = [];
    for (let i = 0; i < 5; i++) {
      stars.push(
        <span key={i} className="text-yellow-400">★</span>
      );
    }
    return <div className="flex">{stars}</div>;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left side: job listings */}
        <div className="lg:col-span-2">
          <div className="mb-6">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Image src="/images/search.svg" alt="Search" width={20} height={20} />
              </div>
              <Input
                type="text"
                placeholder="Search for jobs"
                className="pl-10 h-12 rounded-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <h1 className="text-xl font-bold mb-4 text-gray-900">Jobs you might like</h1>

          {fetchError ? (
            <div className="text-red-500">{fetchError}</div>
          ) : jobs && jobs.length > 0 ? (
            jobs.map((job, index) => (
              <div key={job.id} className="mb-4">
                <Card className="p-4">
                  <div className="text-xs text-gray-500 mb-1">
                    Posted {new Date(job.created_at).toLocaleString()}
                  </div>
                  <h2 className="text-lg font-semibold mb-1 text-gray-900">
                    {job.title}
                  </h2>
                  <div className="flex flex-wrap gap-x-2 text-sm text-gray-500 mb-3">
                    <span>{job.job_type}</span>
                    <span>|</span>
                    <span>{job.experience_level}</span>
                    <span>|</span>
                    <span>Est. Budget: ${job.budget}</span>
                  </div>
                  <p className="text-sm mb-4 whitespace-pre-line text-gray-700">
                    {job.description}
                  </p>
                  
                  <div className="flex items-center justify-between flex-wrap gap-2 pr-5">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center">
                        <Image
                          src="/images/payment.svg"
                          alt="payment verified"
                          width={16}
                          height={16}
                          className="mr-1"
                        />
                        <span className="text-xs">Payment verified</span>
                      </div>
                      <div>{renderStarRating(job.rating)}</div>
                      <div className="text-xs">{job.views} views</div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center">
                        <Image
                          src="/images/location.svg"
                          alt="Location"
                          width={16}
                          height={16}
                          className="mr-1"
                        />
                        <span className="text-xs">{job.location}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex mt-2 text-xs">
                    <div>Proposals: {job.proposal_count}</div>
                  </div>
                </Card>
                {index < jobs.length - 1 && <Separator className="my-4" />}
              </div>
            ))
          ) : (
            <div>No jobs found matching your criteria.</div>
          )}
        </div>

        {/* Right side: filters */}
        <div className="lg:col-span-1">
          <div className="mb-6 bg-white p-4 rounded-lg shadow-sm">
            <div className="flex flex-col items-start justify-between mb-4">
              <p className="text-sm">Welcome back, Databot</p>
              <div className="flex items-center bg-gray-100 p-4 rounded-lg mt-4">
                <Image
                  src="/images/connects.svg"
                  alt="Connects"
                  width={20}
                  height={20}
                  className="mr-2"
                />
                <span className="text-sm font-semibold">Connects:</span>
                <span className="ml-1 text-sm font-bold">89</span>
              </div>
            </div>

            <div className="space-y-6">
              {/* Categories */}
              <div className="space-y-2">
                <h3 className="text-sm font-semibold">Categories</h3>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full rounded-lg border-2 border-gray-100 p-2 "
                >
                  <option value="">All Categories</option>
                  {allCategories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Experience Level */}
              <div className="space-y-2">
                <h3 className="text-sm font-semibold">Experience Level</h3>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <Checkbox
                      id="entry-level"
                      checked={experienceLevel.includes("entry")}
                      onCheckedChange={() => handleExperienceLevelChange("entry")}
                    />
                    <Label htmlFor="entry-level" className="ml-2 text-sm font-normal">
                      Entry Level
                    </Label>
                  </div>
                  <div className="flex items-center">
                    <Checkbox
                      id="intermediate-level"
                      checked={experienceLevel.includes("intermediate")}
                      onCheckedChange={() => handleExperienceLevelChange("intermediate")}
                    />
                    <Label htmlFor="intermediate-level" className="ml-2 text-sm font-normal">
                      Intermediate
                    </Label>
                  </div>
                  <div className="flex items-center">
                    <Checkbox
                      id="expert-level"
                      checked={experienceLevel.includes("expert")}
                      onCheckedChange={() => handleExperienceLevelChange("expert")}
                    />
                    <Label htmlFor="expert-level" className="ml-2 text-sm font-normal">
                      Expert
                    </Label>
                  </div>
                </div>
              </div>

              {/* Job Type */}
              <div className="space-y-2">
                <h3 className="text-sm font-semibold">Job Type</h3>
                <RadioGroup value={jobType} onValueChange={setJobType} className="space-y-2">
                  <div className="flex items-center">
                    <RadioGroupItem value="hourly" id="hourly" />
                    <Label htmlFor="hourly" className="ml-2 text-sm font-normal">
                      Hourly
                    </Label>
                  </div>
                  <div className="flex items-center">
                    <RadioGroupItem value="fixed" id="fixed" />
                    <Label htmlFor="fixed" className="ml-2 text-sm font-normal">
                      Fixed
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Client Location */}
              <div className="space-y-2">
                <h3 className="text-sm font-semibold">Client Location</h3>
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="Search Location"
                    className="rounded-lg"
                    value={locationSearch}
                    onChange={(e) => setLocationSearch(e.target.value)}
                  />
                </div>
              </div>

              {/* No of Proposals */}
              <div className="space-y-2">
                <h3 className="text-sm font-semibold">No of Proposals</h3>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <Checkbox
                      id="less-than-5"
                      checked={proposalRange.includes("less-than-5")}
                      onCheckedChange={() => handleProposalRangeChange("less-than-5")}
                    />
                    <Label htmlFor="less-than-5" className="ml-2 text-sm font-normal">
                      Less than 5
                    </Label>
                  </div>
                  <div className="flex items-center">
                    <Checkbox
                      id="5-to-10"
                      checked={proposalRange.includes("5-to-10")}
                      onCheckedChange={() => handleProposalRangeChange("5-to-10")}
                    />
                    <Label htmlFor="5-to-10" className="ml-2 text-sm font-normal">
                      5 to 10
                    </Label>
                  </div>
                  <div className="flex items-center">
                    <Checkbox
                      id="10-to-20"
                      checked={proposalRange.includes("10-to-20")}
                      onCheckedChange={() => handleProposalRangeChange("10-to-20")}
                    />
                    <Label htmlFor="10-to-20" className="ml-2 text-sm font-normal">
                      10 to 20
                    </Label>
                  </div>
                  <div className="flex items-center">
                    <Checkbox
                      id="20-plus"
                      checked={proposalRange.includes("20-plus")}
                      onCheckedChange={() => handleProposalRangeChange("20-plus")}
                    />
                    <Label htmlFor="20-plus" className="ml-2 text-sm font-normal">
                      20+
                    </Label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
