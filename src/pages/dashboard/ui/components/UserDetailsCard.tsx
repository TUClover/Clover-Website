import { UserMode, UserSettings } from "@/api/types/user";
import { saveUserSettings } from "@/api/user";
import {
  InfoCardItem,
  InfoCardTitle,
  InfoField,
} from "@/components/CardComponents";
import CustomSelect from "@/components/CustomSelect";
import ModalContainer from "@/components/ModalContainer";
import RoleBadge from "@/components/RoleBadge";
import StatusBadge from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import UserAvatar from "@/components/UserAvatar";
import { UserWithActivity } from "@/hooks/useAllUsersActivity";
import { formatActivityTimestamp } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";
import {
  Activity,
  Calendar,
  Edit,
  Info,
  Mail,
  PersonStanding,
  Settings,
  User,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";

interface UserDetailsCardProps {
  user: UserWithActivity;
  onClose: () => void;
}

const UserDetailsCard = ({ user, onClose }: UserDetailsCardProps) => {
  const [editMode, setEditMode] = useState(false);
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [originalSettings, setOriginalSettings] = useState<UserSettings | null>(
    null
  );

  useEffect(() => {
    if (user?.settings) {
      setSettings(user.settings);
      setOriginalSettings(user.settings);
    }
  }, [user]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateSetting = (key: keyof UserSettings, value: any) => {
    setSettings((prev) => ({ ...prev!, [key]: value }));
  };

  const handleEdit = () => {
    setEditMode((prev) => !prev);
    setOriginalSettings(settings);
  };

  const queryClient = useQueryClient();

  const handleSaveSettings = async () => {
    try {
      await saveUserSettings(user.id, settings!);
      console.log("Saving settings:", settings);

      setEditMode(false);
      setOriginalSettings(settings);

      await queryClient.invalidateQueries({
        queryKey: ["allUsers"],
      });
    } catch (error) {
      console.error("Failed to save settings:", error);
    }
  };

  const handleCancelEdit = () => {
    setEditMode(false);
    setSettings(originalSettings);
  };

  return (
    <ModalContainer isOpen={!!user} onClose={onClose}>
      <Card className="overflow-hidden w-full max-w-2xl lg:max-w-4xl max-h-[90vh] flex flex-col overflow-y-auto bg-white dark:bg-gray-900 pt-3 relative px-2">
        {/* Header */}
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6">
          <div className="flex items-center space-x-4">
            <UserAvatar
              firstName={user.firstName}
              avatarUrl={user.avatarUrl}
              size="xl"
            />
            <div className="flex flex-col space-y-2">
              <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                {user.firstName} {user.lastName}
              </CardTitle>
              <div className="flex items-center gap-2 mt-1">
                {<RoleBadge role={user.role} />}
                {<StatusBadge status={user.status} />}
              </div>
            </div>
          </div>
          {onClose && (
            <Button
              variant="ghost"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 absolute top-6 right-6 rounded-full"
            >
              <X className="!size-6" />
            </Button>
          )}
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="py-3">
              <InfoCardTitle title="Details" icon={User} />
              <CardContent className="space-y-3">
                <InfoField label="Email" value={user.email} icon={Mail} />
                <InfoField
                  label="Joined"
                  value={new Date(user.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                  icon={Calendar}
                />
                <InfoField label="ID" value={user.id} icon={Info} />
              </CardContent>
            </Card>

            {/* User Settings */}
            <Card className="py-3">
              <InfoCardTitle
                title="Settings"
                icon={Settings}
                button={
                  <button
                    onClick={editMode ? handleCancelEdit : handleEdit}
                    className="text-gray-500 dark:text-gray-300 hover:text-primary mr-1"
                  >
                    {editMode ? (
                      <X className="size-5" />
                    ) : (
                      <Edit className="size-5" />
                    )}
                  </button>
                }
              />
              <CardContent className="space-y-6">
                {/* Notifications */}
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">Show Notifications</p>
                  <Switch
                    checked={settings?.showNotifications ?? true}
                    onCheckedChange={(checked) =>
                      updateSetting("showNotifications", checked)
                    }
                    disabled={!editMode}
                  />
                </div>

                {/* Quiz Setting */}
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">Enable Quiz</p>
                  <Switch
                    checked={settings?.enableQuiz ?? true}
                    onCheckedChange={(checked) =>
                      updateSetting("enableQuiz", checked)
                    }
                    disabled={!editMode}
                  />
                </div>

                {/* Bug Percentage */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Bug Percentage</span>
                    <span className="text-sm text-muted-foreground">
                      {settings?.bugPercentage || 50}%
                    </span>
                  </div>
                  <Slider
                    value={[settings?.bugPercentage || 50]}
                    onValueChange={(value) =>
                      updateSetting("bugPercentage", value[0])
                    }
                    max={100}
                    step={5}
                    disabled={!editMode}
                    className="w-full"
                  />
                </div>

                {/* Mode Selection */}
                <div className="flex items-center justify-between gap-8">
                  <p className="text-sm font-medium">Mode</p>
                  <CustomSelect
                    value={settings?.mode || UserMode.BLOCK}
                    onValueChange={(value) => updateSetting("mode", value)}
                    options={[
                      { label: "Block", value: UserMode.BLOCK },
                      { label: "Line", value: UserMode.LINE },
                      { label: "Selection", value: UserMode.SELECTION },
                    ]}
                    disabled={!editMode}
                    className="w-28"
                  />
                </div>

                {/* Save/Cancel Buttons */}
                {editMode && (
                  <div className="flex gap-3 items-center pt-3">
                    <Button
                      onClick={handleSaveSettings}
                      size="sm"
                      className="flex-1 rounded-full"
                    >
                      Save
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={handleCancelEdit}
                      size="sm"
                      className="flex-1 rounded-full"
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Activity Statistics */}
          <Card className="py-3">
            <InfoCardTitle title="Insights" icon={Activity} />
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <InfoCardItem
                  label="Total Interactions"
                  value={user.totalInteractions}
                />
                <InfoCardItem
                  label="Correct Answers"
                  value={user.correctSuggestions}
                />
                <InfoCardItem
                  label="Accuracy Rate"
                  value={`${user.accuracyPercentage.toFixed(1)}%`}
                />
                <InfoCardItem
                  label="Last Activity"
                  value={
                    user.lastActivity
                      ? (formatActivityTimestamp(
                          user.lastActivity,
                          true
                        ) as string)
                      : "N/A"
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Account Stats */}
          <Card className="py-3">
            <InfoCardTitle title="Activity Status" icon={PersonStanding} />
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <InfoCardItem
                  label="Member Since"
                  value={new Date(user.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                />
                <InfoCardItem
                  label="Days Active"
                  value={Math.floor(
                    (Date.now() - new Date(user.createdAt).getTime()) /
                      (1000 * 60 * 60 * 24)
                  )}
                />
                <InfoCardItem label="Account Status" value={user.status} />
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </ModalContainer>
  );
};

export default UserDetailsCard;
