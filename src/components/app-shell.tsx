"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

import { ChatWidget } from "@/components/store/chat-widget";

export function AppShell({ children }: { children: React.ReactNode }) {
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
      {!isAdminRoute ? <ChatWidget /> : null}
    </>
  );
}
