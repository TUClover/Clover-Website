import { useState } from "react";
import { Loader2 } from "lucide-react";
import { User, UserRole } from "../../api/types/user";
import cloverLogo from "../../assets/CLOVER.svg";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  useSidebar,
} from "../../components/ui/sidebar";
import { CLOVER } from "../../components/ui/text";
import InstructorDashboard from "./InstructorDashboard";
import AdminDashboard from "./AdminDashboard";
import DevDashboard from "./DevDashboard";
import StudentDashboard from "./StudentDashboard";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";

const Dashboard = ({
  userData,
  loading,
}: {
  userData: User | null;
  loading: boolean;
}) => {
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [activeTab, setActiveTab] = useState("user-stats");

  if (!userData) return null;
  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin h-10 w-10 dark:text-white" />
      </div>
    );

  const effectiveRole = selectedRole ?? userData.role;

  const tabsByRole = {
    [UserRole.DEV]: [
      "user-stats",
      "instructor-classes",
      "admin-users",
      "app-stats",
    ],
    [UserRole.ADMIN]: ["user-stats", "instructor-classes", "admin-users"],
    [UserRole.INSTRUCTOR]: ["user-stats", "instructor-classes"],
    [UserRole.STUDENT]: ["user-stats"],
  };

  const tabLabels: Record<string, string> = {
    "user-stats": "User Statistics",
    "instructor-classes": "Instructor Classes",
    "admin-users": "Admin Users",
    "app-stats": "Application Statistics",
  };

  const handleRoleChange = (role: UserRole) => {
    setSelectedRole(role);
    setActiveTab(tabsByRole[role][0]);
  };

  const visibleTabs = tabsByRole[effectiveRole];

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <Sidebar>
          <SidebarHeader>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild className="!p-1.5">
                  <a href="/">
                    <img src={cloverLogo} alt="Clover Logo" className="h-5" />
                    <span className="text-xl font-semibold">
                      <CLOVER />
                    </span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              {visibleTabs.map((tab) => (
                <SidebarMenuItem key={tab}>
                  <SidebarMenuButton
                    className={`w-full text-left ${
                      activeTab === tab ? "bg-muted" : ""
                    }`}
                    onClick={() => setActiveTab(tab)}
                  >
                    {tabLabels[tab]}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter>
            <NavUser user={userData} />
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 p-6 space-y-6">
          <DashboardHeader
            userData={userData}
            selectedRole={effectiveRole}
            onRoleChange={
              userData.role !== UserRole.STUDENT ? handleRoleChange : undefined
            }
          />

          {activeTab === "user-stats" && (
            <StudentDashboard userData={userData} />
          )}
          {activeTab === "instructor-classes" && (
            <InstructorDashboard userData={userData} />
          )}
          {activeTab === "admin-users" && <AdminDashboard />}
          {activeTab === "app-stats" && <DevDashboard />}
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;

type DashboardHeaderProps = {
  userData: User | null;
  selectedRole?: UserRole | null;
  onRoleChange?: (role: UserRole) => void;
};

export const DashboardHeader = ({ userData }: DashboardHeaderProps) => {
  if (!userData) return null;

  return (
    <div className="flex justify-between items-center w-full">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold">
          Welcome{" "}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#50B498] to-[#9CDBA6]">
            {userData.first_name}
          </span>
          👋
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Here are your CLOVER session insights.
        </p>
      </div>
    </div>
  );
};

function NavUser({ user }: { user: User }) {
  const { isMobile } = useSidebar();

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src={user.avatar_url} alt={user.first_name} />
                <AvatarFallback className="rounded-lg">
                  {user.first_name[0]}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">
                  {user.first_name + " " + user.last_name}
                </span>
                <span className="text-muted-foreground truncate text-xs">
                  {user.email}
                </span>
              </div>
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={user.avatar_url} alt={user.first_name} />
                  <AvatarFallback className="rounded-lg">
                    {user.first_name[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">
                    {user.first_name + " " + user.last_name}
                  </span>
                  <span className="text-muted-foreground truncate text-xs">
                    {user.email}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuItem>Settings</DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Log out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
