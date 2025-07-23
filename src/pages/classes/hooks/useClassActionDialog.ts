import {
  deleteClass,
  registerUserClass,
  unregisterUserClass,
  updateStudentEnrollmentStatus,
} from "@/api/classes";
import { actionType } from "@/pages/classes/ui/components/ClassActionDialog";
import { EnrollmentStatus } from "@/types/user";
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
    isInstructor?: boolean;
  } | null>(null);

  const openDialog = (params: {
    classId: string;
    userId: string;
    classTitle?: string;
    action: actionType;
    isInstructor?: boolean;
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

      switch (classInfo.action) {
        case "join":
          result = await registerUserClass(classInfo.userId, classInfo.classId);
          successMessage = "Successfully joined class!";
          break;

        case "delete":
          result = await deleteClass(classInfo.classId);
          successMessage = "Class deleted successfully!";
          break;

        case "accept":
          result = await updateStudentEnrollmentStatus(
            classInfo.classId,
            classInfo.userId,
            EnrollmentStatus.ENROLLED
          );
          successMessage = "Successfully enrolled student!";
          break;

        case "reject":
          result = await updateStudentEnrollmentStatus(
            classInfo.classId,
            classInfo.userId,
            EnrollmentStatus.REJECTED
          );
          successMessage = "Successfully rejected student!";
          break;

        case "complete":
          result = await updateStudentEnrollmentStatus(
            classInfo.classId,
            classInfo.userId,
            EnrollmentStatus.COMPLETED
          );
          successMessage = "Successfully marked student as complete!";
          break;

        case "leave":
        case "cancel":
        case "remove":
        default:
          result = await unregisterUserClass(
            classInfo.userId,
            classInfo.classId
          );

          switch (classInfo.action) {
            case "leave":
              successMessage = "Successfully left class!";
              break;
            case "cancel":
              successMessage = "Successfully cancelled application!";
              break;
            case "remove":
              successMessage = "Successfully removed!";
              break;
            default:
              successMessage = "Action completed successfully!";
          }
          break;
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
