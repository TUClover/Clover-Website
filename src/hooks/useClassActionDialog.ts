import {
  deleteClass,
  registerUserClass,
  unregisterUserClass,
} from "@/api/classes";
import { actionType } from "@/components/ClassActionDialog";
import { useState } from "react";
import { toast } from "sonner";

interface UseClassActionDialogProps {
  onSuccess?: () => void;
}

export const useClassActionDialog = ({
  onSuccess,
}: UseClassActionDialogProps = {}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [classInfo, setClassInfo] = useState<{
    classId: string;
    userId: string;
    classTitle?: string;
    action: actionType;
  } | null>(null);

  const openDialog = (params: {
    classId: string;
    userId: string;
    classTitle?: string;
    action: actionType;
  }) => {
    setClassInfo(params);
    setIsOpen(true);
  };

  const closeDialog = () => {
    setIsOpen(false);
    setClassInfo(null);
  };

  const handleConfirm = async () => {
    if (!classInfo) return;

    setIsLoading(true);
    try {
      let result;
      let successMessage;

      if (classInfo.action === "join") {
        result = await registerUserClass(classInfo.userId, classInfo.classId);
        successMessage = "Successfully joined class!";
      } else if (classInfo.action === "delete") {
        result = await deleteClass(classInfo.classId);
        successMessage = "Class deleted successfully!";
      } else {
        result = await unregisterUserClass(classInfo.userId, classInfo.classId);

        switch (classInfo.action) {
          case "leave":
            successMessage = "Successfully left class!";
            break;
          case "cancel":
            successMessage = "Successfully cancelled application!";
            break;
          case "remove":
            successMessage = "Successfully removed from list!";
            break;
          default:
            successMessage = "Action completed successfully!";
        }
      }

      if (result.success) {
        toast.success(successMessage);
        closeDialog();
        onSuccess?.();
      } else {
        toast.error(result.error || "Failed to complete action");
      }
    } catch (error) {
      console.error("Failed to complete class action:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isOpen,
    isLoading,
    classInfo,
    openDialog,
    closeDialog,
    handleConfirm,
  };
};
