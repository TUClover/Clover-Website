import {
  BarChart2,
  BookOpenText,
  Users,
  PenBoxIcon,
  LucideIcon,
  Activity,
  FileText,
  Settings,
  BarChart3,
} from "lucide-react";
import { UserRole } from "../api/types/user";
import { ComponentType } from "react";
import StudentStatsView, {
  RegisterClassPage,
  UserClasses,
  UserLogs,
} from "../pages/dashboard/ui/views/student/StudentStatsView";
import InstructorDashboard, {
  InstructorClasses,
  InstructorStudents,
} from "../pages/dashboard/ui/views/InstructorDashboard";
import {
  AdminClasses,
  AdminUsers,
} from "../pages/dashboard/ui/views/AdminDashboard";
import DevDashboard from "../pages/dashboard/ui/views/DevDashboard";
import NoData from "../components/NoData";

export type SideBarItem = {
  id: string;
  icon: LucideIcon;
  name: string;
  subheading: string;
  roles: UserRole[];
  dashboardView: ComponentType;
};

const ALL_ROLES = [
  UserRole.DEV,
  UserRole.ADMIN,
  UserRole.INSTRUCTOR,
  UserRole.STUDENT,
];
const ADMIN_ROLES = [UserRole.DEV, UserRole.ADMIN, UserRole.INSTRUCTOR];
const SUPER_ADMIN_ROLES = [UserRole.DEV, UserRole.ADMIN];
const DEV_ONLY = [UserRole.DEV];

export const sidebarItems: SideBarItem[] = [
  // My Dashboard
  {
    id: "user-stats",
    icon: Activity,
    name: "Statistics",
    subheading: "My Dashboard",
    roles: ALL_ROLES,
    dashboardView: StudentStatsView,
  },
  {
    id: "user-classes",
    icon: BookOpenText,
    name: "Classes",
    subheading: "My Dashboard",
    roles: ALL_ROLES,
    dashboardView: UserClasses,
  },
  {
    id: "user-register-classes",
    icon: PenBoxIcon,
    name: "Register",
    subheading: "My Dashboard",
    roles: ALL_ROLES,
    dashboardView: RegisterClassPage,
  },
  {
    id: "user-logs",
    icon: FileText,
    name: "Logs",
    subheading: "My Dashboard",
    roles: ALL_ROLES,
    dashboardView: UserLogs,
  },

  // Teaching
  {
    id: "instructor-stats",
    icon: BarChart3,
    name: "Student Statistics",
    subheading: "Teaching",
    roles: ADMIN_ROLES,
    dashboardView: InstructorDashboard,
  },
  {
    id: "instructor-students",
    icon: Users,
    name: "Students",
    subheading: "Teaching",
    roles: ADMIN_ROLES,
    dashboardView: InstructorStudents,
  },
  {
    id: "instructor-classes",
    icon: BookOpenText,
    name: "Classes",
    subheading: "Teaching",
    roles: ADMIN_ROLES,
    dashboardView: InstructorClasses,
  },

  // Administration
  {
    id: "admin-users",
    icon: Users,
    name: "Manage Users",
    subheading: "Administration",
    roles: SUPER_ADMIN_ROLES,
    dashboardView: AdminUsers,
  },
  {
    id: "admin-classes",
    icon: Settings,
    name: "Manage Classes",
    subheading: "Administration",
    roles: SUPER_ADMIN_ROLES,
    dashboardView: AdminClasses,
  },

  // Development
  {
    id: "app-stats",
    icon: BarChart2,
    name: "App Stats",
    subheading: "Development",
    roles: DEV_ONLY,
    dashboardView: DevDashboard,
  },
];

export const getComponentById = (id: string): ComponentType => {
  const item = sidebarItems.find((item) => item.id === id);
  return item?.dashboardView || NoData;
};
