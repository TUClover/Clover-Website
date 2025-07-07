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

export type SideBarItem = {
  id: string;
  icon: LucideIcon;
  name: string;
  subheading: string;
  roles: UserRole[];
};

// Role constants
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
  },
  {
    id: "user-classes",
    icon: BookOpenText,
    name: "Classes",
    subheading: "My Dashboard",
    roles: ALL_ROLES,
  },
  {
    id: "user-register-classes",
    icon: PenBoxIcon,
    name: "Register",
    subheading: "My Dashboard",
    roles: ALL_ROLES,
  },
  {
    id: "user-logs",
    icon: FileText,
    name: "Logs",
    subheading: "My Dashboard",
    roles: ALL_ROLES,
  },

  // Teaching
  {
    id: "instructor-stats",
    icon: BarChart3,
    name: "Student Statistics",
    subheading: "Teaching",
    roles: ADMIN_ROLES,
  },
  {
    id: "instructor-students",
    icon: Users,
    name: "Students",
    subheading: "Teaching",
    roles: ADMIN_ROLES,
  },
  {
    id: "instructor-classes",
    icon: BookOpenText,
    name: "Classes",
    subheading: "Teaching",
    roles: ADMIN_ROLES,
  },

  // Administration
  {
    id: "admin-users",
    icon: Users,
    name: "Manage Users",
    subheading: "Administration",
    roles: SUPER_ADMIN_ROLES,
  },
  {
    id: "admin-classes",
    icon: Settings,
    name: "Manage Classes",
    subheading: "Administration",
    roles: SUPER_ADMIN_ROLES,
  },

  // Development
  {
    id: "app-stats",
    icon: BarChart2,
    name: "App Stats",
    subheading: "Development",
    roles: DEV_ONLY,
  },
];
