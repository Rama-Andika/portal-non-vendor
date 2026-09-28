import * as React from "react";
import { ArrowUpDownIcon, ArrowUpIcon, ArrowDownIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface DataTableColumnHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  field?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  onSort?: (field: any) => void;
}

export function DataTableColumnHeader({
  title,
  field,
  sortBy,
  sortOrder,
  onSort,
  className,
  ...props
}: DataTableColumnHeaderProps) {
  if (!onSort || !field) {
    return (
      <div 
        className={cn("text-[12px] font-bold uppercase text-slate-500", className)}
        {...props}
      >
        {title}
      </div>
    );
  }

  const isActive = sortBy === field;

  const renderSortIcon = () => {
    if (!isActive) return <ArrowUpDownIcon className="ml-2 size-3 opacity-50" />;
    return sortOrder === "asc" ? (
      <ArrowUpIcon className="ml-2 size-3 text-main" />
    ) : (
      <ArrowDownIcon className="ml-2 size-3 text-main" />
    );
  };

  return (
    <div className={cn("flex items-center space-x-2", className)} {...props}>
      <Button
        variant="ghost"
        size="sm"
        className={cn(
          "-ml-4 h-8 hover:bg-transparent font-bold uppercase text-slate-500 text-[12px]",
          isActive && "text-main"
        )}
        onClick={() => onSort(field)}
      >
        <span>{title}</span>
        {renderSortIcon()}
      </Button>
    </div>
  );
}
