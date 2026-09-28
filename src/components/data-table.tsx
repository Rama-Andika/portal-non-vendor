import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { DataTableProps } from "@/types/data-table.interface";

import { DataTableColumnHeader } from "./data-table-column-header";

export function DataTable<TData, TValue>({
  columns,
  data,
  tableOptions,
}: DataTableProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,

    // ===== default behavior =====
    getCoreRowModel: getCoreRowModel(),

    // ===== allow override =====
    ...tableOptions,
  });

  return (
    <div >
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead
                  key={header.id}
                  className="first:pl-4 first:md:pl-6 last:pr-4 last:md:pr-6"
                  style={{
                    width: header.getSize(),
                  }}
                >
                  {header.isPlaceholder
                    ? null
                    : typeof header.column.columnDef.header === "string"
                    ? <DataTableColumnHeader title={header.column.columnDef.header} />
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>


        <TableBody>
          {table.getRowModel().rows.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} className="first:pl-4 first:md:pl-6 last:pr-4 last:md:pr-6">
                    {flexRender(
                      cell.column.columnDef.cell,
                      cell.getContext(),
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="h-24 text-center"
              >
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* Pagination (optional, auto hide if disabled) */}
      {/* {(table.getCanNextPage() || table.getCanPreviousPage()) && (
        <DataTablePagination table={table} />
      )} */}
    </div>
  );
}
