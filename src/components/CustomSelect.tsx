import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

interface SelectOption<T = string> {
  value: T;
  label: string;
}

interface CustomSelectProps<T extends string> {
  value: T;
  onValueChange: (value: T) => void;
  options: SelectOption<T>[];
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  width?: string;
}

const CustomSelect = <T extends string>({
  value,
  onValueChange,
  options,
  placeholder,
  disabled = false,
  className = "w-full",
}: CustomSelectProps<T>) => {
  return (
    <Select
      value={value as string}
      onValueChange={(val) => onValueChange(val as T)}
      disabled={disabled}
    >
      <SelectTrigger
        className={cn(
          "text-sm text-muted-foreground border-b border-slate-400 dark:border-sidebar-accent bg-gray-100 dark:bg-transparent",
          className
        )}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value as string}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default CustomSelect;
