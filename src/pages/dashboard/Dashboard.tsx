import { useState } from "react";
import { Loader2, Download, FileQuestion } from "lucide-react";
import { User, UserRole } from "../../api/types/user";
import cloverLogo from "../../assets/CLOVER.svg";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  // SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "../../components/ui/sidebar";
import { CLOVER } from "../../components/ui/text";
import InstructorDashboard, {
  InstructorClasses,
  InstructorStudents,
} from "./InstructorDashboard";
import { AdminClasses, AdminUsers } from "./AdminDashboard";
import DevDashboard from "./DevDashboard";
import StudentDashboard, {
  RegisterClassPage,
  UserClasses,
  UserLogs,
} from "./StudentDashboard";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { supabase } from "../../supabaseClient";
import { useNavigate } from "react-router-dom";
import ThemeToggle from "../../components/ThemeToggle";
import { SideBarItem, sidebarItems } from "../../constants/sidebarConfigs";
import { Separator } from "../../components/ui/separator";
import { SiGithub } from "react-icons/si";
import { Label } from "../../components/ui/label";

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

  const handleRoleChange = (role: UserRole) => {
    setSelectedRole(role);

    const firstVisibleTab = sidebarItems.find((item) =>
      item.roles.includes(role)
    )?.id;

    if (firstVisibleTab) {
      setActiveTab(firstVisibleTab);
    }
  };

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <SideBar
          userData={userData}
          sidebarItems={sidebarItems}
          effectiveRole={effectiveRole}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onRoleChange={handleRoleChange}
        />
        {/* <SidebarInset className="flex-1 overflow-y-auto dark:bg-[#0a0a0a]"> */}
        <main className="flex-1 bg-background/80 dark:bg-[#0a0a0a] overflow-auto">
          <DashboardContentHeader role={effectiveRole} />
          <DashboardContent userData={userData} activeTab={activeTab} />
          <div className="h-[500px]" />
        </main>
        {/* </SidebarInset> */}
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;

function NavUser({ user }: { user: User }) {
  const { isMobile } = useSidebar();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    supabase.auth.signOut();
    navigate("/");
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground space-x-1"
            >
              <Avatar className="size-9 rounded-full">
                <AvatarImage src={user.avatar_url} alt={user.first_name} />
                <AvatarFallback className="rounded-lg font-semibold text-lg">
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
              <DropdownMenuItem onClick={() => navigate("/profile")}>
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/settings")}>
                Settings
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut}>Log out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

function SideBar({
  userData,
  sidebarItems,
  effectiveRole,
  activeTab,
  setActiveTab,
  onRoleChange,
}: {
  userData: User;
  sidebarItems: SideBarItem[];
  effectiveRole: UserRole;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onRoleChange: (role: UserRole) => void;
}) {
  const navigate = useNavigate();

  const visibleItems = sidebarItems.filter((item) =>
    item.roles.includes(effectiveRole)
  );

  const groupedItems = visibleItems.reduce<Record<string, typeof sidebarItems>>(
    (groups, item) => {
      const group = item.subheading || "Other";
      if (!groups[group]) groups[group] = [];
      groups[group].push(item);
      return groups;
    },
    {}
  );
  return (
    <Sidebar variant="inset">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="!p-1 !m-1.5">
              <a href="/">
                <img src={cloverLogo} alt="Clover Logo" className="h-8" />
                <span className="text-2xl font-bold">
                  <CLOVER />
                </span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {Object.entries(groupedItems).map(([subheading, items]) => (
          <SidebarGroup key={subheading}>
            <SidebarGroupLabel>{subheading}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {items.map(({ id, icon: Icon, name }) => (
                  <SidebarMenuItem key={id}>
                    <SidebarMenuButton
                      className={`w-full text-left ${
                        activeTab === id ? "bg-muted" : ""
                      }`}
                      onClick={() => setActiveTab(id)}
                    >
                      <Icon />
                      <span>{name}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter className="pb-4">
        {userData.role === UserRole.DEV && onRoleChange && (
          <div className="space-y-1">
            <Label className="text-xs font-semibold text-muted-foreground px-1.5">
              Viewing as
            </Label>
            <Select
              value={effectiveRole}
              onValueChange={(value) => onRoleChange(value as UserRole)}
            >
              <SelectTrigger className="w-full text-sm bg-background">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                {Object.values(UserRole).map((role) => (
                  <SelectItem key={role} value={role}>
                    {role[0] + role.slice(1).toLowerCase()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <SidebarGroup className="mb-2">
          <SidebarGroupLabel>Actions</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => navigate("/download")}
                  className="w-full text-left"
                >
                  <Download className="h-4 w-4" />
                  <span>Download</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() =>
                    window.open(
                      "https://civic-interactions-lab.github.io/clover/",
                      "_blank"
                    )
                  }
                  className="w-full text-left"
                >
                  <FileQuestion className="h-4 w-4" />
                  <span>Docs</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <NavUser user={userData} />
      </SidebarFooter>
    </Sidebar>
  );
}

function DashboardContent({
  activeTab,
  userData,
}: {
  activeTab: string;
  userData: User;
}) {
  return (
    <div className="w-full max-w-7xl mx-auto">
      <div className="px-6">
        {activeTab === "user-stats" && <StudentDashboard userData={userData} />}
        {activeTab === "user-classes" && <UserClasses />}
        {activeTab === "instructor-stats" && (
          <InstructorDashboard userData={userData} />
        )}
        {activeTab === "admin-users" && <AdminUsers />}
        {activeTab == "admin-classes" && <AdminClasses />}
        {activeTab === "app-stats" && <DevDashboard />}
        {activeTab === "user-register-classes" && (
          <RegisterClassPage user={userData} />
        )}
        {activeTab === "instructor-students" && (
          <InstructorStudents userData={userData} />
        )}
        {activeTab === "instructor-classes" && (
          <InstructorClasses userData={userData} />
        )}
        {activeTab === "user-logs" && <UserLogs userData={userData} />}
      </div>
    </div>
  );
}

function DashboardContentHeader({ role }: { role?: UserRole }) {
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
}
