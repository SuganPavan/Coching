import Sidebar from "@/components/admin/Sidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-secondary/30">
      <Sidebar />
      <div className="flex-1 overflow-x-hidden">{children}</div>
    </div>
  );
}
