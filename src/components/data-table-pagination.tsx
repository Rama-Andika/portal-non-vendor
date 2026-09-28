import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DataTablePaginationProps {
  page: number; // 0-based
  size: number;
  totalPages: number;
  pageSizeOptions?: number[];
  onPageChange: (page: number) => void;
  onSizeChange: (size: number) => void;
  showPageSize?: boolean;
}

const DEFAULT_PAGE_SIZES = [10, 20, 25, 30, 40, 50];

export function DataTablePagination({
  page,
  size,
  totalPages,
  pageSizeOptions = DEFAULT_PAGE_SIZES,
  onPageChange,
  onSizeChange,
  showPageSize = true,
}: DataTablePaginationProps) {
  const { t } = useTranslation();

  return (
    <div className="flex items-center justify-between md:justify-end py-4">
      <div className="flex items-center space-x-6 lg:space-x-8 w-full md:w-auto justify-between md:justify-end">
        {showPageSize && (
          <div className="hidden md:flex items-center space-x-2">
            <p className="text-sm font-medium text-gray-500">{t("common.rowsPerPage")}</p>
            <Select
              value={size.toString()}
              onValueChange={(value) => onSizeChange(Number(value))}
            >
              <SelectTrigger className="h-9 w-18 rounded-lg border-gray-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent
                side="top"
                className="rounded-xl border-gray-100 shadow-xl"
              >
                {pageSizeOptions.map((pageSize) => (
                  <SelectItem key={pageSize} value={pageSize.toString()}>
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="flex items-center gap-1.5 md:gap-4 w-full md:w-auto justify-between md:justify-end">
          <div className="flex items-center justify-center text-sm font-bold text-gray-700 bg-gray-100/50 px-3 py-1.5 rounded-lg min-w-[80px]">
            <span className="md:hidden">
              {page + 1} / {totalPages}
            </span>
            <span className="hidden md:inline">
              {page + 1} / {totalPages}
            </span>
          </div>

          <div className="flex items-center space-x-1 md:space-x-2">
            <Button
              variant="outline"
              size="icon"
              className="hidden size-9 rounded-lg border-gray-200 lg:flex hover:bg-main hover:text-white transition-all active:scale-90"
              onClick={() => onPageChange(0)}
              disabled={page === 0}
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>

            <Button
              variant="outline"
              size="icon"
              className="size-9 rounded-lg border-gray-200 hover:bg-main hover:text-white transition-all active:scale-90"
              onClick={() => onPageChange(page - 1)}
              disabled={page === 0}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <Button
              variant="outline"
              size="icon"
              className="size-9 rounded-lg border-gray-200 hover:bg-main hover:text-white transition-all active:scale-90"
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages - 1}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>

            <Button
              variant="outline"
              size="icon"
              className="hidden size-9 rounded-lg border-gray-200 lg:flex hover:bg-main hover:text-white transition-all active:scale-90"
              onClick={() => onPageChange(totalPages - 1)}
              disabled={page >= totalPages - 1}
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
