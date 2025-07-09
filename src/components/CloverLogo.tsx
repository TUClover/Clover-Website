import { cn } from "../lib/utils";
import { CLOVER } from "./ui/text";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  showText?: boolean;
}

const CloverLogo = ({
  size = "md",
  className = "",
  showText = true,
}: LogoProps) => {
  const sizeConfig = {
    sm: {
      image: "h-6 w-6",
      text: "text-lg",
      gap: "gap-2",
    },
    md: {
      image: "h-8 w-8",
      text: "text-2xl",
      gap: "gap-2",
    },
    lg: {
      image: "h-12 w-12",
      text: "text-4xl",
      gap: "gap-3",
    },
  };

  const config = sizeConfig[size];

  return (
    <div className={cn("flex items-center", config.gap, className)}>
      <img
        src="../src/assets/CLOVER.svg"
        alt="Clover Logo"
        className={config.image}
      />
      {showText && <CLOVER className={cn(config.text, "font-bold")} />}
    </div>
  );
};

export default CloverLogo;
