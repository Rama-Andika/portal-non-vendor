import * as React from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface EditableInfoProps {
  label: string;
  value: string;
  icon: React.ReactNode;
  isEditing: boolean;
  onChange: (val: string) => void;
  highlight?: boolean;
  placeholder?: string;
  type?: "text" | "select";
  options?: Array<{ label: string; value: string }>;
  error?: string;
}

export function EditableInfo({
  label,
  value,
  icon,
  isEditing,
  onChange,
  highlight,
  placeholder,
  type = "text",
  options = [],
  error,
}: EditableInfoProps) {
  return (
    <div className="group space-y-1 p-3 rounded-lg hover:bg-main/5 transition-all duration-200 min-h-[72px] flex flex-col justify-center border border-transparent has-focus:border-main/20">
      <div className="flex items-center gap-2 text-[10px] font-medium text-slate-400 uppercase tracking-widest">
        <span className="text-main/60 group-hover:text-main transition-colors">
          {icon}
        </span>
        {label}
      </div>
      {isEditing ? (
        type === "select" ? (
          <Select value={value} onValueChange={onChange}>
            <SelectTrigger className={cn(
              "h-8 py-0 px-2 text-sm focus:border-main/40 border-main/20 bg-background/50 w-full shadow-none ring-offset-transparent focus:ring-0 font-medium",
              error && "border-destructive focus:border-destructive"
            )}>
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              {options.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={cn(
              "h-8 py-0 px-2 text-sm focus-visible:ring-main/30 border-main/20 bg-background/50 font-medium",
              error && "border-destructive focus-visible:ring-destructive"
            )}
            placeholder={placeholder}
          />
        )
      ) : (
        <div
          className={cn(
            "text-sm md:text-base font-medium leading-tight wrap-break-word",
            highlight ? "text-main font-semibold" : "text-slate-700 dark:text-slate-200",
          )}
        >
          {value || "-"}
        </div>
      )}
      {isEditing && error && (
        <p className="text-[10px] text-destructive font-medium animate-in fade-in slide-in-from-top-1 duration-200">
          {error}
        </p>
      )}
    </div>
  );
}
