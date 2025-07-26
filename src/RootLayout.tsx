import { Outlet } from "react-router-dom";
import { Toaster } from "./components/ui/sonner";

/**
 * RootLayout component serves as the main layout for the application.
 * It includes a navigation bar at the top, a footer at the bottom, and a main content area in between.
 * @returns {JSX.Element} The root layout component.
 */
const RootLayout = () => {
  return (
    <div className="flex flex-col bg-white dark:bg-[#0a0a0a] min-h-screen text-text">
      <Toaster richColors position="top-right" />

      {/* Main Content - Takes up remaining space */}
      <div className="flex-grow">
        <div className="mx-auto w-full">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default RootLayout;
