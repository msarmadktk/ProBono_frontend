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

const BASE_URL = "http://localhost:5000";        // ← backend root
const FIVERR_GREEN = "#1dbf73";

export default function PostJobPage() {
  /* ───────────────────────────── state ───────────────────────────── */
  const [title, setTitle]                   = useState("");
  const [categories, setCategories]         = useState([]);
  const [category, setCategory]             = useState("");
  const [jobType, setJobType]               = useState("Hourly");
  const [budget, setBudget]                 = useState("200");
  const [experienceLevel, setExperienceLevel] = useState("Expert");
  const [skills, setSkills]                 = useState([]);
  const [skillInput, setSkillInput]         = useState("");
  const [description, setDescription]       = useState("");
  const [loading, setLoading]               = useState(false);

  // auth / money
  const [clientId, setClientId]             = useState(null);
  const [balance, setBalance]               = useState(null);

  // add‑funds modal
  const [showAddFunds, setShowAddFunds]     = useState(false);
  const [addAmount, setAddAmount]           = useState("");
  const [addingFunds, setAddingFunds]       = useState(false);

  // toast
  const [toastMessage, setToastMessage]     = useState("");
  const [toastType, setToastType]           = useState("success"); // "success" | "error"
  const [showToast, setShowToast]           = useState(false);

  /* ─────────────────────────── side‑effects ─────────────────────────── */
  useEffect(() => {
    // 1. categories
    (async () => {
      try {
        const res  = await fetch(`${BASE_URL}/api/categories/getAllCategories`);
        if (!res.ok) throw new Error();
        const data = await res.json();
        setCategories(data);
        if (data.length) setCategory(String(data[0].id));
      } catch {
        console.error("Unable to fetch categories");
      }
    })();

    // 2. user‑id
    (async () => {
      try {
        const userEmail = localStorage.getItem("userEmail") || "i221213@nu.edu.pk";
        const res = await fetch(`${BASE_URL}/api/getUserId`, {
          method : "POST",
          headers: { "Content-Type": "application/json" },
          body   : JSON.stringify({ email: userEmail }),
        });
        if (!res.ok) throw new Error();
        const { userId } = await res.json();
        setClientId(userId);
      } catch {
        console.error("Unable to fetch user ID");
      }
    })();
  }, []);

  // 3. balance (depends on clientId)
  useEffect(() => {
    if (!clientId) return;
    (async () => {
      try {
        const res  = await fetch(`${BASE_URL}/api/balances?userId=${clientId}`);
        if (!res.ok) throw new Error();
        const data = await res.json();
        setBalance(parseFloat(data.available_amount));
      } catch {
        console.error("Unable to fetch balance");
      }
    })();
  }, [clientId]);

  /* ───────────────────────────── helpers ───────────────────────────── */
  const showToastMsg = (msg, type = "success") => {
    setToastType(type);
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3500);
  };

  const handleSkillInputKeyDown = (e) => {
    if (e.key === "Tab" || e.key === "Enter") {
      e.preventDefault();
      if (skillInput.trim()) {
        setSkills([...skills, skillInput.trim()]);
        setSkillInput("");
      }
    }
  };
  const removeSkill = (i) => setSkills(skills.filter((_, idx) => idx !== i));

  /* ───────────────────────────── add funds ───────────────────────────── */
  const handleAddFunds = async () => {
    if (!addAmount || parseFloat(addAmount) <= 0) {
      showToastMsg("Enter a positive amount", "error");
      return;
    }
    setAddingFunds(true);
    try {
      const res = await fetch(`${BASE_URL}/api/balances/add`, {
        method : "POST",
        headers: { "Content-Type": "application/json" },
        body   : JSON.stringify({
          userId: clientId,
          amount: parseFloat(addAmount),
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setBalance(parseFloat(data.balance.available_amount));
        showToastMsg("Funds added successfully!");
        setShowAddFunds(false);
        setAddAmount("");
      } else {
        showToastMsg(data.message || "Unable to add funds", "error");
      }
    } catch {
      showToastMsg("Unexpected error. Try again.", "error");
    } finally {
      setAddingFunds(false);
    }
  };

  /* ───────────────────────────── submit job ───────────────────────────── */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title || !description || !category || !skills.length) {
      showToastMsg("Please fill in all required fields", "error");
      return;
    }

    if (balance !== null && parseFloat(budget) > balance) {
      showToastMsg("Your balance is too low for this budget. Please add funds.", "error");
      return;
    }

    setLoading(true);

    const jobData = {
      title,
      description,
      skills_required: skills.join(", "),
      budget         : parseFloat(budget),
      clientId,
      category_id    : parseInt(category),
      location       : "Remote",
      experienceLevel,
      jobType,
    };

    try {
      const res  = await fetch(`${BASE_URL}/api/jobs`, {
        method : "POST",
        headers: { "Content-Type": "application/json" },
        body   : JSON.stringify(jobData),
      });
      const data = await res.json();

      if (res.status === 201) {
        showToastMsg("Job posted successfully! ");
        // reset
        setTitle("");
        setDescription("");
        setSkills([]);
        setBudget("200");
      } else {
        showToastMsg(data.message || "Failed to post job", "error");
      }
    } catch {
      showToastMsg("An unexpected error occurred", "error");
    } finally {
      setLoading(false);
    }
  };

  /* ───────────────────────────── view ───────────────────────────── */
  return (
    <div className="max-w-6xl mx-auto py-10 px-4 sm:px-6">
      {/* header + balance */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-black">Post a job</h1>

        <div className="flex flex-col items-end  gap-4">
          {balance !== null && (
            <span
              className="text-lg font-semibold"
              style={{ color: FIVERR_GREEN }}
            >
              <span className="text-black">Available Balance</span> &nbsp;${balance.toFixed(2)}
            </span>
          )}
          <Button
            type="button"
            className="text-white font-semibold"
            style={{ background: FIVERR_GREEN }}
            onClick={() => setShowAddFunds(true)}
          >
            Add Funds
          </Button>
        </div>
      </div>

      {/* post‑job form */}
      <Card className="p-6 sm:p-8 shadow-sm border-gray-200">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-base font-medium text-black">
              Title
            </Label>
            <Input
              id="title"
              placeholder="e.g. Need a frontend developer"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-gray-50 border-gray-200 h-11 text-base"
              required
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category" className="text-base font-medium text-black">
              Category
            </Label>
            <Select value={category} onValueChange={setCategory} required>
              <SelectTrigger
                id="category"
                className="w-full bg-white border-gray-200 h-11 text-base"
              >
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.length ? (
                  categories.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.name}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="loading" disabled>
                    Loading categories…
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
              {["Fixed", "Hourly"].map((t) => (
                <div key={t} className="flex items-center space-x-2">
                  <RadioGroupItem value={t} id={t} className="border-gray-400" />
                  <Label htmlFor={t} className="font-normal text-black">
                    {t}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Budget */}
          <div className="space-y-2">
            <Label htmlFor="budget" className="text-base font-medium text-black">
              Estimated Budget
            </Label>
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
            <Label className="text-base font-medium text-black">
              Experience Level
            </Label>
            <RadioGroup
              value={experienceLevel}
              onValueChange={setExperienceLevel}
              className="space-y-3"
            >
              {["Entry", "Intermediate", "Expert"].map((lvl) => (
                <div key={lvl} className="flex items-center space-x-2">
                  <RadioGroupItem
                    value={lvl}
                    id={lvl}
                    className="border-gray-400"
                  />
                  <Label htmlFor={lvl} className="font-normal text-black">
                    {lvl} Level
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Skills */}
          <div className="space-y-2">
            <Label htmlFor="skills" className="text-base font-medium text-black">
              Skills Required
            </Label>
            <div className="border border-gray-200 rounded-md p-3 bg-white">
              <div className="flex flex-wrap gap-2 mb-2">
                {skills.map((skill, idx) => (
                  <div
                    key={idx}
                    className="bg-gray-100 text-black px-3 py-1.5 rounded-md flex items-center text-sm font-medium"
                  >
                    <span>{skill}</span>
                    <button
                      type="button"
                      onClick={() => removeSkill(idx)}
                      className="ml-2 text-gray-500 hover:text-black"
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
                  className="border-0 focus-visible:ring-0 p-0 shadow-none text-base"
                />
              </div>
            </div>
            <p className="text-xs text-gray-500">
              Press Tab or Enter after typing to add a skill
            </p>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label
              htmlFor="description"
              className="text-base font-medium text-black"
            >
              Description
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-40 bg-gray-50 text-base border-gray-200 resize-y"
              placeholder="Describe the job requirements, responsibilities, and other details…"
              required
            />
          </div>

          {/* submit */}
          <div className="pt-4">
            <Button
              type="submit"
              className="bg-gray-200 text-black hover:bg-black hover:text-white font-bold text-base h-11 px-6"
              disabled={loading}
            >
              {loading ? "Posting…" : "Post Job"}
            </Button>
          </div>
        </form>
      </Card>

      {/* toast */}
      {showToast && (
        <div
          className={`fixed bottom-5 right-5 px-4 py-2 rounded shadow-lg transition-opacity duration-300 ${
            toastType === "success" ? "bg-green-500" : "bg-red-500"
          } text-white`}
        >
          {toastMessage}
        </div>
      )}

      {/* add‑funds modal */}
      {showAddFunds && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-sm p-6">
            <h2 className="text-xl font-bold mb-4 text-black">Add Funds</h2>

            <div className="space-y-4">
              <Input
                type="number"
                min="1"
                step="0.01"
                placeholder="Amount"
                value={addAmount}
                onChange={(e) => setAddAmount(e.target.value)}
                className="h-11"
              />

              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => {
                    setShowAddFunds(false);
                    setAddAmount("");
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  className="text-white"
                  style={{ background: FIVERR_GREEN }}
                  onClick={handleAddFunds}
                  disabled={addingFunds}
                >
                  {addingFunds ? "Adding…" : "Add"}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
