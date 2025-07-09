import { useState } from "react";
import { useUserClasses } from "@/hooks/useUserClasses";
import { ClassData, StudentStatus, User } from "@/api/types/user";
import ClassDetails from "@/components/ClassDetails";
import NoClasses from "@/components/NoClasses";
import ClassesCarousel from "../../components/ClassesCarousel";
import Loading from "@/components/Loading";

export const UserClassesView = () => {
  const { originalClasses, loading: userClassLoading } = useUserClasses();
  const [selectedClass, setSelectedClass] = useState<{
    userClass: ClassData;
    studentStatus?: StudentStatus;
    instructorData?: User;
    studentCount?: number;
  } | null>(null);

  if (userClassLoading) {
    return (
      <div className="flex min-h-screen justify-center items-center">
        <Loading size="lg" showText={false} />
      </div>
    );
  }

  const handleClassSelect = (
    userClass: ClassData,
    studentStatus?: StudentStatus,
    instructorData?: User,
    studentCount?: number
  ) => {
    setSelectedClass({
      userClass,
      studentStatus,
      instructorData,
      studentCount,
    });
  };

  const handleCloseDetails = () => {
    setSelectedClass(null);
  };

  if (originalClasses.length === 0) {
    return <NoClasses role="student" />;
  }

  const hasEnrolledClasses = originalClasses.some(
    (c) => c.enrollment_status === "ENROLLED"
  );

  const hasWaitlistedClasses = originalClasses.some(
    (c) => c.enrollment_status === "WAITLISTED"
  );

  const hasCompletedClasses = originalClasses.some(
    (c) => c.enrollment_status === "COMPLETED"
  );

  return (
    <>
      {hasEnrolledClasses && (
        <ClassesCarousel
          classes={originalClasses.filter(
            (c) => c.enrollment_status === "ENROLLED"
          )}
          onClassSelect={handleClassSelect}
          title="Enrolled Classes"
        />
      )}

      {hasWaitlistedClasses && (
        <ClassesCarousel
          classes={originalClasses.filter(
            (c) => c.enrollment_status === "WAITLISTED"
          )}
          onClassSelect={handleClassSelect}
          title="Waitlisted Classes"
        />
      )}

      {hasCompletedClasses && (
        <ClassesCarousel
          classes={originalClasses.filter(
            (c) => c.enrollment_status === "COMPLETED"
          )}
          onClassSelect={handleClassSelect}
          title="Completed Classes"
        />
      )}

      {selectedClass && (
        <ClassDetails
          userClass={selectedClass.userClass}
          instructorData={selectedClass.instructorData as User}
          onClose={handleCloseDetails}
        />
      )}
    </>
  );
};

export default UserClassesView;
