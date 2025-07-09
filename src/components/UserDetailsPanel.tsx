import { ClassData, User, UserRole, UserClassInfo } from "../api/types/user";
import PaginatedTable from "./PaginatedTable";
import SuggestionTable from "./SuggestionTable";
import UserSettings from "./UserSettings";
import { EditUserButton } from "./EditUserButton";
import { DeleteUserButton } from "./DeleteUserButton";
import { ResetPasswordButton } from "./ResetPasswordButton";
import { UserActivityLogItem } from "../api/types/suggestion";

/**
 * UserDetailsPanel component displays user details, activity, and settings.
 * It allows editing user information and deleting the user.
 * @param {User | User[] | null} user - The user data to display.
 * @param {UserRole} userRole - The role of the user (e.g., admin, instructor).
 * @param {UserActivityLogItem[]} userActivity - The activity log of the user.
 * @param {ClassData[]} userClasses - The classes associated with the user.
 * @param {ClassData[]} instructorClasses - The classes the user is teaching.
 * @param {boolean} isLoading - Indicates if the data is loading.
 * @returns {JSX.Element} - The rendered component.
 */
export const UserDetailsPanel: React.FC<{
  user: User | User[] | null;
  userRole: UserRole;
  userActivity: UserActivityLogItem[];
  userClasses: UserClassInfo[];
  instructorClasses?: ClassData[];
  isLoading?: boolean;
  setSelectedClass?: (cls: ClassData) => void;
  isSettingsPanel: boolean;
}> = ({
  user,
  userRole,
  userActivity,
  userClasses,
  instructorClasses,
  isLoading,
  setSelectedClass,
  isSettingsPanel,
}) => {
  const isArray = Array.isArray(user);
  const singleUser = isArray && user.length === 1 ? user[0] : null;

  if (isLoading) {
    return (
      <div className="w-full md:flex-1 max-h-[80vh] border border-gray-600 dark:border-gray-400 rounded-lg shadow p-6 overflow-y-auto no-scrollbar">
        <UserDetailsSkeleton />
      </div>
    );
  }

  return (
    <div className="w-full md:flex-1 max-h-[80vh] border border-gray-600 dark:border-gray-400 rounded-lg shadow p-6 overflow-y-auto no-scrollbar">
      {singleUser ? (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold mb-4 px-2">
              {singleUser.firstName} {singleUser.lastName}
              <span className="text-sm text-gray-500 px-4">
                {singleUser.email}
              </span>
            </h2>
            <EditUserButton user={singleUser} />
          </div>
          <p className="mb-4 px-2">{singleUser.role}</p>
          <UserStats userRole={userRole} user={singleUser} />
          <div className="w-full mt-6">
            <ClassDataSection
              userClasses={userClasses}
              onClassClick={(cls) => setSelectedClass && setSelectedClass(cls)}
            />
            <UserActivitySection
              userActivity={userActivity}
              user={singleUser}
            />
            <InstructorClassesSection
              user={singleUser}
              instructorClasses={instructorClasses}
            />
            <UserSettings user={singleUser} />
          </div>
          <div className="flex justify-end mt-4 space-x-4">
            {isSettingsPanel ? (
              <ResetPasswordButton />
            ) : (
              <ResetPasswordButton userId={singleUser.id} />
            )}
            <DeleteUserButton userId={singleUser.id} />
          </div>
        </div>
      ) : isArray && user.length > 0 ? (
        <div>
          <h2 className="text-2xl font-bold mb-4 px-2">User Settings</h2>
          <UserSettings user={user} />
        </div>
      ) : (
        <p className="text-gray-500">No user selected.</p>
      )}
    </div>
  );
};

export default UserDetailsPanel;

const UserStats: React.FC<{ userRole: UserRole; user: User }> = ({
  userRole,
  user,
}) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      {userRole === UserRole.DEV ? (
        <>
          <StatCard title="ID" value={user.id ?? "Unknown"} />
          <StatCard title="Source" value={user.source ?? "Unknown"} />
          <StatCard
            title="Created At"
            value={user.auth_created_at ?? "Unknown"}
          />
          <StatCard title="Status" value={user.status ?? "Unknown"} />
          <StatCard
            title="Last Updated"
            value={user.last_updated_at ?? "Unknown"}
          />
          <StatCard
            title="Last Sign In"
            value={user.last_sign_in ?? "Unknown"}
          />
        </>
      ) : (
        <></>
      )}
    </div>
  );
};

