import { notFound } from "next/navigation";
import Link from "next/link";
import { Plus } from "lucide-react";
import AdminHeader from "@/components/admin/Header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table, TableHeader, TableBody, TableRow,
  TableHead, TableCell,
} from "@/components/ui/table";
import { formatCurrency, formatDate } from "@/lib/utils";
import { getStudentWithFees } from "@/lib/data";

export default async function StudentFeeHistoryPage({
  params,
}: {
  params: Promise<{ studentId: string }>;
}) {
  const { studentId } = await params;
  const data = await getStudentWithFees(studentId);
  if (!data) notFound();

  const { feeHistory, ...student } = data;

  return (
    <div>
      <AdminHeader
        title={student.name + "'s fee history"}
        subtitle={"Roll No. " + student.rollNo + " | " + student.class}
      />
      <div className="p-4 sm:p-6">
        <div className="mb-4 grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="text-xs text-muted-foreground">Total fee</p>
            <p className="text-xl font-semibold text-navy-700">
              {formatCurrency(student.totalFee)}
            </p>
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="text-xs text-muted-foreground">Paid</p>
            <p className="text-xl font-semibold text-success">
              {formatCurrency(student.feesPaid)}
            </p>
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="text-xs text-muted-foreground">Pending</p>
            <p className="text-xl font-semibold text-saffron-600">
              {formatCurrency(student.pendingFee ?? 0)}
            </p>
          </div>
        </div>

        <div className="mb-4 flex justify-end">
          <Button asChild size="sm">
            <Link href="/admin/fees/collect">
              <Plus className="h-4 w-4" /> Collect payment
            </Link>
          </Button>
        </div>

        <div className="rounded-lg border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Receipt No.</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Month</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Method</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {feeHistory.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="py-10 text-center text-muted-foreground"
                  >
                    No payments recorded yet.
                  </TableCell>
                </TableRow>
              ) : (
                feeHistory.map((f) => (
                  <TableRow key={f._id}>
                    <TableCell className="font-medium">
                      {f.receiptNumber}
                    </TableCell>
                    <TableCell>{formatDate(f.paymentDate)}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {f.month}
                    </TableCell>
                    <TableCell>{formatCurrency(f.amount)}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {f.paymentMethod}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
