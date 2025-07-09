import clsx from "clsx";
import { Loader2 } from "lucide-react";

interface LoadingProps {
  text?: string;
  showText?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeMap = {
  sm: "h-4 w-4 text-sm",
  md: "h-8 w-8 text-base",
  lg: "h-12 w-12 text-lg",
  xl: "h-16 w-16 text-xl",
};

const Loading = ({
  text = "Loading",
  showText = true,
  size = "md",
  className = "",
}: LoadingProps) => {
  const loaderClass = clsx(
    className,
    "animate-spin",
    sizeMap[size].split(" ")[0],
    sizeMap[size].split(" ")[1]
  );
  const textClass = clsx("ml-3 flex", sizeMap[size].split(" ")[2]);

  return (
    <div className="flex flex-col items-center justify-center h-screen w-full">
      <div className="flex items-center">
        <Loader2 className={loaderClass} />
        {showText && (
          <span className={textClass}>
            {text}
            <span className="ml-1 w-4 inline-block text-left">
              <span className="inline-block animate-dots" />
            </span>
          </span>
        )}
      </div>
    </div>
  );
};

export default Loading;
