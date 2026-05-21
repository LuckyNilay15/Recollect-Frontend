import React from "react";
import Home from "./home/Home";
import { Navigate, Route, Routes } from "react-router-dom";
import Courses from "./courses/Courses";
import Signup from "./components/Signup";
import { Toaster } from "react-hot-toast";
import { useAuth } from "./context/AuthProvider";
import AiCoPilotWidget from "./components/AiCoPilotWidget";
import Dashboard from "./components/Dashboard";
import Summary from "./components/Summary";


function App() {
  const [authUser, setAuthUser] = useAuth();
  console.log(authUser);
  return (
    <>
      <div className="dark:bg-slate-900 dark:text-white">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route
            path="/course"
            element={authUser ? <Courses /> : <Navigate to="/signup" />}
          />
          <Route
            path="/summarize"
            element={authUser ? <Summary /> : <Navigate to="/signup" />}
          />
          <Route path="/signup" element={<Signup />} />
          <Route path="/dashboard" element={authUser ? <Dashboard /> : <Navigate to="/signup" />} />

        </Routes>
        <Toaster />
         {authUser && <AiCoPilotWidget />}
      </div>
    </>
  );
}

export default App;
