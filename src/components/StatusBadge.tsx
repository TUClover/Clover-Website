import { UserStatus } from "@/types/user";
import { Badge } from "@/components/ui/badge";

interface StatusBadgeProps {
  status: UserStatus;
  className?: string;
}

const StatusBadge = ({ status, className }: StatusBadgeProps) => {
  const getStatusDisplay = (status: UserStatus) => {
    const capitalizeFirst = (str: string) => {
      return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    };

    return (
      <Badge
        variant={status === "ACTIVE" ? "default" : "destructive"}
        className={`w-20 rounded-xl justify-center py-1 text-xs ${className || ""}`}
      >
        {capitalizeFirst(status)}
      </Badge>
    );
  };

  return getStatusDisplay(status);
};

export default StatusBadge;
