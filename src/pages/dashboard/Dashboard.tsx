import { useState } from "react";
import {
  BarChart2,
  BookOpenText,
  Users,
  Activity,
  Loader2,
  LucideIcon,
  Download,
  FileQuestion,
} from "lucide-react";
import { ClassData, StudentStatus, User, UserRole } from "../../api/types/user";
import cloverLogo from "../../assets/CLOVER.svg";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "../../components/ui/sidebar";
import { CLOVER } from "../../components/ui/text";
import InstructorDashboard from "./InstructorDashboard";
import { AdminClasses, AdminUsers } from "./AdminDashboard";
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
import { Separator } from "../../components/ui/separator";
import { Button } from "../../components/ui/button";
import { supabase } from "../../supabaseClient";
import { useNavigate } from "react-router-dom";
import ThemeToggle from "../../components/ThemeToggle";

import { useUserClasses } from "../../hooks/useUserClasses";
import RegisterClassDialog from "../../components/RegisterClassDialog";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "../../components/ui/carousel";
import ClassInfoCard from "../../components/ClassInfoCard";
import ClassDetails from "../../components/ClassDetails";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { Badge } from "../../components/ui/badge";
import { Skeleton } from "../../components/ui/skeleton";
import { Card } from "../../components/ui/card";
import InfoTooltip from "../../components/InfoTooltip";
import StudentDataTable from "../../components/StudentDataTable";
import { useInstructorClasses } from "../../hooks/useInstructorClasses";
import { useClassActivity } from "../../hooks/useClassActivity";

type SideBarItem = {
  id: string;
  icon: LucideIcon;
  name: string;
  subheading: string;
  roles: UserRole[];
};

