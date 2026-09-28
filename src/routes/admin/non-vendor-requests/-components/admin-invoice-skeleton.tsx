import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface AdminInvoiceTableSkeletonProps {
  columnCount: number;
  rowCount?: number;
}

export function AdminInvoiceTableSkeleton({
  columnCount,
  rowCount = 10,
}: AdminInvoiceTableSkeletonProps) {
  return (
    <Table className="min-w-[800px] lg:min-w-full">
      <TableHeader className="bg-muted/50">
        <TableRow>
          {Array.from({ length: columnCount }).map((_, i) => (
            <TableHead key={i} className="h-12 first:pl-4 first:md:pl-6 last:pr-4 last:md:pr-6">
              <div className="h-4 bg-muted animate-pulse rounded-md w-24" />
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {Array.from({ length: rowCount }).map((_, i) => (
          <TableRow key={i}>
            {Array.from({ length: columnCount }).map((_, j) => (
              <TableCell key={j} className="h-16 first:pl-4 first:md:pl-6 last:pr-4 last:md:pr-6">
                <div className="h-4 bg-muted animate-pulse rounded-md w-full" />
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
