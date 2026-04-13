"use client";

import { useEffect, useState } from "react";

export function SiteHeaderShell({ children }: { children: React.ReactNode }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 12);
    }

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-[60] transition-all duration-300 ${
          scrolled
            ? "bg-white/84 shadow-sm backdrop-blur-xl"
            : "bg-transparent"
        }`}
      >
        {children}
      </header>
      <div className="h-[88px]" aria-hidden="true" />
    </>
  );
}
