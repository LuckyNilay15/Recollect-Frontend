import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function AiCoPilotWidget() {

    // ==========================
    // OPEN / CLOSE CHAT
    // ==========================
    const [isOpen, setIsOpen] = useState(false);

    // ==========================
    // CHAT HISTORY
    // ==========================
    const [messages, setMessages] = useState([
        {
            role: 'ai',
            text: 'Hi there! Ask me anything about books, summaries, or notes.'
        }
    ]);

    // ==========================
    // INPUT STATE
    // ==========================
    const [input, setInput] = useState('');

    // ==========================
    // LOADING STATE
    // ==========================
    const [isLoading, setIsLoading] = useState(false);

    // ==========================
    // NEW: HITL PENDING ACTION
    // Stores delete confirmation action
    // ==========================
    const [pendingAction, setPendingAction] = useState(null);

    const navigate = useNavigate();

    // ==========================
    // USER DATA
    // ==========================
    const user = JSON.parse(
        localStorage.getItem("Users")
    );

    const userId = user?._id;

    // ==========================
    // SEND MESSAGE
    // ==========================
    const handleSendMessage = async (e) => {

        e.preventDefault();

        if (!input.trim()) return;

        // ==========================
        // ADD USER MESSAGE TO UI
        // ==========================
        const userMessage = {
            role: 'user',
            text: input
        };

        setMessages((prev) => [
            ...prev,
            userMessage
        ]);

        setIsLoading(true);

        try {

            let response;

            // =====================================
            // HITL CONFIRMATION FLOW
            // =====================================
            // If delete confirmation is pending
            // and user types YES
            // =====================================
            if (
                pendingAction &&
                input.toLowerCase() === "yes"
            ) {

                response = await axios.post(
                    'http://localhost:4002/chat',
                    {
                        prompt: "confirm delete",

                        userId,

                        // IMPORTANT:
                        // tells backend human approved
                        approved: true,

                        // IMPORTANT:
                        // send pending action back
                        pendingAction,
                    }
                );

                // clear pending action
                setPendingAction(null);

            } else {

                // =====================================
                // NORMAL CHAT FLOW
                // =====================================
                response = await axios.post(
                    'http://localhost:4002/chat',
                    {
                        prompt: userMessage.text,
                        userId,
                    }
                );
            }

            // ==========================
            // CLEAR INPUT
            // ==========================
            setInput('');

            // ==========================
            // STORE PENDING ACTION
            // backend sends this for HITL
            // ==========================
            if (response.data.pendingAction) {

                setPendingAction(
                    response.data.pendingAction
                );
            }

            // ==========================
            // ADD AI MESSAGE TO UI
            // ==========================
            setMessages((prev) => [
                ...prev,
                {
                    role: 'ai',
                    text:
                        response.data.reply ||
                        response.data.message ||
                        "Done!"
                }
            ]);

            // ==========================
            // ROUTING
            // ==========================
            const route = response.data.route;

            if (
                route &&
                route !== 'NONE'
            ) {

                setTimeout(() => {
                    navigate(route);
                }, 800);
            }

        } catch (error) {

            console.error(
                "Error communicating with backend:",
                error
            );

            setMessages((prev) => [
                ...prev,
                {
                    role: 'ai',
                    text:
                        'Sorry, I am having trouble connecting to the server.'
                }
            ]);

        } finally {

            setIsLoading(false);
        }
    };

    return (

        <div className="fixed bottom-6 right-6 z-50">

            {/* ==========================
                CHAT WINDOW
            ========================== */}
            {isOpen && (

                <div className="bg-white dark:bg-slate-800 w-80 h-96 rounded-xl shadow-2xl mb-4 flex flex-col border border-gray-200 dark:border-slate-700 overflow-hidden text-slate-800 dark:text-white">

                    {/* HEADER */}
                    <div className="bg-pink-500 text-white p-3 font-bold flex justify-between items-center">

                        <span>
                            AI Co-Pilot ✨
                        </span>

                        <button
                            onClick={() => setIsOpen(false)}
                            className="text-white hover:text-gray-200"
                        >
                            X
                        </button>

                    </div>

                    {/* ==========================
                        CHAT BODY
                    ========================== */}
                    <div className="flex-1 p-4 overflow-y-auto bg-slate-50 dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700 flex flex-col gap-3">

                        {messages.map((msg, idx) => (

                            <div
                                key={idx}
                                className={`
                                    max-w-[85%]
                                    p-2
                                    rounded-lg
                                    text-sm

                                    ${
                                        msg.role === 'user'
                                        ? 'bg-pink-500 text-white self-end'
                                        : 'bg-gray-200 dark:bg-slate-700 dark:text-white self-start'
                                    }
                                `}
                            >
                                {msg.text}
                            </div>
                        ))}

                        {/* LOADING */}
                        {isLoading && (

                            <div className="bg-gray-200 dark:bg-slate-700 w-12 p-2 rounded-lg text-sm self-start animate-pulse">

                                ...

                            </div>
                        )}
                    </div>

                    {/* ==========================
                        NEW:
                        HITL STATUS BAR
                    ========================== */}
                    {
                        pendingAction && (

                            <div className="p-2 bg-red-100 dark:bg-red-900 text-xs flex justify-between items-center">

                                <span>
                                    Pending delete confirmation
                                </span>

                                <button
                                    onClick={() =>
                                        setPendingAction(null)
                                    }
                                    className="text-red-600 dark:text-red-300 font-bold"
                                >
                                    Cancel
                                </button>

                            </div>
                        )
                    }

                    {/* ==========================
                        INPUT AREA
                    ========================== */}
                    <form
                        onSubmit={handleSendMessage}
                        className="p-3 bg-white dark:bg-slate-800 flex gap-2"
                    >

                        <input
                            type="text"

                            value={input}

                            onChange={(e) =>
                                setInput(e.target.value)
                            }

                            placeholder={
                                pendingAction
                                    ? "Type YES to confirm..."
                                    : "Need a recommendation?"
                            }

                            className="
                                w-full
                                bg-slate-100
                                dark:bg-slate-700
                                text-sm
                                rounded-lg
                                px-3
                                py-2
                                outline-none
                                border
                                border-transparent
                                focus:border-pink-500
                            "
                        />

                        <button
                            type="submit"

                            disabled={isLoading}

                            className="
                                bg-pink-500
                                text-white
                                px-3
                                py-1
                                rounded-lg
                                hover:bg-pink-600
                                disabled:opacity-50
                            "
                        >
                            Send
                        </button>

                    </form>
                </div>
            )}

            {/* ==========================
                FLOATING BUTTON
            ========================== */}
            <button
                onClick={() =>
                    setIsOpen(!isOpen)
                }

                className="
                    bg-pink-500
                    hover:bg-pink-600
                    text-white
                    w-14
                    h-14
                    rounded-full
                    shadow-lg
                    flex
                    items-center
                    justify-center
                    text-2xl
                    transition-transform
                    hover:scale-110
                    ml-auto
                "
            >
                💬
            </button>
        </div>
    );
}

export default AiCoPilotWidget;