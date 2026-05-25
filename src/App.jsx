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
import StudyPlanner from "./components/StudyPlanner";
import AdminDashboard from "./components/AdminDashboard";

function App() {
  const [authUser] = useAuth();
  const user = JSON.parse(localStorage.getItem("Users"));
  const isAdmin = user?.role === "Admin";

  return (
    <>
      <div className="dark:bg-slate-900 dark:text-white">
        <Routes>
          {/* Public */}
          <Route path="/signup" element={<Signup />} />

          {/* User-only routes */}
          <Route path="/" element={<Home />} />
          <Route path="/course" element={authUser ? <Courses /> : <Navigate to="/signup" />} />
          <Route
            path="/summarize"
            element={authUser && !isAdmin ? <Summary /> : <Navigate to={isAdmin ? "/admin/books" : "/signup"} />}
          />
          <Route
            path="/study-planner"
            element={authUser && !isAdmin ? <StudyPlanner /> : <Navigate to={isAdmin ? "/admin/books" : "/signup"} />}
          />
          <Route
            path="/dashboard"
            element={authUser && !isAdmin ? <Dashboard /> : <Navigate to={isAdmin ? "/admin/books" : "/signup"} />}
          />

          {/* Admin-only routes */}
          <Route
            path="/admin/books"
            element={authUser && isAdmin ? <AdminDashboard section="books" /> : <Navigate to="/" />}
          />
          <Route
            path="/admin/tools"
            element={authUser && isAdmin ? <AdminDashboard section="tools" /> : <Navigate to="/" />}
          />
          <Route
            path="/admin/audit"
            element={authUser && isAdmin ? <AdminDashboard section="audit" /> : <Navigate to="/" />}
          />
        </Routes>
        <Toaster />
        {authUser && <AiCoPilotWidget />}
      </div>
    </>
  );
}

export default App;
