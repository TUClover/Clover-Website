import { EnrollmentStatus } from "@/types/user";
import { Badge } from "./ui/badge";

interface EnrollmentBadgeProps {
  status: EnrollmentStatus | undefined;
  className?: string;
}

const EnrollmentBadge = ({ status, className }: EnrollmentBadgeProps) => {
  const getStatusDisplay = (status: EnrollmentStatus | undefined) => {
    if (!status) {
      return (
        <Badge
          variant="secondary"
          className={`w-20 rounded-xl justify-center py-1 text-xs bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-200 ${className || ""}`}
        >
          Not Enroll
        </Badge>
      );
    }

    const statusConfig = {
      ENROLLED: {
        label: "Enrolled",
        color:
          "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      },
      WAITLISTED: {
        label: "Waitlisted",
        color:
          "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      },
      REJECTED: {
        label: "Rejected",
        color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
      },
      COMPLETED: {
        label: "Completed",
        color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      },
      REMOVED: {
        label: "Removed",
        color: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
      },
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    if (!config) {
      return (
        <Badge
          variant="secondary"
          className={`w-20 rounded-xl justify-center py-1 text-xs ${className || ""}`}
        >
          {status}
        </Badge>
      );
    }

    return (
      <Badge
        variant="secondary"
        className={`${config.color} w-20 rounded-xl justify-center py-1 text-xs ${className || ""}`}
      >
        {config.label}
      </Badge>
    );
  };

  return getStatusDisplay(status);
};

export default EnrollmentBadge;
