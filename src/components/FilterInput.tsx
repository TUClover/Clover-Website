import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FilterInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  showClearButton?: boolean;
  icon?: boolean;
}

const FilterInput = ({
  value,
  onChange,
  placeholder = "Filter...",
  className,
  showClearButton = true,
  icon = true,
}: FilterInputProps) => {
  const handleClear = () => {
    onChange("");
  };

  return (
    <div className={`relative ${className || ""}`}>
      {icon && (
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
      )}
      <Input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`${icon ? "pl-10" : ""} ${showClearButton && value ? "pr-10" : ""}`}
      />
      {showClearButton && value && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClear}
          className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-muted"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};

export default FilterInput;
