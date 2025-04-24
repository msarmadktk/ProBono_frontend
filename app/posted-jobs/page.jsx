"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";

/* --------------------------- config --------------------------- */
const BASE_URL = "http://localhost:5000"; // ← backend root

/* --------------------------- helpers -------------------------- */
const fetchJson = async (url, options = {}) => {
  const res = await fetch(url, options);
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.json();
};

/* -------------------------- component ------------------------- */
export default function ClientJobsPage() {
  const { user, isLoaded } = useUser();

  const [clientId, setClientId] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /* 1️⃣  Get clientId from backend (via Clerk email) */
  useEffect(() => {
    if (!isLoaded || !user) return;

    (async () => {
      try {
        const email = user.emailAddresses?.[0]?.emailAddress;
        if (!email) throw new Error("No email found on Clerk user");

        const { userId } = await fetchJson(`${BASE_URL}/api/getUserId`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });

        setClientId(userId);
      } catch (err) {
        console.error(err);
        setError("Unable to resolve user ID. Please refresh.");
        setLoading(false);
      }
    })();
  }, [isLoaded, user]);

  /* 2️⃣  Fetch jobs once we know clientId */
  useEffect(() => {
    if (!clientId) return;

    (async () => {
      try {
        // Fetch all jobs – backend can later add ?client_id support
        const data = await fetchJson(`${BASE_URL}/api/jobs`);
        // Keep only jobs that belong to the logged‑in client
        setJobs(data.filter((job) => job.client_id === clientId));
      } catch (err) {
        console.error(err);
        setError("Failed to load jobs. Please try again later.");
      } finally {
        setLoading(false);
      }
    })();
  }, [clientId]);

  /* -------------------------- ui helpers ------------------------ */
  const Spinner = () => (
    <div className="flex flex-col items-center justify-center py-20 text-gray-500">
      <svg
        className="animate-spin h-8 w-8 mb-3 text-green-600"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        ></circle>
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8v4l3.536-3.536A8 8 0 014 12z"
        ></path>
      </svg>
      Loading jobs…
    </div>
  );

  const Empty = () => (
    <p className="text-center text-gray-500 py-20">No jobs posted yet.</p>
  );

  /* ---------------------------- render -------------------------- */
  return (
    <main className="mx-auto max-w-4xl px-4 lg:px-0 py-10">
      <h1 className="text-3xl font-bold mb-8 text-gray-900">Your Posted Jobs</h1>

      {loading && <Spinner />}
      {error && <p className="text-red-600 text-center py-4">{error}</p>}
      {!loading && !error && jobs.length === 0 && <Empty />}

      <ul className="space-y-6">
        {jobs.map((job) => (
          <li key={job.id}>
            <article className="border rounded-lg p-6 shadow-sm bg-white hover:shadow-md transition">
              {/* header */}
              <div className="flex justify-between items-start gap-4 mb-4">
                <h2 className="text-xl md:text-2xl font-extrabold text-gray-900 underline">
                  {job.title}
                </h2>
                <span className="text-lg md:text-2xl font-extrabold text-green-600 whitespace-nowrap">
                  ${job.budget}
                </span>
              </div>

              {/* skills */}
              <div className="flex flex-wrap gap-2 mb-4">
                {job.skills_required
                  .split(/,\s*/)
                  .filter(Boolean)
                  .map((skill) => (
                    <span
                      key={skill}
                      className="bg-gray-100 text-gray-700 rounded-full px-3 py-1 text-sm font-medium"
                    >
                      {skill}
                    </span>
                  ))}
              </div>

              {/* description */}
              <p className="text-gray-700 mb-6 line-clamp-3">
                {job.description}
              </p>

              {/* footer */}
              <div className="flex justify-end">
                <Link
                  href={`/jobs/${job.id}/proposals`}
                  className="text-green-600 hover:text-green-700 font-medium"
                >
                  View Proposals
                </Link>
              </div>
            </article>
          </li>
        ))}
      </ul>
    </main>
  );
}
