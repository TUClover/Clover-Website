import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ClassData, EnrollmentStatus } from "@/api/types/user";
import { Button } from "@/components/ui/button";
import {
  FileChartColumn,
  FileSymlink,
  LogOut,
  MoreHorizontal,
  Trash2,
  UserPlus,
  X,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";
import EnrollmentBadge from "@/components/EnrollmentBadge";
import { useUser } from "@/context/UserContext";
import { ClassActionDialog } from "@/components/ClassActionDialog";
import { useClassActionDialog } from "@/hooks/useClassActionDialog";
import { useQueryClient } from "@tanstack/react-query";

interface ClassesTableProps {
  classes: ClassData[];
  showStatus?: boolean;
  showActions?: boolean;
  onRefresh?: () => void;
}

const ClassesTable = ({
  classes,
  showStatus = false,
  showActions = false,
  onRefresh,
}: ClassesTableProps) => {
  const navigate = useNavigate();
  const { userData } = useUser();

  const queryClient = useQueryClient();

  const classActionDialog = useClassActionDialog({
    onSuccess: () => {
      onRefresh?.();

      if (userData?.id) {
        queryClient.invalidateQueries({
          queryKey: ["userClasses", userData.id],
        });

        queryClient.invalidateQueries({
          queryKey: ["allClasses", { userId: userData.id }],
        });
      }
    },
  });

  if (classes.length === 0) {
    return null;
  }

  const handleRowClick = (classData: ClassData, event: React.MouseEvent) => {
    if ((event.target as HTMLElement).closest('button, [role="button"]')) {
      return;
    }

    if (classData.id) {
      navigate(`/classes/${classData.id}`);
    }
  };

  const handleViewDetails = (classData: ClassData, event: React.MouseEvent) => {
    event.stopPropagation();
    if (classData.id) {
      navigate(`/classes/${classData.id}`);
    }
  };

  const handleGoToCourse = (classData: ClassData, event: React.MouseEvent) => {
    event.stopPropagation();
    navigate("/dashboard", {
      state: {
        preselectedClassId: classData.id,
        classTitle: classData.classTitle,
        classCode: classData.classCode,
      },
    });
  };

  const handleClassAction = (
    classData: ClassData,
    action: "join" | "leave" | "cancel" | "remove",
    event: React.MouseEvent
  ) => {
    event.stopPropagation();

    if (!classData.id || !userData?.id) return;

    classActionDialog.openDialog({
      classId: classData.id,
      userId: userData.id,
      classTitle: classData.classTitle,
      action: action,
    });
  };

  const getActionButton = (classData: ClassData) => {
    const enrollmentStatus = classData.enrollmentStatus;

    if (!enrollmentStatus) {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={(e) => handleViewDetails(classData, e)}>
              <FileSymlink className="mr-2 h-4 w-4" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={(e) => handleClassAction(classData, "join", e)}
              className="text-primary focus:text-primary"
            >
              <UserPlus className="mr-2 h-4 w-4" />
              Join Class
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    }

    if (enrollmentStatus) {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={(e) => handleViewDetails(classData, e)}>
              <FileSymlink className="mr-2 h-4 w-4" />
              View Details
            </DropdownMenuItem>

            {enrollmentStatus === "ENROLLED" && (
              <DropdownMenuItem onClick={(e) => handleGoToCourse(classData, e)}>
                <FileChartColumn className="mr-2 h-4 w-4" />
                Go to Course
              </DropdownMenuItem>
            )}

            {enrollmentStatus === "ENROLLED" && (
              <DropdownMenuItem
                onClick={(e) => handleClassAction(classData, "leave", e)}
                className="text-red-600 focus:text-red-600"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Leave Class
              </DropdownMenuItem>
            )}

            {enrollmentStatus === "WAITLISTED" && (
              <DropdownMenuItem
                onClick={(e) => handleClassAction(classData, "cancel", e)}
                className="text-red-600 focus:text-red-600"
              >
                <X className="mr-2 h-4 w-4" />
                Cancel Application
              </DropdownMenuItem>
            )}

            {enrollmentStatus === "REJECTED" && (
              <DropdownMenuItem
                onClick={(e) => handleClassAction(classData, "remove", e)}
                className="text-red-600 focus:text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Remove from List
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    }

    return <span className="text-xs text-muted-foreground">-</span>;
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
      <div className="width-container mb-6">
        <div className="border rounded-md shadow-sm">
          <Table className="table-fixed">
            <TableHeader className="bg-sidebar dark:bg-[#262626]">
              <TableRow className="font-semibold">
                <TableHead className="w-[25%]">Title</TableHead>
                <TableHead className="w-[12%]">Code</TableHead>
                <TableHead className="w-[20%]">Instructor</TableHead>
                <TableHead className="w-[10%] text-center">Students</TableHead>
                {showStatus && (
                  <TableHead className="w-[15%] text-center">Status</TableHead>
                )}
                {showActions && (
                  <TableHead className="w-[15%] text-center">Actions</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {classes.map((classData, index) => {
                const studentCount = classData.studentCount || 0;
                const enrollmentStatus = classData.enrollmentStatus;

                return (
                  <TableRow
                    key={classData.id || index}
                    className="hover:bg-muted cursor-pointer transition-colors duration-200"
                    onClick={(e) => handleRowClick(classData, e)}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div
                          className="w-2 h-8 rounded-md flex-shrink-0"
                          style={{
                            backgroundColor:
                              classData.classHexColor || "#e5e7eb",
                          }}
                        />
                        <div className="font-medium line-clamp-2">
                          {classData.classTitle}
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>{classData.classCode}</TableCell>

                    <TableCell>
                      {classData.instructorName ||
                        classData.instructorId?.substring(0, 8) + "..."}
                    </TableCell>

                    <TableCell className="text-center">
                      <div className="flex items-center justify-center">
                        <span className="font-medium">{studentCount}</span>
                        {studentCount > 5 && (
                          <Badge variant="secondary" className="ml-1 px-1">
                            🔥
                          </Badge>
                        )}
                      </div>
                    </TableCell>

                    {showStatus && (
                      <TableCell className="text-center">
                        <EnrollmentBadge
                          status={enrollmentStatus as EnrollmentStatus}
                        />
                      </TableCell>
                    )}

                    {showActions && (
                      <TableCell className="text-center">
                        {getActionButton(classData)}
                      </TableCell>
                    )}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    </>
  );
};

export default ClassesTable;
