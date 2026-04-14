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
        data-scrolled={scrolled ? "true" : "false"}
        className={`fixed inset-x-0 top-0 z-[60] transition-all duration-300 ${
          scrolled
            ? "bg-white/20 backdrop-blur-xl"
            : "bg-transparent"
        }`}
      >
        {children}
      </header>
      <div className="h-[104px] lg:h-[72px]" aria-hidden="true" />
    </>
  );
}
