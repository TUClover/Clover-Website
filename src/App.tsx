import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import "./index.css";
import RootLayout from "./RootLayout";
import Dashboard from "./pages/dashboard/ui/layout/Dashboard";
import { QuizPage } from "./pages/Quiz";
import Landing from "./pages/Landing";
import LogIn from "./pages/LogIn";
import SignUp from "./pages/SignUp";
import About from "./pages/About";
import { useAuth } from "./hooks/useAuth";
import Download from "./pages/Download";
import Help from "./pages/Help";
import AuthCallback from "./components/AuthCallback";
import { Loader2 } from "lucide-react";
import Reset from "./pages/PasswordReset";
import PasswordCallback from "./pages/PasswordCallback";
import VSCodeAuthCallback from "./components/VscodeAuth";
import { JSX } from "react";
import { UserProvider } from "./context/UserProvider";
import Settings from "./pages/Settings";
import Profile from "./pages/Profile";

/**
 * ProtectedRoute component that checks if the user is authenticated.
 * @returns {JSX.Element} - Renders the Outlet if authenticated, otherwise redirects to the main page.
 */
const ProtectedRoute = (): JSX.Element => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen w-full">
        <Loader2 className="animate-spin h-10 w-10" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

/**
 * App component that contains the main routing logic for the application.
 * @returns {JSX.Element} - The main application component.
 */
const App = (): JSX.Element => {
  return (
    <UserProvider>
      <main className="flex flex-col">
        <Routes>
          <Route element={<RootLayout />}>
            {/* Auth Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard/*" element={<Dashboard />} />
              <Route path="/quiz" element={<QuizPage />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/profile" element={<Profile />} />
            </Route>
            {/* Public Routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<LogIn />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/about" element={<About />} />
            <Route path="/download" element={<Download />} />
            <Route path="/getting-started" element={<Help />} />
            <Route path="/auth" element={<AuthCallback />} />
            <Route path="/auth/vscode" element={<VSCodeAuthCallback />} />
            <Route path="/passwordreset" element={<Reset />} />
            <Route path="/resetform" element={<PasswordCallback />} />
          </Route>
        </Routes>
      </main>
    </UserProvider>
  );
};

export default App;
