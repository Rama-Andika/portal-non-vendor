import type { ColumnDef, TableOptions } from "@tanstack/react-table";

type safeTableOptions<TData> = Omit<
  TableOptions<TData>,
  "data" | "columns" | "getCoreRowModel"
>;
export interface DataTableProps<TData, TValue = any> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  tableOptions?: safeTableOptions<TData>;
}
