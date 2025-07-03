import { useUserData } from "../hooks/useUserData";
import { Loader2 } from "lucide-react";
import StudentStatusBadge from "./StudentStatusBadge";
import { useClassStudentsInfo } from "../hooks/useInstructorClasses";
import PingDot from "./PingDot";
import {
  StudentStatus,
  ClassData,
  User,
  UserClassInfo,
} from "../api/types/user";
import { Card } from "./ui/card";

type ClassCardProps = {
  classInfo: ClassData | UserClassInfo;
  onSelect: (
    userClass: ClassData,
    studentStatus?: StudentStatus,
    instructorData?: User
  ) => void;
  isInstructor?: boolean;
};

/**
 * ClassInfoCard component displays information about a class, including the instructor and enrolled students.
 * It allows instructors to manage student enrollment status.
 * @param {Object} props - The component props.
 * @param {UserClass | UserClassInfo} props.classInfo - The class object containing class details.
 * @param {Function} props.onSelect - The function to call when a class is selected
 * @param {boolean} [props.isInstructor=false] - Flag to indicate if the user is an instructor.
 * @returns {JSX.Element} - A React component that displays class information and manages student enrollment.
 */
export const ClassInfoCard = ({
  classInfo,
  onSelect,
  isInstructor = false,
}: ClassCardProps) => {
  const isUserClassInfo = (
    info: ClassData | UserClassInfo
  ): info is UserClassInfo => {
    return (info as UserClassInfo).user_class !== undefined;
  };

  const userClass = isUserClassInfo(classInfo)
    ? classInfo.user_class
    : classInfo;

  const studentStatus = isUserClassInfo(classInfo)
    ? classInfo.student_status
    : undefined;

  const {
    instructor_id,
    class_title,
    class_description,
    class_image_cover,
    class_hex_color,
    id,
  } = userClass;

  const { userData: instructorData, loading: userDataLoading } =
    useUserData(instructor_id);
  const { waitlistedStudents } = useClassStudentsInfo(id as string);

  if (userDataLoading) {
    return (
      <div className="flex h-64 justify-center items-center">
        <Loader2 className="size-12 animate-spin" />
      </div>
    );
  }

  return (
    <div
      className="group hover:no-underline flex"
      onClick={() => {
        onSelect(userClass, studentStatus, instructorData!);
      }}
    >
      <Card className="pt-0 rounded-xl overflow-hidden shadow-lg transition-all duration-300 ease-in-out hover:shadow-xl hover:scale-95 border border-border flex flex-col flex-1">
        <div className="relative h-36 w-full overflow-hidden">
          {isInstructor &&
            waitlistedStudents &&
            waitlistedStudents.length > 0 && <PingDot />}
          {class_image_cover ? (
            <img
              src={class_image_cover}
              alt={class_title}
              className="object-cover w-full h-full"
            />
          ) : (
            <div
              className="h-full w-full flex items-center justify-center"
              style={{ backgroundColor: class_hex_color || "#E5E7EB" }}
            />
          )}
          {!isInstructor && (
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-t from-black/50 dark:to-black/30 opacity-50 justify-between">
              <StudentStatusBadge
                status={studentStatus as StudentStatus}
                size="sm"
                className="absolute bottom-6 left-6"
              />
            </div>
          )}
        </div>
        <div className="p-6 flex flex-col flex-1">
          <h3 className="text-lg font-bold mb-2">{class_title}</h3>
          <p className="text-gray-500 mb-4 line-clamp-2 flex-1 text-sm">
            {class_description || "No description available."}
          </p>
          <div className="space-y-4 mt-auto">
            {instructorData && (
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  {instructorData?.avatar_url ? (
                    <div className="size-8 rounded-full overflow-hidden border-white dark:border-slate-700">
                      <img
                        src={instructorData.avatar_url ?? ""}
                        alt={`${instructorData.first_name} ${instructorData.last_name}`}
                        className="w-full h-full rounded-full object-cover"
                      />
                    </div>
                  ) : (
                    <div
                      className="size-8 rounded-full flex items-center justify-center font-medium text-white shrink-0"
                      style={{
                        backgroundColor: class_hex_color || "#E5E7EB",
                      }}
                    >
                      {instructorData.first_name?.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="text-sm text-muted-foreground ml-3">
                    by {instructorData.first_name} {instructorData.last_name}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ClassInfoCard;
