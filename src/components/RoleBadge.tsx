import { UserRole } from "@/types/user";
import { Badge } from "@/components/ui/badge";

interface RoleBadgeProps {
  role: UserRole;
  className?: string;
}

const RoleBadge = ({ role, className }: RoleBadgeProps) => {
  const getRoleDisplay = (role: UserRole) => {
    const roleConfig = {
      STUDENT: {
        label: "Student",
        color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      },
      INSTRUCTOR: {
        label: "Instructor",
        color:
          "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      },
      ADMIN: {
        label: "Admin",
        color:
          "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
      },
      DEVELOPER: {
        label: "Developer",
        color:
          "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
      },
    };

    const config = roleConfig[role as keyof typeof roleConfig];
    if (!config) {
      return (
        <Badge
          variant="secondary"
          className={`w-20 rounded-xl justify-center text-[10px] md:text-xs ${className || ""}`}
        >
          {role}
        </Badge>
      );
    }

    return (
      <Badge
        variant="secondary"
        className={`${config.color}  max-w-20 rounded-xl justify-center py-0.5 sm:py-1 text-[10px] sm:text-xs ${className || ""}`}
      >
        {config.label}
      </Badge>
    );
  };

  return getRoleDisplay(role);
};

export default RoleBadge;
