"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { Save, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { CLASS_OPTIONS } from "@/lib/utils";
import type { StudentDTO } from "@/types";

type StatusMap = Record<string, "present" | "absent" | "late">;
type RemarksMap = Record<string, string>;

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export default function AttendanceManager({ allStudents }: { allStudents: StudentDTO[] }) {
  const [studentClass, setStudentClass] = useState(allStudents[0]?.class || CLASS_OPTIONS[0]);
  const [date, setDate] = useState(todayISO());
  const [status, setStatus] = useState<StatusMap>({});
  const [remarks, setRemarks] = useState<RemarksMap>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const classStudents = allStudents.filter((s) => s.class === studentClass);

  const loadAttendance = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/attendance?date=${date}&class=${encodeURIComponent(studentClass)}`
      );

      if (!res.ok) {
        const errBody = await res.json().catch(() => null);
        throw new Error(errBody?.error || `Server error ${res.status}`);
      }

      const data = await res.json();

      const initialStatus: StatusMap = {};
      const initialRemarks: RemarksMap = {};
      classStudents.forEach((s) => {
        initialStatus[s._id] = "present";
        initialRemarks[s._id] = "";
      });

      if (data?.records) {
        data.records.forEach(
          (r: { studentId: string; status: "present" | "absent" | "late"; remarks?: string }) => {
            initialStatus[r.studentId] = r.status;
            initialRemarks[r.studentId] = r.remarks || "";
          }
        );
      }

      setStatus(initialStatus);
      setRemarks(initialRemarks);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load attendance.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date, studentClass]);

  useEffect(() => {
    loadAttendance();
  }, [loadAttendance]);

  const presentCount = Object.values(status).filter((s) => s === "present").length;
  const absentCount = Object.values(status).filter((s) => s === "absent").length;
  const total = classStudents.length;
  const percentage = total > 0 ? Math.round((presentCount / total) * 100) : 0;

  function toggleStatus(studentId: string, newStatus: "present" | "absent") {
    setStatus((s) => ({ ...s, [studentId]: newStatus }));
  }

  async function handleSave() {
    setSaving(true);
    try {
      const records = classStudents.map((s) => ({
        studentId: s._id,
        status: status[s._id] || "present",
        remarks: remarks[s._id] || "",
      }));

      const res = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, class: studentClass, records }),
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => null);
        throw new Error(errBody?.error || "Failed to save");
      }
      toast.success("Attendance saved successfully.");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to save attendance.";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row">
          <div className="flex-1">
            <label className="mb-1.5 block text-sm font-medium">Select class</label>
            <Select value={studentClass} onValueChange={setStudentClass}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CLASS_OPTIONS.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1">
            <label className="mb-1.5 block text-sm font-medium">Select date</label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} max={todayISO()} />
          </div>
        </div>
        <Button onClick={handleSave} disabled={saving || loading || total === 0}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save attendance
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <SummaryCard icon={CheckCircle2} iconClass="bg-success/10 text-success" label="Present" value={presentCount} />
        <SummaryCard icon={XCircle} iconClass="bg-destructive/10 text-destructive" label="Absent" value={absentCount} />
        <SummaryCard label="Total students" value={total} />
        <SummaryCard label="Attendance %" value={`${percentage}%`} iconClass="bg-saffron-100 text-saffron-700" />
      </div>

      <div className="rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Roll No.</TableHead>
              <TableHead>Student name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Remarks (optional)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="py-10 text-center text-muted-foreground">
                  Loading attendance...
                </TableCell>
              </TableRow>
            ) : classStudents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="py-10 text-center text-muted-foreground">
                  No students found in this class.
                </TableCell>
              </TableRow>
            ) : (
              classStudents.map((s) => (
                <TableRow key={s._id}>
                  <TableCell className="font-medium">{s.rollNo}</TableCell>
                  <TableCell>{s.name}</TableCell>
                  <TableCell>
                    <Select value={status[s._id] || "present"} onValueChange={(v) => toggleStatus(s._id, v as "present" | "absent")}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="present">Present</SelectItem>
                        <SelectItem value="absent">Absent</SelectItem>
                        <SelectItem value="late">Late</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Input
                      placeholder="-"
                      value={remarks[s._id] || ""}
                      onChange={(e) => setRemarks((r) => ({ ...r, [s._id]: e.target.value }))}
                      className="max-w-xs"
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function SummaryCard({
  icon: Icon,
  iconClass,
  label,
  value,
}: {
  icon?: React.ElementType;
  iconClass?: string;
  label: string;
  value: string | number;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-4">
      {Icon && (
        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${iconClass}`}>
          <Icon className="h-5 w-5" />
        </span>
      )}
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-xl font-semibold text-navy-700">{value}</p>
      </div>
    </div>
  );
}
