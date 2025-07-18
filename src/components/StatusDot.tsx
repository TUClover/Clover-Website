interface StatusDotProps {
  text?: string;
  className?: string | null;
  color?: string;
}

export const StatusDot = ({
  className = "",
  text,
  color = "green",
}: StatusDotProps) => {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="relative">
        {text ? (
          <>
            <div className={`w-2 h-2 bg-${color}-500 rounded-full`} />
            <div className="absolute inset-0 w-2 h-2 bg-gray-700 dark:bg-white rounded-full animate-ping opacity-75" />
            <span className={`text-xs text-${color}-600 font-medium`}>
              {text}
            </span>
          </>
        ) : (
          <div className="w-2 h-2 bg-gray-400 rounded-full" />
        )}
      </div>
    </div>
  );
};
