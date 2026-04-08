"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

import { AdminEdgeTab } from "@/components/admin/admin-edge-tab";
import { ChatWidget } from "@/components/store/chat-widget";

export function AppShell({
  children,
  isAdmin,
}: {
  children: React.ReactNode;
  isAdmin: boolean;
}) {
  const pathname = usePathname();
  const isAdminRoute = pathname.startsWith("/admin");

  useEffect(() => {
    document.body.classList.toggle("admin-route", isAdminRoute);

    return () => {
      document.body.classList.remove("admin-route");
    };
  }, [isAdminRoute]);

  return (
    <>
      {children}
      {!isAdminRoute && isAdmin ? <AdminEdgeTab /> : null}
      {!isAdminRoute ? <ChatWidget /> : null}
    </>
  );
}
