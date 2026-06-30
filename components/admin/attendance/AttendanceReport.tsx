"use client";

import { useState, useEffect, useCallback } from "react";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { formatDate } from "@/lib/utils";
import type { StudentDTO } from "@/types";

interface ReportRecord {
  date: string;
  status: string;
  remarks: string;
}

export default function AttendanceReport({ students }: { students: StudentDTO[] }) {
  const [studentId, setStudentId] = useState(students[0]?._id || "");
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [data, setData] = useState<{ records: ReportRecord[]; present: number; total: number; percentage: number } | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchReport = useCallback(async () => {
    if (!studentId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/attendance/report?studentId=${studentId}&month=${month}`);
      const json = await res.json();
      setData(json);
    } finally {
      setLoading(false);
    }
  }, [studentId, month]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4 sm:flex-row">
        <div className="flex-1">
          <label className="mb-1.5 block text-sm font-medium">Student</label>
          <Select value={studentId} onValueChange={setStudentId}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {students.map((s) => (
                <SelectItem key={s._id} value={s._id}>
                  {s.name} ({s.rollNo})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1">
          <label className="mb-1.5 block text-sm font-medium">Month</label>
          <Input type="month" value={month} onChange={(e) => setMonth(e.target.value)} />
        </div>
      </div>

      {data && (
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-lg border border-border bg-card p-4 text-center">
            <p className="text-2xl font-semibold text-success">{data.present}</p>
            <p className="text-xs text-muted-foreground">Days present</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-4 text-center">
            <p className="text-2xl font-semibold text-navy-700">{data.total}</p>
            <p className="text-xs text-muted-foreground">Total marked days</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-4 text-center">
            <p className="text-2xl font-semibold text-saffron-600">{data.percentage}%</p>
            <p className="text-xs text-muted-foreground">Attendance</p>
          </div>
        </div>
      )}

      <div className="rounded-lg border border-border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-muted-foreground">
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Remarks</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-muted-foreground">
                  Loading...
                </td>
              </tr>
            ) : !data || data.records.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-muted-foreground">
                  No attendance records for this month.
                </td>
              </tr>
            ) : (
              data.records.map((r, i) => (
                <tr key={i} className="border-b border-border last:border-0">
                  <td className="px-4 py-2.5">{formatDate(r.date)}</td>
                  <td className="px-4 py-2.5 capitalize">{r.status.replace("_", " ")}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">{r.remarks || "—"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