const ClassDataSection: React.FC<{
  userClasses: UserClassInfo[];
  onClassClick: (cls: ClassData) => void;
}> = ({ userClasses, onClassClick }) => {
  if (userClasses) {
    // TODO
    console.log("");
  }
  return (
    <div className="bg-gray-100 dark:bg-gray-900 rounded shadow-sm p-6 mb-4">
      <h2 className="text-md font-semibold text-alpha">User Classes</h2>
      {userClasses && userClasses.length > 0 ? (
        <ul className="mt-2">
          {userClasses.map((userClass) => (
            <div
              className="flex items-center gap-2 hover:bg-gray-200 dark:hover:bg-gray-700 p-2 rounded cursor-pointer"
              onClick={() => onClassClick(userClass.user_class)}
            >
              {userClass.user_class.classHexColor && (
                <div
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{
                    backgroundColor: userClass.user_class.classHexColor,
                  }}
                />
              )}
              <span>
                {userClass.user_class.classTitle}{" "}
                <span
                  className={
                    userClass.user_class.id === "all" ||
                    userClass.user_class.id === "non-class"
                      ? "hidden"
                      : ""
                  }
                >
                  - {userClass.user_class.classCode}
                </span>
              </span>
            </div>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500">No classes assigned</p>
      )}
    </div>
  );
};

const UserActivitySection: React.FC<{
  userActivity: UserActivityLogItem[];
  user: User;
}> = ({ userActivity, user }) => {
  return (
    <div className="bg-gray-100 dark:bg-gray-900 rounded shadow-sm p-6 mb-4">
      {userActivity.length > 0 ? (
        <div>
          <h2 className="text-md font-semibold text-[#50B498]">
            User Decision Insights
          </h2>
          <PaginatedTable
            data={userActivity}
            renderTable={(items, startIndex) => (
              <SuggestionTable
                logItems={items}
                startIndex={startIndex}
                mode={user.settings.mode}
              />
            )}
          />
        </div>
      ) : (
        <div className="text-gray-500">No user activity available</div>
      )}
    </div>
  );
};

const InstructorClassesSection: React.FC<{
  user: User;
  instructorClasses: ClassData[] | undefined;
}> = ({ user, instructorClasses }) => {
  return (
    <>
      {user.role === UserRole.INSTRUCTOR &&
      instructorClasses &&
      instructorClasses.length > 0 ? (
        <div className="bg-gray-100 dark:bg-gray-900 rounded shadow-sm p-6 mb-4">
          <h2 className="text-md font-semibold text-[#50B498]">
            Instructor Classes
          </h2>
          <ul className="mt-2">
            {instructorClasses.map((userClass) => (
              <div className="flex items-center gap-2">
                {userClass.classHexColor && (
                  <div
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: userClass.classHexColor }}
                  />
                )}
                <span>
                  {userClass.classTitle}{" "}
                  <span
                    className={
                      userClass.id === "all" || userClass.id === "non-class"
                        ? "hidden"
                        : ""
                    }
                  >
                    - {userClass.classCode}
                  </span>
                </span>
              </div>
            ))}
          </ul>
        </div>
      ) : (
        <></>
      )}
    </>
  );
};

const StatCard = ({
  title,
  value,
}: {
  title: string;
  value: string | number;
}) => {
  return (
    <div className="p-4 bg-gray-100 dark:bg-gray-900 rounded shadow-inner">
      <h4 className="font-semibold">{title}</h4>
      <p>{value}</p>
    </div>
  );
};

const SkeletonBox = ({ width = "w-full", height = "h-4" }) => (
  <div
    className={`bg-gray-300 dark:bg-gray-700 animate-pulse rounded ${width} ${height}`}
  ></div>
);

const UserDetailsSkeleton: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <div className="space-y-2">
          <SkeletonBox width="w-48" height="h-6" />
          <SkeletonBox width="w-32" height="h-4" />
        </div>
        <SkeletonBox width="w-8" height="h-8" />
      </div>

      <SkeletonBox width="w-24" height="h-4" />

      <div className="grid grid-cols-2 gap-4">
        {Array.from({ length: 6 }).map((_, idx) => (
          <SkeletonBox key={idx} height="h-16" />
        ))}
      </div>

      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          className="bg-gray-100 dark:bg-gray-900 rounded shadow-sm p-4 space-y-3"
        >
          <SkeletonBox width="w-40" />
          <SkeletonBox />
          <SkeletonBox width="w-5/6" />
          <SkeletonBox width="w-3/4" />
        </div>
      ))}

      <div className="flex justify-end">
        <SkeletonBox width="w-24" height="h-10" />
      </div>
    </div>
  );
};
