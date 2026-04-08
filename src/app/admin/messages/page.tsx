import { AdminMessagesPage } from "@/components/admin/admin-messages-page";
import { requireAdmin } from "@/lib/auth";

export default async function MessagesAdminPage() {
  const session = await requireAdmin();

  return <AdminMessagesPage adminName={session.name} />;
}
