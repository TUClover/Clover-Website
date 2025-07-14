import { useState } from "react";
import { useUserClasses } from "@/hooks/useUserClasses";
import {
  ClassData,
  EnrollmentStatus,
  StudentStatus,
  User,
} from "@/api/types/user";
import ClassDetails from "@/pages/ClassDetailsView";
import NoClasses from "@/components/NoClasses";
import ClassesCarousel from "../../components/ClassesCarousel";
import Loading from "@/components/Loading";
import { useUser } from "@/context/UserContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Grid, List } from "lucide-react";
import ClassesTable from "../../components/ClassesTable";

const StudentClassesView = ({ description }: { description?: string }) => {
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

  const renderCarouselView = () => (
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
    </>
  );

  const renderTableView = () => (
    <>
      {classGroups.map(({ status, title }) => {
        const filteredClasses = allClasses.filter(
          (c) => c.enrollmentStatus === status
        );

        if (filteredClasses.length === 0) return null;

        return (
          <ClassesTable
            key={status}
            classes={filteredClasses}
            onClassSelect={handleClassSelect}
            title={title}
            showStatus
            showActions
          />
        );
      })}
    </>
  );

  return (
    <>
      <Tabs defaultValue="carousel" className="w-full">
        <div className="flex justify-between gap-6 items-center mb-6">
          <p className="text-sm text-muted-foreground hidden md:block">
            {description}
          </p>
          <TabsList className="grid w-full md:w-[200px] grid-cols-2">
            <TabsTrigger value="carousel" className="flex items-center gap-2">
              <Grid className="h-4 w-4" />
            </TabsTrigger>
            <TabsTrigger value="table" className="flex items-center gap-2">
              <List className="h-4 w-4" />
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="carousel" className="w-full">
          {renderCarouselView()}
        </TabsContent>

        <TabsContent value="table" className="w-full">
          {renderTableView()}
        </TabsContent>
      </Tabs>

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

export default StudentClassesView;
