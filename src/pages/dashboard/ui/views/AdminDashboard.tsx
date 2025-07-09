import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Legend,
} from "chart.js";
import { useState } from "react";
import "react-datepicker/dist/react-datepicker.css";
import { ClassData, User, UserRole } from "../../../../api/types/user";
import { useAllUsers } from "../../../../hooks/useAllUsers";
import {
  useUserClasses,
  useUserClassStatus,
} from "../../../../hooks/useUserClasses";
import { useUserActivity } from "../../../../hooks/useUserActivity";
import { useInstructorClasses } from "../../../../hooks/useInstructorClasses";
import { toast } from "sonner";
import UserSideBar from "../../../../components/UsersSideBar";
import UserDetailsPanel from "../../../../components/UserDetailsPanel";
import StudentDashboardCard from "../../../../components/StudentDashboardCard";
import { useAllClasses } from "../../../../hooks/useAllClasses";
import ClassSideBar from "../../../../components/ClassSideBar";
import ClassDetailsPanel from "../../../../components/ClassDetailsPanel";

ChartJS.register(
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Legend
);

export const AdminUsers = () => {
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);

  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedClass, setSelectedClass] = useState<ClassData | null>(null);
  const selectedClassId = selectedClass?.id ?? "all";
  const selectedClassType =
    selectedClass?.id === "all"
      ? "all"
      : selectedClass?.id === "non-class"
        ? "non-class"
        : "class";

  const { users, isLoading, error } = useAllUsers();

  const primaryUser = selectedUsers[0];

  const { classes, loading: userClassesLoading } = useUserClasses(
    primaryUser?.id
  );

  const { userActivity, loading: userActivityLoading } = useUserActivity(
    primaryUser?.id
  );

  const { classes: instructorClasses, loading: instructorLoading } =
    useInstructorClasses(primaryUser?.id);

  const { userActivity: selectedActivity, progressData } = useUserActivity(
    selectedUserId,
    selectedClassId,
    selectedClassType
  );

  const { studentStatus } = useUserClassStatus(
    selectedUsers[0]?.id || null,
    selectedClass?.id || null
  );

  if (error) {
    toast.error("Error fetching users. Please try again later.");
    return null;
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row gap-6 mb-6">
        {/* Sidebar */}
        <UserSideBar
          users={users}
          selectedUsers={selectedUsers}
          loading={isLoading}
          onSelectUser={(user) => {
            setSelectedUsers([user]);
          }}
          onSetSelectedUsers={setSelectedUsers}
          setSelectedUserId={setSelectedUserId}
        />

        {/* Details Panel */}
        <UserDetailsPanel
          user={selectedUsers}
          userClasses={classes}
          userRole={UserRole.DEV}
          userActivity={userActivity}
          instructorClasses={instructorClasses}
          isLoading={
            isLoading ||
            userClassesLoading ||
            userActivityLoading ||
            instructorLoading
          }
          setSelectedClass={setSelectedClass}
          isSettingsPanel={false}
        />
      </div>

      {selectedClass && selectedUserId && (
        <StudentDashboardCard
          student={{
            fullName: `${selectedUsers[0].first_name} ${selectedUsers[0].last_name}`,
            classTitle: selectedClass.class_title,
            studentStatus:
              selectedClassId !== "all" && selectedClassId !== "non-class"
                ? studentStatus
                : null,
            totalAccepted: progressData.totalAccepted,
            correctSuggestions: progressData.correctSuggestions,
            percentageCorrect: progressData.accuracyPercentage,
            logs: selectedActivity,
          }}
          onClose={() => setSelectedClass(null)}
        />
      )}
    </div>
  );
};

export const AdminClasses = () => {
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
