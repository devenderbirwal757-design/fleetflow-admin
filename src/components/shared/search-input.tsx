import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import type { KeyboardEvent } from "react";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onKeyDown?: (e: KeyboardEvent<HTMLInputElement>) => void;
}

export function SearchInput({
  value,
  onChange,
  placeholder = "Search...",
  onKeyDown,
}: SearchInputProps) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        className="h-9 w-full pl-9 sm:w-72"
      />
    </div>
  );
}
