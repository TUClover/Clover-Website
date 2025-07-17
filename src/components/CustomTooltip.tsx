import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ReactNode } from "react";

interface CustomTooltipProps {
  children: ReactNode;
  trigger: ReactNode;
  className?: string;
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
}

export const CustomTooltip = ({
  children,
  trigger,
  className,
  side = "top",
  align = "center",
}: CustomTooltipProps) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild className="cursor-pointer hover:text-alpha/80">
          {trigger}
        </TooltipTrigger>
        <TooltipContent
          className={`tooltip-container ${className || ""}`}
          side={side}
          align={align}
        >
          {children}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
