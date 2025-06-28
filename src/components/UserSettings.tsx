import { useState, useEffect, useMemo } from "react";
import { saveUserSettings } from "../api/user";
import {
  User,
  UserMode,
  UserSettings as UserSettingsType,
} from "../api/types/user";
import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Slider } from "./ui/slider";
import { Input } from "./ui/input";

const defaultSettings: UserSettingsType = {
  bug_percentage: 50,
  show_notifications: true,
  enable_quiz: true,
  mode: UserMode.BLOCK,
};

type UserSettingsProps = {
  user: User | User[] | null;
};

export const UserSettings: React.FC<UserSettingsProps> = ({ user }) => {
  const isMulti = Array.isArray(user);
  const initialSettings: UserSettingsType = useMemo(() => {
    if (!user) return defaultSettings;
    if (isMulti) return defaultSettings;
    return user.settings ?? defaultSettings;
  }, [user, isMulti]);

  const [bugPercentage, setBugPercentage] = useState(
    initialSettings.bug_percentage
  );
  const [mode, setMode] = useState(initialSettings.mode);
  const [showNotifications, setShowNotifications] = useState(
    initialSettings.show_notifications
  );
  const [enableQuiz, setEnableQuiz] = useState(initialSettings.enable_quiz);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">(
    "idle"
  );

  useEffect(() => {
    setBugPercentage(initialSettings.bug_percentage);
    setShowNotifications(initialSettings.show_notifications);
    setEnableQuiz(initialSettings.enable_quiz);
    setMode(initialSettings.mode);
  }, [initialSettings]);

  const handleSave = async () => {
    setStatus("saving");
    const settings: UserSettingsType = {
      bug_percentage: bugPercentage,
      show_notifications: showNotifications,
      enable_quiz: enableQuiz,
      mode: mode,
    };

    try {
      if (!user) {
        setStatus("error");
        return;
      }

      const users = isMulti ? user : [user];
      const results = await Promise.all(
        users.map((u) => saveUserSettings(u.id, settings))
      );

      const allSuccessful = results.every((r) => r.data === true);
      setStatus(allSuccessful ? "saved" : "error");
    } catch (err) {
      console.error(err);
      setStatus("error");
    }
  };

  return (
    <div className="space-y-6 bg-gray-100 dark:bg-gray-900 rounded shadow-sm p-6 mb-4">
      <h2 className="text-md font-semibold text-[#50B498]">
        {isMulti ? "Bulk User Settings" : "User Settings"}
      </h2>

      <div>
        <Label className="mb-1 block">Bug Threshold Percentage</Label>
        <div className="flex items-center gap-4">
          <Slider
            defaultValue={[bugPercentage]}
            min={0}
            max={100}
            step={1}
            onValueChange={([value]) => setBugPercentage(value)}
            className="w-full"
          />
          <Input
            type="number"
            value={bugPercentage}
            min={0}
            max={100}
            onChange={(e) => {
              const value = parseInt(e.target.value);
              if (!isNaN(value) && value >= 0 && value <= 100) {
                setBugPercentage(value);
              }
            }}
            className="w-16"
          />
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="show_notifications"
          checked={showNotifications}
          onCheckedChange={(checked) => setShowNotifications(Boolean(checked))}
        />
        <Label htmlFor="show_notifications">Show Notifications</Label>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="enable_quiz"
          checked={enableQuiz}
          onCheckedChange={(checked) => setEnableQuiz(Boolean(checked))}
        />
        <Label htmlFor="enable_quiz">Enable Quiz</Label>
      </div>

      <div className="flex items-center space-x-2">
        <Label htmlFor="mode" className="mb-1 block">
          User Mode
        </Label>
        <Select value={mode} onValueChange={(v) => setMode(v as UserMode)}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select a mode" />
          </SelectTrigger>
          <SelectContent>
            {Object.values(UserMode).map((m) => (
              <SelectItem key={m} value={m}>
                {m}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave}>Save</Button>
      </div>

      {status === "saving" && (
        <p className="text-sm text-gray-500">Saving...</p>
      )}
      {status === "saved" && (
        <p className="text-sm text-green-500">Settings saved!</p>
      )}
      {status === "error" && (
        <p className="text-sm text-red-500">
          Error saving settings. Please try again.
        </p>
      )}
    </div>
  );
};

export default UserSettings;
