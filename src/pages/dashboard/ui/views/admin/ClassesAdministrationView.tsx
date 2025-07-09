import { ClassData } from "@/api/types/user";
import ClassDetailsPanel from "@/components/ClassDetailsPanel";
import ClassSideBar from "@/components/ClassSideBar";
import { useAllClasses } from "@/hooks/useAllClasses";
import { useAllUsers } from "@/hooks/useAllUsers";
import { useState } from "react";
import { toast } from "sonner";

const ClassesAdministrationView = () => {
  const [selectedClasses, setSelectedClasses] = useState<ClassData[]>([]);
  const { classes: allClasses, isLoading: isLoadingClasses } = useAllClasses();
  const { users, error } = useAllUsers();

  if (error) {
    toast.error("Error fetching users. Please try again later.");
    return null;
  }

  return (
    <div className="flex flex-col md:flex-row gap-6 mb-6">
      <ClassSideBar
        classes={allClasses}
        selectedClasses={selectedClasses}
        onSelectClass={(classData) => {
          setSelectedClasses([classData]);
        }}
        onSetSelectedClasses={setSelectedClasses}
        loading={isLoadingClasses}
        setSelectedClassId={(id) => {
          const selected = allClasses.find((cls) => cls.id === id);
          if (selected) {
            setSelectedClasses([selected]);
          }
        }}
      />
      <ClassDetailsPanel
        users={users}
        classDetails={selectedClasses}
        isLoading={isLoadingClasses}
      />
    </div>
  );
};

export default ClassesAdministrationView;
