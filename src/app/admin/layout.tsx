import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { requireAdmin } from "@/lib/auth";

export default async function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await requireAdmin();

  return (
    <section className="h-screen overflow-hidden bg-[#eef2f6]">
      <div className="grid h-full lg:grid-cols-[220px_minmax(0,1fr)]">
        <AdminSidebar session={session} />
        <div className="min-w-0 bg-white">
          <div className="h-screen overflow-y-auto overflow-x-auto px-4 py-4 sm:px-6 lg:px-8 lg:py-6">
            <div className="pb-10">{children}</div>
          </div>
        </div>
      </div>
    </section>
  );
}
