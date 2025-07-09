import InfoTooltip from "@/components/InfoTooltip";
import Loading from "@/components/Loading";
import NoData from "@/components/NoData";
import StudentDataTable from "@/components/StudentDataTable";
import { Card } from "@/components/ui/card";
import { useUser } from "@/context/UserContext";
import { useClassActivity } from "@/hooks/useClassActivity";
import { useInstructorClasses } from "@/hooks/useInstructorClasses";

const InstructorStudentListView = () => {
  const { userData } = useUser();
  const { classes, selectedClassId } = useInstructorClasses(userData?.id);

  const { allActivity, progressData, loading } = useClassActivity(
    userData?.id as string,
    selectedClassId,
    userData?.settings.mode
  );

  const selectedClassTitle =
    classes.find((classItem) => classItem.id === selectedClassId)?.classTitle ??
    "";

  if (loading) {
    return (
      <div className="flex min-h-screen justify-center items-center">
        <Loading size="lg" showText={false} />
      </div>
    );
  }

  if (progressData.totalInteractions === 0) {
    return <NoData role="instructor" />;
  }

  return (
    <>
      <Card className="p-6 mt-8">
        <div className="flex items-center mb-2 gap-3">
          <h2 className="text-md font-semibold text-primary">
            Insights About Students
          </h2>
          <InfoTooltip>
            <div className="text-sm space-y-2">
              <p>
                The table shows insights from{" "}
                <span className="text-primary font-semibold">
                  {selectedClassTitle}
                </span>
                , summarizing student decisions on code suggestions and their
                accuracy.
              </p>
              <p className="text-xs text-muted-foreground">
                Click on any row to view student-specific suggestions and
                performance details.
              </p>
            </div>
          </InfoTooltip>
        </div>
        <StudentDataTable
          logs={allActivity}
          classFilter={selectedClassTitle === "all classes" ? "all" : "class"}
        />
      </Card>
    </>
  );
};

export default InstructorStudentListView;
