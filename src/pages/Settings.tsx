import { User, UserRole } from "../api/types/user";
import { DeleteUserButton } from "../components/DeleteUserButton";
import { EditUserButton } from "../components/EditUserButton";
import { ResetPasswordButton } from "../components/ResetPasswordButton";
import { Card, CardHeader, CardTitle } from "../components/ui/card";
import { Title } from "../components/ui/text";
import UserSettings from "../components/UserSettings";

/**
 * Settings component that displays user settings and activity.
 * It fetches user classes, instructor classes, and user activity from the server.
 *
 * @param userData - The user data to display in the settings page.
 */
export const Settings = ({ userData }: { userData: User | null }) => {
  if (!userData) return null;

  const isPrivileged =
    userData.role === UserRole.ADMIN || userData.role === UserRole.DEV;

  return (
    <div className="flex min-h-screen flex-col items-center pb-8 text-text width-container">
      <Title className="pb-6">Settings</Title>
      <Card className="flex flex-col gap-4 p-6 width-container">
        <div className="flex justify-between items-center mb-4">
          <CardTitle>
            {userData.first_name + " " + userData.last_name}
          </CardTitle>
          <EditUserButton user={userData} />
        </div>

        {isPrivileged && <UserSettings user={userData} />}

        <div className="flex gap-4">
          <DeleteUserButton userId={userData.id} />
          <ResetPasswordButton />
        </div>
      </Card>
    </div>
  );
};

export default Settings;
