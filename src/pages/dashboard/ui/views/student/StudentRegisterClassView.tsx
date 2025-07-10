import { registerUserToClass } from "@/api/classes";
import RegisterClassDialog from "@/components/RegisterClassDialog";
import { useUser } from "@/context/UserContext";
import { useAllClasses } from "@/hooks/useAllClasses";
import { useUserClasses } from "@/hooks/useUserClasses";
import ClassesTable from "../../components/ClassesTable";
import { BookOpen, Calendar, Flame } from "lucide-react";
import Loading from "@/components/Loading";
import { ClassData, StudentStatus, User } from "@/api/types/user";
import { useState } from "react";
import ClassDetails from "@/components/ClassDetails";

const StudentRegisterClassView = () => {
  const { userData } = useUser();

  const [selectedClass, setSelectedClass] = useState<{
    userClass: ClassData;
    studentStatus?: StudentStatus;
    instructorData?: User;
    studentCount?: number;
  } | null>(null);

  const { refetch: mutateUserClasses } = useUserClasses();
  const { classes, isLoading } = useAllClasses({
    userId: userData?.id,
  });

  if (isLoading) {
    return <Loading size="lg" />;
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

  const availableClasses =
    classes?.filter((cls) => !cls.enrollmentStatus) || [];

  const newClasses = availableClasses.filter(
    (cls) =>
      new Date(cls.createdAt).toDateString() === new Date().toDateString()
  );

  const hotClasses = classes.filter((cls) => cls.studentCount > 0);

  const renderNewClasses = () => {
    if (newClasses.length === 0) return null;

    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-blue-600" />
          <h2 className="text-xl font-semibold">New</h2>
        </div>
        <ClassesTable
          classes={newClasses}
          onClassSelect={handleClassSelect}
          title=""
          showActions={true}
          onRegister={registerUser}
        />
      </div>
    );
  };

  const renderHotClasses = () => {
    if (hotClasses.length === 0) return null;

    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Flame className="h-5 w-5 text-orange-600" />
          <h2 className="text-xl font-semibold">Trending</h2>
        </div>
        <ClassesTable
          classes={hotClasses}
          onClassSelect={handleClassSelect}
          title=""
          showActions={true}
          onRegister={registerUser}
        />
      </div>
    );
  };

  // Render all available classes section
  const renderAvailableClasses = () => {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-green-600" />
          <h2 className="text-xl font-semibold">All Available</h2>
        </div>

        {availableClasses.length > 0 ? (
          <ClassesTable
            classes={availableClasses}
            onClassSelect={handleClassSelect}
            title=""
            showActions={true}
            onRegister={registerUser}
          />
        ) : (
          <div className="text-center py-12 border rounded-md shadow-sm">
            <BookOpen className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
              No available classes
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              You're enrolled in all available classes or there are no classes
              to register for.
            </p>
          </div>
        )}
      </div>
    );
  };

  const renderEmptyState = () => {
    if (
      availableClasses.length > 0 ||
      newClasses.length > 0 ||
      hotClasses.length > 0
    ) {
      return null;
    }

    return (
      <div className="text-center py-16">
        <div className="space-y-4">
          <div className="text-6xl">🎓</div>
          <h2 className="text-2xl font-bold">All caught up!</h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            You're enrolled in all available classes. Check back later for new
            classes or ask your instructor to create more.
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Browse Classes</h1>
          <p className="text-muted-foreground">
            Discover and register for available classes
          </p>
        </div>
        <RegisterClassDialog />
      </div>

      {renderNewClasses()}
      {renderHotClasses()}
      {renderAvailableClasses()}
      {renderEmptyState()}

      {selectedClass && (
        <ClassDetails
          userClass={selectedClass.userClass}
          instructorData={selectedClass.instructorData as User}
          onClose={handleCloseDetails}
        />
      )}
    </div>
  );
};

export default StudentRegisterClassView;
