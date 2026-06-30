"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Search, Pencil, Trash2, Eye, Filter,
  ChevronUp, ChevronDown, ChevronsUpDown, Users
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { cn, formatCurrency, CLASS_OPTIONS } from "@/lib/utils";
import type { StudentDTO } from "@/types";

type SortKey = "rollNo" | "name" | "class" | "pendingFee" | "createdAt";
type SortDir = "asc" | "desc";

function getInitials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

function AvatarInitials({ name, className }: { name: string; className?: string }) {
  const colors = [
    "bg-navy-100 text-navy-700",
    "bg-violet-100 text-violet-700",
    "bg-emerald-100 text-emerald-700",
    "bg-saffron-100 text-saffron-700",
    "bg-rose-100 text-rose-700",
  ];
  const idx = name.charCodeAt(0) % colors.length;
  return (
    <span className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold", colors[idx], className)}>
      {getInitials(name)}
    </span>
  );
}

function FeeBar({ paid, total }: { paid: number; total: number }) {
  const pct = total > 0 ? Math.min(Math.round((paid / total) * 100), 100) : 0;
  const color = pct === 100 ? "bg-success" : pct >= 50 ? "bg-saffron-500" : "bg-destructive";
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-border">
        <div className={cn("h-full rounded-full transition-all", color)} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-muted-foreground">{pct}%</span>
    </div>
  );
}

function SortButton({ label, sortKey, current, dir, onSort }: {
  label: string; sortKey: SortKey; current: SortKey; dir: SortDir;
  onSort: (k: SortKey) => void;
}) {
  const active = current === sortKey;
  return (
    <button
      onClick={() => onSort(sortKey)}
      className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground"
    >
      {label}
      {active ? (
        dir === "asc" ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
      ) : (
        <ChevronsUpDown className="h-3 w-3 opacity-40" />
      )}
    </button>
  );
}

