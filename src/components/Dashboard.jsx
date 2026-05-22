import React, { useEffect, useState } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import axios from 'axios';

function Dashboard() {
    // State to hold the user's summaries fetched from the DB
    const [summaries, setSummaries] = useState([]);
    const [studyPlans, setStudyPlans] = useState([]);
    const user = JSON.parse(localStorage.getItem("Users"));
    const token = user?.token;
    const userId = user?._id;
    const [isLoading, setIsLoading] = useState(true);
    // Fetch summaries when the component loads
   useEffect(() => {

        const fetchSummaries = async () => {

            try {

                const response = await axios.get(
                    "http://localhost:4002/save-summary",
                    {
                        params: {
                            userId: userId,
                        },
                    }
                );

                setSummaries(response.data);

            } catch (error) {

                console.error(
                    "Failed to fetch summaries",
                    error
                );

            } finally {

                setIsLoading(false);
            }
        };

        if (userId) {
            fetchSummaries();
        }

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

        if (userId) {
            fetchStudyPlans();
        }
    }, [userId]);

     const handleDelete = async (id) => {
        try {
            await axios.delete(`http://localhost:4002/save-summary/${id}`);

            // remove from UI instantly
            setSummaries(prev =>
                prev.filter(item => item._id !== id)
            );

        } catch (error) {
            console.error("Delete failed", error);
        }
    };
    return (
        <div className="dark:bg-slate-900 dark:text-white min-h-screen flex flex-col">
            <Navbar />
            
            <div className="flex-1 max-w-screen-2xl container mx-auto md:px-20 px-4 mt-28">
                <h1 className="text-3xl font-bold mb-8">My Workspace</h1>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    
                    {/* Panel 1: Short Notes & Summaries */}
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md border border-gray-100 dark:border-slate-700">
                        <h2 className="text-xl font-semibold mb-4 text-pink-500">My Short Notes</h2>
                        
                        {isLoading ? (
                            <p className="text-gray-500">Loading notes...</p>
                        ) : summaries.length > 0 ? (
                            <ul className="space-y-4">
                                {summaries.map((note) => (
                                                            <li
                            key={note._id}
                            className="group  p-5 bg-slate-50 dark:bg-slate-700 rounded-xl border border-slate-200 dark:border-slate-600 shadow-sm hover:shadow-md transition-all duration-200"
                            >
                            
                            {/* NOTE TEXT */}
                            <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-200 pr-10">
                                {note.text}
                            </p>

                            {/* DELETE BUTTON */}
                            <button
                                    onClick={() => handleDelete(note._id)}
                                    className="relative top-3 right-3 opacity-0 opacity-100 transition-all duration-200
                                            bg-red-500 hover:bg-red-600 text-white= text-xs px-3 py-1 rounded-md shadow"
                                >
                                    Delete
                                </button>

                            </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-gray-500 dark:text-gray-400">You haven't saved any notes yet. Ask the AI to summarize a book!</p>
                        )}
                    </div>

                   {/* Panel 2: Study Plans */}
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md border border-gray-100 dark:border-slate-700">
                        <h2 className="text-xl font-semibold mb-4 text-orange-500">My Study Plans</h2>
                        
                        {studyPlans.length > 0 ? (
                            <ul className="space-y-4">
                                {studyPlans.map((plan) => (
                                    <li key={plan._id} className="p-4 bg-slate-50 dark:bg-slate-700 rounded-xl border border-slate-200 dark:border-slate-600">
                                        <h3 className="font-bold text-md mb-2">{plan.title}</h3>
                                        <div className="space-y-1">
                                            {plan.days.map((day, idx) => (
                                                <p key={idx} className="text-sm text-slate-600 dark:text-slate-300">
                                                    <span className="font-semibold text-pink-500">Day {day.day}:</span> {day.topic} ({day.duration})
                                                </p>
                                            ))}
                                        </div>

                                        { (
                                <button
                                    onClick={() => handleDelete(note._id)}
                                    className="relative top-3 right-3 opacity-0 opacity-100 transition-all duration-200
                                            bg-red-500 hover:bg-red-600 text-white= text-xs px-3 py-1 rounded-md shadow"
                                >
                                    Delete
                                </button>
                            )}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-gray-500 dark:text-gray-400">No study plans yet. Go to Study Planner to create one!</p>
                        )}
                    </div>


                    {/* Panel 3: Admin Config */}
                    {user?.role === 'Admin' && (
                        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md border border-gray-100 dark:border-slate-700 md:col-span-2">
                            <h2 className="text-xl font-semibold mb-4 text-red-500">Admin Area: Config</h2>
                            <div className="p-4 bg-red-50 dark:bg-slate-700 rounded-lg text-sm border-dashed border-2 border-red-200 dark:border-slate-600">
                                <p className="mb-4 text-slate-800 dark:text-slate-200">Configure AI Chat Tools Access for Users:</p>
                                <button 
                                  onClick={async () => {
                                      try {
                                          await axios.post("http://localhost:4002/admin/config/tools", { targetRole: "User", newTools: ["get_books", "save_summary"] });
                                          alert("Disabled the delete tool for standard Users.");
                                      } catch (e) { alert("Request failed"); }
                                  }}
                                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded mr-4 shadow-sm border border-red-600">
                                    Disable Delete Tool
                                </button>
                                <button 
                                   onClick={async () => {
                                      try {
                                          await axios.post("http://localhost:4002/admin/config/tools", { targetRole: "User", newTools: ["get_books", "save_summary", "delete_summary"] });
                                          alert("Restored the delete tool for standard Users.");
                                      } catch (e) { alert("Request failed"); }
                                  }}
                                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded shadow-sm border border-green-600">
                                    Enable Delete Tool
                                </button>
                            </div>
                        </div>
                    )}

                </div>
            </div>

            <Footer />
        </div>
    );
}

export default Dashboard;