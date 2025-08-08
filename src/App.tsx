import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import "./index.css";
import RootLayout from "./RootLayout";
import Dashboard from "./pages/dashboard/ui/layout/Dashboard";
import { QuizPage } from "./pages/Quiz";
import Landing from "./pages/Landing";
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
import Profile from "./pages/profile/ui/layout/Profile";
import Loading from "./components/Loading";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ClassDetailsView from "./pages/classes/ui/views/ClassDetailsView";
import ClassCreateEditView from "./pages/classes/ui/views/ClassCreateEditView";
import SettingsView from "./pages/settings/ui/views/SettingsView";
import SignUpView from "./pages/auth/ui/views/SignUpView";
import LogInView from "./pages/auth/ui/views/LogInView";
import AnonymousLoginView from "./pages/auth/ui/views/AnonymousLoginView";
import Construction from "./pages/Construction";
import { ConstructionRoute, EarlyAccessProvider } from "./hooks/useEarlyAccess";
import { PublicLayout } from "./pages/PublicLayout";
import UserDetailsView from "./pages/dashboard/ui/views/admin/UserDetailsView";

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
      <EarlyAccessProvider>
        <UserProvider>
          <main className="flex flex-col">
            <Routes>
              <Route element={<RootLayout />}>
                <Route element={<ConstructionRoute />}>
                  {/* Auth Routes */}
                  <Route element={<ProtectedRoute />}>
                    <Route path="/dashboard/*" element={<Dashboard />} />
                    <Route path="/quiz" element={<QuizPage />} />
                    <Route path="/settings" element={<SettingsView />} />
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
                    <Route
                      path="/users/:userId"
                      element={<UserDetailsView />}
                    />
                  </Route>
                  {/* Public Routes */}

                  <Route path="/" element={<PublicLayout />}>
                    <Route index element={<Landing />} />
                    <Route path="home" element={<Landing />} />
                    <Route path="about" element={<About />} />
                    <Route path="download" element={<Download />} />
                    <Route path="/login" element={<LogInView />} />
                    <Route path="/signup" element={<SignUpView />} />
                    <Route path="/anonymous" element={<AnonymousLoginView />} />
                    <Route path="/getting-started" element={<Help />} />
                    <Route path="/passwordreset" element={<Reset />} />
                  </Route>
                </Route>
                <Route path="/resetform" element={<PasswordCallback />} />
                <Route path="/auth" element={<AuthCallback />} />
                <Route path="/auth/vscode" element={<VSCodeAuthCallback />} />
                <Route path="/early-access" element={<Construction />} />
              </Route>
            </Routes>
          </main>
        </UserProvider>
      </EarlyAccessProvider>
    </QueryClientProvider>
  );
};

export default App;
