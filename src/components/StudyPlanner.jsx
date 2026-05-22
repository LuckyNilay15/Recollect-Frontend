import React, { useState } from "react";
import axios from "axios";
import Navbar from "./Navbar";
import Footer from "./Footer";

function StudyPlanner() {
  const [prompt, setPrompt] = useState("");
  const [plan, setPlan] = useState(null);
  const [step, setStep] = useState("input"); // input | hitl_review_1 | hitl_review_2 | complete
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const user = JSON.parse(localStorage.getItem("Users"));
  const userId = user?._id;
  const token = user?.token;

  const authHeaders = {
    headers: { Authorization: `Bearer ${token}` },
  };

  // Step 1: Generate plan
  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    try {
      const res = await axios.post(
        "http://localhost:4002/study-plan/generate",
        { prompt, userId },
        authHeaders
      );
      setPlan(res.data.plan);
      setStep("hitl_review_1");
      setMessage(res.data.message);
    } catch (err) {
      console.error("Generate error:", err);
      setMessage("Error generating plan");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Send edited plan for sequencing
  const handleSequence = async () => {
    setLoading(true);
    try {
      const res = await axios.post(
        "http://localhost:4002/study-plan/sequence",
        { editedPlan: plan, userId },
        authHeaders
      );
      setPlan(res.data.plan);
      setStep("hitl_review_2");
      setMessage(res.data.message);
    } catch (err) {
      console.error("Sequence error:", err);
      setMessage("Error sequencing plan");
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Save final plan
  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await axios.post(
        "http://localhost:4002/study-plan/save",
        { plan, userId },
        authHeaders
      );
      setStep("complete");
      setMessage(res.data.message);
    } catch (err) {
      console.error("Save error:", err);
      setMessage("Error saving plan");
    } finally {
      setLoading(false);
    }
  };

  // Edit a day
  const handleDayChange = (index, field, value) => {
    const updated = [...plan.days];
    updated[index] = { ...updated[index], [field]: value };
    setPlan({ ...plan, days: updated });
  };

  // Reset
  const handleReset = () => {
    setPlan(null);
    setStep("input");
    setPrompt("");
    setMessage("");
  };

  return (
    <div className="dark:bg-slate-900 dark:text-white min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 max-w-screen-2xl container mx-auto md:px-20 px-4 mt-28">
        <h1 className="text-3xl font-bold mb-4 text-center">Study Planner</h1>

        {/* Step indicator */}
        <div className="flex justify-center gap-4 mb-8 text-sm">
          <span className={step === "input" ? "text-pink-500 font-bold" : "text-gray-400"}>1. Prompt</span>
          <span>→</span>
          <span className={step === "hitl_review_1" ? "text-pink-500 font-bold" : "text-gray-400"}>2. Review Topics</span>
          <span>→</span>
          <span className={step === "hitl_review_2" ? "text-pink-500 font-bold" : "text-gray-400"}>3. Review Sequence</span>
          <span>→</span>
          <span className={step === "complete" ? "text-green-500 font-bold" : "text-gray-400"}>4. Saved</span>
        </div>

        {message && (
          <p className="text-center mb-4 text-sm text-pink-500">{message}</p>
        )}

        {/* Step: Input */}
        {step === "input" && (
          <div className="flex gap-4">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. Create a study plan for React in 5 days"
              className="flex-1 p-3 rounded-lg border dark:bg-slate-700 dark:border-slate-600 outline-none"
            />
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-3 rounded-lg"
            >
              {loading ? "Generating..." : "Generate"}
            </button>
          </div>
        )}

        {/* Step: HITL Review (both review steps use same editable UI) */}
        {(step === "hitl_review_1" || step === "hitl_review_2") && plan && (
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md">
            <input
              type="text"
              value={plan.title}
              onChange={(e) => setPlan({ ...plan, title: e.target.value })}
              className="text-2xl font-bold mb-6 w-full bg-transparent border-b border-pink-500 outline-none pb-2"
            />

            <div className="space-y-4">
              {plan.days.map((day, idx) => (
                <div key={idx} className="flex gap-4 items-center bg-slate-50 dark:bg-slate-700 p-4 rounded-lg">
                  <span className="font-bold text-pink-500 w-16">Day {day.day}</span>
                  <input
                    type="text"
                    value={day.topic}
                    onChange={(e) => handleDayChange(idx, "topic", e.target.value)}
                    className="flex-1 p-2 rounded border dark:bg-slate-600 dark:border-slate-500 outline-none"
                    placeholder="Topic"
                  />
                  <input
                    type="text"
                    value={day.duration}
                    onChange={(e) => handleDayChange(idx, "duration", e.target.value)}
                    className="w-32 p-2 rounded border dark:bg-slate-600 dark:border-slate-500 outline-none"
                    placeholder="Duration"
                  />
                  <input
                    type="text"
                    value={day.notes || ""}
                    onChange={(e) => handleDayChange(idx, "notes", e.target.value)}
                    className="w-48 p-2 rounded border dark:bg-slate-600 dark:border-slate-500 outline-none"
                    placeholder="Notes"
                  />
                </div>
              ))}
            </div>

            <div className="flex gap-4 mt-6">
              {step === "hitl_review_1" && (
                <button
                  onClick={handleSequence}
                  disabled={loading}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg"
                >
                  {loading ? "Sequencing..." : "Confirm & Sequence"}
                </button>
              )}
              {step === "hitl_review_2" && (
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg"
                >
                  {loading ? "Saving..." : "Save Plan"}
                </button>
              )}
              <button
                onClick={handleReset}
                className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg"
              >
                Start Over
              </button>
            </div>
          </div>
        )}

        {/* Step: Complete */}
        {step === "complete" && (
          <div className="text-center">
            <p className="text-green-500 text-xl font-bold mb-4">Plan saved successfully!</p>
            <button
              onClick={handleReset}
              className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-2 rounded-lg"
            >
              Create Another Plan
            </button>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}

export default StudyPlanner;
