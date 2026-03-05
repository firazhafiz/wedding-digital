import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AdminShell from "@/components/admin/AdminShell";
import { COOKIE_NAME } from "@/lib/admin/context";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  // Check for active event cookie (except if already on events page)
  // Note: We can't easily check the URL in server layout without some tricks,
  // but we can pass a prop or handle it in the Shell.
  // Actually, we'll let the Shell handle the context display.

  return <AdminShell>{children}</AdminShell>;
}
