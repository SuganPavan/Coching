"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge, type BadgeProps } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { formatDate } from "@/lib/utils";
import type { EnquiryDTO } from "@/types";

const STATUS_VARIANT: Record<string, BadgeProps["variant"]> = {
  new: "default",
  contacted: "warning",
  enrolled: "success",
  closed: "outline",
};

export default function EnquiryManager({ enquiries }: { enquiries: EnquiryDTO[] }) {
  const router = useRouter();
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  async function updateStatus(id: string, status: string) {
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/enquiries/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error();
      toast.success("Status updated.");
      router.refresh();
    } catch {
      toast.error("Failed to update status.");
    } finally {
      setUpdatingId(null);
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete enquiry from ${name}?`)) return;
    try {
      const res = await fetch(`/api/enquiries/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("Enquiry deleted.");
      router.refresh();
    } catch {
      toast.error("Failed to delete enquiry.");
    }
  }

  return (
    <div className="rounded-lg border border-border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Class</TableHead>
            <TableHead>Message</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {enquiries.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="py-10 text-center text-muted-foreground">
                No enquiries yet.
              </TableCell>
            </TableRow>
          ) : (
            enquiries.map((e) => (
              <TableRow key={e._id}>
                <TableCell className="font-medium">{e.name}</TableCell>
                <TableCell className="text-muted-foreground">{e.phone}</TableCell>
                <TableCell className="text-muted-foreground">{e.class}</TableCell>
                <TableCell className="max-w-xs truncate text-muted-foreground">{e.message || "—"}</TableCell>
                <TableCell className="text-muted-foreground">{formatDate(e.createdAt)}</TableCell>
                <TableCell>
                  <Select value={e.status} onValueChange={(v) => updateStatus(e._id, v)} disabled={updatingId === e._id}>
                    <SelectTrigger className="w-36">
                      <SelectValue>
                        <Badge variant={STATUS_VARIANT[e.status]} className="capitalize">
                          {e.status}
                        </Badge>
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="contacted">Contacted</SelectItem>
                      <SelectItem value="enrolled">Enrolled</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(e._id, e.name)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
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
