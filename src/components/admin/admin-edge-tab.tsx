"use client";

import Link from "next/link";
import { LayoutDashboard } from "lucide-react";

export function AdminEdgeTab() {
  return (
    <div className="fixed right-0 top-1/2 z-[85] -translate-y-1/2">
      <div className="group relative">
        <Link
          href="/admin"
          className="flex h-28 w-9 items-center justify-center rounded-l-2xl border border-r-0 border-stone-900/20 bg-stone-950 text-white shadow-[0_10px_30px_rgba(28,25,23,0.18)] transition hover:w-11 hover:bg-stone-800"
          aria-label="Ir al panel admin"
        >
          <LayoutDashboard className="h-4 w-4" />
        </Link>
        <div className="pointer-events-none absolute right-12 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-full bg-stone-900 px-3 py-1 text-xs text-white opacity-0 transition group-hover:opacity-100">
          Panel admin
        </div>
      </div>
    </div>
  );
}
