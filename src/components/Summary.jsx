import React, { useState } from "react";
import axios from "axios";
import Navbar from "./Navbar";
import Footer from "./Footer";
function Summary() {
  const [text, setText] = useState("");
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const user = JSON.parse(localStorage.getItem("Users"));
  const userId = user?._id;
  // Generate Summary
  const handleSummarize = async () => {
    if (!text.trim()) return;

    try {
      setLoading(true);
        const prompt = `
       Summarize the following content into short and clear notes:

       ${text}
        `;
      const response = await axios.post(
        "http://localhost:4002/chat",
        {
          prompt: prompt,
        }
      );

      setSummary(response.data.message);
    } catch (error) {
      console.error("Error generating summary:", error);
    } finally {
      setLoading(false);
    }
  };

  // Save Summary
   const handleSaveSummary = async () => {

    if (!summary) return;

    try {

      setSaving(true);

      await axios.post(
        "http://localhost:4002/save-summary",
        {
          summary,
          userId,
        }
      );

      alert("Summary saved successfully!");

    } catch (error) {

      console.error("Error saving summary:", error);

      alert("Failed to save summary");

    } finally {

      setSaving(false);
    }
  };

  return (
    <div className="dark:bg-slate-900 dark:text-white min-h-screen flex flex-col">
      <Navbar />

      <div className="flex-1 max-w-screen-2xl container mx-auto md:px-20 px-4 mt-28">
        <h1 className="text-3xl font-bold mb-8 text-center">
          Summarize and create your short notes.
        </h1>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md">
          {/* Input Box */}
          <textarea
            rows="10"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste your book text here..."
            className="w-full p-4 rounded-lg border dark:bg-slate-700 dark:border-slate-600 outline-none"
          />

          {/* Buttons */}
          <div className="flex gap-4 mt-4">
            <button
              onClick={handleSummarize}
              disabled={loading}
              className="bg-pink-500 hover:bg-pink-600 text-white px-5 py-2 rounded-lg duration-300"
            >
              {loading ? "Generating..." : "Generate Summary"}
            </button>

            {summary && (
              <button
                onClick={handleSaveSummary}
                disabled={saving}
                className="bg-green-500 hover:bg-green-600 text-white px-5 py-2 rounded-lg duration-300"
              >
                {saving ? "Saving..." : "Save Summary"}
              </button>
            )}
          </div>

          {/* Summary Output */}
          {summary && (
            <div className="mt-8">
              <h2 className="text-2xl font-semibold mb-4 text-pink-500">
                Generated Summary
              </h2>

              <div className="bg-slate-50 dark:bg-slate-700 p-5 rounded-lg leading-7 border-l-4 border-pink-500">
                {summary}
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default Summary;