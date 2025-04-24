"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
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
export default function JobProposalsPage() {
  const { jobId } = useParams();
  const router = useRouter();
  const { user, isLoaded } = useUser();

  const [clientId, setClientId] = useState(null);
  const [job, setJob] = useState(null);
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /* 1️⃣  Resolve clientId via Clerk email */
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
      }
    })();
  }, [isLoaded, user]);

  /* 2️⃣  Fetch job details + proposals */
  useEffect(() => {
    if (!jobId) return;

    (async () => {
      try {
        const [jobData, proposalsData] = await Promise.all([
          fetchJson(`${BASE_URL}/api/jobs/${jobId}`),
          fetchJson(`${BASE_URL}/api/jobs/${jobId}/proposals`),
        ]);

        setJob(jobData);
        setProposals(proposalsData);
      } catch (err) {
        console.error(err);
        setError("Failed to load job/proposals. Please try again later.");
      } finally {
        setLoading(false);
      }
    })();
  }, [jobId]);

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
      Loading…
    </div>
  );

  const Empty = () => (
    <p className="text-center text-gray-500 py-20">No proposals yet for this job.</p>
  );

  /* ---------------------------- render -------------------------- */

  if (loading) return <Spinner />;
  if (error) return <p className="text-red-600 text-center py-4">{error}</p>;
  if (!job) return null;

  return (
    <main className="mx-auto max-w-4xl px-4 lg:px-0 py-10">
      {/* Job header */}
      <section className="border rounded-lg p-6 bg-white shadow-sm mb-10">
        <div className="flex justify-between items-start gap-4 mb-4">
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 underline">
            {job.title}
          </h1>
          <span className="text-xl md:text-2xl font-extrabold text-green-600 whitespace-nowrap">
            ${job.budget}
          </span>
        </div>
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
        <p className="text-gray-700 leading-relaxed">{job.description}</p>
      </section>

      {/* Proposals list */}
      <h2 className="text-xl font-bold mb-6 text-gray-900">
        Proposals ({proposals.length})
      </h2>

      {proposals.length === 0 && <Empty />}

      <ul className="space-y-6">
        {proposals.map((p) => (
          <li key={p.id}>
            <article className="border rounded-lg p-6 bg-white shadow-sm hover:shadow-md transition">
              {/* header */}
              <div className="flex justify-between items-start gap-4 mb-2">
                <h3 className="text-lg md:text-xl font-semibold text-gray-900">
                  {p.freelancer_email}
                </h3>
                <span className="text-lg font-semibold text-green-600 whitespace-nowrap">
                  ${p.bid}
                </span>
              </div>

              <p className="text-gray-700 mb-4 whitespace-pre-line">
                {p.proposal_content}
              </p>

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Timeline: {p.timeline}</span>

                <button
                  disabled={!clientId}
                  onClick={() =>
                    router.push(
                      `/chat?jobId=${jobId}&freelancerId=${p.freelancer_id}&clientId=${clientId}`
                    )
                  }
                  className={`inline-flex items-center cursor-pointer gap-2 px-4 py-2 rounded-md text-white text-sm font-medium transition ${
                    clientId
                      ? "bg-green-600 hover:bg-green-700"
                      : "bg-gray-300 cursor-not-allowed"
                  }`}
                >
                  Hire
                </button>
              </div>
            </article>
          </li>
        ))}
      </ul>
    </main>
  );
}
