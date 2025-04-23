"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5000";

export default function JobDetailPage() {
  const { id } = useParams();
  const { isLoaded, user } = useUser();

  // State variables
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [jobError, setJobError] = useState("");
  const [freelancerId, setFreelancerId] = useState(null);
  const [userError, setUserError] = useState("");
  const [proposalsLoading, setProposalsLoading] = useState(false);
  const [proposalsError, setProposalsError] = useState("");
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [proposal, setProposal] = useState({
    proposal_content: "",
    timeline: "",
    bid: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState("");

  // Predefined timeline options
  const timelineOptions = [
    { value: "5 days", label: "5 days" },
    { value: "7 days", label: "7 days" },
    { value: "12 days", label: "12 days" },
    { value: "2 weeks", label: "2 weeks" },
    { value: "3 weeks", label: "3 weeks" },
    { value: "4 weeks", label: "4 weeks" },
    { value: "1 month", label: "1 month" },
    { value: "2 months", label: "2 months" },
  ];

  // Fetch job data
  useEffect(() => {
    if (!id) return;

    (async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/jobs/${id}`);
        if (!res.ok) throw new Error("Could not load job");
        const data = await res.json();
        setJob(data);
      } catch (err) {
        setJobError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  // Fetch freelancer ID
  useEffect(() => {
    if (isLoaded && user) {
      const email = user.primaryEmailAddress.emailAddress;

      (async () => {
        try {
          const res = await fetch(`${BASE_URL}/api/getUserId`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ email }),
          });

          if (!res.ok) throw new Error("Could not fetch user ID");
          const data = await res.json();
          setFreelancerId(data.userId);
        } catch (err) {
          setUserError(err.message);
        }
      })();
    }
  }, [isLoaded, user]);

  // Check for existing proposals
  useEffect(() => {
    if (freelancerId && id) {
      (async () => {
        setProposalsLoading(true);
        setProposalsError("");
        try {
          const res = await fetch(`${BASE_URL}/api/jobs/${id}/proposals`);
          if (!res.ok) throw new Error("Could not load proposals");
          const data = await res.json();
          const submitted = data.some((p) => p.freelancer_id === freelancerId);
          setHasSubmitted(submitted);
        } catch (err) {
          setProposalsError(err.message);
        } finally {
          setProposalsLoading(false);
        }
      })();
    }
  }, [freelancerId, id]);

  // Form handlers
  const handleChange = (e) =>
    setProposal((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate proposal content
    if (!proposal.proposal_content.trim()) {
      setMsg("Proposal content cannot be empty");
      return;
    }

    // Validate bid
    const bidValue = parseFloat(proposal.bid);
    if (isNaN(bidValue) || bidValue <= 0) {
      setMsg("Bid must be a positive number");
      return;
    }

    setSubmitting(true);
    setMsg("");

    try {
      const fullProposal = {
        freelancerId: String(freelancerId),
        proposal_content: proposal.proposal_content,
        timeline: proposal.timeline,
        bid: bidValue,
      };

      const res = await fetch(`${BASE_URL}/api/jobs/${id}/proposals`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fullProposal),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err?.message || "Submit failed");
      }

      const data = await res.json();
      setMsg(data.message || "Proposal submitted successfully!");
      setProposal({ proposal_content: "", timeline: "", bid: "" });
      setHasSubmitted(true); // Prevent resubmission
    } catch (err) {
      setMsg(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // UI Rendering
  return (
    <main className="min-h-screen bg-white text-gray-800 flex flex-col items-center py-10 px-4">
      {loading ? (
        <p className="p-10 text-center text-gray-600">Loading job data…</p>
      ) : jobError ? (
        <p className="p-10 text-center text-red-600">{jobError}</p>
      ) : (
        <section className="w-full max-w-3xl bg-gray-100 border border-gray-300 rounded-lg shadow p-6 mb-8">
          <h1 className="text-3xl font-semibold text-gray-900 mb-2">{job.title}</h1>
          <p className="text-sm text-gray-600 mb-4">
            Posted {new Date(job.created_at).toLocaleDateString()} • Budget:
            <span className="text-green-600 font-medium"> ${job.budget}</span>
          </p>
          <h2 className="text-lg font-medium text-gray-900 mb-1">Description</h2>
          <p className="text-gray-700 whitespace-pre-line mb-4">{job.description}</p>
          <h3 className="text-lg font-medium text-gray-900 mb-1">Skills Required</h3>
          <ul className="flex flex-wrap gap-2 mb-4">
            {job.skills_required.split(",").map((s) => (
              <li
                key={s.trim()}
                className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs"
              >
                {s.trim()}
              </li>
            ))}
          </ul>
          <p className="text-sm text-gray-500">
            Client: {job.client_email} • Status: {job.status}
          </p>
        </section>
      )}

      {!isLoaded ? (
        <p className="p-10 text-center text-gray-600">Loading user data…</p>
      ) : !user ? (
        <p className="p-10 text-center text-gray-600">Please sign in to submit a proposal.</p>
      ) : userError ? (
        <p className="p-10 text-center text-red-600">{userError}</p>
      ) : !freelancerId ? (
        <p className="p-10 text-center text-gray-600">Fetching user ID…</p>
      ) : proposalsLoading ? (
        <p className="p-10 text-center text-gray-600">Checking if you have already submitted a proposal…</p>
      ) : proposalsError ? (
        <p className="p-10 text-center text-red-600">{proposalsError}</p>
      ) : hasSubmitted ? (
        <p className="p-10 text-center text-gray-600">You have submitted a proposal for this job.</p>
      ) : (
        <section className="w-full max-w-3xl bg-gray-100 border border-gray-300 rounded-lg shadow p-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Submit Proposal</h2>
          {msg && (
            <p
              className={`mb-4 text-center ${
                msg.toLowerCase().includes("success") ? "text-green-600" : "text-red-600"
              }`}
            >
              {msg}
            </p>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Proposal
              </label>
              <textarea
                name="proposal_content"
                rows={5}
                required
                value={proposal.proposal_content}
                onChange={handleChange}
                className="w-full rounded-md bg-white text-gray-800 border border-gray-300 p-3 focus:ring-2 focus:ring-blue-500"
                placeholder="Explain why you’re the best fit…"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Timeline
                </label>
                <select
                  name="timeline"
                  required
                  value={proposal.timeline}
                  onChange={handleChange}
                  className="w-full rounded-md bg-white text-gray-800 border border-gray-300 p-2 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select timeline</option>
                  {timelineOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bid (USD)
                </label>
                <input
                  type="number"
                  name="bid"
                  step="0.01"
                  min="0.01"
                  required
                  value={proposal.bid}
                  onChange={handleChange}
                  className="w-full rounded-md bg-white text-gray-800 border border-gray-300 p-2 focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. 950"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-green-600 hover:bg-green-700 cursor-pointer text-white font-semibold py-2 rounded-md transition disabled:opacity-50"
            >
              {submitting ? "Submitting…" : "Send Proposal"}
            </button>
          </form>
        </section>
      )}
    </main>
  );
}