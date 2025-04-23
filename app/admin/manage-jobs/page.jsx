"use client";

import React, { useEffect, useState } from "react";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  useAuth,
} from "@clerk/nextjs";
import {
  CheckCircle,
  XCircle,
  Loader2,
  RefreshCcw,
} from "lucide-react";

/* --------------------------- config --------------------------- */
const BASE_URL = "http://localhost:5000";          // ← backend root
const statusTabs = [
  { label: "All",        value: "" },
  { label: "Approved",   value: "approved" },
  { label: "Pending",    value: "pending" },
  { label: "Rejected",   value: "rejected" },
];

/* ---------------------------- page ---------------------------- */
export default function AdminJobsPage() {
  const { isLoaded, getToken }   = useAuth();
  const [activeTab, setTab]      = useState("");      // "" === all
  const [jobs, setJobs]          = useState([]);
  const [loading, setLoading]    = useState(false);

  /* -------- fetch helpers -------- */
  const fetchJobs = async () => {
    setLoading(true);
    try {
      const token  = await getToken();
      const qp     = activeTab ? `?status=${activeTab}` : "";
      const res    = await fetch(`${BASE_URL}/api/jobs${qp}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setJobs(await res.json());
    } catch (err) {
      console.error("Fetch jobs failed →", err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, action /* "approve" | "reject" */) => {
    try {
      const token = await getToken();
      await fetch(`${BASE_URL}/api/jobs/${id}/${action}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchJobs();                          // re-sync list
    } catch (err) {
      console.error(`Unable to ${action} job`, err);
    }
  };

  /* ----- initial + on-tab-change fetch ----- */
  useEffect(() => {
    if (isLoaded) fetchJobs();
  }, [isLoaded, activeTab]);

  /* ---------------------------- UI ---------------------------- */
  if (!isLoaded) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <>
      {/* =============== SIGNED-IN VIEW =============== */}
      <SignedIn>
        <div className="min-h-screen w-full px-4  text-gray-800">
          {/* ----- header ----- */}
          <header className="flex items-center justify-between px-4 py-3">
            <h1 className="text-2xl font-bold text-emerald-600">
              Admin — Jobs
            </h1>
            <button
              onClick={fetchJobs}
              className="flex items-center gap-1 text-sm text-emerald-600 hover:text-emerald-700"
            >
              <RefreshCcw size={16} /> Refresh
            </button>
          </header>

          {/* ----- status tabs ----- */}
          <nav className="flex gap-4 px-4 py-3">
            {statusTabs.map((t) => (
              <button
                key={t.value}
                onClick={() => setTab(t.value)}
                className={`rounded-full px-4 py-1 text-sm font-medium transition
                  ${
                    activeTab === t.value
                      ? "bg-emerald-600 text-white"
                      : "bg-white text-gray-700 hover:bg-emerald-100"
                  }`}
              >
                {t.label}
              </button>
            ))}
          </nav>

          {/* ----- job list ----- */}
          <main className="p-4">
            {loading ? (
              <div className="flex justify-center py-10">
                <Loader2 className="h-10 w-10 animate-spin text-emerald-600" />
              </div>
            ) : jobs.length === 0 ? (
              <p className="text-center text-gray-500">No jobs found.</p>
            ) : (
              <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {jobs.map((job) => (
                  <li
                    key={job.id}
                    className="rounded-lg border border-gray-200 bg-white p-4 shadow-md"
                  >
                    {/* title + status */}
                    <div className="flex items-start justify-between">
                      <h2 className="text-lg font-semibold text-gray-800">{job.title}</h2>
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize
                          ${
                            job.status === "approved"
                              ? "bg-emerald-100 text-emerald-800"
                              : job.status === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                          }`}
                      >
                        {job.status}
                      </span>
                    </div>

                    {/* description */}
                    <p className="mt-2 line-clamp-3 text-sm text-gray-600">
                      {job.description}
                    </p>

                    {/* skills */}
                    <div className="mt-3 flex flex-wrap gap-2">
                      {job.skills_required.split(",").map((s) => (
                        <span
                          key={s}
                          className="rounded bg-emerald-50 px-2 py-0.5 text-xs text-emerald-700"
                        >
                          {s.trim()}
                        </span>
                      ))}
                    </div>

                    {/* meta */}
                    <div className="mt-4 flex items-center justify-between text-sm">
                      <span className="font-medium text-emerald-600">
                        ${job.budget}
                      </span>
                      <span className="text-gray-500">
                        {job.job_type} • {job.experience_level}
                      </span>
                    </div>

                    {/* actions */}
                    {job.status === "pending" && (
                      <div className="mt-4 flex gap-2">
                        <button
                          onClick={() => updateStatus(job.id, "approve")}
                          className="flex flex-1 items-center justify-center gap-1 rounded bg-emerald-600 px-3 py-1 text-sm font-medium text-white hover:bg-emerald-700"
                        >
                          <CheckCircle size={16} /> Approve
                        </button>
                        <button
                          onClick={() => updateStatus(job.id, "reject")}
                          className="flex flex-1 items-center justify-center gap-1 rounded bg-red-600 px-3 py-1 text-sm font-medium text-white hover:bg-red-700"
                        >
                          <XCircle size={16} /> Reject
                        </button>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </main>
        </div>
      </SignedIn>

      {/* =============== SIGNED-OUT VIEW =============== */}
      <SignedOut>
        <div className="flex h-screen items-center justify-center text-gray-800">
          <div className="rounded-lg bg-white p-8 shadow-lg text-center">
            <p className="mb-4">Please sign in to access the admin dashboard.</p>
            <SignInButton mode="modal">
              <button className="rounded bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700">
                Sign in
              </button>
            </SignInButton>
          </div>
        </div>
      </SignedOut>
    </>
  );
}