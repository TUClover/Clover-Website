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
import StudentStatsView from "../pages/dashboard/ui/views/student/StudentStatsView";
import NoData from "@/components/NoData";
import UserClassesView from "@/pages/dashboard/ui/views/student/UserClassesView";
import RegisterClassView from "@/pages/dashboard/ui/views/student/RegisterClassView";
import UserLogsView from "@/pages/dashboard/ui/views/student/UserLogsView";
import InstructorStudentListView from "@/pages/dashboard/ui/views/instructor/InstructorStudentListView";
import InstructorStatsView from "@/pages/dashboard/ui/views/instructor/InstructorStatsView";
import InstructorClassesView from "@/pages/dashboard/ui/views/instructor/InstructorClassesView";
import UsersAdministrationView from "@/pages/dashboard/ui/views/admin/UsersAdministrationView";
import ClassesAdministrationView from "@/pages/dashboard/ui/views/admin/ClassesAdministrationView";
import AppAnalyticsView from "@/pages/dashboard/ui/views/dev/AppAnalyticsView";

export type SideBarItem = {
  id: string;
  icon: LucideIcon;
  name: string;
  title: string;
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
    title: "Activity Statistics",
    subheading: "My Dashboard",
    roles: ALL_ROLES,
    dashboardView: StudentStatsView,
  },
  {
    id: "user-classes",
    icon: BookOpenText,
    name: "Classes",
    title: "Class Information",
    subheading: "My Dashboard",
    roles: ALL_ROLES,
    dashboardView: UserClassesView,
  },
  {
    id: "user-register-classes",
    icon: PenBoxIcon,
    name: "Register",
    title: "Class Registration",
    subheading: "My Dashboard",
    roles: ALL_ROLES,
    dashboardView: RegisterClassView,
  },
  {
    id: "user-logs",
    icon: FileText,
    name: "Logs",
    title: "Activity Details",
    subheading: "My Dashboard",
    roles: ALL_ROLES,
    dashboardView: UserLogsView,
  },

  // Teaching
  {
    id: "instructor-stats",
    icon: BarChart3,
    name: "Student Statistics",
    title: "Student Performance Analytics",
    subheading: "Teaching",
    roles: ADMIN_ROLES,
    dashboardView: InstructorStatsView,
  },
  {
    id: "instructor-students",
    icon: Users,
    name: "Students",
    title: "Student Management",
    subheading: "Teaching",
    roles: ADMIN_ROLES,
    dashboardView: InstructorStudentListView,
  },
  {
    id: "instructor-classes",
    icon: BookOpenText,
    name: "Classes",
    title: "Class Management",
    subheading: "Teaching",
    roles: ADMIN_ROLES,
    dashboardView: InstructorClassesView,
  },

  // Administration
  {
    id: "admin-users",
    icon: Users,
    name: "Manage Users",
    title: "User Administration",
    subheading: "Administration",
    roles: SUPER_ADMIN_ROLES,
    dashboardView: UsersAdministrationView,
  },
  {
    id: "admin-classes",
    icon: Settings,
    name: "Manage Classes",
    title: "Class Administration",
    subheading: "Administration",
    roles: SUPER_ADMIN_ROLES,
    dashboardView: ClassesAdministrationView,
  },

  // Development
  {
    id: "app-stats",
    icon: BarChart2,
    name: "App Stats",
    title: "Application Analytics",
    subheading: "Development",
    roles: DEV_ONLY,
    dashboardView: AppAnalyticsView,
  },
];

export const getDashboardViewById = (id: string): ComponentType => {
  const item = sidebarItems.find((item) => item.id === id);
  return item?.dashboardView || NoData;
};

export const getTitleById = (id: string): string => {
  const item = sidebarItems.find((item) => item.id === id);
  return item?.title || "My Dashboard";
};
