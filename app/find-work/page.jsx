"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const BASE_URL = "http://localhost:5000";
const FIVERR_BLACK = "#404145";
const FIVERR_GREEN = "#1dbf73";

export default function JobsListingPage() {
  /* ──────────── Clerk user & IDs ──────────── */
  const { user } = useUser();
  const [freelancerId, setFreelancerId] = useState(null);

  /* ──────────── connects balance ──────────── */
  const [connects, setConnects] = useState(null);

  /* ──────────── filters state ──────────── */
  const [searchQuery, setSearchQuery] = useState("");
  const [locationSearch, setLocationSearch] = useState("");
  const [experienceLevel, setExperienceLevel] = useState([]);
  const [jobType, setJobType] = useState("hourly");
  const [proposalRange, setProposalRange] = useState([]);

  /* ──────────── categories ──────────── */
  const [allCategories, setAllCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");

  /* ──────────── jobs & proposals ──────────── */
  const [jobs, setJobs] = useState([]);
  const [proposalCounts, setProposalCounts] = useState({}); // { jobId: n }
  const [fetchError, setFetchError] = useState("");

  const router = useRouter();

  /* ────────────────────── Get userId from backend (via email) ────────────────────── */
  useEffect(() => {
    if (!user) return;
    const email = user.emailAddresses[0].emailAddress;

    (async () => {
      try {
        const r = await fetch(`${BASE_URL}/api/getUserId`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });
        const { userId } = await r.json();
        setFreelancerId(userId);
      } catch {
        console.error("Unable to fetch user id");
      }
    })();
  }, [user]);

  /* ────────────────────── Connects balance ────────────────────── */
  useEffect(() => {
    if (!freelancerId) return;

    const getConnects = async () => {
      try {
        const r = await fetch(
          `${BASE_URL}/api/payments/connects?userId=${freelancerId}`
        );
        if (r.ok) {
          const d = await r.json();
          setConnects(d.balance);
        }
      } catch {
        /* ignore */
      }
    };

    getConnects();
  }, [freelancerId]);

  /* ────────────────────── Categories (once) ────────────────────── */
  useEffect(() => {
    (async () => {
      try {
        const r = await fetch(`${BASE_URL}/api/categories/getAllCategories`);
        if (r.ok) {
          setAllCategories(await r.json());
        }
      } catch {
        console.error("Error fetching categories");
      }
    })();
  }, []);

  /* ────────────────────── handlers ────────────────────── */
  const handleExperienceLevelChange = (level) =>
    setExperienceLevel((prev) =>
      prev.includes(level) ? prev.filter((l) => l !== level) : [...prev, level]
    );

  const handleProposalRangeChange = (range) =>
    setProposalRange((prev) =>
      prev.includes(range) ? prev.filter((r) => r !== range) : [...prev, range]
    );

  /* ────────────────────── query string builder ────────────────────── */
  const buildQueryParams = () => {
    const params = {};

    if (locationSearch) params.location = locationSearch;
    if (selectedCategory) params.category_id = selectedCategory;
    if (searchQuery) params.search = searchQuery;

    if (experienceLevel.length)
      params.experienceLevel = experienceLevel
        .map((l) =>
          l === "entry"
            ? "Entry Level"
            : l === "intermediate"
            ? "Intermediate"
            : "Expert"
        )
        .join(",");

    params.jobType = jobType === "hourly" ? "Hourly" : "Fixed";

    if (proposalRange.length)
      params.proposals = proposalRange
        .map((r) =>
          r === "less-than-5"
            ? "less_than_5"
            : r === "5-to-10"
            ? "5_to_10"
            : r === "10-to-20"
            ? "20_to_50"
            : "50_plus"
        )
        .join(",");

    return new URLSearchParams(params).toString();
  };

  /* ────────────────────── fetch jobs whenever filters change ────────────────────── */
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setFetchError("");
        const r = await fetch(
          `${BASE_URL}/api/jobs?${buildQueryParams()}`
        );
        if (!r.ok) {
          setFetchError("Failed to fetch jobs");
          return;
        }
        const data = await r.json();
        setJobs(data);
        fetchProposalCounts(data);
      } catch {
        setFetchError("Failed to fetch jobs");
      }
    };

    const fetchProposalCounts = async (jobsArray) => {
      const counts = {};
      await Promise.all(
        jobsArray.map(async (j) => {
          try {
            const r = await fetch(
              `${BASE_URL}/api/jobs/${j.id}/proposals`
            );
            if (r.ok) counts[j.id] = (await r.json()).length;
          } catch {
            counts[j.id] = 0;
          }
        })
      );
      setProposalCounts(counts);
    };

    fetchJobs();
  }, [
    searchQuery,
    locationSearch,
    experienceLevel,
    jobType,
    proposalRange,
    selectedCategory,
  ]);

  /* ────────────────────── misc helpers ────────────────────── */
  const renderStarRating = () => (
    <div className="flex text-yellow-400">
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i}>★</span>
      ))}
    </div>
  );

  /* ────────────────────── view ────────────────────── */
  return (
    <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ───────── left: job listings ───────── */}
        <div className="lg:col-span-2">
          {/* search */}
          <div className="mb-6">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Image
                  src="/images/search.svg"
                  alt="Search"
                  width={20}
                  height={20}
                />
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

          <h1 className="text-xl font-bold mb-4 text-gray-900">
            Jobs you might like
          </h1>

          {fetchError ? (
            <div className="text-red-500">{fetchError}</div>
          ) : jobs.length ? (
            jobs
              .filter((job) => job.status === "approved")
              .map((job, idx, filteredJobs) => (
                <div key={job.id} className="mb-4">
                  <Card className="p-4">
                    <div className="text-xs text-gray-500 mb-1">
                      Posted 
                      {new Date(job.created_at).toLocaleString()}
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

                    {/* metadata row */}
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
                        {renderStarRating()}
                        <div className="text-xs">{job.views} views</div>
                      </div>

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

                    {/* proposals + apply */}
                    <div className="flex justify-between items-center mt-4">
                      <div className="text-xs">
                        Proposals: 
                        {proposalCounts[job.id] ?? "–"}
                      </div>

                      <Button
                        className="text-white font-semibold cursor-pointer"
                        style={{ background: FIVERR_BLACK }}
                        onClick={() => router.push(`/apply-job/${job.id}`)}
                      >
                        Apply
                      </Button>
                    </div>
                  </Card>

                  {idx < filteredJobs.length - 1 && <Separator className="my-4" />}
                </div>
              ))
          ) : (
            <div>No jobs found matching your criteria.</div>
          )}
        </div>

        {/* ───────── right: filters & connects ───────── */}
        <div className="lg:col-span-1">
          <div className="mb-6 bg-white p-4 rounded-lg shadow-sm">
            {/* connects badge */}
            <div className="flex flex-col items-start justify-between mb-4">
              <p className="text-sm">
                Welcome back, {user ? user.firstName : "Freelancer"}
              </p>
              <div className="flex items-center bg-gray-100 p-4 rounded-lg mt-4">
                <Image
                  src="/images/connects.svg"
                  alt="Connects"
                  width={20}
                  height={20}
                  className="mr-2"
                />
                <span className="text-sm font-semibold">Connects:</span>
                <span
                  className="ml-1 text-sm font-bold"
                  style={{ color: FIVERR_GREEN }}
                >
                  {connects !== null ? connects : "--"}
                </span>
              </div>
            </div>

            {/* filters */}
            <div className="space-y-6">
              {/* Category filter */}
              <div className="space-y-2">
                <h3 className="text-sm font-semibold">Categories</h3>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full rounded-lg border-2 border-gray-100 p-2"
                >
                  <option value="">All Categories</option>
                  {allCategories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Experience Level */}
              <div className="space-y-2">
                <h3 className="text-sm font-semibold">Experience Level</h3>
                {["entry", "intermediate", "expert"].map((lvl) => (
                  <div key={lvl} className="flex items-center">
                    <Checkbox
                      id={`${lvl}-level`}
                      checked={experienceLevel.includes(lvl)}
                      onCheckedChange={() =>
                        handleExperienceLevelChange(lvl)
                      }
                    />
                    <Label
                      htmlFor={`${lvl}-level`}
                      className="ml-2 text-sm font-normal capitalize"
                    >
                      {lvl}
                    </Label>
                  </div>
                ))}
              </div>

              {/* Job Type */}
              <div className="space-y-2">
                <h3 className="text-sm font-semibold">Job Type</h3>
                <RadioGroup
                  value={jobType}
                  onValueChange={setJobType}
                  className="space-y-2"
                >
                  {["hourly", "fixed"].map((t) => (
                    <div key={t} className="flex items-center">
                      <RadioGroupItem value={t} id={t} />
                      <Label
                        htmlFor={t}
                        className="ml-2 text-sm font-normal capitalize"
                      >
                        {t}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              {/* Location */}
              <div className="space-y-2">
                <h3 className="text-sm font-semibold">Client Location</h3>
                <Input
                  type="text"
                  placeholder="Search location"
                  className="rounded-lg"
                  value={locationSearch}
                  onChange={(e) => setLocationSearch(e.target.value)}
                />
              </div>

              {/* Proposal ranges */}
              <div className="space-y-2">
                <h3 className="text-sm font-semibold">No of Proposals</h3>
                {[
                  { id: "less-than-5", label: "Less than 5" },
                  { id: "5-to-10", label: "5 to 10" },
                  { id: "10-to-20", label: "10 to 20" },
                  { id: "20-plus", label: "20+" },
                ].map(({ id, label }) => (
                  <div key={id} className="flex items-center">
                    <Checkbox
                      id={id}
                      checked={proposalRange.includes(id)}
                      onCheckedChange={() => handleProposalRangeChange(id)}
                    />
                    <Label htmlFor={id} className="ml-2 text-sm font-normal">
                      {label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        {/* end right */}
      </div>
    </div>
  );
}