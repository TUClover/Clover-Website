import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ClassData } from "@/api/types/user";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, UserPlus } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ClassesTableProps {
  classes: ClassData[];
  onClassSelect: (classData: ClassData) => void;
  title: string;
  showStatus?: boolean;
  showActions?: boolean;
  onRegister?: (classId: string) => void;
}

const ClassesTable = ({
  classes,
  onClassSelect,
  title,
  showStatus = false,
  showActions = false,
  onRegister,
}: ClassesTableProps) => {
  console.log("ClassesTable rendered", JSON.stringify(classes, null, 2));

  if (classes.length === 0) {
    return null;
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ENROLLED":
        return (
          <Badge variant="default" className="justify-center">
            Enrolled
          </Badge>
        );
      case "WAITLISTED":
        return (
          <Badge variant="secondary" className="justify-center">
            Waitlisted
          </Badge>
        );
      case "COMPLETED":
        return (
          <Badge variant="outline" className="justify-center">
            Completed
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className="justify-center">
            {status}
          </Badge>
        );
    }
  };

  const handleRowClick = (classData: ClassData, event: React.MouseEvent) => {
    if ((event.target as HTMLElement).closest('button, [role="button"]')) {
      return;
    }
    onClassSelect(classData);
  };

  const canRegister = (classData: ClassData) => {
    return !classData.enrollmentStatus && onRegister;
  };

  return (
    <div className="width-container mb-6">
      <h2 className="text-xl font-semibold mb-4">{title}</h2>
      <div className="border rounded-md shadow-sm">
        <Table className="table-fixed">
          <TableHeader className="bg-[#f5f5f5] dark:bg-[#262626]">
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
                          backgroundColor: classData.classHexColor || "#e5e7eb",
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
                      {enrollmentStatus ? (
                        getStatusBadge(enrollmentStatus)
                      ) : (
                        <Badge variant="outline" className="justify-center">
                          Available
                        </Badge>
                      )}
                    </TableCell>
                  )}

                  {showActions && (
                    <TableCell className="text-center">
                      {canRegister(classData) ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            onRegister!(classData.id || "");
                          }}
                          className="h-8 px-2"
                        >
                          <UserPlus className="h-3 w-3 mr-1" />
                          Join
                        </Button>
                      ) : enrollmentStatus ? (
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
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                onClassSelect(classData);
                              }}
                            >
                              Details
                            </DropdownMenuItem>
                            {enrollmentStatus === "WAITLISTED" && (
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                }}
                              >
                                Leave
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      ) : (
                        <span className="text-xs text-muted-foreground">-</span>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default ClassesTable;
