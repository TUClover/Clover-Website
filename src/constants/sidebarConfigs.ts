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
import StudentClassesView from "@/pages/dashboard/ui/views/student/StudentClassesView";
import StudentRegisterClassView from "@/pages/dashboard/ui/views/student/StudentRegisterClassView";
import StudentLogsView from "@/pages/dashboard/ui/views/student/StudentLogsView";
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
  description?: string;
  subheading: string;
  roles: UserRole[];
  dashboardView: ComponentType<{
    description?: string;
  }>;
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
  {
    id: "user-stats",
    icon: Activity,
    name: "Statistics",
    title: "Activity Statistics",
    description:
      "View your learning progress, accuracy rates, and performance metrics.",
    subheading: "My Dashboard",
    roles: ALL_ROLES,
    dashboardView: StudentStatsView,
  },
  {
    id: "user-classes",
    icon: BookOpenText,
    name: "Classes",
    title: "Class Information",
    description:
      "Explore your class portfolio and access detailed course information.",
    subheading: "My Dashboard",
    roles: ALL_ROLES,
    dashboardView: StudentClassesView,
  },
  {
    id: "user-register-classes",
    icon: PenBoxIcon,
    name: "Register",
    title: "Class Registration",
    description:
      "Explore available learning opportunities and advance your academic goals.",
    subheading: "My Dashboard",
    roles: ALL_ROLES,
    dashboardView: StudentRegisterClassView,
  },
  {
    id: "user-logs",
    icon: FileText,
    name: "Logs",
    title: "Activity Details",
    subheading: "My Dashboard",
    roles: ALL_ROLES,
    dashboardView: StudentLogsView,
  },

  // Teaching
  {
    id: "instructor-stats",
    icon: BarChart3,
    name: "Class Statistics",
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
    description:
      "Create new courses, monitor class progress, and manage your teaching portfolio.",
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
