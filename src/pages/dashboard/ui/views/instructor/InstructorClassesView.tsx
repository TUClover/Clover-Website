import ClassInfoCard from "@/pages/classes/ui/components/ClassInfoCard";
import Loading from "@/components/Loading";
import NoClasses from "@/pages/classes/ui/components/NoClasses";
import { useUser } from "@/context/UserContext";
import { useInstructorClasses } from "@/hooks/useInstructorClasses";
import ClassesTable from "@/pages/dashboard/ui/components/ClassesTable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Grid, List } from "lucide-react";
import CreateNewClassButton from "@/pages/classes/ui/components/CreateNewClassButton";

export const InstructorClassesView = ({
  description,
}: {
  description?: string;
}) => {
  const { userData } = useUser();
  const { allClasses, loading: userClassLoading } = useInstructorClasses(
    userData?.id
  );

  if (userClassLoading) {
    return (
      <div className="flex min-h-screen justify-center items-center">
        <Loading size="lg" showText={false} />
      </div>
    );
  }

  if (allClasses.length === 0) {
    return <NoClasses role="instructor" />;
  }

  const renderGridView = () => (
    <div className="space-y-6">
      <div className="flex justify-start items-center">
        <CreateNewClassButton />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {allClasses.map((userClass, index) => (
          <div key={index} className="flex">
            <ClassInfoCard classInfo={userClass} />
          </div>
        ))}
      </div>
    </div>
  );

  const renderTableView = () => (
    <div className="space-y-6">
      <div className="flex justify-start items-center">
        <CreateNewClassButton />
      </div>

      <ClassesTable classes={allClasses} showInstructor={false} showActions />
    </div>
  );

  return (
    <>
      <Tabs defaultValue="grid" className="w-full">
        <div className="flex justify-between gap-6 items-center mb-6">
          <p className="text-sm text-muted-foreground hidden md:block">
            {description}
          </p>
          <TabsList className="grid w-full md:w-[200px] grid-cols-2 bg-sidebar">
            <TabsTrigger value="grid" className="flex items-center gap-2">
              <Grid className="h-4 w-4" />
            </TabsTrigger>
            <TabsTrigger value="table" className="flex items-center gap-2">
              <List className="h-4 w-4" />
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="grid" className="w-full">
          {renderGridView()}
        </TabsContent>

        <TabsContent value="table" className="w-full">
          {renderTableView()}
        </TabsContent>
      </Tabs>
    </>
  );
};

export default InstructorClassesView;
