import { UserData, UserRole } from "../api/types/user";
import { Title } from "../components/ui/text";
import UserDetailsPanel from "../components/UserDetailsPanel";
import { useInstructorClasses } from "../hooks/useInstructorClasses";
import { useUserActivity } from "../hooks/useUserActivity";
import { useUserClasses } from "../hooks/useUserClasses";

/**
 * Settings component that displays user settings and activity.
 * It fetches user classes, instructor classes, and user activity from the server.
 * @param userData - The user data to display in the settings page.
 * @returns
 */
export const Settings = ({ userData }: { userData: UserData | null }) => {
  const { classes, loading: userClassesLoading } = useUserClasses(userData?.id);
  const { classes: instructorClasses, loading: instructorClassesLoading } =
    useInstructorClasses(userData?.id);
  const { userActivity, loading: userActivityLoading } = useUserActivity(
    userData?.id
  );

  return (
    <div className="flex min-h-screen items-center flex-col text-text width-container pb-8">
      <Title className="pb-6">Settings</Title>
      <div>
        <UserDetailsPanel
          userRole={userData?.role ?? UserRole.STUDENT}
          user={userData ? [userData] : null}
          userActivity={userActivity}
          instructorClasses={instructorClasses}
          userClasses={classes}
          isLoading={
            userClassesLoading ||
            userActivityLoading ||
            instructorClassesLoading
          }
          isSettingsPanel={true}
        />
      </div>
    </div>
  );
};

export default Settings;
