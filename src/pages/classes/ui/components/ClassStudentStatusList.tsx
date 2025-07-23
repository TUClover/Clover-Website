import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import UserInfoItem from "@/components/UserInfoItem";
import { User } from "@/types/user";
import {
  CheckCircle,
  MoreHorizontal,
  Trash2,
  UserCheck,
  UserX,
} from "lucide-react";
import React from "react";
import { useClassActionDialog } from "../../hooks/useClassActionDialog";
import ClassActionDialog, { actionType } from "./ClassActionDialog";
import { useQueryClient } from "@tanstack/react-query";

interface ClassStudentStatusListProps {
  users: User[];
  classHexColor?: string;
  isInstructor: boolean;
  classId: string;
  classTitle: string;
}

type StudentActionType = "accept" | "reject" | "complete" | "remove";

const ClassStudentStatusList = ({
  users,
  classHexColor,
  isInstructor,
  classId,
  classTitle,
}: ClassStudentStatusListProps) => {
  if (users.length === 0) return null;

  const filteredUsers = isInstructor
    ? users
    : users.filter((user) => user.enrollmentStatus === "ENROLLED");

  if (filteredUsers.length === 0) return null;

  // Group users by enrollment status
  const groupedUsers = filteredUsers.reduce(
    (acc: Record<string, User[]>, user) => {
      const status = user.enrollmentStatus || "UNKNOWN";
      const statusKey = String(status);
      if (!acc[statusKey]) {
        acc[statusKey] = [];
      }
      acc[statusKey].push(user);
      return acc;
    },
    {}
  );

  // Status configuration
  const statusConfig: Record<
    string,
    { label: string; color: string; borderColor: string }
  > = {
    ENROLLED: {
      label: "Enrolled Students",
      color:
        "bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300",
      borderColor: "border-green-200 dark:border-green-800",
    },
    WAITLISTED: {
      label: "Waitlisted Students",
      color:
        "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300",
      borderColor: "border-yellow-200 dark:border-yellow-800",
    },
    COMPLETED: {
      label: "Completed Students",
      color: "bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300",
      borderColor: "border-blue-200 dark:border-blue-800",
    },
    REJECTED: {
      label: "Rejected Students",
      color: "bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300",
      borderColor: "border-red-200 dark:border-red-800",
    },
  };

  const statusOrder = ["ENROLLED", "WAITLISTED", "COMPLETED", "REJECTED"];

  const queryClient = useQueryClient();

  const classActionDialog = useClassActionDialog({
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["class"],
      });
    },
  });

  const handleStudentAction = (action: actionType, userId: string) => {
    classActionDialog.openDialog({
      classId,
      userId,
      classTitle,
      action: action,
      isInstructor: true,
    });
  };

  return (
    <>
      <ClassActionDialog
        isOpen={classActionDialog.isOpen}
        isLoading={classActionDialog.isLoading}
        classInfo={classActionDialog.classInfo}
        onClose={classActionDialog.closeDialog}
        onConfirm={classActionDialog.handleConfirm}
      />

      <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-sm">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          {isInstructor
            ? `Students (${filteredUsers.length})`
            : `Enrolled Students (${filteredUsers.length})`}
        </h2>

        <div className="space-y-6">
          {isInstructor ? (
            statusOrder.map((status) => {
              const usersInStatus = groupedUsers[status];
              if (!usersInStatus || usersInStatus.length === 0) return null;

              const config = statusConfig[status] || {
                label: status,
                color:
                  "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300",
                borderColor: "border-gray-200 dark:border-gray-600",
              };

              return (
                <div
                  key={status}
                  className={`border-l-4 ${config.borderColor} pl-4`}
                >
                  <div className="flex items-center gap-2 mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {config.label}
                    </h3>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}
                    >
                      {usersInStatus.length}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {usersInStatus.map((user, index) => (
                      <ClassStudentStatusItem
                        key={user.id || index}
                        user={user}
                        classHexColor={classHexColor}
                        isInstructor={isInstructor}
                        onAction={handleStudentAction}
                      />
                    ))}

                    {usersInStatus.length > 9 && (
                      <div className="flex items-center justify-center p-3 rounded-lg bg-gray-50 dark:bg-gray-700 border-2 border-dashed border-gray-300 dark:border-gray-600">
                        <span className="text-gray-500 dark:text-gray-400 font-medium">
                          +{usersInStatus.length - 9} more
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredUsers.map((user, index) => (
                <ClassStudentStatusItem
                  key={user.id || index}
                  user={user}
                  classHexColor={classHexColor}
                  isInstructor={isInstructor}
                  onAction={handleStudentAction}
                />
              ))}
              {filteredUsers.length > 9 && (
                <div className="flex items-center justify-center p-3 rounded-lg bg-gray-50 dark:bg-gray-700 border-2 border-dashed border-gray-300 dark:border-gray-600">
                  <span className="text-gray-500 dark:text-gray-400 font-medium">
                    +{filteredUsers.length - 9} more
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ClassStudentStatusList;

interface Props {
  user: User;
  classHexColor?: string;
  isInstructor: boolean;
  onAction: (
    action: StudentActionType,
    userId: string,
    studentName: string
  ) => void;
}

const ClassStudentStatusItem = ({
  user,
  classHexColor,
  isInstructor,
  onAction,
}: Props) => {
  const handleAction = (action: StudentActionType, event: React.MouseEvent) => {
    event.stopPropagation();
    const studentName = `${user.firstName} ${user.lastName}`.trim();
    onAction(action, user.id, studentName);
  };

  const getDropdownItems = () => {
    const status = user.enrollmentStatus;

    switch (status) {
      case "ENROLLED":
        return (
          <>
            <DropdownMenuItem
              onClick={(e) => handleAction("complete", e)}
              className="text-blue-600 focus:text-blue-600"
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Mark as Complete
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={(e) => handleAction("remove", e)}
              className="text-red-600 focus:text-red-600"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Remove Student
            </DropdownMenuItem>
          </>
        );

      case "WAITLISTED":
        return (
          <>
            <DropdownMenuItem
              onClick={(e) => handleAction("accept", e)}
              className="text-green-600 focus:text-green-600"
            >
              <UserCheck className="mr-2 h-4 w-4" />
              Accept Student
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={(e) => handleAction("reject", e)}
              className="text-red-600 focus:text-red-600"
            >
              <UserX className="mr-2 h-4 w-4" />
              Reject Student
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={(e) => handleAction("remove", e)}
              className="text-red-600 focus:text-red-600"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Remove from List
            </DropdownMenuItem>
          </>
        );

      case "COMPLETED":
      case "REJECTED":
        return (
          <DropdownMenuItem
            onClick={(e) => handleAction("remove", e)}
            className="text-red-600 focus:text-red-600"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Remove from List
          </DropdownMenuItem>
        );

      default:
        return (
          <DropdownMenuItem
            onClick={(e) => handleAction("remove", e)}
            className="text-red-600 focus:text-red-600"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Remove Student
          </DropdownMenuItem>
        );
    }
  };

  return (
    <div className="relative group">
      <UserInfoItem
        firstName={user.firstName}
        lastName={user.lastName}
        email={user.email}
        avatarUrl={user.avatarUrl}
        hexColor={classHexColor}
        className="flex items-center gap-3 px-3 py-2 bg-slate-50 dark:bg-gray-700 rounded-lg shadow-sm hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
      />

      {/* Status indicator dot */}
      <div
        className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-white dark:border-gray-800 ${
          user.enrollmentStatus === "ENROLLED"
            ? "bg-green-500"
            : user.enrollmentStatus === "WAITLISTED"
              ? "bg-yellow-500"
              : user.enrollmentStatus === "COMPLETED"
                ? "bg-blue-500"
                : user.enrollmentStatus === "REJECTED"
                  ? "bg-red-500"
                  : "bg-gray-500"
        }`}
      />

      {/* Instructor dropdown menu */}
      {isInstructor && (
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:bg-white dark:hover:bg-gray-800"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="h-3 w-3" />
                <span className="sr-only">Student actions</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {getDropdownItems()}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </div>
  );
};
