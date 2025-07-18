import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2 } from "lucide-react";

export type actionType = "join" | "leave" | "cancel" | "remove" | "delete";

interface ClassActionDialogProps {
  isOpen: boolean;
  isLoading: boolean;
  classInfo: {
    classId: string;
    userId: string;
    classTitle?: string;
    action: actionType;
  } | null;
  onClose: () => void;
  onConfirm: () => void;
}

export const ClassActionDialog = ({
  isOpen,
  isLoading,
  classInfo,
  onClose,
  onConfirm,
}: ClassActionDialogProps) => {
  if (!classInfo) return null;

  const getDialogContent = () => {
    const className = classInfo.classTitle || "this class";

    switch (classInfo.action) {
      case "join":
        return {
          title: "Join Class",
          description: `Are you sure you want to join "${className}"? You'll be added to the waitlist and the instructor will review your application.`,
          actionText: "join",
          loadingText: "Joining...",
          buttonColor: "bg-primary hover:bg-primary/80 focus:ring-primary",
        };

      case "leave":
        return {
          title: "Leave Class",
          description: `Are you sure you want to leave "${className}"? You'll lose access to all course materials and progress.`,
          actionText: "leave",
          loadingText: "Leaving...",
          buttonColor: "bg-red-600 hover:bg-red-700 focus:ring-red-600",
        };

      case "cancel":
        return {
          title: "Cancel Application",
          description: `Are you sure you want to cancel your application for "${className}"? You can reapply later if you change your mind.`,
          actionText: "cancel your application",
          loadingText: "Cancelling...",
          buttonColor: "bg-red-600 hover:bg-red-700 focus:ring-red-600",
        };

      case "remove":
        return {
          title: "Remove from List",
          description: `Are you sure you want to remove "${className}" from your list? This will permanently delete this rejected application from your records.`,
          actionText: "remove from list",
          loadingText: "Removing...",
          buttonColor: "bg-red-600 hover:bg-red-700 focus:ring-red-600",
        };

      case "delete":
        return {
          title: "Delete Class",
          description: `Are you sure you want to permanently delete "${className}"? This action cannot be undone and will remove all class data, including enrolled students.`,
          actionText: "delete permanently",
          loadingText: "Deleting...",
          buttonColor: "bg-red-600 hover:bg-red-700 focus:ring-red-600",
        };

      default:
        return {
          title: "Confirm Action",
          description: `Are you sure you want to perform this action on "${className}"?`,
          actionText: "continue",
          loadingText: "Processing...",
          buttonColor: "bg-gray-600 hover:bg-gray-700 focus:ring-gray-600",
        };
    }
  };

  const { title, description, actionText, loadingText, buttonColor } =
    getDialogContent();

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isLoading}
            className={buttonColor}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {loadingText}
              </>
            ) : (
              `Yes, ${actionText}`
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ClassActionDialog;