export default function StudentTable({ students }: { students: StudentDTO[] }) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState("all");
  const [feeFilter, setFeeFilter] = useState("all");
  const [sortKey, setSortKey] = useState<SortKey>("createdAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  function handleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
  }

  const filtered = useMemo(() => {
    let list = students.filter((s) => {
      const matchSearch =
        !search ||
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.rollNo.includes(search) ||
        s.phone.includes(search);
      const matchClass = classFilter === "all" || s.class === classFilter;
      const matchFee =
        feeFilter === "all" ||
        (feeFilter === "pending" && s.pendingFee > 0) ||
        (feeFilter === "paid" && s.pendingFee === 0);
      return matchSearch && matchClass && matchFee;
    });

    list = [...list].sort((a, b) => {
      let av: string | number = "";
      let bv: string | number = "";

      if (sortKey === "createdAt") {
        // createdAt arrives as an ISO string after JSON serialisation
        av = new Date(a.createdAt ?? 0).getTime();
        bv = new Date(b.createdAt ?? 0).getTime();
      } else if (sortKey === "pendingFee") {
        av = a.pendingFee ?? 0;
        bv = b.pendingFee ?? 0;
      } else {
        av = (a[sortKey] as string) ?? "";
        bv = (b[sortKey] as string) ?? "";
      }

      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

    return list;
  }, [students, search, classFilter, feeFilter, sortKey, sortDir]);

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Remove ${name} from active students? Their records will be preserved.`)) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/students/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success(`${name} removed successfully.`);
      router.refresh();
    } catch {
      toast.error("Failed to remove student.");
    } finally {
      setDeletingId(null);
    }
  }

  const pendingCount = students.filter((s) => s.pendingFee > 0).length;
  const paidCount = students.length - pendingCount;

  return (
    <div className="rounded-xl border border-border bg-card shadow-sm">
      {/* Summary strip */}
      <div className="flex flex-wrap items-center gap-4 border-b border-border px-5 py-3">
        <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Users className="h-3.5 w-3.5" />
          <span className="font-medium text-foreground">{students.length}</span> total
        </span>
        <span className="h-4 w-px bg-border" />
        <span className="text-sm text-muted-foreground">
          <span className="font-medium text-success">{paidCount}</span> fully paid
        </span>
        <span className="h-4 w-px bg-border" />
        <span className="text-sm text-muted-foreground">
          <span className="font-medium text-destructive">{pendingCount}</span> pending fees
        </span>
        {filtered.length !== students.length && (
          <>
            <span className="h-4 w-px bg-border" />
            <span className="text-sm text-muted-foreground">
              showing <span className="font-medium text-foreground">{filtered.length}</span>
            </span>
          </>
        )}
      </div>

      {/* Search + filters */}
      <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search name, roll no, or phone…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              ✕
            </button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 shrink-0 text-muted-foreground" />
          <Select value={classFilter} onValueChange={setClassFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All classes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All classes</SelectItem>
              {CLASS_OPTIONS.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={feeFilter} onValueChange={setFeeFilter}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="All fees" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All fees</SelectItem>
              <SelectItem value="pending">Pending only</SelectItem>
              <SelectItem value="paid">Paid only</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-secondary/40">
              <th className="px-4 py-3 text-left">
                <SortButton label="Roll No" sortKey="rollNo" current={sortKey} dir={sortDir} onSort={handleSort} />
              </th>
              <th className="px-4 py-3 text-left">
                <SortButton label="Student" sortKey="name" current={sortKey} dir={sortDir} onSort={handleSort} />
              </th>
              <th className="px-4 py-3 text-left">
                <SortButton label="Class" sortKey="class" current={sortKey} dir={sortDir} onSort={handleSort} />
              </th>
              <th className="px-4 py-3 text-left">Subjects</th>
              <th className="px-4 py-3 text-left">
                <SortButton label="Fee status" sortKey="pendingFee" current={sortKey} dir={sortDir} onSort={handleSort} />
              </th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-16 text-center">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Users className="h-8 w-8 opacity-30" />
                    <p className="text-sm font-medium">No students found</p>
                    <p className="text-xs">Try adjusting your search or filters</p>
                  </div>
                </td>
              </tr>
            ) : (
              filtered.map((s) => (
                <tr
                  key={s._id}
                  className="group transition-colors hover:bg-secondary/40"
                >
                  <td className="px-4 py-3 font-mono text-sm font-medium text-navy-700">
                    #{s.rollNo}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <AvatarInitials name={s.name} />
                      <div className="min-w-0">
                        <p className="font-medium leading-tight">{s.name}</p>
                        <p className="mt-0.5 truncate text-xs text-muted-foreground">{s.phone}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="secondary" className="whitespace-nowrap">
                      {s.class}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {s.subjects.slice(0, 2).map((sub) => (
                        <span key={sub} className="rounded bg-secondary px-1.5 py-0.5 text-xs text-muted-foreground">
                          {sub}
                        </span>
                      ))}
                      {s.subjects.length > 2 && (
                        <span className="rounded bg-secondary px-1.5 py-0.5 text-xs text-muted-foreground">
                          +{s.subjects.length - 2}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="space-y-1">
                      {s.pendingFee > 0 ? (
                        <>
                          <Badge variant="warning" className="text-xs">
                            {formatCurrency(s.pendingFee)} due
                          </Badge>
                          <FeeBar paid={s.feesPaid} total={s.totalFee} />
                        </>
                      ) : (
                        <Badge variant="success">Fully paid</Badge>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Button asChild variant="ghost" size="icon" title="View fee history">
                        <Link href={`/admin/fees/${s._id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button asChild variant="ghost" size="icon" title="Edit student">
                        <Link href={`/admin/students/${s._id}`}>
                          <Pencil className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Remove student"
                        onClick={() => handleDelete(s._id, s.name)}
                        disabled={deletingId === s._id}
                        className="hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {filtered.length > 0 && (
        <div className="border-t border-border px-5 py-3 text-xs text-muted-foreground">
          {filtered.length} student{filtered.length !== 1 ? "s" : ""} listed
        </div>
      )}
    </div>
  );
}
