import StudentDataTable from "@/pages/dashboard/ui/components/StudentDataTable";
import { Card } from "@/components/ui/card";
import { useUser } from "@/context/UserContext";

const InstructorStudentListView = () => {
  const { userData } = useUser();

  return (
    <Card className="p-6 mt-8">
      <div className="flex items-center mb-2 gap-3">
        <h2 className="text-md font-semibold text-primary">
          Insights About Students
        </h2>
      </div>
      <StudentDataTable instructorId={userData?.id as string} />
    </Card>
  );
};

export default InstructorStudentListView;
