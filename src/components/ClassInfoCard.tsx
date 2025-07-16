import { useClassStudentsInfo } from "../hooks/useInstructorClasses";
import PingDot from "./PingDot";
import { ClassData } from "../types/user";
import { Card } from "./ui/card";
import { useNavigate } from "react-router-dom";

type ClassCardProps = {
  classInfo: ClassData;
  isInstructor?: boolean;
};

/**
 * ClassInfoCard component displays information about a class, including the instructor and enrolled students.
 * It allows instructors to manage student enrollment status.
 * @param {Object} props - The component props.
 * @param {UserClass | UserClassInfo} props.classInfo - The class object containing class details.
 * @param {boolean} [props.isInstructor=false] - Flag to indicate if the user is an instructor.
 */
export const ClassInfoCard = ({
  classInfo,
  isInstructor = false,
}: ClassCardProps) => {
  const navigate = useNavigate();
  const {
    classTitle,
    classDescription,
    classImageCover,
    classHexColor,
    instructorName,
    id,
  } = classInfo;

  const { waitlistedStudents } = useClassStudentsInfo(id as string);

  const handleCardClick = () => {
    navigate(`/classes/${id}`);
  };

  return (
    <div
      className="group hover:no-underline flex flex-1"
      onClick={handleCardClick}
    >
      <Card className="pt-0 rounded-xl overflow-hidden shadow-lg transition-all duration-300 ease-in-out hover:shadow-xl hover:scale-95 border border-border flex flex-col flex-1">
        <div className="relative h-36 w-full overflow-hidden">
          {isInstructor &&
            waitlistedStudents &&
            waitlistedStudents.length > 0 && <PingDot />}
          {classImageCover ? (
            <img
              src={classImageCover}
              alt={classTitle}
              className="object-cover w-full h-full"
            />
          ) : (
            <div
              className="h-full w-full flex items-center justify-center"
              style={{ backgroundColor: classHexColor || "#E5E7EB" }}
            />
          )}
          {!isInstructor && (
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-t from-black/50 dark:to-black/30 opacity-50 justify-between">
              {/* <StudentStatusBadge
                status={studentStatus as StudentStatus}
                size="sm"
                className="absolute bottom-6 left-6"
              /> */}
            </div>
          )}
        </div>
        <div className="p-6 flex flex-col flex-1">
          <h3 className="text-lg font-bold mb-2 line-clamp-2 min-h-[3.5rem] flex items-start">
            {classTitle}
          </h3>
          <p className="text-gray-500 mb-4 line-clamp-2 flex-1 text-sm">
            {classDescription || "No description available."}
          </p>
          <div className="space-y-4 mt-auto">
            {instructorName && (
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div
                    className="size-8 rounded-full flex items-center justify-center font-medium text-white shrink-0"
                    style={{
                      backgroundColor: classHexColor || "#E5E7EB",
                    }}
                  >
                    {instructorName.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm text-muted-foreground ml-3">
                    by {instructorName}
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
