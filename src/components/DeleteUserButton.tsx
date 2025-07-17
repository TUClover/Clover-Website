import { deleteUser } from "@/api/user";
import { Button } from "@/components/ui/button";

export const DeleteUserButton: React.FC<{
  userId: string;
}> = ({ userId }) => {
  return (
    <Button
      className="bg-red-600 dark:bg-red-800 hover:bg-red-700 hover:dark:bg-red-700"
      onClick={async () => {
        const confirmed = window.confirm(
          "Are you sure you want to delete this user?"
        );
        if (confirmed) {
          const { success, error } = await deleteUser(userId);
          if (success) {
            console.log("User deleted successfully");
          }
          if (error) {
            console.error("Error deleting user:", error);
          }
        }
      }}
    >
      Delete User
    </Button>
  );
};
