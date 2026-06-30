"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Search, Eye } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { formatCurrency } from "@/lib/utils";
import type { StudentDTO } from "@/types";

export default function FeesOverviewTable({ students }: { students: StudentDTO[] }) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    return students.filter(
      (s) => !search || s.name.toLowerCase().includes(search.toLowerCase()) || s.rollNo.includes(search)
    );
  }, [students, search]);

  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="border-b border-border p-4">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search students..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Roll No</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Class</TableHead>
            <TableHead>Total fee</TableHead>
            <TableHead>Paid</TableHead>
            <TableHead>Pending</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="py-10 text-center text-muted-foreground">
                No students found.
              </TableCell>
            </TableRow>
          ) : (
            filtered.map((s) => (
              <TableRow key={s._id}>
                <TableCell className="font-medium">{s.rollNo}</TableCell>
                <TableCell>{s.name}</TableCell>
                <TableCell className="text-muted-foreground">{s.class}</TableCell>
                <TableCell>{formatCurrency(s.totalFee)}</TableCell>
                <TableCell className="text-success">{formatCurrency(s.feesPaid)}</TableCell>
                <TableCell>
                  {s.pendingFee > 0 ? (
                    <Badge variant="warning">{formatCurrency(s.pendingFee)}</Badge>
                  ) : (
                    <Badge variant="success">Cleared</Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <Button asChild variant="ghost" size="icon">
                    <Link href={`/admin/fees/${s._id}`} title="View fee history">
                      <Eye className="h-4 w-4" />
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
