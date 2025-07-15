import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface UserAvatarProps {
  firstName?: string;
  avatarUrl?: string | null;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
  fallbackClassName?: string;
  hexColor?: string; // Optional hex color for fallback background
}

const UserAvatar = ({
  firstName,
  avatarUrl,
  size = "md",
  className,
  fallbackClassName,
  hexColor,
}: UserAvatarProps) => {
  const getSizeClasses = () => {
    switch (size) {
      case "xs":
        return { container: "w-6 h-6", text: "text-xs" };
      case "sm":
        return { container: "w-8 h-8", text: "text-sm" };
      case "md":
        return { container: "w-10 h-10", text: "text-lg" };
      case "lg":
        return { container: "w-12 h-12", text: "text-xl" };
      case "xl":
        return { container: "w-16 h-16", text: "text-2xl" };
      default:
        return { container: "w-10 h-10", text: "text-lg" };
    }
  };

  const sizeClasses = getSizeClasses();

  const getInitials = () => {
    if (firstName) {
      return firstName.charAt(0).toUpperCase();
    }
    return "U";
  };

  const backgroundColor = hexColor || "#50B498";

  return (
    <Avatar className={`${sizeClasses.container} ${className || ""}`}>
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt="User Avatar"
          className="w-full h-full rounded-full object-cover"
        />
      ) : (
        <AvatarFallback
          className={` text-white ${sizeClasses.text} font-semibold ${fallbackClassName || ""}`}
          style={{ backgroundColor }}
        >
          {getInitials()}
        </AvatarFallback>
      )}
    </Avatar>
  );
};

export default UserAvatar;
