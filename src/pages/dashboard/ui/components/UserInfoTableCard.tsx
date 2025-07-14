import { UserMode, UserRole, UserStatus } from "@/api/types/user";
import MiniPieChart from "@/components/MiniPieChart";
import ModeBadge from "@/components/ModeBadge";
import RoleBadge from "@/components/RoleBadge";
import StatusBadge from "@/components/StatusBadge";
import { Card, CardContent } from "@/components/ui/card";
import { formatActivityTimestamp, isOnline } from "@/lib/utils";

interface UserInfoTableCardProps {
  // Required props
  index: number;
  name: string;
  onClick: () => void;

  // Activity data
  totalAccepted: number;
  totalRejected: number;
  totalInteractions: number;
  correctSuggestions: number;
  accuracyPercentage: number;
  lastActivity: string | null;

  // Optional display props
  className?: string;
  classTitle?: string;
  email?: string;
  role?: UserRole;
  mode?: UserMode;
  status?: UserStatus;
}

const UserInfoTableCard = ({
  index,
  name,
  onClick,
  totalAccepted,
  totalRejected,
  totalInteractions,
  correctSuggestions,
  accuracyPercentage,
  lastActivity,
  className,
  classTitle,
  email,
  role,
  mode,
  status,
}: UserInfoTableCardProps) => {
  const isUserOnline = isOnline(lastActivity);
  const activityTimestamp = formatActivityTimestamp(lastActivity);

  const progressData = {
    totalAccepted,
    totalRejected,
    totalInteractions,
    correctSuggestions,
    accuracyPercentage,
  };

  return (
    <Card
      className={`cursor-pointer hover:shadow-md hover:bg-muted hover:dark:bg-muted transition-shadow bg-white/40 dark:bg-black/40 pt-3 ${className || ""}`}
      onClick={onClick}
    >
      <CardContent>
        <div className="flex justify-between items-center">
          {/* Left Side */}
          <div className="flex-1 min-w-0 space-y-4">
            {/* Number and Name */}
            <div className="flex-1 min-w-0 space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-muted-foreground">
                  #{index + 1}
                </span>
                <span className="font-medium" title={name}>
                  {name}
                </span>
              </div>

              {/* Secondary info (class title or email) */}
              {(classTitle || email) && (
                <div className="font-medium truncate text-muted-foreground text-sm">
                  {classTitle || email}
                </div>
              )}
            </div>

            {/* Badges Row (Mode, Role, Status) */}
            <div className="flex gap-2 flex-wrap items-center">
              {mode && <ModeBadge mode={mode} />}
              {role && <RoleBadge role={role} />}
              {status && <StatusBadge status={status} />}
            </div>
          </div>

          {/* Right Side */}
          <div className="flex flex-col items-center gap-2 w-32 ">
            {/* Pie Chart */}
            <div className="flex flex-col items-center">
              {totalInteractions > 0 ? (
                <>
                  <MiniPieChart progressData={progressData} />
                </>
              ) : (
                <div className="text-center">
                  <MiniPieChart />
                </div>
              )}
            </div>

            {/* Online Status */}
            <div className="flex items-center gap-2 text-xs">
              <div
                className={`w-2 h-2 rounded-full ${
                  isUserOnline ? "bg-green-500" : "bg-gray-400"
                }`}
              />
              <span
                className={
                  isUserOnline
                    ? "text-green-600 font-medium"
                    : "text-muted-foreground"
                }
              >
                {activityTimestamp}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserInfoTableCard;
