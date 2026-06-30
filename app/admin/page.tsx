import { redirect } from "next/navigation";

// Visiting /admin with no sub-path should land on the dashboard,
// not a 404. Middleware already ensures the user is authenticated
// before this page is reached.
export default function AdminRootPage() {
  redirect("/admin/dashboard");
}