const sidebarItems = [
  // Students
  {
    id: "user-stats",
    icon: Activity,
    name: "Statistics",
    subheading: "My Dashboard",
    roles: [
      UserRole.DEV,
      UserRole.ADMIN,
      UserRole.INSTRUCTOR,
      UserRole.STUDENT,
    ],
  },
  {
    id: "user-classes",
    icon: Activity,
    name: "Classes",
    subheading: "My Dashboard",
    roles: [
      UserRole.DEV,
      UserRole.ADMIN,
      UserRole.INSTRUCTOR,
      UserRole.STUDENT,
    ],
  },
  {
    id: "user-register-classes",
    icon: Activity,
    name: "Register",
    subheading: "My Dashboard",
    roles: [
      UserRole.DEV,
      UserRole.ADMIN,
      UserRole.INSTRUCTOR,
      UserRole.STUDENT,
    ],
  },
  {
    id: "user-logs",
    icon: Activity,
    name: "Logs",
    subheading: "My Dashboard",
    roles: [
      UserRole.DEV,
      UserRole.ADMIN,
      UserRole.INSTRUCTOR,
      UserRole.STUDENT,
    ],
  },
  // Instructor Views
  {
    id: "instructor-stats",
    icon: BookOpenText,
    name: "Student Statistics",
    subheading: "Teaching",
    roles: [UserRole.DEV, UserRole.ADMIN, UserRole.INSTRUCTOR],
  },
  {
    id: "instructor-students",
    icon: BookOpenText,
    name: "Students",
    subheading: "Teaching",
    roles: [UserRole.DEV, UserRole.ADMIN, UserRole.INSTRUCTOR],
  },
  {
    id: "instructor-classes",
    icon: BookOpenText,
    name: "Classes",
    subheading: "Teaching",
    roles: [UserRole.DEV, UserRole.ADMIN, UserRole.INSTRUCTOR],
  },
  // Admin Views
  {
    id: "admin-users",
    icon: Users,
    name: "Manage Users",
    subheading: "Administration",
    roles: [UserRole.DEV, UserRole.ADMIN],
  },
  {
    id: "admin-classes",
    icon: Users,
    name: "Manage Classes",
    subheading: "Administration",
    roles: [UserRole.DEV, UserRole.ADMIN],
  },
  // Dev Views
  {
    id: "app-stats",
    icon: BarChart2,
    name: "App Stats",
    subheading: "Development",
    roles: [UserRole.DEV],
  },
];

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
        <SidebarInset className="flex-1 overflow-y-auto">
          <main>
            <DashboardContent userData={userData} activeTab={activeTab} />
          </main>
        </SidebarInset>
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
      <div className="flex items-center gap-4">
        <div className="flex flex-col">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            Welcome{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#50B498] to-[#9CDBA6]">
              {userData.first_name}
            </span>
            👋
          </h1>
          <p className="text-sm text-muted-foreground">
            Here are your CLOVER session insights.
          </p>
        </div>
      </div>
    </div>
  );
};

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
              <DropdownMenuItem>
                <a href="/profile">Profile</a>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <a href="/settings">Settings</a>
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
        {Object.entries(groupedItems).map(([subheading, items]) => (
          <SidebarGroup key={subheading}>
            <h1>{subheading}</h1>
            {items.map(({ id, icon: Icon, name }) => (
              <SidebarMenuItem key={id}>
                <SidebarMenuButton
                  className={`w-full text-left ${
                    activeTab === id ? "bg-muted" : ""
                  }`}
                  onClick={() => setActiveTab(id)}
                >
                  <Icon className="mr-2 h-4 w-4" />
                  {name}
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter>
        {userData.role === UserRole.DEV && onRoleChange && (
          <div className="px-4 pb-4">
            <label className="text-xs font-semibold text-muted-foreground block mb-1">
              Viewing as
            </label>
            <select
              value={effectiveRole}
              onChange={(e) => onRoleChange(e.target.value as UserRole)}
              className="w-full rounded-md border px-2 py-1 text-sm bg-background"
            >
              {Object.values(UserRole).map((role) => (
                <option key={role} value={role}>
                  {role[0] + role.slice(1).toLowerCase()}
                </option>
              ))}
            </select>
          </div>
        )}
        <SidebarMenuButton className={`w-full pl-4 text-left`}>
          <Download className="mr-2 h-4 w-4" />
          <a href="/download">Download</a>
        </SidebarMenuButton>
        <SidebarMenuButton className={`w-full text-left`}>
          <FileQuestion className="mr-2 h-4 w-4" />
          <a href="https://civic-interactions-lab.github.io/clover/">Docs</a>
        </SidebarMenuButton>
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
    <div className="w-full p-2">
      <DashboardContentHeader />
      <div className="px-6">
        {activeTab === "user-stats" && <StudentDashboard userData={userData} />}
        {activeTab === "user-classes" && <UserClasses />}
        {activeTab === "instructor-stats" && (
          <InstructorDashboard userData={userData} />
        )}
        {activeTab === "admin-users" && <AdminUsers />}
        {activeTab == "admin-classes" && <AdminClasses />}
        {activeTab === "app-stats" && <DevDashboard />}
        {activeTab === "user-register-classes" && <RegisterClassPage />}
        {activeTab === "instructor-students" && (
          <InstructorStudents userData={userData} />
        )}
      </div>
    </div>
  );
}

const UserClasses = () => {
  const { originalClasses, loading: userClassLoading } = useUserClasses();
  const [selectedClass, setSelectedClass] = useState<{
    userClass: ClassData;
    studentStatus?: StudentStatus;
    instructorData?: User;
    studentCount?: number;
  } | null>(null);

  if (userClassLoading) {
    return (
      <div className="flex min-h-screen justify-center items-center">
        <Loader2 className="size-12 animate-spin" />
      </div>
    );
  }

  const handleClassSelect = (
    userClass: ClassData,
    studentStatus?: StudentStatus,
    instructorData?: User,
    studentCount?: number
  ) => {
    setSelectedClass({
      userClass,
      studentStatus,
      instructorData,
      studentCount,
    });
  };

  const handleCloseDetails = () => {
    setSelectedClass(null);
  };

  return (
    <>
      <div className="width-container grid grid-cols-1 md:grid-cols-5 lg:grid-cols-3 gap-6">
        <div className="col-span-1 md:col-span-3 lg:col-span-2 space-y-4">
          <div className="card flex w-full justify-center">
            {originalClasses.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 p-16 text-center">
                <p className="text-lg font-medium">
                  You currently have no classes
                </p>
                <p className="text-muted-foreground mb-6">
                  Please register a new class
                </p>
                <RegisterClassDialog />
              </div>
            ) : (
              <Carousel
                opts={{
                  align: "start",
                }}
                className="w-full"
              >
                <CarouselContent>
                  {originalClasses.map((userClassInfo, index) => (
                    <CarouselItem key={index} className="lg:basis-1/2">
                      <div className="p-1">
                        <ClassInfoCard
                          classInfo={userClassInfo}
                          onSelect={handleClassSelect}
                        />
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                {originalClasses.length > 1 && (
                  <div
                    className={`flex justify-between w-full ${originalClasses.length <= 2 && "lg:hidden"}`}
                  >
                    <CarouselPrevious className="ml-4" />
                    <CarouselNext className="mr-4" />
                  </div>
                )}
              </Carousel>
            )}
          </div>
        </div>
      </div>

      {selectedClass && (
        <ClassDetails
          userClass={selectedClass.userClass}
          instructorData={selectedClass.instructorData as User}
          onClose={handleCloseDetails}
        />
      )}
    </>
  );
};

function DashboardContentHeader() {
  return (
    <header className="flex h-(--header-height) mb-6 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 py-2 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <div className="ml-auto flex items-center gap-2">
          <Button variant="ghost" asChild size="sm" className="hidden sm:flex">
            <a
              href="https://github.com/Civic-Interactions-Lab/clover"
              rel="noopener noreferrer"
              target="_blank"
              className="dark:text-foreground"
            >
              GitHub
            </a>
          </Button>
        </div>
        <ThemeToggle />
      </div>
    </header>
  );
}

const RegisterClassPage = () => {
  const { classes, loading } = useUserClasses();

  return (
    <div className="w-full p-4">
      <div className="border rounded-md shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-1/3">Class</TableHead>
              <TableHead className="w-1/3">Instructor</TableHead>
              <TableHead className="w-1/3">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <TableRow key={`loading-${i}`}>
                  <TableCell colSpan={3}>
                    <Skeleton className="h-5 w-full" />
                  </TableCell>
                </TableRow>
              ))
            ) : classes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-4">
                  No classes registered. Please register a new class.
                </TableCell>
              </TableRow>
            ) : (
              classes.map((userClass) => {
                const {
                  user_class: c,
                  enrollment_status,
                  student_status,
                } = userClass;

                return (
                  <TableRow key={c.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {c.class_image_cover ? (
                          <img
                            src={c.class_image_cover}
                            alt="Class cover"
                            className="w-10 h-10 rounded object-cover"
                          />
                        ) : (
                          <div
                            className="w-10 h-10 rounded"
                            style={{ backgroundColor: c.class_hex_color }}
                          />
                        )}
                        <div>
                          <div className="font-medium">{c.class_title}</div>
                          <div className="text-muted-foreground text-sm">
                            {c.class_code}
                          </div>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      {/* You can fetch instructor name based on instructor_id or include it in `ClassData` */}
                      <span className="text-sm text-muted-foreground">
                        Instructor ID: {c.instructor_id}
                      </span>
                    </TableCell>

                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <Badge variant="outline">{enrollment_status}</Badge>
                        <Badge variant="secondary">{student_status}</Badge>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

const UserLogs = () => {};

const InstructorStudents = ({ userData }: { userData: User }) => {
  const { classes, selectedClassId, handleClassSelect } = useInstructorClasses(
    userData.id
  );

  const { allActivity, classActivity, progressData } = useClassActivity(
    classes,
    selectedClassId
  );

  const selectedClassTitle =
    classes.find((classItem) => classItem.id === selectedClassId)
      ?.class_title ?? "";

  return (
    <Card className="p-6 mt-8">
      <div className="flex items-center mb-2 gap-3">
        <h2 className="text-md font-semibold text-primary">
          Insights About Students
        </h2>
        <InfoTooltip>
          <div className="text-sm space-y-2">
            <p>
              The table shows insights from{" "}
              <span className="text-primary font-semibold">
                {selectedClassTitle}
              </span>
              , summarizing student decisions on code suggestions and their
              accuracy.
            </p>
            <p className="text-xs text-muted-foreground">
              Click on any row to view student-specific suggestions and
              performance details.
            </p>
          </div>
        </InfoTooltip>
      </div>
      <StudentDataTable
        logs={allActivity}
        classFilter={selectedClassTitle === "all classes" ? "all" : "class"}
      />
    </Card>
  );
};
