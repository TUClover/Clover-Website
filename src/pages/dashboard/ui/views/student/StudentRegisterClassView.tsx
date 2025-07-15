import RegisterClassDialog from "@/components/RegisterClassDialog";
import { useUser } from "@/context/UserContext";
import { useAllClasses } from "@/hooks/useAllClasses";
import ClassesTable from "../../components/ClassesTable";
import { BookOpen, Calendar, Flame } from "lucide-react";
import Loading from "@/components/Loading";

interface StudentRegisterClassViewProps {
  description?: string;
}

const StudentRegisterClassView = ({
  description,
}: StudentRegisterClassViewProps) => {
  const { userData } = useUser();

  const {
    classes,
    isLoading,
    refetch: onRefresh,
  } = useAllClasses({
    userId: userData?.id,
  });

  if (isLoading) {
    return <Loading size="lg" />;
  }

  const availableClasses =
    classes?.filter((cls) => !cls.enrollmentStatus) || [];

  const newClasses = availableClasses.filter(
    (cls) =>
      new Date(cls.createdAt!).toDateString() === new Date().toDateString()
  );

  const hotClasses = classes.filter((cls) => cls.studentCount! > 0);

  const renderNewClasses = () => {
    if (newClasses.length === 0) return null;

    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Calendar className="size-6 text-blue-600" />
          <h2 className="text-xl font-semibold">New</h2>
        </div>
        <ClassesTable
          classes={newClasses}
          showActions={true}
          onRefresh={onRefresh}
        />
      </div>
    );
  };

  const renderHotClasses = () => {
    if (hotClasses.length === 0) return null;

    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Flame className="size-6 text-orange-600" />
          <h2 className="text-xl font-semibold">Trending</h2>
        </div>
        <ClassesTable
          classes={hotClasses}
          showActions={true}
          onRefresh={onRefresh}
        />
      </div>
    );
  };

  const renderAvailableClasses = () => {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <BookOpen className="size-6 text-green-600" />
          <h2 className="text-xl font-semibold">All Available</h2>
        </div>

        {availableClasses.length > 0 ? (
          <ClassesTable
            classes={availableClasses}
            showActions={true}
            onRefresh={onRefresh}
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
    <div className="w-full">
      <div className="flex justify-end md:justify-between items-center gap-6 mb-6">
        <p className="text-sm text-muted-foreground hidden md:block">
          {description}
        </p>
        <RegisterClassDialog />
      </div>

      <div className="space-y-8">
        {renderNewClasses()}
        {renderHotClasses()}
        {renderAvailableClasses()}
        {renderEmptyState()}
      </div>
    </div>
  );
};

export default StudentRegisterClassView;
