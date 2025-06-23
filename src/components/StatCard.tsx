import { Card } from "./ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";

interface StatCardProps {
  title: string;
  value: string | number;
  tooltipContent?: string | React.ReactNode;
}

/**
 * A card to be used in the stats section of the dashboard.
 * It displays a title and a value.
 * @param props - The props for the StatCard component.
 * @param {string} props.title - The title of the stat card.
 * @param {string | number} props.value - The value to be displayed in the stat card.
 * @returns
 */
const StatCard = ({ title, value, tooltipContent }: StatCardProps) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Card className="w-full h-full p-4 flex flex-col gap-1">
            <p className="text-2xl font-bold text-primary">{title}</p>
            <p className="text-2xl font-bold text-text">{value}</p>
          </Card>
        </TooltipTrigger>
        {tooltipContent && (
          <TooltipContent
            side="top"
            align="center"
            className="tooltip-container"
          >
            {typeof tooltipContent === "string" ? (
              <p className="text-sm">{tooltipContent}</p>
            ) : (
              tooltipContent
            )}
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  );
};

export default StatCard;
