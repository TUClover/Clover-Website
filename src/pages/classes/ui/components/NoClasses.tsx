import RegisterClassDialog from "@/pages/classes/ui/components/RegisterClassDialog";
import CreateNewClassButton from "@/pages/classes/ui/components/CreateNewClassButton";

interface NoClassesProps {
  role: "student" | "instructor";
}

const NoClasses = ({ role }: NoClassesProps) => {
  return (
    <div className="flex flex-col items-center justify-center gap-2 p-16 text-center">
      {role === "instructor" ? (
        <>
          <p className="text-lg font-medium">No classes yet</p>
          <p className="text-muted-foreground mb-4">
            Click "+ Add New Class" to get started.
          </p>
          <CreateNewClassButton />
        </>
      ) : (
        <>
          <p className="text-lg font-medium">No classes yet</p>
          <p className="text-muted-foreground mb-4">
            Click "+ Register" to join a class.
          </p>
          <RegisterClassDialog />
        </>
      )}
    </div>
  );
};

export default NoClasses;
