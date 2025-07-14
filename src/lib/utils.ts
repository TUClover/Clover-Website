import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * This function combines the clsx and tailwind-merge libraries to create a utility function for conditional class names.
 * It allows you to conditionally apply classes based on if the input is true or not.
 * The twMerge function is used to merge Tailwind CSS classes, resolving any conflicts between them.
 *
 * @param inputs - An array of class names or conditional class names.
 * @returns A string of merged class names.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const isOnline = (lastActivity: string | null) => {
  if (!lastActivity) return false;
  const now = new Date();
  const lastActivityDate = new Date(lastActivity);
  const diffInMinutes =
    (now.getTime() - lastActivityDate.getTime()) / (1000 * 60);
  return diffInMinutes <= 5;
};

export const formatActivityTimestamp = (
  timestamp: string | null,
  relative: boolean = false
) => {
  if (!timestamp) return "No activity";

  const date = new Date(timestamp);
  const now = new Date();
  const diffInMinutes = (now.getTime() - date.getTime()) / (1000 * 60);

  if (diffInMinutes < 5) return "Online";
  if (diffInMinutes < 60) return `${Math.floor(diffInMinutes)}m ago`;
  if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;

  if (relative) {
    const diffInDays = Math.floor(diffInMinutes / 1440);
    return `${diffInDays}d ago`;
  }

  // Otherwise show the formatted date
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};
