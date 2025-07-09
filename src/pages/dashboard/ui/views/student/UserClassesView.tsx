import { useState } from "react";
import { useUserClasses } from "@/hooks/useUserClasses";
import {
  ClassData,
  EnrollmentStatus,
  StudentStatus,
  User,
} from "@/api/types/user";
import ClassDetails from "@/components/ClassDetails";
import NoClasses from "@/components/NoClasses";
import ClassesCarousel from "../../components/ClassesCarousel";
import Loading from "@/components/Loading";
import { useUser } from "@/context/UserContext";

export const UserClassesView = () => {
  const { userData } = useUser();
  const { allClasses, loading: userClassLoading } = useUserClasses(
    userData?.id
  );
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

  if (allClasses.length === 0) {
    return <NoClasses role="student" />;
  }

  const classGroups = [
    {
      status: EnrollmentStatus.ENROLLED,
      title: "Enrolled Classes",
    },
    {
      status: EnrollmentStatus.WAITLISTED,
      title: "Waitlisted Classes",
    },
    {
      status: EnrollmentStatus.COMPLETED,
      title: "Completed Classes",
    },
  ];

  return (
    <>
      {classGroups.map(({ status, title }) => {
        const filteredClasses = allClasses.filter(
          (c) => c.enrollmentStatus === status
        );

        if (filteredClasses.length === 0) return null;

        return (
          <ClassesCarousel
            key={status}
            classes={filteredClasses}
            onClassSelect={handleClassSelect}
            title={title}
          />
        );
      })}

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
