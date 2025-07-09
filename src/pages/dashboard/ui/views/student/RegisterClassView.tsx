import { registerUserToClass } from "@/api/classes";
import RegisterClassDialog from "@/components/RegisterClassDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useUser } from "@/context/UserContext";
import { useAllClasses } from "@/hooks/useAllClasses";
import { useUserClasses } from "@/hooks/useUserClasses";
import { MoreHorizontal } from "lucide-react";
import { useMemo } from "react";

const RegisterClassView = () => {
  const { userData } = useUser();

  const {
    classes: userClasses,
    loading,
    mutate: mutateUserClasses,
  } = useUserClasses();
  const { classes, isLoading } = useAllClasses();

  const userClassMap = useMemo(() => {
    if (!userClasses) return new Map();
    return userClasses.reduce((acc, userClass) => {
      // Use the unique identifier for the class from your userClasses data
      acc.set(userClass.userClass.id, userClass);
      return acc;
    }, new Map());
  }, [userClasses]);

  const registerUser = async (classId: string) => {
    if (!userData || !userData.id) {
      console.error("User data is not available for registration.");
      return;
    }
    const { error } = await registerUserToClass(userData.id, classId);
    if (error) {
      console.error("Error registering user to class:", error);
      return;
    }
    mutateUserClasses();
  };

  return (
    <div className="w-full">
      <div className="py-6 flex justify-start">
        <RegisterClassDialog />
      </div>
      <div className="border rounded-md shadow-sm">
        <Table>
          <TableHeader className="bg-[#f5f5f5] dark:bg-[#262626]">
            <TableRow>
              <TableHead className="w-[30%]">Class</TableHead>
              <TableHead>Instructor</TableHead>
              <TableHead className="text-right">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading || loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={`loading-${i}`}>
                  <TableCell colSpan={3}>
                    <Skeleton className="h-6 w-full" />
                  </TableCell>
                </TableRow>
              ))
            ) : classes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="h-24 text-center">
                  No classes found.
                </TableCell>
              </TableRow>
            ) : (
              classes.map((allClass) => {
                const userEnrollment = userClassMap.get(allClass.id);
                return (
                  <TableRow key={allClass.id}>
                    <TableCell>
                      <div className="flex items-center gap-4">
                        {allClass.classImageCover ? (
                          <img
                            src={allClass.classImageCover}
                            alt="Class cover"
                            className="w-12 h-12 rounded-md object-cover"
                          />
                        ) : (
                          <div
                            className="w-12 h-12 rounded-md"
                            style={{
                              backgroundColor: allClass.classHexColor,
                            }}
                          />
                        )}
                        <div>
                          <div className="font-medium">
                            {allClass.classTitle}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {allClass.classCode}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {allClass.instructorId?.substring(0, 8)}...
                    </TableCell>
                    <TableCell className="text-right">
                      {userEnrollment ? (
                        <Badge variant="secondary">Enrolled</Badge>
                      ) : (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              aria-haspopup="true"
                              size="icon"
                              variant="ghost"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Toggle menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem
                              onSelect={() => registerUser(allClass.id || "")}
                            >
                              Register
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default RegisterClassView;
