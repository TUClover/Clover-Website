import ThemeToggle from "../../../../components/ThemeToggle";
import { Separator } from "../../../../components/ui/separator";
import { SiGithub } from "react-icons/si";
import { SidebarTrigger } from "../../../../components/ui/sidebar";
import { UserRole } from "../../../../api/types/user";

const DashboardContentHeader = ({ role }: { role?: UserRole }) => {
  return (
    <header className="sticky top-0 z-50 flex h-(--header-height) mb-6 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height) backdrop-blur-md bg-background/80 supports-[backdrop-filter]:bg-background/60">
      <div className="flex w-full items-center gap-1 px-4 py-2 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 h-4 dark:bg-gray-600"
        />

        <div className="ml-auto flex items-center gap-2">
          {role === UserRole.DEV && (
            <button className="flex rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              <a
                href="https://github.com/Civic-Interactions-Lab/clover"
                rel="noopener noreferrer"
                target="_blank"
                className="dark:text-foreground flex-1 flex"
              >
                <SiGithub className="size-7" />
              </a>
            </button>
          )}

          <ThemeToggle />
        </div>
      </div>
    </header>
  );
};

export default DashboardContentHeader;
