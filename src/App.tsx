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
import Reset from "./pages/PasswordReset";
import PasswordCallback from "./pages/PasswordCallback";
import VSCodeAuthCallback from "./components/VscodeAuth";
import { JSX } from "react";
import { UserProvider } from "./context/UserProvider";
import Settings from "./pages/Settings";
import Profile from "./pages/Profile";
import Loading from "./components/Loading";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ClassDetailsView from "./pages/classes/ui/views/ClassDetailsView";
import ClassCreateEditView from "./pages/classes/ui/views/ClassCreateEditView";

const queryClient = new QueryClient();

/**
 * ProtectedRoute component that checks if the user is authenticated.
 * @returns {JSX.Element} - Renders the Outlet if authenticated, otherwise redirects to the main page.
 */
const ProtectedRoute = (): JSX.Element => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <Loading />;
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
    <QueryClientProvider client={queryClient}>
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
                <Route
                  path="/classes/:classId"
                  element={<ClassDetailsView />}
                />
                <Route
                  path="/classes/:classId/edit"
                  element={<ClassCreateEditView />}
                />
                <Route
                  path="/classes/create"
                  element={<ClassCreateEditView />}
                />
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
    </QueryClientProvider>
  );
};

export default App;
