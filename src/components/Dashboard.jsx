import { useEffect, useState } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import axios from 'axios';

function Dashboard() {
    const [summaries, setSummaries] = useState([]);
    const [studyPlans, setStudyPlans] = useState([]);
    const user = JSON.parse(localStorage.getItem("Users"));
    const token = user?.token;
    const userId = user?._id;
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState(null);

    useEffect(() => {
        const fetchSummaries = async () => {
            try {
                const response = await axios.get(
                    "http://localhost:4002/save-summary",
                    { params: { userId } }
                );
                setSummaries(response.data);
            } catch (error) {
                console.error("Failed to fetch summaries", error);
            } finally {
                setIsLoading(false);
            }
        };
        if (userId) fetchSummaries();
    }, [userId]);

    useEffect(() => {
        const fetchStudyPlans = async () => {
            try {
                const response = await axios.get(
                    "http://localhost:4002/study-plan",
                    {
                        params: { userId },
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );
                setStudyPlans(response.data.data);
            } catch (error) {
                console.error("Failed to fetch study plans", error);
            }
        };
        if (userId) fetchStudyPlans();
    }, [userId, token]);

    const handleSearch = async (query) => {
        if (!query.trim()) {
            setSearchResults(null);
            return;
        }
        try {
            const res = await axios.get(
                `http://localhost:4002/save-summary/search?query=${query}&userId=${userId}`
            );
            setSearchResults(res.data.data);
        } catch (err) {
            console.error("Search failed", err);
        }
    };

    const handleDeleteSummary = async (id) => {
        try {
            await axios.delete(`http://localhost:4002/save-summary/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setSummaries(prev => prev.filter(item => item._id !== id));
            if (searchResults) {
                setSearchResults(prev => prev.filter(item => item._id !== id));
            }
        } catch (error) {
            console.error("Delete failed", error);
        }
    };


    const handleDeletePlan = async (id) => {
        try {
            await axios.delete(`http://localhost:4002/study-plan/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setStudyPlans(prev => prev.filter(item => item._id !== id));
        } catch (error) {
            console.error("Delete failed", error);
        }
    };

    const notesToShow = searchResults || summaries;

    return (
        <div className="dark:bg-slate-900 dark:text-white min-h-screen flex flex-col">
            <Navbar />

            <div className="flex-1 max-w-screen-2xl container mx-auto md:px-20 px-4 mt-28">
                <h1 className="text-3xl font-bold mb-8">My Workspace</h1>

                {/* Search Bar */}
                <div className="mb-6">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleSearch(searchQuery)}
                            placeholder="Search your notes semantically..."
                            className="flex-1 p-3 rounded-lg border dark:bg-slate-700 dark:border-slate-600 outline-none"
                        />
                        <button
                            onClick={() => handleSearch(searchQuery)}
                            className="bg-pink-500 hover:bg-pink-600 text-white px-5 py-2 rounded-lg text-sm"
                        >
                            Search
                        </button>
                        {searchResults && (
                            <button
                                onClick={() => { setSearchQuery(""); setSearchResults(null); }}
                                className="bg-slate-500 hover:bg-slate-600 text-white px-4 py-2 rounded-lg text-sm"
                            >
                                Clear
                            </button>
                        )}
                    </div>
                    {searchResults && (
                        <p className="text-sm text-gray-500 mt-2">
                            Showing {searchResults.length} result(s) for &quot;{searchQuery}&quot;
                        </p>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Panel 1: Short Notes & Summaries */}
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md border border-gray-100 dark:border-slate-700">
                        <h2 className="text-xl font-semibold mb-4 text-pink-500">My Short Notes</h2>

                        {isLoading ? (
                            <p className="text-gray-500">Loading notes...</p>
                        ) : notesToShow.length > 0 ? (
                            <ul className="space-y-4">
                                {notesToShow.map((note) => (
                                    <li
                                        key={note._id}
                                        className="group p-5 bg-slate-50 dark:bg-slate-700 rounded-xl border border-slate-200 dark:border-slate-600 shadow-sm hover:shadow-md transition-all duration-200"
                                    >
                                        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-200">
                                            {note.text}
                                        </p>
                                        {note.score && (
                                            <p className="text-xs text-pink-400 mt-2">
                                                Relevance: {(note.score * 100).toFixed(0)}%
                                            </p>
                                        )}
                                        <button
                                            onClick={() => handleDeleteSummary(note._id)}
                                            className="mt-3 bg-red-500 hover:bg-red-600 text-white text-xs px-3 py-1 rounded-md shadow opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                                        >
                                            Delete
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-gray-500 dark:text-gray-400">
                                {searchResults ? "No matching notes found." : "You haven't saved any notes yet. Ask the AI to summarize a book!"}
                            </p>
                        )}
                    </div>

                    {/* Panel 2: Study Plans */}
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md border border-gray-100 dark:border-slate-700">
                        <h2 className="text-xl font-semibold mb-4 text-orange-500">My Study Plans</h2>

                        {studyPlans.length > 0 ? (
                            <ul className="space-y-4">
                                {studyPlans.map((plan) => (
                                    <li key={plan._id} className="group p-4 bg-slate-50 dark:bg-slate-700 rounded-xl border border-slate-200 dark:border-slate-600">
                                        <h3 className="font-bold text-md mb-2">{plan.title}</h3>
                                        <div className="space-y-1">
                                            {plan.days.map((day, idx) => (
                                                <p key={idx} className="text-sm text-slate-600 dark:text-slate-300">
                                                    <span className="font-semibold text-pink-500">Day {day.day}:</span> {day.topic} ({day.duration})
                                                </p>
                                            ))}
                                        </div>
                                        <button
                                            onClick={() => handleDeletePlan(plan._id)}
                                            className="mt-3 bg-red-500 hover:bg-red-600 text-white text-xs px-3 py-1 rounded-md shadow opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                                        >
                                            Delete
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-gray-500 dark:text-gray-400">No study plans yet. Go to Study Planner to create one!</p>
                        )}
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
}

export default Dashboard;
