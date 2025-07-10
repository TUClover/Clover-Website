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

interface CustomSelectProps<T = string> {
  value: T;
  onValueChange: (value: T) => void;
  options: SelectOption<T>[];
  placeholder?: string;
  className?: string;
  width?: string;
}

const CustomSelect = <T extends string>({
  value,
  onValueChange,
  options,
  placeholder,
  className = "w-16",
}: CustomSelectProps<T>) => {
  return (
    <Select
      value={value as string}
      onValueChange={(val) => onValueChange(val as T)}
    >
      <SelectTrigger className={className}>
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
