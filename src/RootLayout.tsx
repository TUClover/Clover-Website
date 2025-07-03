import { Outlet } from "react-router-dom";
import { Toaster } from "./components/ui/sonner";

/**
 * RootLayout component serves as the main layout for the application.
 * It includes a navigation bar at the top, a footer at the bottom, and a main content area in between.
 * @returns {JSX.Element} The root layout component.
 */
const RootLayout = () => {
  return (
    <div className="flex flex-col dark:bg-[#0a0a0a] min-h-screen text-text">
      <Toaster richColors position="top-right" />

      {/* Main Content - Takes up remaining space */}
      <div className="flex-grow">
        <div className="mx-auto w-full">
          <Outlet />
        </div>
      </div>

      {/* Footer - Always at the bottom */}
      <footer className="py-6 text-center text-sm text-gray-600 dark:text-gray-400">
        <p>© 2025 CLOVER</p>
        <p className="text-primary">TEAM 2</p>
      </footer>
    </div>
  );
};

export default RootLayout;
